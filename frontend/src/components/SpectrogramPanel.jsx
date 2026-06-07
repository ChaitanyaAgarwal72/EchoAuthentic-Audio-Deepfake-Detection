export default function SpectrogramPanel({ spectrogramB64 }) {
  if (!spectrogramB64) return null
  return (
    <div className="panel-block spectrogram-panel">
      <div className="panel-label">
        <span className="panel-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg></span>
        <span>Mel Spectrogram</span>
        <span className="panel-note">full audio · capped at 120 s</span>
      </div>
      <div className="spectrogram-img-wrap">
        <img src={`data:image/png;base64,${spectrogramB64}`} alt="Mel spectrogram" className="spectrogram-img" />
      </div>
    </div>
  )
}
