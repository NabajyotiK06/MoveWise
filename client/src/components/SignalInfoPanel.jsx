import { useEffect, useState } from "react";
import SignalGraph from "./SignalGraph";
import EnvironmentGraph from "./EnvironmentGraph";
import SpeedGraph from "./SpeedGraph";
import { Activity, Wind, Gauge, Car, Video, VideoOff } from "lucide-react";

const SignalInfoPanel = ({ signal, onViewFeed }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!signal) return;

    setHistory((prev) => [
      ...prev.slice(-9),
      {
        time: new Date().toLocaleTimeString(),
        vehicles: signal.vehicles,
        avgSpeed: signal.avgSpeed,
        aqi: signal.aqi
      }
    ]);
  }, [signal?.vehicles]);

  if (!signal) {
    return (
      <div className="panel-container fade-in">
        <div style={{ textAlign: "center", marginTop: "100px", color: "#9ca3af" }}>
          <Activity size={48} style={{ opacity: 0.2, marginBottom: "16px" }} />
          <h3>Select a Signal</h3>
          <p>Click on any traffic light map marker <br /> to view real-time analytics.</p>
        </div>
      </div>
    );
  }

  const InfoItem = ({ icon: Icon, label, value, color }) => (
    <div style={{
      display: "flex",
      alignItems: "center",
      padding: "12px",
      background: "#f9fafb",
      borderRadius: "8px",
      marginBottom: "8px",
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{
        padding: "8px",
        background: "white",
        borderRadius: "50%",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        marginRight: "12px"
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>{label}</div>
        <div style={{ fontSize: "16px", color: "#1f2937", fontWeight: "700" }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div className="panel-container fade-in">
      <h2 className="section-title">{signal.name}</h2>

      <div style={{ marginBottom: "24px" }}>
        <InfoItem icon={Car} label="Total Vehicles" value={signal.vehicles} color="#3b82f6" />
        <InfoItem icon={Activity} label="Congestion Level" value={signal.congestion} color={signal.congestion === "HIGH" ? "#ef4444" : "#10b981"} />
        <InfoItem icon={Wind} label="Air Quality Index" value={signal.aqi} color="#8b5cf6" />
        <InfoItem icon={Gauge} label="Avg Speed" value={`${signal.avgSpeed} km/h`} color="#f59e0b" />
      </div>

      <h4 className="section-title">Traffic Volume</h4>
      <div className="card" style={{ padding: "16px", border: "1px solid #e5e7eb", boxShadow: "none", marginBottom: "16px" }}>
        <SignalGraph history={history} />
      </div>

      <h4 className="section-title">Avg Speed Trend</h4>
      <div className="card" style={{ padding: "16px", border: "1px solid #e5e7eb", boxShadow: "none", marginBottom: "16px" }}>
        <SpeedGraph history={history} />
      </div>

      <h4 className="section-title">Air Quality Index</h4>
      <div className="card" style={{ padding: "16px", border: "1px solid #e5e7eb", boxShadow: "none", marginBottom: "24px" }}>
        <EnvironmentGraph history={history} />
      </div>

      <button
        onClick={onViewFeed}
        className="btn btn-primary"
        style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
      >
        <Video size={18} />
        View Live Feed
      </button>
    </div>
  );
};

export default SignalInfoPanel;
