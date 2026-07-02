import { useEffect, useState, useRef } from "react";
import API_BASE from '../config';
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useToast } from "../components/Toast";

function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const toast = useToast();

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

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    axios.get(`${API_BASE}/api/properties/${id}`).then((res) => {
      const p = res.data;
      setForm({
        title: p.title || "",
        type: p.type || "",
        location: p.location || "",
        price: p.price || "",
        bedrooms: p.bedrooms || "",
        bathrooms: p.bathrooms || "",
        area: p.area || "",
        status: p.status || "For Sale"
      });
      if (p.image) setImagePreview(p.image);
    });
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API_BASE}/api/properties/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        await axios.post(`${API_BASE}/api/properties/${id}/image`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      toast("Property updated successfully", "success");
      setTimeout(() => navigate("/properties"), 1200);
    } catch {
      toast("Error updating property", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
        <div style={{ maxWidth: "560px", margin: "30px auto", background: "#fff", padding: "28px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <h2 style={{ marginBottom: "20px" }}>Edit Property</h2>

          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Property Title</label>
              <input name="title" value={form.title} onChange={handleChange} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
            </div>

            <div className="form-group" style={{ marginTop: "12px" }}>
              <label>Property Type</label>
              <select name="type" value={form.type} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}>
                <option value="">Select</option>
                <option>Apartment</option>
                <option>House</option>
                <option>Villa</option>
                <option>Flat</option>
              </select>
            </div>

            <div className="form-group" style={{ marginTop: "12px" }}>
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Price</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}>
                  <option>For Sale</option>
                  <option>For Rent</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Bedrooms</label>
                <input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Bathrooms</label>
                <input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Area (sqft)</label>
                <input name="area" type="number" value={form.area} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "16px" }}>
              <label>Property Image</label>
              <div
                onClick={() => fileInputRef.current.click()}
                style={{ border: "2px dashed #6366f1", borderRadius: "10px", padding: "14px", textAlign: "center", cursor: "pointer", background: "#f5f3ff", marginTop: "6px" }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" style={{ width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "8px" }} />
                ) : (
                  <span style={{ color: "#6366f1" }}>📷 Click to change image</span>
                )}
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleImageSelect} />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: "20px", width: "100%", padding: "12px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer" }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
    </AppLayout>
  );
}

export default EditProperty;
