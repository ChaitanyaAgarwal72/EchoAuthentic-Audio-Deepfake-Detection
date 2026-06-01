import { useMemo, useState } from 'react'
import './App.css'

function App() {
  const [mode, setMode] = useState('youtube')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [audioFile, setAudioFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const apiBaseUrl = useMemo(() => {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  }, [])

  const predictionLabel = result?.prediction || result?.binary_prediction || 'No prediction yet'

  const handleModeChange = (nextMode) => {
    setMode(nextMode)
    setResult(null)
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setResult(null)

    try {
      setIsSubmitting(true)

      let response

      if (mode === 'youtube') {
        if (!youtubeUrl.trim()) {
          throw new Error('Please paste a YouTube link first.')
        }

        response = await fetch(`${apiBaseUrl}/predict/youtube/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: youtubeUrl.trim() }),
        })
      } else {
        if (!audioFile) {
          throw new Error('Please choose an audio file first.')
        }

        const formData = new FormData()
        formData.append('file', audioFile)

        response = await fetch(`${apiBaseUrl}/predict/`, {
          method: 'POST',
          body: formData,
        })
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.detail || 'Prediction failed.')
      }

      setResult(data)
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="dashboard-shell">
      <section className="dashboard-card">
        <div className="hero-copy">
          <span className="eyebrow">EchoAuthentic</span>
          <h1>Audio deepfake prediction dashboard</h1>
          <p>
            Choose a YouTube link or upload a direct audio file, then run the
            detector and review the prediction result.
          </p>
        </div>

        <form className="predict-form" onSubmit={handleSubmit}>
          <div className="mode-switch" role="tablist" aria-label="Input source">
            <button
              type="button"
              className={mode === 'youtube' ? 'mode-button active' : 'mode-button'}
              onClick={() => handleModeChange('youtube')}
            >
              YouTube link
            </button>
            <button
              type="button"
              className={mode === 'upload' ? 'mode-button active' : 'mode-button'}
              onClick={() => handleModeChange('upload')}
            >
              Audio file upload
            </button>
          </div>

          {mode === 'youtube' ? (
            <label className="field">
              <span>YouTube URL</span>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(event) => setYoutubeUrl(event.target.value)}
              />
            </label>
          ) : (
            <label className="field">
              <span>Audio file</span>
              <input
                type="file"
                accept="audio/*"
                onChange={(event) => setAudioFile(event.target.files?.[0] || null)}
              />
              <small>{audioFile ? audioFile.name : 'No file selected yet.'}</small>
            </label>
          )}

          <button type="submit" className="predict-button" disabled={isSubmitting}>
            {isSubmitting ? 'Predicting...' : 'Predict'}
          </button>
        </form>

        {error ? <p className="error-box">{error}</p> : null}

        <section className="result-card" aria-live="polite">
          <div className="result-label">Prediction</div>
          <div className="result-value">{predictionLabel}</div>

          {result ? (
            <div className="result-grid">
              {result.raw_ai_probability !== undefined ? (
                <div>
                  <span>Raw AI probability</span>
                  <strong>{result.raw_ai_probability}</strong>
                </div>
              ) : null}
              {result.ai_probability_score !== undefined ? (
                <div>
                  <span>AI probability score</span>
                  <strong>{result.ai_probability_score}</strong>
                </div>
              ) : null}
              {result.confidence_band ? (
                <div>
                  <span>Confidence band</span>
                  <strong>{result.confidence_band}</strong>
                </div>
              ) : null}
              {result.chunk_count !== undefined ? (
                <div>
                  <span>Chunks analyzed</span>
                  <strong>{result.chunk_count}</strong>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="result-helper">
              Your result will appear here after you run a prediction.
            </p>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
