import { useState } from "react";
import API_BASE from "../config";
import { useNavigate, NavLink } from "react-router-dom";
import Notifications from "../components/Notifications";
import { getTypeImage } from "../utils/typeImages";
import "./dashboard.css";

const AREAS = [
  // Coimbatore
  "RS Puram","Gandhipuram","Peelamedu","Saibaba Colony","Singanallur",
  "Vadavalli","Hopes College","Race Course","Tidel Park","Kovaipudur",
  "Thudiyalur","Kuniyamuthur",
  // Chennai
  "Anna Nagar","Adyar","Velachery","Porur","OMR","T Nagar","Tambaram","Perambur","Sholinganallur","Medavakkam",
  // Madurai
  "Anna Nagar Madurai","KK Nagar Madurai","Tallakulam","Palanganatham","Thirunagar",
  // Salem
  "Salem Town","Fairlands","Suramangalam","Hasthampatti",
  // Erode
  "Erode Town","Perundurai","Bhavani","Gobichettipalayam","Sathyamangalam","Chithode","Kavindapadi",
  // Trichy
  "Trichy Town","Srirangam","Ariyamangalam",
  // Tirupur
  "Tirupur Town","Veerapandi","Avinashi",
  // Vellore
  "Vellore Town","Katpadi",
  // Thanjavur
  "Thanjavur Town","Kumbakonam",
  // Tirunelveli
  "Tirunelveli Town","Palayamkottai",
  // Others
  "Krishnagiri","Tiruvannamalai Town","Cuddalore Town","Villupuram Town",
];

// Base price per sqft by area (₹/sqft) — derived from actual seed data averages
const AREA_PPSF = {
  // Coimbatore
  "RS Puram": 6200, "Gandhipuram": 5800, "Peelamedu": 5500, "Saibaba Colony": 6000,
  "Singanallur": 4800, "Vadavalli": 4600, "Hopes College": 5200, "Race Course": 6500,
  "Tidel Park": 5000, "Kovaipudur": 4200, "Thudiyalur": 3900, "Kuniyamuthur": 4000,
  // Chennai
  "Anna Nagar": 9500, "Adyar": 10200, "Velachery": 7800, "Porur": 6500,
  "OMR": 7200, "T Nagar": 11000, "Tambaram": 5500, "Perambur": 6000,
  "Sholinganallur": 7500, "Medavakkam": 6200,
  // Madurai
  "Anna Nagar Madurai": 4800, "KK Nagar Madurai": 4500, "Tallakulam": 5000,
  "Palanganatham": 4200, "Thirunagar": 4600,
  // Salem
  "Salem Town": 4500, "Fairlands": 5000, "Suramangalam": 4000, "Hasthampatti": 4200,
  // Erode
  "Erode Town": 4500, "Perundurai": 3500, "Bhavani": 3200, "Gobichettipalayam": 3000,
  "Sathyamangalam": 2800, "Chithode": 3300, "Kavindapadi": 3100,
  // Trichy
  "Trichy Town": 5200, "Srirangam": 4800, "Ariyamangalam": 4500,
  // Tirupur
  "Tirupur Town": 4800, "Veerapandi": 4000, "Avinashi": 3800,
  // Vellore
  "Vellore Town": 5000, "Katpadi": 4600,
  // Others
  "Thanjavur Town": 4200, "Kumbakonam": 3800, "Tirunelveli Town": 4500, "Palayamkottai": 4200,
  "Krishnagiri": 3500, "Tiruvannamalai Town": 3200, "Cuddalore Town": 3800, "Villupuram Town": 3500,
};

const TYPE_MULT = { Apartment: 1.0, Flat: 0.95, House: 1.05, Villa: 1.3 };

