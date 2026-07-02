import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { useToast } from "../components/Toast";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const TYPE_IMGS = {
  Apartment: [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop",
  ],
  House: [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&h=500&fit=crop",
  ],
  Villa: [
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop",
  ],
  Flat: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=500&fit=crop",
  ],
};

function getImages(property) {
  if (property.image) return [property.image];
  const imgs = TYPE_IMGS[property.type] || TYPE_IMGS["Apartment"];
  // Rotate the array based on _id so each property gets a different starting image
  const offset = parseInt((property._id || "0").slice(-4), 16) % imgs.length;
  return [...imgs.slice(offset), ...imgs.slice(0, offset)];
}

function getHighlights(type) {
  const common = [
    { icon: "✅", label: "Ready to Move" },
    { icon: "🚗", label: "Car Parking" },
    { icon: "⚡", label: "Power Backup" },
    { icon: "💧", label: "24/7 Water Supply" },
  ];
  const byType = {
    Villa: [
      { icon: "🏊", label: "Private Swimming Pool" },
      { icon: "🌳", label: "Landscaped Garden" },
      { icon: "🔒", label: "Gated Community" },
      { icon: "🏋️", label: "Home Gym" },
    ],
    House: [
      { icon: "🌳", label: "Private Garden" },
      { icon: "🔒", label: "Gated Community" },
      { icon: "🐕", label: "Pet Friendly" },
      { icon: "☀️", label: "Solar Panels" },
    ],
    Apartment: [
      { icon: "🛗", label: "Lift Available" },
      { icon: "🏊", label: "Swimming Pool" },
      { icon: "🏋️", label: "Gym & Fitness" },
      { icon: "🔒", label: "Gated Community" },
    ],
    Flat: [
      { icon: "🛗", label: "Lift Available" },
      { icon: "🔒", label: "Gated Community" },
      { icon: "📦", label: "Storage Room" },
      { icon: "🌐", label: "High Speed Internet" },
    ],
  };
  return [...common, ...(byType[type] || byType.Apartment)];
}

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [property, setProperty] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem("savedProperties") || "[]").includes(id); }
    catch { return false; }
  });
  const [showBooking, setShowBooking] = useState(false);
  const [bookForm, setBookForm] = useState({ visitDate: "", visitTime: "10:00 AM", name: "", phone: "", message: "" });
  const [booking, setBooking] = useState(false);
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const toggleSave = () => {
    try {
      const prev = JSON.parse(localStorage.getItem("savedProperties") || "[]");
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem("savedProperties", JSON.stringify(next));
      setSaved(next.includes(id));
    } catch {}
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBooking(true);
    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ propertyId: id, ...bookForm })
      });
      if (res.ok) {
        setShowBooking(false);
        toast("Visit booked successfully! Check My Bookings.", "success");
        setBookForm({ visitDate: "", visitTime: "10:00 AM", name: "", phone: "", message: "" });
      } else {
        const d = await res.json();
        toast(d.message || "Booking failed", "error");
      }
    } catch { toast("Booking failed. Please try again.", "error"); }
    finally { setBooking(false); }
  };

  useEffect(() => {
    fetch(`http://localhost:5000/api/properties/${id}`)
      .then(r => r.json())
      .then(d => {
        setProperty(d);
        // Track recently viewed
        try {
          const prev = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
          const updated = [id, ...prev.filter(x => x !== id)].slice(0, 8);
          localStorage.setItem("recentlyViewed", JSON.stringify(updated));
        } catch {}
      })
      .catch(console.error);
  }, [id]);

  if (!property) return (
    <AppLayout>
      <div className="pd-loading">
        <div className="pd-loading-spinner" />
        <p>Loading property details...</p>
      </div>
    </AppLayout>
  );

  const images = getImages(property);
  const priceFormatted = `₹ ${Number(property.price).toLocaleString("en-IN")}`;
  const initials = property.ownerName?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "PO";

  return (
    <AppLayout>
      <div className="pd-page">

        {/* BACK */}
        <button className="pd-back-btn" onClick={() => navigate(-1)}>
          ← Back to Properties
        </button>

        {/* TOP GRID */}
        <div className="pd-top-grid">

          {/* LEFT — IMAGES */}
          <div className="pd-images-col">
            <div className="pd-main-img-wrap">
              <img src={images[activeImg]} alt={property.title} className="pd-main-img" />
              <span className={`pd-status-badge ${property.status === "For Sale" ? "sale" : "rent"}`}>
                {property.status}
              </span>
              {property.featured && <span className="pd-featured-badge">⭐ Featured</span>}
            </div>
            {images.length > 1 && (
              <div className="pd-thumbnails">
                {images.map((img, i) => (
                  <img
                    key={i} src={img} alt={`view-${i}`}
                    className={`pd-thumb${activeImg === i ? " active" : ""}`}
                    onClick={() => setActiveImg(i)}
                  />
                ))}
              </div>
            )}

            {/* HIGHLIGHTS BELOW IMAGE */}
            <div className="pd-highlights">
              <h4 className="pd-highlights-title">🏡 Property Highlights</h4>
              <div className="pd-highlights-grid">
                {getHighlights(property.type).map(h => (
                  <div key={h.label} className="pd-highlight-item">
                    <span className="pd-hl-icon">{h.icon}</span>
                    <span>{h.label}</span>
                  </div>
                ))}
              </div>
              <div className="pd-added-on">
                🗓 Listed on {property.createdAt ? new Date(property.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
              </div>
            </div>

          </div>

          {/* RIGHT — DETAILS */}
          <div className="pd-details-col">

            {/* TITLE + PRICE */}
            <div className="pd-title-row">
              <div>
                <h1 className="pd-title">{property.title}</h1>
                <p className="pd-location">📍 {property.location}</p>
              </div>
              <button className="pd-save-btn" onClick={toggleSave} title={saved ? "Remove from wishlist" : "Save to wishlist"}>
                {saved ? "❤️ Saved" : "🤍 Save"}
              </button>
              <button className="pd-book-btn" onClick={() => setShowBooking(true)}>
                📅 Book a Visit
              </button>
            </div>

            <div className="pd-price">{priceFormatted}</div>

            {/* CHIPS */}
            <div className="pd-chips">
              {[
                { icon: "🛏", label: `${property.bedrooms || 0} Bedrooms` },
                { icon: "🛁", label: `${property.bathrooms || 0} Bathrooms` },
                { icon: "📐", label: `${property.area || 0} sqft` },
                { icon: "🏠", label: property.type },
              ].map(c => (
                <div key={c.label} className="pd-chip">
                  <span className="pd-chip-icon">{c.icon}</span>
                  <span>{c.label}</span>
                </div>
              ))}
            </div>

            {/* PROPERTY INFO TABLE */}
            <div className="pd-info-table">
              {[
                { label: "Property Type", value: property.type },
                { label: "Status", value: property.status },
                { label: "Location", value: property.location },
                { label: "Area", value: `${property.area} sqft` },
                { label: "Bedrooms", value: property.bedrooms },
                { label: "Bathrooms", value: property.bathrooms },
              ].map(row => (
                <div key={row.label} className="pd-info-row">
                  <span className="pd-info-label">{row.label}</span>
                  <span className="pd-info-value">{row.value}</span>
                </div>
              ))}
            </div>

            {/* OWNER CARD */}
            <div className="pd-owner-card">
              <div className="pd-owner-avatar">{initials}</div>
              <div className="pd-owner-info">
                <p className="pd-owner-name">{property.ownerName}</p>
                <p className="pd-owner-role">Property Owner</p>
                <p className="pd-owner-email">✉️ {property.ownerEmail}</p>
              </div>
              <div className="pd-owner-actions">
                <a href={`tel:${property.ownerPhone}`} className="pd-call-btn">
                  📞 {property.ownerPhone}
                </a>
                <a
                  href={`https://wa.me/91${property.ownerPhone}?text=Hi, I'm interested in your property: ${property.title}`}
                  target="_blank" rel="noreferrer"
                  className="pd-whatsapp-btn"
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* MAP */}
        {property.lat && property.lng && (
          <div className="pd-map-section">
            <h3 className="pd-section-title">📍 Property Location</h3>
            <div className="pd-map-wrap">
              <MapContainer
                center={[property.lat, property.lng]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[property.lat, property.lng]} icon={markerIcon} />
              </MapContainer>
            </div>
          </div>
        )}

      </div>

      {showBooking && (
        <div className="pd-modal-overlay" onClick={() => setShowBooking(false)}>
          <div className="pd-booking-modal" onClick={e => e.stopPropagation()}>
            <div className="pd-modal-header">
              <h3>📅 Book a Visit</h3>
              <button className="pd-modal-close" onClick={() => setShowBooking(false)}>✕</button>
            </div>
            <div className="pd-modal-prop">
              <img src={images[0]} alt={property.title} className="pd-modal-img" />
              <div>
                <p className="pd-modal-prop-name">{property.title}</p>
                <p className="pd-modal-prop-loc">📍 {property.location}</p>
              </div>
            </div>
            <form onSubmit={handleBook} className="pd-booking-form">
              <div className="pd-form-row">
                <div className="pd-form-field">
                  <label>Visit Date *</label>
                  <input type="date" value={bookForm.visitDate} min={new Date().toISOString().split("T")[0]}
                    onChange={e => setBookForm(f=>({...f,visitDate:e.target.value}))} required />
                </div>
                <div className="pd-form-field">
                  <label>Preferred Time *</label>
                  <select value={bookForm.visitTime} onChange={e => setBookForm(f=>({...f,visitTime:e.target.value}))}>
                    {["09:00 AM","10:00 AM","11:00 AM","12:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM"].map(t=>(
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pd-form-row">
                <div className="pd-form-field">
                  <label>Your Name</label>
                  <input type="text" placeholder="Full name" value={bookForm.name}
                    onChange={e => setBookForm(f=>({...f,name:e.target.value}))} />
                </div>
                <div className="pd-form-field">
                  <label>Phone Number</label>
                  <input type="tel" placeholder="10-digit mobile" value={bookForm.phone}
                    onChange={e => setBookForm(f=>({...f,phone:e.target.value}))} />
                </div>
              </div>
              <div className="pd-form-field">
                <label>Message (optional)</label>
                <textarea rows={2} placeholder="Any specific questions for the owner?"
                  value={bookForm.message} onChange={e => setBookForm(f=>({...f,message:e.target.value}))} />
              </div>
              <div className="pd-booking-actions">
                <button type="button" className="pd-cancel-btn" onClick={() => setShowBooking(false)}>Cancel</button>
                <button type="submit" className="pd-confirm-btn" disabled={booking}>
                  {booking ? "Booking..." : "✅ Confirm Visit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default PropertyDetails;

