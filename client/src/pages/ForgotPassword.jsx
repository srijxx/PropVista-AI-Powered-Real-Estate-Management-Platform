import { useState } from "react";
import API_BASE from "../config";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";

function ForgotPassword() {
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast("Email is required", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast("Please enter a valid email", "error");
      return;
    }
    if (newPassword.length < 6) {
      toast("Password must be at least 6 characters", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/reset-password`, {
        email: email.trim().toLowerCase(),
        newPassword,
      });
      toast("Password reset successful! Please login.", "success");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      toast(err.response?.data?.message || "Reset failed. Check your email.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div
        className="login-left"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="image-overlay">
          <h1>Reset Your Password</h1>
          <p>Enter your email and choose a new password to regain access.</p>
        </div>
      </div>

      <div className="login-right">
        <h2>Forgot Password</h2>
        <p>Enter your registered email and set a new password</p>

        <form onSubmit={handleReset}>
          <label>Your Email</label>
          <input
            className="login-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>New Password</label>
          <input
            className="login-input"
            type="password"
            placeholder="New password (min 6 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <label>Confirm Password</label>
          <input
            className="login-input"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="register-text">
          Remember it? <Link to="/">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
