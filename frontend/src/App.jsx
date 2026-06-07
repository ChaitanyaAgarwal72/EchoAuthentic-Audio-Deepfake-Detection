import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import './App.css'
import LiveMicDetection from './LiveMicDetection'

import ConfidenceGauge from './components/ConfidenceGauge'
import AudioPlayer from './components/AudioPlayer'
import SpectrogramPanel from './components/SpectrogramPanel'
import DurationWarning from './components/DurationWarning'
import FrequencyHeatmap from './components/FrequencyHeatmap'
import ConfidenceWaterfall from './components/ConfidenceWaterfall'
import ChunkPlayer from './components/ChunkPlayer'
import SegmentTimeline from './components/SegmentTimeline'
import DisclaimerCallout from './components/DisclaimerCallout'
import ProgressStepper from './components/ProgressStepper'
import SkeletonLoader from './components/SkeletonLoader'

function App() {
  const [mode, setMode] = useState('youtube')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [audioFile, setAudioFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLiveMicActive, setIsLiveMicActive] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(null)
  const [selectedChunk, setSelectedChunk] = useState(null)
  const [selectedChunkIdx, setSelectedChunkIdx] = useState(null)
  const [pendingTab, setPendingTab] = useState(null)
  const audioFileRef = useRef(null)
  const abortControllerRef = useRef(null)

  const apiBaseUrl = useMemo(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', [])
  const isDeployed = useMemo(() => {
    return window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  }, [])

  const predictionLabel = result?.prediction || result?.binary_prediction
  const isAi = predictionLabel === 'AI-Generated'
  const isHuman = predictionLabel === 'Human Voice'
  const bannerVariant = isAi ? 'ai' : isHuman ? 'human' : 'uncertain'

  const handleModeChange = (next) => {
    if (next === mode) return
    if (isSubmitting || isLiveMicActive) {
      setPendingTab(next)
      return
    }
    executeModeChange(next)
  }

  const executeModeChange = (next) => {
    setMode(next); setResult(null); setError(''); setProgress(null)
    setSelectedChunk(null); setSelectedChunkIdx(null)
    setYoutubeUrl(''); setAudioFile(null); audioFileRef.current = null
  }

  const confirmCancelAnalysis = () => {
    if (isSubmitting && abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsSubmitting(false)
    setIsLiveMicActive(false)
    executeModeChange(pendingTab)
    setPendingTab(null)
  }

  const abortCancelAnalysis = () => {
    setPendingTab(null)
  }

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null
    setAudioFile(f); audioFileRef.current = f
  }

  const handleChunkClick = useCallback((chunk, idx) => {
    if (selectedChunkIdx === idx) { setSelectedChunk(null); setSelectedChunkIdx(null) }
    else { setSelectedChunk(chunk); setSelectedChunkIdx(idx) }
  }, [selectedChunkIdx])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setResult(null); setProgress(null)
    setSelectedChunk(null); setSelectedChunkIdx(null)

    try {
      setIsSubmitting(true)
      abortControllerRef.current = new AbortController()
      if (mode === 'youtube') {
        if (!youtubeUrl.trim()) throw new Error('Please paste a YouTube link first.')
        const response = await fetch(`${apiBaseUrl}/predict/youtube/stream/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: youtubeUrl.trim() }),
          signal: abortControllerRef.current.signal
        })
        if (!response.ok) { const d = await response.json().catch(() => ({})); throw new Error(d?.detail || 'Request failed.') }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = '', processingError = null

        outer: while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n'); buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            let evt; try { evt = JSON.parse(line.slice(6)) } catch { continue }
            if (evt.stage === 'error') { processingError = evt.message || 'Processing failed.'; reader.cancel(); break outer }
            else if (evt.stage === 'done') { setResult(evt.result); setProgress(null); break outer }
            else { setProgress(evt) }
          }
        }
        if (processingError) throw new Error(processingError)

      } else {
        if (!audioFile) throw new Error('Please choose an audio file first.')
        const fd = new FormData(); fd.append('file', audioFile)
        const response = await fetch(`${apiBaseUrl}/predict/`, { 
          method: 'POST', 
          body: fd,
          signal: abortControllerRef.current.signal 
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.detail || 'Prediction failed.')
        setResult(data)
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Something went wrong.')
    } finally {
      setIsSubmitting(false); setProgress(null)
    }
  }

  const avgScore = result?.average_ai_probability_score ?? 0
  const confidenceBand = result?.confidence_band ?? ''

  return (
    <main className="dashboard-shell">
      <section className="dashboard-card">

        <div className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">EchoAuthentic</span>
            <h1>Audio Deepfake Detection</h1>
            <p>
              Upload any audio or YouTube link – or test live with your microphone. Get an instant AI probability score, an interactive spectrogram heatmap, and a per‑segment playback timeline.
            </p>
          </div>
          
          <div className="hero-visual">
            <div className="hv-waveform">
              {[20, 40, 75, 45, 30, 65, 90, 70, 40, 35, 60, 85, 100, 75, 45, 30, 55, 80, 40, 25].map((h, i) => (
                <div key={i} className="hv-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.06}s` }} />
              ))}
            </div>
          </div>
        </div>

        <form className="predict-form" onSubmit={handleSubmit}>
          <div className="mode-switch" role="tablist" aria-label="Input source">
            <button id="tab-youtube" type="button" role="tab" aria-selected={mode === 'youtube'}
              className={mode === 'youtube' ? 'mode-button active' : 'mode-button'}
              onClick={() => handleModeChange('youtube')}>YouTube</button>
            <button id="tab-upload" type="button" role="tab" aria-selected={mode === 'upload'}
              className={mode === 'upload' ? 'mode-button active' : 'mode-button'}
              onClick={() => handleModeChange('upload')}>Upload</button>
            <button id="tab-live" type="button" role="tab" aria-selected={mode === 'live'}
              className={mode === 'live' ? 'mode-button active' : 'mode-button'}
              onClick={() => handleModeChange('live')}>Live Mic</button>
          </div>

          {mode === 'youtube' ? (
            <div className="youtube-input-group">
              {isDeployed && (
                <div className="cloud-warning" style={{ backgroundColor: '#451a03', color: '#fde047', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', border: '1px solid #713f12', lineHeight: '1.4' }}>
                  <strong>⚠️ Feature Disabled in Live Demo:</strong> YouTube strictly blocks extraction from datacenter IPs like Hugging Face. To use this feature, please clone the repository and run it locally.
                </div>
              )}
              <label className="field" htmlFor="youtube-url">
                <span>YouTube URL</span>
                <input id="youtube-url" type="url" placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} disabled={isDeployed} />
              </label>
            </div>
          ) : mode === 'upload' ? (
            <label className="field" htmlFor="audio-file">
              <span>Supported formats: .wav, .mp3, .flac (max 50MB)</span>
              <input id="audio-file" type="file" accept=".wav,.mp3,.flac,audio/*" onChange={handleFileChange} />
            </label>
          ) : null}

          {mode !== 'live' && (
            <button id="predict-btn" type="submit" className="predict-button" disabled={isSubmitting || (mode === 'youtube' && isDeployed)}>
              {isSubmitting ? <span className="btn-inner"><span className="spinner" aria-hidden="true" />Analysing…</span> : 'Run Detection'}
            </button>
          )}
        </form>

        {mode === 'live' && <LiveMicDetection onActiveChange={setIsLiveMicActive} />}

        <div className={`error-box ${mode !== 'live' && error ? 'show' : ''}`} role="alert" aria-hidden={!(mode !== 'live' && error)}>
          {error}
        </div>

        {isSubmitting && mode === 'youtube' && <ProgressStepper progress={progress} />}
        {isSubmitting && mode !== 'youtube' && <SkeletonLoader />}

        {result && !isSubmitting && (
          <section className="results-area" aria-live="polite" aria-label="Detection results">

            <div className={`prediction-banner prediction-banner--${bannerVariant}`}>
              <span className="pred-icon" aria-hidden="true">
                {isAi ? <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="16" y1="16" x2="16.01" y2="16"/></svg> : isHuman ? <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg> : <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
              </span>
              <div className="pred-text">
                <div className="pred-label">Prediction</div>
                <div className="pred-value">{predictionLabel}</div>
                {result.filename && (
                  <div className="pred-file" title={result.filename}>
                    <span className="pred-file-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span>
                    <span className="pred-file-name">{result.filename}</span>
                  </div>
                )}
              </div>
            </div>

            <DurationWarning message={result.duration_warning} />

            <div className="gauge-stats-row">
              <ConfidenceGauge score={avgScore} confidenceBand={confidenceBand} />
              <div className="stats-grid">
                <div className="stat-card">
                  <span>AI Probability Score</span>
                  <strong style={{ color: avgScore < 30 ? '#34d399' : avgScore < 90 ? '#fbbf24' : '#fb7185' }}>
                    {avgScore.toFixed(2)}%
                  </strong>
                </div>
                <div className="stat-card">
                  <span>AI Chunk Ratio</span>
                  <strong style={{ color: (result.chunk_high_score_ratio ?? 0) < 0.3 ? '#34d399' : (result.chunk_high_score_ratio ?? 0) < 0.66 ? '#fbbf24' : '#fb7185' }}>
                    {result.chunk_high_score_ratio != null ? `${Math.round(result.chunk_high_score_ratio * 100)}%` : '—'}
                  </strong>
                </div>
                <div className="stat-card">
                  <span>Chunks Analysed</span>
                  <strong>{result.chunk_count}</strong>
                </div>
                <div className="stat-card">
                  <span>High-Conf AI Chunks</span>
                  <strong>
                    {result.chunk_timeline ? `${result.chunk_timeline.filter(c => c.score >= 90).length} / ${result.chunk_count}` : '—'}
                  </strong>
                </div>
                {result.vad_summary?.vad_note && (
                  <div className="stat-card stat-card--wide">
                    <span>Voice Activity Detection</span>
                    <strong>{result.vad_summary.vad_note}</strong>
                  </div>
                )}
              </div>
            </div>

            <ConfidenceWaterfall
              chunkTimeline={result.chunk_timeline}
              selectedChunkIdx={selectedChunkIdx}
              onChunkClick={handleChunkClick}
            />

            <FrequencyHeatmap
              profiles={result.chunk_mel_profiles}
              chunkTimeline={result.chunk_timeline}
              selectedChunkIdx={selectedChunkIdx}
              onChunkClick={handleChunkClick}
            />

            <SegmentTimeline
              timeline={result.chunk_timeline}
              onChunkClick={handleChunkClick}
              selectedChunkIdx={selectedChunkIdx}
            />

            {selectedChunk && (
              <ChunkPlayer
                chunk={selectedChunk}
                audioFile={audioFileRef.current}
                apiBaseUrl={apiBaseUrl}
                mode={mode}
                onClose={() => { setSelectedChunk(null); setSelectedChunkIdx(null) }}
              />
            )}

            {mode === 'upload' && <AudioPlayer file={audioFileRef.current} />}

            <SpectrogramPanel spectrogramB64={result.spectrogram_b64} />

            <DisclaimerCallout />
          </section>
        )}
      </section>
      {pendingTab && (
        <div className="custom-modal-backdrop" onClick={abortCancelAnalysis}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h4>Analysis in Progress</h4>
            <p>An analysis is currently running. Do you want to cancel it and switch tabs?</p>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={abortCancelAnalysis}>Keep Running</button>
              <button type="button" className="btn-confirm" onClick={confirmCancelAnalysis}>Cancel Analysis</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
