'use client';
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

// ══════════════════════════════════════════════════════════════
//  MOULD MAINTENANCE MODULE
// ══════════════════════════════════════════════════════════════

const MAINTENANCE_TYPES = [
  { key:"preventive",  label:"Preventive Maintenance",  icon:"🛡", color:"#4f46e5", bg:"#eef2ff" },
  { key:"corrective",  label:"Corrective Maintenance",  icon:"🔧", color:"#dc2626", bg:"#fef2f2" },
  { key:"predictive",  label:"Predictive Maintenance",  icon:"📊", color:"#0891b2", bg:"#e0f2fe" },
  { key:"breakdown",   label:"Breakdown Maintenance",   icon:"⚠️", color:"#d97706", bg:"#fffbeb" },
  { key:"overhaul",    label:"Major Overhaul",           icon:"🏗", color:"#7c3aed", bg:"#f5f3ff" },
  { key:"modification",label:"Modification / ECN",       icon:"✏️", color:"#059669", bg:"#f0fdf4" },
];

const PRIORITY_LEVELS = [
  { key:"critical", label:"Critical",  color:"#dc2626", bg:"#fef2f2", border:"#fca5a5" },
  { key:"high",     label:"High",      color:"#d97706", bg:"#fffbeb", border:"#fcd34d" },
  { key:"medium",   label:"Medium",    color:"#0891b2", bg:"#e0f2fe", border:"#7dd3fc" },
  { key:"low",      label:"Low",       color:"#059669", bg:"#f0fdf4", border:"#6ee7b7" },
];

const ISSUE_CATEGORIES = [
  "Cavity Damage / Crack", "Core Pin Breakage", "Ejector Pin Issue", "Cooling Channel Blockage",
  "Hot Runner Failure", "Parting Line Mismatch", "Flash Issue", "Surface Finish Degradation",
  "Slide / Lifter Malfunction", "Sprue Bush Wear", "Guide Pin / Bush Wear", "Waterline Leakage",
  "Venting Issue", "Gate Insert Wear", "Hydraulic Cylinder Failure", "Rust / Corrosion", "Other"
];

const CHECKLIST_PREVENTIVE = [
  { id:"CK01", task:"Visual inspection of mould surface & parting line", category:"Inspection" },
  { id:"CK02", task:"Check & clean ejector pins and plates", category:"Cleaning" },
  { id:"CK03", task:"Inspect guide pins, guide bushes & alignment", category:"Inspection" },
  { id:"CK04", task:"Clean & flush cooling channels", category:"Cleaning" },
  { id:"CK05", task:"Inspect hot runner system / heaters / thermocouples", category:"Inspection" },
  { id:"CK06", task:"Lubricate slides, lifters & moving components", category:"Lubrication" },
  { id:"CK07", task:"Check hydraulic cylinders & seals", category:"Inspection" },
  { id:"CK08", task:"Inspect venting channels & clean if needed", category:"Cleaning" },
  { id:"CK09", task:"Verify shut-off surfaces & contact", category:"Inspection" },
  { id:"CK10", task:"Check sprue bush, nozzle seat & gate inserts", category:"Inspection" },
  { id:"CK11", task:"Anti-rust treatment / preservative coating", category:"Treatment" },
  { id:"CK12", task:"Verify mould dimensions & tolerances (CMM)", category:"Measurement" },
  { id:"CK13", task:"Capture shot count reading from machine", category:"Recording" },
  { id:"CK14", task:"Update maintenance log & mould history card", category:"Documentation" },
];

const SPARE_PARTS = [
  { code:"SP-001", name:"Ejector Pin (D=6mm)", category:"Ejector System", uom:"Nos", unitCost:450 },
  { code:"SP-002", name:"Guide Bush (D=25mm)", category:"Guide System", uom:"Nos", unitCost:1200 },
  { code:"SP-003", name:"Guide Pin (D=25mm)", category:"Guide System", uom:"Nos", unitCost:1800 },
  { code:"SP-004", name:"O-Ring Seal Kit", category:"Sealing", uom:"Set", unitCost:350 },
  { code:"SP-005", name:"Heater Band 220V", category:"Hot Runner", uom:"Nos", unitCost:2200 },
  { code:"SP-006", name:"Thermocouple J-Type", category:"Hot Runner", uom:"Nos", unitCost:800 },
  { code:"SP-007", name:"Sprue Bush (D=16mm)", category:"Gate System", uom:"Nos", unitCost:3500 },
  { code:"SP-008", name:"Cooling Plug Seal", category:"Cooling", uom:"Nos", unitCost:150 },
  { code:"SP-009", name:"Slide Wear Plate", category:"Slide System", uom:"Nos", unitCost:2800 },
  { code:"SP-010", name:"Hydraulic Cylinder Seal Kit", category:"Hydraulic", uom:"Set", unitCost:4500 },
];

const NAV_ITEMS = [
  { label: "Dashboard", icon: "📊", route: "/dashboard" },
  { label: "User Management", icon: "👥", route: "/user-management" },
  { label: "Masters", icon: "🗂", route: "/masters" },
  { label: "Mould Registry", icon: "🔩", route: "/mould-registry" },
  { label: "Transfers & Challan", icon: "🔄", route: "/challan" },
  { label: "Mould Return", icon: "📥", route: "/return" },
  { label: "Depreciation", icon: "📉", route: "/depreciation" },
  { label: "Maintenance", icon: "🔧", route: "/maintenance", active: true },
  { label: "Scrap / Dispose", icon: "🗑", route: "/scrap" },
  { label: "Reports", icon: "📈", route: "/reports" },
];

// ── STYLES ──────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#f0f2f5;min-height:100vh;color:#111827}

.shell{display:flex;height:100vh;overflow:hidden}

