export default function PendingPage({ order, hint }) {
  return (
    <article className="page pending-page" aria-busy="true">
      <p className="eyebrow">Recipe</p>
      <h2 className="page-title">{order}</h2>
      <div className="ornament" aria-hidden="true">
        ✦
      </div>
      <div className="page-body" role="status">
        <div className="ruled-lines" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p className="writing">{hint ?? 'Writing it down…'}</p>
      </div>
    </article>
  )
}
