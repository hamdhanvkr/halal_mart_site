import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";

import Categories from "./pages/Categories/Categories";
import Products from "./pages/Products/Products";
import Stocks from "./pages/Stocks/Stock";
import Orders from "./pages/Orders/Orders";
import Staff from "./pages/Staff/Staff";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Protected Admin / Staff Area */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/categories"
              element={<Categories />}
            />

            <Route
              path="/products"
              element={<Products />}
            />

            <Route
              path="/inventory"
              element={<Stocks />}
            />

            <Route
              path="/orders"
              element={<Orders />}
            />

            <Route
              path="/customers"
              element={
                <div>Customers Page</div>
              }
            />

            <Route
              path="/reports"
              element={
                <div>Reports Page</div>
              }
            />

            {/* Admin Only */}
            <Route
              path="/staff"
              element={<Staff />}
            />

            <Route
              path="/settings"
              element={
                <div>Settings Page</div>
              }
            />
          </Route>
        </Route>

        {/* Default */}
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* Unknown Route */}
        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;