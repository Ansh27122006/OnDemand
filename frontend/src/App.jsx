import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoutes";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Placeholder pages (create these as empty components for now)
import Home from "./pages/customer/Home";
import Unauthorized from "./pages/auth/Unauthorized";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import LandingPage from "./pages/LandingPage";

const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={<LandingPage />}
      />
      <Route
        path="/customer/dashboard"
        element={<Home />}
      />
      <Route
        path="/login"
        element={<Login />}
      />
      <Route
        path="/register"
        element={<Register />}
      />
      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />

      {/* Vendor only */}
      <Route element={<ProtectedRoute allowedRoles={["vendor"]} />}>
        <Route
          path="/vendor/dashboard"
          element={<VendorDashboard />}
        />
      </Route>

      {/* Admin only — add later when admin pages are built */}

      {/* Customer only — add later when customer pages are built */}
    </Routes>
  );
};

export default App;
