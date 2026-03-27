'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ─── MOCK DATA ────────────────────────────────────────────
const KPI_DATA = {
  total: 1248, atVendor: 186, atSelf: 742, inTransit: 94, inMaintenance: 67, retired: 159
};

const STATUS_DIST = [
  { label: "At Self", value: 742, pct: 59.5, color: "#4f46e5" },
  { label: "At Vendor", value: 186, pct: 14.9, color: "#0891b2" },
  { label: "In Transit", value: 94, pct: 7.5, color: "#f59e0b" },
  { label: "Maintenance", value: 67, pct: 5.4, color: "#ef4444" },
  { label: "Retired", value: 159, pct: 12.7, color: "#9ca3af" },
];

const PLANT_DATA = [
  { plant: "Plant A – Mumbai", total: 412, atSelf: 280, atVendor: 72, transit: 36, maint: 24 },
  { plant: "Plant B – Pune", total: 318, atSelf: 210, atVendor: 58, transit: 28, maint: 22 },
  { plant: "Plant C – Nashik", total: 264, atSelf: 162, atVendor: 38, transit: 18, maint: 14 },
  { plant: "Plant D – Aurangabad", total: 254, atSelf: 90, atVendor: 18, transit: 12, maint: 7 },
];

const LIFE_EXPIRY = [
  { id: "MLD-0042", name: "Bumper Front LH", plant: "Plant A", pct: 94, shots: 470000, max: 500000, urgent: true },
  { id: "MLD-0118", name: "Dashboard Panel RH", plant: "Plant B", pct: 88, shots: 440000, max: 500000, urgent: true },
  { id: "MLD-0203", name: "Door Trim Inner LH", plant: "Plant A", pct: 82, shots: 410000, max: 500000, urgent: false },
  { id: "MLD-0087", name: "Grille Centre", plant: "Plant C", pct: 79, shots: 395000, max: 500000, urgent: false },
  { id: "MLD-0311", name: "Headlamp Bezel RH", plant: "Plant D", pct: 76, shots: 380000, max: 500000, urgent: false },
];

const NEAR_EOL = [
  { id: "MLD-0042", name: "Bumper Front LH", plant: "Plant A – Mumbai", remaining: 30000, daysLeft: 12, status: "Critical" },
  { id: "MLD-0118", name: "Dashboard Panel RH", plant: "Plant B – Pune", remaining: 60000, daysLeft: 28, status: "Warning" },
  { id: "MLD-0203", name: "Door Trim Inner LH", plant: "Plant A – Mumbai", remaining: 90000, daysLeft: 41, status: "Warning" },
  { id: "MLD-0087", name: "Grille Centre", plant: "Plant C – Nashik", remaining: 105000, daysLeft: 55, status: "Monitor" },
  { id: "MLD-0311", name: "Headlamp Bezel RH", plant: "Plant D – Aurangabad", remaining: 120000, daysLeft: 63, status: "Monitor" },
];

const RECENT_TRANSFERS = [
  { id: "TRF-2025-0892", mould: "MLD-0042 – Bumper Front LH", from: "Plant A", to: "Vendor: Precision Tools", date: "04 Mar 2025", status: "In Transit", type: "out" },
  { id: "TRF-2025-0891", mould: "MLD-0203 – Door Trim Inner LH", from: "Vendor: Tata Moulds", to: "Plant B", date: "03 Mar 2025", status: "Received", type: "in" },
  { id: "TRF-2025-0889", mould: "MLD-0118 – Dashboard Panel", from: "Plant C", to: "Plant A", date: "02 Mar 2025", status: "In Transit", type: "out" },
  { id: "TRF-2025-0887", mould: "MLD-0311 – Headlamp Bezel", from: "Maintenance", "to": "Plant D", date: "01 Mar 2025", status: "Received", type: "in" },
  { id: "TRF-2025-0884", mould: "MLD-0087 – Grille Centre", from: "Plant B", to: "Vendor: Elite Moulds", date: "28 Feb 2025", status: "Received", type: "out" },
  { id: "TRF-2025-0880", mould: "MLD-0512 – A-Pillar Cover RH", from: "Plant D", to: "Maintenance Bay", date: "27 Feb 2025", status: "In Transit", type: "maint" },
];

