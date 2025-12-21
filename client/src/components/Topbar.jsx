import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { LocationContext } from "../context/LocationContext";

import { LogOut, Search, MapPin, Bell, AlertTriangle } from "lucide-react";
import axios from "axios";

const Topbar = ({ showSearch = true }) => {
  const { logout } = useContext(AuthContext);
  const { setSearchedLocation } = useContext(LocationContext);
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastReadTime, setLastReadTime] = useState(new Date(0)); // Start with all unread

  // Derived state for unread count
  const unreadCount = notifications.filter(n => new Date(n.createdAt) > lastReadTime).length;

  const handleToggleNotifications = () => {
    if (!showNotifications) {
      // Opening: Mark as read
      setLastReadTime(new Date());
    }
    setShowNotifications(!showNotifications);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/incidents");
        setNotifications(res.data.slice(0, 10)); // Top 10 recent
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    fetchNotifications();

    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
      if (res.data && res.data.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        setSearchedLocation({
          lat: parseFloat(lat),
          lng: parseFloat(lon),
          displayName: display_name
        });
      } else {
        alert("Location not found");
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="topbar">
      <div className="status-badge">
        <div className="status-dot"></div>
        <span>System Online</span>
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        {showSearch && (
          <form onSubmit={handleSearch} style={{ width: "100%", maxWidth: "400px", margin: "0 10px", position: "relative" }}>
            <Search size={18} color="#9ca3af" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              placeholder="Search location..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field"
              style={{
                paddingLeft: "40px",
                marginBottom: 0,
                height: "40px",
                background: "#f3f4f6",
                border: "none",
                borderRadius: "20px"
              }}
            />
            {loading && <div className="spinner" style={{ position: "absolute", right: "12px", top: "12px", width: "16px", height: "16px", border: "2px solid #ccc", borderTopColor: "#333", borderRadius: "50%" }}></div>}
          </form>
        )}

        {/* NOTIFICATION BELL */}
        <div style={{ position: "relative", marginRight: "20px", display: "flex", alignItems: "center" }}>
          <button
            onClick={handleToggleNotifications}
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative"
            }}
          >
            <Bell size={20} color="#4b5563" />
            {unreadCount > 0 && (
              <div style={{
                position: "absolute",
                top: "0px",
                right: "0px",
                background: "#ef4444",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                border: "2px solid white"
              }}></div>
            )}
          </button>

          {/* DROPDOWN */}
          {showNotifications && (
            <div className="card fade-in" style={{
              position: "absolute",
              top: "50px",
              right: "0",
              width: "320px",
              padding: "0",
              maxHeight: "400px",
              overflowY: "auto",
              zIndex: 9999,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
            }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", fontWeight: "700", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Notifications</span>
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>No new notifications</div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif._id} style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", gap: "12px" }}>
                    <div style={{ marginTop: "2px" }}>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: notif.type === "ACCIDENT" ? "#fee2e2" : "#e0f2fe",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <AlertTriangle size={16} color={notif.type === "ACCIDENT" ? "#ef4444" : "#0ea5e9"} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", color: "#1f2937", fontSize: "14px", marginBottom: "2px" }}>{notif.type} Reported</div>
                      <div style={{ fontSize: "13px", color: "#4b5563", marginBottom: "4px" }}>{notif.description}</div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "2px" }}>
                        📍 {notif.lat?.toFixed(4)}, {notif.lng?.toFixed(4)}
                      </div>
                      <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {notif.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <button onClick={logout} className="btn btn-danger" style={{ padding: "8px 16px" }}>
        <LogOut size={16} style={{ marginRight: "8px" }} />
        Logout
      </button>
    </div>
  );
};

export default Topbar;
