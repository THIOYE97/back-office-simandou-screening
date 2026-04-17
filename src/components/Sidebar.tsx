import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Building2, ScanSearch, LogOut, Shield } from "lucide-react";
import { clearToken } from "../auth/auth";

export default function Sidebar() {
  const nav = useNavigate();

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/screenings", label: "Screenings", icon: ScanSearch },
    { to: "/tenants", label: "Tenants", icon: Building2 },
  ];

  return (
    <aside
      style={{
        width: 248,
        padding: 16,
        background: "var(--bg-sidebar, #111315)",
        color: "var(--text-primary, #F3F4F6)",
        borderRight: "1px solid var(--border, rgba(255,255,255,0.08))",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          padding: "6px 4px 18px",
          marginBottom: 8,
          borderBottom: "1px solid var(--border, rgba(255,255,255,0.08))",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "var(--accent-light, rgba(45,127,214,0.14))",
              border: "1px solid var(--border-active, rgba(45,127,214,0.28))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-accent, #5BA8F5)",
              flexShrink: 0,
            }}
          >
            <Shield size={18} strokeWidth={2.1} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text-primary, #F3F4F6)",
                lineHeight: 1.2,
              }}
            >
              Backoffice
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted, rgba(243,244,246,0.45))",
                marginTop: 2,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Admin Console
            </div>
          </div>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                textDecoration: "none",
                color: isActive
                  ? "var(--text-accent, #5BA8F5)"
                  : "var(--text-secondary, rgba(243,244,246,0.72))",
                background: isActive
                  ? "var(--accent-light, rgba(45,127,214,0.14))"
                  : "transparent",
                border: `1px solid ${
                  isActive
                    ? "var(--border-active, rgba(45,127,214,0.28))"
                    : "transparent"
                }`,
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 500,
                transition: "all 0.18s ease",
              })}
            >
              <Icon size={17} strokeWidth={2.1} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      <div
        style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: "1px solid var(--border, rgba(255,255,255,0.08))",
        }}
      >
        <button
          onClick={() => {
            clearToken();
            nav("/login");
          }}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid var(--border-light, rgba(255,255,255,0.12))",
            background: "transparent",
            color: "var(--text-secondary, rgba(243,244,246,0.72))",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: 13.5,
            fontWeight: 600,
            transition: "all 0.18s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "var(--text-primary, #F3F4F6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-secondary, rgba(243,244,246,0.72))";
          }}
        >
          <LogOut size={16} strokeWidth={2.1} />
          Logout
        </button>
      </div>
    </aside>
  );
}