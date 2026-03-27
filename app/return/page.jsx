'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ══════════════════════════════════════════════════════════════
//  MOULD RETURN — Web Display Dashboard
//  
//  Operator at plant gate: Opens handheld reader app / mobile QR app
//  → Enters return challan no. → Scans RFID tag or QR code
//  → Clicks photos of mould → Saves on device
//  → Data syncs here. Mould auto-added back to plant inventory.
//  
//  THIS WEB PAGE = READ-ONLY DISPLAY. No actions needed.
// ══════════════════════════════════════════════════════════════

const NAV_ITEMS = [
   { label: "Dashboard", icon: "📊", route: "/dashboard" },
    { label: "User Management", icon: "👥", route: "/user-management"},
    { label: "Masters", icon: "🗂", route: "/masters" },
    { label: "Mould Registry", icon: "🔩", route: "/mould-registry" },
    { label: "Transfers & Challan", icon: "🔄", route: "/challan" },
    { label: "Mould Return", icon: "📥", route: "/return", active: true  },
    { label: "Depreciation", icon: "📉", route: "/depreciation" },
    { label: "Maintenance", icon: "🔧", route: "/maintenance" },
    { label: "Scrap / Dispose", icon: "🗑", route: "/scrap" },
    { label: "Reports", icon: "📈", route: "/reports" }
];

// ── SEED DATA (synced from field devices) ───────────────────
const SEED = [
  {
    id:"RTN-2025-0030",
    // — Mould (auto-identified from RFID/QR scan) —
    mouldId:"MLD-0042", tagId:"TAG-2025-042", mouldName:"Bumper Front LH", mouldType:"Injection Mould",
    // — Vendor & Plant —
    vendor:"Precision Tooling Co.", vendorCode:"VND-001", vendorCity:"Pune",
    plant:"Plant A – Mumbai", plantLocation:"Shop Floor A",
    // — Challan (entered by operator on device) —
    vendorChallanNo:"VDC-2025-3345", ourOutwardChallan:"CHN-2025-0140",
    vendorInvoiceNo:"VINV-2025-0892",
    // — Scan info —
    scanMethod:"rfid", device:"Zebra MC3300 (RFID-HH-003)",
    operator:"Santosh Gaikwad",
    // — Transport —
    vehicleNo:"MH-12-AB-4567", transporter:"Mahindra Logistics",
    // — Dates —
    sentDate:"2025-01-20", returnDate:"2025-03-04", returnTime:"09:22 AM",
    // — Mould data —
    sendReason:"Jobwork", shotsBefore:465000, shotsAtReturn:470200, maxShots:500000,
    condition:"Good", weight:"4,248 Kg",
    // — Photos captured on device —
    photos:[
      {label:"Front View", time:"09:22:14", device:"RFID-HH-003", size:"2.1 MB"},
      {label:"Parting Line", time:"09:22:38", device:"RFID-HH-003", size:"1.8 MB"},
      {label:"Ejector Side", time:"09:22:55", device:"RFID-HH-003", size:"2.3 MB"},
    ],
    // — Inspection (quick check on device) —
    inspPassed:10, inspTotal:10, inspNotes:"All OK",
    // — Remarks —
    remarks:"Jobwork completed. Mould in good condition.",
    // — Inventory status (auto) —
    inventoryStatus:"In Plant", syncedAt:"04 Mar 2025, 09:25 AM",
  },
  {
    id:"RTN-2025-0031",
    mouldId:"MLD-0634", tagId:"TAG-2025-634", mouldName:"Rear Bumper Assembly", mouldType:"Compression Mould",
    vendor:"Bharat Engineering Works", vendorCode:"VND-003", vendorCity:"Nashik",
    plant:"Plant A – Mumbai", plantLocation:"Maintenance Bay",
    vendorChallanNo:"VDC-2025-3390", ourOutwardChallan:"CHN-2025-0144",
    vendorInvoiceNo:"VINV-2025-0901",
    scanMethod:"qr", device:"Samsung XCover (MOB-QR-007)",
    operator:"Santosh Gaikwad",
    vehicleNo:"MH-14-GH-3311", transporter:"Blue Dart Logistics",
    sentDate:"2025-01-28", returnDate:"2025-03-05", returnTime:"02:10 PM",
    sendReason:"Repair", shotsBefore:490000, shotsAtReturn:490000, maxShots:500000,
    condition:"Fair – Minor flash on parting line", weight:"6,795 Kg",
    photos:[
      {label:"Top View", time:"02:11:02", device:"MOB-QR-007", size:"3.1 MB"},
      {label:"Damage Close-up", time:"02:11:28", device:"MOB-QR-007", size:"2.7 MB"},
    ],
    inspPassed:9, inspTotal:10, inspNotes:"Minor flash residue on parting line surface",
    remarks:"Repair done. Minor flash noted – routed to maintenance bay.",
    inventoryStatus:"In Plant", syncedAt:"05 Mar 2025, 02:15 PM",
  },
  {
    id:"RTN-2025-0032",
    mouldId:"MLD-0118", tagId:"TAG-2025-118", mouldName:"Dashboard Panel RH", mouldType:"Injection Mould",
    vendor:"Elite Mould Makers", vendorCode:"VND-002", vendorCity:"Mumbai",
    plant:"Plant B – Pune", plantLocation:"Staging Area",
    vendorChallanNo:"VDC-2025-3412", ourOutwardChallan:"CHN-2025-0148",
    vendorInvoiceNo:"",
    scanMethod:"rfid", device:"Zebra MC3300 (RFID-HH-001)",
    operator:"Deepak Shinde",
    vehicleNo:"MH-04-XY-9988", transporter:"DTDC Express",
    sentDate:"2025-02-05", returnDate:"2025-03-06", returnTime:"08:45 AM",
    sendReason:"Repair", shotsBefore:440000, shotsAtReturn:442800, maxShots:500000,
    condition:"Good", weight:"3,798 Kg",
    photos:[{label:"Full View", time:"08:46:02", device:"RFID-HH-001", size:"2.5 MB"}],
    inspPassed:10, inspTotal:10, inspNotes:"All OK",
    remarks:"",
    inventoryStatus:"In Plant", syncedAt:"06 Mar 2025, 08:48 AM",
  },
];

