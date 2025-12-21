import React, { useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";


const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const AdminMap = ({ incidents, setSelectedIncident }) => {
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
    >
      <NavigationControl position="bottom-right" />

      {incidents.map((inc) => (
        <Marker
          key={inc._id}
          longitude={inc.lng}
          latitude={inc.lat}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setSelectedIncident(inc);
          }}
        >
          <div style={{ cursor: "pointer", fontSize: "24px" }}>
            {inc.status === "RESOLVED" ? "🟢" : inc.status === "UNDER_INVESTIGATION" ? "🟡" : "🔴"}
          </div>
        </Marker>
      ))}
    </Map>
  );
};

export default AdminMap;
