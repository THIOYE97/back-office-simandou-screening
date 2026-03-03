import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api"; // adapte si ton fichier api est ailleurs
import { setToken } from "../auth/auth";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const resp = await login(email.trim(), password);
      setToken(resp.access_token);
      nav("/", { replace: true });
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.message ||
        "Login failed";
      setErr(String(msg));
    } finally {
      setBusy(false);
    }
  }

 return (
  <div className="authShell">
    <form className="authCard" onSubmit={onSubmit}>
      <div className="authBrand">
        <span className="brandDot" />
        <div>
          <div className="strong">Moon Backoffice</div>
          <div className="small">Secure admin access</div>
        </div>
      </div>

      <h2 style={{ margin: "10px 0 4px" }}>Connexion</h2>
      <p className="sub" style={{ marginTop: 0 }}>Rentre tes identifiants pour accéder au backoffice.</p>

      {err && <div className="alert alertErr" style={{ marginTop: 12 }}>{err}</div>}

      <div style={{ marginTop: 12 }} className="field">
        <div className="label">Email</div>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com" autoComplete="email" />
      </div>

      <div style={{ marginTop: 10 }} className="field">
        <div className="label">Password</div>
        <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" autoComplete="current-password" />
      </div>

      <button type="submit" className="btn btnPrimary btnLg" style={{ width: "100%", marginTop: 14 }} disabled={busy}>
        {busy ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  </div>
);

}