// New record that will auto-appear (simulating live sync)
const LIVE_RECORD = {
  id:"RTN-2025-0033",
  mouldId:"MLD-0087", tagId:"TAG-2025-087", mouldName:"Grille Centre", mouldType:"Die Cast Mould",
  vendor:"Precision Tooling Co.", vendorCode:"VND-001", vendorCity:"Pune",
  plant:"Plant C – Nashik", plantLocation:"Shop Floor A",
  vendorChallanNo:"VDC-2025-3450", ourOutwardChallan:"CHN-2025-0150",
  vendorInvoiceNo:"VINV-2025-0920",
  scanMethod:"rfid", device:"Zebra MC3300 (RFID-HH-002)",
  operator:"Deepak Kulkarni",
  vehicleNo:"MH-15-PQ-2200", transporter:"VRL Logistics",
  sentDate:"2025-02-10", returnDate:"2025-03-06", returnTime:"11:32 AM",
  sendReason:"Trial Run", shotsBefore:395000, shotsAtReturn:398500, maxShots:500000,
  condition:"Good", weight:"5,098 Kg",
  photos:[
    {label:"Front View", time:"11:32:20", device:"RFID-HH-002", size:"2.1 MB"},
    {label:"Side View", time:"11:32:45", device:"RFID-HH-002", size:"1.9 MB"},
  ],
  inspPassed:10, inspTotal:10, inspNotes:"All OK",
  remarks:"Trial run successful. All parameters within spec.",
  inventoryStatus:"In Plant", syncedAt:"06 Mar 2025, 11:33 AM",
};

// Moulds still at vendor
const AT_VENDOR = [
  {id:"MLD-0819", name:"Fender Extension LH", vendor:"Star Jobwork Solutions", due:"2025-04-01", reason:"Jobwork"},
  {id:"MLD-0203", name:"Door Trim Inner LH",  vendor:"Elite Mould Makers",    due:"2025-03-28", reason:"Repair"},
];

