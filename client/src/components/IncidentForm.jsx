import { useState } from "react";
import axios from "axios";
import { AlertTriangle, MapPin, X, Camera, Upload } from "lucide-react";

const IncidentForm = ({ location, setLocation }) => {
  const [type, setType] = useState("ACCIDENT");
  const [customType, setCustomType] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [image, setImage] = useState("");

  const submitIncident = async () => {
    if (!location) {
      alert("Please click on map to select location");
      return;
    }

    const finalType = type === "OTHER" ? customType : type;

    if (!finalType.trim()) {
      alert("Please specify the incident type");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/incidents", {
        type: finalType,
        description,
        lat: location.lat,
        lng: location.lng,
        priority,
        image
      });

      alert("Incident reported successfully");
      setDescription("");
      setType("ACCIDENT");
      setCustomType("");
      setPriority("MEDIUM");
      setImage("");
      setLocation(null); // Optional: clear location after successful report
    } catch (err) {
      console.error(err);
      alert("Failed to report incident");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit check helper
        alert("File is too large. Max 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="panel-container" style={{ borderTop: "1px solid #e5e7eb" }}>
      <h3 className="section-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <AlertTriangle size={20} color="#ef4444" />
        Report Incident
      </h3>

      {/* SHOW SELECTED LOCATION */}
      <div style={{
        padding: "12px",
        background: location ? "#ecfdf5" : "#fef2f2",
        borderRadius: "8px",
        marginBottom: "16px",
        border: `1px solid ${location ? "#a7f3d0" : "#fecaca"}`,
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        <MapPin size={18} color={location ? "#059669" : "#dc2626"} />
        {location ? (
          <span style={{ color: "#065f46", fontSize: "0.875rem", fontWeight: "500", flex: 1 }}>
            Location Selected ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
          </span>
        ) : (
          <span style={{ color: "#991b1b", fontSize: "0.875rem", fontWeight: "500", flex: 1 }}>
            Click on map to pin location
          </span>
        )}

        {location && (
          <button
            onClick={() => setLocation(null)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
              borderRadius: "50%",
              color: "#065f46"
            }}
            title="Remove marker"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: "600" }}>Incident Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="input-field"
          >
            <option value="ACCIDENT">Accident</option>
            <option value="POTHOLE">Pothole</option>
            <option value="BLOCKAGE">Road Blockage</option>
            <option value="SIGNAL_ISSUE">Signal Issue</option>
            <option value="OTHER">Others...</option>
          </select>
        </div>

        {type === "OTHER" && (
          <div className="fade-in">
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: "600" }}>Specify Incident Type</label>
            <input
              placeholder="e.g. Flood, Blast, Fire"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              className="input-field"
            />
          </div>
        )}

        <div>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: "600" }}>Description</label>
          <textarea
            placeholder="Describe details (e.g. 2 car collision)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            className="input-field"
            style={{ resize: "vertical" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: "600" }}>Priority Level</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="input-field"
            style={{
              borderLeft: `4px solid ${priority === 'HIGH' ? '#ef4444' :
                  priority === 'MEDIUM' ? '#f59e0b' : '#10b981'
                }`
            }}
          >
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority - Urgent</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: "600" }}>Attach Image</label>
          <div style={{ position: "relative" }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              id="incident-image"
              style={{ display: "none" }}
            />
            <label
              htmlFor="incident-image"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px",
                border: "1px dashed #d1d5db",
                borderRadius: "6px",
                cursor: "pointer",
                background: "#f9fafb",
                color: "#6b7280",
                fontSize: "0.875rem"
              }}
            >
              {image ? (
                <>
                  <div style={{ width: "32px", height: "32px", borderRadius: "4px", overflow: "hidden" }}>
                    <img src={image} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <span style={{ color: "#059669" }}>Image Selected</span>
                  <button
                    onClick={(e) => { e.preventDefault(); setImage(""); }}
                    style={{ marginLeft: "auto", border: "none", background: "none", cursor: "pointer" }}
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <Camera size={18} />
                  <span>Click to upload photo</span>
                </>
              )}
            </label>
          </div>
        </div>

        <button
          onClick={submitIncident}
          className="btn btn-primary"
          style={{ marginTop: "8px" }}
        >
          Submit Report
        </button>
      </div>
    </div>
  );
};

export default IncidentForm;
