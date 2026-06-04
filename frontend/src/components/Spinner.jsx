export default function Spinner({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-3)', fontStyle: 'italic', fontSize: 13 }}>
      <div className="spinner" />
      {text && <span>{text}</span>}
    </div>
  )
}
