import { useRef, useState, useCallback, useEffect } from 'react'

const MAGMA_STOPS = [
  [0, 0, 4], [28, 16, 68], [79, 18, 123], [129, 37, 129],
  [181, 54, 122], [229, 80, 100], [251, 136, 97], [252, 253, 191],
]
function magmaColor(t) {
  const clamped = Math.max(0, Math.min(1, t))
  const idx = clamped * (MAGMA_STOPS.length - 1)
  const lo = Math.floor(idx), hi = Math.min(lo + 1, MAGMA_STOPS.length - 1)
  const f = idx - lo
  return `rgb(${Math.round(MAGMA_STOPS[lo][0] + f * (MAGMA_STOPS[hi][0] - MAGMA_STOPS[lo][0]))},${Math.round(MAGMA_STOPS[lo][1] + f * (MAGMA_STOPS[hi][1] - MAGMA_STOPS[lo][1]))},${Math.round(MAGMA_STOPS[lo][2] + f * (MAGMA_STOPS[hi][2] - MAGMA_STOPS[lo][2]))})`
}

const BAND_LABELS_TOP_TO_BOTTOM = ['Air', 'Brilliance', 'Presence', 'Upper-mid', 'Mid', 'Low-mid', 'Bass', 'Sub-bass']
const BAND_LABELS_LOOKUP = ['Sub-bass', 'Bass', 'Low-mid', 'Mid', 'Upper-mid', 'Presence', 'Brilliance', 'Air']

export default function FrequencyHeatmap({ profiles, chunkTimeline, selectedChunkIdx, onChunkClick }) {
  const canvasRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const N_BUCKETS = 16

  const drawCanvas = useCallback(() => {
    if (!profiles?.length || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const N = profiles.length
    const W = canvas.width, H = canvas.height
    const cw = W / N, ch = H / N_BUCKETS
    ctx.clearRect(0, 0, W, H)
    for (let c = 0; c < N; c++) {
      for (let b = 0; b < N_BUCKETS; b++) {
        const val = profiles[c][N_BUCKETS - 1 - b]
        ctx.fillStyle = magmaColor(val)
        ctx.fillRect(c * cw, b * ch, Math.max(1, cw - 0.5), Math.max(1, ch - 0.5))
        const aiScore = (chunkTimeline?.[c]?.score ?? 0) / 100
        if (aiScore > 0.3) {
          ctx.fillStyle = `rgba(244,63,94,${Math.min(0.42, (aiScore - 0.3) * 0.6)})`
          ctx.fillRect(c * cw, b * ch, Math.max(1, cw - 0.5), Math.max(1, ch - 0.5))
        }
      }
      if (selectedChunkIdx === c) {
        ctx.strokeStyle = 'rgba(167,139,250,0.95)'
        ctx.lineWidth = 2.5
        ctx.strokeRect(c * cw + 1, 1, cw - 2, H - 2)
      }
    }
  }, [profiles, chunkTimeline, selectedChunkIdx, N_BUCKETS])

  useEffect(() => { drawCanvas() }, [drawCanvas])

  const handleMouseMove = useCallback((e) => {
    if (!profiles?.length || !canvasRef.current) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const cx = (e.clientX - rect.left) * scaleX
    const cy = (e.clientY - rect.top) * scaleY
    const chunkIdx = Math.min(Math.floor(cx / (canvas.width / profiles.length)), profiles.length - 1)
    const bandFlipped = Math.floor(cy / (canvas.height / N_BUCKETS))
    const bandIdx = Math.max(0, Math.min(N_BUCKETS - 1, N_BUCKETS - 1 - bandFlipped))
    const chunk = chunkTimeline?.[chunkIdx]
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      displayWidth: rect.width,
      chunkIdx,
      bandLabel: BAND_LABELS_LOOKUP[Math.floor(bandIdx / 2)] ?? '—',
      energy: profiles[chunkIdx]?.[bandIdx] ?? 0,
      score: chunk?.score ?? null,
      startSec: chunk?.start_sec ?? 0,
      endSec: chunk?.end_sec ?? 0,
    })
  }, [profiles, chunkTimeline, N_BUCKETS])

  const handleClick = useCallback(() => {
    if (!tooltip) return
    const chunk = chunkTimeline?.[tooltip.chunkIdx]
    if (chunk) onChunkClick?.(chunk, tooltip.chunkIdx)
  }, [tooltip, chunkTimeline, onChunkClick])

  if (!profiles?.length) return null

  return (
    <div className="panel-block heatmap-panel">
      <div className="panel-label">
        <span className="panel-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg></span>
        <span>Frequency Band Heatmap</span>
        <span className="panel-note">spectral energy per chunk · red overlay = elevated AI score · click to play</span>
      </div>
      <div className="heatmap-layout">
        <div className="heatmap-y-axis">
          {BAND_LABELS_TOP_TO_BOTTOM.map(l => <span key={l}>{l}</span>)}
        </div>
        <div className="heatmap-canvas-wrap" onMouseLeave={() => setTooltip(null)}>
          <canvas
            ref={canvasRef}
            width={900} height={144}
            className="heatmap-canvas"
            onMouseMove={handleMouseMove}
            onClick={handleClick}
          />
          {tooltip && (() => {
            const TOOLTIP_W = 170
            const flipLeft = tooltip.displayWidth && tooltip.x > tooltip.displayWidth / 2
            return (
              <div className="heatmap-tooltip" style={{
                left: flipLeft ? tooltip.x - TOOLTIP_W - 8 : tooltip.x + 14,
                top: Math.max(4, tooltip.y - 82),
              }}>
                <span className="ht-time">{tooltip.startSec.toFixed(1)}s – {tooltip.endSec.toFixed(1)}s</span>
                <span className="ht-band">{tooltip.bandLabel}</span>
                <span className="ht-energy">Energy: {(tooltip.energy * 100).toFixed(1)}%</span>
                {tooltip.score != null && (
                  <span className="ht-score" style={{ color: tooltip.score >= 90 ? '#fb7185' : tooltip.score >= 30 ? '#fbbf24' : '#34d399' }}>
                    AI Score: {tooltip.score.toFixed(1)}%
                  </span>
                )}
                <span className="ht-hint">Click to play segment</span>
              </div>
            )
          })()}
        </div>
      </div>
      <div className="heatmap-legend">
        <span className="hl-item">Low</span>
        <div className="heatmap-colorbar" />
        <span className="hl-item">High energy</span>
        <span className="hl-sep">·</span>
        <span className="hl-item hl-item--ai">🔴 Red overlay = high AI score</span>
      </div>
    </div>
  )
}
