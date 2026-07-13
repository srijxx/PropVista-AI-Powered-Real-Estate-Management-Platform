import { useState, useCallback } from "react";

// ── Toast Context & Hook ──────────────────────────────────────────────────────
import { createContext, useContext } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: "fixed", bottom: "24px", right: "24px",
        display: "flex", flexDirection: "column", gap: "10px", zIndex: 99999
      }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            padding: "12px 18px",
            borderRadius: "10px",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 500,
            minWidth: "240px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            background: t.type === "success" ? "#22c55e"
              : t.type === "error" ? "#ef4444"
              : t.type === "warning" ? "#f59e0b"
              : "#6366f1",
            animation: "slideIn 0.25s ease",
            display: "flex", alignItems: "center", gap: "10px"
          }}>
            <span style={{ fontSize: "18px" }}>
              {t.type === "success" ? "✅" : t.type === "error" ? "❌" : t.type === "warning" ? "⚠️" : "ℹ️"}
            </span>
            {t.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
