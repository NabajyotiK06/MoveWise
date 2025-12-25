import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "../styles/layout.css";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    adminSecretKey: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    // Validation
    const { name, email, password } = form;
    if (!name || !email || !password) {
      alert("Please fill in all fields");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/auth/signup", form);
      alert("Signup successful. Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <h2 className="auth-title">Create Account</h2>

        <div className="auth-form">
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#374151" }}>Full Name</label>
            <input
              name="name"
              placeholder="John Doe"
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#374151" }}>Email</label>
            <input
              name="email"
              placeholder="john@example.com"
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#374151" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                onChange={handleChange}
                className="input-field"
                style={{ paddingRight: "40px" }}
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

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#374151" }}>Role</label>
            <select
              name="role"
              onChange={handleChange}
              className="input-field"
            >
              <option value="user">Public User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {form.role === "admin" && (
            <div className="fade-in">
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#374151" }}>
                Admin Secret Key
              </label>
              <input
                type="password"
                name="adminSecretKey"
                placeholder="Enter admin secret key"
                onChange={handleChange}
                className="input-field"
              />
            </div>
          )}

          <button onClick={handleSignup} className="btn btn-primary" style={{ marginTop: "16px", padding: "12px" }}>
            Sign Up
          </button>

          <p style={{ textAlign: "center", color: "#6b7280", marginTop: "16px" }}>
            Already have an account? <Link to="/login" style={{ color: "#3b82f6", fontWeight: "600" }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
