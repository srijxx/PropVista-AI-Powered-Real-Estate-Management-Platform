import { useEffect, useState } from "react";
import API_BASE from '../config';
import { useNavigate, NavLink } from "react-router-dom";
import Notifications from "../components/Notifications";
import "./dashboard.css";

const sideLinks = [
  { icon: "📊", label: "Dashboard", to: "/dashboard" },
  { icon: "🏢", label: "Properties", to: "/properties" },
  { icon: "🗺️", label: "Map View", to: "/explore" },
  { icon: "🔍", label: "AI Search", to: "/ai-search" },
  { icon: "📅", label: "My Bookings", to: "/bookings" },
  { icon: "👤", label: "Profile", to: "/profile" },
  { icon: "⚙️", label: "Settings", to: "/settings" },
];

const TYPE_IMGS = {
  Apartment: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&h=200&fit=crop",
  House: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=300&h=200&fit=crop",
  Villa: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=300&h=200&fit=crop",
  Flat: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&h=200&fit=crop",
};

function score(p) {
  // Simple investment score from data
  let s = 60;
  if (p.area > 1200) s += 10;
  if (p.bedrooms >= 3) s += 8;
  if (p.bathrooms >= 2) s += 5;
  if (p.status === "For Sale") s += 7;
  if (p.price < 5000000) s += 10;
  return Math.min(99, s);
}

