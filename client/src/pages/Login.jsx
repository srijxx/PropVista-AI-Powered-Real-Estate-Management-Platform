import { useState, useEffect } from "react";
import API_BASE from "../config";
import axios from "axios";
import { Link } from "react-router-dom";
import { useToast } from "../components/Toast";

const heroImg = "https://thermohouse.ie/wp-content/uploads/2019/04/hero-image.jpg";

function Login() {
  const toast = useToast();

  // modal
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState("signin");

  // sign in
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // sign up
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regAgree, setRegAgree] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  // Auto-open signup modal if redirected from logout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "signup") {
      setModalTab("signup");
      setShowModal(true);
    }
  }, []);

  const openSignIn = () => { setModalTab("signin"); setShowModal(true); };
  const openSignUp = () => { setModalTab("signup"); setShowModal(true); };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast("Please enter a valid email", "error");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", res.data.token);
      localStorage.setItem("userId", String(res.data.userId));
      localStorage.setItem("userName", res.data.name || email.split("@")[0]);
      window.location.href = "/dashboard";
    } catch (err) {
      toast(err.response?.data?.message || "Invalid email or password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regUsername.trim()) { toast("Username cannot be empty", "warning"); return; }
    if (!regEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { toast("Please enter a valid email", "error"); return; }
    if (regPassword.length < 6) { toast("Password must be at least 6 characters", "error"); return; }
    if (!regAgree) { toast("Please agree to the terms of service", "warning"); return; }
    try {
      setRegLoading(true);
      const res = await axios.post(`${API_BASE}/api/auth/register`, {
        name: regUsername, username: regUsername, email: regEmail, password: regPassword,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", String(res.data.userId));
      localStorage.setItem("userName", res.data.name || regUsername);
      toast("Registration successful!", "success");
      setTimeout(() => { window.location.href = "/dashboard"; }, 1000);
    } catch (err) {
      toast(err.response?.data?.message || "Registration failed", "error");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="landing-page">
      {/* ── TOP NAVBAR ── */}
      <nav className="landing-nav">
        <div className="landing-nav-logo"><span>🏠</span> PropVista</div>
      </nav>

      {/* ── HERO ── */}
      <div className="landing-hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="landing-hero-overlay">
          <h1 className="landing-hero-title">Find the right home<br />at the right price</h1>
          <p className="landing-hero-sub">Manage, explore and list properties with PropVista</p>
          <div className="landing-hero-actions">
            <button className="landing-signin-btn" onClick={openSignIn}>Sign In</button>
            <button className="landing-register-btn" onClick={openSignUp}>Register</button>
          </div>
        </div>
      </div>

      {/* ── FEATURE STRIP ── */}
      <div className="landing-features">
        {[
          { icon: "🏡", title: "Browse Listings", desc: "Explore thousands of properties" },
          { icon: "📍", title: "Map View", desc: "Find homes near you on the map" },
          { icon: "💬", title: "Contact Owners", desc: "Reach out directly to sellers" },
          { icon: "📊", title: "Dashboard", desc: "Track your properties in one place" },
        ].map((f) => (
          <div key={f.title} className="landing-feature-card">
            <span className="landing-feature-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div className="landing-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="landing-modal" onClick={(e) => e.stopPropagation()}>
            <button className="landing-modal-close" onClick={() => setShowModal(false)}>✕</button>

            {/* TABS */}
            <div className="modal-tabs">
              <button
                className={"modal-tab-btn" + (modalTab === "signin" ? " active" : "")}
                onClick={() => setModalTab("signin")}
              >Sign In</button>
              <button
                className={"modal-tab-btn" + (modalTab === "signup" ? " active" : "")}
                onClick={() => setModalTab("signup")}
              >Sign Up</button>
            </div>

            {/* SIGN IN */}
            {modalTab === "signin" && (
              <>
                <p className="landing-modal-sub">Welcome back to PropVista</p>
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <input className="login-input" type="email" placeholder="Email address"
                    value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <input className="login-input" type="password" placeholder="Password"
                    value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <div className="login-options">
                    <label>
                      <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                      {" "}Remember Me
                    </label>
                    <Link to="/forgot-password" onClick={() => setShowModal(false)}>Forgot Password?</Link>
                  </div>
                  <button className="login-btn" type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </form>
                <p style={{ textAlign: "center", marginTop: "14px", fontSize: "14px", color: "#6b7280" }}>
                  No account?{" "}
                  <button onClick={() => setModalTab("signup")}
                    style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}>
                    Sign Up
                  </button>
                </p>
              </>
            )}

            {/* SIGN UP */}
            {modalTab === "signup" && (
              <>
                <p className="landing-modal-sub">Create your PropVista account</p>
                <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <input className="login-input" type="text" placeholder="Username"
                    value={regUsername} onChange={(e) => setRegUsername(e.target.value)} required />
                  <input className="login-input" type="email" placeholder="Email address"
                    value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                  <input className="login-input" type="password" placeholder="Password"
                    value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
                  <label style={{ fontSize: "13px", color: "#374151", display: "flex", alignItems: "flex-start", gap: "8px", lineHeight: "1.5" }}>
                    <input type="checkbox" checked={regAgree} onChange={(e) => setRegAgree(e.target.checked)} style={{ marginTop: "2px", flexShrink: 0 }} />
                    <span>
                      I agree to PropVista's{" "}
                      <span style={{ color: "#2563eb", cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => window.open("/policy", "_blank")}>
                        Terms of Service
                      </span>{" "}and{" "}
                      <span style={{ color: "#2563eb", cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => window.open("/policy", "_blank")}>
                        Privacy Policy
                      </span>
                    </span>
                  </label>
                  <button className="login-btn" type="submit" disabled={regLoading}>
                    {regLoading ? "Creating account..." : "Create Account"}
                  </button>
                </form>
                <p style={{ textAlign: "center", marginTop: "14px", fontSize: "14px", color: "#6b7280" }}>
                  Already have an account?{" "}
                  <button onClick={() => setModalTab("signin")}
                    style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}>
                    Sign In
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
