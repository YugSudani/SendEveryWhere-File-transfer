export function Card({ title, subtitle, children, footer }) {
  return (
    <section className="card">
      <header className="card-head">
        <h2 className="card-title">{title}</h2>
        {subtitle ? <p className="card-subtitle">{subtitle}</p> : null}
      </header>
      <div className="card-body">{children}</div>
      {footer ? <footer className="card-foot">{footer}</footer> : null}
    </section>
  );
}
