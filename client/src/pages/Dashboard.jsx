import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import CountUp from "react-countup";
import "./dashboard.css";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, AreaChart, Area, ComposedChart, Bar, CartesianGrid, Cell, LabelList, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import AIAssistant from "../components/AIAssistant";
import Notifications from "../components/Notifications";

// helpers
const TYPE_IMGS = {
  Apartment: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&h=200&fit=crop","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=200&fit=crop","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&h=200&fit=crop"],
  House: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=300&h=200&fit=crop","https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=300&h=200&fit=crop","https://images.unsplash.com/photo-1577495508048-b635879837f1?w=300&h=200&fit=crop"],
  Villa: ["https://images.unsplash.com/photo-1613977257363-707ba9348227?w=300&h=200&fit=crop","https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=200&fit=crop","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&h=200&fit=crop"],
  Flat: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&h=200&fit=crop","https://images.unsplash.com/photo-1484154218962-a197022b5858?w=300&h=200&fit=crop","https://images.unsplash.com/photo-1554995207-c18c203602cb?w=300&h=200&fit=crop"],
};
function getTypeImg(p) {
  const imgs = TYPE_IMGS[p.type] || TYPE_IMGS.Apartment;
  return imgs[parseInt((p._id||"0").slice(-4),16) % imgs.length];
}
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
function getRecentlyViewed() {
  try { return JSON.parse(localStorage.getItem("recentlyViewed")||"[]"); } catch { return []; }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, forSale: 0, forRent: 0, latest: null });
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState("");
  const [heroResults, setHeroResults] = useState(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [selectedCity, setSelectedCity] = useState("Coimbatore");

  const SLIDES = [
    { img: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=420&h=240&fit=crop", label: "Luxury Villa" },
    { img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=420&h=240&fit=crop", label: "Modern House" },
    { img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=420&h=240&fit=crop", label: "Premium Villa" },
    { img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=420&h=240&fit=crop", label: "City Apartment" },
  ];

  useEffect(() => {
    const t = setInterval(() => setSlideIdx(i => (i + 1) % SLIDES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const userName = localStorage.getItem("userName") || "User";
  const initial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    fetch("http://localhost:5000/api/properties/stats/summary")
      .then(r=>r.json()).then(d=>{setStats(d);setLoading(false);}).catch(()=>setLoading(false));
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/properties")
      .then(r=>r.json()).then(setAllProperties).catch(console.error);
  }, []);

  const doHeroSearch = (q) => {
    const query = (q || heroSearch).toLowerCase().trim();
    if (!query) return;
    const results = allProperties.filter(p =>
      p.title?.toLowerCase().includes(query) ||
      p.location?.toLowerCase().includes(query) ||
      p.type?.toLowerCase().includes(query) ||
      p.status?.toLowerCase().includes(query) ||
      String(p.bedrooms).includes(query)
    ).slice(0, 6);
    setHeroResults(results);
  };

  // derived
  const avgPrice = allProperties.length ? Math.round(allProperties.reduce((s,p)=>s+(p.price||0),0)/allProperties.length) : 0;
  const savedCount = (()=>{try{return JSON.parse(localStorage.getItem("savedProperties")||"[]").length;}catch{return 0;}})();
  const newThisWeek = allProperties.filter(p=>p.createdAt&&(Date.now()-new Date(p.createdAt))<7*24*60*60*1000).length;

  // area popularity — filtered by selectedCity
  const areaMap = {};
  allProperties
    .filter(p => !selectedCity || p.location?.toLowerCase().includes(selectedCity.toLowerCase()))
    .forEach(p=>{
      if(!p.location) return;
      const area = p.location.split(",")[0].trim();
      if(!areaMap[area]) areaMap[area]={count:0,total:0};
      areaMap[area].count++; areaMap[area].total+=p.price||0;
    });
  const popularAreas = Object.entries(areaMap)
    .map(([area,d])=>({area,count:d.count,avg:Math.round(d.total/d.count)}))
    .sort((a,b)=>b.count-a.count).slice(0,5);
  const maxAreaCount = popularAreas[0]?.count||1;

  // monthly price trend — filtered by selectedCity
  const monthlyTrend = (()=>{
    const map={};
    allProperties
      .filter(p => !selectedCity || p.location?.toLowerCase().includes(selectedCity.toLowerCase()))
      .forEach(p=>{
        if(!p.createdAt||!p.price) return;
        const key=new Date(p.createdAt).toLocaleString("default",{month:"short"});
        if(!map[key]) map[key]={total:0,count:0};
        map[key].total+=p.price; map[key].count++;
      });
    return Object.entries(map).slice(-6).map(([m,d])=>({m,avg:Math.round(d.total/d.count/100000)}));
  })();

  const priceTrendPct = monthlyTrend.length>1
    ? Math.round(((monthlyTrend.at(-1)?.avg||0)-(monthlyTrend[0]?.avg||0))/(monthlyTrend[0]?.avg||1)*100)
    : 8.6;
  const latestAvgL = monthlyTrend.at(-1)?.avg || Math.round(avgPrice/100000);

  const investScore = Math.min(99, Math.round(60 + (popularAreas[0]?.count||0)));

  // Get unique cities from DB
  const availableCities = [...new Set(
    allProperties.map(p => p.location?.split(",")[1]?.trim()).filter(Boolean)
  )].sort();

  const sideLinks = [
    {icon:"📊",label:"Dashboard",to:"/dashboard"},
    {icon:"🏢",label:"Properties",to:"/properties"},
    {icon:"🗺️",label:"Map View",to:"/explore"},
    {icon:"🔍",label:"AI Search",to:"/ai-search"},
    {icon:"📅",label:"My Bookings",to:"/bookings"},
    {icon:"👤",label:"Profile",to:"/profile"},
    {icon:"⚙️",label:"Settings",to:"/settings"},
    {icon:"⎋",label:"Logout",to:"/",logout:true},
  ];

  return (
    <div className="ndb-root">

      {/* ── SIDEBAR ── */}
      <aside className="ndb-sidebar">
        <div className="ndb-logo" onClick={()=>navigate("/dashboard")}>
          <span>🏠</span> PropVista
        </div>
        <nav className="ndb-nav">
          {sideLinks.map(l=>
            l.logout
              ? <button key="logout" className="ndb-link ndb-link-danger"
                  onClick={()=>{localStorage.clear();sessionStorage.clear();window.location.href="/";}}>
                  <span>{l.icon}</span> {l.label}
                </button>
              : <NavLink key={l.to+l.label} to={l.to}
                  className={({isActive})=>"ndb-link"+(isActive&&l.label==="Dashboard"?" ndb-active":"")}
                  end={l.label==="Dashboard"}>
                  <span>{l.icon}</span> {l.label}
                </NavLink>
          )}
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <div className="ndb-main">

        {/* HEADER BAR */}
        <div className="ndb-header">
          <div>
            <h1 className="ndb-greeting">{getGreeting()},  {userName} 👋</h1>
            <p className="ndb-header-sub">Here's what's happening in the real estate market today.</p>
          </div>
          <div className="ndb-header-right">
            <Notifications />
          </div>
        </div>

        {/* 3-COLUMN GRID */}
        <div className="ndb-grid">

          {/* ── CENTER COLUMN ── */}
          <div className="ndb-center">

            {/* HERO BANNER */}
            <div className="ndb-hero">
              <div className="ndb-hero-left">
                <h2 className="ndb-hero-h">Find your dream property</h2>
                <p className="ndb-hero-p">Search smarter with AI. Get personalized results.</p>
                <div className="ndb-hero-search">
                  <span className="ndb-hero-search-icon">🔍</span>
                  <input className="ndb-hero-input"
                    placeholder="Search by location, property type or keyword..."
                    value={heroSearch}
                    onChange={e=>{setHeroSearch(e.target.value); if(!e.target.value) setHeroResults(null);}}
                    onKeyDown={e=>{ if(e.key==="Enter") doHeroSearch(); }} />
                  <button className="ndb-hero-btn" onClick={()=>doHeroSearch()}>Search</button>
                </div>
              </div>

              {/* SLIDESHOW */}
              <div className="ndb-hero-slideshow">
                {SLIDES.map((s, i) => (
                  <img key={i} src={s.img} alt={s.label}
                    className={`ndb-slide-img ${i === slideIdx ? "active" : ""}`} />
                ))}
                <div className="ndb-slide-label">{SLIDES[slideIdx].label}</div>
                <div className="ndb-slide-dots">
                  {SLIDES.map((_, i) => (
                    <button key={i} className={`ndb-dot ${i === slideIdx ? "active" : ""}`}
                      onClick={() => setSlideIdx(i)} />
                  ))}
                </div>
              </div>
            </div>

            {/* HERO SEARCH RESULTS */}
            {heroResults !== null && (
              <div className="ndb-card" style={{padding:"16px"}}>
                <div className="ndb-card-head" style={{marginBottom:heroResults.length?12:0}}>
                  <p className="ndb-card-title">
                    {heroResults.length > 0 ? `Found ${heroResults.length} properties` : "No properties found"}
                    {heroSearch && <span style={{fontSize:12,color:"#9ca3af",marginLeft:6}}>for "{heroSearch}"</span>}
                  </p>
                  <button className="ndb-link-btn" onClick={()=>{setHeroResults(null);setHeroSearch("");}}>✕ Clear</button>
                </div>
                {heroResults.length > 0 && (
                  <div className="ndb-rec-row">
                    {heroResults.map(p=>(
                      <div key={p._id} className="ndb-rec-card" onClick={()=>navigate(`/properties/${p._id}`)}>
                        <div className="ndb-rec-img-box">
                          <img src={p.image||getTypeImg(p)} alt={p.title} className="ndb-rec-img"/>
                          <span className={`ndb-match ${p.status==="For Sale"?"":"rent"}`}>{p.status}</span>
                        </div>
                        <div className="ndb-rec-body">
                          <p className="ndb-rec-name">{p.title}</p>
                          <p className="ndb-rec-loc">📍 {p.location}</p>
                          <p className="ndb-rec-price">₹ {(p.price/100000).toFixed(1)} Lakh</p>
                          <p className="ndb-rec-meta">{p.bedrooms}BHK · {p.area} sqft</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STAT CARDS */}
            <div className="ndb-stats">
              <div className="ndb-stat">
                <div className="ndb-stat-icon-wrap" style={{background:"#eef2ff"}}>🏠</div>
                <div>
                  <p className="ndb-stat-lbl">Total Properties</p>
                  <p className="ndb-stat-val">{loading?"—":<CountUp end={stats.total} duration={1.5} separator=","/>}</p>
                  <p className="ndb-stat-trend up">↑ 12% from last month</p>
                </div>
              </div>
              <div className="ndb-stat">
                <div className="ndb-stat-icon-wrap" style={{background:"#f0fdf4"}}>✏️</div>
                <div>
                  <p className="ndb-stat-lbl">New Listings</p>
                  <p className="ndb-stat-val"><CountUp end={newThisWeek} duration={1.5}/></p>
                  <p className="ndb-stat-trend up">↑ 18% from last week</p>
                </div>
              </div>
              <div className="ndb-stat">
                <div className="ndb-stat-icon-wrap" style={{background:"#fefce8"}}>₹</div>
                <div>
                  <p className="ndb-stat-lbl">Average Price</p>
                  <p className="ndb-stat-val">₹ {(avgPrice/100000).toFixed(1)} Lakh</p>
                  <p className="ndb-stat-trend up">↑ 5% from last month</p>
                </div>
              </div>
              <div className="ndb-stat" style={{cursor:"default"}}>
                <div className="ndb-stat-icon-wrap" style={{background:"#fff1f2"}}>❤️</div>
                <div>
                  <p className="ndb-stat-lbl">Saved Properties</p>
                  <p className="ndb-stat-val"><CountUp end={savedCount} duration={1.5}/></p>
                  <p className="ndb-stat-trend up">In your wishlist</p>
                </div>
              </div>
            </div>

            {/* MARKET INSIGHTS + INVESTMENT SCORE */}
            <div className="ndb-insights-row">
              {/* MARKET INSIGHTS */}
              <div className="ndb-card ndb-market-card">
                <div className="ndb-card-head">
                  <span className="ndb-card-title">Market Insights <span style={{fontSize:13,color:"#9ca3af"}}>ⓘ</span></span>
                  <select className="ndb-sel" value={selectedCity} onChange={e=>setSelectedCity(e.target.value)}>
                    <option value="">All Cities</option>
                    {availableCities.slice(0, 15).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="ndb-market-body">

                  {/* LEFT: Composed Chart - Area + Line */}
                  <div className="ndb-market-left">
                    <div className="ndb-trend-subcard">
                      <p className="ndb-mkt-head">Price Trend (Last 6 Months)</p>
                      <div className="ndb-mkt-kpi-row">
                        <div>
                          <p className="ndb-mkt-pct">↑ {priceTrendPct}%</p>
                          <p className="ndb-mkt-sub">Average price increase</p>
                        </div>
                        <div className="ndb-mkt-badge">
                          <span>₹ {latestAvgL}L</span>
                          <span className="ndb-mkt-badge-label">Latest Avg</span>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={160}>
                        <ComposedChart data={monthlyTrend} margin={{top:8,right:4,bottom:0,left:0}}>
                          <defs>
                            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3}/>
                              <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
                          <XAxis dataKey="m" tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
                          <YAxis tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false}
                            tickFormatter={v=>`${v}L`} width={34}/>
                          <Tooltip
                            contentStyle={{background:"#fff",border:"none",borderRadius:10,
                              boxShadow:"0 4px 16px rgba(0,0,0,0.12)",fontSize:13,fontWeight:700}}
                            formatter={v=>[`₹ ${v}L`,"Avg Price"]}/>
                          <Area type="monotone" dataKey="avg" fill="url(#trendFill)" stroke="none"/>
                          <Line type="monotone" dataKey="avg" stroke="#4f46e5" strokeWidth={2.5}
                            dot={{fill:"#4f46e5",r:4,strokeWidth:2,stroke:"#fff"}}
                            activeDot={{r:6,fill:"#4f46e5",strokeWidth:2,stroke:"#fff"}}/>
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* RIGHT: Horizontal bar chart — clean & professional */}
                  <div className="ndb-market-right">
                    <p className="ndb-mkt-head" style={{marginBottom:12}}>Popular Localities</p>
                    <div className="ndb-locality-list">
                      {popularAreas.map((a, i) => (
                        <div key={a.area} className="ndb-locality-item">
                          <div className="ndb-loc-info">
                            <span className="ndb-loc-rank">#{i+1}</span>
                            <span className="ndb-loc-name">{a.area}</span>
                          </div>
                          <div className="ndb-loc-bar-track">
                            <div className="ndb-loc-bar-fill"
                              style={{width:`${Math.round((a.count/maxAreaCount)*100)}%`,
                                background: `hsl(${240 - i*20},70%,${55+i*3}%)`}} />
                          </div>
                          <span className="ndb-loc-count">{a.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* INVESTMENT SCORE */}
              <div className="ndb-card ndb-invest-card">
                <div className="ndb-card-head">
                  <span className="ndb-card-title">Investment Score <span style={{fontSize:13,color:"#9ca3af"}}>ⓘ</span></span>
                </div>
                <div className="ndb-invest-body">
                  {/* Gauge arc */}
                  <svg viewBox="0 0 160 100" width="160" height="100">
                    {/* background arc */}
                    <path d="M 15 90 A 70 70 0 0 1 145 90" fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round"/>
                    {/* green filled arc */}
                    <path d="M 15 90 A 70 70 0 0 1 145 90" fill="none" stroke="url(#gaugeGrad)" strokeWidth="14" strokeLinecap="round"
                      strokeDasharray={`${(investScore/100)*220} 220`}/>
                    <defs>
                      <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22c55e"/>
                        <stop offset="100%" stopColor="#86efac"/>
                      </linearGradient>
                    </defs>
                    <text x="80" y="80" textAnchor="middle" fontSize="28" fontWeight="800" fill="#1e293b">{investScore}</text>
                    <text x="80" y="95" textAnchor="middle" fontSize="11" fill="#9ca3af">/ 100</text>
                  </svg>
                  <p className="ndb-invest-lbl">Excellent Investment</p>
                  <p className="ndb-invest-sub">High growth potential in this area</p>
                  <div style={{width:"100%",marginTop:8}}>
                    {["Low Risk","High Rental Demand","Good Appreciation"].map(c=>(
                      <p key={c} className="ndb-invest-check">
                        <span className="ndb-invest-tick">✓</span> {c}
                      </p>
                    ))}
                  </div>
                  <button className="ndb-link-btn" style={{marginTop:10}} onClick={()=>navigate("/predict-price")}>
                    📈 View Price Prediction
                  </button>
                </div>
              </div>
            </div>

            {/* RECOMMENDED */}
            <div className="ndb-card">
              <div className="ndb-card-head">
                <div>
                  <p className="ndb-card-title">Recommended for You</p>
                  <p style={{fontSize:11,color:"#9ca3af",margin:"2px 0 0"}}>Based on your preferences and search history</p>
                </div>
                <button className="ndb-link-btn" onClick={()=>navigate("/explore")}>View all</button>
              </div>
              <div className="ndb-rec-row">
                {allProperties.slice(0,3).map((p,i)=>{
                  const match=[92,88,85][i]||80;
                  return (
                    <div key={p._id} className="ndb-rec-card" onClick={()=>navigate(`/properties/${p._id}`)}>
                      <div className="ndb-rec-img-box">
                        <img src={p.image||getTypeImg(p)} alt={p.title} className="ndb-rec-img"/>
                        <span className="ndb-match">{match}% Match</span>
                        <button className="ndb-rec-heart" onClick={e=>{e.stopPropagation();}}>🤍</button>
                      </div>
                      <div className="ndb-rec-body">
                        <p className="ndb-rec-name">{p.title}</p>
                        <p className="ndb-rec-loc">📍 {p.location}</p>
                        <p className="ndb-rec-price">₹ {(p.price/100000).toFixed(1)} Lakh</p>
                        <p className="ndb-rec-meta">{p.area} sqft &nbsp;•&nbsp; {p.status}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="ndb-right">

            {/* AI ASSISTANT */}
            <AIAssistant userName={userName} />

            {/* QUICK ACTIONS */}
            <div className="ndb-card">
              <p className="ndb-card-title" style={{marginBottom:12}}>Quick Actions</p>
              {[
                {icon:"🔮",label:"Predict Property Price",sub:"Get AI predicted price →",ic:"#6366f1",onClick:()=>navigate("/predict-price")},
                {icon:"🧮",label:"EMI Calculator",sub:"Calculate your monthly EMI →",ic:"#16a34a",onClick:()=>navigate("/emi-calculator")},
                {icon:"⚖️",label:"Compare Properties",sub:"Compare 2 or more properties →",ic:"#f97316",onClick:()=>navigate("/compare-properties")},
              ].map(q=>(
                <div key={q.label} className="ndb-qa-item" onClick={q.onClick}>
                  <div className="ndb-qa-icon" style={{background:q.ic}}>{q.icon}</div>
                  <div>
                    <p className="ndb-qa-label">{q.label}</p>
                    <p className="ndb-qa-sub">{q.sub}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
