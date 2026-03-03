// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { JSX } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Screenings from "./pages/Screenings";
import Tenants from "./pages/Tenants";
import TenantUsers from "./pages/TenantUsers";
import Sidebar from "./components/Sidebar";
import { isAuthed } from "./auth/auth";

function PrivateLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 16 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/screenings" element={<Screenings />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/tenants/:tenantId/users" element={<TenantUsers />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function PrivateRoute({ children }: { children: JSX.Element }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <PrivateLayout />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

