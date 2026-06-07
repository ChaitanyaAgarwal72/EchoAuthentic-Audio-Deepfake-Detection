export default function SkeletonLoader() {
  return (
    <div className="skeleton-wrap" aria-label="Loading results…">
      <div className="skel skel--banner" />
      <div className="skel-gauge-row">
        <div className="skel skel--gauge" />
        <div className="skel-stats">
          <div className="skel skel--stat" /><div className="skel skel--stat" />
          <div className="skel skel--stat" /><div className="skel skel--stat" />
        </div>
      </div>
      <div className="skel skel--spec" />
      <div className="skel skel--timeline" />
    </div>
  )
}