const NAV_ITEMS = [
  { label: "Dashboard", icon: "📊", route: "/dashboard", active: true },
  { label: "User Management", icon: "👥", route: "/user-management" },
  { label: "Masters", icon: "🗂", route: "/masters" },
  { label: "Mould Registry", icon: "🔩", route: "/mould-registry" },
  { label: "Transfers & Challan", icon: "🔄", route: "/challan" },
  { label: "Mould Return", icon: "📥", route: "/return" },
  { label: "Depreciation", icon: "📉", route: "/depreciation" },
  { label: "Maintenance", icon: "🔧", route: "/maintenance" },
  { label: "Scrap / Dispose", icon: "🗑", route: "/scrap" },
  { label: "Reports", icon: "📈", route: "/reports" },
];

// ─── DONUT CHART ──────────────────────────────────────────
function DonutChart({ data, size = 160, stroke = 28 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segments = data.map(d => {
    const seg = { ...d, offset, dash: (d.pct / 100) * circ };
    offset += seg.dash;
    return seg;
  });
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      {segments.map((s, i) => (
        <circle key={i} cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={s.color} strokeWidth={stroke}
          strokeDasharray={`${s.dash} ${circ - s.dash}`}
          strokeDashoffset={-s.offset}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      ))}
    </svg>
  );
}

