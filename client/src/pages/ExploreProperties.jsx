import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useNavigate, NavLink } from "react-router-dom";
import "./ExploreProperties.css";
import Notifications from "../components/Notifications";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41],
});

const activeMarkerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41],
});

// Captures map instance and exposes flyTo
function MapController({ mapRef, flyTo }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map, mapRef]);
  useEffect(() => {
    if (flyTo && map) {
      map.flyTo([flyTo.lat, flyTo.lng], 16, { animate: true, duration: 1.2 });
    }
  }, [flyTo, map]);
  return null;
}

const TYPE_IMGS = {
  Apartment: [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&h=180&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=180&fit=crop",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&h=180&fit=crop",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=300&h=180&fit=crop",
    "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=300&h=180&fit=crop",
  ],
  House: [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=300&h=180&fit=crop",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=300&h=180&fit=crop",
    "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=300&h=180&fit=crop",
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=300&h=180&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=300&h=180&fit=crop",
  ],
  Villa: [
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=300&h=180&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=180&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&h=180&fit=crop",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=180&fit=crop",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=300&h=180&fit=crop",
  ],
  Flat: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&h=180&fit=crop",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=300&h=180&fit=crop",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=300&h=180&fit=crop",
    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=300&h=180&fit=crop",
    "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=300&h=180&fit=crop",
  ],
};

function getTypeImg(property) {
  const imgs = TYPE_IMGS[property.type] || TYPE_IMGS.Apartment;
  const idx = parseInt((property._id || "0").slice(-4), 16) % imgs.length;
  return imgs[idx];
}

import API_BASE from "../config";

