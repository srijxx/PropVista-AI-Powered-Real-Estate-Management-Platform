import { Link } from "react-router-dom";

function Navbar() {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div
      style={{
        padding: "15px",
        background: "#2c3e50",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <h3>PropVista</h3>

      <div>
        <Link to="/profile" style={{ color: "white", marginRight: "15px" }}>
          Dashboard
        </Link>
        <Link to="/add-property" style={{ color: "white", marginRight: "15px" }}>
          Add Property
        </Link>
        <Link to="/properties" style={{ color: "white", marginRight: "15px" }}>
          View Properties
        </Link>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

export default Navbar;