// ─── BAR CHART (plant wise) ───────────────────────────────
function PlantBar({ row, maxTotal }) {
  const bars = [
    { key: "atSelf", color: "#4f46e5", label: "Self" },
    { key: "atVendor", color: "#0891b2", label: "Vendor" },
    { key: "transit", color: "#f59e0b", label: "Transit" },
    { key: "maint", color: "#ef4444", label: "Maint." },
  ];
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{row.plant.split("–")[0].trim()}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{row.total.toLocaleString()}</span>
      </div>
      <div style={{ display: "flex", height: 10, borderRadius: 6, overflow: "hidden", background: "#f3f4f6", gap: 1 }}>
        {bars.map(b => (
          <div key={b.key} title={`${b.label}: ${row[b.key]}`}
            style={{ width: `${(row[b.key] / maxTotal) * 100}%`, background: b.color, transition: "width .6s ease" }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        {bars.map(b => (
          <span key={b.key} style={{ fontSize: 10, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ width: 6, height: 6, borderRadius: 2, background: b.color, display: "inline-block" }} />
            {row[b.key]}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── ANIMATED COUNTER ────────────────────────────────────
function Counter({ target, duration = 1200 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return <>{val.toLocaleString()}</>;
}

// ─── STYLES ──────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#f0f2f5;color:#111827}

.shell{display:flex;height:100vh;overflow:hidden}

/* SIDEBAR */
.sidebar{width:220px;flex-shrink:0;background:linear-gradient(170deg,#3b3fe8 0%,#5b2be0 45%,#7c2fe8 100%);display:flex;flex-direction:column;position:relative;overflow:hidden}
.sidebar::after{content:'';position:absolute;bottom:-60px;left:-60px;width:240px;height:240px;border-radius:50%;background:rgba(255,255,255,.05);pointer-events:none}
.sb-brand{padding:20px 18px 16px;border-bottom:1px solid rgba(255,255,255,.1)}
.sb-row{display:flex;align-items:center;gap:10px}
.sb-icon{width:34px;height:34px;background:rgba(255,255,255,.18);border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sb-name{font-size:13px;font-weight:700;color:#fff}.sb-name span{font-weight:400;opacity:.8}
.sb-sub{font-size:10px;color:rgba(255,255,255,.45);margin-top:1px}
.sb-nav{flex:1;padding:12px 10px;display:flex;flex-direction:column;gap:3px;overflow-y:auto}
.sb-sec{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.3);padding:10px 10px 4px}
.sb-item{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:8px;cursor:pointer;color:rgba(255,255,255,.6);font-size:12.5px;font-weight:500;transition:background .15s}
.sb-item:hover{background:rgba(255,255,255,.1);color:#fff}
.sb-item.active{background:rgba(255,255,255,.18);color:#fff;font-weight:700}
.sb-footer{padding:14px 12px;border-top:1px solid rgba(255,255,255,.1)}
.sb-avatar{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0}
.sb-uname{font-size:11.5px;font-weight:600;color:#fff}
.sb-urole{font-size:10px;color:rgba(255,255,255,.45)}

/* MAIN */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.topbar{height:56px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;box-shadow:0 1px 4px rgba(0,0,0,.05)}
.tb-title{font-size:16px;font-weight:800;color:#111827;letter-spacing:-.02em}
.tb-right{display:flex;align-items:center;gap:10px}
.tb-date{font-size:11.5px;color:#9ca3af;background:#f9fafb;padding:5px 12px;border-radius:8px;border:1px solid #e5e7eb}
.notif{width:34px;height:34px;border-radius:8px;border:1.5px solid #e5e7eb;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#6b7280;position:relative}
.ndot{width:6px;height:6px;background:#ef4444;border-radius:50%;position:absolute;top:7px;right:7px;border:1.5px solid #fff}
.tb-pill{display:flex;align-items:center;gap:7px;background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:9px;padding:4px 10px 4px 5px}
.tb-av{width:24px;height:24px;border-radius:50%;background:#4f46e5;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff}
.tb-nm{font-size:11.5px;font-weight:600;color:#374151}
.logout-btn{font-family:'Plus Jakarta Sans',sans-serif;font-size:11.5px;font-weight:700;color:#ef4444;background:#fef2f2;border:1.5px solid #fca5a5;border-radius:8px;padding:6px 12px;cursor:pointer;transition:all .15s}
.logout-btn:hover{background:#ef4444;color:#fff}

/* CONTENT */
.content{flex:1;overflow-y:auto;padding:20px 24px 28px}

/* KPI STRIP */
.kpi-strip{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 1fr;gap:12px;margin-bottom:18px}
.kpi-card{background:#fff;border-radius:14px;padding:16px 18px;border:1px solid #e5e7eb;box-shadow:0 1px 4px rgba(0,0,0,.04);position:relative;overflow:hidden;transition:transform .15s,box-shadow .15s}
.kpi-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.08)}
.kpi-card.featured{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);border-color:transparent}
.kpi-card.featured::after{content:'';position:absolute;top:-30px;right:-30px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,.08)}
.kpi-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px}
.kpi-label{font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#6b7280}
.kpi-label.white{color:rgba(255,255,255,.75)}
.kpi-icon{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.kpi-value{font-size:28px;font-weight:800;color:#111827;letter-spacing:-.03em;line-height:1}
.kpi-value.white{color:#fff}
.kpi-sub{font-size:11px;color:#9ca3af;margin-top:4px}
.kpi-sub.white{color:rgba(255,255,255,.6)}
.kpi-bar{height:3px;border-radius:2px;margin-top:10px;background:#f3f4f6;overflow:hidden}
.kpi-bar-fill{height:100%;border-radius:2px;transition:width .8s ease}

/* GRID LAYOUT */
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
.grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px}
.grid-32{display:grid;grid-template-columns:1.3fr 1fr;gap:16px;margin-bottom:16px}
.grid-23{display:grid;grid-template-columns:1fr 1.4fr;gap:16px;margin-bottom:0}

/* CARD */
.card{background:#fff;border-radius:14px;border:1px solid #e5e7eb;box-shadow:0 1px 4px rgba(0,0,0,.04);overflow:hidden}
.card-hdr{padding:14px 18px 10px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f3f4f6}
.card-title{font-size:13.5px;font-weight:700;color:#111827}
.card-title-row{display:flex;align-items:center;gap:8px}
.card-icon{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
.card-badge{font-size:10.5px;font-weight:600;padding:2px 8px;border-radius:20px;border:1px solid}
.card-body{padding:14px 18px}
.view-all{font-size:11.5px;font-weight:600;color:#5b2be0;cursor:pointer;display:flex;align-items:center;gap:3px;text-decoration:none}
.view-all:hover{opacity:.75}

/* STATUS DIST */
.status-dist-wrap{display:flex;align-items:center;gap:20px}
.donut-wrap{position:relative;flex-shrink:0}
.donut-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.donut-total{font-size:22px;font-weight:800;color:#111827;line-height:1}
.donut-lbl{font-size:10px;color:#9ca3af;font-weight:500}
.legend{display:flex;flex-direction:column;gap:8px;flex:1}
.legend-row{display:flex;align-items:center;justify-content:space-between;gap:6px}
.legend-dot{width:8px;height:8px;border-radius:2px;flex-shrink:0}
.legend-label{font-size:12px;color:#374151;flex:1}
.legend-val{font-size:12px;font-weight:700;color:#111827}
.legend-pct{font-size:10.5px;color:#9ca3af;width:32px;text-align:right}

/* LIFE EXPIRY */
.expiry-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #f9fafb}
.expiry-row:last-child{border:none}
.expiry-id{font-size:10.5px;font-weight:700;color:#9ca3af;width:70px;flex-shrink:0}
.expiry-name{font-size:12.5px;font-weight:600;color:#111827;flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.expiry-plant{font-size:10.5px;color:#9ca3af;width:56px;text-align:right;flex-shrink:0}
.expiry-bar-wrap{width:90px;flex-shrink:0}
.expiry-bar{height:6px;border-radius:3px;background:#f3f4f6;overflow:hidden}
.expiry-bar-fill{height:100%;border-radius:3px;transition:width .6s ease}
.expiry-pct{font-size:10.5px;font-weight:700;width:32px;text-align:right;flex-shrink:0}
.urgency-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}

/* RECENT TRANSFERS */
.transfer-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #f9fafb}
.transfer-row:last-child{border:none}
.tr-icon{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0}
.tr-id{font-size:10px;font-weight:700;color:#9ca3af}
.tr-name{font-size:12px;font-weight:600;color:#111827;margin-bottom:1px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:170px}
.tr-route{font-size:10.5px;color:#9ca3af;display:flex;align-items:center;gap:4px}
.tr-date{font-size:10.5px;color:#9ca3af;margin-left:auto;flex-shrink:0;text-align:right}
.tr-status{font-size:10px;font-weight:600;padding:2px 7px;border-radius:5px;margin-top:2px;display:inline-block}

/* NEAR EOL */
.eol-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #f9fafb}
.eol-row:last-child{border:none}
.eol-badge{font-size:9.5px;font-weight:700;padding:2px 7px;border-radius:5px;flex-shrink:0;min-width:56px;text-align:center}
.eol-name{font-size:12px;font-weight:600;color:#111827;flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.eol-plant{font-size:10px;color:#9ca3af}
.eol-shots{font-size:11px;font-weight:700;color:#374151;text-align:right;flex-shrink:0}
.eol-days{font-size:10px;color:#9ca3af;text-align:right}

/* PLANT TABLE */
.plant-table{width:100%}
.plant-table th{font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;padding:6px 0;border-bottom:2px solid #f3f4f6;text-align:right}
.plant-table th:first-child{text-align:left}
.plant-table td{font-size:12.5px;color:#374151;padding:9px 0;border-bottom:1px solid #f9fafb;text-align:right;vertical-align:middle}
.plant-table td:first-child{text-align:left;font-weight:600;color:#111827;font-size:12px}
.plant-table tr:last-child td{border:none}
.plant-dot{width:8px;height:8px;border-radius:2px;display:inline-block;margin-right:6px}
.num-chip{display:inline-flex;align-items:center;justify-content:center;min-width:36px;padding:2px 6px;border-radius:5px;font-size:11.5px;font-weight:700}

/* SUMMARY ROW */
.summary-row{display:flex;gap:0;border-top:1px solid #e5e7eb;margin-top:8px;padding-top:12px}
.summary-item{flex:1;text-align:center;border-right:1px solid #f3f4f6}
.summary-item:last-child{border:none}
.summary-val{font-size:18px;font-weight:800;color:#111827}
.summary-lbl{font-size:10px;color:#9ca3af;margin-top:2px}

/* Refresh btn */
.refresh-btn{width:28px;height:28px;border-radius:7px;border:1.5px solid #e5e7eb;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#6b7280;transition:all .2s}
.refresh-btn:hover{border-color:#5b2be0;color:#5b2be0;transform:rotate(180deg)}

/* Fade-in stagger */
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.fade-1{animation:fadeUp .4s ease .05s both}
.fade-2{animation:fadeUp .4s ease .12s both}
.fade-3{animation:fadeUp .4s ease .18s both}
.fade-4{animation:fadeUp .4s ease .24s both}
.fade-5{animation:fadeUp .4s ease .30s both}
`;

// ─── STATUS COLORS ────────────────────────────────────────
function expiryColor(pct) {
  if (pct >= 90) return "#ef4444";
  if (pct >= 75) return "#f59e0b";
  return "#10b981";
}
function eolBadgeStyle(status) {
  if (status === "Critical") return { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" };
  if (status === "Warning") return { background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" };
  return { background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe" };
}
function transferStyle(type) {
  if (type === "in") return { bg: "#f0fdf4", color: "#16a34a", icon: "↙" };
  if (type === "maint") return { bg: "#fff7ed", color: "#ea580c", icon: "🔧" };
  return { bg: "#eff6ff", color: "#2563eb", icon: "↗" };
}
function trStatusStyle(status) {
  if (status === "In Transit") return { bg: "#fff7ed", color: "#d97706" };
  if (status === "Received") return { bg: "#f0fdf4", color: "#16a34a" };
  return { bg: "#f9fafb", color: "#6b7280" };
}

// ─── MAIN COMPONENT ──────────────────────────────────────
export default function Dashboard() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [user, setUser] = useState({ name: "User", role: "Viewer" });
  const maxPlant = Math.max(...PLANT_DATA.map(p => p.total));
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
  }, [router]);

  const initials = user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const fmt = d => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const handleLogout = async () => {
    try {
      // Call the server API to destroy the HTTP-Only Session Cookie
      await fetch('/api/auth/logout', { method: 'POST' });
      // Clear the legacy frontend storage
      localStorage.removeItem("user");
      // Redirect to login page
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">

        {/* ── SIDEBAR ── */}
        <div className="sidebar">
          <div className="sb-brand">
            <div className="sb-row">
              <div className="sb-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".9" />
                  <rect x="12" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".6" />
                  <rect x="2" y="12" width="6" height="6" rx="1.5" fill="white" opacity=".6" />
                  <rect x="12" y="12" width="6" height="6" rx="1.5" fill="white" opacity=".9" />
                  <circle cx="10" cy="10" r="1.8" fill="white" />
                </svg>
              </div>
              <div>
                <div className="sb-name">MouldSys <span>Enterprise</span></div>
                <div className="sb-sub">Asset Management Platform</div>
              </div>
            </div>
          </div>
          <div className="sb-nav">
            <div className="sb-sec">Main</div>
            {NAV_ITEMS.map(n => (
              <div key={n.label} className={`sb-item${n.active ? " active" : ""}`}
                onClick={() => router.push(n.route)}>
                <span>{n.icon}</span>{n.label}
              </div>
            ))}
          </div>
          <div className="sb-footer">
            <div className="sb-row">
              <div className="sb-avatar">{initials}</div>
              <div><div className="sb-uname">{user.name}</div><div className="sb-urole">{user.role}</div></div>
            </div>
          </div>
        </div>

        {/* ── MAIN ── */}
        <div className="main">

          {/* Topbar */}
          <div className="topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="tb-title">Dashboard</div>
              <span style={{ fontSize: 11, color: "#9ca3af", background: "#f3f4f6", padding: "2px 8px", borderRadius: 5, fontWeight: 500 }}>Live</span>
            </div>
            <div className="tb-right">
              <div className="tb-date">
                📅 {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} · Updated {fmt(lastRefresh)}
              </div>
              <button className="refresh-btn" title="Refresh" onClick={() => setLastRefresh(new Date())}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5A4.5 4.5 0 1110.9 4M2 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <div className="notif">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2a4 4 0 00-4 4v2l-1 2h10l-1-2V6a4 4 0 00-4-4zM5.5 12a1.5 1.5 0 003 0" stroke="#6b7280" strokeWidth="1.3" strokeLinecap="round" /></svg>
                <div className="ndot" />
              </div>
              <div className="tb-pill">
                <div className="tb-av">{initials}</div>
                <span className="tb-nm">{user.name}</span>
              </div>
              {/* Secure Logout Button */}
              <button className="logout-btn" onClick={handleLogout}>
                Logout ➔
              </button>
            </div>
          </div>

          {/* ── CONTENT ── */}
          <div className="content">

            {/* ── KPI STRIP ── */}
            <div className="kpi-strip fade-1">

              {/* Total Moulds — featured */}
              <div className="kpi-card featured">
                <div className="kpi-top">
                  <div className="kpi-label white">Total Moulds</div>
                  <div className="kpi-icon" style={{ background: "rgba(255,255,255,.15)" }}>🔩</div>
                </div>
                <div className="kpi-value white"><Counter target={KPI_DATA.total} /></div>
                <div className="kpi-sub white">Registered assets across all plants</div>
                <div className="kpi-bar" style={{ background: "rgba(255,255,255,.15)", marginTop: 12 }}>
                  <div className="kpi-bar-fill" style={{ width: "100%", background: "rgba(255,255,255,.5)" }} />
                </div>
              </div>

              {/* At Vendor */}
              <div className="kpi-card">
                <div className="kpi-top">
                  <div className="kpi-label">At Vendor</div>
                  <div className="kpi-icon" style={{ background: "#e0f2fe" }}>🏭</div>
                </div>
                <div className="kpi-value" style={{ color: "#0891b2" }}><Counter target={KPI_DATA.atVendor} /></div>
                <div className="kpi-sub">{((KPI_DATA.atVendor / KPI_DATA.total) * 100).toFixed(1)}% of total</div>
                <div className="kpi-bar">
                  <div className="kpi-bar-fill" style={{ width: `${(KPI_DATA.atVendor / KPI_DATA.total) * 100}%`, background: "#0891b2" }} />
                </div>
              </div>

              {/* At Self */}
              <div className="kpi-card">
                <div className="kpi-top">
                  <div className="kpi-label">At Self</div>
                  <div className="kpi-icon" style={{ background: "#eef2ff" }}>🏠</div>
                </div>
                <div className="kpi-value" style={{ color: "#4f46e5" }}><Counter target={KPI_DATA.atSelf} /></div>
                <div className="kpi-sub">{((KPI_DATA.atSelf / KPI_DATA.total) * 100).toFixed(1)}% of total</div>
                <div className="kpi-bar">
                  <div className="kpi-bar-fill" style={{ width: `${(KPI_DATA.atSelf / KPI_DATA.total) * 100}%`, background: "#4f46e5" }} />
                </div>
              </div>

              {/* In Transit */}
              <div className="kpi-card">
                <div className="kpi-top">
                  <div className="kpi-label">In Transit</div>
                  <div className="kpi-icon" style={{ background: "#fffbeb" }}>🚚</div>
                </div>
                <div className="kpi-value" style={{ color: "#d97706" }}><Counter target={KPI_DATA.inTransit} /></div>
                <div className="kpi-sub">{((KPI_DATA.inTransit / KPI_DATA.total) * 100).toFixed(1)}% of total</div>
                <div className="kpi-bar">
                  <div className="kpi-bar-fill" style={{ width: `${(KPI_DATA.inTransit / KPI_DATA.total) * 100}%`, background: "#f59e0b" }} />
                </div>
              </div>

              {/* Maintenance */}
              <div className="kpi-card">
                <div className="kpi-top">
                  <div className="kpi-label">Maintenance</div>
                  <div className="kpi-icon" style={{ background: "#fef2f2" }}>🔧</div>
                </div>
                <div className="kpi-value" style={{ color: "#ef4444" }}><Counter target={KPI_DATA.inMaintenance} /></div>
                <div className="kpi-sub">{((KPI_DATA.inMaintenance / KPI_DATA.total) * 100).toFixed(1)}% of total</div>
                <div className="kpi-bar">
                  <div className="kpi-bar-fill" style={{ width: `${(KPI_DATA.inMaintenance / KPI_DATA.total) * 100}%`, background: "#ef4444" }} />
                </div>
              </div>

              {/* Retired */}
              <div className="kpi-card">
                <div className="kpi-top">
                  <div className="kpi-label">Retired</div>
                  <div className="kpi-icon" style={{ background: "#f9fafb" }}>📦</div>
                </div>
                <div className="kpi-value" style={{ color: "#6b7280" }}><Counter target={KPI_DATA.retired} /></div>
                <div className="kpi-sub">{((KPI_DATA.retired / KPI_DATA.total) * 100).toFixed(1)}% of total</div>
                <div className="kpi-bar">
                  <div className="kpi-bar-fill" style={{ width: `${(KPI_DATA.retired / KPI_DATA.total) * 100}%`, background: "#9ca3af" }} />
                </div>
              </div>
            </div>

            {/* ── ROW 2: Status Distribution + Life Expiry Watch ── */}
            <div className="grid-2 fade-2">

              {/* Status Distribution */}
              <div className="card">
                <div className="card-hdr">
                  <div className="card-title-row">
                    <div className="card-icon" style={{ background: "#eef2ff" }}>📊</div>
                    <span className="card-title">Status Distribution</span>
                  </div>
                  <span className="card-badge" style={{ background: "#eef2ff", color: "#4338ca", borderColor: "#c7d2fe" }}>
                    {KPI_DATA.total.toLocaleString()} total
                  </span>
                </div>
                <div className="card-body">
                  <div className="status-dist-wrap">
                    <div className="donut-wrap">
                      <DonutChart data={STATUS_DIST} size={150} stroke={26} />
                      <div className="donut-center">
                        <div className="donut-total">{KPI_DATA.total.toLocaleString()}</div>
                        <div className="donut-lbl">Moulds</div>
                      </div>
                    </div>
                    <div className="legend">
                      {STATUS_DIST.map(s => (
                        <div className="legend-row" key={s.label}>
                          <div className="legend-dot" style={{ background: s.color }} />
                          <span className="legend-label">{s.label}</span>
                          <span className="legend-val">{s.value.toLocaleString()}</span>
                          <span className="legend-pct">{s.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Life Expiry Watch */}
              <div className="card">
                <div className="card-hdr">
                  <div className="card-title-row">
                    <div className="card-icon" style={{ background: "#fff7ed" }}>⏱</div>
                    <span className="card-title">Life Expiry Watch</span>
                  </div>
                  <a className="view-all">
                    View all
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                  </a>
                </div>
                <div className="card-body" style={{ padding: "10px 18px" }}>
                  {LIFE_EXPIRY.map(item => (
                    <div className="expiry-row" key={item.id}>
                      <div className="urgency-dot" style={{ background: expiryColor(item.pct) }} />
                      <div className="expiry-id">{item.id}</div>
                      <div className="expiry-name">{item.name}</div>
                      <div className="expiry-plant">{item.plant}</div>
                      <div className="expiry-bar-wrap">
                        <div className="expiry-bar">
                          <div className="expiry-bar-fill" style={{ width: `${item.pct}%`, background: expiryColor(item.pct) }} />
                        </div>
                        <div style={{ fontSize: 9.5, color: "#9ca3af", marginTop: 2 }}>{item.shots.toLocaleString()} / {item.max.toLocaleString()}</div>
                      </div>
                      <div className="expiry-pct" style={{ color: expiryColor(item.pct) }}>{item.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── ROW 3: Plant-wise Distribution + Recent Transfers ── */}
            <div className="grid-32 fade-3">

              {/* Plant-wise Distribution */}
              <div className="card">
                <div className="card-hdr">
                  <div className="card-title-row">
                    <div className="card-icon" style={{ background: "#f0fdf4" }}>🏗</div>
                    <span className="card-title">Plant-wise Distribution</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {[
                      { color: "#4f46e5", label: "Self" },
                      { color: "#0891b2", label: "Vendor" },
                      { color: "#f59e0b", label: "Transit" },
                      { color: "#ef4444", label: "Maint." },
                    ].map(l => (
                      <span key={l.label} style={{ fontSize: 10, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 2, background: l.color, display: "inline-block" }} />
                        {l.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="card-body">
                  <table className="plant-table" style={{ marginBottom: 8 }}>
                    <thead>
                      <tr>
                        <th>Plant</th>
                        <th style={{ color: "#4f46e5" }}>Self</th>
                        <th style={{ color: "#0891b2" }}>Vendor</th>
                        <th style={{ color: "#f59e0b" }}>Transit</th>
                        <th style={{ color: "#ef4444" }}>Maint.</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PLANT_DATA.map(row => (
                        <tr key={row.plant}>
                          <td>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{row.plant.split("–")[0].trim()}</div>
                            <div style={{ fontSize: 10, color: "#9ca3af" }}>{row.plant.split("–")[1]?.trim()}</div>
                          </td>
                          <td><span className="num-chip" style={{ background: "#eef2ff", color: "#4338ca" }}>{row.atSelf}</span></td>
                          <td><span className="num-chip" style={{ background: "#e0f2fe", color: "#0369a1" }}>{row.atVendor}</span></td>
                          <td><span className="num-chip" style={{ background: "#fffbeb", color: "#b45309" }}>{row.transit}</span></td>
                          <td><span className="num-chip" style={{ background: "#fef2f2", color: "#b91c1c" }}>{row.maint}</span></td>
                          <td style={{ fontWeight: 800, color: "#111827" }}>{row.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Bar visualisation */}
                  <div style={{ marginTop: 12, borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
                    {PLANT_DATA.map(row => <PlantBar key={row.plant} row={row} maxTotal={maxPlant} />)}
                  </div>
                  {/* Summary row */}
                  <div className="summary-row">
                    {[
                      { val: PLANT_DATA.reduce((a, r) => a + r.atSelf, 0), lbl: "Total Self", color: "#4f46e5" },
                      { val: PLANT_DATA.reduce((a, r) => a + r.atVendor, 0), lbl: "Total Vendor", color: "#0891b2" },
                      { val: PLANT_DATA.reduce((a, r) => a + r.transit, 0), lbl: "Total Transit", color: "#f59e0b" },
                      { val: PLANT_DATA.reduce((a, r) => a + r.maint, 0), lbl: "Total Maint.", color: "#ef4444" },
                    ].map(s => (
                      <div className="summary-item" key={s.lbl}>
                        <div className="summary-val" style={{ color: s.color }}>{s.val}</div>
                        <div className="summary-lbl">{s.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Transfers */}
              <div className="card">
                <div className="card-hdr">
                  <div className="card-title-row">
                    <div className="card-icon" style={{ background: "#eff6ff" }}>🔄</div>
                    <span className="card-title">Recent Transfers</span>
                  </div>
                  <a className="view-all">
                    View all
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                  </a>
                </div>
                <div className="card-body" style={{ padding: "8px 18px" }}>
                  {RECENT_TRANSFERS.map(t => {
                    const ts = transferStyle(t.type);
                    const ss = trStatusStyle(t.status);
                    return (
                      <div className="transfer-row" key={t.id}>
                        <div className="tr-icon" style={{ background: ts.bg, color: ts.color, fontSize: 15, fontWeight: 700 }}>
                          {ts.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="tr-id">{t.id}</div>
                          <div className="tr-name">{t.mould.split("–")[1]?.trim() || t.mould}</div>
                          <div className="tr-route">
                            <span>{t.from}</span>
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4h8M6 1l3 3-3 3" stroke="#d1d5db" strokeWidth="1.2" strokeLinecap="round" /></svg>
                            <span>{t.to}</span>
                          </div>
                        </div>
                        <div style={{ flexShrink: 0, textAlign: "right" }}>
                          <div className="tr-date">{t.date}</div>
                          <span className="tr-status" style={{ background: ss.bg, color: ss.color }}>{t.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── ROW 4: Near End of Life ── */}
            <div className="fade-4" style={{ marginTop: 16 }}>
              <div className="card">
                <div className="card-hdr">
                  <div className="card-title-row">
                    <div className="card-icon" style={{ background: "#fef2f2" }}>⚠️</div>
                    <span className="card-title">Near End of Life</span>
                    <span className="card-badge" style={{ background: "#fef2f2", color: "#dc2626", borderColor: "#fecaca", marginLeft: 6 }}>
                      {NEAR_EOL.filter(e => e.status === "Critical").length} Critical
                    </span>
                  </div>
                  <a className="view-all">
                    View all
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                  </a>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 0, padding: "0 18px" }}>
                  {NEAR_EOL.map(item => {
                    const bs = eolBadgeStyle(item.status);
                    const pct = ((item.remaining) / (500000)) * 100;
                    return (
                      <div key={item.id} style={{ padding: "12px 0", borderRight: "1px solid #f3f4f6", paddingRight: 14, paddingLeft: 4 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af" }}>{item.id}</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#111827", marginTop: 1, lineHeight: 1.3 }}>{item.name}</div>
                            <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{item.plant.split("–")[0].trim()}</div>
                          </div>
                          <span className="eol-badge" style={bs}>{item.status}</span>
                        </div>
                        {/* Life remaining bar */}
                        <div style={{ height: 6, background: "#f3f4f6", borderRadius: 3, marginBottom: 6, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: bs.color.replace("dc2626", "ef4444").replace("d97706", "f59e0b").replace("3b82f6", "60a5fa"), borderRadius: 3, transition: "width .6s" }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>{item.remaining.toLocaleString()} shots left</div>
                            <div style={{ fontSize: 10, color: "#9ca3af" }}>≈ {item.daysLeft} days remaining</div>
                          </div>
                          <div style={{
                            fontSize: 11, fontWeight: 700,
                            padding: "3px 8px", borderRadius: 6,
                            background: item.daysLeft <= 15 ? "#fef2f2" : item.daysLeft <= 30 ? "#fffbeb" : "#eff6ff",
                            color: item.daysLeft <= 15 ? "#dc2626" : item.daysLeft <= 30 ? "#d97706" : "#2563eb",
                          }}>
                            {item.daysLeft}d
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>{/* /content */}
        </div>{/* /main */}
      </div>
    </>
  );
}