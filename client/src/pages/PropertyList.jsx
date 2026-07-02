import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

function PropertyList() {
  const [properties, setProperties] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("http://localhost:5000/api/properties", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setProperties(res.data));
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={styles.container}>
        <div style={styles.header}>
          <h2>Properties</h2>
          <button
            style={styles.addBtn}
            onClick={() => window.location.href="/add-property/new"}
          >
            + Add New Property
          </button>
        </div>

        <div style={styles.grid}>
          {properties.map(p => (
            <div key={p._id} style={styles.card}>
              <img
                src={p.image || "https://via.placeholder.com/300"}
                alt=""
                style={styles.image}
              />
              <h4>₹{p.price}</h4>
              <p>{p.type}</p>
              <span>{p.location}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginLeft: "240px",
    padding: "30px",
    width: "100%"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px"
  },
  addBtn: {
    padding: "10px 16px",
    background: "#2c7be5",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "20px"
  },
  card: {
    background: "white",
    padding: "12px",
    borderRadius: "10px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
  },
  image: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
    borderRadius: "8px"
  }
};

export default PropertyList;
