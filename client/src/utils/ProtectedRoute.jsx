import { Navigate } from "react-router-dom";

// Check both localStorage (rememberMe=true) and sessionStorage (rememberMe=false)
const ProtectedRoute = ({ children }) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
