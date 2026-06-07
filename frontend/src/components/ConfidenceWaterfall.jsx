import { useState } from 'react'

export default function ConfidenceWaterfall({ chunkTimeline, selectedChunkIdx, onChunkClick }) {
  const [hovered, setHovered] = useState(null)
  if (!chunkTimeline?.length) return null

  const SVG_W = 900, SVG_H = 200
  const PAD = { top: 20, right: 52, bottom: 40, left: 48 }
  const chartW = SVG_W - PAD.left - PAD.right
  const chartH = SVG_H - PAD.top - PAD.bottom
  const N = chunkTimeline.length
  const spacing = chartW / N
  const barW = Math.max(2, spacing * 0.72)

  const yScale = (pct) => PAD.top + chartH * (1 - pct / 100)
  const barColor = (s) => s < 30 ? '#10b981' : s < 90 ? '#f59e0b' : '#f43f5e'
  const glowColor = (s) => s < 30 ? 'rgba(16,185,129,0.45)' : s < 90 ? 'rgba(245,158,11,0.45)' : 'rgba(244,63,94,0.55)'

  const tickIndices = N <= 6
    ? chunkTimeline.map((_, i) => i)
    : [0, Math.floor(N * 0.25), Math.floor(N * 0.5), Math.floor(N * 0.75), N - 1]

  return (
    <div className="panel-block waterfall-panel">
      <div className="panel-label">
        <span className="panel-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></span>
        <span>Confidence Waterfall</span>
        <span className="panel-note">AI probability per segment · {N} chunks · click to play</span>
      </div>
      <div className="waterfall-svg-wrap">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="waterfall-svg" onMouseLeave={() => setHovered(null)}>
          {[0, 30, 60, 90, 100].map(pct => {
            const y = yScale(pct)
            const isThresh = pct === 30 || pct === 90
            return (
              <g key={pct}>
                <line x1={PAD.left} x2={SVG_W - PAD.right} y1={y} y2={y}
                  stroke={isThresh ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}
                  strokeDasharray={isThresh ? '5 5' : undefined}
                  strokeWidth={isThresh ? 1.5 : 1} />
                <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="10"
                  fontFamily="Inter, sans-serif"
                  fill={pct === 30 ? '#34d399' : pct === 90 ? '#fb7185' : '#334155'}>
                  {pct}%
                </text>
              </g>
            )
          })}
          <text x={SVG_W - PAD.right + 6} y={yScale(15) + 4} fontSize="9" fontFamily="Inter, sans-serif" fill="#34d39988">Human</text>
          <text x={SVG_W - PAD.right + 6} y={yScale(95) + 4} fontSize="9" fontFamily="Inter, sans-serif" fill="#fb718588">AI</text>
          <text x={14} y={PAD.top + chartH / 2} textAnchor="middle" fontSize="9"
            fontFamily="Inter, sans-serif" fill="#475569"
            transform={`rotate(-90, 14, ${PAD.top + chartH / 2})`}>AI PROB %</text>

          {chunkTimeline.map((chunk, i) => {
            const x = PAD.left + i * spacing + (spacing - barW) / 2
            const barH = Math.max(2, chartH * (chunk.score / 100))
            const y = PAD.top + chartH - barH
            const isHov = hovered === i, isSel = selectedChunkIdx === i
            const color = barColor(chunk.score)
            return (
              <g key={i} style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onChunkClick?.(chunk, i)}>
                <rect
                  x={PAD.left + i * spacing} y={PAD.top}
                  width={spacing} height={chartH}
                  fill="transparent"
                />
                {(isHov || isSel) && (
                  <rect x={x - 2} y={PAD.top} width={barW + 4} height={chartH}
                    fill="rgba(255,255,255,0.04)" rx="3" />
                )}
                <rect x={x} y={y} width={barW} height={barH} fill={color} rx="2"
                  className="waterfall-bar"
                  style={{
                    animationDelay: `${i * 0.015}s`,
                    filter: (isHov || isSel) ? `drop-shadow(0 0 6px ${glowColor(chunk.score)})` : undefined,
                  }} />
                {isSel && (
                  <rect x={x - 1} y={PAD.top} width={barW + 2} height={chartH}
                    fill="none" stroke="rgba(167,139,250,0.8)" strokeWidth="1.5" rx="3" />
                )}
              </g>
            )
          })}

          {hovered !== null && chunkTimeline[hovered] && (() => {
            const i = hovered
            const chunk = chunkTimeline[i]
            const x = PAD.left + i * spacing + (spacing - barW) / 2
            const barH = Math.max(2, chartH * (chunk.score / 100))
            const y = PAD.top + chartH - barH
            const color = barColor(chunk.score)
            
            const ttX = Math.min(x - 20, SVG_W - PAD.right - 78)
            const TT_H = 44
            const rawTtY = y - 52
            const ttY = rawTtY < PAD.top + 2 ? PAD.top + 2 : rawTtY
            
            return (
              <g style={{ pointerEvents: 'none' }}>
                <rect x={ttX} y={ttY} width={76} height={TT_H} rx="8"
                  fill="rgba(10,13,22,0.96)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                <text x={ttX + 38} y={ttY + 19} textAnchor="middle" fontSize="12"
                  fontWeight="700" fontFamily="Inter, sans-serif" fill={color}>
                  {chunk.score.toFixed(1)}%
                </text>
                <text x={ttX + 38} y={ttY + 36} textAnchor="middle" fontSize="9"
                  fontFamily="Inter, sans-serif" fill="#64748b">
                  {chunk.start_sec.toFixed(1)}–{chunk.end_sec.toFixed(1)}s
                </text>
              </g>
            )
          })()}

          {tickIndices.map(i => {
            const chunk = chunkTimeline[i]
            if (!chunk) return null
            return (
              <text key={i} x={PAD.left + i * spacing + spacing / 2} y={SVG_H - 8}
                textAnchor="middle" fontSize="10" fontFamily="Inter, sans-serif" fill="#475569">
                {chunk.start_sec.toFixed(0)}s
              </text>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
