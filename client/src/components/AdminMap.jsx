import { MapContainer, TileLayer, Marker } from "react-leaflet";

const AdminMap = ({ incidents, setSelectedIncident }) => {
  return (
    <MapContainer
      center={[22.4969, 88.3702]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {incidents.map((inc) => (
        <Marker
          key={inc._id}
          position={[inc.lat, inc.lng]}
          eventHandlers={{
            click: () => setSelectedIncident(inc)
          }}
        />
      ))}
    </MapContainer>
  );
};

export default AdminMap;
