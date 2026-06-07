export default function DisclaimerCallout() {
  return (
    <div className="disclaimer-callout">
      <span className="disclaimer-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>
      <div className="disclaimer-body">
        <strong>Model Reliability Notice</strong>
        <p>
          This model was trained on the ASVspoof 2019 dataset and may not detect the newest AI voice generators (e.g., ElevenLabs, Suno). Please use as one of many signals, not as conclusive proof.
        </p>
      </div>
    </div>
  )
}