function ExploreProperties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [quickView, setQuickView] = useState(null);
  const [flyTo, setFlyTo] = useState(null);
  const [savedIds, setSavedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("savedProperties") || "[]"); } catch { return []; }
  });
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const mapRef = useRef(null);
  const markerRefs = useRef({});
  const cardRefs = useRef({});

  const [filters, setFilters] = useState({ search: "", minPrice: "", maxPrice: "", type: "", status: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetch(`${API_BASE}/api/properties`)
      .then(r => r.json())
      .then(d => setProperties(d))
      .catch(console.error);
  }, []);

  const toggleSave = (id, e) => {
    e.stopPropagation();
    const next = savedIds.includes(id) ? savedIds.filter(x => x !== id) : [...savedIds, id];
    setSavedIds(next);
    localStorage.setItem("savedProperties", JSON.stringify(next));
  };

  const setFilter = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setCurrentPage(1); };
  const clearFilter = (key) => setFilter(key, "");

  const filteredProperties = properties.filter(p => {
    const matchSearch = !filters.search ||
      p.location?.toLowerCase().includes(filters.search.toLowerCase()) ||
      p.title?.toLowerCase().includes(filters.search.toLowerCase());
    const matchMin = !filters.minPrice || p.price >= Number(filters.minPrice);
    const matchMax = !filters.maxPrice || p.price <= Number(filters.maxPrice);
    const matchType = !filters.type || p.type === filters.type;
    const matchStatus = !filters.status || p.status === filters.status;
    return matchSearch && matchMin && matchMax && matchType && matchStatus;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "beds") return (b.bedrooms || 0) - (a.bedrooms || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const totalPages = Math.ceil(sortedProperties.length / itemsPerPage);
  const paginatedProperties = sortedProperties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (!mapRef.current || filteredProperties.length === 0 || activeId) return;
    const bounds = L.latLngBounds(filteredProperties.filter(p => p.lat && p.lng).map(p => [p.lat, p.lng]));
    if (bounds.isValid()) mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
  }, [filteredProperties, activeId]);

  const focusOn = (p) => {
    if (!p.lat || !p.lng) return;
    setActiveId(p._id);
    setFlyTo({ lat: p.lat, lng: p.lng });
    setTimeout(() => markerRefs.current[p._id]?.openPopup(), 1400);
  };

  const activeFilters = [
    filters.search && { key: "search", label: `"${filters.search}"` },
    filters.type && { key: "type", label: filters.type },
    filters.status && { key: "status", label: filters.status },
    filters.minPrice && { key: "minPrice", label: `Min ₹${Number(filters.minPrice).toLocaleString()}` },
    filters.maxPrice && { key: "maxPrice", label: `Max ₹${Number(filters.maxPrice).toLocaleString()}` },
  ].filter(Boolean);

  return (
    <div className="ndb-root">
      {/* SIDEBAR */}
      <aside className="ndb-sidebar">
        <div className="ndb-logo" onClick={() => navigate("/dashboard")}>
          <span>🏠</span> PropVista
        </div>
        <nav className="ndb-nav">
          {[
            {icon:"📊",label:"Dashboard",to:"/dashboard"},
            {icon:"🏢",label:"Properties",to:"/properties"},
            {icon:"🗺️",label:"Map View",to:"/explore"},
            {icon:"🔍",label:"AI Search",to:"/ai-search"},
            {icon:"📅",label:"My Bookings",to:"/bookings"},
            {icon:"👤",label:"Profile",to:"/profile"},
            {icon:"⚙️",label:"Settings",to:"/settings"},
          ].map(l => (
            <NavLink key={l.to} to={l.to} className={({isActive})=>"ndb-link"+(isActive?" ndb-active":"")} end={l.label==="Map View"}>
              <span>{l.icon}</span> {l.label}
            </NavLink>
          ))}
          <button className="ndb-link ndb-link-danger"
            onClick={()=>{localStorage.clear();sessionStorage.clear();window.location.href="/";}}>
            <span>⎋</span> Logout
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="ndb-main" style={{overflow:"hidden",display:"flex",flexDirection:"column",height:"100%"}}>
      <div className="ep-wrap" style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        <div className="ep-layout" style={{height:"100%"}}>

          {/* LEFT PANEL */}
          <div className={`ep-panel${panelCollapsed ? " collapsed" : ""}`}>
            <button className="ep-collapse-btn" onClick={() => setPanelCollapsed(!panelCollapsed)}>
              {panelCollapsed ? "▶" : "◀"}
            </button>

            {!panelCollapsed && (
              <>
                {/* HEADER */}
                <div className="ep-panel-header">
                  <span className="ep-count">
                    <strong>{filteredProperties.length}</strong> of {properties.length} properties
                  </span>
                  <select className="ep-sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                    <option value="beds">Most Bedrooms</option>
                  </select>
                </div>

                {/* FILTERS */}
                <div className="ep-filters">
                  <input className="ep-input" placeholder="🔍 Search title or location"
                    value={filters.search} onChange={e => setFilter("search", e.target.value)} />
                  <div className="ep-filter-row">
                    <input className="ep-input" placeholder="Min ₹" type="number"
                      value={filters.minPrice} onChange={e => setFilter("minPrice", e.target.value)} />
                    <input className="ep-input" placeholder="Max ₹" type="number"
                      value={filters.maxPrice} onChange={e => setFilter("maxPrice", e.target.value)} />
                  </div>
                  <div className="ep-filter-row">
                    <select className="ep-input" value={filters.type} onChange={e => setFilter("type", e.target.value)}>
                      <option value="">All Types</option>
                      <option>House</option><option>Apartment</option><option>Flat</option><option>Villa</option>
                    </select>
                    <select className="ep-input" value={filters.status} onChange={e => setFilter("status", e.target.value)}>
                      <option value="">All Status</option>
                      <option>For Sale</option><option>For Rent</option>
                    </select>
                  </div>
                </div>

                {/* ACTIVE FILTER CHIPS */}
                {activeFilters.length > 0 && (
                  <div className="ep-chips">
                    {activeFilters.map(f => (
                      <span key={f.key} className="ep-chip">
                        {f.label} <button onClick={() => clearFilter(f.key)}>×</button>
                      </span>
                    ))}
                    <button className="ep-clear-all" onClick={() => { setFilters({ search: "", minPrice: "", maxPrice: "", type: "", status: "" }); setCurrentPage(1); }}>
                      Clear all
                    </button>
                  </div>
                )}

                {/* PROPERTY CARDS */}
                <div className="ep-cards">
                  {paginatedProperties.map(p => (
                    <div
                      key={p._id}
                      ref={el => cardRefs.current[p._id] = el}
                      className={`ep-card${activeId === p._id ? " active" : ""}${hoverId === p._id ? " hovered" : ""}`}
                      onClick={() => { focusOn(p); }}
                      onMouseEnter={() => setHoverId(p._id)}
                      onMouseLeave={() => setHoverId(null)}
                    >
                      <div className="ep-card-img-wrap">
                        <img src={p.image || getTypeImg(p)} alt={p.title} className="ep-card-img" />
                        <span className={`ep-card-badge ${p.status === "For Sale" ? "sale" : "rent"}`}>{p.status}</span>
                        <button className={`ep-heart${savedIds.includes(p._id) ? " saved" : ""}`} onClick={e => toggleSave(p._id, e)}>
                          {savedIds.includes(p._id) ? "❤️" : "🤍"}
                        </button>
                      </div>
                      <div className="ep-card-body">
                        <p className="ep-card-title">{p.title}</p>
                        <p className="ep-card-loc">📍 {p.location}</p>
                        <p className="ep-card-price">₹ {Number(p.price).toLocaleString("en-IN")}</p>
                        <div className="ep-card-meta">
                          <span>🛏 {p.bedrooms || 0}</span>
                          <span>🛁 {p.bathrooms || 0}</span>
                          <span>📐 {p.area || 0} sqft</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="ep-pagination">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      if (page > totalPages) return null;
                      return (
                        <button key={page} className={currentPage === page ? "active" : ""} onClick={() => setCurrentPage(page)}>{page}</button>
                      );
                    })}
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* MAP */}
          <div className="ep-map">
            <MapContainer center={[11.0168, 76.9558]} zoom={12}
              style={{ height: "100%", width: "100%" }}>
              <MapController mapRef={mapRef} flyTo={flyTo} />
              <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MarkerClusterGroup>
                {filteredProperties.map(p => p.lat && p.lng && (
                  <Marker key={p._id} position={[p.lat, p.lng]}
                    icon={activeId === p._id || hoverId === p._id ? activeMarkerIcon : markerIcon}
                    ref={ref => { if (ref) markerRefs.current[p._id] = ref; }}
                    eventHandlers={{ click: () => { setActiveId(p._id); } }}>
                    <Popup>
                      <strong>{p.title}</strong><br />
                      ₹ {Number(p.price).toLocaleString("en-IN")}<br />
                      <button
                        onClick={() => navigate(`/properties/${p._id}`)}
                        style={{ marginTop: "6px", padding: "4px 10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                      >
                        View Details →
                      </button>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
            </MapContainer>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default ExploreProperties;

