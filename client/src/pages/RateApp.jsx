import { useState } from "react";
import AppLayout from "../components/AppLayout";

function RateApp() {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleRate = (value) => {
    setRating(value);
  };

  const handleSubmit = () => {
    if (!rating) return;
    setSubmitted(true);
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: "480px", margin: "40px auto", background: "#fff", borderRadius: "16px", padding: "36px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>
          ⭐ Rate Our App
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "28px" }}>
          Please rate your experience with PropVista
        </p>

        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              style={{
                fontSize: "36px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: star <= rating ? "#f59e0b" : "#e5e7eb",
                transition: "color 0.15s, transform 0.15s",
                transform: star <= rating ? "scale(1.1)" : "scale(1)",
              }}
            >
              ★
            </button>
          ))}
        </div>

        {rating > 0 && !submitted && (
          <>
            <p style={{ fontSize: "15px", color: "#374151", marginBottom: "20px" }}>
              Your rating: <strong style={{ color: "#f59e0b" }}>{rating}/5</strong>
            </p>
            <button
              onClick={handleSubmit}
              style={{
                padding: "12px 28px",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Submit Rating
            </button>
          </>
        )}

        {submitted && (
          <div style={{ textAlign: "center", paddingTop: "8px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎉</div>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
              Thanks for rating us {rating}/5!
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
              Your feedback helps us improve PropVista.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default RateApp;
