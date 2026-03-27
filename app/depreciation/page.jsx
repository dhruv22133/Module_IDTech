'use client';
import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as Papa from "papaparse";

// ══════════════════════════════════════════════════════════════
//  BULK MOULD DEPRECIATION CALCULATOR
//  Indian Companies Act 2013 Schedule II
//  Moulds: 8 Yrs | 5% Residual | NESD | SLM + Shot-Based
//  Handles 10,000+ moulds — upload CSV or use generated data
// ══════════════════════════════════════════════════════════════

// ── Generate realistic sample data (500 moulds to demonstrate) ──
function generateMoulds(count) {
  const types = ["Injection Mould", "Blow Mould", "Die Cast Mould", "Compression Mould"];
  const plants = ["Plant A - Mumbai", "Plant B - Pune", "Plant C - Nashik", "Plant D - Aurangabad"];
  const vendors = ["Tata Moulds Pvt Ltd", "Bharat Engineering", "Precision Tooling Co", "Elite Mould Makers", "Global Tool Craft", "Shree Tools", "Star Jobwork"];
  const parts = ["Bumper Front", "Bumper Rear", "Dashboard", "Door Trim", "Grille", "Headlamp Bezel", "Fender", "Console", "A-Pillar", "B-Pillar", "Tailgate", "Hood Inner", "Wheel Arch", "Rocker Panel", "Mirror Housing", "Air Dam", "Fog Lamp", "Side Skirt", "Spoiler", "Diffuser"];
  const sides = ["LH", "RH", "CTR", "", "Assembly"];
  const arr = [];
  for (let i = 1; i <= count; i++) {
    const cost = Math.round((800000 + Math.random() * 4200000) / 1000) * 1000;
    const maxShots = [300000, 400000, 500000, 600000, 750000][Math.floor(Math.random() * 5)];
    const ageYrs = +(Math.random() * 9).toFixed(1);
    const lifeUsedPct = Math.min(0.99, ageYrs / 8 + (Math.random() * 0.15 - 0.075));
    const currentShots = Math.round(maxShots * Math.min(0.998, Math.random() * 0.3 + lifeUsedPct * 0.7));
    const capDate = new Date(2025 - Math.floor(ageYrs), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    arr.push({
      id: `MLD-${String(i).padStart(5, "0")}`,
      name: `${parts[i % parts.length]} ${sides[i % sides.length]}`.trim(),
      type: types[i % types.length],
      plant: plants[i % plants.length],
      vendor: vendors[i % vendors.length],
      cost,
      residualPct: 5,
      usefulLife: 8,
      maxShots,
      currentShots,
      capDate: capDate.toISOString().slice(0, 10),
      ageYrs,
    });
  }
  return arr;
}

function fmt(n) { return "\u20B9" + Math.round(n).toLocaleString("en-IN"); }
function fmtN(n) { return Math.round(n).toLocaleString("en-IN"); }
function pct(n) { return n.toFixed(1) + "%"; }

// ── Depreciation calc for one mould ──
function calcDepr(m) {
  const C = m.cost;
  const RV = C * (m.residualPct / 100);
  const DA = C - RV;
  const N = m.usefulLife;
  // SLM
  const slmAnnual = DA / N;
  const slmRate = ((1 / N) * (1 - m.residualPct / 100)) * 100;
  const slmToDate = Math.min(DA, slmAnnual * m.ageYrs);
  const slmBookValue = Math.max(RV, C - slmToDate);
  // Shot-based
  const perShot = DA / (m.maxShots || 1);
  const shotDepr = Math.min(DA, perShot * m.currentShots);
  const shotBookValue = Math.max(RV, C - shotDepr);
  const shotLifePct = (m.currentShots / (m.maxShots || 1)) * 100;
  return { ...m, RV, DA, slmAnnual, slmRate, slmToDate, slmBookValue, perShot, shotDepr, shotBookValue, shotLifePct };
}

const PAGE_SIZE = 50;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#f0f2f5;min-height:100vh;color:#111827}

.shell{display:flex;height:100vh;overflow:hidden}

/* SIDEBAR */
.sb{width:220px;flex-shrink:0;background:linear-gradient(170deg,#3b3fe8 0%,#5b2be0 45%,#7c2fe8 100%);display:flex;flex-direction:column;position:relative;overflow:hidden}
.sb::after{content:'';position:absolute;bottom:-60px;left:-60px;width:240px;height:240px;border-radius:50%;background:rgba(255,255,255,.05)}
.sb-brand{padding:22px 20px 18px;border-bottom:1px solid rgba(255,255,255,.1)}
.sb-row{display:flex;align-items:center;gap:10px}
.sb-logo{width:36px;height:36px;background:rgba(255,255,255,.18);border-radius:9px;display:flex;align-items:center;justify-content:center}
.sb-nm{font-size:14px;font-weight:700;color:#fff} .sb-nm span{font-weight:400;opacity:.8}
.sb-tag{font-size:10px;color:rgba(255,255,255,.5);margin-top:1px}
.sb-nav{flex:1;padding:14px 12px;display:flex;flex-direction:column;gap:4px;overflow-y:auto}
.sb-sec{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.35);padding:10px 12px 4px;margin-top:6px}
.sb-link{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;cursor:pointer;color:rgba(255,255,255,.65);font-size:13px;font-weight:500;transition:background .15s}
.sb-link:hover{background:rgba(255,255,255,.1);color:#fff}
.sb-link.on{background:rgba(255,255,255,.18);color:#fff;font-weight:600}
.sb-foot{padding:16px 14px;border-top:1px solid rgba(255,255,255,.1)}
.sb-av{width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff}

/* MAIN */
.mn{flex:1;display:flex;flex-direction:column;overflow:hidden}
.top{height:58px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;padding:0 28px;flex-shrink:0;box-shadow:0 1px 4px rgba(0,0,0,.05)}
.top-title{font-size:17px;font-weight:800;color:#111827;letter-spacing:-.02em}
.top-bc{font-size:12px;color:#9ca3af;margin-bottom:1px}
.top-r{display:flex;align-items:center;gap:12px}
.upill{display:flex;align-items:center;gap:8px;background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:10px;padding:5px 12px 5px 6px}
.uav{width:26px;height:26px;border-radius:50%;background:#4f46e5;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff}
.unm{font-size:12px;font-weight:600;color:#374151}
.cnt{flex:1;overflow-y:auto;padding:24px 28px}

/* LEGAL */
.legal{background:#fffbeb;border:1.5px solid #fde68a;border-radius:14px;padding:14px 18px;margin-bottom:20px;display:flex;gap:12px;align-items:flex-start}
.legal-ico{font-size:20px;flex-shrink:0}
.legal-b{font-size:12px;font-weight:800;color:#92400e}
.legal-t{font-size:11.5px;color:#a16207;margin-top:2px;line-height:1.5}
.legal-pill{display:inline-flex;font-size:10px;font-weight:700;background:#fef3c7;color:#d97706;padding:2px 8px;border-radius:6px;margin-top:4px}

/* FORMULA REF */
.fref{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px}
.fbox{background:#1e293b;border-radius:12px;padding:14px 18px;position:relative;overflow:hidden}
.fbox::before{content:'';position:absolute;top:0;right:0;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,.03)}
.fbox-tag{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#64748b;margin-bottom:8px}
.fbox-expr{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;color:#e2e8f0;line-height:1.6}
.fh{color:#38bdf8}.fg{color:#4ade80}.fo{color:#94a3b8}.fy{color:#fbbf24;font-weight:700}

/* SUMMARY STRIP */
.sum-row{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:20px}
.sum{background:#fff;border-radius:14px;padding:14px 16px;border:1px solid #e5e7eb;box-shadow:0 1px 4px rgba(0,0,0,.04);position:relative;overflow:hidden}
.sum:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,.08)}
.sum.feat{background:linear-gradient(135deg,#4f46e5,#7c3aed);border-color:transparent}
.sum.feat::after{content:'';position:absolute;top:-25px;right:-25px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.08)}
.sum-l{font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#6b7280}
.sum-l.w{color:rgba(255,255,255,.7)}
.sum-v{font-size:20px;font-weight:800;letter-spacing:-.03em;line-height:1;margin-top:6px;color:#111827;font-family:'JetBrains Mono',monospace}
.sum-v.w{color:#fff}
.sum-s{font-size:10px;color:#9ca3af;margin-top:4px}
.sum-s.w{color:rgba(255,255,255,.55)}

/* UPLOAD BAR */
.upload-bar{display:flex;align-items:center;gap:12px;margin-bottom:20px;padding:14px 18px;background:#fff;border-radius:14px;border:1px solid #e5e7eb;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.upload-btn{display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 18px;border-radius:10px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .15s;position:relative;overflow:hidden}
.upload-btn.primary{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;box-shadow:0 4px 14px rgba(91,43,224,.25)}
.upload-btn.primary:hover{opacity:.9;transform:translateY(-1px)}
.upload-btn.outline{background:#fff;color:#374151;border:1.5px solid #e5e7eb}
.upload-btn.outline:hover{border-color:#4f46e5;color:#4f46e5}
.upload-btn input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer}
.upload-info{font-size:13px;color:#6b7280;flex:1}
.upload-count{font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:800;color:#4f46e5}

/* TOOLBAR */
.toolbar{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.sbox{display:flex;align-items:center;gap:8px;height:40px;border:1.5px solid #e5e7eb;border-radius:10px;padding:0 14px;background:#fff;flex:1;max-width:360px}
.sbox input{border:none;outline:none;background:none;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#111827;width:100%}
.sbox input::placeholder{color:#9ca3af}
.fpill{display:flex;align-items:center;gap:4px;height:34px;padding:0 12px;border-radius:20px;font-size:11.5px;font-weight:600;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;color:#374151;transition:all .15s;font-family:'Plus Jakarta Sans',sans-serif}
.fpill:hover,.fpill.on{border-color:#4f46e5;color:#4f46e5;background:#eef2ff}
.mcount{margin-left:auto;font-size:12px;color:#6b7280}

/* TABLE */
.card{background:#fff;border-radius:16px;border:1px solid #e5e7eb;box-shadow:0 1px 6px rgba(0,0,0,.05);overflow:hidden;margin-bottom:18px}
.tbl-wrap{overflow-x:auto}
.tbl{width:100%;border-collapse:separate;border-spacing:0;min-width:1200px}
.tbl th{font-size:9.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;padding:9px 10px;text-align:right;border-bottom:2px solid #e8edff;background:#fafbff;white-space:nowrap;position:sticky;top:0;z-index:1}
.tbl th:first-child,.tbl th:nth-child(2){text-align:left}
.tbl td{font-size:12px;padding:8px 10px;border-bottom:1px solid #f3f4f6;color:#374151;text-align:right;font-family:'JetBrains Mono',monospace;font-weight:500;white-space:nowrap}
.tbl td:first-child,.tbl td:nth-child(2){text-align:left;font-family:'Plus Jakarta Sans',sans-serif}
.tbl td:first-child{font-weight:700;color:#4f46e5;font-family:'JetBrains Mono',monospace;font-size:11px}
.tbl tr:hover td{background:#f8faff}
.tbl .hl{background:#fef2f2}
.tbl .hl td{color:#991b1b}

/* PAGINATION */
.pag{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-top:1px solid #f3f4f6}
.pag-info{font-size:12px;color:#6b7280}
.pag-btns{display:flex;gap:4px}
.pgb{height:30px;padding:0 12px;border-radius:6px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;color:#374151;transition:all .12s;display:flex;align-items:center}
.pgb:hover{border-color:#4f46e5;color:#4f46e5}
.pgb.on{background:#4f46e5;border-color:#4f46e5;color:#fff}
.pgb:disabled{opacity:.4;cursor:default}

/* SHOT BAR */
.sbar{height:5px;background:#f3f4f6;border-radius:3px;overflow:hidden;width:70px;display:inline-block;vertical-align:middle;margin-right:6px}
.sfill{height:100%;border-radius:3px}

/* DETAIL MODAL */
.modal-ov{position:fixed;inset:0;background:rgba(15,20,40,.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(3px)}
.modal-box{background:#fff;border-radius:18px;width:100%;max-width:700px;max-height:90vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,.2);animation:mIn .22s ease}
@keyframes mIn{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.modal-hdr{padding:18px 22px 14px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:2;border-radius:18px 18px 0 0}
.modal-title{font-size:16px;font-weight:800;color:#111827}
.modal-sub{font-size:12px;color:#6b7280;margin-top:2px}
.modal-close{width:30px;height:30px;border-radius:8px;border:1.5px solid #e5e7eb;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#6b7280;font-size:14px}
.modal-close:hover{background:#f3f4f6}
.modal-body{padding:20px 22px}
.dg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px}
.di .dl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;margin-bottom:2px}
.di .dv{font-size:13.5px;font-weight:600;color:#111827}
.dm{font-family:'JetBrains Mono',monospace;color:#4f46e5;font-weight:700}
.rbox{border-radius:12px;padding:14px 16px;border:1.5px solid;margin-bottom:10px}
.rbox.a{background:#f0f9ff;border-color:#bae6fd}
.rbox.b{background:#f0fdf4;border-color:#bbf7d0}
.rbox-l{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px}
.rbox-l.la{color:#0369a1}.rbox-l.lb{color:#15803d}
.rbox-v{font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:800}
.rbox-v.va{color:#0284c7}.rbox-v.vb{color:#059669}
.rbox-f{font-family:'JetBrains Mono',monospace;font-size:11px;color:#9ca3af;margin-top:4px}
.yt{width:100%;border-collapse:separate;border-spacing:0;margin-top:10px}
.yt th{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;padding:7px 10px;text-align:right;border-bottom:2px solid #e8edff;background:#fafbff}
.yt th:first-child{text-align:left}
.yt td{font-size:12px;padding:7px 10px;border-bottom:1px solid #f3f4f6;color:#374151;text-align:right;font-family:'JetBrains Mono',monospace;font-weight:500}
.yt td:first-child{text-align:left;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600}
.yt .tot td{font-weight:700;border-top:2px solid #4f46e5;background:#f8faff}

/* TOAST */
.toast{position:fixed;bottom:24px;right:24px;background:#111827;color:#fff;padding:13px 20px;border-radius:12px;font-size:13.5px;font-weight:500;z-index:2000;box-shadow:0 8px 30px rgba(0,0,0,.25);animation:ti .3s ease;border-left:4px solid #4f46e5}
@keyframes ti{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

.logout-btn {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 11.5px;
  font-weight: 700;
  color: #ef4444;
  background: #fef2f2;
  border: 1.5px solid #fca5a5;
  border-radius: 8px;
  padding: 6px 12px;
  margin-left: 12px;
  cursor: pointer;
  transition: all .15s;
}
.logout-btn:hover {
  background: #ef4444;
  color: #fff;
}
`;

const NAV_ITEMS = [
  { label: "Dashboard", icon: "📊", route: "/dashboard" },
  { label: "User Management", icon: "👥", route: "/user-management" },
  { label: "Masters", icon: "🗂", route: "/masters" },
  { label: "Mould Registry", icon: "🔩", route: "/mould-registry" },
  { label: "Transfers & Challan", icon: "🔄", route: "/challan" },
  { label: "Mould Return", icon: "📥", route: "/return" },
  { label: "Depreciation", icon: "📉", route: "/depreciation", active: true },
  { label: "Maintenance", icon: "🔧", route: "/maintenance" },
  { label: "Scrap / Dispose", icon: "🗑", route: "/scrap" },
  { label: "Reports", icon: "📈", route: "/reports" }
];

export default function MouldDepreciation() {
  const router = useRouter();
  const [rawMoulds, setRawMoulds] = useState([]);
  const [search, setSearch] = useState("");
  const [plantFilter, setPlantFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState({ name: "User", role: "Viewer" });
  const fileRef = useRef();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
    setRawMoulds(generateMoulds(500));
  }, []);

  const userInitials = user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const flash = m => { setToast(m); setTimeout(() => setToast(null), 3500); };

  // Calculate depreciation for all moulds
  const allCalc = useMemo(() => rawMoulds.map(calcDepr), [rawMoulds]);

  // Filters
  const plants = useMemo(() => [...new Set(rawMoulds.map(m => m.plant))].sort(), [rawMoulds]);
  const filtered = useMemo(() => {
    return allCalc.filter(m => {
      if (plantFilter !== "all" && m.plant !== plantFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return m.id.toLowerCase().includes(s) || m.name.toLowerCase().includes(s) || m.vendor.toLowerCase().includes(s);
      }
      return true;
    });
  }, [allCalc, search, plantFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Summary totals
  const totals = useMemo(() => {
    const src = plantFilter === "all" ? allCalc : filtered;
    return {
      count: src.length,
      totalCost: src.reduce((s, m) => s + m.cost, 0),
      totalSlmDepr: src.reduce((s, m) => s + m.slmToDate, 0),
      totalSlmBV: src.reduce((s, m) => s + m.slmBookValue, 0),
      totalShotDepr: src.reduce((s, m) => s + m.shotDepr, 0),
      totalShotBV: src.reduce((s, m) => s + m.shotBookValue, 0),
    };
  }, [allCalc, filtered, plantFilter]);

  // CSV Upload handler
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data.map((row, i) => ({
          id: row.mould_id || row.id || row.MouldID || `MLD-${String(i + 1).padStart(5, "0")}`,
          name: row.mould_name || row.name || row.MouldName || "Unknown",
          type: row.mould_type || row.type || "Injection Mould",
          plant: row.plant || "Plant A",
          vendor: row.vendor || row.supplier || "Unknown",
          cost: parseFloat(row.cost || row.asset_value || row.Cost || 0),
          residualPct: parseFloat(row.residual_pct || 5),
          usefulLife: parseInt(row.useful_life || 8),
          maxShots: parseInt(row.max_shots || row.guaranteed_shots || 500000),
          currentShots: parseInt(row.current_shots || row.shot_count || 0),
          capDate: row.cap_date || row.capitalization_date || "2020-01-01",
          ageYrs: parseFloat(row.age_years || row.age || 4),
        })).filter(m => m.cost > 0);
        if (parsed.length > 0) {
          setRawMoulds(parsed);
          setPage(1);
          setSearch("");
          setPlantFilter("all");
          flash(`Uploaded ${parsed.length.toLocaleString()} moulds from ${file.name}`);
        } else {
          flash("No valid data found in file");
        }
      }
    });
    e.target.value = "";
  };

  // Generate more data
  const loadMore = (count) => {
    setRawMoulds(generateMoulds(count));
    setPage(1);
    setSearch("");
    setPlantFilter("all");
    flash(`Generated ${count.toLocaleString()} sample moulds`);
  };

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

  // Export CSV
  const exportCSV = () => {
    const header = "Mould ID,Name,Type,Plant,Cost,Residual Value,SLM Annual,SLM Depr to Date,SLM Book Value,Max Shots,Current Shots,Shot Depr to Date,Shot Book Value,Shot Life %\n";
    const rows = filtered.map(m =>
      `${m.id},"${m.name}",${m.type},${m.plant},${m.cost},${Math.round(m.RV)},${Math.round(m.slmAnnual)},${Math.round(m.slmToDate)},${Math.round(m.slmBookValue)},${m.maxShots},${m.currentShots},${Math.round(m.shotDepr)},${Math.round(m.shotBookValue)},${m.shotLifePct.toFixed(1)}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `mould_depreciation_${filtered.length}_moulds.csv`; a.click();
    URL.revokeObjectURL(url);
    flash(`Exported ${filtered.length.toLocaleString()} moulds`);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        {/* SIDEBAR */}
        <div className="sb">
          <div className="sb-brand"><div className="sb-row">
            <div className="sb-logo"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".9" /><rect x="12" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".6" /><rect x="2" y="12" width="6" height="6" rx="1.5" fill="white" opacity=".6" /><rect x="12" y="12" width="6" height="6" rx="1.5" fill="white" opacity=".9" /><circle cx="10" cy="10" r="1.8" fill="white" /></svg></div>
            <div><div className="sb-nm">MouldSys <span>Enterprise</span></div><div className="sb-tag">Asset Management Platform</div></div>
          </div></div>
          <div className="sb-nav">
            <div className="sb-sec">Main</div>
            {NAV_ITEMS.map(n => <div key={n.label} className={`sb-link${n.active ? " on" : ""}`} onClick={() => router.push(n.route)}><span>{n.icon}</span>{n.label}</div>)}
          </div>
          <div className="sb-foot"><div className="sb-row"><div className="sb-av">{userInitials}</div><div><div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{user.name}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>{user.role}</div></div></div></div>
        </div>

        {/* MAIN */}
        <div className="mn">
          <div className="top">
            <div><div className="top-bc">Modules - Depreciation</div><div className="top-title">Bulk Mould Depreciation</div></div>
            <div className="top-r">
              <div className="upill">
                <div className="uav">
                  {userInitials}
                </div>
                <span className="unm">
                  {user.name}
                </span>
              </div>
            <button className="logout-btn" onClick={handleLogout}>
                Logout ➔
            </button>
            </div>
          </div>

          <div className="cnt">

            {/* Legal */}
            <div className="legal">
              <div className="legal-ico">⚖️</div>
              <div>
                <div className="legal-b">Companies Act 2013 - Schedule II - Moulds [NESD]</div>
                <div className="legal-t">Useful Life: 8 Years | Residual: 5% of Cost | SLM Rate: 11.88% | No Extra Shift Depreciation</div>
              </div>
            </div>

            {/* Formula Reference */}
            <div className="fref">
              <div className="fbox">
                <div className="fbox-tag">SLM - Straight Line Method</div>
                <div className="fbox-expr"><span className="fh">Annual Dep.</span> <span className="fy">=</span> <span className="fo">(</span><span className="fg">Cost</span> <span className="fo">-</span> <span className="fg">5% Residual</span><span className="fo">)</span> <span className="fo">/</span> <span className="fg">8 Years</span></div>
              </div>
              <div className="fbox">
                <div className="fbox-tag">Units of Production - Shot Based</div>
                <div className="fbox-expr"><span className="fh">Dep. to Date</span> <span className="fy">=</span> <span className="fo">(</span><span className="fg">Cost</span> <span className="fo">-</span> <span className="fg">5% Residual</span><span className="fo">)</span> <span className="fo">/</span> <span className="fg">Max Shots</span> <span className="fo">x</span> <span className="fg">Current Shots</span></div>
              </div>
            </div>

            {/* Upload Bar */}
            <div className="upload-bar">
              <div className="upload-btn primary" style={{ position: "relative" }}>
                📂 Upload CSV
                <input type="file" accept=".csv,.txt" onChange={handleUpload} ref={fileRef} />
              </div>
              <div className="upload-btn outline" onClick={() => loadMore(500)}>500 Moulds</div>
              <div className="upload-btn outline" onClick={() => loadMore(1000)}>1,000</div>
              <div className="upload-btn outline" onClick={() => loadMore(5000)}>5,000</div>
              <div className="upload-btn outline" onClick={() => loadMore(10000)}>10,000</div>
              <div className="upload-info">
                Loaded: <span className="upload-count">{rawMoulds.length.toLocaleString()}</span> moulds
              </div>
              <div className="upload-btn outline" onClick={exportCSV}>Export CSV</div>
            </div>

            {/* Summary Totals */}
            <div className="sum-row">
              <div className="sum feat">
                <div className="sum-l w">Total Moulds</div>
                <div className="sum-v w">{fmtN(totals.count)}</div>
                <div className="sum-s w">All moulds loaded</div>
              </div>
              <div className="sum">
                <div className="sum-l">Total Asset Cost</div>
                <div className="sum-v">{fmt(totals.totalCost)}</div>
                <div className="sum-s">Original cost</div>
              </div>
              <div className="sum">
                <div className="sum-l">SLM Depr. to Date</div>
                <div className="sum-v" style={{ color: "#0284c7" }}>{fmt(totals.totalSlmDepr)}</div>
                <div className="sum-s">Accumulated (SLM)</div>
              </div>
              <div className="sum">
                <div className="sum-l">SLM Book Value</div>
                <div className="sum-v" style={{ color: "#4f46e5" }}>{fmt(totals.totalSlmBV)}</div>
                <div className="sum-s">Current (SLM)</div>
              </div>
              <div className="sum">
                <div className="sum-l">Shot Depr. to Date</div>
                <div className="sum-v" style={{ color: "#059669" }}>{fmt(totals.totalShotDepr)}</div>
                <div className="sum-s">Accumulated (Shots)</div>
              </div>
              <div className="sum">
                <div className="sum-l">Shot Book Value</div>
                <div className="sum-v" style={{ color: "#15803d" }}>{fmt(totals.totalShotBV)}</div>
                <div className="sum-s">Current (Shots)</div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="toolbar">
              <div className="sbox">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#9ca3af" strokeWidth="1.5" /><path d="M10 10l3 3" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" /></svg>
                <input placeholder="Search Mould ID, Name, Vendor..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
              </div>
              <div className={`fpill${plantFilter === "all" ? " on" : ""}`} onClick={() => { setPlantFilter("all"); setPage(1) }}>All Plants</div>
              {plants.map(p => <div key={p} className={`fpill${plantFilter === p ? " on" : ""}`} onClick={() => { setPlantFilter(p); setPage(1) }}>{p.split("-")[0].trim()}</div>)}
              <div className="mcount">Showing {filtered.length.toLocaleString()} of {rawMoulds.length.toLocaleString()}</div>
            </div>

            {/* Table */}
            <div className="card">
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead><tr>
                    <th style={{ textAlign: "left" }}>Mould ID</th>
                    <th style={{ textAlign: "left" }}>Name / Type</th>
                    <th>Cost ({"\u20B9"})</th>
                    <th>Residual ({"\u20B9"})</th>
                    <th>SLM Annual</th>
                    <th>SLM Dep. to Date</th>
                    <th>SLM Book Value</th>
                    <th>Shots Used</th>
                    <th>Shot Life</th>
                    <th>Shot Dep.</th>
                    <th>Shot Book Val.</th>
                    <th></th>
                  </tr></thead>
                  <tbody>
                    {paged.length === 0 && <tr><td colSpan={12} style={{ textAlign: "center", color: "#9ca3af", padding: 30, fontFamily: "Plus Jakarta Sans" }}>No moulds found</td></tr>}
                    {paged.map(m => {
                      const critical = m.shotLifePct > 90;
                      return (
                        <tr key={m.id} className={critical ? "hl" : ""}>
                          <td>{m.id}</td>
                          <td style={{ fontWeight: 600, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}<div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 400 }}>{m.type}</div></td>
                          <td>{fmtN(m.cost)}</td>
                          <td>{fmtN(m.RV)}</td>
                          <td>{fmtN(m.slmAnnual)}</td>
                          <td>{fmtN(m.slmToDate)}</td>
                          <td style={{ fontWeight: 700 }}>{fmtN(m.slmBookValue)}</td>
                          <td>{fmtN(m.currentShots)}</td>
                          <td>
                            <span className="sbar"><span className="sfill" style={{ width: `${Math.min(100, m.shotLifePct)}%`, background: m.shotLifePct > 90 ? "#dc2626" : m.shotLifePct > 70 ? "#d97706" : "#059669" }} /></span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: m.shotLifePct > 90 ? "#dc2626" : m.shotLifePct > 70 ? "#d97706" : "#059669" }}>{pct(m.shotLifePct)}</span>
                          </td>
                          <td>{fmtN(m.shotDepr)}</td>
                          <td style={{ fontWeight: 700, color: m.shotBookValue <= m.RV * 1.1 ? "#dc2626" : "#111827" }}>{fmtN(m.shotBookValue)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="pag">
                <div className="pag-info">Page {page} of {totalPages} ({filtered.length.toLocaleString()} moulds)</div>
                <div className="pag-btns">
                  <button className="pgb" disabled={page <= 1} onClick={() => setPage(1)}>First</button>
                  <button className="pgb" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const p = start + i;
                    return p <= totalPages ? <button key={p} className={`pgb${page === p ? " on" : ""}`} onClick={() => setPage(p)}>{p}</button> : null;
                  })}
                  {totalPages > 5 && page < totalPages - 2 && <span style={{ color: "#9ca3af", padding: "0 4px" }}>...</span>}
                  <button className="pgb" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                  <button className="pgb" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>Last</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}