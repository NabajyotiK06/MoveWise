import { useEffect, useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { LocationContext } from "../context/LocationContext";
import L from "leaflet";
import {
  CheckCircle,
  AlertTriangle,
  Flame,
  Shield,
  Stethoscope,
  Search,
  List,
  MapPin
} from "lucide-react";
import "../styles/layout.css";

/* ---------- MARKER ICONS ---------- */
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const yellowIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const getIconByStatus = (status) => {
  if (status === "UNDER_INVESTIGATION") return yellowIcon;
  if (status === "RESOLVED") return greenIcon;
  return redIcon;
};

/* ---------- MAP UPDATER COMPONENT ---------- */
const MapUpdater = () => {
  const { searchedLocation } = useContext(LocationContext);
  const map = useMap();

  useEffect(() => {
    if (searchedLocation) {
      map.flyTo([searchedLocation.lat, searchedLocation.lng], 14, {
        animate: true,
        duration: 1.5
      });
    }
  }, [searchedLocation, map]);

  return null;
};

const AdminDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activeTab, setActiveTab] = useState("LIVE");
  const [alertedDepartments, setAlertedDepartments] = useState([]);

  // Fetch incidents
  const fetchIncidents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/incidents");
      const data = await res.json();
      setIncidents(data);
    } catch (err) {
      console.error("Failed to fetch incidents", err);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // 🔁 Reset department locks when new incident selected
  // 🔁 Reset department locks when new incident selected
  useEffect(() => {
    if (selectedIncident) {
      setAlertedDepartments(selectedIncident.alertedDepartments || []);
    } else {
      setAlertedDepartments([]);
    }
  }, [selectedIncident]);

  // Update incident status
  const updateIncidentStatus = async (status) => {
    if (!selectedIncident) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/incidents/${selectedIncident._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status })
        }
      );

      const updatedIncident = await res.json();

      setIncidents((prev) =>
        prev.map((inc) =>
          inc._id === updatedIncident._id ? updatedIncident : inc
        )
      );

      if (status === "RESOLVED") {
        setSelectedIncident(null);
      } else {
        setSelectedIncident(updatedIncident);
      }
    } catch (err) {
      console.error("Failed to update incident", err);
    }
  };

  // 🔔 Alert department (LOCK AFTER CLICK)
  const alertDepartment = async (department) => {
    if (!selectedIncident) return;
    if (alertedDepartments.includes(department)) return;

    try {
      const newAlerts = [...(selectedIncident.alertedDepartments || []), department];

      const res = await fetch(
        `http://localhost:5000/api/incidents/${selectedIncident._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alertedDepartments: newAlerts })
        }
      );

      const updatedIncident = await res.json();

      // Update local state
      setIncidents((prev) =>
        prev.map((inc) =>
          inc._id === updatedIncident._id ? updatedIncident : inc
        )
      );
      setSelectedIncident(updatedIncident);
      setAlertedDepartments(updatedIncident.alertedDepartments || []);

      alert(`${department} department alerted for ${selectedIncident.type}`);
    } catch (err) {
      console.error("Failed to alert department", err);
      alert("Failed to update status");
    }
  };

  const liveIncidents = incidents.filter(
    (inc) => inc.status !== "RESOLVED"
  );

  const resolvedIncidents = incidents.filter(
    (inc) => inc.status === "RESOLVED"
  );

  const isLocked = (dept) => alertedDepartments.includes(dept);

  return (
    <div className="app-layout">
      <Sidebar role="admin" />

      <div className="main-content">
        <Topbar />

        <div className="page-body">
          {/* Map */}
          <div className="dashboard-map-container">
            {activeTab === "LIVE" ? (
              <MapContainer
                center={[22.4969, 88.3702]}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapUpdater />

                {liveIncidents.map((inc) => (
                  <Marker
                    key={inc._id}
                    position={[inc.lat, inc.lng]}
                    icon={getIconByStatus(inc.status)}
                    eventHandlers={{
                      click: () => setSelectedIncident(inc)
                    }}
                  />
                ))}
              </MapContainer>
            ) : (
              <div style={{ padding: "24px", overflowY: "auto", height: "100%" }}>
                <h2 className="section-title">Resolved History</h2>

                {resolvedIncidents.length === 0 && <p style={{ color: "#6b7280" }}>No resolved incidents found.</p>}

                {resolvedIncidents.map((inc) => (
                  <div
                    key={inc._id}
                    className="card"
                    style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between" }}
                  >
                    <div>
                      <div style={{ fontWeight: "700", color: "#1f2937" }}>{inc.type}</div>
                      <p style={{ margin: "4px 0", color: "#4b5563" }}>{inc.description}</p>
                      <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                        {new Date(inc.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="status-badge">
                      resolved
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="dashboard-sidebar">
            <div className="dashboard-scroll-area">

              {/* TABS */}
              <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb", display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setActiveTab("LIVE")}
                  className={`btn ${activeTab === "LIVE" ? "btn-primary" : ""}`}
                  style={{ flex: 1, border: activeTab !== "LIVE" ? "1px solid #e5e7eb" : "none", background: activeTab !== "LIVE" ? "white" : "" }}
                >
                  <MapPin size={16} style={{ marginRight: "6px" }} />
                  Live Map
                </button>

                <button
                  onClick={() => setActiveTab("HISTORY")}
                  className={`btn ${activeTab === "HISTORY" ? "btn-primary" : ""}`}
                  style={{ flex: 1, border: activeTab !== "HISTORY" ? "1px solid #e5e7eb" : "none", background: activeTab !== "HISTORY" ? "white" : "" }}
                >
                  <List size={16} style={{ marginRight: "6px" }} />
                  History
                </button>
              </div>

              <div className="panel-container">
                {!selectedIncident || activeTab === "HISTORY" ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af" }}>
                    <Search size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                    <p>Select an incident on the map to view details and take action.</p>
                  </div>
                ) : (
                  <div className="fade-in">
                    <div style={{ marginBottom: "24px" }}>
                      <div style={{
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "4px"
                      }}>
                        INCIDENT DETAILS
                      </div>
                      <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#111827", margin: "0 0 8px 0" }}>
                        {selectedIncident.type}
                      </h2>
                      <p style={{ color: "#4b5563", lineHeight: "1.5" }}>{selectedIncident.description}</p>

                      <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: "600", fontSize: "0.875rem", minWidth: "60px" }}>Status:</span>
                          <span className="status-badge" style={{
                            background: selectedIncident.status === "PENDING" ? "#fef3c7" : "#ecfdf5",
                            color: selectedIncident.status === "PENDING" ? "#d97706" : "#059669"
                          }}>
                            {selectedIncident.status}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: "600", fontSize: "0.875rem", minWidth: "60px" }}>Priority:</span>
                          <span className="status-badge" style={{
                            background: selectedIncident.priority === "HIGH" ? "#fee2e2" : selectedIncident.priority === "LOW" ? "#dbeafe" : "#fef3c7",
                            color: selectedIncident.priority === "HIGH" ? "#b91c1c" : selectedIncident.priority === "LOW" ? "#1e40af" : "#d97706"
                          }}>
                            {selectedIncident.priority || "MEDIUM"}
                          </span>
                        </div>
                      </div>

                      {selectedIncident.image && (
                        <div style={{ marginTop: "16px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e5e7eb" }}>
                          <img src={selectedIncident.image} alt="Incident" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", display: "block" }} />
                        </div>
                      )}
                    </div>

                    <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "24px", marginBottom: "24px" }}>
                      <h4 className="section-title">Update Status</h4>

                      <div style={{ display: "grid", gap: "10px" }}>
                        <button
                          className="btn"
                          onClick={() => updateIncidentStatus("UNDER_INVESTIGATION")}
                          style={{
                            justifyContent: "flex-start",
                            background: "#fff",
                            border: "1px solid #fbbf24",
                            color: "#b45309"
                          }}
                        >
                          <Search size={18} style={{ marginRight: "10px" }} />
                          Mark as Under Investigation
                        </button>

                        <button
                          className="btn"
                          onClick={() => updateIncidentStatus("RESOLVED")}
                          style={{
                            justifyContent: "flex-start",
                            background: "#fff",
                            border: "1px solid #34d399",
                            color: "#059669"
                          }}
                        >
                          <CheckCircle size={18} style={{ marginRight: "10px" }} />
                          Mark as Resolved
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="section-title">Dispatch Teams</h4>
                      <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "12px" }}>
                        Select departments to alert immediately.
                      </p>

                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <button
                          disabled={isLocked("Fire")}
                          className="btn"
                          style={{
                            justifyContent: "flex-start",
                            background: isLocked("Fire") ? "#fee2e2" : "#ef4444",
                            color: "white",
                            opacity: isLocked("Fire") ? 0.7 : 1,
                            border: "none"
                          }}
                          onClick={() => alertDepartment("Fire")}
                        >
                          <Flame size={18} style={{ marginRight: "10px" }} />
                          {isLocked("Fire") ? "Fire Dept. Dispatched" : "Dispatch Fire Department"}
                        </button>

                        <button
                          disabled={isLocked("EMS")}
                          className="btn"
                          style={{
                            justifyContent: "flex-start",
                            background: isLocked("EMS") ? "#d1fae5" : "#10b981",
                            color: isLocked("EMS") ? "#065f46" : "white",
                            opacity: isLocked("EMS") ? 0.7 : 1,
                            border: "none"
                          }}
                          onClick={() => alertDepartment("EMS")}
                        >
                          <Stethoscope size={18} style={{ marginRight: "10px" }} />
                          {isLocked("EMS") ? "EMS Dispatched" : "Dispatch Medical (EMS)"}
                        </button>

                        <button
                          disabled={isLocked("Police")}
                          className="btn"
                          style={{
                            justifyContent: "flex-start",
                            background: isLocked("Police") ? "#dbeafe" : "#3b82f6",
                            color: isLocked("Police") ? "#1e40af" : "white",
                            opacity: isLocked("Police") ? 0.7 : 1,
                            border: "none"
                          }}
                          onClick={() => alertDepartment("Police")}
                        >
                          <Shield size={18} style={{ marginRight: "10px" }} />
                          {isLocked("Police") ? "Police Dispatched" : "Dispatch Police"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
