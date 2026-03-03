import { NavLink, useNavigate } from "react-router-dom";
import { clearToken } from "../auth/auth";

export default function Sidebar() {
  const nav = useNavigate();

  const linkStyle = ({ isActive }: any) => ({
    display: "block",
    padding: "10px 12px",
    borderRadius: 10,
    textDecoration: "none",
    color: "white",
    background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
    marginBottom: 6,
  });

  return (
    <div style={{ width: 240, padding: 16, background: "#0b1220", color: "white" }}>
      <div style={{ fontWeight: 700, marginBottom: 14 }}>Backoffice</div>

      <nav>
        <NavLink to="/" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/screenings" style={linkStyle}>Screenings</NavLink>
        <NavLink to="/tenants" style={linkStyle}>Tenants</NavLink>
      </nav>

      <div style={{ marginTop: 18 }}>
        <button
          onClick={() => {
            clearToken();
            nav("/login");
          }}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "transparent",
            color: "white",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

