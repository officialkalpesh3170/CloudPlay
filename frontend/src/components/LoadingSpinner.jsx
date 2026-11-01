export default function LoadingSpinner({ fullscreen }) {
  const style = fullscreen
    ? { position: "fixed", inset: 0, background: "#070910", display: "grid", placeItems: "center", zIndex: 999 }
    : { display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" };

  return (
    <div style={style} aria-label="Loading…" role="status">
      <div style={{
        width: 44, height: 44,
        border: "3px solid rgba(123,104,238,0.2)",
        borderTop: "3px solid #7b68ee",
        borderRadius: "50%",
        animation: "cp-spin 0.9s linear infinite",
      }} />
      <style>{`@keyframes cp-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
