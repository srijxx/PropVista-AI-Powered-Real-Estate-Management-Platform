import AppLayout from "../components/AppLayout";
import MapPicker from "../components/MapPicker";
import { useState, useRef } from "react";
import { useToast } from "../components/Toast";

function AddProperty() {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    status: "For Sale"
  });

  const [mapLocation, setMapLocation] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      lat: mapLocation?.lat,
      lng: mapLocation?.lng
    };

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      setSubmitting(true);

      const res = await fetch("http://localhost:5000/api/properties/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const saved = await res.json();
      if (!res.ok) { toast(saved.message || "Failed to add property", "error"); return; }

      if (imageFile && saved._id) {
        const formData = new FormData();
        formData.append("image", imageFile);
        await fetch(`http://localhost:5000/api/properties/${saved._id}/image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
      }

      toast("Property added successfully!", "success");
      setTimeout(() => { window.location.href = "/properties"; }, 1200);
    } catch (err) {
      toast("Failed to add property", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div
        className="add-property-page"
        style={{
          backgroundImage: "url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=900&fit=crop)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          minHeight: "calc(100vh - 60px)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "-24px -28px",
          padding: "40px 28px",
        }}
      >
        {/* 3D depth overlay — gradient from dark bottom to transparent top */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          background: "linear-gradient(160deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.65) 100%)",
          backdropFilter: "blur(1px)"
        }} />
        <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

          <h1 className="add-property-title">ADD PROPERTY</h1>

          <form
            className="property-form"
            onSubmit={handleSubmit}
            style={{
              background: "rgba(255,255,255,0.95)",
              padding: "25px",
              borderRadius: "16px",
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
            }}
          >
            <div className="form-group">
              <label>Property Title</label>
              <input name="title" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Property Type</label>
              <select name="type" onChange={handleChange} required>
                <option value="">Select</option>
                <option>Apartment</option>
                <option>House</option>
                <option>Villa</option>
                <option>Flat</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input name="location" onChange={handleChange} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price</label>
                <input name="price" type="number" onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" onChange={handleChange}>
                  <option>For Sale</option>
                  <option>For Rent</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Bedrooms</label>
                <input name="bedrooms" type="number" onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Bathrooms</label>
                <input name="bathrooms" type="number" onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Area (sqft)</label>
                <input name="area" type="number" onChange={handleChange} />
              </div>
            </div>

            {/* IMAGE UPLOAD */}
            <div className="form-group">
              <label>Property Image</label>
              <div
                onClick={() => fileInputRef.current.click()}
                style={{
                  border: "2px dashed #6366f1",
                  borderRadius: "10px",
                  padding: "16px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "#f5f3ff"
                }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" style={{ width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "8px" }} />
                ) : (
                  <span style={{ color: "#6366f1" }}>📷 Click to upload image</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageSelect}
              />
            </div>

            <h4>Select Property Location on Map</h4>
            <MapPicker setLatLng={setMapLocation} />

            {mapLocation && (
              <p style={{ fontSize: "12px", color: "#6b7280" }}>
                📍 Lat: {mapLocation.lat.toFixed(5)}, Lng: {mapLocation.lng.toFixed(5)}
              </p>
            )}

            <button className="submit-btn" disabled={submitting}>
              {submitting ? "Adding..." : "Add Property"}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

export default AddProperty;
