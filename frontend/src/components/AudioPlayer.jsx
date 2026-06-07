import { useState, useEffect } from 'react'

export default function AudioPlayer({ file }) {
  const [audioUrl, setAudioUrl] = useState(null)
  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setAudioUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  if (!audioUrl) return null
  return (
    <div className="panel-block audio-player-wrap">
      <div className="panel-label">
        <span className="panel-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3v4zM3 19a2 2 0 0 0 2 2h1v-6H3v4z"/></svg></span>
        <span>Audio Preview</span>
        <span className="panel-note">uploaded file</span>
      </div>
      <audio className="audio-player" src={audioUrl} controls preload="metadata" />
    </div>
  )
}
