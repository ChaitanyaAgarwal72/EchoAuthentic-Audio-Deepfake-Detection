export default function DurationWarning({ message }) {
  if (!message) return null
  return (
    <div className="duration-warning" role="alert">
      <span className="duration-warning-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
      <div className="duration-warning-body">
        <strong>Short Audio Warning</strong>
        <p>{message}</p>
      </div>
    </div>
  )
}
