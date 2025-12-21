import { useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Menu, ArrowRight, Eye, EyeOff } from "lucide-react";
import "../styles/layout.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    // Validation
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password
      });

      login(res.data);

      if (res.data.role === "admin") navigate("/admin");
      else navigate("/dashboard");
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || err.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in" style={{ padding: "48px", maxWidth: "420px" }}>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px",
            height: "56px",
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px auto",
            boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.3)"
          }}>
            <Menu size={32} color="white" />
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#111827", marginBottom: "8px" }}>Welcome Back</h2>
          <p style={{ color: "#6b7280" }}>Sign in to access your dashboard</p>
        </div>

        <div className="auth-form">
          {error && (
            <div style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "14px",
              textAlign: "center",
              border: "1px solid #fecaca"
            }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151", fontSize: "14px" }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} color="#9ca3af" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: "40px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151", fontSize: "14px" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} color="#9ca3af" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: "40px", paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af"
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>



          <button
            onClick={handleLogin}
            className="btn btn-primary"
            style={{
              marginTop: "8px",
              padding: "14px",
              fontSize: "16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px"
            }}
          >
            Sign In <ArrowRight size={18} />
          </button>

          <p style={{ textAlign: "center", color: "#6b7280", marginTop: "24px", fontSize: "14px" }}>
            Don’t have an account? <Link to="/signup" style={{ color: "#3b82f6", fontWeight: "600" }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
