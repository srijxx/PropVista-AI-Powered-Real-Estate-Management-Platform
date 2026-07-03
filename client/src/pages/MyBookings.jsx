import { useState, useEffect, useCallback } from "react";
import API_BASE from '../config';
import { useNavigate, NavLink } from "react-router-dom";
import Notifications from "../components/Notifications";
import "./dashboard.css";

const STATUS_STYLE = {
  Upcoming:  { bg: "#fff7ed", color: "#f97316", border: "#fed7aa" },
  Completed: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  Cancelled: { bg: "#fef2f2", color: "#ef4444", border: "#fecaca" },
};

const TABS = ["Upcoming", "Completed", "Cancelled"];

const TYPE_FALLBACK = {
  Villa:     "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=140&h=100&fit=crop",
  House:     "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=140&h=100&fit=crop",
  Apartment: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=140&h=100&fit=crop",
  Flat:      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=140&h=100&fit=crop",
};

const sideLinks = [
  { icon: "📊", label: "Dashboard",   to: "/dashboard" },
  { icon: "🏢", label: "Properties",  to: "/properties" },
  { icon: "🗺️", label: "Map View",    to: "/explore" },
  { icon: "🔍", label: "AI Search",   to: "/ai-search" },
  { icon: "📅", label: "My Bookings", to: "/bookings" },
  { icon: "👤", label: "Profile",     to: "/profile" },
  { icon: "⚙️", label: "Settings",    to: "/settings" },
];

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [cancelling, setCancelling] = useState(null);

  const userName = localStorage.getItem("userName") || "User";
  const initial  = userName.charAt(0).toUpperCase();

  // Read token once — avoids stale closure issues
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        setError("Not logged in. Please sign in again.");
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_BASE}/api/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load bookings. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    setCancelling(id);
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setBookings(prev =>
          prev.map(b => b._id === id ? { ...b, status: "Cancelled" } : b)
        );
      }
    } catch {
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setCancelling(null);
    }
  };

  const filtered = bookings.filter(b => b.status === activeTab);
  const count    = (s) => bookings.filter(b => b.status === s).length;

  const getImg = (b) => {
    const p = b.property;
    if (!p) return TYPE_FALLBACK.House;
    return p.image || TYPE_FALLBACK[p.type] || TYPE_FALLBACK.House;
  };

  return (
    <div className="ndb-root">
      {/* SIDEBAR */}
      <aside className="ndb-sidebar">
        <div className="ndb-logo" onClick={() => navigate("/dashboard")}>
          <span>🏠</span> PropVista
        </div>
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

      {/* MAIN */}
      <div className="ndb-main" style={{ overflowY: "auto" }}>
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
              <button key={tab}
                className={`mb-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}>
                {tab} <span style={{
                  background: activeTab === tab ? "#eff6ff" : "#f3f4f6",
                  color: activeTab === tab ? "#4f46e5" : "#6b7280",
                  borderRadius: "10px", padding: "1px 8px", fontSize: "12px",
                  marginLeft: "4px", fontWeight: 700
                }}>{count(tab)}</span>
              </button>
            ))}
          </div>

          {/* CONTENT */}
          <div className="mb-list">
            {/* Loading */}
            {loading && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                <p style={{ fontSize: 15 }}>Loading your bookings...</p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: 12, padding: "20px 24px", color: "#ef4444",
                display: "flex", alignItems: "center", gap: 12
              }}>
                <span style={{ fontSize: 24 }}>⚠️</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 700 }}>{error}</p>
                  <button
                    onClick={fetchBookings}
                    style={{
                      marginTop: 8, background: "#ef4444", color: "#fff",
                      border: "none", borderRadius: 8, padding: "6px 16px",
                      fontSize: 13, fontWeight: 600, cursor: "pointer"
                    }}>
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && filtered.length === 0 && (
              <div className="mb-empty">
                <span className="mb-empty-icon">
                  {activeTab === "Upcoming" ? "📅" : activeTab === "Completed" ? "✅" : "❌"}
                </span>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  No {activeTab.toLowerCase()} bookings
                </p>
                <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>
                  {activeTab === "Upcoming"
                    ? "Browse properties and book a visit to get started."
                    : activeTab === "Completed"
                    ? "Completed visits will appear here."
                    : "Cancelled bookings will appear here."}
                </p>
                {activeTab === "Upcoming" && (
                  <button
                    style={{
                      padding: "10px 24px", background: "#6366f1", color: "#fff",
                      border: "none", borderRadius: 10, fontWeight: 700,
                      cursor: "pointer", fontSize: 14
                    }}
                    onClick={() => navigate("/explore")}>
                    🔍 Browse Properties
                  </button>
                )}
              </div>
            )}

            {/* Booking rows */}
            {!loading && !error && filtered.map(b => {
              const p = b.property;
              if (!p) return null;
              return (
                <div key={b._id} className="mb-row">
                  {/* Property image */}
                  <img
                    src={getImg(b)}
                    alt={p.title || "Property"}
                    className="mb-img"
                    onClick={() => navigate(`/properties/${p._id}`)}
                    style={{ cursor: "pointer", flexShrink: 0 }}
                    onError={e => { e.target.src = TYPE_FALLBACK.House; }}
                  />

                  {/* Property info */}
                  <div className="mb-info"
                    onClick={() => navigate(`/properties/${p._id}`)}
                    style={{ cursor: "pointer" }}>
                    <p className="mb-prop-name">{p.title || "Property"}</p>
                    <p className="mb-prop-loc">📍 {p.location || "—"}</p>
                    <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>
                      {p.type} · ₹ {Number(p.price || 0).toLocaleString("en-IN")}
                    </p>
                    {b.name && (
                      <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>
                        👤 {b.name}{b.phone ? ` · 📞 ${b.phone}` : ""}
                      </p>
                    )}
                    {b.message && (
                      <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 3, fontStyle: "italic" }}>
                        "{b.message}"
                      </p>
                    )}
                  </div>

                  {/* Visit Date */}
                  <div className="mb-date-col">
                    <p className="mb-col-label">Visit Date</p>
                    <p className="mb-col-val">
                      {b.visitDate
                        ? new Date(b.visitDate).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })
                        : b.visitDate}
                    </p>
                  </div>

                  {/* Visit Time */}
                  <div className="mb-time-col">
                    <p className="mb-col-label">Time</p>
                    <p className="mb-col-val">{b.visitTime}</p>
                  </div>

                  {/* Status + Cancel */}
                  <div className="mb-status-col">
                    <span className="mb-status-badge" style={{
                      background: STATUS_STYLE[b.status]?.bg,
                      color: STATUS_STYLE[b.status]?.color,
                      border: `1px solid ${STATUS_STYLE[b.status]?.border}`
                    }}>
                      {b.status === "Upcoming"  && "🕐 "}
                      {b.status === "Completed" && "✅ "}
                      {b.status === "Cancelled" && "❌ "}
                      {b.status}
                    </span>
                    {b.status === "Upcoming" && (
                      <button className="mb-cancel-btn"
                        disabled={cancelling === b._id}
                        onClick={e => { e.stopPropagation(); handleCancel(b._id); }}
                        style={{
                          marginTop: 8, padding: "5px 12px",
                          background: "none", border: "1px solid #fecaca",
                          borderRadius: 7, color: "#ef4444",
                          fontSize: 12, fontWeight: 600, cursor: "pointer"
                        }}>
                        {cancelling === b._id ? "Cancelling..." : "Cancel Visit"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary footer */}
          {!loading && !error && bookings.length > 0 && (
            <div style={{
              marginTop: 28, padding: "14px 20px",
              background: "#fff", borderRadius: 12,
              display: "flex", gap: 24, flexWrap: "wrap",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
            }}>
              {TABS.map(tab => (
                <div key={tab} style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1e293b" }}>
                    {count(tab)}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{tab}</p>
                </div>
              ))}
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
                <button
                  onClick={() => navigate("/explore")}
                  style={{
                    padding: "8px 18px", background: "#6366f1", color: "#fff",
                    border: "none", borderRadius: 8, fontWeight: 600,
                    cursor: "pointer", fontSize: 13
                  }}>
                  + Book Another Visit
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
