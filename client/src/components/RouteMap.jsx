import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents
} from "react-leaflet";
import { useEffect, useState } from "react";

/* Handles map click to select start & end */
const ClickHandler = ({ start, end, setStart, setEnd }) => {
  useMapEvents({
    click(e) {
      if (!start) {
        setStart(e.latlng);
      } else if (!end) {
        setEnd(e.latlng);
      }
    }
  });
  return null;
};

const RouteMap = ({
  start,
  end,
  setStart,
  setEnd,
  routes,
  selectedRouteIndex
}) => {
  const [vehicleIndex, setVehicleIndex] = useState(0);

  /* Animate vehicle along selected route */
  useEffect(() => {
    if (!routes.length) return;

    setVehicleIndex(0);

    const interval = setInterval(() => {
      setVehicleIndex((prev) => {
        const max = routes[selectedRouteIndex].coords.length - 1;
        return prev < max ? prev + 1 : prev;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [routes, selectedRouteIndex]);

  return (
    <MapContainer
      center={[22.4969, 88.3702]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <ClickHandler
        start={start}
        end={end}
        setStart={setStart}
        setEnd={setEnd}
      />

      {start && <Marker position={start} />}
      {end && <Marker position={end} />}

      {/* Draw all routes */}
      {/* Draw non-selected routes first (background) */}
      {routes.map((route, index) => {
        if (index === selectedRouteIndex) return null;
        return (
          <Polyline
            key={index}
            positions={route.coords}
            color="#9ca3af" // Gray 400
            weight={4}
            opacity={0.6}
          />
        );
      })}

      {/* Draw selected route last (foreground) */}
      {routes[selectedRouteIndex] && (
        <Polyline
          key={selectedRouteIndex}
          positions={routes[selectedRouteIndex].coords}
          color="#2563eb" // Primary Blue
          weight={6}
          opacity={1}
        />
      )}

      {/* Animated vehicle marker */}
      {routes.length > 0 &&
        routes[selectedRouteIndex] &&
        routes[selectedRouteIndex].coords[vehicleIndex] && (
          <Marker
            position={routes[selectedRouteIndex].coords[vehicleIndex]}
          />
        )}
    </MapContainer>
  );
};

export default RouteMap;
