// src/pages/Dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  RefreshCw,
  ScanSearch,
  Shield,
  Users,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";
import { get } from "../api";

type Stats = {
  tenants: number;
  users_total: number;
  screenings_count: number;
};

const KpiCard: React.FC<{
  title: string;
  value: number;
  href: string;
  hint?: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}> = ({ title, value, href, hint, icon: Icon }) => (
  <a
    href={href}
    style={{
      textDecoration: "none",
      color: "inherit",
      display: "block",
    }}
  >
    <div
      className="card cardPad"
      style={{
        borderRadius: 16,
        minHeight: 150,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        border: "1px solid var(--border, rgba(255,255,255,0.08))",
        background: "var(--bg-card, #141518)",
        transition: "all 0.18s ease",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: "var(--accent-light, rgba(45,127,214,0.14))",
          border: "1px solid var(--border-active, rgba(45,127,214,0.28))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-accent, #5BA8F5)",
          marginBottom: 14,
        }}
      >
        <Icon size={20} strokeWidth={2.1} />
      </div>

      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-secondary, rgba(243,244,246,0.72))",
            marginBottom: 6,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 32,
            fontWeight: 800,
            lineHeight: 1,
            color: "var(--text-primary, #F3F4F6)",
            letterSpacing: "-0.03em",
            marginBottom: 10,
          }}
        >
          {value}
        </div>

        {hint ? (
          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted, rgba(243,244,246,0.45))",
              marginBottom: 14,
            }}
          >
            {hint}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12.5,
          fontWeight: 600,
          color: "var(--text-accent, #5BA8F5)",
        }}
      >
        Ouvrir
        <ArrowRight size={14} strokeWidth={2.2} />
      </div>
    </div>
  </a>
);

const QuickActionCard: React.FC<{
  title: string;
  desc: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}> = ({ title, desc, href, icon: Icon }) => (
  <a
    href={href}
    style={{
      textDecoration: "none",
      color: "inherit",
      display: "block",
      flex: 1,
      minWidth: 220,
    }}
  >
    <div
      className="card cardPad"
      style={{
        borderRadius: 14,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        border: "1px solid var(--border, rgba(255,255,255,0.08))",
        background: "var(--bg-card, #141518)",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: "rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-accent, #5BA8F5)",
          flexShrink: 0,
        }}
      >
        <Icon size={18} strokeWidth={2.1} />
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            color: "var(--text-primary, #F3F4F6)",
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: "var(--text-secondary, rgba(243,244,246,0.72))",
            lineHeight: 1.45,
            marginBottom: 10,
          }}
        >
          {desc}
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-accent, #5BA8F5)",
          }}
        >
          Accéder
          <ArrowRight size={14} strokeWidth={2.2} />
        </div>
      </div>
    </div>
  </a>
);

