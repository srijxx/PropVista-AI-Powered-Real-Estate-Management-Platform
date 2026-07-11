import { useState } from "react";
import API_BASE from '../config';
import { useNavigate, NavLink } from "react-router-dom";
import Notifications from "../components/Notifications";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import "./dashboard.css";

const sideLinks = [
  { icon: "📊", label: "Dashboard", to: "/dashboard" },
  { icon: "🏢", label: "Properties", to: "/properties" },
  { icon: "🗺️", label: "Map View", to: "/explore" },
  { icon: "🔍", label: "AI Search", to: "/ai-search" },
  { icon: "📅", label: "My Bookings", to: "/bookings" },
  { icon: "➕", label: "Add Property", to: "/add-property" },
  { icon: "👤", label: "Profile", to: "/profile" },
  { icon: "⚙️", label: "Settings", to: "/settings" },
];

function calcEMI(principal, rate, tenure) {
  const r = rate / 100 / 12;
  const n = tenure * 12;
  if (r === 0) return principal / n;
  return Math.round(principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
}

const PRESETS = [
  { label: "₹30L Budget", price: 3000000 },
  { label: "₹50L Budget", price: 5000000 },
  { label: "₹75L Budget", price: 7500000 },
  { label: "₹1Cr Budget", price: 10000000 },
];

export default function EMICalculator() {
  const navigate = useNavigate();
  const [price, setPrice] = useState(5000000);
  const [down, setDown] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [budgetProps, setBudgetProps] = useState([]);
  const [showBudget, setShowBudget] = useState(false);

  const loan = Math.round(price * (1 - down / 100));
  const emi = calcEMI(loan, rate, tenure);
  const totalPayment = emi * tenure * 12;
  const totalInterest = totalPayment - loan;

  const pieData = [
    { name: "Principal", value: loan },
    { name: "Interest", value: totalInterest },
  ];
  const PIE_COLORS = ["#6366f1", "#f97316"];

  const findInBudget = () => {
    fetch(`${API_BASE}/api/properties`)
      .then(r => r.json())
      .then(data => {
        const filtered = data.filter(p => p.price && p.price <= price).slice(0, 6);
        setBudgetProps(filtered);
        setShowBudget(true);
      });
  };

  const fmt = v => `₹ ${(v / 100000).toFixed(1)}L`;

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
        <div className="emi-page">
          <div className="emi-header">
            <div>
              <h1 className="emi-title">🧮 EMI Calculator</h1>
              <p className="emi-sub">Plan your home loan with accurate EMI breakdown</p>
            </div>
            <Notifications />
          </div>

          {/* PRESETS */}
          <div className="emi-presets">
            {PRESETS.map(p => (
              <button key={p.label} className={`emi-preset-btn ${price === p.price ? "active" : ""}`}
                onClick={() => setPrice(p.price)}>{p.label}</button>
            ))}
          </div>

          <div className="emi-layout">
            {/* SLIDERS */}
            <div className="emi-form-card">
              <div className="emi-slider-group">
                <div className="emi-slider-head">
                  <span>Property Price</span>
                  <span className="emi-slider-val">₹ {(price / 100000).toFixed(0)}L</span>
                </div>
                <input type="range" min={500000} max={20000000} step={100000}
                  value={price} onChange={e => setPrice(Number(e.target.value))} className="emi-slider" />
                <div className="emi-slider-ticks"><span>₹5L</span><span>₹1Cr</span><span>₹2Cr</span></div>
              </div>

              <div className="emi-slider-group">
                <div className="emi-slider-head">
                  <span>Down Payment</span>
                  <span className="emi-slider-val">{down}% (₹{(price * down / 100 / 100000).toFixed(1)}L)</span>
                </div>
                <input type="range" min={10} max={50} step={5}
                  value={down} onChange={e => setDown(Number(e.target.value))} className="emi-slider" />
                <div className="emi-slider-ticks"><span>10%</span><span>30%</span><span>50%</span></div>
              </div>

              <div className="emi-slider-group">
                <div className="emi-slider-head">
                  <span>Interest Rate (p.a.)</span>
                  <span className="emi-slider-val">{rate}%</span>
                </div>
                <input type="range" min={6} max={14} step={0.1}
                  value={rate} onChange={e => setRate(Number(e.target.value))} className="emi-slider" />
                <div className="emi-slider-ticks"><span>6%</span><span>10%</span><span>14%</span></div>
              </div>

              <div className="emi-slider-group">
                <div className="emi-slider-head">
                  <span>Loan Tenure</span>
                  <span className="emi-slider-val">{tenure} years</span>
                </div>
                <input type="range" min={5} max={30} step={1}
                  value={tenure} onChange={e => setTenure(Number(e.target.value))} className="emi-slider" />
                <div className="emi-slider-ticks"><span>5 yr</span><span>15 yr</span><span>30 yr</span></div>
              </div>
            </div>

            {/* RESULTS */}
            <div className="emi-result-panel">
              {/* EMI highlight */}
              <div className="emi-monthly-card">
                <p className="emi-monthly-label">Monthly EMI</p>
                <p className="emi-monthly-val">₹ {emi.toLocaleString("en-IN")}</p>
                <p className="emi-monthly-sub">for {tenure} years at {rate}% p.a.</p>
              </div>

              {/* Breakdown grid */}
              <div className="emi-breakdown">
                <div className="emi-bk-item">
                  <p className="emi-bk-label">Loan Amount</p>
                  <p className="emi-bk-val">{fmt(loan)}</p>
                </div>
                <div className="emi-bk-item">
                  <p className="emi-bk-label">Total Interest</p>
                  <p className="emi-bk-val orange">{fmt(totalInterest)}</p>
                </div>
                <div className="emi-bk-item">
                  <p className="emi-bk-label">Down Payment</p>
                  <p className="emi-bk-val">{fmt(price * down / 100)}</p>
                </div>
                <div className="emi-bk-item">
                  <p className="emi-bk-label">Total Payment</p>
                  <p className="emi-bk-val">{fmt(totalPayment)}</p>
                </div>
              </div>

              {/* Pie chart */}
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                    dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={v => `₹ ${(v / 100000).toFixed(1)}L`} />
                </PieChart>
              </ResponsiveContainer>

              <div className="emi-legend">
                {pieData.map((d, i) => (
                  <div key={d.name} className="emi-legend-item">
                    <span className="emi-legend-dot" style={{ background: PIE_COLORS[i] }} />
                    <span>{d.name}: {fmt(d.value)}</span>
                  </div>
                ))}
              </div>

              <button className="emi-explore-btn" onClick={findInBudget}>
                🔍 Find Properties in Budget (under ₹{(price/100000).toFixed(0)}L)
              </button>
            </div>
          </div>

          {/* BUDGET RESULTS */}
          {showBudget && (
            <div style={{background:"#fff",borderRadius:16,padding:20,marginTop:20,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <p style={{fontSize:15,fontWeight:700,color:"#1e293b",margin:0}}>
                  {budgetProps.length > 0 ? `${budgetProps.length} Properties under ₹${(price/100000).toFixed(0)}L` : "No properties found in this budget"}
                </p>
                <button className="ndb-link-btn" onClick={()=>setShowBudget(false)}>✕ Close</button>
              </div>
              <div className="ais-grid">
                {budgetProps.map(p=>(
                  <div key={p._id} className="ais-card" onClick={()=>navigate(`/properties/${p._id}`)}>
                    <div className="ais-card-img-wrap">
                      <img src={p.image||"https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=260&fit=crop"} alt={p.title} className="ais-card-img"/>
                    </div>
                    <div className="ais-card-body">
                      <p className="ais-card-title">{p.title}</p>
                      <p className="ais-card-loc">📍 {p.location}</p>
                      <p className="ais-card-area">{p.bedrooms}BHK · {p.area} sqft</p>
                      <div className="ais-card-footer">
                        <span style={{fontWeight:800,color:"#1e293b"}}>₹ {(p.price/100000).toFixed(1)}L</span>
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