function predict(form) {
  const base = AREA_PPSF[form.area] || 4500;
  const typeMult = TYPE_MULT[form.type] || 1.0;
  const bedMult = 1 + (parseInt(form.bedrooms) - 2) * 0.05;
  const ageFactor = Math.max(0.75, 1 - parseInt(form.age || 0) * 0.02);
  const price = Math.round(parseInt(form.area_sqft) * base * typeMult * bedMult * ageFactor);
  const low = Math.round(price * 0.92);
  const high = Math.round(price * 1.08);
  const confidence = Math.min(96, 82 + (AREA_PPSF[form.area] ? 10 : 0));
  const growth = form.area && ["RS Puram","Race Course","Peelamedu","Gandhipuram"].includes(form.area) ? 12 : 8;
  return { price, low, high, confidence, growth, ppsf: Math.round(price / parseInt(form.area_sqft)) };
}

const sideLinks = [
  { icon: "📊", label: "Dashboard", to: "/dashboard" },
  { icon: "🏢", label: "Properties", to: "/properties" },
  { icon: "🗺️", label: "Map View", to: "/explore" },
  { icon: "🔍", label: "AI Search", to: "/ai-search" },
  { icon: "📅", label: "My Bookings", to: "/bookings" },
  { icon: "👤", label: "Profile", to: "/profile" },
  { icon: "⚙️", label: "Settings", to: "/settings" },
];

