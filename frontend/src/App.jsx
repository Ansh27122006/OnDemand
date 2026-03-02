import { Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoutes";
import Navbar from "./components/Navbar";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Unauthorized from "./pages/auth/Unauthorized";

// Public pages
import LandingPage from "./pages/LandingPage";
import BrowseProducts from "./pages/customer/BrowseProducts";
import BrowseServices from "./pages/customer/BrowseServices";
import ProductDetail from "./pages/customer/ProductDetail";
import ServiceDetail from "./pages/customer/ServiceDetail";

// Customer pages
import Home from "./pages/customer/Home";
import Cart from "./pages/customer/Cart";
import MyOrders from "./pages/customer/MyOrders";
import MyBookings from "./pages/customer/MyBookings";

// Vendor pages
import VendorDashboard from "./pages/vendor/VendorDashboard";
import ManageProducts from "./pages/vendor/ManageProducts";
import ManageServices from "./pages/vendor/ManageServices";
import ManageOrders from "./pages/vendor/ManageOrders";
import ManageBookings from "./pages/vendor/ManageBookings";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageVendors from "./pages/admin/ManageVendors";
import ManageUsers from "./pages/admin/ManageUsers";

const App = () => {
  const location = useLocation();
  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* ── Public Routes ── */}
        <Route
          path="/"
          element={<LandingPage />}
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
        <Route
          path="/products"
          element={<BrowseProducts />}
        />
        <Route
          path="/services"
          element={<BrowseServices />}
        />
        <Route
          path="/products/:id"
          element={<ProductDetail />}
        />
        <Route
          path="/services/:id"
          element={<ServiceDetail />}
        />

        {/* ── Customer Only ── */}
        <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
          <Route
            path="/customer/dashboard"
            element={<Home />}
          />
          <Route
            path="/customer/cart"
            element={<Cart />}
          />
          <Route
            path="/customer/orders"
            element={<MyOrders />}
          />
          <Route
            path="/customer/bookings"
            element={<MyBookings />}
          />
        </Route>

        {/* ── Vendor Only ── */}
        <Route element={<ProtectedRoute allowedRoles={["vendor"]} />}>
          <Route
            path="/vendor/dashboard"
            element={<VendorDashboard />}
          />
          <Route
            path="/vendor/products"
            element={<ManageProducts />}
          />
          <Route
            path="/vendor/services"
            element={<ManageServices />}
          />
          <Route
            path="/vendor/orders"
            element={<ManageOrders />}
          />
          <Route
            path="/vendor/bookings"
            element={<ManageBookings />}
          />
        </Route>

        {/* ── Admin Only ── */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />
          <Route
            path="/admin/vendors"
            element={<ManageVendors />}
          />
          <Route
            path="/admin/users"
            element={<ManageUsers />}
          />
        </Route>
      </Routes>
    </>
  );
};

export default App;
