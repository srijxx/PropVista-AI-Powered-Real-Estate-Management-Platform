import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import AppLayout from "../components/AppLayout";

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [propertyAlerts, setPropertyAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "User");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail") || "");
  const [userAvatar, setUserAvatar] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }
    if (userId) {
      fetch(`http://localhost:5000/api/users/profile/${userId}`)
        .then(r => r.json())
        .then(d => {
          const name = d.firstName || d.username || "User";
          setUserName(name);
          setUserEmail(d.email || "");
          if (d.avatar) setUserAvatar(`http://localhost:5000/uploads/${d.avatar}`);
          localStorage.setItem("userName", name);
          localStorage.setItem("userEmail", d.email || "");
        }).catch(() => {});
    }
  }, [userId]);

  const handleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.body.classList.toggle("dark-mode", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleLogout = () => { localStorage.clear(); sessionStorage.clear(); window.location.href = "/"; };

  const handleDeleteAccount = async () => {
    try {
      await fetch(`http://localhost:5000/api/users/profile/${userId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.clear();
      window.location.href = "/";
    } catch { toast("Failed to delete account", "error"); }
  };

  const initials = userName?.charAt(0).toUpperCase() || "U";

  const Toggle = ({ checked, onChange }) => (
    <label className="st2-toggle" onClick={e => e.stopPropagation()}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="st2-track"><span className="st2-thumb" /></span>
    </label>
  );

  return (
    <AppLayout>
      <div className="st2-page">

        {/* HEADER */}
        <div className="st2-header">
          <div>
            <h1 className="st2-title">Settings</h1>
            <p className="st2-tagline">Manage your preferences and account settings</p>
          </div>
          <div className="st2-house-illustration">
            <svg viewBox="0 0 160 120" width="160" height="120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="80" cy="108" rx="60" ry="8" fill="#e0e7ff" opacity="0.5"/>
              <rect x="30" y="55" width="70" height="55" rx="4" fill="#c7d2fe"/>
              <polygon points="20,58 80,20 140,58" fill="#a5b4fc"/>
              <rect x="55" y="75" width="20" height="35" rx="3" fill="#818cf8"/>
              <rect x="38" y="65" width="16" height="16" rx="2" fill="#e0e7ff"/>
              <rect x="76" y="65" width="16" height="16" rx="2" fill="#e0e7ff"/>
              <circle cx="125" cy="38" r="10" fill="#e0e7ff" opacity="0.7"/>
              <circle cx="140" cy="30" r="7" fill="#e0e7ff" opacity="0.5"/>
              <circle cx="20" cy="45" r="8" fill="#e0e7ff" opacity="0.6"/>
            </svg>
          </div>
        </div>

        {/* PREFERENCES */}
        <div className="st2-section">
          <div className="st2-section-head">
            <span className="st2-section-icon" style={{ background: "#ede9fe", color: "#7c3aed" }}>⚙️</span>
            <div>
              <p className="st2-section-title">Preferences</p>
              <p className="st2-section-sub">Customize your app experience</p>
            </div>
          </div>
          <div className="st2-card">
            <div className="st2-row">
              <span className="st2-row-icon" style={{ background: "#ede9fe" }}>🔔</span>
              <div className="st2-row-text">
                <p className="st2-row-label">Notifications</p>
                <p className="st2-row-sub">Push alerts for activity, updates and messages</p>
              </div>
              <Toggle checked={notifications} onChange={() => setNotifications(!notifications)} />
            </div>
            <div className="st2-row">
              <span className="st2-row-icon" style={{ background: "#ede9fe" }}>🌙</span>
              <div className="st2-row-text">
                <p className="st2-row-label">Dark Mode</p>
                <p className="st2-row-sub">Switch between light and dark themes</p>
              </div>
              <Toggle checked={darkMode} onChange={handleDarkMode} />
            </div>
            <div className="st2-row" style={{ borderBottom: "none" }}>
              <span className="st2-row-icon" style={{ background: "#dcfce7" }}>🏠</span>
              <div className="st2-row-text">
                <p className="st2-row-label">Property Alerts</p>
                <p className="st2-row-sub">Notify me about new matching listings</p>
              </div>
              <Toggle checked={propertyAlerts} onChange={() => setPropertyAlerts(!propertyAlerts)} />
            </div>
          </div>
        </div>

        {/* ACCOUNT */}
        <div className="st2-section">
          <div className="st2-section-head">
            <span className="st2-section-icon" style={{ background: "#ede9fe", color: "#7c3aed" }}>👤</span>
            <div>
              <p className="st2-section-title">Account</p>
              <p className="st2-section-sub">Manage your account settings</p>
            </div>
          </div>
          <div className="st2-card">
            <div className="st2-row st2-clickable" onClick={() => navigate("/profile")}>
              <span className="st2-row-icon" style={{ background: "#ede9fe" }}>👤</span>
              <div className="st2-row-text">
                <p className="st2-row-label">Edit Profile</p>
                <p className="st2-row-sub">Update your personal information</p>
              </div>
              <span className="st2-chevron">›</span>
            </div>
            <div className="st2-row st2-clickable" style={{ borderBottom: "none" }} onClick={() => navigate("/forgot-password")}>
              <span className="st2-row-icon" style={{ background: "#fef9c3" }}>🔒</span>
              <div className="st2-row-text">
                <p className="st2-row-label">Change Password</p>
                <p className="st2-row-sub">Update your login password</p>
              </div>
              <span className="st2-chevron">›</span>
            </div>
          </div>
        </div>

        {/* SUPPORT */}
        <div className="st2-section">
          <div className="st2-section-head">
            <span className="st2-section-icon" style={{ background: "#ede9fe", color: "#7c3aed" }}>🛡️</span>
            <div>
              <p className="st2-section-title">Support</p>
              <p className="st2-section-sub">Get help and share feedback</p>
            </div>
          </div>
          <div className="st2-card">
            <div className="st2-row st2-clickable" onClick={() => navigate("/contact")}>
              <span className="st2-row-icon" style={{ background: "#dcfce7" }}>✉️</span>
              <div className="st2-row-text">
                <p className="st2-row-label">Contact Us</p>
                <p className="st2-row-sub">Reach out to our support team</p>
              </div>
              <span className="st2-chevron">›</span>
            </div>
            <div className="st2-row st2-clickable" style={{ borderBottom: "none" }} onClick={() => navigate("/feedback")}>
              <span className="st2-row-icon" style={{ background: "#fdf4ff" }}>💬</span>
              <div className="st2-row-text">
                <p className="st2-row-label">Feedback</p>
                <p className="st2-row-sub">Share your thoughts and suggestions</p>
              </div>
              <span className="st2-chevron">›</span>
            </div>
          </div>
        </div>

        {/* DANGER ZONE */}
        <div className="st2-section">
          <div className="st2-section-head">
            <span className="st2-section-icon" style={{ background: "#fff1f2", color: "#e11d48" }}>🛡️</span>
            <div>
              <p className="st2-section-title">Danger Zone</p>
              <p className="st2-section-sub">Irreversible and sensitive actions</p>
            </div>
          </div>
          <div className="st2-card">
            <div className="st2-row st2-clickable" onClick={() => setShowDeleteConfirm(true)}>
              <span className="st2-row-icon" style={{ background: "#fff1f2" }}>🗑️</span>
              <div className="st2-row-text">
                <p className="st2-row-label st2-danger-label">Delete Account</p>
                <p className="st2-row-sub">Permanently remove your account and all data</p>
              </div>
              <span className="st2-chevron">›</span>
            </div>
            <div className="st2-row st2-clickable" style={{ borderBottom: "none" }} onClick={handleLogout}>
              <span className="st2-row-icon" style={{ background: "#fff1f2" }}>🚪</span>
              <div className="st2-row-text">
                <p className="st2-row-label st2-danger-label">Logout</p>
                <p className="st2-row-sub">Sign out of PropVista on this device</p>
              </div>
              <span className="st2-chevron">›</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <p className="st2-footer">PropVista v1.0.0 &nbsp;•&nbsp; Build better. Live better.</p>

        {/* DELETE MODAL */}
        {showDeleteConfirm && (
          <div className="landing-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <div className="landing-modal" style={{ maxWidth: "380px" }} onClick={e => e.stopPropagation()}>
              <div style={{ textAlign: "center", fontSize: "44px", marginBottom: "12px" }}>⚠️</div>
              <h2 style={{ textAlign: "center", marginBottom: "8px" }}>Delete Account?</h2>
              <p style={{ textAlign: "center", color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
                This will permanently delete your account and all your properties. This cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={() => setShowDeleteConfirm(false)}
                  style={{ flex:1, padding:"11px", borderRadius:"10px", border:"1px solid #e5e7eb", background:"#fff", cursor:"pointer", fontWeight:600 }}>
                  Cancel
                </button>
                <button onClick={handleDeleteAccount}
                  style={{ flex:1, padding:"11px", borderRadius:"10px", border:"none", background:"#ef4444", color:"#fff", cursor:"pointer", fontWeight:600 }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Settings;
