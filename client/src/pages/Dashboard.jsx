import { useContext, useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import MapView from "../components/MapView";
import SignalInfoPanel from "../components/SignalInfoPanel";
import { VideoOff } from "lucide-react";

import { AuthContext } from "../context/AuthContext";
import "../styles/layout.css";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const [signals, setSignals] = useState([]);
  const [selectedSignalId, setSelectedSignalId] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showFeed, setShowFeed] = useState(false);

  useEffect(() => {
    if (!selectedSignalId && signals.length) {
      const worst = signals.find((s) => s.congestion === "HIGH");
      if (worst) setSelectedSignalId(worst.id);
    }
  }, [signals]);

  const selectedSignal = signals.find(
    (s) => s.id === selectedSignalId
  );

  return (
    <div className="app-layout">
      <Sidebar role={user.role} />

      <div className="main-content">
        <Topbar />

        <div className="page-body">
          <div className="dashboard-map-container">
            <div className="heatmap-toggle fade-in">
              <label className="heatmap-label">
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={() => setShowHeatmap(!showHeatmap)}
                  style={{ width: "16px", height: "16px" }}
                />
                Show Traffic Heatmap
              </label>
            </div>
            <MapView
              signals={signals}
              setSignals={setSignals}
              setSelectedSignalId={setSelectedSignalId}
              showHeatmap={showHeatmap}
            />

            {/* Live Feed Modal Overlay - Positioned over map */}
            {showFeed && selectedSignal && (
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 2000
              }}>
                <div className="fade-in" style={{
                  background: "black", width: "90%", maxWidth: "500px", borderRadius: "12px", overflow: "hidden",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)"
                }}>
                  <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #333", background: "#111" }}>
                    <h3 style={{ margin: 0, color: "white", fontSize: "16px" }}>Live Feed - {selectedSignal.name}</h3>
                    <button onClick={() => setShowFeed(false)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "20px" }}>
                      ✕
                    </button>
                  </div>
                  <div style={{
                    height: "300px", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", background: "#000", color: "#4b5563"
                  }}>
                    <VideoOff size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                    <p style={{ color: "#9ca3af", fontSize: "1rem" }}>Signal Feed Offline</p>
                    <div style={{
                      marginTop: "12px", padding: "4px 10px", background: "#f59e0b", color: "#fff",
                      borderRadius: "4px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase"
                    }}>
                      Under Development
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="dashboard-sidebar">
            <div className="dashboard-scroll-area">
              <SignalInfoPanel
                signal={selectedSignal}
                onViewFeed={() => setShowFeed(true)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
