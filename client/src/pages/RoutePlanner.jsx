import { useContext, useState, useRef, useEffect, useMemo } from "react";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  MapPin,
  Navigation,
  Flag,
  RotateCcw
} from "lucide-react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import Map, { Marker, Source, Layer, NavigationControl, GeolocateControl } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import { LocationContext } from "../context/LocationContext";
import { AuthContext } from "../context/AuthContext";
import "mapbox-gl/dist/mapbox-gl.css";
import "../styles/layout.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const RoutePlanner = () => {
  const { user } = useContext(AuthContext);
  const { searchedLocation } = useContext(LocationContext);

  const [viewState, setViewState] = useState({
    latitude: 22.4969,
    longitude: 88.3702,
    zoom: 12
  });

  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [routeType, setRouteType] = useState(null);
  const [vehicleIndex, setVehicleIndex] = useState(0);
  const mapRef = useRef(null);

  // Update map view when searchedLocation changes
  useEffect(() => {
    if (searchedLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [searchedLocation.lng, searchedLocation.lat],
        zoom: 14,
        duration: 1500
      });
    }
  }, [searchedLocation]);

  // FETCH ROUTES FROM OSRM
  const fetchRoutes = async (type) => {
    if (!start || !end) {
      alert("Please select start and destination on the map");
      return;
    }

    setRouteType(type);

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?alternatives=true&steps=true&overview=full&geometries=geojson`;

      const res = await fetch(url);
      const data = await res.json();

      if (!data.routes || data.routes.length === 0) {
        alert("No routes found");
        return;
      }

      // PROCESS ROUTES
      const processedRoutes = data.routes.map((r, index) => {
        let distanceKm = r.distance / 1000;
        let durationMin = r.duration / 60;

        // OPTIMAL ROUTE SIMULATION (penalty for alternatives)
        if (type === "optimal" && index > 0) {
          distanceKm += index * 1.2;
          durationMin += index * 4;
        }

        return {
          coords: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]), // Store as [lat, lng] for compatibility with logic below, or better store as [lng, lat] for mapbox?
          // The previous code stored as [lat, lng] but OSRM returns [lng, lat].
          // Mapbox expects [lng, lat]. Let's store as [lng, lat] (GeoJSON standard).
          // BUT: The animation logic and distance steps might rely on index.
          // Let's stick to OSRM native [lng, lat] for simplicity in Mapbox Source.
          geoJsonCoords: r.geometry.coordinates, // [lng, lat]

          distance: distanceKm.toFixed(2),
          duration: durationMin.toFixed(1),
          steps: r.legs[0].steps
        };
      });

      setRoutes(processedRoutes);
      setSelectedRouteIndex(0);

      // Fit bounds to show route
      if (mapRef.current && processedRoutes[0].geoJsonCoords.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        processedRoutes[0].geoJsonCoords.forEach(coord => {
          bounds.extend(coord);
        });
        mapRef.current.fitBounds(bounds, { padding: 50 });
      }

    } catch (error) {
      console.error(error);
      alert("Failed to fetch route");
    }
  };

  /* ANIMATION EFFECT */
  useEffect(() => {
    if (!routes.length) return;

    setVehicleIndex(0);

    const interval = setInterval(() => {
      setVehicleIndex((prev) => {
        const max = routes[selectedRouteIndex].geoJsonCoords.length - 1;
        return prev < max ? prev + 1 : prev;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [routes, selectedRouteIndex]);

  const handleMapClick = (e) => {
    const { lng, lat } = e.lngLat;
    if (!start) {
      setStart({ lat, lng });
    } else if (!end) {
      setEnd({ lat, lng });
    }
  };

  // Convert routes to GeoJSON lines for Mapbox
  const routeLayers = useMemo(() => {
    return routes.map((route, index) => ({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: route.geoJsonCoords
      },
      properties: {
        index,
        isSelected: index === selectedRouteIndex
      }
    }));
  }, [routes, selectedRouteIndex]);

  const currentVehiclePos = routes.length > 0 && routes[selectedRouteIndex] && routes[selectedRouteIndex].geoJsonCoords[vehicleIndex]
    ? { lng: routes[selectedRouteIndex].geoJsonCoords[vehicleIndex][0], lat: routes[selectedRouteIndex].geoJsonCoords[vehicleIndex][1] }
    : null;

  return (
    <div className="app-layout">
      <Sidebar role={user.role} />

      <div className="main-content">
        <Topbar />

        <div className="page-body">
          {/* MAP SECTION */}
          <div className="dashboard-map-container">
            <Map
              {...viewState}
              ref={mapRef}
              onMove={evt => setViewState(evt.viewState)}
              style={{ width: "100%", height: "100vh" }}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              mapboxAccessToken={MAPBOX_TOKEN}
              onClick={handleMapClick}
            >
              <NavigationControl position="bottom-right" />
              <GeolocateControl position="bottom-right" />

              {/* Start/End Markers */}
              {start && <Marker longitude={start.lng} latitude={start.lat} color="#10b981" anchor="bottom" />}
              {end && <Marker longitude={end.lng} latitude={end.lat} color="#ef4444" anchor="bottom" />}

              {/* Routes */}
              {routeLayers.map((feature, i) => (
                <Source key={i} id={`route-${i}`} type="geojson" data={feature}>
                  <Layer
                    id={`route-layer-${i}`}
                    type="line"
                    layout={{
                      "line-join": "round",
                      "line-cap": "round"
                    }}
                    paint={{
                      "line-color": feature.properties.isSelected ? "#2563eb" : "#9ca3af",
                      "line-width": feature.properties.isSelected ? 5 : 4,
                      "line-opacity": feature.properties.isSelected ? 1 : 0.6
                    }}
                  />
                </Source>
              ))}

              {/* Vehicle Marker */}
              {currentVehiclePos && (
                <Marker longitude={currentVehiclePos.lng} latitude={currentVehiclePos.lat} anchor="center">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3097/3097180.png"
                    alt="Car"
                    style={{ width: "40px", height: "40px" }}
                  />
                </Marker>
              )}
            </Map>
          </div>

          {/* DETAILS SECTION */}
          <div className="dashboard-sidebar">
            <div className="dashboard-scroll-area">
              <div className="panel-container">
                <h2 className="section-title">Route Planner</h2>

                <div className="card" style={{ padding: "16px", marginBottom: "24px", background: "#f8fafc" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>TRIP DETAILS</div>
                    {(start || end) && (
                      <button
                        onClick={() => {
                          setStart(null);
                          setEnd(null);
                          setRoutes([]);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          padding: 0
                        }}
                      >
                        Reset Map
                      </button>
                    )}
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600", marginBottom: "4px" }}>START POINT</div>
                    <div style={{ color: start ? "#10b981" : "#9ca3af", fontWeight: "500" }}>
                      {start ? "✅ Point Selected" : "Click on map to select"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600", marginBottom: "4px" }}>DESTINATION</div>
                    <div style={{ color: end ? "📍 Point Selected" : "#9ca3af", fontWeight: "500" }}>
                      {end ? "📍 Point Selected" : "Click on map to select"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => fetchRoutes("shortest")}
                  >
                    Shortest
                  </button>

                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, background: "#8b5cf6" }}
                    onClick={() => fetchRoutes("optimal")}
                  >
                    Optimal
                  </button>
                </div>

                {routes.length > 0 && (
                  <>
                    <h3 className="section-title">Available Routes</h3>
                    <div className="fade-in">
                      {routes.map((r, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedRouteIndex(index)}
                          className={`route-card ${index === selectedRouteIndex ? "active" : ""}`}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ fontWeight: "700", color: "#1f2937" }}>Route {index + 1}</span>
                            <span style={{ color: "#6b7280", fontSize: "14px" }}>{r.duration} min</span>
                          </div>
                          <div style={{ fontSize: "14px", color: "#4b5563" }}>
                            Distance: {r.distance} km
                          </div>
                        </div>
                      ))}
                    </div>

                    <h3 className="section-title" style={{ marginTop: "24px" }}>Turn-by-Turn</h3>
                    <div className="card" style={{ padding: "0", overflow: "hidden" }}>
                      {routes[selectedRouteIndex].steps.map((step, i) => {
                        const getManeuverIcon = (type, modifier) => {
                          if (type === "arrive") return <Flag size={20} className="step-icon" color="#ef4444" />;
                          if (type === "depart") return <Navigation size={20} className="step-icon" color="#10b981" />;

                          if (modifier && modifier.includes("left")) return <CornerUpLeft size={20} className="step-icon" />;
                          if (modifier && modifier.includes("right")) return <CornerUpRight size={20} className="step-icon" />;
                          if (modifier && modifier.includes("straight")) return <ArrowUp size={20} className="step-icon" />;
                          if (modifier && modifier.includes("uturn")) return <RotateCcw size={20} className="step-icon" />;

                          return <ArrowUp size={20} className="step-icon" />;
                        };

                        return (
                          <div key={i} className="step-item">
                            <div style={{ minWidth: "32px", display: "flex", justifyContent: "center" }}>
                              {getManeuverIcon(step.maneuver.type, step.maneuver.modifier)}
                            </div>
                            <div>
                              <div style={{ fontWeight: "500", color: "#374151" }}>{step.maneuver.instruction}</div>
                              <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
                                {Math.round(step.distance)} meters
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;
