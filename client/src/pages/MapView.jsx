import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import API_BASE from "../config";
import AppLayout from "../components/AppLayout";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapView() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/api/properties`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setProperties(data))
      .catch((err) => { if (err.name !== "AbortError") console.error(err); });
    return () => controller.abort();
  }, []);

  return (
    <AppLayout>
      {/* Negative margin to fill the app-content padding and reach full height */}
      <div style={{ margin: "-24px -28px", height: "calc(100vh - 60px)" }}>
        <MapContainer
          center={[11.0168, 76.9558]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {properties.map((p) =>
            p.lat && p.lng ? (
              <Marker key={p._id} position={[p.lat, p.lng]} icon={markerIcon}>
                <Popup>
                  <strong>{p.title}</strong>
                  <br />
                  ₹ {Number(p.price).toLocaleString("en-IN")}
                  <br />
                  {p.type}
                  <br />
                  <br />
                  <button
                    onClick={() => navigate(`/properties/${p._id}`)}
                    style={{
                      padding: "4px 10px",
                      background: "#2563eb",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    View Details →
                  </button>
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>
    </AppLayout>
  );
}

export default MapView;
