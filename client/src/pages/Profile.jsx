import { useState, useRef, useEffect, useCallback } from "react";
import API_BASE from "../config";
import { useToast } from "../components/Toast";
import { useNavigate, NavLink } from "react-router-dom";
import Notifications from "../components/Notifications";
import "./dashboard.css";

const sideLinks = [
  { icon: "📊", label: "Dashboard",   to: "/dashboard" },
  { icon: "🏢", label: "Properties",  to: "/properties" },
  { icon: "🗺️", label: "Map View",    to: "/explore" },
  { icon: "🔍", label: "AI Search",   to: "/ai-search" },
  { icon: "📅", label: "My Bookings", to: "/bookings" },
  { icon: "➕", label: "Add Property", to: "/add-property" },
  { icon: "👤", label: "Profile",     to: "/profile" },
  { icon: "⚙️", label: "Settings",    to: "/settings" },
];

const fieldStyle = {
  width: "100%", padding: "10px 14px",
  border: "1.5px solid #e5e7eb", borderRadius: 10,
  fontSize: 14, color: "#1e293b", outline: "none",
  background: "#fafafa", boxSizing: "border-box",
};

function Profile() {
  const toast        = useToast();
  const navigate     = useNavigate();
  const fileInputRef = useRef(null);

  const USER_ID = localStorage.getItem("userId");
  const token   = localStorage.getItem("token") || sessionStorage.getItem("token");

  const [avatar,  setAvatar]  = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    firstName: "",
    lastName:  "",
    username:  "",
    email:     "",
    phone:     "",
    birth:     "",
    gender:    "",
  });

  const fetchProfile = useCallback(async () => {
    if (!USER_ID || !token) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/users/profile/${USER_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setForm({
        firstName: data.firstName || "",
        lastName:  data.lastName  || "",
        username:  data.username  || "",
        email:     data.email     || "",
        phone:     data.phone     || "",
        birth:     data.birth ? data.birth.slice(0, 10) : "",
        gender:    data.gender    || "",
      });

      if (data.avatar) setAvatar(data.avatar);
    } catch (err) {
      toast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  }, [USER_ID, token, toast]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(URL.createObjectURL(file));
    const fd = new FormData();
    fd.append("avatar", file);
    try {
      const res  = await fetch(`${API_BASE}/api/users/profile/${USER_ID}/avatar`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      if (data.avatar) setAvatar(data.avatar);
      toast("Photo updated!", "success");
    } catch (err) {
      toast(err.message || "Failed to upload photo", "error");
      fetchProfile();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.phone && !/^\+?\d{7,15}$/.test(form.phone.trim())) {
      toast("Invalid phone number (7–15 digits)", "error");
      return;
    }
    setSaving(true);
    try {
      const body = { ...form };
      delete body.email;
      const res  = await fetch(`${API_BASE}/api/users/profile/${USER_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast("Profile saved successfully", "success");
    } catch (err) {
      toast(err.message || "Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = avatar
    ? avatar.startsWith("blob:") || avatar.startsWith("http")
      ? avatar
      : `${API_BASE}/uploads/${avatar}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(form.username || form.firstName || "User")}&size=150&background=6366f1&color=fff&rounded=true`;

  return (
    <div className="ndb-root">

      {/* ── SIDEBAR ── */}
      <aside className="ndb-sidebar">
        <div className="ndb-logo" onClick={() => navigate("/dashboard")}>
          <span>🏠</span> PropVista
        </div>
        <nav className="ndb-nav">
          {sideLinks.map(l => (
            <NavLink key={l.to} to={l.to}
              className={({ isActive }) => "ndb-link" + (isActive ? " ndb-active" : "")}>
              <span>{l.icon}</span> {l.label}
            </NavLink>
          ))}
          <button className="ndb-link ndb-link-danger"
            onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.href = "/"; }}>
            <span>⎋</span> Logout
          </button>
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <div className="ndb-main" style={{ overflowY: "auto" }}>

        {/* Page header */}
        <div className="ndb-header">
          <div>
            <h1 className="ndb-greeting">My Profile</h1>
            <p className="ndb-header-sub">Update your personal information and photo</p>
          </div>
          <div className="ndb-header-right">
            <Notifications />
          </div>
        </div>

        {/* ── PROFILE CARD (centered) ── */}
        <div style={{
          display: "flex", justifyContent: "center",
          padding: "28px 20px 40px",
        }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
              Loading profile...
            </div>
          ) : (
            <div style={{
              background: "#fff", borderRadius: 20,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              padding: "36px 40px",
              width: "100%", maxWidth: 560,
            }}>

              {/* AVATAR */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
                <div
                  onClick={() => fileInputRef.current.click()}
                  style={{ position: "relative", cursor: "pointer" }}
                >
                  <img
                    src={avatarSrc}
                    alt="profile"
                    style={{
                      width: 100, height: 100, borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #e0e7ff",
                    }}
                  />
                  <div style={{
                    position: "absolute", bottom: 2, right: 2,
                    background: "#6366f1", borderRadius: "50%",
                    width: 28, height: 28, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    border: "2px solid #fff", fontSize: 14,
                  }}>✏️</div>
                </div>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: "8px 0 0" }}>
                  Click photo to change
                </p>
                <input
                  type="file" accept="image/*"
                  ref={fileInputRef} style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: "0 0 24px", textAlign: "center" }}>
                Edit Profile
              </h2>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* First + Last name row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={lbl}>First Name</label>
                    <input style={fieldStyle} name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" />
                  </div>
                  <div>
                    <label style={lbl}>Last Name</label>
                    <input style={fieldStyle} name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label style={lbl}>Username</label>
                  <input style={fieldStyle} name="username" value={form.username} onChange={handleChange} placeholder="@username" />
                </div>

                {/* Email read-only */}
                <div>
                  <label style={lbl}>Email (read-only)</label>
                  <input style={{ ...fieldStyle, background: "#f1f5f9", cursor: "not-allowed" }}
                    name="email" value={form.email} readOnly />
                </div>

                {/* Phone */}
                <div>
                  <label style={lbl}>Phone Number</label>
                  <input style={fieldStyle} name="phone" value={form.phone} onChange={handleChange} placeholder="+91XXXXXXXXXX" />
                </div>

                {/* DOB + Gender row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={lbl}>Date of Birth</label>
                    <input style={fieldStyle} type="date" name="birth" value={form.birth} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={lbl}>Gender</label>
                    <select style={fieldStyle} name="gender" value={form.gender} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    width: "100%", padding: "13px",
                    background: saving ? "#a5b4fc" : "linear-gradient(135deg,#6366f1,#818cf8)",
                    color: "#fff", border: "none", borderRadius: 12,
                    fontSize: 15, fontWeight: 700,
                    cursor: saving ? "not-allowed" : "pointer",
                    marginTop: 8,
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const lbl = {
  display: "block", fontSize: 12, fontWeight: 700,
  color: "#374151", marginBottom: 6,
};

export default Profile;

