import React, { useEffect, useState, useMemo } from "react";
import Map, { Marker, Source, Layer, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

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
    if (!routes || !routes.length) return;

    setVehicleIndex(0);

    const interval = setInterval(() => {
      setVehicleIndex((prev) => {
        const max = routes[selectedRouteIndex].coords.length - 1;
        return prev < max ? prev + 1 : prev;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [routes, selectedRouteIndex]);

  const handleMapClick = (e) => {
    if (!start) {
      setStart(e.lngLat);
    } else if (!end) {
      setEnd(e.lngLat);
    }
  };

  // Convert routes to GeoJSON lines
  const routeLayers = useMemo(() => {
    return routes.map((route, index) => ({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: route.coords.map(([lat, lng]) => [lng, lat]) // Validate if coords are [lat, lng] or [lng, lat]. stored as [lat, lng] in previous code?
        // In previous RoutePlanner code: 
        // coords: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]) -> So stored as [lat, lng]
        // Mapbox needs [lng, lat]
      },
      properties: {
        index,
        isSelected: index === selectedRouteIndex
      }
    }));
  }, [routes, selectedRouteIndex]);

  const vehiclePosition = routes.length > 0 && routes[selectedRouteIndex] && routes[selectedRouteIndex].coords[vehicleIndex]
    ? { lng: routes[selectedRouteIndex].coords[vehicleIndex][1], lat: routes[selectedRouteIndex].coords[vehicleIndex][0] }
    : null;

  return (
    <Map
      initialViewState={{
        latitude: 22.4969,
        longitude: 88.3702,
        zoom: 12
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={MAPBOX_TOKEN}
      onClick={handleMapClick}
    >
      <NavigationControl position="bottom-right" />

      {start && <Marker longitude={start.lng} latitude={start.lat} color="green" />}
      {end && <Marker longitude={end.lng} latitude={end.lat} color="red" />}

      {/* Render Routes */}
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
              "line-width": feature.properties.isSelected ? 6 : 4,
              "line-opacity": feature.properties.isSelected ? 1 : 0.6
            }}
          />
        </Source>
      ))}

      {/* Vehicle Marker */}
      {vehiclePosition && (
        <Marker longitude={vehiclePosition.lng} latitude={vehiclePosition.lat}>
          <div style={{ fontSize: "24px" }}>🚗</div>
        </Marker>
      )}
    </Map>
  );
};

export default RouteMap;
