import { useState, useCallback, useRef, useEffect } from 'react'

export default function ChunkPlayer({ chunk, audioFile, apiBaseUrl, mode, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState('')
  const audioCtxRef = useRef(null)
  const sourceRef = useRef(null)
  const audioElRef = useRef(null)

  const stop = useCallback(() => {
    try { sourceRef.current?.stop() } catch { }
    sourceRef.current = null
    if (audioElRef.current) { audioElRef.current.pause(); audioElRef.current.src = ''; audioElRef.current = null }
    setIsPlaying(false)
  }, [])

  useEffect(() => () => stop(), [stop])
  useEffect(() => { stop(); setError('') }, [chunk?.start_sec, chunk?.end_sec, stop])

  const play = useCallback(async () => {
    stop(); setError(''); setIsPlaying(true)
    try {
      if (mode === 'upload' && audioFile) {
        const ctx = audioCtxRef.current || new AudioContext()
        if (ctx.state === 'suspended') await ctx.resume()
        audioCtxRef.current = ctx
        const audioBuf = await ctx.decodeAudioData(await audioFile.arrayBuffer())
        const src = ctx.createBufferSource()
        src.buffer = audioBuf
        src.connect(ctx.destination)
        sourceRef.current = src
        src.onended = () => setIsPlaying(false)
        src.start(0, chunk.start_sec, chunk.end_sec - chunk.start_sec)
      } else {
        const resp = await fetch(`${apiBaseUrl}/audio/segment/?start=${chunk.start_sec}&end=${chunk.end_sec}`)
        if (!resp.ok) throw new Error('Failed to fetch segment from server.')
        const objUrl = URL.createObjectURL(await resp.blob())
        const audio = new Audio(objUrl)
        audioElRef.current = audio
        audio.onended = () => { setIsPlaying(false); URL.revokeObjectURL(objUrl) }
        audio.onerror = () => { setIsPlaying(false); setError('Playback failed.') }
        audio.play()
      }
    } catch (err) { setError(err.message || 'Playback failed.'); setIsPlaying(false) }
  }, [chunk, audioFile, apiBaseUrl, mode, stop])

  const scoreColor = chunk.score >= 90 ? '#fb7185' : chunk.score >= 30 ? '#fbbf24' : '#34d399'

  return (
    <div className="chunk-player">
      <div className="cp-header">
        <span className="cp-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg></span>
        <span className="cp-title">Segment Player</span>
        <div className="cp-badges">
          <span className="cp-badge cp-badge--time">{chunk.start_sec.toFixed(2)}s – {chunk.end_sec.toFixed(2)}s</span>
          <span className="cp-badge" style={{ color: scoreColor, borderColor: `${scoreColor}50`, background: `${scoreColor}15` }}>
            {chunk.score.toFixed(1)}% AI
          </span>
        </div>
        <button className="cp-close" onClick={onClose} aria-label="Close player">✕</button>
      </div>
      <div className="cp-controls">
        <button className={`cp-play-btn${isPlaying ? ' cp-play-btn--stop' : ''}`} onClick={isPlaying ? stop : play}>
          {isPlaying ? '⏹ Stop' : '▶ Play Segment'}
        </button>
        {isPlaying && (
          <span className="cp-playing-indicator" aria-label="Playing">
            <span className="cp-wave" /><span className="cp-wave" /><span className="cp-wave" /><span className="cp-wave" />
          </span>
        )}
        {error && <span className="cp-error">{error}</span>}
      </div>
    </div>
  )
}
