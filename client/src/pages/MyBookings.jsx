import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import Notifications from "../components/Notifications";
import "./dashboard.css";

const STATUS_STYLE = {
  Upcoming:  { bg: "#fff7ed", color: "#f97316", border: "#fed7aa" },
  Completed: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  Cancelled: { bg: "#fef2f2", color: "#ef4444", border: "#fecaca" },
};

const TABS = ["Upcoming", "Completed", "Cancelled"];

const sideLinks = [
  { icon: "📊", label: "Dashboard", to: "/dashboard" },
  { icon: "🏢", label: "Properties", to: "/properties" },
  { icon: "🗺️", label: "Map View", to: "/explore" },
  { icon: "🔍", label: "AI Search", to: "/ai-search" },
  { icon: "📅", label: "My Bookings", to: "/bookings" },
  { icon: "👤", label: "Profile", to: "/profile" },
  { icon: "⚙️", label: "Settings", to: "/settings" },
];

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Upcoming");
  const userName = localStorage.getItem("userName") || "User";
  const initial = userName.charAt(0).toUpperCase();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5000/api/bookings/my", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setBookings(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    const res = await fetch(`http://localhost:5000/api/bookings/${id}/cancel`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: "Cancelled" } : b));
    }
  };

  const filtered = bookings.filter(b => b.status === activeTab);
  const count = (s) => bookings.filter(b => b.status === s).length;

  return (
    <div className="ndb-root">
      <aside className="ndb-sidebar">
        <div className="ndb-logo" onClick={() => navigate("/dashboard")}><span>🏠</span> PropVista</div>
        <nav className="ndb-nav">
          {sideLinks.map(l => (
            <NavLink key={l.to} to={l.to}
              className={({ isActive }) => "ndb-link" + (isActive ? " ndb-active" : "")}>
              <span>{l.icon}</span> {l.label}
            </NavLink>
          ))}
          <button className="ndb-link ndb-link-danger"
            onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.href = "/"; }}>
            <span>⎋</span> Logout
          </button>
        </nav>
      </aside>

      <div className="ndb-main">
        <div className="mb-page">

          {/* HEADER */}
          <div className="mb-header">
            <div>
              <h1 className="mb-title">My Bookings</h1>
              <p className="mb-subtitle">Manage your property visits and bookings.</p>
            </div>
            <div className="mb-header-right">
              <Notifications />
              <div className="mb-avatar">{initial}</div>
            </div>
          </div>

          {/* TABS */}
          <div className="mb-tabs">
            {TABS.map(tab => (
              <button key={tab} className={`mb-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}>
                {tab} ({count(tab)})
              </button>
            ))}
          </div>

          {/* LIST */}
          <div className="mb-list">
            {loading ? (
              <p style={{ color: "#9ca3af", padding: "20px 0" }}>Loading bookings...</p>
            ) : filtered.length === 0 ? (
              <div className="mb-empty">
                <span className="mb-empty-icon">📅</span>
                <p>No {activeTab.toLowerCase()} bookings yet.</p>
                {activeTab === "Upcoming" && (
                  <button
                    style={{ marginTop: 14, padding: "10px 22px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 }}
                    onClick={() => navigate("/explore")}>
                    Browse Properties
                  </button>
                )}
              </div>
            ) : filtered.map(b => {
              const p = b.property;
              if (!p) return null;
              return (
                <div key={b._id} className="mb-row">
                  <img
                    src={p.image || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=140&h=100&fit=crop"}
                    alt={p.title} className="mb-img"
                    onClick={() => navigate(`/properties/${p._id}`)}
                    style={{ cursor: "pointer" }}
                  />
                  <div className="mb-info" onClick={() => navigate(`/properties/${p._id}`)} style={{ cursor: "pointer" }}>
                    <p className="mb-prop-name">{p.title}</p>
                    <p className="mb-prop-loc">📍 {p.location}</p>
                    {b.message && <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>"{b.message}"</p>}
                  </div>
                  <div className="mb-date-col">
                    <p className="mb-col-label">Visit Date</p>
                    <p className="mb-col-val">{b.visitDate}</p>
                  </div>
                  <div className="mb-time-col">
                    <p className="mb-col-label">Time</p>
                    <p className="mb-col-val">{b.visitTime}</p>
                  </div>
                  <div className="mb-status-col">
                    <span className="mb-status-badge"
                      style={{
                        background: STATUS_STYLE[b.status]?.bg,
                        color: STATUS_STYLE[b.status]?.color,
                        border: `1px solid ${STATUS_STYLE[b.status]?.border}`
                      }}>
                      {b.status}
                    </span>
                    {b.status === "Upcoming" && (
                      <button className="mb-cancel-btn" onClick={() => handleCancel(b._id)}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
