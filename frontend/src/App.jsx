import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoutes";
import Navbar from "./components/Navbar";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Pages
import Home from "./pages/customer/Home";
import Unauthorized from "./pages/auth/Unauthorized";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import LandingPage from "./pages/LandingPage";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={<LandingPage />}
        />
        {/* Customer only */}
        <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
          <Route
            path="/customer/dashboard"
            element={<Home />}
          />
        </Route>
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

        {/* Admin only — add later */}
        {/* Customer only — add later */}
      </Routes>
    </>
  );
};

export default App;
