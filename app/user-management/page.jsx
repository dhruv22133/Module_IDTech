'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ═══════════════════════════════════════════════════════════
//  USER MANAGEMENT + ROLE CREATION 
// ═══════════════════════════════════════════════════════════

const BLANK_PRIVS = { 
    mouldReg: { add: false, view: false, edit: false, del: false }, 
    transfer: false, challan: false, maint: false, ret: false, scrap: false, 
    masters: { vendor: false, mfg: false, type: false, reason: false, depr: false }, 
    receipt: false, report: false, 
    userMgmt: { add: false, view: false, edit: false, del: false }, 
    roleMgmt: { add: false, view: false, edit: false, del: false } 
};

const SEED_ROLES = [
    { id: 1, name: "Admin", code: "ROLE-ADMIN", status: "Active", desc: "Full system access. All modules, users, settings.", color: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe", createdBy: "System", privs: { mouldReg: { add: true, view: true, edit: true, del: true }, transfer: true, challan: true, maint: true, ret: true, scrap: true, masters: { vendor: true, mfg: true, type: true, reason: true, depr: true }, receipt: true, report: true, userMgmt: { add: true, view: true, edit: true, del: true }, roleMgmt: { add: true, view: true, edit: true, del: true } } },
    { id: 2, name: "Manager", code: "ROLE-MGR", status: "Active", desc: "Plant-level access. Manage moulds, transfers, approvals.", color: "#059669", bg: "#f0fdf4", border: "#bbf7d0", createdBy: "System", privs: { mouldReg: { add: true, view: true, edit: true, del: false }, transfer: true, challan: true, maint: true, ret: true, scrap: false, masters: { vendor: true, mfg: true, type: true, reason: false, depr: false }, receipt: true, report: true, userMgmt: { add: false, view: false, edit: false, del: false }, roleMgmt: { add: false, view: false, edit: false, del: false } } },
    { id: 3, name: "Operator", code: "ROLE-OPR", status: "Active", desc: "Operational access. View moulds, challans, returns.", color: "#d97706", bg: "#fffbeb", border: "#fde68a", createdBy: "System", privs: { mouldReg: { add: false, view: true, edit: false, del: false }, transfer: false, challan: true, maint: false, ret: true, scrap: false, masters: { vendor: false, mfg: false, type: false, reason: false, depr: false }, receipt: false, report: false, userMgmt: { add: false, view: false, edit: false, del: false }, roleMgmt: { add: false, view: false, edit: false, del: false } } },
    { id: 4, name: "Viewer", code: "ROLE-VIEW", status: "Active", desc: "Read-only access.", color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", createdBy: "System", privs: { mouldReg: { add: false, view: true, edit: false, del: false }, transfer: false, challan: false, maint: false, ret: false, scrap: false, masters: { vendor: false, mfg: false, type: false, reason: false, depr: false }, receipt: false, report: true, userMgmt: { add: false, view: false, edit: false, del: false }, roleMgmt: { add: false, view: false, edit: false, del: false } } },
];

const PCFG = [
    { k: "mouldReg", l: "Mould Registration", t: "crud", i: "🔩", subs: ["add", "view", "edit", "del"] },
    { k: "transfer", l: "Mould Transfer", t: "tgl", i: "🔄" },
    { k: "challan", l: "Challan Generation", t: "tgl", i: "📄" },
    { k: "maint", l: "Maintenance", t: "tgl", i: "🔧" },
    { k: "ret", l: "Mould Return", t: "tgl", i: "📥" },
    { k: "scrap", l: "Scrap / Disposal", t: "tgl", i: "🗑" },
    { k: "masters", l: "Masters", t: "multi", i: "🗂", subs: [{ k: "vendor", l: "Vendor" }, { k: "mfg", l: "Manufacturer" }, { k: "type", l: "Mould Type" }, { k: "reason", l: "Transfer Reason" }, { k: "depr", l: "Depr. Method" }] },
    { k: "receipt", l: "Transfer Receipt", t: "tgl", i: "✅" },
    { k: "report", l: "Reporting", t: "tgl", i: "📊" },
    { k: "userMgmt", l: "User Management", t: "crud", i: "👥", subs: ["add", "view", "edit", "del"] },
    { k: "roleMgmt", l: "Role Management", t: "crud", i: "🛡", subs: ["add", "view", "edit", "del"] },
];

const NAV_ITEMS = [
    { label: "Dashboard", icon: "📊", route: "/dashboard" },
    { label: "User Management", icon: "👥", route: "/user-management", active: true },
    { label: "Masters", icon: "🗂", route: "/masters" },
    { label: "Mould Registry", icon: "🔩", route: "/mould-registry" },
    { label: "Transfers & Challan", icon: "🔄", route: "/challan" },
    { label: "Mould Return", icon: "📥", route: "/return" },
    { label: "Depreciation", icon: "📉", route: "/depreciation" },
    { label: "Maintenance", icon: "🔧", route: "/maintenance" },
    { label: "Scrap / Dispose", icon: "🗑", route: "/scrap" },
    { label: "Reports", icon: "📈", route: "/reports" }
];

function ini(n) { return n ? n.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "U" }
const AC = ["#4f46e5", "#7c3aed", "#0891b2", "#059669", "#d97706", "#dc2626", "#9333ea", "#0284c7"];
function acol(s) { let h = 0; if(!s) return AC[0]; for (let c of s) h = c.charCodeAt(0) + ((h << 5) - h); return AC[Math.abs(h) % AC.length] }
function cntP(p) { let c = 0; if (!p) return 0; if (p.mouldReg && Object.values(p.mouldReg).some(Boolean)) c++; if (p.userMgmt && typeof p.userMgmt === 'object' && Object.values(p.userMgmt).some(Boolean)) c++; if (p.roleMgmt && typeof p.roleMgmt === 'object' && Object.values(p.roleMgmt).some(Boolean)) c++; ["transfer", "challan", "maint", "ret", "scrap", "receipt", "report"].forEach(k => { if (p[k]) c++ }); if (p.masters && typeof p.masters === 'object' && Object.values(p.masters).some(Boolean)) c++; return c }
function pSum(p) { const r = []; if (!p) return r; if (p.mouldReg && typeof p.mouldReg === 'object' && Object.values(p.mouldReg).some(Boolean)) { const o = ["add", "view", "edit", "del"].filter(k => p.mouldReg[k]); r.push(`Reg(${o.join("/")})`) } if (p.transfer) r.push("Transfer"); if (p.challan) r.push("Challan"); if (p.maint) r.push("Maint."); if (p.ret) r.push("Return"); if (p.scrap) r.push("Scrap"); if (p.masters && typeof p.masters === 'object' && Object.values(p.masters).some(Boolean)) r.push("Masters"); if (p.receipt) r.push("Receipt"); if (p.report) r.push("Reports"); if (p.userMgmt && typeof p.userMgmt === 'object' && Object.values(p.userMgmt).some(Boolean)) r.push("Users"); if (p.roleMgmt && typeof p.roleMgmt === 'object' && Object.values(p.roleMgmt).some(Boolean)) r.push("Roles"); return r }

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#f0f2f5;min-height:100vh;color:#111827}
.shell{display:flex;height:100vh;overflow:hidden}
.sb{width:220px;flex-shrink:0;background:linear-gradient(170deg,#3b3fe8 0%,#5b2be0 45%,#7c2fe8 100%);display:flex;flex-direction:column;position:relative;overflow:hidden}
.sb::after{content:'';position:absolute;bottom:-60px;left:-60px;width:240px;height:240px;border-radius:50%;background:rgba(255,255,255,.05)}
.sb-brand{padding:20px 16px 14px;border-bottom:1px solid rgba(255,255,255,.1);z-index:1;position:relative}
.sb-brand-row{display:flex;align-items:center;gap:10px}
.sb-icon{width:36px;height:36px;background:rgba(255,255,255,0.18);border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sb-name{font-size:14px;font-weight:700;color:#fff}.sb-name span{font-weight:400;opacity:.8}
.sb-sub{font-size:10px;color:rgba(255,255,255,.5);margin-top:1px}
.sb-nav{flex:1;padding:14px 12px;display:flex;flex-direction:column;gap:4px;overflow-y:auto}
.sb-sec{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.35);padding:10px 12px 4px;margin-top:6px}
.sb-link{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;cursor:pointer;color:rgba(255,255,255,.65);font-size:13px;font-weight:500;transition:background .15s}
.sb-link:hover{background:rgba(255,255,255,.1);color:#fff}
.sb-link.on{background:rgba(255,255,255,.18);color:#fff;font-weight:600}
.sb-foot{padding:16px 14px;border-top:1px solid rgba(255,255,255,.1)}
.sb-av{width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff}
.mn{flex:1;display:flex;flex-direction:column;overflow:hidden}
.top{height:58px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;padding:0 28px;flex-shrink:0;box-shadow:0 1px 4px rgba(0,0,0,.05)}
.top-t{font-size:17px;font-weight:800;color:#111827;letter-spacing:-.02em}
.top-bc{font-size:12px;color:#9ca3af;margin-bottom:1px}
.upill{display:flex;align-items:center;gap:8px;background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:10px;padding:5px 12px 5px 6px}
.uav{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff}
.unm{font-size:12px;font-weight:600;color:#374151}
.cnt{flex:1;overflow-y:auto;padding:24px 28px}
.tabs{display:flex;gap:4px;margin-bottom:22px;border-bottom:2px solid #e5e7eb}
.tabx{padding:10px 20px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;border:none;background:none;color:#6b7280;border-bottom:2.5px solid transparent;margin-bottom:-2px;transition:all .15s}
.tabx:hover{color:#4f46e5}.tabx.on{color:#4f46e5;border-bottom-color:#4f46e5}
.stats{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:22px}
.stat{background:#fff;border-radius:14px;padding:16px 18px;border:1px solid #e5e7eb;box-shadow:0 1px 4px rgba(0,0,0,.04);position:relative;overflow:hidden}
.stat:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.08)}
.sl{font-size:10.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#6b7280}
.sv{font-size:24px;font-weight:800;letter-spacing:-.03em;line-height:1;margin-top:6px;color:#111827}
.ss{font-size:10.5px;color:#9ca3af;margin-top:3px}
.toolbar{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap}
.sbox{display:flex;align-items:center;gap:8px;height:40px;border:1.5px solid #e5e7eb;border-radius:10px;padding:0 14px;background:#fff;flex:1;max-width:340px}
.sbox input{border:none;outline:none;background:none;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#111827;width:100%}
.sbox input::placeholder{color:#9ca3af}
.fsel{height:40px;border:1.5px solid #e5e7eb;border-radius:10px;padding:0 14px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#374151;background:#fff;outline:none;cursor:pointer}
.btn{display:inline-flex;align-items:center;gap:7px;height:40px;padding:0 18px;border-radius:10px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;font-weight:600;cursor:pointer;transition:all .15s;border:none}
.btn-p{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;box-shadow:0 4px 14px rgba(91,43,224,.25)}.btn-p:hover{opacity:.9;transform:translateY(-1px)}
.btn-o{background:#fff;color:#374151;border:1.5px solid #e5e7eb}.btn-o:hover{border-color:#4f46e5;color:#4f46e5}
.btn-d{background:#dc2626;color:#fff}.btn-d:hover{opacity:.9}
.btn-s{background:linear-gradient(135deg,#10b981,#059669);color:#fff}.btn-s:hover{opacity:.9;transform:translateY(-1px)}
.btn-sm{height:34px;padding:0 14px;font-size:12px;border-radius:8px}
.card{background:#fff;border-radius:16px;border:1px solid #e5e7eb;box-shadow:0 1px 6px rgba(0,0,0,.05);overflow:hidden;margin-bottom:18px}
.card-hdr{padding:14px 20px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between}
.card-t{font-size:15px;font-weight:700;color:#111827}
.card-cnt{font-size:12px;color:#6b7280;background:#f3f4f6;padding:2px 10px;border-radius:20px}
table{width:100%;border-collapse:collapse}
th{padding:10px 16px;text-align:left;font-size:10.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#6b7280;background:#f9fafb;border-bottom:1px solid #f0f0f0}
td{padding:12px 16px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;vertical-align:middle}
tr:last-child td{border:none}
tr:hover td{background:#fafbff}
.ucell{display:flex;align-items:center;gap:10px}
.uimg{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0}
.uname{font-size:13px;font-weight:600;color:#111827}
.uemp{font-size:11px;color:#9ca3af;margin-top:1px}
.rbadge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:600;border:1px solid}
.sdot{width:7px;height:7px;border-radius:50%;display:inline-block;margin-right:6px}
.ppill{font-size:10.5px;font-weight:600;padding:2px 7px;border-radius:5px;background:#eef2ff;color:#4338ca;border:1px solid #c7d2fe;display:inline-block;margin:1px 2px}
.ppill.off{background:#f9fafb;color:#9ca3af;border-color:#e5e7eb;text-decoration:line-through;opacity:.5}
.acts{display:flex;gap:5px}
.abtn{width:30px;height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;color:#6b7280;transition:all .12s;font-size:13px}
.abtn.v:hover{border-color:#0891b2;color:#0891b2;background:#e0f2fe}
.abtn.e:hover{border-color:#4f46e5;color:#4f46e5;background:#eef2ff}
.abtn.d:hover{border-color:#dc2626;color:#dc2626;background:#fef2f2}
.mov{position:fixed;inset:0;background:rgba(15,20,40,.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(3px)}
.mbox{background:#fff;border-radius:18px;width:100%;max-height:92vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,.2);animation:mi .22s ease}
@keyframes mi{from{opacity:0;transform:scale(.97) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
.mhdr{padding:20px 24px 16px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:2;border-radius:18px 18px 0 0}
.mt{font-size:17px;font-weight:800;color:#111827}
.msub{font-size:12px;color:#6b7280;margin-top:2px}
.mcls{width:32px;height:32px;border-radius:8px;border:1.5px solid #e5e7eb;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#6b7280;font-size:16px}
.mcls:hover{background:#fef2f2;border-color:#dc2626;color:#dc2626}
.mbody{padding:22px 24px}
.mfoot{padding:16px 24px;border-top:1px solid #f3f4f6;display:flex;justify-content:flex-end;gap:10px;background:#fafafa;border-radius:0 0 18px 18px;position:sticky;bottom:0}
.fg{display:grid;gap:16px;margin-bottom:16px}.fg2{grid-template-columns:1fr 1fr}.fg3{grid-template-columns:1fr 1fr 1fr}
.fl{display:flex;flex-direction:column;gap:5px}
.fl-l{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7280}
.fl-i,.fl-s{height:42px;border:1.5px solid #e5e7eb;border-radius:10px;padding:0 14px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;color:#111827;background:#fafafa;outline:none;width:100%;transition:border-color .2s}
.fl-i:focus,.fl-s:focus{border-color:#4f46e5;background:#fff;box-shadow:0 0 0 3px rgba(79,70,229,.08)}
.fl-i:disabled, .fl-s:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; border-color: #d1d5db; opacity: 0.8; }
.fl-i.err{border-color:#ef4444}.fl-err{font-size:10.5px;color:#ef4444}
.fl-ta{border:1.5px solid #e5e7eb;border-radius:10px;padding:10px 14px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;color:#111827;background:#fafafa;outline:none;width:100%;resize:vertical;min-height:50px}
.fl-ta:focus{border-color:#4f46e5;background:#fff}
.sdiv{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;margin:18px 0 12px;padding-bottom:6px;border-bottom:1px solid #f3f4f6}
.psec{background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:12px;padding:16px 18px;margin-bottom:14px}
.pst{font-size:13px;font-weight:700;color:#111827;margin-bottom:14px}
.pg{margin-bottom:12px}
.pgl{font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;margin-bottom:8px}
.pcks{display:flex;flex-wrap:wrap;gap:10px}
.pci{display:flex;align-items:center;gap:6px;cursor:pointer}
.ckb{width:18px;height:18px;border:2px solid #d1d5db;border-radius:5px;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
.ckb.on{background:#4f46e5;border-color:#4f46e5}
.ckl{font-size:12.5px;color:#374151;user-select:none}
.trow{display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f0f0f0}.trow:last-child{border:none}
.tlab{font-size:13px;color:#374151;font-weight:500}
.tgl{width:38px;height:22px;border-radius:11px;background:#e5e7eb;position:relative;cursor:pointer;transition:background .2s;flex-shrink:0}
.tgl.on{background:#4f46e5}
.tgl-th{width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:left .2s;box-shadow:0 1px 4px rgba(0,0,0,.2)}
.tgl.on .tgl-th{left:19px}
.role-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-top:16px}
.rcard{background:#fff;border-radius:14px;border:1.5px solid #e5e7eb;padding:20px;transition:all .15s}
.rcard:hover{box-shadow:0 6px 20px rgba(0,0,0,.08);transform:translateY(-2px)}
.rcard-top{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.rcard-ico{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.rcard-name{font-size:16px;font-weight:800;color:#111827}
.rcard-code{font-size:11px;color:#9ca3af;font-family:monospace}
.rcard-desc{font-size:12.5px;color:#6b7280;line-height:1.5;margin-bottom:12px}
.rcard-meta{display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap}
.rcard-tag{font-size:10.5px;font-weight:600;padding:3px 10px;border-radius:20px;display:inline-flex;align-items:center;gap:4px}
.rcard-acts{display:flex;gap:8px;padding-top:12px;border-top:1px solid #f3f4f6}
.vg{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.vf{background:#f9fafb;border-radius:8px;padding:10px 12px}
.vf-l{font-size:10.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin-bottom:3px}
.vf-v{font-size:13.5px;font-weight:600;color:#111827}
.pag{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-top:1px solid #f3f4f6}
.pag-i{font-size:12px;color:#6b7280}
.pag-b{display:flex;gap:4px}
.pgb{width:30px;height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;color:#374151}
.pgb.on{background:#4f46e5;border-color:#4f46e5;color:#fff}
.pgb:hover:not(.on){border-color:#4f46e5;color:#4f46e5}
.toast{position:fixed;bottom:24px;right:24px;background:#111827;color:#fff;padding:13px 20px;border-radius:12px;font-size:13.5px;font-weight:500;z-index:2000;box-shadow:0 8px 30px rgba(0,0,0,.25);animation:ti .3s ease}
@keyframes ti{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.tok{border-left:4px solid #10b981}.terr{border-left:4px solid #ef4444}

.logout-btn {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 11.5px;
  font-weight: 700;
  color: #ef4444;
  background: #fef2f2;
  border: 1.5px solid #fca5a5;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all .15s;
}
.logout-btn:hover {
  background: #ef4444;
  color: #fff;
}
`;

// ── Sub-components ──
function Ck({ on, fn }) {
    return (
        <div className={`ckb${on ? " on" : ""}`} onClick={fn}>
            {on && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </div>
    );
}

function Tg({ on, fn }) {
    return (
        <div className={`tgl${on ? " on" : ""}`} onClick={fn}>
            <div className="tgl-th" />
        </div>
    );
}

function PrivEditor({ privs, onChange }) {
    const set = (path, val) => {
        const n = JSON.parse(JSON.stringify(privs || {}));
        const k = path.split(".");
        let o = n;
        
        for (let i = 0; i < k.length - 1; i++) {
            if (typeof o[k[i]] !== 'object' || o[k[i]] === null) {
                o[k[i]] = {};
            }
            o = o[k[i]];
        }
        o[k[k.length - 1]] = val;
        onChange(n);
    };

    return (
        <div className="psec">
            <div className="pst">🛡 Module Privileges</div>
            {PCFG.map(cfg => (
                <div key={cfg.k} className="pg">
                    <div className="pgl">{cfg.i} {cfg.l}</div>
                    {cfg.t === "crud" && (
                        <div className="pcks">
                            {cfg.subs.map(s => (
                                <label key={s} className="pci">
                                    <Ck on={privs[cfg.k]?.[s]} fn={() => set(`${cfg.k}.${s}`, !privs[cfg.k]?.[s])} />
                                    <span className="ckl" style={{ textTransform: "capitalize" }}>
                                        {s === "del" ? "Delete" : s}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                    {cfg.t === "tgl" && (
                        <div className="trow">
                            <span className="tlab">Allow access</span>
                            <Tg on={privs[cfg.k]} fn={() => set(cfg.k, !privs[cfg.k])} />
                        </div>
                    )}
                    {cfg.t === "multi" && (
                        <div className="pcks">
                            {cfg.subs.map(s => (
                                <label key={s.k} className="pci">
                                    <Ck on={privs[cfg.k]?.[s.k]} fn={() => set(`${cfg.k}.${s.k}`, !privs[cfg.k]?.[s.k])} />
                                    <span className="ckl">{s.l}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ── Modal: User Form (Add/Edit) ──
function UserFormModal({ user, isEdit, roleNames, plants, depts, onClose, onSave, loading }) {
    const [form, setForm] = useState(JSON.parse(JSON.stringify(user)));
    const [errs, setErrs] = useState({});
    const s = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const validate = () => {
        const e = {};
        if (!form.empId.trim()) e.empId = "Required";
        if (!form.name.trim()) e.name = "Required";
        if (!form.email.trim()) {
            e.email = "Required";
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            e.email = "Invalid";
        }
        if (!isEdit && (!form.password || form.password.length < 8)) {
            e.password = "Min 8 chars required";
        }
        return e;
    };

    const submit = () => {
        const e = validate();
        if (Object.keys(e).length) {
            setErrs(e);
            return;
        }
        onSave(form);
    };

    return (
        <div className="mov" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="mbox" style={{ maxWidth: 680 }}>
                <div className="mhdr">
                    <div>
                        <div className="mt">{isEdit ? "Edit User" : "Add New User"}</div>
                        <div className="msub">{isEdit ? `Editing ${form.name}` : "Fill details and assign role"}</div>
                    </div>
                    <button className="mcls" onClick={onClose}>x</button>
                </div>
                <div className="mbody">
                    <div className="sdiv">Basic Information</div>
                    <div className="fg fg2">
                        <div className="fl">
                            <label className="fl-l">Employee ID *</label>
                            <input className={`fl-i${errs.empId ? " err" : ""}`} value={form.empId} disabled={isEdit} onChange={e => { s("empId", e.target.value); setErrs(v => ({ ...v, empId: "" })) }} />
                            {errs.empId && <div className="fl-err">{errs.empId}</div>}
                        </div>
                        <div className="fl">
                            <label className="fl-l">Full Name *</label>
                            <input className={`fl-i${errs.name ? " err" : ""}`} value={form.name} onChange={e => { s("name", e.target.value); setErrs(v => ({ ...v, name: "" })) }} />
                            {errs.name && <div className="fl-err">{errs.name}</div>}
                        </div>
                    </div>
                    <div className="fg fg2">
                        <div className="fl">
                            <label className="fl-l">Email *</label>
                            <input className={`fl-i${errs.email ? " err" : ""}`} value={form.email} disabled={isEdit} onChange={e => { s("email", e.target.value); setErrs(v => ({ ...v, email: "" })) }} />
                            {errs.email && <div className="fl-err">{errs.email}</div>}
                        </div>
                        <div className="fl">
                            <label className="fl-l">Phone</label>
                            <input className="fl-i" value={form.phone || ""} onChange={e => s("phone", e.target.value)} />
                        </div>
                    </div>
                    <div className="fg fg3">
                        <div className="fl">
                            <label className="fl-l">Role</label>
                            <select className="fl-s" value={form.role} onChange={e => s("role", e.target.value)}>
                                {form.role && !roleNames.includes(form.role) && <option value={form.role}>{form.role} (Inactive)</option>}
                                {roleNames.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="fl">
                            <label className="fl-l">Plant</label>
                            <select className="fl-s" value={form.plant} onChange={e => s("plant", e.target.value)}>
                                <option value="">— Select Plant —</option>
                                {plants.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="fl">
                            <label className="fl-l">Department</label>
                            <select className="fl-s" value={form.dept} onChange={e => s("dept", e.target.value)}>
                                <option value="">— Select Dept —</option>
                                {depts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="fg fg2">
                        <div className="fl">
                            <label className="fl-l">Status</label>
                            <select className="fl-s" value={form.status} onChange={e => s("status", e.target.value)}>
                                <option>Active</option>
                                <option>Inactive</option>
                            </select>
                        </div>
                        <div className="fl">
                            <label className="fl-l">{isEdit ? "New Password (Optional)" : "Account Password *"}</label>
                            <input className={`fl-i${errs.password ? " err" : ""}`} type="password" value={form.password || ""} onChange={e => { s("password", e.target.value); setErrs(v => ({ ...v, password: "" })) }} placeholder="Min 8 chars" />
                            {errs.password && <div className="fl-err">{errs.password}</div>}
                        </div>
                    </div>
                    <div className="sdiv">Privileges (from Role: {form.role})</div>
                    <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Privileges are managed at the role level. Edit the role to change privileges.</div>
                    </div>
                </div>
                <div className="mfoot">
                    <button className="btn btn-o" onClick={onClose}>Cancel</button>
                    <button className="btn btn-p" onClick={submit} disabled={loading}>{loading ? "Saving..." : (isEdit ? "Save Changes" : "Create User")}</button>
                </div>
            </div>
        </div>
    );
}

// ── Modal: Role Form (Add/Edit) ──
function RoleFormModal({ role, isEdit, onClose, onSave, loading }) {
    const [form, setForm] = useState(JSON.parse(JSON.stringify(role)));
    const [errs, setErrs] = useState({});
    const s = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Required";
        if (!form.code.trim()) e.code = "Required";
        return e;
    };

    const submit = () => {
        const e = validate();
        if (Object.keys(e).length) {
            setErrs(e);
            return;
        }
        onSave(form);
    };

    return (
        <div className="mov" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="mbox" style={{ maxWidth: 720 }}>
                <div className="mhdr">
                    <div>
                        <div className="mt">{isEdit ? "Edit Role" : "Create New Role"}</div>
                        <div className="msub">{isEdit ? `Editing "${form.name}"` : "Define role and assign module privileges"}</div>
                    </div>
                    <button className="mcls" onClick={onClose}>x</button>
                </div>
                <div className="mbody">
                    <div className="sdiv">Role Details</div>
                    <div className="fg fg3">
                        <div className="fl">
                            <label className="fl-l">Role Name *</label>
                            <input className={`fl-i${errs.name ? " err" : ""}`} value={form.name} disabled={isEdit} onChange={e => { s("name", e.target.value); setErrs(v => ({ ...v, name: "" })) }} />
                            {errs.name && <div className="fl-err">{errs.name}</div>}
                        </div>
                        <div className="fl">
                            <label className="fl-l">Role Code *</label>
                            <input className={`fl-i${errs.code ? " err" : ""}`} value={form.code} disabled={isEdit} onChange={e => { s("code", e.target.value); setErrs(v => ({ ...v, code: "" })) }} />
                            {errs.code && <div className="fl-err">{errs.code}</div>}
                        </div>
                        <div className="fl">
                            <label className="fl-l">Status</label>
                            <select className="fl-s" value={form.status || "Active"} onChange={e => s("status", e.target.value)}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="fg" style={{ gridTemplateColumns: "1fr" }}>
                        <div className="fl">
                            <label className="fl-l">Description</label>
                            <textarea className="fl-ta" value={form.desc || ""} onChange={e => s("desc", e.target.value)} rows={2} placeholder="What can this role do?" />
                        </div>
                    </div>
                    <div className="sdiv">Module Privileges</div>
                    <PrivEditor privs={form.privs} onChange={p => setForm(f => ({ ...f, privs: p }))} />
                </div>
                <div className="mfoot">
                    <button className="btn btn-o" onClick={onClose}>Cancel</button>
                    <button className="btn btn-s" onClick={submit} disabled={loading}>{loading ? "Saving..." : (isEdit ? "Save Role" : "Create Role")}</button>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
export default function UserManagement() {
    const router = useRouter();
    const [user, setUser] = useState({ name: "User", role: "Viewer" });

    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [dbPlants, setDbPlants] = useState([]);
    const [dbDepts, setDbDepts] = useState([]);
    
    const [tab, setTab] = useState("users");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [modal, setModal] = useState(null);
    const [toast, setToast] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const PER = 8;

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            if (res.ok) setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await fetch("/api/roles");
            const data = await res.json();
            if (res.ok) setRoles(data);
        } catch (error) {
            console.error("Failed to fetch roles", error);
        }
    };

    const fetchMasters = async () => {
        try {
            const resP = await fetch("/api/masters?type=plants");
            if (resP.ok) { const d = await resP.json(); setDbPlants(d.map(p => p.name)); }

            const resD = await fetch("/api/masters?type=departments");
            if (resD.ok) { const d = await resD.json(); setDbDepts(d.map(dep => dep.name)); }
        } catch (err) { console.error("Failed to fetch masters", err); }
    };

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) {
            router.push("/login");
            return;
        }
        setUser(JSON.parse(stored));
        fetchUsers();
        fetchRoles();
        fetchMasters();
    }, [router]);

    const currentUserInitials = ini(user.name);
    const flash = (msg, type = "ok") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3200);
    };

    // Filter Logic to remove "Inactive" roles from Add/Edit User forms
    const allRoleNames = roles.length > 0 ? roles.map(r => r.name) : ["Admin"];
    const activeRoleNames = roles.filter(r => r.status !== "Inactive").map(r => r.name);
    if (activeRoleNames.length === 0) activeRoleNames.push("Admin");

    const getRole = name => roles.find(r => r.name === name);

    // Retrieve active user's permissions to guard action buttons
    const currentUserPrivs = getRole(user.role)?.privs || (user.role === 'Admin' ? SEED_ROLES[0].privs : BLANK_PRIVS);

    const filteredUsers = users.filter(u => {
        const q = search.toLowerCase();
        return (
            (!q || u.name.toLowerCase().includes(q) || u.empId.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
            (roleFilter === "All" || u.role === roleFilter) &&
            (statusFilter === "All" || u.status === statusFilter)
        );
    });

    const totalPg = Math.ceil(filteredUsers.length / PER);
    const paged = filteredUsers.slice((page - 1) * PER, page * PER);
    const totalActive = users.filter(u => u.status === "Active").length;

    // API Handlers
    const handleSaveUser = async (u, isEdit = false) => {
        setLoading(true);
        try {
            const res = await fetch("/api/users", {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(u)
            });
            const data = await res.json();

            if (!res.ok) {
                flash(data.error || "Failed to save user", "err");
            } else {
                flash(`${u.name} ${isEdit ? "updated" : "added to database"}`);
                setModal(null);
                fetchUsers();
            }
        } catch (err) {
            flash("System error occurred", "err");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id, name) => {
        try {
            const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            flash(`${name} deleted permanently`, "err");
            setModal(null);
            fetchUsers();
        } catch (err) {
            flash("System error occurred", "err");
        }
    };

    const handleSaveRole = async (r, isEdit = false) => {
        setLoading(true);
        try {
            const payload = {
                ...r,
                status: r.status || "Active",
                color: r.color || "#4f46e5",
                bg: r.bg || "#eef2ff",
                border: r.border || "#c7d2fe",
                createdBy: user.name
            };

            const res = await fetch("/api/roles", {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) {
                flash(data.error || "Failed to save role", "err");
            } else {
                flash(`Role "${r.name}" ${isEdit ? "updated" : "added to database"}`);
                setModal(null);
                fetchRoles();
            }
        } catch (err) {
            flash("System error occurred", "err");
        } finally {
            setLoading(false);
        }
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

    return (
        <>
            <style>{CSS}</style>
            <div className="shell">
                <div className="sb">
                    <div className="sb-brand">
                        <div className="sb-brand-row">
                            <div className="sb-icon">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><rect x="12" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".6"/><rect x="2" y="12" width="6" height="6" rx="1.5" fill="white" opacity=".6"/><rect x="12" y="12" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><circle cx="10" cy="10" r="1.8" fill="white"/></svg>
                            </div>
                            <div><div className="sb-name">MouldSys <span>Enterprise</span></div><div className="sb-sub">Asset Management Platform</div></div>
                        </div>
                    </div>
                    <div className="sb-nav">
                        <div className="sb-sec">Main</div>
                        {NAV_ITEMS.map(n => (
                            <div 
                                key={n.label} 
                                className={`sb-link${n.active ? " on" : ""}`} 
                                onClick={() => router.push(n.route)}
                            >
                                <span>{n.icon}</span>{n.label}
                            </div>
                        ))}
                    </div>
                    <div className="sb-foot">
                        <div className="sb-row">
                            <div className="sb-av" style={{ background: acol(user.name) }}>{currentUserInitials}</div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{user.name}</div>
                                <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>{user.role}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mn">
                    <div className="top">
                        <div>
                            <div className="top-bc">Administration</div>
                            <div className="top-t">User Management</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div className="upill">
                                <div className="uav" style={{ background: acol(user.name) }}>{currentUserInitials}</div>
                                <span className="unm">{user.name}</span>
                            </div>
                            <button className="logout-btn" onClick={handleLogout}>
                                Logout ➔
                            </button>
                        </div>
                    </div>
                    <div className="cnt">
                        <div className="tabs">
                            <button className={`tabx${tab === "users" ? " on" : ""}`} onClick={() => { setTab("users"); setPage(1) }}>Users ({users.length})</button>
                            <button className={`tabx${tab === "roles" ? " on" : ""}`} onClick={() => setTab("roles")}>Roles ({roles.length})</button>
                        </div>

                        {/* ═══ USERS TAB ═══ */}
                        {tab === "users" && (
                            <>
                                <div className="stats">
                                    <div className="stat" style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderColor: "transparent" }}>
                                        <div className="sl" style={{ color: "rgba(255,255,255,.7)" }}>Total Users</div>
                                        <div className="sv" style={{ color: "#fff" }}>{users.length}</div>
                                        <div className="ss" style={{ color: "rgba(255,255,255,.55)" }}>Registered</div>
                                    </div>
                                    <div className="stat">
                                        <div className="sl">Active</div>
                                        <div className="sv" style={{ color: "#059669" }}>{totalActive}</div>
                                        <div className="ss">{users.length - totalActive} inactive</div>
                                    </div>
                                    <div className="stat">
                                        <div className="sl">Admins</div>
                                        <div className="sv" style={{ color: "#7c3aed" }}>{users.filter(u => u.role === "Admin").length}</div>
                                        <div className="ss">Full access</div>
                                    </div>
                                    <div className="stat">
                                        <div className="sl">Roles</div>
                                        <div className="sv" style={{ color: "#0891b2" }}>{roles.length}</div>
                                        <div className="ss">Defined</div>
                                    </div>
                                    <div className="stat">
                                        <div className="sl">Modules</div>
                                        <div className="sv" style={{ color: "#d97706" }}>{PCFG.length}</div>
                                        <div className="ss">Controlled</div>
                                    </div>
                                </div>
                                <div className="toolbar">
                                    <div className="sbox">
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <circle cx="6" cy="6" r="4.5" stroke="#9ca3af" strokeWidth="1.5" />
                                            <path d="M10 10l3 3" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                        <input placeholder="Search name, ID, email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
                                    </div>
                                    <select className="fsel" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}>
                                        <option value="All">All Roles</option>
                                        {allRoleNames.map(r => <option key={r}>{r}</option>)}
                                    </select>
                                    <select className="fsel" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
                                        <option value="All">All Status</option>
                                        <option>Active</option>
                                        <option>Inactive</option>
                                    </select>
                                    <div style={{ flex: 1 }} />
                                    {currentUserPrivs.userMgmt?.add && (
                                        <button className="btn btn-p" onClick={() => setModal({ type: "addUser" })}>+ Add User</button>
                                    )}
                                </div>
                                <div className="card">
                                    <div className="card-hdr">
                                        <span className="card-t">Registered Users</span>
                                        <span className="card-cnt">{filteredUsers.length}</span>
                                    </div>
                                    {paged.length === 0 ? (
                                        <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>No users found</div>
                                    ) : (
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>User</th>
                                                    <th>Role</th>
                                                    <th>Plant</th>
                                                    <th>Dept</th>
                                                    <th>Status</th>
                                                    <th>Privileges</th>
                                                    <th>Last Login</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paged.map(u => {
                                                    const ro = getRole(u.role);
                                                    const rc = ro || { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" };
                                                    const ps = ro ? pSum(ro.privs).slice(0, 3) : [];
                                                    const ex = ro ? pSum(ro.privs).length - 3 : 0;
                                                    return (
                                                        <tr key={u.id}>
                                                            <td>
                                                                <div className="ucell">
                                                                    <div className="uimg" style={{ background: acol(u.name) }}>{ini(u.name)}</div>
                                                                    <div>
                                                                        <div className="uname">{u.name}</div>
                                                                        <div className="uemp">{u.empId} - {u.email}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className="rbadge" style={{ background: rc.bg, color: rc.color, borderColor: rc.border }}>{u.role}</span>
                                                            </td>
                                                            <td style={{ fontSize: 12, color: "#6b7280" }}>{u.plant}</td>
                                                            <td style={{ fontSize: 12, color: "#6b7280" }}>{u.dept}</td>
                                                            <td>
                                                                <span style={{ display: "flex", alignItems: "center", fontSize: 13, fontWeight: 500, color: u.status === "Active" ? "#15803d" : "#9ca3af" }}>
                                                                    <span className="sdot" style={{ background: u.status === "Active" ? "#16a34a" : "#9ca3af" }} />{u.status}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                                                                    {ps.map(p => <span key={p} className="ppill">{p}</span>)}
                                                                    {ex > 0 && <span className="ppill" style={{ background: "#f3f4f6", color: "#6b7280", borderColor: "#e5e7eb" }}>+{ex}</span>}
                                                                </div>
                                                            </td>
                                                            <td style={{ fontSize: 12, color: "#9ca3af" }}>{u.lastLogin || "Never"}</td>
                                                            <td>
                                                                <div className="acts">
                                                                    <button className="abtn v" onClick={() => setModal({ type: "viewUser", data: u })}>👁</button>
                                                                    {currentUserPrivs.userMgmt?.edit && <button className="abtn e" onClick={() => setModal({ type: "editUser", data: u })}>✏️</button>}
                                                                    {currentUserPrivs.userMgmt?.del && <button className="abtn d" onClick={() => setModal({ type: "delUser", data: u })}>🗑</button>}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                                {totalPg > 1 && (
                                    <div className="pag">
                                        <div className="pag-i">Page {page}/{totalPg}</div>
                                        <div className="pag-b">
                                            {Array.from({ length: totalPg }, (_, i) => i + 1).map(p => (
                                                <button key={p} className={`pgb${page === p ? " on" : ""}`} onClick={() => setPage(p)}>{p}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ═══ ROLES TAB ═══ */}
                        {tab === "roles" && (
                            <>
                                <div className="toolbar">
                                    <div style={{ fontSize: 14, fontWeight: 700 }}>Defined Roles ({roles.length})</div>
                                    <div style={{ flex: 1 }} />
                                    {currentUserPrivs.roleMgmt?.add && (
                                        <button className="btn btn-p" onClick={() => setModal({ type: "addRole" })}>+ Create Role</button>
                                    )}
                                </div>
                                {roles.length === 0 ? (
                                    <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb" }}>
                                        No roles defined in database
                                    </div>
                                ) : (
                                    <div className="role-grid">
                                        {roles.map(r => {
                                            const ps = pSum(r.privs);
                                            const uc = users.filter(u => u.role === r.name).length;
                                            return (
                                                <div key={r.id} className="rcard" style={{ borderColor: r.border }}>
                                                    <div className="rcard-top">
                                                        <div className="rcard-ico" style={{ background: r.bg, color: r.color }}>🛡</div>
                                                        <div>
                                                            <div className="rcard-name">{r.name}</div>
                                                            <div className="rcard-code">{r.code}</div>
                                                        </div>
                                                    </div>
                                                    <div className="rcard-desc">{r.desc}</div>
                                                    <div className="rcard-meta">
                                                        <span className="rcard-tag" style={{ background: r.bg, color: r.color, border: `1px solid ${r.border}` }}>
                                                            👤 {uc} user{uc !== 1 ? "s" : ""}
                                                        </span>
                                                        <span className="rcard-tag" style={{ background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" }}>
                                                            🔒 {cntP(r.privs)}/{PCFG.length}
                                                        </span>
                                                        <span className="rcard-tag" style={{ background: r.status === "Inactive" ? "#fef2f2" : "#f0fdf4", color: r.status === "Inactive" ? "#dc2626" : "#15803d", border: `1px solid ${r.status === "Inactive" ? "#fca5a5" : "#bbf7d0"}` }}>
                                                            {r.status === "Inactive" ? "Inactive" : "Active"}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
                                                        {ps.map(p => <span key={p} className="ppill">{p}</span>)}
                                                    </div>
                                                    <div className="rcard-acts">
                                                        <button className="btn btn-o btn-sm" onClick={() => setModal({ type: "viewRole", data: r })}>View</button>
                                                        {currentUserPrivs.roleMgmt?.edit && (
                                                            <button className="btn btn-o btn-sm" onClick={() => setModal({ type: "editRole", data: r })}>Edit</button>
                                                        )}
                                                        {currentUserPrivs.roleMgmt?.del && r.name !== "Admin" && (
                                                            <button 
                                                                className="btn btn-o btn-sm" 
                                                                style={{ color: r.status === "Inactive" ? "#15803d" : "#dc2626", borderColor: r.status === "Inactive" ? "#bbf7d0" : "#fca5a5" }} 
                                                                onClick={() => setModal({ type: "statusRole", data: r })}
                                                            >
                                                                {r.status === "Inactive" ? "Activate" : "Deactivate"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {modal?.type === "addUser" && (
                <UserFormModal
                    user={{ empId: "", name: "", email: "", role: activeRoleNames[0], plant: dbPlants[0] || "", status: "Active", password: "", phone: "", dept: dbDepts[0] || "" }}
                    isEdit={false}
                    roleNames={activeRoleNames}
                    plants={dbPlants}
                    depts={dbDepts}
                    onClose={() => setModal(null)}
                    onSave={u => handleSaveUser(u, false)}
                    loading={loading}
                />
            )}
            {modal?.type === "editUser" && (
                <UserFormModal
                    user={modal.data}
                    isEdit={true}
                    roleNames={activeRoleNames}
                    plants={dbPlants}
                    depts={dbDepts}
                    onClose={() => setModal(null)}
                    onSave={u => handleSaveUser(u, true)}
                    loading={loading}
                />
            )}

            {modal?.type === "viewUser" && (() => {
                const u = modal.data;
                const ro = getRole(u.role);
                const rc = ro || { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" };
                return (
                    <div className="mov" onClick={e => e.target === e.currentTarget && setModal(null)}>
                        <div className="mbox" style={{ maxWidth: 640 }}>
                            <div className="mhdr">
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div className="uimg" style={{ width: 42, height: 42, fontSize: 15, background: acol(u.name) }}>{ini(u.name)}</div>
                                    <div>
                                        <div className="mt">{u.name}</div>
                                        <div className="msub">{u.empId} - {u.plant}</div>
                                    </div>
                                </div>
                                <button className="mcls" onClick={() => setModal(null)}>x</button>
                            </div>
                            <div className="mbody">
                                <div className="sdiv">Basic Information</div>
                                <div className="vg">
                                    {[
                                        ["Employee ID", u.empId],
                                        ["Name", u.name],
                                        ["Email", u.email],
                                        ["Phone", u.phone || "\u2014"],
                                        ["Plant", u.plant],
                                        ["Dept", u.dept || "\u2014"],
                                        ["Last Login", u.lastLogin || "\u2014"]
                                    ].map(([l, v]) => (
                                        <div key={l} className="vf">
                                            <div className="vf-l">{l}</div>
                                            <div className="vf-v">{v}</div>
                                        </div>
                                    ))}
                                    <div className="vf">
                                        <div className="vf-l">Role</div>
                                        <span className="rbadge" style={{ background: rc.bg, color: rc.color, borderColor: rc.border }}>{u.role}</span>
                                    </div>
                                    <div className="vf">
                                        <div className="vf-l">Status</div>
                                        <div className="vf-v">
                                            <span className="sdot" style={{ background: u.status === "Active" ? "#16a34a" : "#9ca3af" }} />{u.status}
                                        </div>
                                    </div>
                                </div>
                                {ro && (
                                    <>
                                        <div className="sdiv">Privileges (via {u.role})</div>
                                        {PCFG.map(cfg => {
                                            const p = ro.privs;
                                            let sm;
                                            let ok;
                                            if (cfg.t === "crud") {
                                                const ops = cfg.subs.filter(k => p[cfg.k]?.[k]);
                                                sm = ops.length ? ops.map(k => k[0].toUpperCase() + k.slice(1)).join(", ") : "No access";
                                                ok = ops.length > 0;
                                            } else if (cfg.t === "tgl") {
                                                sm = p[cfg.k] ? "Allowed" : "Denied";
                                                ok = p[cfg.k];
                                            } else {
                                                const sbs = cfg.subs.filter(s => p[cfg.k]?.[s.k]);
                                                sm = sbs.length ? sbs.map(s => s.l).join(", ") : "No access";
                                                ok = sbs.length > 0;
                                            }
                                            return (
                                                <div key={cfg.k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f3f4f6" }}>
                                                    <span style={{ fontSize: 13, fontWeight: 500 }}>{cfg.i} {cfg.l}</span>
                                                    <span className={`ppill${!ok ? " off" : ""}`}>{sm}</span>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            </div>
                            <div className="mfoot">
                                <button className="btn btn-o" onClick={() => setModal(null)}>Close</button>
                                {currentUserPrivs.userMgmt?.edit && (
                                    <button className="btn btn-p" onClick={() => setModal({ type: "editUser", data: u })}>Edit User</button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {modal?.type === "delUser" && (
                <div className="mov" onClick={e => e.target === e.currentTarget && setModal(null)}>
                    <div className="mbox" style={{ maxWidth: 420 }}>
                        <div className="mhdr">
                            <div className="mt">Delete User</div>
                            <button className="mcls" onClick={() => setModal(null)}>x</button>
                        </div>
                        <div className="mbody" style={{ textAlign: "center", padding: "28px 24px" }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑</div>
                            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Delete this user?</div>
                            <div style={{ fontSize: 14, color: "#6b7280" }}>
                                Permanently delete <b>{modal.data.name}</b> ({modal.data.empId}). All access revoked immediately.
                            </div>
                        </div>
                        <div className="mfoot">
                            <button className="btn btn-o" onClick={() => setModal(null)}>Cancel</button>
                            <button className="btn btn-d" onClick={() => handleDeleteUser(modal.data.id, modal.data.name)}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {modal?.type === "statusRole" && (
                <div className="mov" onClick={e => e.target === e.currentTarget && setModal(null)}>
                    <div className="mbox" style={{ maxWidth: 420 }}>
                        <div className="mhdr">
                            <div className="mt">{modal.data.status === "Inactive" ? "Activate" : "Deactivate"} Role</div>
                            <button className="mcls" onClick={() => setModal(null)}>x</button>
                        </div>
                        <div className="mbody" style={{ textAlign: "center", padding: "28px 24px" }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>🛡</div>
                            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                                {modal.data.status === "Inactive" ? "Activate" : "Deactivate"} "{modal.data.name}"?
                            </div>
                            <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.5 }}>
                                {modal.data.status === "Inactive" 
                                    ? "Users assigned to this role will regain access to their privileges."
                                    : `${users.filter(u => u.role === modal.data.name).length} user(s) currently assigned to this role will lose their privileges until reactivated.`}
                            </div>
                        </div>
                        <div className="mfoot">
                            <button className="btn btn-o" onClick={() => setModal(null)}>Cancel</button>
                            <button 
                                className="btn" 
                                style={{ background: modal.data.status === "Inactive" ? "#10b981" : "#dc2626", color: "#fff" }} 
                                onClick={() => handleSaveRole({ ...modal.data, status: modal.data.status === "Inactive" ? "Active" : "Inactive" }, true)}
                                disabled={loading}
                            >
                                {loading ? "Updating..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modal?.type === "addRole" && (
                <RoleFormModal
                    role={{ name: "", code: "", status: "Active", desc: "", color: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe", privs: JSON.parse(JSON.stringify(BLANK_PRIVS)) }}
                    isEdit={false}
                    onClose={() => setModal(null)}
                    onSave={r => handleSaveRole(r, false)}
                    loading={loading}
                />
            )}
            
            {modal?.type === "editRole" && (
                <RoleFormModal
                    role={modal.data}
                    isEdit={true}
                    onClose={() => setModal(null)}
                    onSave={r => handleSaveRole(r, true)}
                    loading={loading}
                />
            )}

            {modal?.type === "viewRole" && (() => {
                const r = modal.data;
                const uc = users.filter(u => u.role === r.name).length;
                return (
                    <div className="mov" onClick={e => e.target === e.currentTarget && setModal(null)}>
                        <div className="mbox" style={{ maxWidth: 640 }}>
                            <div className="mhdr">
                                <div>
                                    <div className="mt">{r.name}</div>
                                    <div className="msub">{r.code} - {r.desc}</div>
                                </div>
                                <button className="mcls" onClick={() => setModal(null)}>x</button>
                            </div>
                            <div className="mbody">
                                <div className="vg">
                                    <div className="vf"><div className="vf-l">Role Name</div><div className="vf-v">{r.name}</div></div>
                                    <div className="vf"><div className="vf-l">Code</div><div className="vf-v" style={{ fontFamily: "monospace", color: "#4f46e5" }}>{r.code}</div></div>
                                    <div className="vf"><div className="vf-l">Users</div><div className="vf-v">{uc}</div></div>
                                    <div className="vf"><div className="vf-l">Created By</div><div className="vf-v">{r.createdBy}</div></div>
                                </div>
                                <div className="sdiv">Privileges ({cntP(r.privs)}/{PCFG.length})</div>
                                {PCFG.map(cfg => {
                                    const p = r.privs;
                                    let sm;
                                    let ok;
                                    if (cfg.t === "crud") {
                                        const ops = cfg.subs.filter(k => p[cfg.k]?.[k]);
                                        sm = ops.length ? ops.map(k => k[0].toUpperCase() + k.slice(1)).join(", ") : "No access";
                                        ok = ops.length > 0;
                                    } else if (cfg.t === "tgl") {
                                        sm = p[cfg.k] ? "Allowed" : "Denied";
                                        ok = p[cfg.k];
                                    } else {
                                        const sbs = cfg.subs.filter(s => p[cfg.k]?.[s.k]);
                                        sm = sbs.length ? sbs.map(s => s.l).join(", ") : "No access";
                                        ok = sbs.length > 0;
                                    }
                                    return (
                                        <div key={cfg.k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                                            <span style={{ fontSize: 13, fontWeight: 500 }}>{cfg.i} {cfg.l}</span>
                                            <span className={`ppill${!ok ? " off" : ""}`}>{sm}</span>
                                        </div>
                                    );
                                })}
                                <div className="sdiv" style={{ marginTop: 16 }}>Users with this Role</div>
                                {users.filter(u => u.role === r.name).length === 0 ? (
                                    <div style={{ color: "#9ca3af", fontSize: 13 }}>No users assigned</div>
                                ) : (
                                    users.filter(u => u.role === r.name).map(u => (
                                        <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                                            <div className="uimg" style={{ width: 28, height: 28, fontSize: 10, background: acol(u.name) }}>{ini(u.name)}</div>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name} <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400 }}>{u.empId}</span></div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="mfoot">
                                <button className="btn btn-o" onClick={() => setModal(null)}>Close</button>
                                {currentUserPrivs.roleMgmt?.edit && (
                                    <button className="btn btn-p" onClick={() => setModal({ type: "editRole", data: r })}>Edit Role</button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {toast && (
                <div className={`toast ${toast.type === "ok" ? "tok" : "terr"}`}>
                    {toast.type === "ok" ? "✅" : "🗑"} {toast.msg}
                </div>
            )}
        </>
    );
}