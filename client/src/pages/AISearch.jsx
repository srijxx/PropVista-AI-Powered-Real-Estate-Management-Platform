import { useState, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "./dashboard.css";
import Notifications from "../components/Notifications";

const DEFAULT_SUGGESTIONS = [
  "2 BHK Apartment in Coimbatore",
  "Villa under ₹80 Lakhs",
  "3 BHK House in Erode",
  "Flat for Rent in Peelamedu",
  "Affordable apartments under ₹30 Lakhs",
  "Ready to move properties",
];

const TYPE_IMGS = {
  Apartment: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=260&fit=crop",
  House: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=260&fit=crop",
  Villa: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&h=260&fit=crop",
  Flat: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=260&fit=crop",
};

function getTypeImg(p) {
  if (p.image) return p.image;
  return TYPE_IMGS[p.type] || TYPE_IMGS.Apartment;
}

export default function AISearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null); // { message, properties, suggestions }
  const [savedIds, setSavedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("savedProperties") || "[]"); } catch { return []; }
  });
  const inputRef = useRef(null);
  const userName = localStorage.getItem("userName") || "User";
  const initial = userName.charAt(0).toUpperCase();

  const sideLinks = [
    { icon: "📊", label: "Dashboard", to: "/dashboard" },
    { icon: "🏢", label: "Properties", to: "/properties" },
    { icon: "🗺️", label: "Map View", to: "/explore" },
    { icon: "🔍", label: "AI Search", to: "/ai-search" },
    { icon: "📅", label: "My Bookings", to: "/properties" },
    { icon: "👤", label: "Profile", to: "/profile" },
    { icon: "⚙️", label: "Settings", to: "/settings" },
    { icon: "⎋", label: "Logout", to: "/", logout: true },
  ];

  const handleSearch = async (searchText) => {
    const text = searchText || query;
    if (!text.trim()) return;
    setQuery(text);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      setResults(data);
    } catch {
      setResults({ message: "Search failed. Please try again.", properties: [], suggestions: [] });
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = (id, e) => {
    e.stopPropagation();
    const next = savedIds.includes(id) ? savedIds.filter(x => x !== id) : [...savedIds, id];
    setSavedIds(next);
    localStorage.setItem("savedProperties", JSON.stringify(next));
  };

  return (
    <div className="ndb-root">
      {/* SIDEBAR */}
      <aside className="ndb-sidebar">
        <div className="ndb-logo" onClick={() => navigate("/dashboard")}>
          <span>🏠</span> PropVista
        </div>
        <nav className="ndb-nav">
          {sideLinks.map(l =>
            l.logout
              ? <button key="logout" className="ndb-link ndb-link-danger"
                  onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.href = "/"; }}>
                  <span>{l.icon}</span> {l.label}
                </button>
              : <NavLink key={l.to + l.label} to={l.to}
                  className={({ isActive }) => "ndb-link" + (isActive ? " ndb-active" : "")}
                  end={l.label === "AI Search"}>
                  <span>{l.icon}</span> {l.label}
                </NavLink>
          )}
        </nav>
      </aside>

      {/* MAIN */}
      <div className="ndb-main">
        <div className="ais-page">
          {/* HEADER */}
          <div className="ais-header">
            <div>
              <h1 className="ais-title">AI Search</h1>
              <p className="ais-subtitle">Tell us what you need, our AI will find the perfect properties.</p>
            </div>
            <div className="ais-header-right">
              <Notifications />
              <div className="ais-avatar">{initial}</div>
            </div>
          </div>

          {/* SEARCH BOX */}
          <div className="ais-search-box">
            <div className="ais-search-inner">
              <input
                ref={inputRef}
                className="ais-search-input"
                placeholder="I want a 2 BHK apartment in Coimbatore under 50 lakhs near a metro station"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
              />
              <button className="ais-search-btn" onClick={() => handleSearch()} disabled={loading}>
                {loading ? "..." : "➤"}
              </button>
            </div>
          </div>

          {/* AI SUGGESTIONS */}
          <div className="ais-section">
            <p className="ais-section-title">AI Suggestions</p>
            <div className="ais-chips">
              {(results?.suggestions?.length > 0 ? results.suggestions : DEFAULT_SUGGESTIONS).map(s => (
                <button key={s} className="ais-chip" onClick={() => handleSearch(s)}>{s}</button>
              ))}
            </div>
          </div>

          {/* RESULTS */}
          {results && (
            <div className="ais-section">
              <div className="ais-results-header">
                <p className="ais-section-title">
                  AI Matched Properties
                  {results.properties?.length > 0 && <span className="ais-count"> ({results.properties.length})</span>}
                </p>
                {results.properties?.length > 0 && (
                  <button className="ais-view-all" onClick={() => navigate("/explore")}>View all</button>
                )}
              </div>
              {results.message && (
                <p className="ais-ai-message">{results.message}</p>
              )}
              {results.properties?.length > 0 ? (
                <div className="ais-grid">
                  {results.properties.map((p, i) => {
                    const match = Math.max(70, 95 - i * 3);
                    const isSaved = savedIds.includes(p._id);
                    return (
                      <div key={p._id} className="ais-card" onClick={() => navigate(`/properties/${p._id}`)}>
                        <div className="ais-card-img-wrap">
                          <img src={getTypeImg(p)} alt={p.title} className="ais-card-img" />
                          <button
                            className={`ais-heart ${isSaved ? "saved" : ""}`}
                            onClick={e => toggleSave(p._id, e)}
                          >
                            {isSaved ? "❤️" : "🤍"}
                          </button>
                        </div>
                        <div className="ais-card-body">
                          <p className="ais-card-title">{p.title}</p>
                          <p className="ais-card-loc">📍 {p.location}</p>
                          <p className="ais-card-area">{p.area} sqft</p>
                          <div className="ais-card-footer">
                            <span className="ais-match">{match}% Match</span>
                            <button className="ais-view-btn" onClick={() => navigate(`/properties/${p._id}`)}>
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="ais-empty">
                  <span>🔍</span>
                  <p>No properties found. Try a different search.</p>
                </div>
              )}
            </div>
          )}

          {!results && (
            <div className="ais-empty-state">
              <div className="ais-empty-icon">🤖</div>
              <p className="ais-empty-title">Ask AI to find your perfect property</p>
              <p className="ais-empty-sub">Type your requirements above or click a suggestion</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
