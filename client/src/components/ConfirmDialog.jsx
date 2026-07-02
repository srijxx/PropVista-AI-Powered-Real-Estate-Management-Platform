function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999
    }}>
      <div style={{
        background: "#fff", borderRadius: "14px", padding: "28px 32px",
        maxWidth: "380px", width: "90%", boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>🗑️</div>
        <h3 style={{ marginBottom: "8px", fontSize: "18px" }}>Are you sure?</h3>
        <p style={{ color: "#6b7280", marginBottom: "24px", fontSize: "14px" }}>{message}</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={onCancel}
            style={{ padding: "10px 24px", borderRadius: "8px", border: "1px solid #d1d5db", background: "#f9fafb", cursor: "pointer", fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: 500 }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
