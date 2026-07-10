import { useState } from "react";
import API_BASE from "../config";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";

function Register() {
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      toast("Username cannot be empty", "warning");
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast("Please enter a valid email", "error");
      return;
    }

    if (password.length < 6) {
      toast("Password must be at least 6 characters", "error");
      return;
    }

    if (!agree) {
      toast("Please agree to the terms of service", "warning");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, {
        name: username, username, email, password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", String(res.data.userId));
      localStorage.setItem("userName", res.data.name || username);

      toast("Registration successful!", "success");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      toast(err.response?.data?.message || "Registration failed", "error");
    }

  };

  return (
    <div className="register-page">
      <div className="register-overlay"></div>

      <div className="register-container">
        <h2>REGISTER</h2>
        <p>Register now by filling your details</p>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="terms">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            I agree to the terms of service.
          </label>

          <button type="submit">Register Now →</button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
