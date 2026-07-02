import { useEffect, useState } from "react";
import API_BASE from '../config';
import axios from "axios";
import Sidebar from "../components/Sidebar";
import PropertyCard from "../components/PropertyCard";
import TopFilter from "../components/TopFilter";

function MarketplaceDashboard() {
  const [properties, setProperties] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    axios
      .get(`${API_BASE}/api/properties", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setProperties(res.data);
      })
      .catch(() => {
        alert("Failed to load properties");
      });
  }, []);

  return (
    <div style={{ display: "flex" }}>
      {/* LEFT SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div
        style={{
          marginLeft: "240px",
          padding: "30px",
          width: "100%",
          background: "#f4f6f8",
          minHeight: "100vh",
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>Discover Properties</h2>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Browse available properties
        </p>

        {/* FILTER BAR */}
        <TopFilter setFilter={setFilter} />

        {/* PROPERTY GRID */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {properties.length === 0 ? (
            <p>No properties found</p>
          ) : (
            properties.map((p) => (
              <PropertyCard key={p._id} p={p} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MarketplaceDashboard;