// ── CSS ─────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
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
.notif{width:36px;height:36px;border-radius:9px;border:1.5px solid #e5e7eb;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative}
.ndot{width:7px;height:7px;background:#ef4444;border-radius:50%;position:absolute;top:6px;right:6px;border:1.5px solid #fff}
.upill{display:flex;align-items:center;gap:8px;background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:10px;padding:5px 12px 5px 6px}
.uav{width:26px;height:26px;border-radius:50%;background:#4f46e5;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff}
.unm{font-size:12px;font-weight:600;color:#374151}
.cnt{flex:1;overflow-y:auto;padding:24px 28px}

/* PAGE HDR */
.phdr{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px}
.phdr-t{font-size:20px;font-weight:800;color:#111827;letter-spacing:-.025em}
.phdr-s{font-size:13px;color:#6b7280;margin-top:3px}

/* LIVE BANNER */
.live{background:linear-gradient(90deg,#ecfdf5,#f0fdfa);border:1.5px solid #6ee7b7;border-radius:14px;padding:14px 20px;margin-bottom:18px;display:flex;align-items:center;gap:14px}
.live-dot{width:10px;height:10px;background:#10b981;border-radius:50%;animation:lp 2s infinite;flex-shrink:0}
@keyframes lp{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.4)}50%{box-shadow:0 0 0 8px rgba(16,185,129,0)}}

/* KPI */
.kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.kpi{background:#fff;border-radius:14px;padding:16px 18px;border:1px solid #e5e7eb;box-shadow:0 1px 4px rgba(0,0,0,.04);transition:transform .15s;position:relative;overflow:hidden}
.kpi:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.08)}
.kpi.f{background:linear-gradient(135deg,#0891b2,#0e7490);border-color:transparent}
.kpi.f::after{content:'';position:absolute;top:-30px;right:-30px;width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,.08)}
.kl{font-size:10.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#6b7280}
.kl.w{color:rgba(255,255,255,.75)}
.kv{font-size:28px;font-weight:800;letter-spacing:-.03em;line-height:1;margin-top:8px;color:#111827}
.kv.w{color:#fff}
.ks{font-size:11px;color:#9ca3af;margin-top:4px}
.ks.w{color:rgba(255,255,255,.6)}

/* SEARCH */
.toolbar{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.sbox{display:flex;align-items:center;gap:8px;height:40px;border:1.5px solid #e5e7eb;border-radius:10px;padding:0 14px;background:#fff;flex:1;max-width:380px}
.sbox input{border:none;outline:none;background:none;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#111827;width:100%}
.sbox input::placeholder{color:#9ca3af}

/* CARD */
.card{background:#fff;border-radius:16px;border:1px solid #e5e7eb;box-shadow:0 1px 6px rgba(0,0,0,.05);overflow:hidden;margin-bottom:18px}

/* TABLE */
.tbl{width:100%;border-collapse:separate;border-spacing:0}
.tbl th{font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;padding:10px 14px;text-align:left;border-bottom:2px solid #d5edeb;background:#f5fcfb}
.tbl td{font-size:13px;padding:11px 14px;border-bottom:1px solid #f3f4f6;color:#374151;vertical-align:top}
.tbl tr:hover td{background:#f5fcfb}
.tbl-link{color:#0891b2;font-weight:700;cursor:pointer}
.tbl-link:hover{text-decoration:underline}

/* BADGE */
.badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;white-space:nowrap}
.bdot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.new-flash{font-size:9px;font-weight:800;color:#fff;background:#0891b2;padding:2px 8px;border-radius:10px;animation:nf 1.5s ease 3}
@keyframes nf{0%,100%{opacity:1}50%{opacity:.5}}

/* PENDING AT VENDOR */
.pv{background:#fff;border-radius:14px;border:1px solid #e5e7eb;overflow:hidden;margin-bottom:18px}
.pv-hdr{padding:12px 18px;background:#fffbeb;border-bottom:1px solid #fde68a;display:flex;align-items:center;gap:10px}
.pv-t{font-size:13px;font-weight:800;color:#92400e}
.pv-cnt{font-size:11px;font-weight:700;background:#fef3c7;color:#d97706;padding:2px 8px;border-radius:20px;margin-left:auto}
.pv-item{display:flex;align-items:center;gap:14px;padding:10px 18px;border-bottom:1px solid #f3f4f6}
.pv-item:last-child{border:none}

/* DETAIL SECTIONS */
.shdr{display:flex;align-items:center;gap:12px;padding:14px 22px;background:linear-gradient(90deg,#f5fcfb,#fff);border-bottom:2px solid #d5edeb;position:relative}
.shdr::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,#0891b2,#0e7490);border-radius:0 2px 2px 0}
.shdr-ico{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
.shdr-t{font-size:13px;font-weight:800;color:#1e1b4b;letter-spacing:.06em;text-transform:uppercase}
.shdr-b{font-size:10.5px;font-weight:600;background:#e0f2fe;color:#0891b2;padding:2px 8px;border-radius:20px;border:1px solid #7dd3fc;margin-left:auto}

.dg{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:16px 22px}
.dg3{grid-template-columns:repeat(3,1fr)}
.dg2{grid-template-columns:repeat(2,1fr)}
.di .dl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;margin-bottom:2px}
.di .dv{font-size:13.5px;font-weight:600;color:#111827}
.dm{font-family:'Courier New',monospace;color:#0891b2;font-weight:700}

/* ROUTE */
.route{display:grid;grid-template-columns:1fr auto 1fr;gap:14px;align-items:center;padding:16px 22px}
.rnode{border-radius:12px;padding:14px 16px;border:1.5px solid}
.rnode.from{background:#fff7ed;border-color:#fed7aa}
.rnode.to{background:#ecfdf5;border-color:#a7f3d0}
.rtype{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin-bottom:3px}
.rname{font-size:14px;font-weight:700;color:#111827}
.rsub{font-size:11px;color:#6b7280;margin-top:2px}

/* PHOTOS */
.pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:12px;padding:16px 22px}
.pcard{border-radius:12px;overflow:hidden;border:1.5px solid #e5e7eb;background:#f9fafb;transition:border-color .15s}
.pcard:hover{border-color:#7dd3fc}
.pthumb{width:100%;aspect-ratio:4/3;background:linear-gradient(135deg,#e0f2fe,#cffafe);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}
.pthumb-ico{font-size:32px}
.pthumb-lbl{font-size:10px;font-weight:600;color:#0891b2}
.pinfo{padding:8px 10px}
.plbl{font-size:11.5px;font-weight:700;color:#111827}
.pmeta{font-size:10px;color:#9ca3af;margin-top:2px}

/* INSPECTION */
.irow{display:flex;align-items:center;gap:10px;padding:7px 14px;border-bottom:1px solid #f3f4f6}
.irow:last-child{border:none}
.iico{width:20px;height:20px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0}
.iok{background:#f0fdf4;color:#059669}
.ino{background:#fef2f2;color:#dc2626}
.itsk{flex:1;font-size:12.5px;color:#374151}

/* SHOT BAR */
.shotbar{height:6px;background:#f3f4f6;border-radius:3px;overflow:hidden;margin-top:4px;width:100%}
.shotfill{height:100%;border-radius:3px}

/* INVENTORY TAG */
.inv-tag{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;background:#ecfdf5;color:#047857;padding:4px 12px;border-radius:20px;border:1.5px solid #a7f3d0}

/* BUTTONS */
.btn-ghost{display:inline-flex;align-items:center;gap:7px;height:40px;padding:0 20px;border-radius:10px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;font-weight:600;cursor:pointer;border:1.5px solid transparent;background:transparent;color:#6b7280;transition:all .15s}
.btn-ghost:hover{background:#f3f4f6;color:#374151}
.btn-o{display:inline-flex;align-items:center;gap:7px;height:28px;padding:0 10px;border-radius:6px;font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:600;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;color:#374151;transition:all .15s}
.btn-o:hover{border-color:#0891b2;color:#0891b2}

/* TOAST */
.toast{position:fixed;bottom:24px;right:24px;background:#111827;color:#fff;padding:13px 20px;border-radius:12px;font-size:13.5px;font-weight:500;z-index:2000;display:flex;align-items:center;gap:10px;box-shadow:0 8px 30px rgba(0,0,0,.25);animation:tin .3s ease;border-left:4px solid #0891b2}
@keyframes tin{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

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

// Helpers
const scanBdg = m => m==="rfid"
  ? <span className="badge" style={{background:"#e0f2fe",color:"#0891b2"}}>📡 RFID</span>
  : <span className="badge" style={{background:"#f5f3ff",color:"#7c3aed"}}>📱 QR Code</span>;

const condColor = c => c.startsWith("Good")?"#059669":c.startsWith("Fair")?"#d97706":"#dc2626";

export default function MouldReturn() {
  const router = useRouter();
  const [records, setRecords] = useState(SEED);
  const [view, setView] = useState("list"); // list | detail
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [liveAdded, setLiveAdded] = useState(false);
  const [user, setUser] = useState({ name: "User", role: "Viewer" });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
  }, []);

  const userInitials = user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const flash = m => { setToast(m); setTimeout(()=>setToast(null),4000); };

  // Simulate live sync — new record pops in after 7 seconds
  useEffect(() => {
    if (liveAdded) return;
    const t = setTimeout(() => {
      setLiveAdded(true);
      setRecords(p => [LIVE_RECORD, ...p]);
      flash("📡 New return synced — MLD-0087 Grille Centre returned from Precision Tooling Co.");
    }, 7000);
    return () => clearTimeout(t);
  }, [liveAdded]);

  const filtered = records.filter(r => {
    if (!search) return true;
    const s = search.toLowerCase();
    return r.id.toLowerCase().includes(s) || r.mouldId.toLowerCase().includes(s) || r.mouldName.toLowerCase().includes(s) || r.vendorChallanNo.toLowerCase().includes(s) || r.vendor.toLowerCase().includes(s);
  });

  const openDetail = r => { setSel(r); setView("detail"); };

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

  // ════════════════════════════════════════════════════════════
  return (
    <>
      <style>{CSS}</style>
      <div className="shell">

        {/* ── SIDEBAR ── */}
        <div className="sb">
          <div className="sb-brand"><div className="sb-row">
            <div className="sb-logo"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><rect x="12" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".6"/><rect x="2" y="12" width="6" height="6" rx="1.5" fill="white" opacity=".6"/><rect x="12" y="12" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><circle cx="10" cy="10" r="1.8" fill="white"/></svg></div>
            <div><div className="sb-nm">MouldSys <span>Enterprise</span></div><div className="sb-tag">Asset Management Platform</div></div>
          </div></div>
          <div className="sb-nav">
            <div className="sb-sec">Main</div>
            {NAV_ITEMS.map(n => <div key={n.label} className={`sb-link${n.active?" on":""}`} onClick={() => router.push(n.route)}><span>{n.icon}</span>{n.label}</div>)}
          </div>
          <div className="sb-foot"><div className="sb-row"><div className="sb-av">{userInitials}</div><div><div style={{fontSize:12,fontWeight:600,color:"#fff"}}>{user.name}</div><div style={{fontSize:10,color:"rgba(255,255,255,.5)"}}>{user.role}</div></div></div></div>
        </div>

        {/* ── MAIN ── */}
        <div className="mn">
          <div className="top">
            <div><div className="top-bc">Modules › Mould Return</div><div className="top-title">Mould Return (Vendor → Plant)</div></div>
            <div className="top-r">
              <div className="notif"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2a5 5 0 00-5 5v2l-1 2h12l-1-2V7a5 5 0 00-5-5zM6.5 13.5a1.5 1.5 0 003 0" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round"/></svg>{records.length>SEED.length&&<div className="ndot"/>}</div>
              <div className="upill"><div className="uav">{userInitials}</div><span className="unm">{user.name}</span></div>
              <button className="logout-btn" onClick={handleLogout}>
                Logout ➔
            </button>
            </div>
          </div>

          <div className="cnt">

            {/* ═══════════ LIST VIEW ═══════════ */}
            {view === "list" && (<>
              <div className="phdr">
                <div>
                  <div className="phdr-t">Mould Returns — Received from Vendors</div>
                  <div className="phdr-s">Auto-synced from handheld RFID readers & QR mobile apps at plant gates. Moulds automatically added back to plant inventory.</div>
                </div>
              </div>

              {/* Live sync banner */}
              <div className="live">
                <div className="live-dot"/>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:"#065f46"}}>Live Sync Active</div>
                  <div style={{fontSize:11.5,color:"#047857",marginTop:1}}>Records appear automatically when operators scan & save on handheld / mobile devices</div>
                </div>
                <div style={{marginLeft:"auto",fontSize:11,color:"#6ee7b7",fontWeight:600,background:"#065f46",padding:"4px 12px",borderRadius:8}}>🔄 Listening…</div>
              </div>

              {/* KPIs */}
              <div className="kpi-row">
                <div className="kpi f"><div className="kl w">Total Returned</div><div className="kv w">{records.length}</div><div className="ks w">Moulds back in plant</div></div>
                <div className="kpi"><div className="kl">Today</div><div className="kv" style={{color:"#0891b2"}}>{records.filter(r=>r.returnDate==="2025-03-06").length}</div><div className="ks">Returned today</div></div>
                <div className="kpi"><div className="kl">Still at Vendor</div><div className="kv" style={{color:"#d97706"}}>{AT_VENDOR.length}</div><div className="ks">Pending return</div></div>
                <div className="kpi"><div className="kl">Total Photos</div><div className="kv" style={{color:"#7c3aed"}}>{records.reduce((s,r)=>s+r.photos.length,0)}</div><div className="ks">Captured on devices</div></div>
              </div>

              {/* Pending at vendor */}
              {AT_VENDOR.length > 0 && (
                <div className="pv">
                  <div className="pv-hdr"><span>⏳</span><span className="pv-t">Still at Vendor – Pending Return</span><span className="pv-cnt">{AT_VENDOR.length}</span></div>
                  {AT_VENDOR.map(m => (
                    <div key={m.id} className="pv-item">
                      <div style={{width:28,height:28,borderRadius:8,background:"#fef3c7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🔩</div>
                      <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{m.id} – {m.name}</div><div style={{fontSize:11,color:"#6b7280"}}>{m.vendor} · {m.reason}</div></div>
                      <div style={{fontSize:12,fontWeight:600,color:"#374151"}}>Due: {m.due}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Search */}
              <div className="toolbar">
                <div className="sbox">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#9ca3af" strokeWidth="1.5"/><path d="M10 10l3 3" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <input placeholder="Search Return ID, Mould, Vendor, Challan…" value={search} onChange={e=>setSearch(e.target.value)}/>
                </div>
                <div style={{marginLeft:"auto",fontSize:12,color:"#6b7280"}}>{filtered.length} record{filtered.length!==1?"s":""}</div>
              </div>

              {/* Table */}
              <div className="card" style={{overflow:"auto"}}>
                <table className="tbl">
                  <thead><tr>
                    <th>Return ID</th><th>Mould</th><th>Vendor</th><th>Vendor Challan</th>
                    <th>Scan</th><th>Returned</th><th>Condition</th><th>📸</th><th>Inventory</th><th></th>
                  </tr></thead>
                  <tbody>
                    {filtered.length === 0 && <tr><td colSpan={10} style={{textAlign:"center",color:"#9ca3af",padding:40}}>No return records found</td></tr>}
                    {filtered.map((r, idx) => (
                      <tr key={r.id} style={{background: idx === 0 && liveAdded && r.id === "RTN-2025-0033" ? "#f0fdfa" : ""}}>
                        <td>
                          <span className="tbl-link" onClick={()=>openDetail(r)}>{r.id}</span>
                          {idx === 0 && liveAdded && r.id === "RTN-2025-0033" && <span className="new-flash" style={{marginLeft:6}}>JUST SYNCED</span>}
                        </td>
                        <td>
                          <div style={{fontWeight:700}}>{r.mouldId}</div>
                          <div style={{fontSize:11,color:"#6b7280"}}>{r.mouldName}</div>
                        </td>
                        <td>
                          <div style={{fontSize:12,fontWeight:600}}>{r.vendor}</div>
                          <div style={{fontSize:10,color:"#9ca3af"}}>{r.vendorCity}</div>
                        </td>
                        <td>
                          <div style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:"#0891b2"}}>{r.vendorChallanNo}</div>
                          <div style={{fontSize:10,color:"#9ca3af"}}>Out: {r.ourOutwardChallan}</div>
                        </td>
                        <td>{scanBdg(r.scanMethod)}<div style={{fontSize:10,color:"#9ca3af",marginTop:2}}>{r.device.split("(")[1]?.replace(")","")}</div></td>
                        <td>
                          <div style={{fontSize:12,fontWeight:600}}>{r.returnDate}</div>
                          <div style={{fontSize:10,color:"#9ca3af"}}>{r.returnTime}</div>
                        </td>
                        <td><span style={{fontSize:12,fontWeight:600,color:condColor(r.condition)}}>{r.condition.split("–")[0].trim()}</span></td>
                        <td><span style={{fontSize:13,fontWeight:700}}>{r.photos.length}</span></td>
                        <td><span className="inv-tag">📦 In Plant</span></td>
                        <td><button className="btn-o" onClick={()=>openDetail(r)}>View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>)}

            {/* ═══════════ DETAIL VIEW ═══════════ */}
            {view === "detail" && sel && (<>
              <div className="phdr">
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                    <div className="phdr-t">{sel.id}</div>
                    {scanBdg(sel.scanMethod)}
                    <span className="inv-tag">📦 In Plant – {sel.plantLocation}</span>
                  </div>
                  <div className="phdr-s">{sel.mouldId} – {sel.mouldName} | Synced: {sel.syncedAt}</div>
                </div>
                <button className="btn-ghost" onClick={()=>{setView("list");setSel(null)}}>← Back to List</button>
              </div>

              {/* Route */}
              <div className="card">
                <div className="route">
                  <div className="rnode from">
                    <div className="rtype">Returned From</div>
                    <div className="rname">{sel.vendor}</div>
                    <div className="rsub">{sel.vendorCode} · {sel.vendorCity}</div>
                  </div>
                  <div style={{fontSize:28,color:"#0891b2",textAlign:"center"}}>📥</div>
                  <div className="rnode to">
                    <div className="rtype">Now At (Plant Inventory)</div>
                    <div className="rname">{sel.plant}</div>
                    <div className="rsub">📍 {sel.plantLocation}</div>
                  </div>
                </div>
              </div>

              {/* Challan Details */}
              <div className="card">
                <div className="shdr"><div className="shdr-ico" style={{background:"#e0f2fe"}}>📄</div><div className="shdr-t">Challan & Transport</div></div>
                <div className="dg">
                  <div className="di"><div className="dl">Vendor Challan No.</div><div className="dv dm" style={{fontSize:16}}>{sel.vendorChallanNo}</div></div>
                  <div className="di"><div className="dl">Our Outward Challan</div><div className="dv dm">{sel.ourOutwardChallan}</div></div>
                  <div className="di"><div className="dl">Vendor Invoice</div><div className="dv">{sel.vendorInvoiceNo || "—"}</div></div>
                  <div className="di"><div className="dl">Return Challan (Auto)</div><div className="dv dm">{sel.id.replace("RTN","RCHN")}</div></div>
                  <div className="di"><div className="dl">Vehicle No.</div><div className="dv">{sel.vehicleNo}</div></div>
                  <div className="di"><div className="dl">Transporter</div><div className="dv">{sel.transporter}</div></div>
                  <div className="di"><div className="dl">Operator (on Device)</div><div className="dv">{sel.operator}</div></div>
                  <div className="di"><div className="dl">Scan Device</div><div className="dv">{sel.device}</div></div>
                </div>
              </div>

              {/* Mould Details */}
              <div className="card">
                <div className="shdr"><div className="shdr-ico" style={{background:"#fff7ed"}}>🔩</div><div className="shdr-t">Mould Details</div></div>
                <div className="dg">
                  <div className="di"><div className="dl">Mould ID</div><div className="dv dm">{sel.mouldId}</div></div>
                  <div className="di"><div className="dl">Tag ID</div><div className="dv dm">{sel.tagId}</div></div>
                  <div className="di"><div className="dl">Type</div><div className="dv">{sel.mouldType}</div></div>
                  <div className="di"><div className="dl">Condition on Arrival</div><div className="dv" style={{color:condColor(sel.condition)}}>{sel.condition}</div></div>
                  <div className="di"><div className="dl">Original Send Reason</div><div className="dv">{sel.sendReason}</div></div>
                  <div className="di"><div className="dl">Weight (Received)</div><div className="dv">{sel.weight}</div></div>
                  <div className="di"><div className="dl">Sent Date</div><div className="dv">{sel.sentDate}</div></div>
                  <div className="di"><div className="dl">Return Date & Time</div><div className="dv">{sel.returnDate}, {sel.returnTime}</div></div>
                </div>
                {/* Shot count */}
                <div style={{padding:"0 22px 16px"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                    <div style={{background:"#f9fafb",borderRadius:10,padding:"10px 14px",border:"1px solid #e5e7eb"}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:".06em"}}>Shots Before Send</div>
                      <div style={{fontSize:16,fontWeight:800,color:"#111827",marginTop:4}}>{sel.shotsBefore.toLocaleString()}</div>
                    </div>
                    <div style={{background:"#f0fdfa",borderRadius:10,padding:"10px 14px",border:"1px solid #a7f3d0"}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#059669",textTransform:"uppercase",letterSpacing:".06em"}}>Shots at Return</div>
                      <div style={{fontSize:16,fontWeight:800,color:"#059669",marginTop:4}}>{sel.shotsAtReturn.toLocaleString()} <span style={{fontSize:12,fontWeight:600}}>({sel.shotsAtReturn > sel.shotsBefore ? "+" : ""}{(sel.shotsAtReturn - sel.shotsBefore).toLocaleString()})</span></div>
                    </div>
                    <div style={{background:"#f9fafb",borderRadius:10,padding:"10px 14px",border:"1px solid #e5e7eb"}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:".06em"}}>Life Used</div>
                      <div style={{fontSize:16,fontWeight:800,color:"#111827",marginTop:4}}>{((sel.shotsAtReturn/sel.maxShots)*100).toFixed(1)}%</div>
                      <div className="shotbar"><div className="shotfill" style={{width:`${(sel.shotsAtReturn/sel.maxShots)*100}%`,background:(sel.shotsAtReturn/sel.maxShots)>.9?"#dc2626":"#0891b2"}}/></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photos from device */}
              <div className="card">
                <div className="shdr"><div className="shdr-ico" style={{background:"#fffbeb"}}>📸</div><div className="shdr-t">Photos (Captured on Device)</div><span className="shdr-b">{sel.photos.length} Photo{sel.photos.length!==1?"s":""}</span></div>
                <div className="pgrid">
                  {sel.photos.map((p,i) => (
                    <div key={i} className="pcard">
                      <div className="pthumb">
                        <div className="pthumb-ico">📷</div>
                        <div className="pthumb-lbl">{p.label}</div>
                      </div>
                      <div className="pinfo">
                        <div className="plbl">{p.label}</div>
                        <div className="pmeta">⏱ {p.time} · 📱 {p.device} · {p.size}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inspection */}
              <div className="card">
                <div className="shdr"><div className="shdr-ico" style={{background:"#f5f3ff"}}>🔍</div><div className="shdr-t">Quick Inspection (Done on Device)</div>
                  <span className="shdr-b" style={{background:sel.inspPassed===sel.inspTotal?"#f0fdf4":"#fffbeb",color:sel.inspPassed===sel.inspTotal?"#059669":"#d97706",borderColor:sel.inspPassed===sel.inspTotal?"#6ee7b7":"#fcd34d"}}>
                    {sel.inspPassed}/{sel.inspTotal} OK
                  </span>
                </div>
                <div style={{padding:"8px 22px"}}>
                  {(sel.inspItems || []).map((it, i) => (
                    <div key={i} className="irow">
                      <div className={`iico ${it.pass?"iok":"ino"}`}>{it.pass?"✓":"✕"}</div>
                      <span className="itsk">{it.task}</span>
                      {it.remark && it.remark !== "OK" && <span style={{fontSize:11,color:"#d97706",fontStyle:"italic"}}>{it.remark}</span>}
                    </div>
                  ))}
                </div>
                {sel.inspNotes && sel.inspNotes !== "All OK" && (
                  <div style={{padding:"0 22px 14px"}}><div style={{fontSize:12,color:"#374151",background:"#fffbeb",padding:"8px 12px",borderRadius:8,border:"1px solid #fde68a"}}>📝 {sel.inspNotes}</div></div>
                )}
              </div>

              {/* Remarks */}
              {sel.remarks && (
                <div className="card">
                  <div className="shdr"><div className="shdr-ico" style={{background:"#f9fafb"}}>💬</div><div className="shdr-t">Operator Remarks</div></div>
                  <div style={{padding:"14px 22px",fontSize:13,color:"#374151"}}>{sel.remarks}</div>
                </div>
              )}

              {/* Sync info */}
              <div style={{textAlign:"center",padding:"8px 0 20px",fontSize:12,color:"#9ca3af"}}>
                📡 Synced at {sel.syncedAt} · Mould automatically added to {sel.plant} inventory at {sel.plantLocation}
              </div>
            </>)}

          </div>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}