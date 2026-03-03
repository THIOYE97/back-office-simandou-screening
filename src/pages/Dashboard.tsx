// src/pages/Dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
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
}> = ({ title, value, href, hint }) => (
  <div className="card cardPad kpiCard">
    <div className="kpiInner">
      <div className="kpiTitle">{title}</div>
      <div className="kpiValue">{value}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <a className="kpiLink" href={href}>
          Ouvrir →
        </a>
        {hint ? <span className="small">{hint}</span> : null}
      </div>
    </div>
  </div>
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
        users_total: Number(usersResp?.total ?? (usersResp?.items?.length ?? 0)),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <div className="pageTitle">
        <div>
          <div className="badge" style={{ marginBottom: 10 }}>
            <span className="strong">Backoffice</span>
            {activeTenant ? (
              <>
                <span className="small">• active tenant</span>
                <span className="mono small">{activeTenant}</span>
              </>
            ) : (
              <span className="small">• no active tenant</span>
            )}
          </div>

          <h1 className="h1">Admin Dashboard</h1>
          <p className="sub">Recap global + accès rapide (tenants, users, screenings).</p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn btnGhost btnSm" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Rafraîchir"}
          </button>
          <a className="btn btnPrimary btnSm" href="/tenants" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
            Gérer tenants
          </a>
        </div>
      </div>

      {error ? (
        <div className="alert" style={{ borderColor: "rgba(255,77,109,.45)", background: "rgba(255,77,109,.12)" }}>
          <div className="strong">Erreur</div>
          <div className="hr" />
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{error}</pre>
        </div>
      ) : null}

      <div className="kpiGrid" style={{ marginTop: 14 }}>
        <KpiCard title="Tenants" value={stats.tenants} href="/tenants" hint="Créer • suspendre • naviguer" />
        <KpiCard title="Users" value={stats.users_total} href="/users" hint="Rôles • activation • création" />
        <KpiCard title="Screenings" value={stats.screenings_count} href="/screenings" hint="Historique + filtres" />
      </div>

      <div className="card cardPad" style={{ marginTop: 14 }}>
        <div className="strong">Raccourcis</div>
        <div className="small">Accès direct aux sections clés</div>
        <div className="hr" />
        <div className="row">
          <a className="btn btnGhost btnSm" href="/screenings" style={{ textDecoration: "none" }}>Voir tous les screenings</a>
          <a className="btn btnGhost btnSm" href="/users" style={{ textDecoration: "none" }}>Gérer les users</a>
          <a className="btn btnGhost btnSm" href="/tenants" style={{ textDecoration: "none" }}>Gérer les tenants</a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

