import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import TopFilter from "../components/TopFilter";
import PropertyCard from "../components/PropertyCard";

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
      .get("http://localhost:5000/api/properties", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setProperties(res.data);
      });
  }, []);

  return (
    <div>
      <Sidebar />

      <div style={{ marginLeft: "240px", padding: "30px" }}>
        <h2>Discover Properties</h2>

        <TopFilter setFilter={setFilter} />

        <div style={styles.grid}>
          {properties.map((p) => (
            <PropertyCard key={p._id} p={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
};

export default MarketplaceDashboard;
