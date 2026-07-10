import { useState, useRef } from "react";
import AppLayout from "../components/AppLayout";
import API_BASE from "../config";
import MapPicker from "../components/MapPicker";
import { useToast } from "../components/Toast";
import { useNavigate } from "react-router-dom";
import { TYPE_IMAGES } from "../utils/typeImages";

// One hero image per type — shown as the page background preview
const TYPE_HERO = {
  House:     TYPE_IMAGES.House[0],
  Villa:     TYPE_IMAGES.Villa[0],
  Apartment: TYPE_IMAGES.Apartment[0],
  Flat:      TYPE_IMAGES.Flat[0],
};

const STEPS = ["Basic Info", "Details", "Location & Image"];

function AddProperty() {
  const toast     = useToast();
  const navigate  = useNavigate();
  const fileRef   = useRef(null);

  const [step, setStep]           = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [mapLocation, setMapLocation] = useState(null);
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [form, setForm] = useState({
    title:     "",
    type:      "",
    status:    "For Sale",
    location:  "",
    price:     "",
    bedrooms:  "",
    bathrooms: "",
    area:      "",
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const nextStep = () => {
    if (step === 0) {
      if (!form.title.trim()) { toast("Property title is required", "warning"); return; }
      if (!form.type)         { toast("Please select a property type", "warning"); return; }
      if (!form.location.trim()) { toast("Location is required", "warning"); return; }
    }
    if (step === 1) {
      if (!form.price || Number(form.price) <= 0) { toast("Enter a valid price", "warning"); return; }
    }
    setStep(s => Math.min(s + 1, 2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mapLocation) { toast("Please pick a location on the map", "warning"); return; }

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    setSubmitting(true);
    try {
      const payload = { ...form, lat: mapLocation.lat, lng: mapLocation.lng };
      const res  = await fetch(`${API_BASE}/api/properties/add`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });
      const saved = await res.json();
      if (!res.ok) { toast(saved.message || "Failed to add property", "error"); return; }

      // Upload image if user selected one
      if (imageFile && saved._id) {
        const fd = new FormData();
        fd.append("image", imageFile);
        await fetch(`${API_BASE}/api/properties/${saved._id}/image`, {
          method:  "POST",
          headers: { Authorization: `Bearer ${token}` },
          body:    fd,
        });
      }

      toast("Property listed successfully!", "success");
      setTimeout(() => navigate("/properties"), 1200);
    } catch {
      toast("Failed to add property. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Background hero image changes with selected type
  const heroBg = form.type ? TYPE_HERO[form.type] : TYPE_IMAGES.Apartment[0];

  return (
    <AppLayout>
      <div style={{ height: "100vh", overflowY: "auto", background: "#f1f5f9" }}>

        {/* ── TOP BANNER ── */}
        <div style={{
          position: "relative", height: 180, overflow: "hidden",
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover", backgroundPosition: "center",
          transition: "background-image 0.5s ease",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg,rgba(15,40,87,0.82),rgba(99,102,241,0.6))",
          }} />
          <div style={{
            position: "relative", zIndex: 1, padding: "28px 36px",
            display: "flex", alignItems: "flex-end", justifyContent: "space-between",
            height: "100%",
          }}>
            <div>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, margin: "0 0 4px" }}>
                Properties › Add New
              </p>
              <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, margin: 0 }}>
                List a Property
              </h1>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: "4px 0 0" }}>
                Fill in the details below to publish your listing
              </p>
            </div>
            {form.type && (
              <div style={{
                background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 12, padding: "8px 18px",
                color: "#fff", fontSize: 13, fontWeight: 700,
              }}>
                {form.type === "House" ? "🏠" : form.type === "Villa" ? "🏡" :
                 form.type === "Apartment" ? "🏢" : "🏗️"} {form.type}
              </div>
            )}
          </div>
        </div>

        {/* ── STEPPER ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 0, padding: "20px 36px 0", maxWidth: 700, margin: "0 auto",
        }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 13,
                  background: i < step ? "#16a34a" : i === step ? "#6366f1" : "#e5e7eb",
                  color: i <= step ? "#fff" : "#9ca3af",
                  transition: "all 0.3s",
                }}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: i === step ? "#6366f1" : i < step ? "#16a34a" : "#9ca3af",
                  whiteSpace: "nowrap",
                }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 2, margin: "0 8px", marginBottom: 18,
                  background: i < step ? "#16a34a" : "#e5e7eb",
                  transition: "background 0.3s",
                }} />
              )}
            </div>
          ))}
        </div>

        {/* ── FORM CARD ── */}
        <div style={{ maxWidth: 700, margin: "20px auto 40px", padding: "0 16px" }}>
          <form onSubmit={handleSubmit}>
            <div style={{
              background: "#fff", borderRadius: 20,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              padding: "32px 36px", minHeight: 400,
            }}>

              {/* ── STEP 0: BASIC INFO ── */}
              {step === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: "0 0 6px" }}>
                      Basic Information
                    </h2>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
                      Tell us what you're listing
                    </p>
                  </div>

                  {/* Title */}
                  <div>
                    <label style={labelStyle}>Property Title *</label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. 3 BHK Apartment with Lake View"
                      value={form.title}
                      onChange={e => set("title", e.target.value)}
                      required
                    />
                  </div>

                  {/* Type — card selector */}
                  <div>
                    <label style={labelStyle}>Property Type *</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                      {[
                        { type: "Apartment", icon: "🏢", desc: "Multi-floor building" },
                        { type: "House",     icon: "🏠", desc: "Independent home" },
                        { type: "Villa",     icon: "🏡", desc: "Luxury property" },
                        { type: "Flat",      icon: "🏗️", desc: "Compact flat" },
                      ].map(t => (
                        <button
                          key={t.type}
                          type="button"
                          onClick={() => set("type", t.type)}
                          style={{
                            border: form.type === t.type ? "2px solid #6366f1" : "2px solid #e5e7eb",
                            borderRadius: 12, padding: "14px 8px",
                            background: form.type === t.type ? "#eef2ff" : "#fafafa",
                            cursor: "pointer", textAlign: "center", transition: "all 0.2s",
                          }}
                        >
                          <div style={{ fontSize: 26, marginBottom: 4 }}>{t.icon}</div>
                          <div style={{
                            fontSize: 12, fontWeight: 700,
                            color: form.type === t.type ? "#4f46e5" : "#374151",
                          }}>{t.type}</div>
                          <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{t.desc}</div>
                        </button>
                      ))}
                    </div>
                    {/* Show type-preview image */}
                    {form.type && (
                      <div style={{
                        marginTop: 12, borderRadius: 10, overflow: "hidden",
                        height: 120, position: "relative",
                      }}>
                        <img
                          src={TYPE_HERO[form.type]}
                          alt={form.type}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div style={{
                          position: "absolute", inset: 0,
                          background: "linear-gradient(to right, rgba(0,0,0,0.4), transparent)",
                          display: "flex", alignItems: "center", paddingLeft: 16,
                        }}>
                          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                            ✓ {form.type} selected
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Location + Status */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Location / Area *</label>
                      <input
                        style={inputStyle}
                        placeholder="e.g. RS Puram, Coimbatore"
                        value={form.location}
                        onChange={e => set("location", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Listing Status</label>
                      <div style={{ display: "flex", gap: 10 }}>
                        {["For Sale", "For Rent"].map(s => (
                          <button
                            key={s} type="button"
                            onClick={() => set("status", s)}
                            style={{
                              flex: 1, padding: "10px 0",
                              border: form.status === s ? "2px solid #6366f1" : "2px solid #e5e7eb",
                              borderRadius: 10,
                              background: form.status === s ? "#eef2ff" : "#fafafa",
                              color: form.status === s ? "#4f46e5" : "#6b7280",
                              fontWeight: 700, fontSize: 12, cursor: "pointer",
                            }}
                          >
                            {s === "For Sale" ? "🏷️" : "🔑"} {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 1: DETAILS ── */}
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: "0 0 6px" }}>
                      Property Details
                    </h2>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
                      Provide pricing and specifications
                    </p>
                  </div>

                  {/* Price */}
                  <div>
                    <label style={labelStyle}>Price (₹) *</label>
                    <div style={{ position: "relative" }}>
                      <span style={{
                        position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                        fontSize: 16, fontWeight: 700, color: "#6b7280",
                      }}>₹</span>
                      <input
                        style={{ ...inputStyle, paddingLeft: 32 }}
                        type="number"
                        placeholder="e.g. 5000000"
                        value={form.price}
                        onChange={e => set("price", e.target.value)}
                        required
                        min={1}
                      />
                    </div>
                    {form.price && Number(form.price) > 0 && (
                      <p style={{ fontSize: 12, color: "#6366f1", marginTop: 4, fontWeight: 600 }}>
                        = ₹ {(Number(form.price) / 100000).toFixed(2)} Lakh
                      </p>
                    )}
                  </div>

                  {/* Bedrooms / Bathrooms / Area */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>🛏 Bedrooms</label>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {[1, 2, 3, 4, 5, 6].map(n => (
                          <button
                            key={n} type="button"
                            onClick={() => set("bedrooms", n)}
                            style={{
                              width: 36, height: 36, borderRadius: 8,
                              border: Number(form.bedrooms) === n ? "2px solid #6366f1" : "1.5px solid #e5e7eb",
                              background: Number(form.bedrooms) === n ? "#eef2ff" : "#fafafa",
                              color: Number(form.bedrooms) === n ? "#4f46e5" : "#374151",
                              fontWeight: 700, fontSize: 13, cursor: "pointer",
                            }}
                          >{n}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>🛁 Bathrooms</label>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {[1, 2, 3, 4].map(n => (
                          <button
                            key={n} type="button"
                            onClick={() => set("bathrooms", n)}
                            style={{
                              width: 36, height: 36, borderRadius: 8,
                              border: Number(form.bathrooms) === n ? "2px solid #6366f1" : "1.5px solid #e5e7eb",
                              background: Number(form.bathrooms) === n ? "#eef2ff" : "#fafafa",
                              color: Number(form.bathrooms) === n ? "#4f46e5" : "#374151",
                              fontWeight: 700, fontSize: 13, cursor: "pointer",
                            }}
                          >{n}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>📐 Area (sqft)</label>
                      <input
                        style={inputStyle}
                        type="number"
                        placeholder="e.g. 1200"
                        value={form.area}
                        onChange={e => set("area", e.target.value)}
                        min={1}
                      />
                    </div>
                  </div>

                  {/* Summary card */}
                  {(form.price || form.bedrooms || form.area) && (
                    <div style={{
                      background: "#f8fafc", border: "1px solid #e5e7eb",
                      borderRadius: 12, padding: "14px 18px",
                      display: "flex", gap: 24, flexWrap: "wrap",
                    }}>
                      {form.price && (
                        <div>
                          <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>PRICE</p>
                          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1e293b" }}>
                            ₹ {Number(form.price).toLocaleString("en-IN")}
                          </p>
                        </div>
                      )}
                      {form.bedrooms && (
                        <div>
                          <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>BEDROOMS</p>
                          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{form.bedrooms} BHK</p>
                        </div>
                      )}
                      {form.bathrooms && (
                        <div>
                          <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>BATHROOMS</p>
                          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{form.bathrooms}</p>
                        </div>
                      )}
                      {form.area && (
                        <div>
                          <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>AREA</p>
                          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{form.area} sqft</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 2: LOCATION + IMAGE ── */}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: "0 0 6px" }}>
                      Location & Image
                    </h2>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
                      Pin the property on map and upload a photo
                    </p>
                  </div>

                  {/* Map */}
                  <div>
                    <label style={labelStyle}>📍 Pin Location on Map *</label>
                    <div style={{
                      borderRadius: 12, overflow: "hidden",
                      border: mapLocation ? "2px solid #16a34a" : "2px solid #e5e7eb",
                    }}>
                      <MapPicker setLatLng={setMapLocation} />
                    </div>
                    {mapLocation ? (
                      <p style={{ fontSize: 12, color: "#16a34a", marginTop: 6, fontWeight: 600 }}>
                        ✓ Location pinned: {mapLocation.lat.toFixed(5)}, {mapLocation.lng.toFixed(5)}
                      </p>
                    ) : (
                      <p style={{ fontSize: 12, color: "#f97316", marginTop: 6 }}>
                        Click on the map to pin your property location
                      </p>
                    )}
                  </div>

                  {/* Image upload */}
                  <div>
                    <label style={labelStyle}>📷 Property Photo (optional)</label>
                    <div
                      onClick={() => fileRef.current.click()}
                      style={{
                        border: imagePreview ? "2px solid #16a34a" : "2px dashed #c7d2fe",
                        borderRadius: 12,
                        minHeight: 140,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", overflow: "hidden", position: "relative",
                        background: imagePreview ? "transparent" : "#f5f3ff",
                        transition: "border 0.2s",
                      }}
                    >
                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview}
                            alt="preview"
                            style={{ width: "100%", maxHeight: 200, objectFit: "cover" }}
                          />
                          <div style={{
                            position: "absolute", top: 8, right: 8,
                            background: "#16a34a", color: "#fff",
                            borderRadius: 8, padding: "3px 10px",
                            fontSize: 11, fontWeight: 700,
                          }}>✓ Photo uploaded</div>
                        </>
                      ) : (
                        <div style={{ textAlign: "center", padding: 24 }}>
                          <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
                          <p style={{ color: "#6366f1", fontWeight: 600, margin: 0 }}>
                            Click to upload a photo
                          </p>
                          <p style={{ color: "#9ca3af", fontSize: 12, margin: "4px 0 0" }}>
                            JPG, PNG up to 5MB · If skipped, a type-matched image will be used
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageSelect}
                    />
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        style={{
                          marginTop: 8, background: "none", border: "none",
                          color: "#ef4444", fontSize: 12, cursor: "pointer",
                          fontWeight: 600, padding: 0,
                        }}
                      >✕ Remove photo</button>
                    )}
                  </div>

                  {/* Final preview */}
                  <div style={{
                    background: "#f8fafc", border: "1px solid #e5e7eb",
                    borderRadius: 14, padding: "16px 20px",
                  }}>
                    <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#374151" }}>
                      📋 Listing Summary
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                      {[
                        ["Title",     form.title],
                        ["Type",      form.type],
                        ["Location",  form.location],
                        ["Status",    form.status],
                        ["Price",     form.price ? `₹ ${Number(form.price).toLocaleString("en-IN")}` : "—"],
                        ["Bedrooms",  form.bedrooms ? `${form.bedrooms} BHK` : "—"],
                        ["Bathrooms", form.bathrooms || "—"],
                        ["Area",      form.area ? `${form.area} sqft` : "—"],
                      ].map(([k, v]) => (
                        <div key={k} style={{ display: "flex", gap: 8 }}>
                          <span style={{ fontSize: 11, color: "#9ca3af", minWidth: 70, fontWeight: 600 }}>{k}</span>
                          <span style={{ fontSize: 12, color: "#1e293b", fontWeight: 600 }}>{v || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── NAVIGATION BUTTONS ── */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginTop: 16,
            }}>
              <button
                type="button"
                onClick={() => step === 0 ? navigate("/properties") : setStep(s => s - 1)}
                style={{
                  padding: "11px 24px", border: "1.5px solid #e5e7eb", borderRadius: 10,
                  background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {step === 0 ? "← Cancel" : "← Back"}
              </button>

              {step < 2 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  style={{
                    padding: "11px 32px", background: "linear-gradient(135deg,#6366f1,#818cf8)",
                    border: "none", borderRadius: 10, color: "#fff",
                    fontWeight: 700, fontSize: 14, cursor: "pointer",
                  }}
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "11px 32px",
                    background: submitting ? "#a5b4fc" : "linear-gradient(135deg,#16a34a,#22c55e)",
                    border: "none", borderRadius: 10, color: "#fff",
                    fontWeight: 700, fontSize: 14,
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Publishing..." : "✓ Publish Listing"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 700,
  color: "#374151", marginBottom: 7, letterSpacing: "0.02em",
};

const inputStyle = {
  width: "100%", padding: "11px 14px",
  border: "1.5px solid #e5e7eb", borderRadius: 10,
  fontSize: 14, color: "#1e293b", outline: "none",
  background: "#fafafa", boxSizing: "border-box",
  transition: "border 0.2s",
};

export default AddProperty;
