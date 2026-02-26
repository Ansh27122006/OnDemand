import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoutes";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Pages
import Home from "./pages/customer/Home";
import Unauthorized from "./pages/auth/Unauthorized";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import LandingPage from "./pages/LandingPage";
import BrowseProducts from "./pages/customer/BrowseProducts";
import BrowseServices from "./pages/customer/BrowseServices";
import ProductDetail from "./pages/customer/ProductDetail";
import ServiceDetail from "./pages/customer/ServiceDetail";
import Cart from "./pages/customer/Cart";
import MyOrders from "./pages/customer/MyOrders";

const App = () => {
  const location = useLocation();
  const hideNavbar = ["/login", "/register"].includes(location.pathname);
  return (
    <>
      {!hideNavbar && <Navbar />}
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
        <Route
          element={
            <ProtectedRoute allowedRoles={["customer", "vendor", "admin"]} />
          }>
          <Route
            path="/cart"
            element={<Cart />}
          />
        </Route>
        <Route
          element={
            <ProtectedRoute allowedRoles={["customer", "vendor", "admin"]} />
          }>
          <Route
            path="/customer/orders"
            element={<MyOrders />}
          />
        </Route>
      </Routes>
    </>
  );
};

export default App;