const Dashboard: React.FC = () => {
  const activeTenant = useMemo(() => localStorage.getItem("active_tenant_id") || "", []);
  const [stats, setStats] = useState<Stats>({
    tenants: 0,
    users_total: 0,
    screenings_count: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [tenants, usersResp, screeningsResp] = await Promise.all([
        get<any[]>("/admin/tenants"),
        get<{ items: any[]; total?: number }>("/admin/users", { limit: 1, offset: 0 }),
        get<{ items: any[] }>("/admin/screenings", { limit: 50, offset: 0 }),
      ]);

      setStats({
        tenants: Array.isArray(tenants) ? tenants.length : 0,
        users_total: Number(usersResp?.total ?? usersResp?.items?.length ?? 0),
        screenings_count: Number(screeningsResp?.items?.length ?? 0),
      });
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Header */}
        <div
          className="card cardPad"
          style={{
            borderRadius: 18,
            border: "1px solid var(--border, rgba(255,255,255,0.08))",
            background: "var(--bg-card, #141518)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: "1px solid var(--border, rgba(255,255,255,0.08))",
                  background: "rgba(255,255,255,0.04)",
                  marginBottom: 14,
                }}
              >
                <Shield size={14} strokeWidth={2.1} color="var(--text-accent, #5BA8F5)" />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text-primary, #F3F4F6)",
                  }}
                >
                  Backoffice
                </span>
                {activeTenant ? (
                  <>
                    <span style={{ opacity: 0.35 }}>•</span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-secondary, rgba(243,244,246,0.72))",
                      }}
                    >
                      active tenant
                    </span>
                    <code
                      style={{
                        fontSize: 11,
                        padding: "2px 6px",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.06)",
                        color: "var(--text-accent, #5BA8F5)",
                      }}
                    >
                      {activeTenant}
                    </code>
                  </>
                ) : (
                  <>
                    <span style={{ opacity: 0.35 }}>•</span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-secondary, rgba(243,244,246,0.72))",
                      }}
                    >
                      no active tenant
                    </span>
                  </>
                )}
              </div>

              <h1
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                  color: "var(--text-primary, #F3F4F6)",
                  margin: 0,
                }}
              >
                Admin Dashboard
              </h1>

              <p
                style={{
                  marginTop: 8,
                  fontSize: 13.5,
                  color: "var(--text-secondary, rgba(243,244,246,0.72))",
                }}
              >
                Recap global et accès rapide aux tenants, users et screenings.
              </p>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button
                className="btn btnGhost btnSm"
                onClick={load}
                disabled={loading}
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <RefreshCw size={14} strokeWidth={2.2} />
                {loading ? "Loading…" : "Rafraîchir"}
              </button>

              <a
                className="btn btnPrimary btnSm"
                href="/tenants"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  textDecoration: "none",
                }}
              >
                <Building2 size={14} strokeWidth={2.2} />
                Gérer tenants
              </a>
            </div>
          </div>
        </div>

        {/* Error */}
        {error ? (
          <div
            className="alert"
            style={{
              border: "1px solid rgba(255,77,109,.35)",
              background: "rgba(255,77,109,.10)",
              borderRadius: 14,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#ff6b81",
                marginBottom: 8,
              }}
            >
              Erreur
            </div>
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                fontSize: 12.5,
                color: "var(--text-primary, #F3F4F6)",
              }}
            >
              {error}
            </pre>
          </div>
        ) : null}

        {/* KPI */}
        <div
          className="kpiGrid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          <KpiCard
            title="Tenants"
            value={stats.tenants}
            href="/tenants"
            hint="Créer, suspendre, naviguer"
            icon={Building2}
          />
          <KpiCard
            title="Users"
            value={stats.users_total}
            href="/users"
            hint="Rôles, activation, création"
            icon={Users}
          />
          <KpiCard
            title="Screenings"
            value={stats.screenings_count}
            href="/screenings"
            hint="Historique et filtres"
            icon={ScanSearch}
          />
        </div>

        {/* Quick actions */}
        <div
          className="card cardPad"
          style={{
            borderRadius: 18,
            border: "1px solid var(--border, rgba(255,255,255,0.08))",
            background: "var(--bg-card, #141518)",
          }}
        >
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-primary, #F3F4F6)",
                marginBottom: 4,
              }}
            >
              Raccourcis
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-secondary, rgba(243,244,246,0.72))",
              }}
            >
              Accès direct aux sections clés du backoffice.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <QuickActionCard
              title="Voir tous les screenings"
              desc="Consulte l’historique et les entrées les plus récentes."
              href="/screenings"
              icon={ScanSearch}
            />
            <QuickActionCard
              title="Gérer les users"
              desc="Administre les comptes, rôles et activations."
              href="/users"
              icon={Users}
            />
            <QuickActionCard
              title="Gérer les tenants"
              desc="Navigue entre tenants et supervise leur état."
              href="/tenants"
              icon={Building2}
            />
          </div>
        </div>

        {/* Optional overview strip */}
        <div
          className="card cardPad"
          style={{
            borderRadius: 16,
            border: "1px solid var(--border, rgba(255,255,255,0.08))",
            background: "var(--bg-card, #141518)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <LayoutDashboard size={16} strokeWidth={2.1} color="var(--text-accent, #5BA8F5)" />
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text-primary, #F3F4F6)",
              }}
            >
              Vue d’ensemble
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border, rgba(255,255,255,0.08))",
              }}
            >
              <div style={{ fontSize: 12, color: "var(--text-muted, rgba(243,244,246,0.45))" }}>
                Tenants actifs
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--text-primary, #F3F4F6)",
                }}
              >
                {stats.tenants}
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border, rgba(255,255,255,0.08))",
              }}
            >
              <div style={{ fontSize: 12, color: "var(--text-muted, rgba(243,244,246,0.45))" }}>
                Utilisateurs enregistrés
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--text-primary, #F3F4F6)",
                }}
              >
                {stats.users_total}
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border, rgba(255,255,255,0.08))",
              }}
            >
              <div style={{ fontSize: 12, color: "var(--text-muted, rgba(243,244,246,0.45))" }}>
                Screenings visibles
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--text-primary, #F3F4F6)",
                }}
              >
                {stats.screenings_count}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;