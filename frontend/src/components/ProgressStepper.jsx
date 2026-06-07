const PIPELINE_STAGES = [
  { key: 'downloading', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>, label: 'Download' },
  { key: 'loading', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>, label: 'Load Audio' },
  { key: 'vad', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>, label: 'VAD' },
  { key: 'inference', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>, label: 'AI Analysis' },
  { key: 'spectrogram', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>, label: 'Spectrogram' },
  { key: 'done', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>, label: 'Done' },
]

export default function ProgressStepper({ progress }) {
  if (!progress) return null
  const currentIdx = PIPELINE_STAGES.findIndex(s => s.key === progress.stage)
  return (
    <div className="pipeline-progress">
      <div className="pipeline-steps">
        {PIPELINE_STAGES.map((stage, idx) => {
          const status = idx < currentIdx ? 'done' : idx === currentIdx ? 'active' : 'pending'
          return (
            <div key={stage.key} className={`pipeline-step pipeline-step--${status}`}>
              <div className="pipeline-step-dot">
                {status === 'done' ? <span className="pipeline-step-check">✓</span> : <span className="pipeline-step-icon">{stage.icon}</span>}
                {status === 'active' && <span className="pipeline-step-pulse" />}
              </div>
              <span className="pipeline-step-label">{stage.label}</span>
              {idx < PIPELINE_STAGES.length - 1 && (
                <div className={`pipeline-connector pipeline-connector--${status === 'done' ? 'done' : 'pending'}`} />
              )}
            </div>
          )
        })}
      </div>
      <div className="pipeline-bar-wrap">
        <div className="pipeline-bar-fill" style={{ width: `${progress.pct ?? 0}%` }} />
      </div>
      <p className="pipeline-label">
        <span className="pipeline-spinner" aria-hidden="true" />
        {progress.label}
      </p>
    </div>
  )
}
