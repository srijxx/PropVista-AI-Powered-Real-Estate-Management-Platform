import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapView() {
  const [properties, setProperties] = useState([]);

  // 🔹 get all properties
  useEffect(() => {
    fetch("http://localhost:5000/api/properties")
      .then((res) => res.json())
      .then((data) => setProperties(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={[11.0168, 76.9558]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* 🔹 property pins */}
        {properties.map((p) =>
          p.lat && p.lng ? (
            <Marker
              key={p._id}
              position={[p.lat, p.lng]}
              icon={markerIcon}
            >
             <Popup>
  <strong>{p.title}</strong> <br />
  ₹{p.price} <br />
  {p.type} <br /><br />

  <a
  href={`/properties/${p._id}`}
  style={{ color: "blue", textDecoration: "underline" }}
>
  View Details
</a>


</Popup>

            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}

export default MapView;