/* ── SIDEBAR ── */
.sidebar{width:220px;flex-shrink:0;background:linear-gradient(170deg,#3b3fe8 0%,#5b2be0 45%,#7c2fe8 100%);display:flex;flex-direction:column;position:relative;overflow:hidden}
.sidebar::after{content:'';position:absolute;bottom:-60px;left:-60px;width:240px;height:240px;border-radius:50%;background:rgba(255,255,255,0.05);pointer-events:none}
.sb-brand{padding:20px 16px 14px;border-bottom:1px solid rgba(255,255,255,0.1);z-index:1;position:relative}
.sb-logo-row{display:flex;align-items:center;padding:0 4px}
.sb-icon{width:36px;height:36px;background:rgba(255,255,255,0.18);border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sb-name{font-size:14px;font-weight:700;color:#fff}.sb-name span{font-weight:400;opacity:.8}
.sb-sub{font-size:10px;color:rgba(255,255,255,.5);margin-top:1px}
.sb-nav{flex:1;padding:14px 12px;display:flex;flex-direction:column;gap:4px;overflow-y:auto}
.sb-section{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.35);padding:10px 12px 4px;margin-top:6px}
.sb-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;cursor:pointer;color:rgba(255,255,255,.65);font-size:13px;font-weight:500;transition:background .15s}
.sb-item:hover{background:rgba(255,255,255,.1);color:#fff}
.sb-item.active{background:rgba(255,255,255,.18);color:#fff;font-weight:600}
.sb-footer{padding:16px 14px;border-top:1px solid rgba(255,255,255,.1)}
.sb-user-row{display:flex;align-items:center;gap:8px}
.sb-avatar{width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0}
.sb-uname{font-size:12px;font-weight:600;color:#fff}
.sb-urole{font-size:10px;color:rgba(255,255,255,.5)}

/* ── MAIN ── */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.topbar{height:58px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;padding:0 28px;flex-shrink:0;box-shadow:0 1px 4px rgba(0,0,0,.05)}
.topbar-left{display:flex;align-items:center;gap:8px}
.topbar-breadcrumb{font-size:12px;color:#9ca3af;display:flex;align-items:center;gap:4px}
.topbar-title{font-size:17px;font-weight:800;color:#111827;letter-spacing:-.02em}
.topbar-right{display:flex;align-items:center;gap:12px}
.notif-btn{width:36px;height:36px;border-radius:9px;border:1.5px solid #e5e7eb;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#6b7280;position:relative}
.notif-dot{width:7px;height:7px;background:#ef4444;border-radius:50%;position:absolute;top:6px;right:6px;border:1.5px solid #fff}
.tb-user-pill{display:flex;align-items:center;gap:8px;background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:10px;padding:5px 12px 5px 6px;cursor:pointer}
.tb-avatar{width:26px;height:26px;border-radius:50%;background:#4f46e5;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff}
.tb-uname{font-size:12px;font-weight:600;color:#374151}

.content{flex:1;overflow-y:auto;padding:24px 28px}

/* ── KPI STRIP ── */
.kpi-strip{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:20px}
.kpi-card{background:#fff;border-radius:14px;padding:16px 18px;border:1px solid #e5e7eb;box-shadow:0 1px 4px rgba(0,0,0,.04);position:relative;overflow:hidden;transition:transform .15s,box-shadow .15s}
.kpi-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.08)}
.kpi-card.featured{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);border-color:transparent}
.kpi-card.featured::after{content:'';position:absolute;top:-30px;right:-30px;width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,.08)}
.kpi-label{font-size:10.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#6b7280}
.kpi-label.white{color:rgba(255,255,255,.75)}
.kpi-value{font-size:26px;font-weight:800;color:#111827;letter-spacing:-.03em;line-height:1;margin-top:8px}
.kpi-value.white{color:#fff}
.kpi-sub{font-size:11px;color:#9ca3af;margin-top:4px}
.kpi-sub.white{color:rgba(255,255,255,.6)}

/* ── TABS ── */
.tab-strip{display:flex;gap:6px;margin-bottom:20px;border-bottom:2px solid #e5e7eb;padding-bottom:0}
.tab-btn{padding:10px 18px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;border:none;background:none;color:#6b7280;border-bottom:2.5px solid transparent;margin-bottom:-2px;transition:all .15s}
.tab-btn:hover{color:#4f46e5}
.tab-btn.active{color:#4f46e5;border-bottom-color:#4f46e5}

/* ── TABLE ── */
.tbl{width:100%;border-collapse:separate;border-spacing:0}
.tbl th{font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;padding:10px 14px;text-align:left;border-bottom:2px solid #e8edff;background:#fafbff}
.tbl td{font-size:13px;padding:12px 14px;border-bottom:1px solid #f3f4f6;color:#374151}
.tbl tr:hover td{background:#f9fafb}
.tbl-link{color:#4f46e5;font-weight:600;cursor:pointer;text-decoration:none}
.tbl-link:hover{text-decoration:underline}

/* ── BADGES ── */
.badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;white-space:nowrap}
.badge-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}

/* ── CARD ── */
.card{background:#fff;border-radius:16px;border:1px solid #e5e7eb;box-shadow:0 1px 6px rgba(0,0,0,.05);overflow:hidden;margin-bottom:18px}
.sec-hdr{display:flex;align-items:center;gap:12px;padding:14px 22px;background:linear-gradient(90deg,#f8faff 0%,#fff 100%);border-bottom:2px solid #e8edff;position:relative}
.sec-hdr::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,#4f46e5,#7c3aed);border-radius:0 2px 2px 0}
.sec-hdr-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
.sec-hdr-title{font-size:13px;font-weight:800;color:#1e1b4b;letter-spacing:.06em;text-transform:uppercase}
.sec-hdr-badge{font-size:10.5px;font-weight:600;background:#eef2ff;color:#4338ca;padding:2px 8px;border-radius:20px;border:1px solid #c7d2fe;margin-left:auto}

/* ── FORM ── */
.form-grid{padding:20px 22px;display:grid;gap:18px 24px}
.cols-2{grid-template-columns:1fr 1fr}
.cols-3{grid-template-columns:1fr 1fr 1fr}
.cols-4{grid-template-columns:1fr 1fr 1fr 1fr}

.field{display:flex;flex-direction:column;gap:5px}
.field-label{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;display:flex;align-items:center;gap:3px}
.req{color:#ef4444;font-size:11px}
.field-input,.field-select{height:42px;border:1.5px solid #e5e7eb;border-radius:10px;padding:0 13px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;color:#111827;background:#fafafa;outline:none;width:100%;transition:border-color .2s,box-shadow .2s,background .2s}
.field-input:focus,.field-select:focus{border-color:#5b2be0;background:#fff;box-shadow:0 0 0 3px rgba(91,43,224,.08)}
.field-input::placeholder{color:#b0bec5;font-size:13px}
.field-input.readonly{background:#f9fafb;color:#6b7280;cursor:not-allowed}
.field-input.auto-fill{background:#f0fdf4;border-color:#bbf7d0;color:#15803d;font-style:italic}
.field-select{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:34px}
.field-textarea{border:1.5px solid #e5e7eb;border-radius:10px;padding:10px 13px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;color:#111827;background:#fafafa;outline:none;width:100%;resize:vertical;min-height:60px;transition:border-color .2s,box-shadow .2s}
.field-textarea:focus{border-color:#5b2be0;background:#fff;box-shadow:0 0 0 3px rgba(91,43,224,.08)}
.field-textarea::placeholder{color:#b0bec5;font-size:13px}
.field-hint{font-size:10.5px;color:#9ca3af;margin-top:1px}
.field-err{font-size:10.5px;color:#ef4444;margin-top:1px}
.field-input.err,.field-select.err{border-color:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.07)}
.num-wrap{position:relative}
.num-wrap .field-input{padding-right:50px}
.num-tag{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:10.5px;font-weight:700;color:#9ca3af;background:#f3f4f6;padding:2px 6px;border-radius:4px;pointer-events:none}

/* ── BUTTONS ── */
.btn{display:inline-flex;align-items:center;gap:7px;height:40px;padding:0 20px;border-radius:10px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;font-weight:600;cursor:pointer;transition:all .15s;border:none}
.btn-primary{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;box-shadow:0 4px 14px rgba(91,43,224,.28)}
.btn-primary:hover{opacity:.9;transform:translateY(-1px)}
.btn-success{background:linear-gradient(135deg,#10b981,#059669);color:#fff;box-shadow:0 4px 14px rgba(16,185,129,.28)}
.btn-success:hover{opacity:.9;transform:translateY(-1px)}
.btn-danger{background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;box-shadow:0 4px 14px rgba(239,68,68,.25)}
.btn-danger:hover{opacity:.9;transform:translateY(-1px)}
.btn-outline{background:#fff;color:#374151;border:1.5px solid #e5e7eb}
.btn-outline:hover{border-color:#5b2be0;color:#5b2be0}
.btn-ghost{background:transparent;color:#6b7280;border:1.5px solid transparent}
.btn-ghost:hover{background:#f3f4f6;color:#374151}
.btn-sm{height:34px;padding:0 14px;font-size:12px;border-radius:8px}
.btn-xs{height:28px;padding:0 10px;font-size:11px;border-radius:6px}

/* ── CHECKLIST ── */
.checklist-item{display:flex;align-items:flex-start;gap:10px;padding:10px 14px;border-radius:10px;transition:background .1s}
.checklist-item:hover{background:#f9fafb}
.ck-check{width:22px;height:22px;border:2px solid #d1d5db;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .15s;margin-top:1px}
.ck-check.done{background:#4f46e5;border-color:#4f46e5}
.ck-task{font-size:13px;color:#374151;flex:1}
.ck-task.done{text-decoration:line-through;color:#9ca3af}
.ck-cat{font-size:10px;font-weight:600;padding:2px 8px;border-radius:10px;background:#f3f4f6;color:#6b7280;white-space:nowrap}
.ck-remark{height:30px;border:1px solid #e5e7eb;border-radius:6px;padding:0 8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:11.5px;color:#374151;background:#fafafa;outline:none;width:120px}
.ck-remark:focus{border-color:#5b2be0}

/* ── SPARE TABLE ── */
.spare-row{display:grid;grid-template-columns:2fr 3fr 1fr 1fr 1fr 40px;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid #f3f4f6}
.spare-row:last-child{border-bottom:none}

/* ── TIMELINE ── */
.tl-item{display:flex;gap:14px;position:relative;padding-bottom:18px}
.tl-item::before{content:'';position:absolute;left:13px;top:26px;bottom:0;width:2px;background:#e5e7eb}
.tl-item:last-child::before{display:none}
.tl-dot{width:28px;height:28px;border-radius:50%;background:#eef2ff;border:2px solid #c7d2fe;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;z-index:1}
.tl-body{flex:1}
.tl-event{font-size:13px;font-weight:700;color:#111827}
.tl-meta{font-size:11px;color:#6b7280;margin-top:2px}
.tl-note{font-size:12px;color:#4b5563;margin-top:3px;background:#f9fafb;padding:6px 10px;border-radius:8px;border-left:3px solid #c7d2fe}

/* ── SEARCH & FILTER BAR ── */
.filter-bar{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap}
.search-box{display:flex;align-items:center;gap:8px;height:40px;border:1.5px solid #e5e7eb;border-radius:10px;padding:0 14px;background:#fff;flex:1;min-width:200px;max-width:360px}
.search-box input{border:none;outline:none;background:none;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#111827;width:100%}
.search-box input::placeholder{color:#9ca3af}
.filter-pill{display:flex;align-items:center;gap:5px;height:36px;padding:0 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;color:#374151;transition:all .15s;font-family:'Plus Jakarta Sans',sans-serif}
.filter-pill:hover,.filter-pill.active{border-color:#4f46e5;color:#4f46e5;background:#eef2ff}

/* ── FORM FOOTER ── */
.form-footer{background:#fff;border-top:1px solid #e5e7eb;padding:16px 28px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;box-shadow:0 -2px 8px rgba(0,0,0,.04)}
.footer-hint{font-size:12px;color:#9ca3af;display:flex;align-items:center;gap:6px}
.footer-actions{display:flex;gap:10px}

/* ── TOAST ── */
.toast{position:fixed;bottom:24px;right:24px;background:#111827;color:#fff;padding:13px 20px;border-radius:12px;font-size:13.5px;font-weight:500;z-index:2000;display:flex;align-items:center;gap:10px;box-shadow:0 8px 30px rgba(0,0,0,.25);animation:toastIn .3s ease;border-left:4px solid #10b981}
@keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

/* ── PAGE HEADER ── */
.page-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.page-hdr-title{font-size:20px;font-weight:800;color:#111827;letter-spacing:-.025em}
.page-hdr-sub{font-size:13px;color:#6b7280;margin-top:3px}
.page-hdr-right{display:flex;gap:10px}

/* ── DETAIL PANEL ── */
.detail-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;padding:16px 22px}
.detail-item{display:flex;flex-direction:column;gap:2px}
.detail-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af}
.detail-value{font-size:13.5px;font-weight:600;color:#111827}

/* ── COST SUMMARY ── */
.cost-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f3f4f6}
.cost-row:last-child{border-bottom:none;font-weight:700}
.cost-label{font-size:13px;color:#374151}
.cost-value{font-size:13px;font-weight:600;color:#111827}

/* ── IMAGE UPLOAD OVERRIDES ── */
.img-upload-zone{border:1.5px dashed #d1d5db;border-radius:10px;padding:8px 12px;display:flex;align-items:center;gap:10px;background:#fafafa;transition:border-color .15s;cursor:pointer}
.img-upload-zone:hover{border-color:#4f46e5;background:#f5f3ff}
.img-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}
.img-thumb{position:relative;border-radius:8px;overflow:hidden;aspect-ratio:1;background:#f3f4f6;border:1.5px solid #e5e7eb}
.img-thumb img{width:100%;height:100%;object-fit:cover}
.img-rm{position:absolute;top:4px;right:4px;width:18px;height:18px;border-radius:4px;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;font-size:10px}
.img-thumb-label{position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.6);color:#fff;font-size:9px;padding:3px 5px}

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

// ── HELPERS ─────────────────────────────────────────────────
function priorityBadge(p) {
  const pl = PRIORITY_LEVELS.find(x => x.key === p);
  if (!pl) return null;
  return <span className="badge" style={{ background:pl.bg, color:pl.color, border:`1px solid ${pl.border}` }}><span className="badge-dot" style={{ background:pl.color }}/>{pl.label}</span>;
}

function statusBadge(s) {
  const map = {
    "Scheduled":    { bg:"#e0f2fe", color:"#0891b2", border:"#7dd3fc" },
    "In Progress":  { bg:"#fffbeb", color:"#d97706", border:"#fcd34d" },
    "Completed":    { bg:"#f0fdf4", color:"#059669", border:"#6ee7b7" },
    "Pending Approval":{ bg:"#fef2f2", color:"#dc2626", border:"#fca5a5" },
    "Cancelled":    { bg:"#f3f4f6", color:"#6b7280", border:"#d1d5db" },
  };
  const m = map[s] || map["Scheduled"];
  return <span className="badge" style={{ background:m.bg, color:m.color, border:`1px solid ${m.border}` }}><span className="badge-dot" style={{ background:m.color }}/>{s}</span>;
}

function typeBadge(t) {
  const mt = MAINTENANCE_TYPES.find(x => x.key === t);
  if (!mt) return null;
  return <span className="badge" style={{ background:mt.bg, color:mt.color, border:`1px solid transparent` }}>{mt.icon} {mt.label}</span>;
}

function initials(name) { return name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) : "U"; }

// ── IMAGE COMPONENT ─────────────────────────────────────────
function ImageUpload({ images, onChange, label, color }) {
  const inputRef = useRef(null);
  
  const handleFiles = useCallback((files) => {
    const arr = [...files].filter(f => f.type.startsWith("image/"));
    const newImgs = arr.map(file => ({
        file: file,
        url: URL.createObjectURL(file),
        name: file.name
    }));
    onChange([...images, ...newImgs]);
  }, [images, onChange]);

  return (
    <div>
      <div className="img-upload-zone" onClick={() => inputRef.current?.click()}>
        <button type="button" className="btn btn-sm" style={{ background: color, color: "#fff", pointerEvents: "none" }}>
          ⬆ {label}
        </button>
        <span style={{ fontSize: 11, color: "#9ca3af" }}>JPG, PNG · Max 5MB each</span>
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
      </div>
      
      {images.length > 0 && (
        <div className="img-grid">
          {images.map((img, i) => (
            <div key={i} className="img-thumb">
              <img src={img.url} alt={img.name} />
              <div className="img-rm" onClick={(e) => { e.stopPropagation(); onChange(images.filter((_, j) => j !== i)); }}>✕</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  COMPONENT
// ══════════════════════════════════════════════════════════════
export default function MouldMaintenance() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [view, setView] = useState("list"); // list | create | detail
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  
  const [user, setUser] = useState({ name: "User", role: "Viewer" });
  const [roles, setRoles] = useState([]);

  const [dbMoulds, setDbMoulds] = useState([]);
  const [dbVendors, setDbVendors] = useState([]);
  const [dbTechnicians, setDbTechnicians] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
    
    // Fetch Roles for RBAC validation
    fetch('/api/roles').then(r=>r.json()).then(setRoles).catch(console.error);

    // Fetch maintenance records
    fetch('/api/maintenance?_t=' + Date.now(), { cache: 'no-store' })
      .then(res => res.ok ? res.json() : [])
      .then(setRecords)
      .catch(console.error);

    // Fetch required master data.
    Promise.all([
      fetch('/api/moulds?_t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
      fetch('/api/masters?type=maint_vendors&_t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
      fetch('/api/masters?type=technicians&_t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : [])
    ]).then(([moulds, vendors, techs]) => {
      setDbMoulds(Array.isArray(moulds) ? moulds.map(m => ({ id: m.mouldIdAssetCode || m.mould_id_code, name: m.mouldName || m.mould_name, type: m.assetClassName || m.asset_class_name, plant: m.plant, location: m.locationName || m.location_name, shots: m.current_shots || 0, maxShots: m.guaranteed_shots || 0 })) : []);
      
      setDbVendors(Array.isArray(vendors) && !vendors.error ? vendors.map(v => ({ code: v.code, name: v.name, city: v.city || v.location, status: v.status })) : []);
      
      setDbTechnicians(Array.isArray(techs) && !techs.error ? techs.map(t => ({ code: t.code, name: t.name, speciality: t.speciality, status: t.status })) : []);
    }).catch(console.error);

  }, [router]);

  const userInitials = initials(user.name);

  // ── Role Privileges ──
  const activeRole = roles.find(r => r.name === user.role);
  const privs = activeRole ? activeRole.privs : null;
  const canEdit = user.role === 'Admin' || privs?.maint === true;

  // ── Create form state ──
  const emptyForm = {
    mouldId:"", maintenanceType:"", priority:"medium",
    issueCategory:"", issueDescription:"",
    reportedBy:"", reportedDate:"",
    scheduledStart:"", scheduledEnd:"",
    assignedTechnician:"", assignedVendor:"",
    maintenanceLocation:"in_house",
    estimatedCost:"",
    remarks:"",
    checklistItems: CHECKLIST_PREVENTIVE.map(c => ({ ...c, done:false, remark:"" })),
    sparesUsed:[],
    beforeImages:[], afterImages:[],
    rootCause:"", correctiveAction:"", preventiveAction:"",
  };
  const [form, setForm] = useState({ ...emptyForm });

  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const selectedMould = dbMoulds.find(m => m.id === form.mouldId);

  // ── Filters ──
  const filtered = records.filter(r => {
    if (activeTab !== "all" && r.maintenanceType !== activeTab) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      return r.id.toLowerCase().includes(s) || r.mouldId.toLowerCase().includes(s) || r.mouldName.toLowerCase().includes(s);
    }
    return true;
  });

  // ── KPIs ──
  const kpis = {
    total: records.length,
    inProgress: records.filter(r => r.status === "In Progress").length,
    scheduled: records.filter(r => r.status === "Scheduled").length,
    completed: records.filter(r => r.status === "Completed").length,
    totalCost: records.reduce((s,r) => s + (Number(r.actualCost) || Number(r.estimatedCost) || 0), 0),
  };

  // ── Validate ──
  const validate = () => {
    const e = {};
    if (!form.mouldId) e.mouldId = "Required";
    if (!form.maintenanceType) e.maintenanceType = "Required";
    if (!form.issueDescription && form.maintenanceType !== "preventive") e.issueDescription = "Required";
    if (!form.scheduledStart) e.scheduledStart = "Required";
    if (!form.assignedTechnician) e.assignedTechnician = "Required";
    return e;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});

    const mould = dbMoulds.find(m => m.id === form.mouldId);
    const tech = dbTechnicians.find(t => t.code === form.assignedTechnician);
    
    // Auto-generate ID
    const randomSuffix = String(Math.floor(Math.random() * 9000) + 1000);
    const maintId = `MNT-2026-${randomSuffix}`;
    const woId = `WO-2026-${randomSuffix}`;

    const formData = new FormData();
    formData.append('id', maintId);
    formData.append('workOrderNo', woId);
    formData.append('mouldId', form.mouldId);
    formData.append('mouldName', mould?.name || "");
    formData.append('mouldType', mould?.type || "");
    formData.append('plant', mould?.plant || "");
    formData.append('maintenanceType', form.maintenanceType);
    formData.append('priority', form.priority);
    formData.append('issueCategory', form.issueCategory);
    formData.append('issueDescription', form.issueDescription || "Scheduled preventive maintenance");
    formData.append('reportedBy', form.reportedBy || user.name);
    formData.append('reportedDate', form.reportedDate || new Date().toISOString().slice(0,10));
    formData.append('scheduledStart', form.scheduledStart);
    if(form.scheduledEnd) formData.append('scheduledEnd', form.scheduledEnd);
    formData.append('assignedTechnician', form.assignedTechnician);
    if(form.assignedVendor) formData.append('assignedVendor', form.assignedVendor);
    formData.append('maintenanceLocation', form.maintenanceLocation);
    formData.append('shotCountAtMaint', mould?.shots || 0);
    formData.append('estimatedCost', parseFloat(form.estimatedCost) || 0);
    formData.append('status', "Scheduled");
    if(form.remarks) formData.append('remarks', form.remarks);
    if(form.rootCause) formData.append('rootCause', form.rootCause);
    if(form.correctiveAction) formData.append('correctiveAction', form.correctiveAction);
    if(form.preventiveAction) formData.append('preventiveAction', form.preventiveAction);

    formData.append('maker', JSON.stringify({ name: user.name }));
    formData.append('sparesUsed', JSON.stringify(form.sparesUsed));
    formData.append('checklistItems', JSON.stringify(form.maintenanceType === "preventive" ? form.checklistItems : []));
    
    form.beforeImages.forEach(img => { if (img.file) formData.append('beforeImages', img.file); });
    form.afterImages.forEach(img => { if (img.file) formData.append('afterImages', img.file); });

    const tl = [
      { event:"Maintenance Request Created", by: user.name, at: new Date().toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}), note:`${MAINTENANCE_TYPES.find(t=>t.key===form.maintenanceType)?.label} scheduled` },
      { event:"Work Order Generated", by:"System", at: new Date().toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}), note:`${woId} created` },
      { event:"Technician Assigned", by: user.name, at: new Date().toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}), note:`Assigned to ${tech?.name || ""}` },
    ];
    formData.append('timeline', JSON.stringify(tl));

    try {
        const res = await fetch("/api/maintenance", {
            method: "POST",
            body: formData
        });
        
        if (res.ok) {
            // Re-fetch from DB to grab the actual URLs that were generated by the server
            fetch('/api/maintenance?_t=' + Date.now(), { cache: 'no-store' })
                .then(r => r.ok ? r.json() : []).then(setRecords).catch(console.error);
            
            setForm({ ...emptyForm });
            setView("list");
            showToast(`✅ Maintenance ${maintId} created with ${woId}`);
        } else {
            const data = await res.json();
            showToast(`❌ Failed to create: ${data.error}`);
        }
    } catch (err) {
        showToast(`❌ System error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
      try {
          const res = await fetch(`/api/maintenance?id=${id}`, { method: 'DELETE' });
          if (res.ok) {
              setRecords(prev => prev.filter(r => r.id !== id));
              setView("list");
              showToast(`🗑️ Record ${id} deleted successfully`);
          }
      } catch (err) {
          showToast(`❌ Error deleting record`);
      }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem("user");
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // ── Add spare part row ──
  const addSpare = () => {
    set("sparesUsed", [...form.sparesUsed, { code:"", name:"", qty:1, unitCost:0, total:0 }]);
  };
  const updateSpare = (idx, field, val) => {
    const arr = [...form.sparesUsed];
    arr[idx] = { ...arr[idx], [field]:val };
    if (field === "code") {
      const sp = SPARE_PARTS.find(s => s.code === val);
      if (sp) { arr[idx].name = sp.name; arr[idx].unitCost = sp.unitCost; arr[idx].total = sp.unitCost * arr[idx].qty; }
    }
    if (field === "qty") { arr[idx].total = arr[idx].unitCost * (parseInt(val)||0); }
    set("sparesUsed", arr);
  };
  const removeSpare = idx => { set("sparesUsed", form.sparesUsed.filter((_,i) => i !== idx)); };

  // ── Toggle checklist ──
  const toggleCheck = idx => {
    const items = [...form.checklistItems];
    items[idx] = { ...items[idx], done:!items[idx].done };
    set("checklistItems", items);
  };
  const setCheckRemark = (idx, v) => {
    const items = [...form.checklistItems];
    items[idx] = { ...items[idx], remark:v };
    set("checklistItems", items);
  };

  // ═══════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <>
      <style>{CSS}</style>
      <div className="shell">

        {/* ── SIDEBAR ── */}
        <div className="sidebar">
          <div className="sb-brand">
            <div className="sb-logo-row">
              <div className="sb-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".9" />
                  <rect x="12" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".6" />
                  <rect x="2" y="12" width="6" height="6" rx="1.5" fill="white" opacity=".6" />
                  <rect x="12" y="12" width="6" height="6" rx="1.5" fill="white" opacity=".9" />
                  <circle cx="10" cy="10" r="1.8" fill="white" />
                </svg>
              </div>
              <div><div className="sb-name">MouldSys <span>Enterprise</span></div><div className="sb-sub">Asset Management Platform</div></div>
            </div>
          </div>
          <div className="sb-nav">
            <div className="sb-section">Main</div>
            {NAV_ITEMS.map(n => (
              <div 
                key={n.label} 
                className={`sb-item${n.active?" active":""}`}
                onClick={() => router.push(n.route)}>
                <span>{n.icon}</span>{n.label}
              </div>
            ))}
          </div>
          <div className="sb-footer">
            <div className="sb-user-row">
              <div className="sb-avatar">{userInitials}</div>
              <div><div className="sb-uname">{user.name}</div><div className="sb-urole">{user.role}</div></div>
            </div>
          </div>
        </div>

        {/* ── MAIN ── */}
        <div className="main">

          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-left">
              <div className="topbar-breadcrumb">
                <span>Modules</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div className="topbar-title">Mould Maintenance</div>
            </div>
            <div className="topbar-right">
              <div className="notif-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2a5 5 0 00-5 5v2l-1 2h12l-1-2V7a5 5 0 00-5-5zM6.5 13.5a1.5 1.5 0 003 0" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round"/></svg>
                <div className="notif-dot"/>
              </div>
              <div className="tb-user-pill">
                <div className="tb-avatar">{userInitials}</div>
                <span className="tb-uname">{user.name}</span>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                Logout ➔
            </button>
            </div>
          </div>

          {/* Content area */}
          <div className="content">

            {/* ═══════════════════ LIST VIEW ═══════════════════ */}
            {view === "list" && (
              <>
                {/* Page header */}
                <div className="page-hdr">
                  <div>
                    <div className="page-hdr-title">Maintenance Management</div>
                    <div className="page-hdr-sub">Track, schedule and manage all mould maintenance activities</div>
                  </div>
                  <div className="page-hdr-right">
                    {canEdit && (
                        <button className="btn btn-primary" onClick={() => { setForm({...emptyForm}); setErrors({}); setView("create"); }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                        New Maintenance
                        </button>
                    )}
                  </div>
                </div>

                {/* KPI strip */}
                <div className="kpi-strip">
                  <div className="kpi-card featured">
                    <div className="kpi-label white">Total Records</div>
                    <div className="kpi-value white">{kpis.total}</div>
                    <div className="kpi-sub white">All maintenance records</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">In Progress</div>
                    <div className="kpi-value" style={{color:"#d97706"}}>{kpis.inProgress}</div>
                    <div className="kpi-sub">Active now</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">Scheduled</div>
                    <div className="kpi-value" style={{color:"#0891b2"}}>{kpis.scheduled}</div>
                    <div className="kpi-sub">Upcoming</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">Completed</div>
                    <div className="kpi-value" style={{color:"#059669"}}>{kpis.completed}</div>
                    <div className="kpi-sub">This period</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">Total Cost</div>
                    <div className="kpi-value">₹{(kpis.totalCost/1000).toFixed(1)}K</div>
                    <div className="kpi-sub">Estimated + Actual</div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="tab-strip">
                  <button className={`tab-btn${activeTab==="all"?" active":""}`} onClick={()=>setActiveTab("all")}>All</button>
                  {MAINTENANCE_TYPES.map(mt => (
                    <button key={mt.key} className={`tab-btn${activeTab===mt.key?" active":""}`} onClick={()=>setActiveTab(mt.key)}>
                      {mt.icon} {mt.label.split(" ")[0]}
                    </button>
                  ))}
                </div>

                {/* Filter bar */}
                <div className="filter-bar">
                  <div className="search-box">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#9ca3af" strokeWidth="1.5"/><path d="M10 10l3 3" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <input placeholder="Search by ID, Mould ID or Name…" value={search} onChange={e=>setSearch(e.target.value)}/>
                  </div>
                  {["all","Scheduled","In Progress","Completed","Pending Approval"].map(s => (
                    <button key={s} className={`filter-pill${filterStatus===s?" active":""}`} onClick={()=>setFilterStatus(s)}>
                      {s === "all" ? "All Status" : s}
                    </button>
                  ))}
                </div>

                {/* Table */}
                <div className="card" style={{overflow:"auto"}}>
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Maint. ID</th>
                        <th>Work Order</th>
                        <th>Mould</th>
                        <th>Type</th>
                        <th>Priority</th>
                        <th>Scheduled</th>
                        <th>Technician</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 && (
                        <tr><td colSpan={9} style={{textAlign:"center",color:"#9ca3af",padding:40}}>No maintenance records found</td></tr>
                      )}
                      {filtered.map(r => {
                        const tech = dbTechnicians.find(t => t.code === r.assignedTechnician);
                        return (
                          <tr key={r.id}>
                            <td><span className="tbl-link" onClick={()=>{setSelectedRecord(r);setView("detail")}}>{r.id}</span></td>
                            <td style={{fontWeight:600,color:"#374151"}}>{r.workOrderNo}</td>
                            <td>
                              <div style={{fontWeight:600}}>{r.mouldId}</div>
                              <div style={{fontSize:11,color:"#6b7280"}}>{r.mouldName}</div>
                            </td>
                            <td>{typeBadge(r.maintenanceType)}</td>
                            <td>{priorityBadge(r.priority)}</td>
                            <td style={{fontSize:12}}>{r.scheduledStart}</td>
                            <td>
                              {tech ? (
                                <div style={{display:"flex",alignItems:"center",gap:6}}>
                                  <div style={{width:24,height:24,borderRadius:"50%",background:"#4f46e5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff"}}>{initials(tech.name)}</div>
                                  <span style={{fontSize:12,fontWeight:500}}>{tech.name}</span>
                                </div>
                              ) : "—"}
                            </td>
                            <td>{statusBadge(r.status)}</td>
                            <td>
                              <button className="btn btn-outline btn-xs" onClick={()=>{setSelectedRecord(r);setView("detail")}}>
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ═══════════════════ CREATE VIEW ═══════════════════ */}
            {view === "create" && canEdit && (
              <>
                <div className="page-hdr">
                  <div>
                    <div className="page-hdr-title">Create Maintenance Request</div>
                    <div className="page-hdr-sub">Fill in details to schedule and track mould maintenance work</div>
                  </div>
                  <div className="page-hdr-right">
                    <button className="btn btn-ghost" onClick={()=>{setView("list");setForm({...emptyForm});setErrors({})}}>
                      ← Back to List
                    </button>
                  </div>
                </div>

                {/* SECTION 1: Mould Selection & Type */}
                <div className="card">
                  <div className="sec-hdr">
                    <div className="sec-hdr-icon" style={{background:"#eef2ff"}}>🔩</div>
                    <div className="sec-hdr-title">Mould Selection & Maintenance Type</div>
                    <span className="sec-hdr-badge">Required</span>
                  </div>
                  <div className="form-grid cols-3">
                    <div className="field">
                      <label className="field-label">Mould ID <span className="req">*</span></label>
                      <select className={`field-select${errors.mouldId?" err":""}`} value={form.mouldId} onChange={e=>set("mouldId",e.target.value)}>
                        <option value="">— Select Mould —</option>
                        {dbMoulds.map(m => <option key={m.id} value={m.id}>{m.id} – {m.name}</option>)}
                      </select>
                      {errors.mouldId && <div className="field-err">{errors.mouldId}</div>}
                    </div>
                    <div className="field">
                      <label className="field-label">Mould Name</label>
                      <input className={`field-input${selectedMould?" auto-fill":""}`} value={selectedMould?.name || ""} readOnly placeholder="Auto from mould selection"/>
                    </div>
                    <div className="field">
                      <label className="field-label">Mould Type</label>
                      <input className={`field-input${selectedMould?" auto-fill":""}`} value={selectedMould?.type || ""} readOnly placeholder="Auto from mould selection"/>
                    </div>
                    <div className="field">
                      <label className="field-label">Plant</label>
                      <input className={`field-input${selectedMould?" auto-fill":""}`} value={selectedMould?.plant || ""} readOnly placeholder="Auto from mould selection"/>
                    </div>
                    <div className="field">
                      <label className="field-label">Current Location</label>
                      <input className={`field-input${selectedMould?" auto-fill":""}`} value={selectedMould?.location || ""} readOnly placeholder="Auto from mould selection"/>
                    </div>
                    <div className="field">
                      <label className="field-label">Current Shot Count</label>
                      <input className={`field-input${selectedMould?" auto-fill":""}`} value={selectedMould ? `${(selectedMould.shots || 0).toLocaleString()} / ${(selectedMould.maxShots || 0).toLocaleString()}` : ""} readOnly placeholder="Auto"/>
                    </div>
                  </div>
                  <div style={{height:1,background:"#e8edff",margin:"0 22px"}}/>
                  <div className="form-grid cols-3">
                    <div className="field">
                      <label className="field-label">Maintenance Type <span className="req">*</span></label>
                      <select className={`field-select${errors.maintenanceType?" err":""}`} value={form.maintenanceType} onChange={e=>set("maintenanceType",e.target.value)}>
                        <option value="">— Select Type —</option>
                        {MAINTENANCE_TYPES.map(mt => <option key={mt.key} value={mt.key}>{mt.icon} {mt.label}</option>)}
                      </select>
                      {errors.maintenanceType && <div className="field-err">{errors.maintenanceType}</div>}
                    </div>
                    <div className="field">
                      <label className="field-label">Priority Level</label>
                      <select className="field-select" value={form.priority} onChange={e=>set("priority",e.target.value)}>
                        {PRIORITY_LEVELS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label">Issue Category</label>
                      <select className="field-select" value={form.issueCategory} onChange={e=>set("issueCategory",e.target.value)}>
                        <option value="">— Select —</option>
                        {ISSUE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-grid cols-3" style={{paddingTop:0}}>
                    <div className="field" style={{gridColumn:"1 / -1"}}>
                      <label className="field-label">Issue Description / Reason <span className="req">*</span></label>
                      <textarea className={`field-textarea${errors.issueDescription?" err":""}`} value={form.issueDescription} onChange={e=>set("issueDescription",e.target.value)} placeholder="Describe the issue, symptoms, or reason for maintenance..." rows={3}/>
                      {errors.issueDescription && <div className="field-err">{errors.issueDescription}</div>}
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Scheduling & Assignment */}
                <div className="card">
                  <div className="sec-hdr">
                    <div className="sec-hdr-icon" style={{background:"#fff7ed"}}>📅</div>
                    <div className="sec-hdr-title">Scheduling & Assignment</div>
                    <span className="sec-hdr-badge" style={{background:"#fff7ed",color:"#c2410c",borderColor:"#fed7aa"}}>Planning</span>
                  </div>
                  <div className="form-grid cols-3">
                    <div className="field">
                      <label className="field-label">Reported By</label>
                      <input className="field-input" value={form.reportedBy} onChange={e=>set("reportedBy",e.target.value)} placeholder="Name of reporter"/>
                    </div>
                    <div className="field">
                      <label className="field-label">Reported Date</label>
                      <input type="date" className="field-input" value={form.reportedDate} onChange={e=>set("reportedDate",e.target.value)}/>
                    </div>
                    <div className="field">
                      <label className="field-label">Maintenance Location</label>
                      <select className="field-select" value={form.maintenanceLocation} onChange={e=>set("maintenanceLocation",e.target.value)}>
                        <option value="in_house">In-House (Own Facility)</option>
                        <option value="vendor">Vendor / External</option>
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label">Scheduled Start <span className="req">*</span></label>
                      <input type="date" className={`field-input${errors.scheduledStart?" err":""}`} value={form.scheduledStart} onChange={e=>set("scheduledStart",e.target.value)}/>
                      {errors.scheduledStart && <div className="field-err">{errors.scheduledStart}</div>}
                    </div>
                    <div className="field">
                      <label className="field-label">Scheduled End</label>
                      <input type="date" className="field-input" value={form.scheduledEnd} onChange={e=>set("scheduledEnd",e.target.value)}/>
                    </div>
                    <div className="field">
                      <label className="field-label">Estimated Cost (₹)</label>
                      <div className="num-wrap">
                        <input type="number" className="field-input" value={form.estimatedCost} onChange={e=>set("estimatedCost",e.target.value)} placeholder="0.00"/>
                        <span className="num-tag">₹</span>
                      </div>
                    </div>
                    <div className="field">
                      <label className="field-label">Assigned Technician <span className="req">*</span></label>
                      <select className={`field-select${errors.assignedTechnician?" err":""}`} value={form.assignedTechnician} onChange={e=>set("assignedTechnician",e.target.value)}>
                        <option value="">— Select Technician —</option>
                        {dbTechnicians.filter(t => t.status !== 'Inactive').map(t => <option key={t.code} value={t.code}>{t.name} ({t.speciality})</option>)}
                      </select>
                      {errors.assignedTechnician && <div className="field-err">{errors.assignedTechnician}</div>}
                    </div>
                    <div className="field">
                      <label className="field-label">Assigned Vendor (Optional)</label>
                      <select className="field-select" value={form.assignedVendor} onChange={e=>set("assignedVendor",e.target.value)}>
                        <option value="">— None —</option>
                        {dbVendors.filter(v => v.status !== 'Inactive').map(v => <option key={v.code} value={v.code}>{v.name} – {v.city}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label">Remarks / Notes</label>
                      <textarea className="field-textarea" value={form.remarks} onChange={e=>set("remarks",e.target.value)} placeholder="Any additional notes…" rows={2}/>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Preventive Maintenance Checklist */}
                {form.maintenanceType === "preventive" && (
                  <div className="card">
                    <div className="sec-hdr">
                      <div className="sec-hdr-icon" style={{background:"#f0fdf4"}}>✅</div>
                      <div className="sec-hdr-title">PM Checklist</div>
                      <span className="sec-hdr-badge" style={{background:"#f0fdf4",color:"#15803d",borderColor:"#bbf7d0"}}>
                        {form.checklistItems.filter(c=>c.done).length}/{form.checklistItems.length} Done
                      </span>
                    </div>
                    <div style={{padding:"14px 22px"}}>
                      {form.checklistItems.map((ck, i) => (
                        <div key={ck.id} className="checklist-item">
                          <div className={`ck-check${ck.done?" done":""}`} onClick={()=>toggleCheck(i)}>
                            {ck.done && <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <div style={{flex:1}}>
                            <div className={`ck-task${ck.done?" done":""}`}>{ck.task}</div>
                          </div>
                          <span className="ck-cat">{ck.category}</span>
                          <input className="ck-remark" placeholder="Remark" value={ck.remark} onChange={e=>setCheckRemark(i,e.target.value)}/>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 4: Spare Parts */}
                <div className="card">
                  <div className="sec-hdr">
                    <div className="sec-hdr-icon" style={{background:"#fef2f2"}}>🔩</div>
                    <div className="sec-hdr-title">Spare Parts Consumed</div>
                    <button className="btn btn-outline btn-xs" style={{marginLeft:"auto"}} onClick={addSpare}>+ Add Part</button>
                  </div>
                  <div style={{padding:"14px 22px"}}>
                    {form.sparesUsed.length === 0 && (
                      <div style={{textAlign:"center",color:"#9ca3af",fontSize:13,padding:20}}>No spare parts added yet. Click "Add Part" to begin.</div>
                    )}
                    {form.sparesUsed.length > 0 && (
                      <>
                        <div className="spare-row" style={{borderBottom:"2px solid #e8edff",paddingBottom:6,marginBottom:4}}>
                          <span style={{fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:".06em"}}>Part Code</span>
                          <span style={{fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:".06em"}}>Part Name</span>
                          <span style={{fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:".06em"}}>Qty</span>
                          <span style={{fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:".06em"}}>Unit Cost</span>
                          <span style={{fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:".06em"}}>Total</span>
                          <span/>
                        </div>
                        {form.sparesUsed.map((sp, i) => (
                          <div key={i} className="spare-row">
                            <select className="field-select" style={{height:34,fontSize:12}} value={sp.code} onChange={e=>updateSpare(i,"code",e.target.value)}>
                              <option value="">Select</option>
                              {SPARE_PARTS.map(p => <option key={p.code} value={p.code}>{p.code}</option>)}
                            </select>
                            <input className="field-input" style={{height:34,fontSize:12}} value={sp.name} readOnly placeholder="Auto-fill"/>
                            <input type="number" className="field-input" style={{height:34,fontSize:12}} value={sp.qty} onChange={e=>updateSpare(i,"qty",e.target.value)} min={1}/>
                            <input className="field-input readonly" style={{height:34,fontSize:12}} value={sp.unitCost ? `₹${sp.unitCost}` : ""} readOnly/>
                            <input className="field-input readonly" style={{height:34,fontSize:12,fontWeight:700}} value={sp.total ? `₹${sp.total}` : ""} readOnly/>
                            <button className="btn btn-ghost btn-xs" style={{color:"#ef4444"}} onClick={()=>removeSpare(i)}>✕</button>
                          </div>
                        ))}
                        <div style={{textAlign:"right",marginTop:8,fontWeight:700,fontSize:13,color:"#111827"}}>
                          Total Spares Cost: ₹{form.sparesUsed.reduce((s,p)=>s+p.total,0).toLocaleString()}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* SECTION 5: Root Cause & Photos */}
                <div className="card">
                  <div className="sec-hdr">
                    <div className="sec-hdr-icon" style={{background:"#f5f3ff"}}>🔍</div>
                    <div className="sec-hdr-title">Root Cause Analysis & Documentation</div>
                    <span className="sec-hdr-badge" style={{background:"#f5f3ff",color:"#7c3aed",borderColor:"#c4b5fd"}}>Post-Work</span>
                  </div>
                  <div className="form-grid cols-3">
                    <div className="field">
                      <label className="field-label">Root Cause</label>
                      <textarea className="field-textarea" value={form.rootCause} onChange={e=>set("rootCause",e.target.value)} placeholder="Identified root cause…" rows={2}/>
                    </div>
                    <div className="field">
                      <label className="field-label">Corrective Action Taken</label>
                      <textarea className="field-textarea" value={form.correctiveAction} onChange={e=>set("correctiveAction",e.target.value)} placeholder="Actions performed to fix…" rows={2}/>
                    </div>
                    <div className="field">
                      <label className="field-label">Preventive Action / Recommendation</label>
                      <textarea className="field-textarea" value={form.preventiveAction} onChange={e=>set("preventiveAction",e.target.value)} placeholder="Recommendations to prevent recurrence…" rows={2}/>
                    </div>
                  </div>
                  
                  <div style={{height:1,background:"#e8edff",margin:"0 22px"}}/>
                  
                  {/* Photo Upload Zone */}
                  <div className="form-grid cols-2" style={{paddingTop: 16}}>
                    <div className="field">
                      <label className="field-label" style={{marginBottom: 4}}>Before Photos</label>
                      <ImageUpload images={form.beforeImages} onChange={v=>set("beforeImages",v)} label="Upload Before" color="#7c3aed" />
                    </div>
                    <div className="field">
                      <label className="field-label" style={{marginBottom: 4}}>After Photos</label>
                      <ImageUpload images={form.afterImages} onChange={v=>set("afterImages",v)} label="Upload After" color="#059669" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ═══════════════════ DETAIL VIEW ═══════════════════ */}
            {view === "detail" && selectedRecord && (
              <>
                <div className="page-hdr">
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div className="page-hdr-title">{selectedRecord.id}</div>
                      {statusBadge(selectedRecord.status)}
                      {priorityBadge(selectedRecord.priority)}
                    </div>
                    <div className="page-hdr-sub">{selectedRecord.mouldId} – {selectedRecord.mouldName} | {selectedRecord.workOrderNo}</div>
                  </div>
                  <div className="page-hdr-right">
                    <button className="btn btn-ghost" onClick={()=>{setView("list");setSelectedRecord(null)}}>
                      ← Back to List
                    </button>
                    {canEdit && (
                        <button className="btn btn-danger" onClick={() => handleDelete(selectedRecord.id)}>
                            🗑 Delete Record
                        </button>
                    )}
                  </div>
                </div>

                {/* Overview */}
                <div className="card">
                  <div className="sec-hdr">
                    <div className="sec-hdr-icon" style={{background:"#eef2ff"}}>📋</div>
                    <div className="sec-hdr-title">Maintenance Overview</div>
                    {typeBadge(selectedRecord.maintenanceType)}
                  </div>
                  <div className="detail-grid">
                    <div className="detail-item"><span className="detail-label">Mould ID</span><span className="detail-value">{selectedRecord.mouldId}</span></div>
                    <div className="detail-item"><span className="detail-label">Mould Name</span><span className="detail-value">{selectedRecord.mouldName}</span></div>
                    <div className="detail-item"><span className="detail-label">Mould Type</span><span className="detail-value">{selectedRecord.mouldType}</span></div>
                    <div className="detail-item"><span className="detail-label">Plant</span><span className="detail-value">{selectedRecord.plant}</span></div>
                    <div className="detail-item"><span className="detail-label">Shot Count at Maint.</span><span className="detail-value">{selectedRecord.shotCountAtMaint?.toLocaleString() || "—"}</span></div>
                    <div className="detail-item"><span className="detail-label">Issue Category</span><span className="detail-value">{selectedRecord.issueCategory || "N/A"}</span></div>
                    <div className="detail-item"><span className="detail-label">Reported By</span><span className="detail-value">{selectedRecord.reportedBy}</span></div>
                    <div className="detail-item"><span className="detail-label">Reported Date</span><span className="detail-value">{selectedRecord.reportedDate}</span></div>
                    <div className="detail-item"><span className="detail-label">Location</span><span className="detail-value">{selectedRecord.maintenanceLocation === "vendor" ? "Vendor" : "In-House"}</span></div>
                  </div>
                  <div style={{padding:"0 22px 16px"}}>
                    <div className="detail-label" style={{marginBottom:4}}>Issue Description</div>
                    <div style={{fontSize:13,color:"#374151",background:"#f9fafb",padding:"10px 14px",borderRadius:10,border:"1px solid #e5e7eb"}}>{selectedRecord.issueDescription}</div>
                  </div>
                </div>

                {/* Schedule & Assignment */}
                <div className="card">
                  <div className="sec-hdr">
                    <div className="sec-hdr-icon" style={{background:"#fff7ed"}}>📅</div>
                    <div className="sec-hdr-title">Schedule & Assignment</div>
                  </div>
                  <div className="detail-grid">
                    <div className="detail-item"><span className="detail-label">Scheduled Start</span><span className="detail-value">{selectedRecord.scheduledStart}</span></div>
                    <div className="detail-item"><span className="detail-label">Scheduled End</span><span className="detail-value">{selectedRecord.scheduledEnd || "—"}</span></div>
                    <div className="detail-item"><span className="detail-label">Actual Start</span><span className="detail-value">{selectedRecord.actualStart || "—"}</span></div>
                    <div className="detail-item"><span className="detail-label">Actual End</span><span className="detail-value">{selectedRecord.actualEnd || "—"}</span></div>
                    <div className="detail-item"><span className="detail-label">Downtime (hrs)</span><span className="detail-value">{selectedRecord.downtime || "—"}</span></div>
                    <div className="detail-item">
                      <span className="detail-label">Assigned Technician</span>
                      <span className="detail-value">{dbTechnicians.find(t=>t.code===selectedRecord.assignedTechnician)?.name || selectedRecord.assignedTechnician || "—"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Assigned Vendor</span>
                      <span className="detail-value">{dbVendors.find(v=>v.code===selectedRecord.assignedVendor)?.name || selectedRecord.assignedVendor || "N/A"}</span>
                    </div>
                    <div className="detail-item"><span className="detail-label">Maker</span><span className="detail-value">{selectedRecord.maker?.name || "—"}</span></div>
                    <div className="detail-item"><span className="detail-label">Approver</span><span className="detail-value">{selectedRecord.approver?.name || "Pending"}</span></div>
                  </div>
                </div>

                {/* Cost Summary */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
                  <div className="card">
                    <div className="sec-hdr">
                      <div className="sec-hdr-icon" style={{background:"#fffbeb"}}>💰</div>
                      <div className="sec-hdr-title">Cost Summary</div>
                    </div>
                    <div style={{padding:"14px 22px"}}>
                      <div className="cost-row"><span className="cost-label">Estimated Cost</span><span className="cost-value">₹{Number(selectedRecord.estimatedCost || 0).toLocaleString()}</span></div>
                      <div className="cost-row"><span className="cost-label">Spare Parts Cost</span><span className="cost-value">₹{(selectedRecord.sparesUsed||[]).reduce((s,p)=>s+p.total,0).toLocaleString()}</span></div>
                      <div className="cost-row"><span className="cost-label">Actual Cost</span><span className="cost-value">₹{Number(selectedRecord.actualCost || 0).toLocaleString() || "—"}</span></div>
                      <div className="cost-row" style={{borderTop:"2px solid #e5e7eb",marginTop:4,paddingTop:10}}>
                        <span className="cost-label" style={{fontWeight:700}}>Variance</span>
                        <span className="cost-value" style={{color:selectedRecord.actualCost > selectedRecord.estimatedCost ? "#dc2626":"#059669"}}>
                          {selectedRecord.actualCost ? `₹${Math.abs(selectedRecord.estimatedCost - selectedRecord.actualCost).toLocaleString()} ${selectedRecord.actualCost > selectedRecord.estimatedCost ? "Over":"Under"}` : "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Spare Parts Used */}
                  <div className="card">
                    <div className="sec-hdr">
                      <div className="sec-hdr-icon" style={{background:"#fef2f2"}}>🔩</div>
                      <div className="sec-hdr-title">Spare Parts</div>
                    </div>
                    <div style={{padding:"14px 22px"}}>
                      {(!selectedRecord.sparesUsed || selectedRecord.sparesUsed.length === 0) ? (
                        <div style={{color:"#9ca3af",fontSize:13,textAlign:"center",padding:14}}>No spare parts recorded</div>
                      ) : selectedRecord.sparesUsed.map((sp,i) => (
                        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<selectedRecord.sparesUsed.length-1?"1px solid #f3f4f6":"none"}}>
                          <div>
                            <div style={{fontSize:13,fontWeight:600}}>{sp.name}</div>
                            <div style={{fontSize:11,color:"#6b7280"}}>{sp.code} · Qty: {sp.qty}</div>
                          </div>
                          <div style={{fontSize:13,fontWeight:700,color:"#111827"}}>₹{Number(sp.total || 0).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RCA & Photos */}
                {(selectedRecord.rootCause || selectedRecord.correctiveAction || selectedRecord.preventiveAction || selectedRecord.beforeImages?.length > 0 || selectedRecord.afterImages?.length > 0) && (
                  <div className="card">
                    <div className="sec-hdr">
                      <div className="sec-hdr-icon" style={{background:"#f5f3ff"}}>🔍</div>
                      <div className="sec-hdr-title">Root Cause Analysis & Documentation</div>
                    </div>
                    <div className="form-grid cols-3">
                      <div className="field">
                        <label className="field-label">Root Cause</label>
                        <div style={{fontSize:13,color:"#374151",background:"#f9fafb",padding:"10px 14px",borderRadius:10,border:"1px solid #e5e7eb",minHeight:50}}>{selectedRecord.rootCause || "—"}</div>
                      </div>
                      <div className="field">
                        <label className="field-label">Corrective Action</label>
                        <div style={{fontSize:13,color:"#374151",background:"#f9fafb",padding:"10px 14px",borderRadius:10,border:"1px solid #e5e7eb",minHeight:50}}>{selectedRecord.correctiveAction || "—"}</div>
                      </div>
                      <div className="field">
                        <label className="field-label">Preventive Action</label>
                        <div style={{fontSize:13,color:"#374151",background:"#f9fafb",padding:"10px 14px",borderRadius:10,border:"1px solid #e5e7eb",minHeight:50}}>{selectedRecord.preventiveAction || "—"}</div>
                      </div>
                    </div>
                    
                    {(selectedRecord.beforeImages?.length > 0 || selectedRecord.afterImages?.length > 0) && (
                      <>
                        <div style={{height:1,background:"#e8edff",margin:"0 22px"}}/>
                        <div className="form-grid cols-2" style={{paddingTop: 16}}>
                          <div className="field">
                            <label className="field-label" style={{marginBottom: 4}}>Before Photos</label>
                            {selectedRecord.beforeImages?.length > 0 ? (
                                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                                  {selectedRecord.beforeImages.map((img,i)=>(
                                      <a key={i} href={img.url} target="_blank" rel="noopener noreferrer">
                                          <img src={img.url} alt={img.name} style={{width:80,height:80,objectFit:"cover",borderRadius:8,border:"1.5px solid #e5e7eb"}}/>
                                      </a>
                                  ))}
                                </div>
                            ) : <span style={{fontSize:12,color:"#9ca3af"}}>No photos uploaded</span>}
                          </div>
                          <div className="field">
                            <label className="field-label" style={{marginBottom: 4}}>After Photos</label>
                            {selectedRecord.afterImages?.length > 0 ? (
                                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                                  {selectedRecord.afterImages.map((img,i)=>(
                                      <a key={i} href={img.url} target="_blank" rel="noopener noreferrer">
                                          <img src={img.url} alt={img.name} style={{width:80,height:80,objectFit:"cover",borderRadius:8,border:"1.5px solid #e5e7eb"}}/>
                                      </a>
                                  ))}
                                </div>
                            ) : <span style={{fontSize:12,color:"#9ca3af"}}>No photos uploaded</span>}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Timeline */}
                <div className="card">
                  <div className="sec-hdr">
                    <div className="sec-hdr-icon" style={{background:"#eef2ff"}}>⏱</div>
                    <div className="sec-hdr-title">Activity Timeline</div>
                  </div>
                  <div style={{padding:"18px 22px"}}>
                    {selectedRecord.timeline?.map((t, i) => (
                      <div key={i} className="tl-item">
                        <div className="tl-dot">
                          {i === 0 ? "🔔" : i === selectedRecord.timeline.length-1 ? "✅" : "📌"}
                        </div>
                        <div className="tl-body">
                          <div className="tl-event">{t.event}</div>
                          <div className="tl-meta">By {t.by} · {t.at}</div>
                          {t.note && <div className="tl-note">{t.note}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

          </div>{/* /content */}

          {/* ── FOOTER (create view) ── */}
          {view === "create" && canEdit && (
            <div className="form-footer">
              <div className="footer-hint">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#9ca3af" strokeWidth="1.2"/><line x1="7" y1="5" x2="7" y2="7.5" stroke="#9ca3af" strokeWidth="1.4" strokeLinecap="round"/><circle cx="7" cy="9.5" r=".7" fill="#9ca3af"/></svg>
                Fields marked <span style={{color:"#ef4444",fontWeight:700}}>*</span> are required
              </div>
              <div className="footer-actions">
                <button className="btn btn-ghost" onClick={()=>{setView("list");setForm({...emptyForm});setErrors({})}}>Cancel</button>
                <button className="btn btn-outline">Save as Draft</button>
                <button className="btn btn-success" onClick={handleSubmit}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Submit Maintenance
                </button>
              </div>
            </div>
          )}

        </div>{/* /main */}
      </div>

      {toast && <div className={`toast ${toast.startsWith('❌') ? "terr" : "tok"}`}>{toast}</div>}
    </>
  );
}