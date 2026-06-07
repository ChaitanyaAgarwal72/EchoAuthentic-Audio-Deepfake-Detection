import { useState } from 'react'

export default function SegmentTimeline({ timeline, onChunkClick, selectedChunkIdx }) {
  const [hovered, setHovered] = useState(null)
  if (!timeline || timeline.length === 0) return null

  const aiCount = timeline.filter(c => c.score >= 90).length
  const humanCount = timeline.filter(c => c.score < 30).length
  const uncCount = timeline.length - aiCount - humanCount
  const segColor = (score) => score < 30 ? 'human' : score < 90 ? 'uncertain' : 'ai'

  return (
    <div className="panel-block segment-timeline">
      <div className="panel-label">
        <span className="panel-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
        <span>Segment Strip</span>
        <span className="panel-note">VAD-stripped speech · {timeline.length} chunks · click any segment to play</span>
      </div>
      <div className="timeline-track-wrap">
        <div className="timeline-track">
          {timeline.map((chunk, i) => (
            <div
              key={i}
              className={`timeline-seg timeline-seg--${segColor(chunk.score)}${selectedChunkIdx === i ? ' timeline-seg--selected' : ''}`}
              style={{ flex: 1 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onChunkClick?.(chunk, i)}
            >
              {hovered === i && (
                <div className="seg-tooltip">
                  <span className="seg-tt-time">{chunk.start_sec.toFixed(1)}s – {chunk.end_sec.toFixed(1)}s</span>
                  <span className="seg-tt-score" style={{ color: chunk.score >= 90 ? '#fb7185' : chunk.score >= 30 ? '#fbbf24' : '#34d399' }}>
                    {chunk.score.toFixed(1)}% AI
                  </span>
                  <span className="seg-tt-hint">Click to play</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="timeline-scale">
          <span>0 s</span>
          {timeline[Math.floor(timeline.length / 2)] && (
            <span>{((timeline[Math.floor(timeline.length / 2)].start_sec + timeline[Math.floor(timeline.length / 2)].end_sec) / 2).toFixed(1)} s</span>
          )}
          <span>{timeline[timeline.length - 1]?.end_sec.toFixed(1)} s</span>
        </div>
      </div>
      <div className="timeline-legend">
        <span className="leg leg--human">● Human <em>({humanCount})</em></span>
        <span className="leg leg--uncertain">● Uncertain <em>({uncCount})</em></span>
        <span className="leg leg--ai">● AI-Generated <em>({aiCount})</em></span>
        <span className="leg leg--ratio">{aiCount}/{timeline.length} chunks high-confidence AI ({Math.round((aiCount / timeline.length) * 100)}%)</span>
      </div>
    </div>
  )
}
