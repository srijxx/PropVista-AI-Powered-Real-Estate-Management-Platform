import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { ToastProvider } from "./components/Toast";

import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import ViewProperties from "./pages/ViewProperties";
import AddProperty from "./pages/AddProperty";
import EditProperty from "./pages/EditProperty";
import PropertyDetails from "./pages/PropertyDetails";
import Profile from "./pages/Profile";
import MapView from "./pages/MapView";
import ExploreProperties from "./pages/ExploreProperties";
import Settings from "./pages/Settings";
import PolicyPage from "./pages/PolicyPage";
import Contact from "./pages/Contact";
import Feedback from "./pages/Feedback";
import RateApp from "./pages/RateApp";
import AISearch from "./pages/AISearch";
import MyBookings from "./pages/MyBookings";
import PredictPrice from "./pages/PredictPrice";
import EMICalculator from "./pages/EMICalculator";
import CompareProperties from "./pages/CompareProperties";

const isLoggedIn = () =>
  !!(localStorage.getItem("token") || sessionStorage.getItem("token"));

// Redirect to dashboard if already logged in
function PublicRoute({ element }) {
  return isLoggedIn() ? <Navigate to="/dashboard" replace /> : element;
}

// Redirect to login if not logged in
function PrivateRoute({ element }) {
  return isLoggedIn() ? element : <Navigate to="/" replace />;
}

function App() {
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.body.classList.add("dark");
    }
  }, []);

  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<PublicRoute element={<Login />} />} />
        <Route path="/register" element={<PublicRoute element={<Register />} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
        <Route path="/properties" element={<PrivateRoute element={<ViewProperties />} />} />
        <Route path="/add-property" element={<PrivateRoute element={<AddProperty />} />} />
        <Route path="/edit-property/:id" element={<PrivateRoute element={<EditProperty />} />} />
        <Route path="/properties/:id" element={<PrivateRoute element={<PropertyDetails />} />} />
        <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
        <Route path="/map-view" element={<PrivateRoute element={<MapView />} />} />
        <Route path="/explore" element={<PrivateRoute element={<ExploreProperties />} />} />
        <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
        <Route path="/policy" element={<PrivateRoute element={<PolicyPage />} />} />
        <Route path="/contact" element={<PrivateRoute element={<Contact />} />} />
        <Route path="/feedback" element={<PrivateRoute element={<Feedback />} />} />
        <Route path="/rate-app" element={<PrivateRoute element={<RateApp />} />} />
        <Route path="/ai-search" element={<PrivateRoute element={<AISearch />} />} />
        <Route path="/bookings" element={<PrivateRoute element={<MyBookings />} />} />
        <Route path="/predict-price" element={<PrivateRoute element={<PredictPrice />} />} />
        <Route path="/emi-calculator" element={<PrivateRoute element={<EMICalculator />} />} />
        <Route path="/compare-properties" element={<PrivateRoute element={<CompareProperties />} />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
