import { useState, useRef, useEffect } from "react";
import API_BASE from "../config";
import AppLayout from "../components/AppLayout";
import { useToast } from "../components/Toast";

function Profile() {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const USER_ID = localStorage.getItem("userId");
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const [avatar, setAvatar] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    birth: "",
    gender: ""
  });

  // ✅ FETCH PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/users/profile/${USER_ID}`
        );
        const data = await res.json();

        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
          birth: data.birth ? data.birth.slice(0, 10) : "",
          gender: data.gender || ""
        });

        // ✅ ONLY filename
        if (data.avatar) {
          setAvatar(data.avatar);
        } else {
          setAvatar(null);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    fetchProfile();
  }, [USER_ID]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 📸 UPLOAD PROFILE PHOTO
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatar(previewUrl); // show preview immediately

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(
        `${API_BASE}/api/users/profile/${USER_ID}/avatar`,
        { method: "POST", body: formData, headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (data.avatar) setAvatar(data.avatar);
      toast("Photo updated!", "success");
    } catch (err) {
      console.error("Avatar upload failed:", err);
      toast("Failed to upload photo", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/profile/${USER_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        toast("Profile saved successfully", "success");
      } else {
        toast("Failed to save profile", "error");
      }
    } catch {
      toast("Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
        <div className="profile-card">
          {/* AVATAR */}
          <div className="avatar-section">
            <div
              className="profile-avatar-wrapper"
              onClick={() => fileInputRef.current.click()}
              style={{ cursor: "pointer" }}
            >
              <img
                src={
                  avatar
                    ? avatar.startsWith("blob:")
                      ? avatar
                      : `${API_BASE}/uploads/${avatar}`
                    : "https://ui-avatars.com/api/?name=User&size=150&background=6366f1&color=fff&rounded=true"
                }
                alt="profile"
                className="profile-avatar-img"
              />
              <span className="profile-avatar-edit">✏️</span>
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>

          <h2>Edit Profile</h2>

          <form className="profile-form" onSubmit={handleSubmit}>
            <label>First Name</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} />

            <label>Last Name</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} />

            <label>Username</label>
            <input name="username" value={form.username} onChange={handleChange} />

            <label>Email</label>
            <input name="email" value={form.email} onChange={handleChange} />

            <label>Phone Number</label>
            <input name="phone" value={form.phone} onChange={handleChange} />

            <label>Birth</label>
            <input type="date" name="birth" value={form.birth} onChange={handleChange} />

            <label>Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>

            <button className="save-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
    </AppLayout>
  );
}

export default Profile;
