import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UpdateStock from "./pages/UpdateStock";
import StockReport from "./pages/StockReport";
import AddProduct from "./pages/AddProduct";
import Analytics from "./pages/Analytics";

import { InventoryProvider } from "./context/InventoryContext";

/* =========================================================
   AUTHENTICATION
========================================================= */

function getStoredToken() {
  return (
    localStorage.getItem("bgs_token") ||
    sessionStorage.getItem("bgs_token")
  );
}

function clearStoredSession() {
  localStorage.removeItem("bgs_token");
  localStorage.removeItem("bgs_user");

  sessionStorage.removeItem("bgs_token");
  sessionStorage.removeItem("bgs_user");
}

function isAuthenticated() {
  const token = getStoredToken();

  if (!token) {
    return false;
  }

  try {
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      clearStoredSession();
      return false;
    }

    const normalizedPayload = payloadPart
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payload = JSON.parse(
      decodeURIComponent(
        atob(normalizedPayload)
          .split("")
          .map(
            (character) =>
              `%${character
                .charCodeAt(0)
                .toString(16)
                .padStart(2, "0")}`
          )
          .join("")
      )
    );

    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp <= currentTime) {
      clearStoredSession();
      return false;
    }

    return true;
  } catch (error) {
    console.error("Invalid authentication token:", error);

    clearStoredSession();
    return false;
  }
}

/* =========================================================
   PROTECTED ROUTES
========================================================= */

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function LoginRoute() {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
}

/* =========================================================
   APPLICATION
========================================================= */

function App() {
  return (
    <InventoryProvider>
      <BrowserRouter>
        <Routes>
          {/* Public marketing page */}
          <Route path="/" element={<Home />} />

          {/* Login */}
          <Route path="/login" element={<LoginRoute />} />

          {/* Protected inventory pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/update-stock"
            element={
              <ProtectedRoute>
                <UpdateStock />
              </ProtectedRoute>
            }
          />

          <Route
            path="/stock-report"
            element={
              <ProtectedRoute>
                <StockReport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-product"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* Unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </InventoryProvider>
  );
}

export default App;