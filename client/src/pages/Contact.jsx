import { useState } from "react";
import API_BASE from "../config";
import AppLayout from "../components/AppLayout";
import { useToast } from "../components/Toast";

const CONTACT_INFO = [
  { icon: "✉️", label: "Email", value: "support@propvista.com", href: "mailto:support@propvista.com" },
  { icon: "📞", label: "Phone", value: "+91 98765 43210", href: "tel:+919876543210" },
  { icon: "🌐", label: "Website", value: "www.propvista.com", href: "https://propvista.com" },
  { icon: "📍", label: "Location", value: "Coimbatore, Tamil Nadu", href: null },
];

function Contact() {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
        toast(data.message || "Message sent! We'll get back to you within 24 hours.", "success");
        setForm({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSent(false), 4000);
      } else {
        toast(data.message || "Failed to send message.", "error");
      }
    } catch {
      toast("Network error. Please try again.", "error");
    }
    setSending(false);
  };

  return (
    <AppLayout>
      <div className="ct-page">

        {/* HEADER */}
        <div className="ct-header">
          <h1>Get in Touch</h1>
          <p>Have a question or need help? We're here for you.</p>
        </div>

        <div className="ct-grid">

          {/* LEFT — INFO */}
          <div className="ct-info-col">
            <div className="ct-info-card">
              <h3>Contact Information</h3>
              <p className="ct-info-sub">Reach us through any of these channels</p>

              <div className="ct-info-list">
                {CONTACT_INFO.map(item => (
                  <div key={item.label} className="ct-info-row">
                    <div className="ct-info-icon">{item.icon}</div>
                    <div>
                      <p className="ct-info-label">{item.label}</p>
                      {item.href
                        ? <a href={item.href} className="ct-info-value">{item.value}</a>
                        : <p className="ct-info-value">{item.value}</p>
                      }
                    </div>
                  </div>
                ))}
              </div>

              <div className="ct-hours">
                <p className="ct-hours-title">⏰ Support Hours</p>
                <p>Mon – Fri: 9:00 AM – 6:00 PM</p>
                <p>Sat: 10:00 AM – 2:00 PM</p>
                <p style={{ color: "#ef4444" }}>Sun: Closed</p>
              </div>
            </div>
          </div>

          {/* RIGHT — FORM */}
          <div className="ct-form-col">
            <div className="ct-form-card">
              <h3>Send a Message</h3>
              <p className="ct-info-sub">We'll respond within 24 hours</p>

              <form onSubmit={handleSubmit} className="ct-form">
                <div className="ct-form-row">
                  <div className="ct-field">
                    <label className="ct-label">Your Name</label>
                    <input className="ct-input" placeholder="Sreeja" value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="ct-field">
                    <label className="ct-label">Email Address</label>
                    <input className="ct-input" type="email" placeholder="sreeja@gmail.com" value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>

                <div className="ct-field">
                  <label className="ct-label">Subject</label>
                  <input className="ct-input" placeholder="How can we help?" value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })} required />
                </div>

                <div className="ct-field">
                  <label className="ct-label">Message</label>
                  <textarea className="ct-input ct-textarea" placeholder="Describe your issue or question..."
                    value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    rows={5} required />
                </div>

                <button type="submit" className="ct-submit-btn" disabled={sending}>
                  {sending ? "Sending..." : sent ? "✓ Sent!" : "Send Message →"}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}

export default Contact;
