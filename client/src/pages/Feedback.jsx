import { useState } from "react";
import API_BASE from "../config";
import AppLayout from "../components/AppLayout";
import { useToast } from "../components/Toast";

const CATEGORIES = [
  { id: "general", label: "General", icon: "💬" },
  { id: "bug", label: "Bug Report", icon: "🐛" },
  { id: "feature", label: "Feature Request", icon: "✨" },
  { id: "ui", label: "UI / UX", icon: "🎨" },
  { id: "performance", label: "Performance", icon: "⚡" },
];

const RATINGS = [
  { value: 1, emoji: "😞" },
  { value: 2, emoji: "😕" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "😊" },
  { value: 5, emoji: "🤩" },
];

const MAX = 500;

function Feedback() {
  const toast = useToast();
  const [category, setCategory] = useState("general");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) { toast("Please write your feedback", "warning"); return; }
    if (!rating) { toast("Please select a rating", "warning"); return; }
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category, rating, message,
          userName: localStorage.getItem("userName") || "Anonymous",
          userId: localStorage.getItem("userId")
        })
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        toast("Failed to submit feedback. Please try again.", "error");
      }
    } catch {
      toast("Network error. Please try again.", "error");
    }
    setSending(false);
  };

  if (submitted) return (
    <AppLayout>
      <div className="fb-success">
        <div className="fb-success-icon">🎉</div>
        <h2>Thank you, {localStorage.getItem("userName") || ""}!</h2>
        <p>Your feedback helps us make PropVista better for everyone.</p>
        <button className="fb-btn" onClick={() => { setSubmitted(false); setMessage(""); setRating(0); setCategory("general"); }}>
          Submit Another
        </button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="fb-page">
        <div className="fb-header">
          <h1>Share Your Feedback</h1>
          <p>Your thoughts help us improve PropVista</p>
        </div>

        <form onSubmit={handleSubmit} className="fb-form">

          {/* CATEGORY */}
          <div className="fb-field">
            <label className="fb-label">What's this about?</label>
            <div className="fb-categories">
              {CATEGORIES.map(c => (
                <button
                  key={c.id} type="button"
                  className={`fb-cat-btn${category === c.id ? " active" : ""}`}
                  onClick={() => setCategory(c.id)}
                >
                  <span>{c.icon}</span> {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* RATING */}
          <div className="fb-field">
            <label className="fb-label">How would you rate your experience?</label>
            <div className="fb-ratings">
              {RATINGS.map(r => (
                <button
                  key={r.value} type="button"
                  className={`fb-rating-btn${rating === r.value ? " active" : ""}`}
                  onClick={() => setRating(r.value)}
                >
                  <span className="fb-emoji">{r.emoji}</span>
                  <span className="fb-rating-num">{r.value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* MESSAGE */}
          <div className="fb-field">
            <label className="fb-label">Your feedback</label>
            <textarea
              className="fb-textarea"
              placeholder="Tell us what you think, what's broken, or what you'd love to see..."
              value={message}
              onChange={e => setMessage(e.target.value.slice(0, MAX))}
              rows={5}
            />
            <p className={`fb-char-count${message.length > MAX * 0.9 ? " warn" : ""}`}>
              {message.length}/{MAX}
            </p>
          </div>

          <button type="submit" className="fb-btn" disabled={sending}>
            {sending ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}

export default Feedback;