export default function CompareProperties() {
  const navigate = useNavigate();
  const [allProperties, setAllProperties] = useState([]);
  const [selA, setSelA] = useState("");
  const [selB, setSelB] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/properties")
      .then(r => r.json())
      .then(setAllProperties)
      .catch(console.error);
  }, []);

  const filtered = allProperties.filter(p =>
    !search ||
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.toLowerCase().includes(search.toLowerCase())
  );

  const a = allProperties.find(p => p._id === selA);
  const b = allProperties.find(p => p._id === selB);

  const METRICS = a && b ? [
    { label: "Price", icon: "💰", aVal: `₹ ${(a.price/100000).toFixed(1)}L`, bVal: `₹ ${(b.price/100000).toFixed(1)}L`, winA: a.price < b.price, winB: b.price < a.price, note: "Lower is better" },
    { label: "Area", icon: "📐", aVal: `${a.area || "—"} sqft`, bVal: `${b.area || "—"} sqft`, winA: (a.area||0) > (b.area||0), winB: (b.area||0) > (a.area||0), note: "Larger is better" },
    { label: "₹/sqft", icon: "📊", aVal: a.area ? `₹${Math.round(a.price/a.area).toLocaleString()}` : "—", bVal: b.area ? `₹${Math.round(b.price/b.area).toLocaleString()}` : "—", winA: a.area && b.area && (a.price/a.area) < (b.price/b.area), winB: a.area && b.area && (b.price/b.area) < (a.price/a.area), note: "Lower is better" },
    { label: "Bedrooms", icon: "🛏", aVal: `${a.bedrooms || 0} BHK`, bVal: `${b.bedrooms || 0} BHK`, winA: (a.bedrooms||0) > (b.bedrooms||0), winB: (b.bedrooms||0) > (a.bedrooms||0), note: "More is better" },
    { label: "Bathrooms", icon: "🛁", aVal: `${a.bathrooms || 0}`, bVal: `${b.bathrooms || 0}`, winA: (a.bathrooms||0) > (b.bathrooms||0), winB: (b.bathrooms||0) > (a.bathrooms||0) },
    { label: "Type", icon: "🏠", aVal: a.type, bVal: b.type },
    { label: "Status", icon: "📋", aVal: a.status, bVal: b.status },
    { label: "Invest Score", icon: "⭐", aVal: `${score(a)}/100`, bVal: `${score(b)}/100`, winA: score(a) > score(b), winB: score(b) > score(a), note: "Higher is better" },
  ] : [];

  const aWins = METRICS.filter(m => m.winA).length;
  const bWins = METRICS.filter(m => m.winB).length;
  const winner = a && b ? (aWins > bWins ? a : bWins > aWins ? b : null) : null;

  return (
    <div className="ndb-root">
      <aside className="ndb-sidebar">
        <div className="ndb-logo" onClick={() => navigate("/dashboard")}><span>🏠</span> PropVista</div>
        <nav className="ndb-nav">
          {sideLinks.map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => "ndb-link" + (isActive ? " ndb-active" : "")}>
              <span>{l.icon}</span> {l.label}
            </NavLink>
          ))}
          <button className="ndb-link ndb-link-danger" onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.href = "/"; }}>
            <span>⎋</span> Logout
          </button>
        </nav>
      </aside>

      <div className="ndb-main">
        <div className="cmp2-page">
          <div className="cmp2-header">
            <div>
              <h1 className="cmp2-title">⚖️ Compare Properties</h1>
              <p className="cmp2-sub">Select two properties to see a detailed side-by-side comparison</p>
            </div>
            <Notifications />
          </div>

          {/* SEARCH + SELECTORS */}
          <div className="cmp2-search-bar">
            <span>🔍</span>
            <input className="cmp2-search-input" placeholder="Search by title or location..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="cmp2-selectors">
            <div className="cmp2-selector">
              <p className="cmp2-selector-label">Property A</p>
              <select className="cmp2-sel" value={selA} onChange={e => setSelA(e.target.value)}>
                <option value="">— Choose Property A —</option>
                {filtered.map(p => <option key={p._id} value={p._id}>{p.title} — {p.location?.split(",")[0]}</option>)}
              </select>
            </div>
            <div className="cmp2-vs-badge">VS</div>
            <div className="cmp2-selector">
              <p className="cmp2-selector-label">Property B</p>
              <select className="cmp2-sel" value={selB} onChange={e => setSelB(e.target.value)}>
                <option value="">— Choose Property B —</option>
                {filtered.map(p => <option key={p._id} value={p._id}>{p.title} — {p.location?.split(",")[0]}</option>)}
              </select>
            </div>
          </div>

          {a && b && selA !== selB ? (
            <div className="cmp2-result">
              {/* Property cards */}
              <div className="cmp2-cards-row">
                <div className={`cmp2-prop-card ${winner?._id === a._id ? "winner" : ""}`}>
                  {winner?._id === a._id && <div className="cmp2-winner-ribbon">🏆 Best Deal</div>}
                  <img src={a.image || TYPE_IMGS[a.type] || TYPE_IMGS.Apartment} alt={a.title} className="cmp2-prop-img" />
                  <p className="cmp2-prop-name">{a.title}</p>
                  <p className="cmp2-prop-loc">📍 {a.location}</p>
                  <p className="cmp2-prop-price">₹ {(a.price/100000).toFixed(1)} Lakh</p>
                  <div className="cmp2-score-row">
                    <span className="cmp2-score-badge">{aWins} wins</span>
                    <span className="cmp2-invest-score">Score: {score(a)}/100</span>
                  </div>
                  <button className="cmp2-view-btn" onClick={() => navigate(`/properties/${a._id}`)}>View Details →</button>
                </div>

                <div className="cmp2-mid">
                  <div className="cmp2-big-vs">VS</div>
                  {winner ? (
                    <div className="cmp2-verdict">
                      <p className="cmp2-verdict-lbl">Winner</p>
                      <p className="cmp2-verdict-name">{winner.title}</p>
                      <p className="cmp2-verdict-note">Wins {Math.max(aWins,bWins)} of {METRICS.filter(m=>m.winA||m.winB).length} criteria</p>
                    </div>
                  ) : <p className="cmp2-tie">🤝 Tie!</p>}
                </div>

                <div className={`cmp2-prop-card ${winner?._id === b._id ? "winner" : ""}`}>
                  {winner?._id === b._id && <div className="cmp2-winner-ribbon">🏆 Best Deal</div>}
                  <img src={b.image || TYPE_IMGS[b.type] || TYPE_IMGS.Apartment} alt={b.title} className="cmp2-prop-img" />
                  <p className="cmp2-prop-name">{b.title}</p>
                  <p className="cmp2-prop-loc">📍 {b.location}</p>
                  <p className="cmp2-prop-price">₹ {(b.price/100000).toFixed(1)} Lakh</p>
                  <div className="cmp2-score-row">
                    <span className="cmp2-score-badge">{bWins} wins</span>
                    <span className="cmp2-invest-score">Score: {score(b)}/100</span>
                  </div>
                  <button className="cmp2-view-btn" onClick={() => navigate(`/properties/${b._id}`)}>View Details →</button>
                </div>
              </div>

              {/* Comparison table */}
              <div className="cmp2-table">
                <div className="cmp2-table-head">
                  <span className="cmp2-th-a">{a.title.split(" ").slice(0,3).join(" ")}</span>
                  <span className="cmp2-th-mid">Metric</span>
                  <span className="cmp2-th-b">{b.title.split(" ").slice(0,3).join(" ")}</span>
                </div>
                {METRICS.map(m => (
                  <div key={m.label} className="cmp2-table-row">
                    <span className={`cmp2-cell a ${m.winA ? "win" : ""}`}>
                      {m.winA && <span className="cmp2-tick">✓</span>}
                      {m.aVal}
                    </span>
                    <span className="cmp2-cell-mid">
                      <span className="cmp2-metric-icon">{m.icon}</span>
                      <span className="cmp2-metric-name">{m.label}</span>
                      {m.note && <span className="cmp2-note">{m.note}</span>}
                    </span>
                    <span className={`cmp2-cell b ${m.winB ? "win" : ""}`}>
                      {m.bVal}
                      {m.winB && <span className="cmp2-tick">✓</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="cmp2-empty">
              <span className="cmp2-empty-icon">⚖️</span>
              <p className="cmp2-empty-title">Select two properties above to compare</p>
              <p className="cmp2-empty-sub">We'll show you a detailed breakdown across price, area, value and more</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
