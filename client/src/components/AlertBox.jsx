export default function AlertBox({ title, description, tone = 'green' }) {
  return (
    <div className="alert-card">
      <span className={`badge ${tone}`}>{title}</span>
      <p className="muted">{description}</p>
    </div>
  );
}
