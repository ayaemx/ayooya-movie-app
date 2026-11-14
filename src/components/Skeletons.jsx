// Placeholder shapes shown while data loads, sized like the real content so nothing jumps.
export const CardSkeleton = () => <div className="card skeleton" aria-hidden="true" />

export const RowSkeleton = ({ count = 8 }) => (
  <div className="row-track" aria-hidden="true">
    {Array.from({ length: count }, (_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
)

export const HeroSkeleton = () => <div className="hero skeleton" aria-hidden="true" />
