import { useState } from "react";
import API_BASE from '../config';
import axios from "axios";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return alert("Passwords do not match");
    }

    if (newPassword.length < 6) {
      return alert("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/reset-password", {
        email,
        newPassword
      });

      alert("Password reset successful! Please login.");
      window.location.href = "/";
    } catch (err) {
      alert(err.response?.data?.message || "Reset failed. Check your email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
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
            placeholder="New password"
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
