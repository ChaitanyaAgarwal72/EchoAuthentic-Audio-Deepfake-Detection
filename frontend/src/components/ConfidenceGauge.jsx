export default function ConfidenceGauge({ score, confidenceBand }) {
  const R = 78
  const CX = 110
  const CY = 108
  const arcLength = Math.PI * R

  const pct = Math.min(100, Math.max(0, score ?? 0))
  const dashOffset = arcLength * (1 - pct / 100)
  const color = pct < 30 ? '#10b981' : pct < 90 ? '#f59e0b' : '#f43f5e'
  const bandClass = pct < 30 ? 'human' : pct < 90 ? 'uncertain' : 'ai'

  return (
    <div className="confidence-gauge">
      <svg viewBox="0 0 220 145" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="gaugeGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d={`M ${CX - R},${CY} A ${R},${R} 0 0,1 ${CX + R},${CY}`} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" strokeLinecap="round" />
        <path
          d={`M ${CX - R},${CY} A ${R},${R} 0 0,1 ${CX + R},${CY}`}
          fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={arcLength} strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(0.4,0,0.2,1), stroke 0.5s ease', filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
        <text x="110" y="97" textAnchor="middle" fontSize="27" fontWeight="800" fill="#f8fafc" fontFamily="Inter, sans-serif">{pct.toFixed(1)}%</text>
        <text x="110" y="116" textAnchor="middle" fontSize="9" fill="#475569" fontFamily="Inter, sans-serif" letterSpacing="0.14em">AI PROBABILITY</text>
        <text x="26" y={CY + 20} textAnchor="middle" fontSize="8" fill="#334155" fontFamily="Inter, sans-serif">0%</text>
        <text x="194" y={CY + 20} textAnchor="middle" fontSize="8" fill="#334155" fontFamily="Inter, sans-serif">100%</text>
      </svg>
      <div className={`gauge-band gauge-band--${bandClass}`}>{confidenceBand}</div>
    </div>
  )
}
