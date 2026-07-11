import { useParams, useNavigate } from "react-router-dom";
import API_BASE from '../config';
import { useEffect, useState, useCallback } from "react";
import AppLayout from "../components/AppLayout";
import { useToast } from "../components/Toast";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getTypeImage } from "../utils/typeImages";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Returns type-accurate images for the gallery — uses shared utility
function getImages(property) {
  return [getTypeImage(property)];
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

  // ─── REVIEWS STATE ───────────────────────────────────────────────────────
  const [reviews, setReviews]           = useState([]);
  const [avgRating, setAvgRating]       = useState(0);
  const [totalCount, setTotalCount]     = useState(0);
  const [distribution, setDistribution] = useState([]);
  const [myRating, setMyRating]         = useState(0);
  const [hoverRating, setHoverRating]   = useState(0);
  const [myComment, setMyComment]       = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [myReview, setMyReview]         = useState(null);
  const [editMode, setEditMode]         = useState(false);
  const userId   = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "User";

  const fetchReviews = useCallback(async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/reviews/${id}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setAvgRating(data.avgRating || 0);
      setTotalCount(data.totalCount || 0);
      setDistribution(data.distribution || []);
      // Pre-fill form if user already reviewed
      const mine = (data.reviews || []).find(r => r.user === userId || r.user?._id === userId);
      if (mine) {
        setMyReview(mine);
        setMyRating(mine.rating);
        setMyComment(mine.comment || "");
      }
    } catch {}
  }, [id, userId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

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
      const res = await fetch(`${API_BASE}/api/bookings`, {
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) { toast("Please login to submit a review", "error"); return; }
    if (!myRating) { toast("Please select a star rating", "error"); return; }
    setSubmitting(true);
    try {
      const res  = await fetch(`${API_BASE}/api/reviews/${id}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ rating: myRating, comment: myComment, userName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast(myReview ? "Review updated!" : "Review submitted!", "success");
      setEditMode(false);
      fetchReviews();
    } catch (err) {
      toast(err.message || "Failed to submit review", "error");
    } finally { setSubmitting(false); }
  };

  const handleReviewDelete = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/reviews/${id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast("Review deleted", "success");
        setMyReview(null); setMyRating(0); setMyComment(""); setEditMode(false);
        fetchReviews();
      }
    } catch { toast("Failed to delete review", "error"); }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/api/properties/${id}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => {
        setProperty(d);
        try {
          const prev = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
          const updated = [id, ...prev.filter(x => x !== id)].slice(0, 8);
          localStorage.setItem("recentlyViewed", JSON.stringify(updated));
        } catch {}
      })
      .catch(err => { if (err.name !== "AbortError") console.error(err); });
    return () => controller.abort();
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

        {/* ════════════════════════════════════════════════════════════════
            REVIEWS & RATINGS SECTION
        ════════════════════════════════════════════════════════════════ */}
        <div className="pd-reviews-section">
          <h3 className="pd-section-title">⭐ Ratings & Reviews</h3>

          {/* ── SUMMARY ROW ── */}
          <div className="pd-review-summary">
            {/* Big score */}
            <div className="pd-review-score-box">
              <div className="pd-review-big-score">{avgRating || "—"}</div>
              <div className="pd-review-stars-row">
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ color: s <= Math.round(avgRating) ? "#f59e0b" : "#e5e7eb", fontSize: 20 }}>★</span>
                ))}
              </div>
              <div className="pd-review-total">{totalCount} {totalCount === 1 ? "review" : "reviews"}</div>
            </div>

            {/* Bar distribution */}
            <div className="pd-review-bars">
              {distribution.map(d => (
                <div key={d.star} className="pd-review-bar-row">
                  <span className="pd-review-bar-label">{d.star} ★</span>
                  <div className="pd-review-bar-track">
                    <div
                      className="pd-review-bar-fill"
                      style={{ width: totalCount ? `${Math.round((d.count / totalCount) * 100)}%` : "0%" }}
                    />
                  </div>
                  <span className="pd-review-bar-count">{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── WRITE / EDIT REVIEW FORM ── */}
          <div className="pd-write-review">
            <h4 className="pd-write-title">
              {myReview && !editMode ? "Your Review" : myReview && editMode ? "Edit Your Review" : "Write a Review"}
            </h4>

            {/* Already reviewed — show existing + edit/delete buttons */}
            {myReview && !editMode ? (
              <div className="pd-my-review-card">
                <div className="pd-review-card-top">
                  <div className="pd-reviewer-avatar">{userName.charAt(0).toUpperCase()}</div>
                  <div className="pd-reviewer-info">
                    <p className="pd-reviewer-name">{myReview.userName || userName}</p>
                    <div className="pd-reviewer-stars">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ color: s <= myReview.rating ? "#f59e0b" : "#e5e7eb", fontSize: 16 }}>★</span>
                      ))}
                    </div>
                  </div>
                  <div className="pd-my-review-actions">
                    <button className="pd-review-edit-btn" onClick={() => { setEditMode(true); setMyRating(myReview.rating); setMyComment(myReview.comment || ""); }}>
                      ✏️ Edit
                    </button>
                    <button className="pd-review-delete-btn" onClick={handleReviewDelete}>
                      🗑 Delete
                    </button>
                  </div>
                </div>
                {myReview.comment && <p className="pd-review-comment-text">"{myReview.comment}"</p>}
              </div>
            ) : (
              /* Review form — for new or edit */
              <form className="pd-review-form" onSubmit={handleReviewSubmit}>
                {/* Star picker */}
                <div className="pd-star-picker">
                  <label className="pd-form-label">Your Rating *</label>
                  <div className="pd-star-row">
                    {[1,2,3,4,5].map(s => (
                      <button
                        key={s} type="button"
                        className="pd-star-btn"
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setMyRating(s)}
                      >
                        <span style={{
                          color: s <= (hoverRating || myRating) ? "#f59e0b" : "#d1d5db",
                          fontSize: 32,
                          transition: "color 0.1s, transform 0.1s",
                          display: "inline-block",
                          transform: s <= (hoverRating || myRating) ? "scale(1.15)" : "scale(1)",
                        }}>★</span>
                      </button>
                    ))}
                    {(hoverRating || myRating) > 0 && (
                      <span className="pd-star-label">
                        {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][hoverRating || myRating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment */}
                <div className="pd-form-group">
                  <label className="pd-form-label">Your Comment <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></label>
                  <textarea
                    className="pd-review-textarea"
                    rows={3}
                    placeholder="Share your experience — what did you like or dislike about this property?"
                    value={myComment}
                    onChange={e => setMyComment(e.target.value)}
                    maxLength={500}
                  />
                  <p className="pd-char-count">{myComment.length}/500</p>
                </div>

                <div className="pd-review-form-actions">
                  {editMode && (
                    <button type="button" className="pd-review-cancel-btn" onClick={() => { setEditMode(false); setMyRating(myReview?.rating || 0); setMyComment(myReview?.comment || ""); }}>
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="pd-review-submit-btn" disabled={submitting || !myRating}>
                    {submitting ? "Submitting..." : myReview ? "Update Review" : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── ALL REVIEWS LIST ── */}
          <div className="pd-reviews-list">
            {reviews.filter(r => r.user !== userId && r.user?._id !== userId).length === 0 && !myReview && (
              <div className="pd-no-reviews">
                <span style={{ fontSize: 36 }}>💬</span>
                <p>No reviews yet. Be the first to share your experience!</p>
              </div>
            )}

            {reviews
              .filter(r => r.user !== userId && r.user?._id !== userId)
              .map(r => (
                <div key={r._id} className="pd-review-card">
                  <div className="pd-review-card-top">
                    <div className="pd-reviewer-avatar" style={{ background: "#6366f1" }}>
                      {(r.userName || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="pd-reviewer-info">
                      <p className="pd-reviewer-name">{r.userName || "Anonymous"}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="pd-reviewer-stars">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} style={{ color: s <= r.rating ? "#f59e0b" : "#e5e7eb", fontSize: 14 }}>★</span>
                          ))}
                        </div>
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>
                          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {r.comment && <p className="pd-review-comment-text">"{r.comment}"</p>}
                </div>
              ))}
          </div>
        </div>
        {/* ═══════════════════ END REVIEWS ═══════════════════ */}

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

