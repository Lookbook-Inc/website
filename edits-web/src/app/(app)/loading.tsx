export default function Loading() {
  return <div className="page" aria-busy="true" aria-label="Loading"><div className="skeleton heading-skeleton" /><div className="skeleton-grid">{Array.from({ length: 8 }).map((_, index) => <div className="skeleton card-skeleton" key={index} />)}</div></div>;
}
