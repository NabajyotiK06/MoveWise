import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Tooltip } from "react-leaflet";
import { useEffect, useContext, useState } from "react";
import { LocationContext } from "../context/LocationContext";
import axios from "axios";
import L from "leaflet";
import "leaflet.heat";
import { LocateFixed } from "lucide-react";
import "../styles/trafficLight.css";

const createTrafficIcon = (level) =>
  new L.DivIcon({
    html: `<div class="traffic-light ${level.toLowerCase()}">🚦</div>`,
    className: "",
    iconSize: [30, 30]
  });

const createIncidentIcon = () =>
  new L.DivIcon({
    html: `<div style="font-size: 24px;">⚠️</div>`,
    className: "",
    iconSize: [30, 30]
  });

const LocationPicker = ({ setLocation }) => {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
};

const HeatmapLayer = ({ signals }) => {
  const map = useMapEvents({});

  useEffect(() => {
    if (!map || signals.length === 0) return;

    const points = signals.map((s) => [
      s.lat,
      s.lng,
      s.vehicles / 100 // intensity
    ]);

    const heatLayer = L.heatLayer(points, {
      radius: 30,
      blur: 20,
      maxZoom: 13
    });

    heatLayer.addTo(map);
    return () => map.removeLayer(heatLayer);
  }, [signals]);

  return null;
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

/* ---------- LOCATE CONTROL & USER MARKER COMPONENT ---------- */
const UserLocationControl = () => {
  const [position, setPosition] = useState(null);
  const map = useMap();

  const handleLocate = (e) => {
    e.stopPropagation();
    e.preventDefault();
    map.locate({ setView: true, maxZoom: 16 });
  };

  useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
    },
    locationerror(e) {
      console.error("Location access denied or failed", e);
      alert("Could not access your location. Please check permissions.");
    }
  });

  return (
    <>
      <div
        className="leaflet-bottom leaflet-right"
        style={{ pointerEvents: "auto", marginBottom: "80px", marginRight: "10px", zIndex: 1000, position: "absolute" }}
      >
        <div className="leaflet-control leaflet-bar">
          <button
            onClick={handleLocate}
            title="Locate Me"
            style={{
              width: "34px",
              height: "34px",
              backgroundColor: "white",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#333"
            }}
          >
            <LocateFixed size={20} />
          </button>
        </div>
      </div>

      {position && (
        <Marker
          position={position}
          icon={new L.DivIcon({
            html: `<div style="background-color: #3b82f6; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);"></div>`,
            className: "",
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          })}
        >
          <Tooltip>You are here</Tooltip>
        </Marker>
      )}
    </>
  );
};


const MapView = ({
  signals,
  setSignals,
  setSelectedSignalId,
  setLocation,
  location,
  showHeatmap
}) => {
  /* New state for incidents */
  const [incidents, setIncidents] = useState([]);

  const fetchData = async () => {
    try {
      const [trafficRes, incidentsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/traffic"),
        axios.get("http://localhost:5000/api/incidents")
      ]);
      setSignals(trafficRes.data);
      setIncidents(incidentsRes.data.filter(i => i.status !== "RESOLVED"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MapContainer
      center={[22.4969, 88.3702]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapUpdater />
      <UserLocationControl />

      {setLocation && <LocationPicker setLocation={setLocation} />}

      {showHeatmap && <HeatmapLayer signals={signals} />}

      {location && <Marker position={[location.lat, location.lng]} />}

      {signals.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={createTrafficIcon(s.congestion)}
          eventHandlers={{
            click: () => setSelectedSignalId(s.id)
          }}
        />
      ))}

      {incidents.map((inc) => (
        <Marker
          key={inc._id}
          position={[inc.lat, inc.lng]}
          icon={createIncidentIcon()}
          title={inc.type}
        >
          <Tooltip>
            <div style={{ textAlign: "left", minWidth: "120px" }}>
              <h4 style={{ margin: "0 0 4px 0", color: "#b91c1c", fontWeight: "bold" }}>{inc.type}</h4>
              <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#374151" }}>{inc.description}</p>
              <span style={{ fontSize: "10px", color: "#6b7280" }}>
                {new Date(inc.createdAt).toLocaleString()}
              </span>
            </div>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
