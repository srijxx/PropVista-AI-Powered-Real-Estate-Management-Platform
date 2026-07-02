import { useNavigate } from "react-router-dom";

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <div className="app-content">
        {children}
      </div>
    </div>
  );
}

export default AppLayout;





