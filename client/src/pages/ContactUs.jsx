import { useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { AuthContext } from "../context/AuthContext";
import { Mail, User, MessageSquare, Send } from "lucide-react";
import axios from "axios";

const ContactUs = () => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [status, setStatus] = useState("idle"); // idle, submitting, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("submitting");
        try {
            await axios.post("http://localhost:5000/api/contact", formData);
            setStatus("success");
            setFormData({ name: "", email: "", message: "" });
        } catch (err) {
            console.error(err);
            setStatus("error");
        }
    };

    return (
        <div className="app-layout">
            <Sidebar role={user.role} />
            <div className="main-content">
                <Topbar showSearch={false} />

                <div className="page-body" style={{ justifyContent: "center", alignItems: "center", padding: "40px" }}>
                    <div className="card fade-in" style={{ width: "100%", maxWidth: "600px" }}>
                        <h2 className="section-title" style={{ textAlign: "center", marginBottom: "32px", fontSize: "2rem" }}>Contact Us</h2>

                        {status === "success" && (
                            <div style={{ padding: "16px", background: "#dcfce7", color: "#166534", borderRadius: "8px", marginBottom: "24px", textAlign: "center" }}>
                                Message sent successfully! We will get back to you soon.
                            </div>
                        )}

                        {status === "error" && (
                            <div style={{ padding: "16px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", marginBottom: "24px", textAlign: "center" }}>
                                Failed to send message. Please try again.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Name</label>
                                <div style={{ position: "relative" }}>
                                    <User size={20} color="#9ca3af" style={{ position: "absolute", left: "12px", top: "12px" }} />
                                    <input
                                        type="text"
                                        required
                                        className="input-field"
                                        style={{ paddingLeft: "40px" }}
                                        placeholder="Your Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Email</label>
                                <div style={{ position: "relative" }}>
                                    <Mail size={20} color="#9ca3af" style={{ position: "absolute", left: "12px", top: "12px" }} />
                                    <input
                                        type="email"
                                        required
                                        className="input-field"
                                        style={{ paddingLeft: "40px" }}
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Message</label>
                                <div style={{ position: "relative" }}>
                                    <MessageSquare size={20} color="#9ca3af" style={{ position: "absolute", left: "12px", top: "12px" }} />
                                    <textarea
                                        required
                                        className="input-field"
                                        style={{ paddingLeft: "40px", minHeight: "120px", resize: "vertical" }}
                                        placeholder="How can we help you?"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={status === "submitting"}
                                style={{ marginTop: "16px", padding: "12px" }}
                            >
                                {status === "submitting" ? (
                                    "Sending..."
                                ) : (
                                    <>
                                        <Send size={18} style={{ marginRight: "8px" }} />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