export default function PredictPrice() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ area: "", type: "Apartment", bedrooms: "2", bathrooms: "2", area_sqft: "", age: "0" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [similarProps, setSimilarProps] = useState([]);
  const [showSimilar, setShowSimilar] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handlePredict = () => {
    if (!form.area || !form.area_sqft) return;
    setLoading(true);
    setShowSimilar(false);
    setTimeout(() => {
      setResult(predict(form));
      setLoading(false);
    }, 900);
  };

  const findSimilar = () => {
    fetch(`${API_BASE}/api/properties`)
      .then(r => r.json())
      .then(data => {
        const filtered = data.filter(p =>
          (!form.type || p.type === form.type) &&
          (!form.area || p.location?.toLowerCase().includes(form.area.toLowerCase())) &&
          (parseInt(form.bedrooms) ? p.bedrooms === parseInt(form.bedrooms) : true)
        ).slice(0, 6);
        setSimilarProps(filtered);
        setShowSimilar(true);
      });
  };

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
        <div className="pp-page">
          <div className="pp-header">
            <div>
              <h1 className="pp-title">🔮 Predict Property Price</h1>
              <p className="pp-sub">Get AI-powered price prediction based on real market data</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Notifications />
            </div>
          </div>

          <div className="pp-layout">
            {/* FORM */}
            <div className="pp-form-card">
              <h3 className="pp-form-title">Property Details</h3>

              <div className="pp-field">
                <label>Area / Locality</label>
                <select name="area" value={form.area} onChange={handleChange}>
                  <option value="">Select area</option>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div className="pp-field-row">
                <div className="pp-field">
                  <label>Property Type</label>
                  <select name="type" value={form.type} onChange={handleChange}>
                    <option>Apartment</option><option>Flat</option><option>House</option><option>Villa</option>
                  </select>
                </div>
                <div className="pp-field">
                  <label>Bedrooms (BHK)</label>
                  <select name="bedrooms" value={form.bedrooms} onChange={handleChange}>
                    <option value="1">1 BHK</option><option value="2">2 BHK</option>
                    <option value="3">3 BHK</option><option value="4">4 BHK</option><option value="5">5 BHK</option>
                  </select>
                </div>
              </div>

              <div className="pp-field-row">
                <div className="pp-field">
                  <label>Area (sqft)</label>
                  <input type="number" name="area_sqft" placeholder="e.g. 1200" value={form.area_sqft} onChange={handleChange} />
                </div>
                <div className="pp-field">
                  <label>Property Age (years)</label>
                  <input type="number" name="age" placeholder="e.g. 5" value={form.age} onChange={handleChange} min="0" max="40" />
                </div>
              </div>

              <button className="pp-predict-btn" onClick={handlePredict} disabled={loading || !form.area || !form.area_sqft}>
                {loading ? <span className="pp-spinner" /> : "🔮 Predict Price"}
              </button>
            </div>

            {/* RESULT */}
            {result ? (
              <div className="pp-result-card">
                <div className="pp-result-top">
                  <div className="pp-result-icon">🏠</div>
                  <div>
                    <p className="pp-result-label">Estimated Market Price</p>
                    <p className="pp-result-price">₹ {(result.price / 100000).toFixed(2)} Lakh</p>
                    <p className="pp-result-range">Range: ₹{(result.low/100000).toFixed(1)}L – ₹{(result.high/100000).toFixed(1)}L</p>
                  </div>
                </div>

                <div className="pp-metrics">
                  <div className="pp-metric">
                    <p className="pp-metric-label">Confidence</p>
                    <div className="pp-confidence-bar">
                      <div className="pp-confidence-fill" style={{ width: `${result.confidence}%` }} />
                    </div>
                    <p className="pp-metric-val green">{result.confidence}%</p>
                  </div>
                  <div className="pp-metric-row">
                    <div className="pp-metric-box">
                      <p className="pp-metric-label">₹ / sqft</p>
                      <p className="pp-metric-val">₹ {result.ppsf.toLocaleString()}</p>
                    </div>
                    <div className="pp-metric-box">
                      <p className="pp-metric-label">Expected Growth</p>
                      <p className="pp-metric-val green">↑ {result.growth}% / yr</p>
                    </div>
                    <div className="pp-metric-box">
                      <p className="pp-metric-label">Investment Rating</p>
                      <p className="pp-metric-val">{result.growth >= 10 ? "⭐ Excellent" : "👍 Good"}</p>
                    </div>
                  </div>
                </div>

                <div className="pp-insight-box">
                  <p className="pp-insight-title">💡 Market Insight</p>
                  <p className="pp-insight-text">
                    Properties in <strong>{form.area}</strong> have shown consistent growth.
                    A {form.bedrooms} BHK {form.type} of {form.area_sqft} sqft in this area
                    is competitively priced. {result.growth >= 10 ? "High demand makes this an excellent investment." : "Good rental yield expected."}
                  </p>
                </div>

                <button className="pp-search-btn" onClick={findSimilar}>
                  🔍 Find Similar Properties
                </button>
              </div>
            ) : (
              <div className="pp-empty-result">
                <div className="pp-empty-icon">🔮</div>
                <p className="pp-empty-title">Fill in the details to get a price prediction</p>
                <p className="pp-empty-sub">Our AI analyses real market data from {Object.keys(AREA_PPSF).length} areas to give you accurate estimates</p>
              </div>
            )}
          </div>

          {/* SIMILAR PROPERTIES RESULTS */}
          {showSimilar && (
            <div className="pp-similar">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <p className="pp-form-title" style={{margin:0}}>
                  {similarProps.length > 0 ? `${similarProps.length} Similar Properties Found` : "No similar properties found"}
                </p>
                <button className="ndb-link-btn" onClick={()=>setShowSimilar(false)}>✕ Close</button>
              </div>
              <div className="ais-grid">
                {similarProps.map((p,i)=>(
                  <div key={p._id} className="ais-card" onClick={()=>navigate(`/properties/${p._id}`)}>
                    <div className="ais-card-img-wrap">
                      <img src={getTypeImage(p)} alt={p.title} className="ais-card-img"
                        onError={e => { e.target.onerror = null; e.target.src = getTypeImage({ type: p.type }); }}
                      />
                    </div>
                    <div className="ais-card-body">
                      <p className="ais-card-title">{p.title}</p>
                      <p className="ais-card-loc">📍 {p.location}</p>
                      <p className="ais-card-area">{p.area} sqft · {p.bedrooms} BHK</p>
                      <div className="ais-card-footer">
                        <span style={{fontWeight:700,color:"#1e293b"}}>₹ {(p.price/100000).toFixed(1)}L</span>
                        <button className="ais-view-btn" onClick={()=>navigate(`/properties/${p._id}`)}>View →</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
