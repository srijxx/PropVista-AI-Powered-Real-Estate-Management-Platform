import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="pv-sidebar">
      {/* LOGO */}
      <div className="pv-logo">
        <span className="logo-icon">🏠</span>
        <span className="logo-text">PropVista</span>
      </div>

      {/* NAVIGATION */}
      <nav className="pv-nav">
        <NavLink to="/dashboard" className="pv-link">📊 Dashboard</NavLink>
        <NavLink to="/explore" className="pv-link">🗺️ Explore Map</NavLink>
        <NavLink to="/add-property" className="pv-link">➕ Add Property</NavLink>
        <NavLink to="/properties" className="pv-link">🏢 My Properties</NavLink>
        <NavLink to="/profile" className="pv-link">👤 Profile</NavLink>
        <NavLink to="/settings" className="pv-link">⚙️ Settings</NavLink>
      </nav>

      {/* FOOTER */}
      <div className="pv-footer">
        <div
          className="pv-user"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/profile")}
        >
          <div className="avatar">A</div>
          <div>
            <p className="user-name">Admin</p>
            <p className="user-email">admin@propvista.com</p>
          </div>
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
        >
          ⎋
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
