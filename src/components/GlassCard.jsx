export default function GlassCard({
  title,
  subtitle,
  action,
  className = "",
  children,
}) {
  return (
    <section className={`glass-panel section-card ${className}`.trim()}>
      {(title || subtitle || action) && (
        <div className="section-header">
          <div>
            {title ? <h2>{title}</h2> : null}
            {subtitle ? <p className="muted">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
