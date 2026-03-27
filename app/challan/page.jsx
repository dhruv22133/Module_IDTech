'use client';
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

// ══════════════════════════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════════════════════════
const TRANSFER_TYPES = [
  { key:"mfg_vendor",  label:"Manufacturer → Vendor",     from:"manufacturer", to:"vendor",      icon:"🏗️→🏭" },
  { key:"mfg_plant",   label:"Manufacturer → Plant",      from:"manufacturer", to:"plant",       icon:"🏗️→🏢" },
  { key:"vendor_plant",label:"Vendor → Plant",            from:"vendor",       to:"plant",       icon:"🏭→🏢" },
  { key:"vendor_vendor",label:"Vendor → Vendor",          from:"vendor",       to:"vendor",      icon:"🏭→🏭" },
  { key:"vendor_maint",label:"Vendor → Maintenance",      from:"vendor",       to:"maintenance", icon:"🏭→🔧" },
  { key:"plant_vendor",label:"Plant → Vendor",            from:"plant",        to:"vendor",      icon:"🏢→🏭" },
  { key:"plant_plant", label:"Plant → Plant",             from:"plant",        to:"plant",       icon:"🏢→🏢" },
  { key:"plant_maint", label:"Plant → Maintenance",       from:"plant",        to:"maintenance", icon:"🏢→🔧" },
];

const S = {
  "Draft":                { bg:"#f3f4f6",color:"#6b7280",border:"#e5e7eb",dot:"#9ca3af" },
  "Pending Approval":     { bg:"#fffbeb",color:"#d97706",border:"#fde68a",dot:"#f59e0b" },
  "Approved":             { bg:"#f0fdf4",color:"#15803d",border:"#bbf7d0",dot:"#16a34a" },
  "Rejected":             { bg:"#fef2f2",color:"#dc2626",border:"#fecaca",dot:"#ef4444" },
  "In Transit":           { bg:"#fff7ed",color:"#c2410c",border:"#fed7aa",dot:"#f97316" },
  "Receipt Acknowledged": { bg:"#f0f9ff",color:"#0369a1",border:"#bae6fd",dot:"#0891b2" },
  "Closed":               { bg:"#f0fdf4",color:"#166534",border:"#86efac",dot:"#22c55e" },
};

function statusStep(status){
  return { "Draft":0,"Pending Approval":1,"Approved":1,"Rejected":1,
           "In Transit":2,"Receipt Acknowledged":3,"Closed":4 }[status]??0;
}

// ══════════════════════════════════════════════════════════════
//  CSS
// ══════════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#eef0f5;color:#111827;min-height:100vh}
.shell{display:flex;height:100vh;overflow:hidden}
.sb{width:218px;flex-shrink:0;background:linear-gradient(168deg,#3540e8 0%,#5b2be0 50%,#7b2fe8 100%);display:flex;flex-direction:column;overflow:hidden;position:relative}
.sb::before{content:'';position:absolute;top:-90px;right:-80px;width:260px;height:260px;border-radius:50%;background:rgba(255,255,255,.06);pointer-events:none}
.sb::after{content:'';position:absolute;bottom:-70px;left:-60px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.04);pointer-events:none}

.sb-brand{padding:22px 20px 18px;border-bottom:1px solid rgba(255,255,255,0.1);z-index:1;position:relative}
.sb-brand-row{display:flex;align-items:center;gap:10px}
.sb-icon{width:36px;height:36px;background:rgba(255,255,255,0.18);border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sb-name{font-size:14px;font-weight:700;color:#fff}.sb-name span{font-weight:400;opacity:.8}
.sb-sub{font-size:10px;color:rgba(255,255,255,.5);margin-top:1px}

.sb-nav{flex:1;padding:10px 8px;display:flex;flex-direction:column;gap:1px;overflow-y:auto;z-index:1;position:relative}
.sb-sec{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.25);padding:8px 10px 3px}
.sb-link{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:7px;cursor:pointer;color:rgba(255,255,255,.54);font-size:12px;font-weight:500;transition:all .14s;user-select:none}
.sb-link:hover{background:rgba(255,255,255,.1);color:#fff}
.sb-link.on{background:rgba(255,255,255,.17);color:#fff;font-weight:700}
.sb-ico{font-size:13px;flex-shrink:0;width:16px;text-align:center}
.sb-foot{padding:12px 10px;border-top:1px solid rgba(255,255,255,.1);z-index:1;position:relative}
.sb-user{display:flex;align-items:center;gap:8px}
.sb-av{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:700;color:#fff;flex-shrink:0}
.sb-uname{font-size:11px;font-weight:600;color:#fff}
.sb-urole{font-size:9px;color:rgba(255,255,255,.38)}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.topbar{height:54px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;padding:0 22px;flex-shrink:0;box-shadow:0 1px 4px rgba(0,0,0,.05)}
.tb-left{display:flex;align-items:center;gap:8px}
.tb-title{font-size:15.5px;font-weight:800;color:#111827;letter-spacing:-.022em}
.tb-right{display:flex;align-items:center;gap:9px}
.role-sw{display:flex;background:#f3f4f6;border-radius:9px;padding:3px;gap:2px}
.role-btn{height:27px;padding:0 12px;border-radius:6px;font-family:'Plus Jakarta Sans',sans-serif;font-size:11.5px;font-weight:600;cursor:pointer;border:none;background:transparent;color:#6b7280;transition:all .14s}
.role-btn.on{background:#fff;color:#4f46e5;box-shadow:0 1px 4px rgba(0,0,0,.1)}
.tb-notif{width:31px;height:31px;border-radius:7px;border:1.5px solid #e5e7eb;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#6b7280;position:relative}
.tb-ndot{width:6px;height:6px;background:#ef4444;border-radius:50%;position:absolute;top:5px;right:5px;border:1.5px solid #fff}
.tb-pill{display:flex;align-items:center;gap:6px;background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:8px;padding:3px 10px 3px 4px;cursor:pointer}
.tb-tav{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8.5px;font-weight:700;color:#fff}
.tb-nm{font-size:11.5px;font-weight:600;color:#374151}
.content{flex:1;overflow-y:auto;padding:18px 22px 28px}
.stats-row{display:grid;grid-template-columns:repeat(6,1fr);gap:11px;margin-bottom:18px}
.sc{background:#fff;border-radius:11px;border:1px solid #e5e7eb;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,.04);transition:transform .14s,box-shadow .14s;cursor:default}
.sc:hover{transform:translateY(-2px);box-shadow:0 5px 14px rgba(0,0,0,.08)}
.sc-lbl{font-size:9.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#9ca3af;margin-bottom:6px}
.sc-val{font-size:22px;font-weight:800;letter-spacing:-.03em;line-height:1}
.sc-bar{height:2.5px;background:#f3f4f6;border-radius:2px;margin-top:8px;overflow:hidden}
.sc-bar-fill{height:100%;border-radius:2px}
.main-tabs{display:flex;gap:0;background:#fff;border-radius:11px;border:1px solid #e5e7eb;padding:3px;margin-bottom:16px;width:fit-content;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.mtab{height:33px;padding:0 16px;border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12.5px;font-weight:600;cursor:pointer;border:none;background:transparent;color:#6b7280;transition:all .14s;display:flex;align-items:center;gap:6px;white-space:nowrap}
.mtab:hover{color:#4f46e5}
.mtab.on{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;box-shadow:0 3px 10px rgba(79,70,229,.28)}
.toolbar{display:flex;align-items:center;gap:8px;margin-bottom:13px;flex-wrap:wrap}
.srch{flex:1;min-width:200px;max-width:340px;position:relative}
.srch-ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#9ca3af;pointer-events:none}
.srch-inp{width:100%;height:35px;border:1.5px solid #e5e7eb;border-radius:8px;padding:0 12px 0 32px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12.5px;color:#111827;background:#fff;outline:none;transition:border-color .16s}
.srch-inp:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.08)}
.flt{height:35px;border:1.5px solid #e5e7eb;border-radius:8px;padding:0 26px 0 10px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12.5px;color:#374151;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 8px center;appearance:none;outline:none;cursor:pointer}
.btn{display:inline-flex;align-items:center;gap:6px;height:35px;padding:0 15px;border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12.5px;font-weight:600;cursor:pointer;border:none;transition:all .14s;white-space:nowrap}
.btn-p{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;box-shadow:0 4px 12px rgba(91,43,224,.24)}.btn-p:hover{opacity:.92;transform:translateY(-1px)}
.btn-o{background:#fff;color:#374151;border:1.5px solid #e5e7eb}.btn-o:hover{border-color:#6366f1;color:#4f46e5}
.btn-green{background:linear-gradient(135deg,#059669,#047857);color:#fff;box-shadow:0 4px 11px rgba(5,150,105,.24)}.btn-green:hover{opacity:.92}
.btn-red{background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;box-shadow:0 4px 11px rgba(220,38,38,.24)}.btn-red:hover{opacity:.92}
.btn-cyan{background:linear-gradient(135deg,#0891b2,#0e7490);color:#fff;box-shadow:0 4px 11px rgba(8,145,178,.24)}.btn-cyan:hover{opacity:.92}
.btn-amber{background:linear-gradient(135deg,#d97706,#b45309);color:#fff;box-shadow:0 4px 11px rgba(217,119,6,.24)}.btn-amber:hover{opacity:.92}
.btn-sm{height:30px;padding:0 12px;font-size:11.5px}
.tbl-card{background:#fff;border-radius:13px;border:1px solid #e5e7eb;box-shadow:0 1px 5px rgba(0,0,0,.04);overflow:hidden}
.tbl-hdr{padding:12px 17px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between}
.tbl-hdr-l{display:flex;align-items:center;gap:8px}
.tbl-ico{width:27px;height:27px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px}
.tbl-t{font-size:13px;font-weight:700;color:#111827}
.tbl-cnt{font-size:10.5px;font-weight:600;background:#f3f4f6;color:#6b7280;padding:2px 8px;border-radius:20px}
table{width:100%;border-collapse:collapse}
thead th{padding:8px 13px;text-align:left;font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;background:#f9fafb;border-bottom:1px solid #f0f0f0;white-space:nowrap}
tbody td{padding:10px 13px;font-size:12px;color:#374151;border-bottom:1px solid #f3f4f6;vertical-align:middle}
tbody tr:last-child td{border:none}
tbody tr:hover td{background:#fafbff}
tbody tr.pend td{background:#fffdf4}
tbody tr.pend:hover td{background:#fef9e7}
.acts{display:flex;gap:4px}
.act{width:27px;height:27px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;color:#6b7280;transition:all .12s}
.act.v:hover{border-color:#6366f1;color:#4f46e5;background:#eef2ff}
.act.a:hover{border-color:#059669;color:#059669;background:#f0fdf4}
.act.r:hover{border-color:#dc2626;color:#dc2626;background:#fef2f2}
.act.c:hover{border-color:#0891b2;color:#0891b2;background:#e0f2fe}
.pag{display:flex;align-items:center;justify-content:space-between;padding:10px 17px;border-top:1px solid #f3f4f6}
.pag-i{font-size:11.5px;color:#6b7280}
.pag-b{display:flex;gap:3px}
.pgb{width:26px;height:26px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:600;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;color:#374151;transition:all .12s}
.pgb.on{background:#5b2be0;border-color:#5b2be0;color:#fff}
.pgb:hover:not(.on){border-color:#6366f1;color:#4f46e5}
.mo-ov{position:fixed;inset:0;background:rgba(6,10,28,.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:14px;backdrop-filter:blur(5px);animation:moFd .17s ease}
@keyframes moFd{from{opacity:0}to{opacity:1}}
.mo-bx{background:#fff;border-radius:20px;width:100%;max-height:94vh;overflow-y:auto;box-shadow:0 32px 100px rgba(0,0,0,.26);animation:moSl .2s ease}
@keyframes moSl{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.mo-hdr{padding:18px 22px 14px;border-bottom:1px solid #f3f4f6;display:flex;align-items:flex-start;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:5;border-radius:20px 20px 0 0}
.mo-title{font-size:16.5px;font-weight:800;color:#111827;letter-spacing:-.024em}
.mo-sub{font-size:11.5px;color:#6b7280;margin-top:3px}
.mo-cls{width:29px;height:29px;border-radius:7px;border:1.5px solid #e5e7eb;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#6b7280;flex-shrink:0;transition:all .12s}
.mo-cls:hover{border-color:#dc2626;color:#dc2626;background:#fef2f2}
.mo-body{padding:20px 22px}
.mo-foot{padding:13px 22px;border-top:1px solid #f3f4f6;display:flex;justify-content:flex-end;gap:8px;background:#fafafa;border-radius:0 0 20px 20px;position:sticky;bottom:0}
.fsec{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;padding-bottom:7px;border-bottom:1px solid #f0f0f0;margin-bottom:12px}
.frow{display:grid;gap:12px;margin-bottom:12px}
.f2{grid-template-columns:1fr 1fr}
.flbl{display:block;font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#374151;margin-bottom:5px}
.freq{color:#ef4444;margin-left:2px}
.finp,.fsel{height:40px;border:1.5px solid #e5e7eb;border-radius:9px;padding:0 12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12.5px;color:#111827;background:#f9fafb;outline:none;width:100%;transition:border-color .16s,box-shadow .16s}
.finp:focus,.fsel:focus{border-color:#6366f1;background:#fff;box-shadow:0 0 0 3px rgba(99,102,241,.08)}
.fsel{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;background-color:#f9fafb;padding-right:28px}
.fta{border:1.5px solid #e5e7eb;border-radius:9px;padding:9px 12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12.5px;color:#111827;background:#f9fafb;outline:none;width:100%;resize:vertical;min-height:66px}
.fta:focus{border-color:#6366f1;background:#fff;box-shadow:0 0 0 3px rgba(99,102,241,.08)}
.fhint{font-size:10px;color:#9ca3af;margin-top:3px}
.ferr{font-size:10px;color:#ef4444;margin-top:3px}
.mould-search-wrap{position:relative}
.mould-dropdown{position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1.5px solid #e5e7eb;border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,.14);z-index:20;max-height:220px;overflow-y:auto}
.mould-opt{padding:9px 12px;cursor:pointer;transition:background .12s;border-bottom:1px solid #f3f4f6}
.mould-opt:hover{background:#f5f3ff}
.mould-opt-id{font-size:11px;font-weight:700;color:#4338ca;font-family:monospace}
.mould-opt-name{font-size:12.5px;font-weight:600;color:#111827;margin-top:1px}
.mould-opt-loc{font-size:10.5px;color:#9ca3af;margin-top:1px}
.mould-selected{background:#f0f4ff;border:1.5px solid #c7d2fe;border-radius:10px;padding:10px 13px;margin-top:8px;display:flex;align-items:center;justify-content:space-between}
.ms-id{font-size:10.5px;font-weight:700;color:#4338ca;font-family:monospace}
.ms-name{font-size:13px;font-weight:700;color:#111827}
.ms-loc{font-size:11px;color:#6b7280;margin-top:2px}
.ms-clear{width:22px;height:22px;border-radius:5px;background:rgba(220,38,38,.1);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#dc2626;font-size:12px;font-weight:700}
.tt-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px}
.tt-card{border:1.5px solid #e5e7eb;border-radius:10px;padding:10px 12px;cursor:pointer;transition:all .14s;background:#fafafa}
.tt-card:hover{border-color:#a5b4fc;background:#f5f3ff}
.tt-card.on{border-color:#6366f1;background:#eef2ff;box-shadow:0 0 0 3px rgba(99,102,241,.1)}
.tt-icon{font-size:15px;margin-bottom:5px}
.tt-label{font-size:11px;font-weight:700;color:#374151;line-height:1.35}
.tt-card.on .tt-label{color:#4338ca}
.img-upload-zone{border:2px dashed #c7d2fe;border-radius:12px;padding:20px;text-align:center;cursor:pointer;transition:all .15s;background:#fafbff}
.img-upload-zone:hover{border-color:#6366f1;background:#f0f4ff}
.iuz-ico{font-size:28px;margin-bottom:8px}
.iuz-title{font-size:13px;font-weight:700;color:#374151;margin-bottom:3px}
.iuz-sub{font-size:11.5px;color:#9ca3af}
.img-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}
.img-thumb{position:relative;border-radius:8px;overflow:hidden;aspect-ratio:1;background:#f3f4f6}
.img-thumb img{width:100%;height:100%;object-fit:cover}
.img-rm{position:absolute;top:4px;right:4px;width:18px;height:18px;border-radius:4px;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;font-size:10px}
.img-thumb-label{position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.6);color:#fff;font-size:9px;padding:3px 5px}
.wf-wrap{background:#fff;border-radius:13px;border:1px solid #e5e7eb;padding:16px 20px;margin-bottom:16px}
.wf-inner{display:flex;align-items:center}
.wf-step{display:flex;align-items:center;gap:7px}
.wf-circle{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;transition:all .2s}
.wf-c-done{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;box-shadow:0 3px 9px rgba(79,70,229,.35)}
.wf-c-active{background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;box-shadow:0 3px 9px rgba(245,158,11,.35);animation:pulse 2s infinite}
.wf-c-pend{background:#f3f4f6;color:#9ca3af;border:1.5px solid #e5e7eb}
.wf-c-appr{background:linear-gradient(135deg,#059669,#047857);color:#fff;box-shadow:0 3px 9px rgba(5,150,105,.28)}
.wf-c-rej{background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff}
.wf-c-transit{background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;box-shadow:0 3px 9px rgba(249,115,22,.28)}
.wf-c-closed{background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;box-shadow:0 3px 9px rgba(34,197,94,.28)}
@keyframes pulse{0%,100%{box-shadow:0 3px 9px rgba(245,158,11,.35)}50%{box-shadow:0 3px 18px rgba(245,158,11,.6)}}
.wf-lbl{font-size:11.5px;font-weight:700;color:#374151}
.wf-role{font-size:9.5px;color:#9ca3af}
.wf-line{flex:1;height:2px;background:#e5e7eb;margin:0 6px;min-width:14px}
.wf-line.done{background:linear-gradient(90deg,#4f46e5,#7c3aed)}
.dc{background:#f9fafb;border-radius:11px;border:1px solid #f0f0f0;padding:14px 16px;margin-bottom:14px}
.dg4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px}
.dlbl{font-size:9.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#9ca3af;margin-bottom:3px}
.dval{font-size:12.5px;font-weight:600;color:#111827}
.mono-badge{font-family:monospace;font-size:12px;font-weight:700;background:#eef2ff;color:#4338ca;padding:2px 8px;border-radius:5px}
.route-card{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;margin-bottom:14px}
.route-node{border-radius:10px;padding:11px 14px;border:1.5px solid}
.route-node.from{background:#f0f4ff;border-color:#c7d2fe}
.route-node.to{background:#f0fdf4;border-color:#bbf7d0}
.route-type{font-size:9.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#9ca3af;margin-bottom:3px}
.route-name{font-size:13.5px;font-weight:700;color:#111827}
.route-code{font-size:10.5px;color:#6b7280;margin-top:1px}
.route-arrow{font-size:24px;color:#9ca3af;text-align:center;font-weight:300}
.uchip{display:inline-flex;align-items:center;gap:6px;background:#f0f4ff;border:1px solid #c7d2fe;border-radius:7px;padding:4px 9px 4px 5px}
.uav{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#fff}
.uname{font-size:11.5px;font-weight:600;color:#374151}
.urole{font-size:9.5px;color:#6b7280}
.tl{display:flex;flex-direction:column;gap:0}
.tl-item{display:flex;gap:12px;position:relative}
.tl-item:not(:last-child)::after{content:'';position:absolute;left:11px;top:28px;bottom:-4px;width:1.5px;background:#e5e7eb}
.tl-dot{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;z-index:1;margin-top:3px}
.tl-body{padding-bottom:14px;flex:1}
.tl-event{font-size:12.5px;font-weight:700;color:#111827}
.tl-by{font-size:11px;color:#6b7280;margin-top:1px}
.tl-note{font-size:11.5px;color:#374151;margin-top:3px;background:#fafafa;border-radius:6px;padding:5px 8px;border:1px solid #f0f0f0}
.ap{border-radius:12px;padding:14px 16px;margin-bottom:14px;border:1px solid}
.ap.amber{background:#fffbeb;border-color:#fde68a}
.ap.green{background:#f0fdf4;border-color:#bbf7d0}
.ap.red{background:#fef2f2;border-color:#fecaca}
.ap.blue{background:#eef2ff;border-color:#c7d2fe}
.ap.cyan{background:#e0f2fe;border-color:#bae6fd}
.ap-title{font-size:13px;font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:7px}
.ap-btns{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.chl-doc{border:2px solid #e5e7eb;border-radius:16px;overflow:hidden;background:#fff}
.chl-hdr{background:linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#3730a3 100%);color:#fff;padding:18px 22px;display:flex;align-items:center;justify-content:space-between}
.chl-logo{font-size:18px;font-weight:800;letter-spacing:-.025em}
.chl-no-badge{font-size:12.5px;font-weight:700;background:rgba(255,255,255,.15);padding:5px 12px;border-radius:7px;font-family:monospace}
.chl-body{padding:20px 22px}
.chl-sec{margin-bottom:16px}
.chl-sec-t{font-size:9.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#6b7280;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid #f0f0f0}
.chl-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.chl-field .cfl{font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px}
.chl-field .cfv{font-size:12.5px;font-weight:600;color:#111827}
.chl-foot{background:#f9fafb;border-top:1px solid #e5e7eb;padding:14px 22px;display:flex;align-items:center;justify-content:space-between}
.chl-sig{text-align:center}
.chl-sig-line{width:90px;border-top:1.5px solid #374151;margin-bottom:3px}
.chl-sig-lbl{font-size:9.5px;color:#6b7280;font-weight:600}
.chl-sig-name{font-size:11px;font-weight:600;color:#374151;margin-top:2px}
.chl-stamp{width:54px;height:54px;border-radius:50%;border:2.5px solid #15803d;display:flex;align-items:center;justify-content:center;color:#15803d;font-size:8.5px;font-weight:800;text-align:center;padding:5px}
.empty{padding:44px;text-align:center;color:#9ca3af}
.empty-ico{font-size:34px;margin-bottom:10px;opacity:.5}
.empty-t{font-size:13px;font-weight:600;color:#6b7280;margin-bottom:3px}
.badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;border:1px solid;white-space:nowrap}
.badge-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.tt-badge{font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:5px;background:#f5f3ff;color:#6d28d9;border:1px solid #ddd6fe;white-space:nowrap}
.role-badge{font-size:10px;font-weight:700;padding:1px 7px;border-radius:10px}
.toast{position:fixed;bottom:20px;right:20px;background:#1f2937;color:#fff;padding:11px 17px;border-radius:12px;font-size:12.5px;font-weight:500;z-index:4000;display:flex;align-items:center;gap:8px;box-shadow:0 8px 28px rgba(0,0,0,.26);animation:tIn .24s ease}
@keyframes tIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.t-ok{border-left:4px solid #10b981}
.t-err{border-left:4px solid #ef4444}
.fade-in{animation:fadeUp .28s ease both}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

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
function bgFor(s){if(!s)return "#4f46e5";const c=["#4f46e5","#0891b2","#059669","#d97706","#dc2626","#7c3aed","#0d9488","#b45309"];let h=0;for(let i=0;i<s.length;i++)h=s.charCodeAt(i)+((h<<5)-h);return c[Math.abs(h)%c.length];}

function StatusBadge({status}){
  const c=S[status]||S["Draft"];
  return <span className="badge" style={{background:c.bg,color:c.color,borderColor:c.border}}>
    <span className="badge-dot" style={{background:c.dot}}/>{status}
  </span>;
}

function useToast(){
  const [t,setT]=useState(null);
  const show=(msg,type="ok")=>{setT({msg,type});setTimeout(()=>setT(null),3500);};
  const node=t&&<div className={`toast t-${t.type}`}>{t.type==="ok"?"✅":t.type==="err"?"❌":"ℹ️"} {t.msg}</div>;
  return[show,node];
}

function Pager({page,pages,total,per,set}){
  if(pages<=1)return null;
  const from=(page-1)*per+1,to=Math.min(page*per,total);
  return <div className="pag">
    <span className="pag-i">Showing {from}–{to} of {total}</span>
    <div className="pag-b">
      <button className="pgb" onClick={()=>set(p=>Math.max(1,p-1))} disabled={page===1}>‹</button>
      {Array.from({length:pages},(_,i)=>i+1).map(p=><button key={p} className={`pgb${p===page?" on":""}`} onClick={()=>set(p)}>{p}</button>)}
      <button className="pgb" onClick={()=>set(p=>Math.min(pages,p+1))} disabled={page===pages}>›</button>
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  WORKFLOW STEPPER
// ══════════════════════════════════════════════════════════════
function WorkflowStepper({status}){
  const step=statusStep(status);
  const isRej=status==="Rejected";
  const getClass=(i)=>{
    if(isRej&&i===1)return "wf-c-rej";
    if(i<step)return "wf-c-done";
    if(i===step){
      if(status==="Approved")return "wf-c-appr";
      if(status==="In Transit")return "wf-c-transit";
      if(status==="Receipt Acknowledged")return "wf-c-done";
      if(status==="Closed")return "wf-c-closed";
      return "wf-c-active";
    }
    return "wf-c-pend";
  };
  const icons=["📋","✅","🚚","📬","🔒"];
  const labels=["Initiated","Approved","In Transit","Receipt Ack","Closed"];
  const roles=["Maker","Approver","Maker/System","Approver","System"];
  return <div className="wf-wrap">
    <div style={{fontSize:10.5,fontWeight:700,letterSpacing:".07em",textTransform:"uppercase",color:"#9ca3af",marginBottom:12}}>Workflow Progress</div>
    <div className="wf-inner">
      {labels.map((lbl,i)=><div key={lbl} style={{display:"flex",alignItems:"center",flex:i<labels.length-1?1:"initial"}}>
        <div className="wf-step">
          <div className={`wf-circle ${getClass(i)}`}>{i<step||(i===step&&status!=="Pending Approval")?icons[i]:i+1}</div>
          <div><div className="wf-lbl" style={{color:isRej&&i===1?"#dc2626":undefined}}>{lbl}</div><div className="wf-role">{roles[i]}</div></div>
        </div>
        {i<labels.length-1&&<div className={`wf-line${i<step?" done":""}`}/>}
      </div>)}
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  MOULD SEARCH COMPONENT
// ══════════════════════════════════════════════════════════════
function MouldSearch({value, onChange, error, mouldsDb}) {
  const [q,setQ] = useState("");
  const [open,setOpen] = useState(false);
  const selected = mouldsDb.find(m => m.id === value);
  const results = mouldsDb.filter(m => !q || (m.id.toLowerCase().includes(q.toLowerCase()) || m.name.toLowerCase().includes(q.toLowerCase())));
  
  return <div className="mould-search-wrap">
    {!selected ? <>
      <input className={`finp${error?" err":""}`} value={q} placeholder="Search by mould ID or name…"
        onChange={e=>{setQ(e.target.value);setOpen(true);}}
        onFocus={()=>setOpen(true)}
        onBlur={()=>setTimeout(()=>setOpen(false),180)}/>
      {open && results.length > 0 && <div className="mould-dropdown">
        {results.map(m => <div key={m.id} className="mould-opt" onMouseDown={() => {onChange(m.id);setQ("");setOpen(false);}}>
          <div className="mould-opt-id">{m.id}</div>
          <div className="mould-opt-name">{m.name}</div>
          <div className="mould-opt-loc">📍 {m.locationName} · {m.type}</div>
        </div>)}
      </div>}
    </> : <div className="mould-selected">
      <div className="ms-info">
        <div className="ms-id">{selected.id}</div>
        <div className="ms-name">{selected.name}</div>
        <div className="ms-loc">📍 {selected.locationName} · {selected.type}</div>
      </div>
      <div className="ms-clear" onClick={()=>onChange("")} title="Clear">✕</div>
    </div>}
    {error && <div className="ferr">{error}</div>}
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  IMAGE UPLOAD COMPONENT
// ══════════════════════════════════════════════════════════════
function ImageUpload({images,onChange}){
  const inputRef=useRef(null);
  const [drag,setDrag]=useState(false);
  const handleFiles=useCallback((files)=>{
    const arr=[...files].filter(f=>f.type.startsWith("image/") || f.type === "application/pdf");
    
    const newImgs = arr.map(file => ({
        file: file,
        url: URL.createObjectURL(file),
        name: file.name
    }));
    
    onChange([...images, ...newImgs]);
  },[images,onChange]);
  
  return <div>
    <div className={`img-upload-zone${drag?" drag":""}`}
      onClick={()=>inputRef.current?.click()}
      onDragOver={e=>{e.preventDefault();setDrag(true);}}
      onDragLeave={()=>setDrag(false)}
      onDrop={e=>{e.preventDefault();setDrag(false);handleFiles(e.dataTransfer.files);}}>
      <div className="iuz-ico">📎</div>
      <div className="iuz-title">Upload Challan / Documents</div>
      <div className="iuz-sub">Drag & drop or click to browse · JPG, PNG, PDF accepted</div>
      <input ref={inputRef} type="file" accept="image/*,.pdf" multiple style={{display:"none"}}
        onChange={e=>handleFiles(e.target.files)}/>
    </div>
    {images.length>0&&<div className="img-grid">
      {images.map((img,i)=><div key={i} className="img-thumb">
        {img.name.toLowerCase().endsWith('.pdf') 
            ? <div style={{width:'100%', height:'100%', background:'#eef2ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24}}>📄</div>
            : <img src={img.url} alt={img.name}/>}
        <div className="img-rm" onClick={()=>onChange(images.filter((_,j)=>j!==i))}>✕</div>
        <div className="img-thumb-label">{img.name}</div>
      </div>)}
    </div>}
    {images.length>0&&<div className="fhint">{images.length} file{images.length>1?"s":""} attached</div>}
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  CHALLAN DOCUMENT
// ══════════════════════════════════════════════════════════════
function ChallanDoc({tr}){
  const today=new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"});
  return <div className="chl-doc">
    <div className="chl-hdr">
      <div>
        <div className="chl-logo">MouldSys <span>Enterprise</span></div>
        <div style={{fontSize:10.5,opacity:.55,marginTop:2}}>Mould Transfer Challan · Asset Movement Document</div>
      </div>
      <div style={{textAlign:"right"}}>
        <div className="chl-no-badge">{tr.challanNo}</div>
        <div style={{fontSize:10.5,opacity:.55,marginTop:3}}>Date: {today}</div>
      </div>
    </div>
    <div className="chl-body">
      <div className="chl-sec">
        <div className="chl-sec-t">Transfer Reference</div>
        <div className="chl-grid">
          <div className="chl-field"><div className="cfl">Transfer ID</div><div className="cfv" style={{fontFamily:"monospace",color:"#4338ca"}}>{tr.id}</div></div>
          <div className="chl-field"><div className="cfl">Challan No.</div><div className="cfv" style={{fontFamily:"monospace",color:"#4338ca"}}>{tr.challanNo}</div></div>
          <div className="chl-field"><div className="cfl">Transfer Type</div><div className="cfv">{TRANSFER_TYPES.find(t=>t.key===tr.transferType)?.label||tr.transferType}</div></div>
          <div className="chl-field"><div className="cfl">Reason</div><div className="cfv">{tr.reason}</div></div>
        </div>
      </div>
      <div className="chl-sec">
        <div className="chl-sec-t">Mould Details</div>
        <div className="chl-grid">
          <div className="chl-field"><div className="cfl">Mould ID</div><div className="cfv" style={{fontFamily:"monospace",color:"#4338ca"}}>{tr.mouldId}</div></div>
          <div className="chl-field"><div className="cfl">Mould Name</div><div className="cfv">{tr.mouldName}</div></div>
          <div className="chl-field"><div className="cfl">Mould Type</div><div className="cfv">{tr.mouldType}</div></div>
          <div className="chl-field"><div className="cfl">Expected Return</div><div className="cfv">{tr.expectedReturn||"N/A"}</div></div>
        </div>
      </div>
      <div className="chl-sec">
        <div className="chl-sec-t">Dispatch Information</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:10,alignItems:"center",marginBottom:10}}>
          <div style={{background:"#f0f4ff",borderRadius:9,padding:"10px 13px",border:"1px solid #c7d2fe"}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:".07em",textTransform:"uppercase",color:"#6b7280",marginBottom:3}}>From</div>
            <div style={{fontSize:13.5,fontWeight:700,color:"#111827"}}>{tr.fromName}</div>
            <div style={{fontSize:10.5,color:"#9ca3af",marginTop:2,textTransform:"capitalize"}}>{tr.fromType}</div>
          </div>
          <div style={{fontSize:22,color:"#9ca3af",fontWeight:300,padding:"0 8px",textAlign:"center"}}>→</div>
          <div style={{background:"#f0fdf4",borderRadius:9,padding:"10px 13px",border:"1px solid #bbf7d0"}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:".07em",textTransform:"uppercase",color:"#6b7280",marginBottom:3}}>To</div>
            <div style={{fontSize:13.5,fontWeight:700,color:"#111827"}}>{tr.toName}</div>
            <div style={{fontSize:10.5,color:"#9ca3af",marginTop:2,textTransform:"capitalize"}}>{tr.toType}</div>
          </div>
        </div>
        <div className="chl-grid" style={{gridTemplateColumns:"1fr 1fr 1fr"}}>
          <div className="chl-field"><div className="cfl">Vehicle No.</div><div className="cfv">{tr.vehicleNo||"—"}</div></div>
          <div className="chl-field"><div className="cfl">Consignment No.</div><div className="cfv">{tr.consignmentNo||"—"}</div></div>
          <div className="chl-field"><div className="cfl">Initiated By</div><div className="cfv">{tr.maker?.name||"—"}</div></div>
        </div>
      </div>
      {tr.remarks&&<div className="chl-sec">
        <div className="chl-sec-t">Remarks</div>
        <div style={{fontSize:12.5,color:"#374151",background:"#f9fafb",border:"1px solid #f0f0f0",borderRadius:8,padding:"9px 13px",lineHeight:1.6}}>{tr.remarks}</div>
      </div>}
      {tr.challanImages?.length>0&&<div className="chl-sec">
        <div className="chl-sec-t">Attached Documents ({tr.challanImages.length})</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:10}}>
          {tr.challanImages.map((img,i)=>(
              <a key={i} href={img.url} target="_blank" rel="noopener noreferrer">
                {img.name.toLowerCase().endsWith('.pdf')
                    ? <div style={{width:80, height:60, background:'#eef2ff', borderRadius:7, border:"1.5px solid #e5e7eb", display:'flex', alignItems:'center', justifyContent:'center', fontSize:20}}>📄</div>
                    : <img src={img.url} alt={img.name} style={{width:80,height:60,objectFit:"cover",borderRadius:7,border:"1.5px solid #e5e7eb"}}/>
                }
              </a>
          ))}
        </div>
      </div>}
    </div>
    <div className="chl-foot">
      <div className="chl-sig"><div className="chl-sig-line"/><div className="chl-sig-lbl">Maker (Initiator)</div><div className="chl-sig-name">{tr.maker?.name||"—"}</div></div>
      <div className="chl-stamp">APPROVED &amp; ISSUED</div>
      <div className="chl-sig" style={{textAlign:"right"}}><div className="chl-sig-line" style={{marginLeft:"auto"}}/><div className="chl-sig-lbl">Authorised By</div><div className="chl-sig-name">{tr.approver?.name||"—"}</div></div>
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  NEW TRANSFER MODAL
// ══════════════════════════════════════════════════════════════
function NewTransferModal({ onClose, onSubmit, currentUser, mouldsDb, vendorsDb, mfgDb, plantsDb, reasonsDb }) {
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({
    mouldId:"",transferType:"",fromType:"",fromCode:"",fromName:"",
    toType:"",toCode:"",toName:"",reason:"",expectedReturn:"",
    vehicleNo:"",consignmentNo:"",remarks:"",challanImages:[]
  });
  const [errs,setErrs]=useState({});
  const sf=(k,v)=>setForm(f=>({...f,[k]:v}));

  const selectedMould = mouldsDb.find(m => m.id === form.mouldId);

  const selectTransferType=(tt)=>{
    sf("transferType",tt.key);
    sf("fromType",tt.from);
    sf("toType",tt.to);
    sf("fromCode",""); sf("fromName","");
    sf("toCode",""); sf("toName","");
  };

  const getFromOptions=()=>{
    if(form.fromType==="manufacturer") return mfgDb;
    if(form.fromType==="vendor") return vendorsDb;
    if(form.fromType==="plant") return plantsDb;
    return [];
  };
  const getToOptions=()=>{
    if(form.toType==="vendor") return vendorsDb;
    if(form.toType==="plant") return plantsDb;
    if(form.toType==="manufacturer") return mfgDb;
    return [];
  };

  const validate1=()=>{const e={};if(!form.mouldId)e.mouldId="Select a mould";if(!form.transferType)e.transferType="Select transfer type";return e;};
  const validate2=()=>{
    const e={};
    if(!form.fromName)e.fromName="Required";
    if(form.toType!=="maintenance"&&!form.toName)e.toName="Required";
    if(!form.reason)e.reason="Select reason";
    return e;
  };

  const next=()=>{
    if(step===1){const e=validate1();if(Object.keys(e).length){setErrs(e);return;}setErrs({});}
    if(step===2){const e=validate2();if(Object.keys(e).length){setErrs(e);return;}setErrs({});}
    setStep(s=>s+1);
  };

  const submit=(isDraft)=>{
    const randomSuffix = String(Math.floor(Math.random()*9000)+1000);
    const challanNo = `CHN-2026-${randomSuffix}`;
    const transferId = `TRF-2026-${randomSuffix}`;
    const now=new Date().toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
    
    const t={
      id: transferId,
      challanNo,
      mouldId:form.mouldId,
      mouldName:selectedMould?.name||"",
      mouldType:selectedMould?.type||"",
      transferType:form.transferType,
      fromType:form.fromType,fromName:form.fromName,fromCode:form.fromCode,
      toType:form.toType,
      toName:form.toType==="maintenance"?`${form.fromName} – Maintenance Bay`:form.toName,
      toCode:form.toCode,
      reason:form.reason,expectedReturn:form.expectedReturn,
      vehicleNo:form.vehicleNo,consignmentNo:form.consignmentNo,
      remarks:form.remarks,
      challanImages:form.challanImages, 
      status:isDraft?"Draft":"Pending Approval",
      maker:{ name: currentUser.name, avatar: currentUser.avatar },
      approver:null,approvalRemark:"",
      timeline:[{event:isDraft?"Draft Saved":"Transfer Initiated",by:currentUser.name,at:now,note:isDraft?"Saved as draft":"Submitted for approval"}]
    };
    onSubmit(t,isDraft);
  };

  const stepLabels=["Mould & Type","Transfer Details","Logistics & Docs"];

  return <div className="mo-ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div className="mo-bx" style={{maxWidth:700}}>
      <div className="mo-hdr">
        <div>
          <div className="mo-title">🔄 Initiate Mould Transfer</div>
          <div className="mo-sub">
            {stepLabels.map((l,i)=><span key={l} style={{marginRight:8,color:i+1===step?"#4f46e5":i+1<step?"#059669":"#9ca3af",fontWeight:i+1===step?700:500}}>
              {i+1<step?"✓ ":""}{i+1}. {l}{i<2?" → ":""}
            </span>)}
          </div>
        </div>
        <button className="mo-cls" onClick={onClose}>✕</button>
      </div>

      <div className="mo-body">
        <div style={{display:"flex",gap:4,marginBottom:18}}>
          {[1,2,3].map(s=><div key={s} style={{flex:1,height:3,borderRadius:2,background:s<=step?"#4f46e5":"#e5e7eb",transition:"background .3s"}}/>)}
        </div>

        {step===1&&<div className="fade-in">
          <div className="fsec">🔩 Select Mould</div>
          <MouldSearch value={form.mouldId} onChange={v=>sf("mouldId",v)} error={errs.mouldId} mouldsDb={mouldsDb}/>
          <div className="fsec" style={{marginTop:18}}>🔀 Transfer Type</div>
          <div className="tt-grid">
            {TRANSFER_TYPES.map(tt=><div key={tt.key} className={`tt-card${form.transferType===tt.key?" on":""}`}
              onClick={()=>selectTransferType(tt)}>
              <div className="tt-icon">{tt.icon}</div>
              <div className="tt-label">{tt.label}</div>
            </div>)}
          </div>
          {errs.transferType&&<div className="ferr">{errs.transferType}</div>}
        </div>}

        {step===2&&<div className="fade-in">
          <div className="fsec">📍 From → To</div>
          <div style={{marginBottom:12}}>
            <label className="flbl">From: {form.fromType==="manufacturer"?"Manufacturer":form.fromType==="vendor"?"Vendor":"Plant"}<span className="freq">*</span></label>
            {form.fromType==="maintenance"
              ?<div style={{background:"#f9fafb",border:"1.5px solid #e5e7eb",borderRadius:9,padding:"10px 12px",fontSize:12.5,color:"#6b7280"}}>Current plant / location</div>
              :<select className={`fsel${errs.fromName?" err":""}`}
                value={form.fromCode}
                onChange={e=>{
                  const opts=getFromOptions();
                  const found=opts.find(o=>o.code===e.target.value);
                  sf("fromCode",e.target.value);
                  sf("fromName",found?.name||e.target.value);
                }}>
                <option value="">— Select {form.fromType} —</option>
                {getFromOptions().map(o=><option key={o.code} value={o.code}>{o.name}</option>)}
              </select>
            }
            {errs.fromName&&<div className="ferr">{errs.fromName}</div>}
          </div>

          {form.toType!=="maintenance"?<div style={{marginBottom:12}}>
            <label className="flbl">To: {form.toType==="vendor"?"Vendor":form.toType==="plant"?"Plant":"Manufacturer"}<span className="freq">*</span></label>
            <select className={`fsel${errs.toName?" err":""}`}
              value={form.toCode}
              onChange={e=>{
                const opts=getToOptions();
                const found=opts.find(o=>o.code===e.target.value);
                sf("toCode",e.target.value);
                sf("toName",found?.name||e.target.value);
              }}>
              <option value="">— Select {form.toType} —</option>
              {getToOptions().map(o=><option key={o.code} value={o.code}>{o.name}</option>)}
            </select>
            {errs.toName&&<div className="ferr">{errs.toName}</div>}
          </div>:<div style={{background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:9,padding:"10px 13px",fontSize:12.5,color:"#92400e",marginBottom:12}}>
            🔧 Destination: <strong>Maintenance Bay</strong> at the source plant
          </div>}

          <div className="frow f2">
            <div>
              <label className="flbl">Transfer Reason<span className="freq">*</span></label>
              <select className={`fsel${errs.reason?" err":""}`} value={form.reason} onChange={e=>sf("reason",e.target.value)}>
                <option value="">— Select Reason —</option>
                {reasonsDb.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
              {errs.reason&&<div className="ferr">{errs.reason}</div>}
            </div>
            <div>
              <label className="flbl">Expected Return Date</label>
              <input type="date" className="finp" value={form.expectedReturn} onChange={e=>sf("expectedReturn",e.target.value)}/>
              <div className="fhint">Leave blank for permanent transfers</div>
            </div>
          </div>

          <div>
            <label className="flbl">Remarks</label>
            <textarea className="fta" value={form.remarks} placeholder="Purpose, special instructions or notes for the approver…" onChange={e=>sf("remarks",e.target.value)} rows={2}/>
          </div>
        </div>}

        {step===3&&<div className="fade-in">
          <div className="fsec">🚛 Transport Details</div>
          <div className="frow f2">
            <div>
              <label className="flbl">Transporter Vehicle No.</label>
              <input className="finp" value={form.vehicleNo} placeholder="e.g. MH-12-AB-4567" onChange={e=>sf("vehicleNo",e.target.value)}/>
            </div>
            <div>
              <label className="flbl">Consignment / LR No.</label>
              <input className="finp" value={form.consignmentNo} placeholder="e.g. CONS-20250304-001" onChange={e=>sf("consignmentNo",e.target.value)}/>
            </div>
          </div>

          <div style={{background:"#eef2ff",border:"1px solid #c7d2fe",borderRadius:9,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:17}}>📄</span>
            <div>
              <div style={{fontSize:11.5,fontWeight:700,color:"#4338ca"}}>Challan No. will be auto-generated</div>
              <div style={{fontSize:11,color:"#6366f1"}}>Format: CHN-YYYY-XXXX · Issued on submission</div>
            </div>
          </div>

          <div className="fsec">📎 Attach Documents / Challan Images</div>
          <ImageUpload images={form.challanImages} onChange={v=>sf("challanImages",v)}/>

          {form.mouldId&&form.transferType&&<div style={{marginTop:16}}>
            <div className="fsec">📋 Transfer Summary</div>
            <div style={{background:"#f9fafb",border:"1px solid #f0f0f0",borderRadius:10,padding:"12px 14px"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9}}>
                <div><div style={{fontSize:9.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",color:"#9ca3af",marginBottom:2}}>Mould</div><div style={{fontSize:12.5,fontWeight:700,color:"#111827"}}>{selectedMould?.name}</div><div style={{fontSize:10.5,color:"#9ca3af"}}>{form.mouldId}</div></div>
                <div><div style={{fontSize:9.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",color:"#9ca3af",marginBottom:2}}>Route</div><div style={{fontSize:12,fontWeight:600,color:"#374151"}}>{form.fromName||"—"} → {form.toType==="maintenance"?"Maint. Bay":form.toName||"—"}</div></div>
                <div><div style={{fontSize:9.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",color:"#9ca3af",marginBottom:2}}>Reason</div><div style={{fontSize:12.5,fontWeight:700,color:"#d97706"}}>{form.reason||"—"}</div></div>
              </div>
            </div>
          </div>}
        </div>}
      </div>

      <div className="mo-foot">
        <button className="btn btn-o" onClick={step>1?()=>setStep(s=>s-1):onClose}>{step>1?"← Back":"Cancel"}</button>
        {step<3?<button className="btn btn-p" onClick={next}>Next Step →</button>
          :<>
            <button className="btn btn-o" style={{borderColor:"#9ca3af",color:"#6b7280"}} onClick={()=>submit(true)}>Save Draft</button>
            <button className="btn btn-p" onClick={()=>submit(false)}>Submit for Approval →</button>
          </>}
      </div>
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  VIEW / ACTION MODAL
// ══════════════════════════════════════════════════════════════
function ViewModal({transfer:initTr,allTransfers,onClose,onUpdate,isMaker,isApprover,currentUser}){
  const tr=allTransfers.find(t=>t.id===initTr.id)||initTr;
  const [mode,setMode]=useState("view");
  const [remark,setRemark]=useState("");
  const [remarkErr,setRemarkErr]=useState("");
  const [showChallan,setShowChallan]=useState(false);

  const canApprove=isApprover&&tr.status==="Pending Approval";
  const canMarkTransit=isMaker&&tr.status==="Approved";
  const canAcknowledge=isApprover&&tr.status==="In Transit";
  const canClose=isApprover&&tr.status==="Receipt Acknowledged";
  const canViewChallan=tr.challanNo;

  const now=()=>new Date().toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
  const addTimeline=(event,note)=>[...(tr.timeline||[]),{event,by:currentUser.name,at:now(),note}];

  const doApprove=()=>{
    if(!remark.trim()){setRemarkErr("Approval remark is required");return;}
    onUpdate(tr.id,{status:"Approved",approver:currentUser,approvalRemark:remark,timeline:addTimeline("Approved",remark)});
    onClose();
  };
  const doReject=()=>{
    if(!remark.trim()){setRemarkErr("Rejection reason is required");return;}
    onUpdate(tr.id,{status:"Rejected",approver:currentUser,approvalRemark:remark,timeline:addTimeline("Rejected",remark)});
    onClose();
  };
  const doTransit=()=>{
    onUpdate(tr.id,{status:"In Transit",timeline:addTimeline("In Transit","Mould dispatched / in transit")});
    onClose();
  };
  const doAcknowledge=()=>{
    if(!remark.trim()){setRemarkErr("Acknowledgement note required");return;}
    onUpdate(tr.id,{status:"Receipt Acknowledged",timeline:addTimeline("Receipt Acknowledged",remark)});
    onClose();
  };
  const doClose=()=>{
    onUpdate(tr.id,{status:"Closed",timeline:addTimeline("Closed","Transfer closed successfully")});
    onClose();
  };

  const ttLabel=TRANSFER_TYPES.find(t=>t.key===tr.transferType)?.label||tr.transferType;

  if(showChallan) return <div className="mo-ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div className="mo-bx" style={{maxWidth:720}}>
      <div className="mo-hdr">
        <div><div className="mo-title">📄 {tr.challanNo}</div><div className="mo-sub">Transfer Challan Document</div></div>
        <button className="mo-cls" onClick={()=>setShowChallan(false)}>✕</button>
      </div>
      <div className="mo-body"><ChallanDoc tr={tr}/></div>
      <div className="mo-foot">
        <button className="btn btn-o" onClick={()=>setShowChallan(false)}>← Back</button>
        <button className="btn btn-o">🖨️ Print</button>
        <button className="btn btn-cyan">⬇️ Download PDF</button>
      </div>
    </div>
  </div>;

  return <div className="mo-ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div className="mo-bx" style={{maxWidth:720}}>
      <div className="mo-hdr">
        <div>
          <div className="mo-title">Transfer · {tr.id}</div>
          <div className="mo-sub" style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
            <StatusBadge status={tr.status}/>
            <span style={{color:"#d1d5db"}}>·</span>
            <span className="tt-badge">{ttLabel}</span>
            <span style={{color:"#d1d5db"}}>·</span>
            <span style={{fontSize:11,color:"#9ca3af"}}>{tr.createdAt}</span>
          </div>
        </div>
        <button className="mo-cls" onClick={onClose}>✕</button>
      </div>
      <div className="mo-body">
        <WorkflowStepper status={tr.status}/>

        {tr.status==="Approved"&&<div className="ap green" style={{marginBottom:14}}>
          <div className="ap-title" style={{color:"#14532d"}}>✅ Approved by {tr.approver?.name}</div>
          <div style={{fontSize:12.5,color:"#166534"}}>{tr.approvalRemark}</div>
        </div>}
        {tr.status==="Rejected"&&<div className="ap red" style={{marginBottom:14}}>
          <div className="ap-title" style={{color:"#7f1d1d"}}>❌ Rejected by {tr.approver?.name}</div>
          <div style={{fontSize:12.5,color:"#991b1b"}}>{tr.approvalRemark}</div>
        </div>}
        {tr.status==="Closed"&&<div className="ap green" style={{marginBottom:14}}>
          <div className="ap-title" style={{color:"#14532d"}}>🔒 Transfer Closed</div>
          <div style={{fontSize:12.5,color:"#166534"}}>This transfer has been fully completed and closed.</div>
        </div>}

        <div className="dc">
          <div className="fsec">🔩 Mould Details</div>
          <div className="dg dg4">
            <div className="di"><div className="dlbl">Mould ID</div><div className="dval mono-badge">{tr.mouldId}</div></div>
            <div className="di"><div className="dlbl">Mould Name</div><div className="dval">{tr.mouldName}</div></div>
            <div className="di"><div className="dlbl">Type</div><div className="dval">{tr.mouldType}</div></div>
            <div className="di"><div className="dlbl">Challan No.</div><div className="dval">{tr.challanNo?<span className="mono-badge">{tr.challanNo}</span>:"—"}</div></div>
          </div>
        </div>

        <div className="route-card">
          <div className="route-node from">
            <div className="route-type">{tr.fromType}</div>
            <div className="route-name">{tr.fromName}</div>
            {tr.fromCode&&<div className="route-code">{tr.fromCode}</div>}
          </div>
          <div className="route-arrow">→</div>
          <div className="route-node to">
            <div className="route-type">{tr.toType}</div>
            <div className="route-name">{tr.toName}</div>
            {tr.toCode&&<div className="route-code">{tr.toCode}</div>}
          </div>
        </div>

        <div className="dc">
          <div className="fsec">📋 Transfer Information</div>
          <div className="dg dg4">
            <div className="di"><div className="dlbl">Reason</div>
              <span className="reason-badge" style={{background:"#fffbeb",color:"#d97706",borderColor:"#fde68a"}}>{tr.reason}</span>
            </div>
            <div className="di"><div className="dlbl">Expected Return</div><div className="dval">{tr.expectedReturn||"N/A"}</div></div>
            <div className="di"><div className="dlbl">Vehicle No.</div><div className="dval">{tr.vehicleNo||"—"}</div></div>
            <div className="di"><div className="dlbl">Consignment No.</div><div className="dval">{tr.consignmentNo||"—"}</div></div>
          </div>
          {tr.remarks&&<div style={{marginTop:8}}><div className="dlbl">Remarks</div>
            <div style={{fontSize:12.5,color:"#374151",background:"#fff",border:"1px solid #f0f0f0",borderRadius:7,padding:"7px 10px",marginTop:4,lineHeight:1.6}}>{tr.remarks}</div>
          </div>}
        </div>

        {tr.challanImages?.length>0&&<div className="dc">
          <div className="fsec">📎 Attached Documents ({tr.challanImages.length})</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {tr.challanImages.map((img,i)=><div key={i} style={{position:"relative"}}>
              <a href={img.url} target="_blank" rel="noopener noreferrer">
                {img.name.toLowerCase().endsWith('.pdf')
                    ? <div style={{width:80, height:60, background:'#eef2ff', borderRadius:7, border:"1.5px solid #e5e7eb", display:'flex', alignItems:'center', justifyContent:'center', fontSize:20}}>📄</div>
                    : <img src={img.url} alt={img.name} style={{width:80,height:60,objectFit:"cover",borderRadius:7,border:"1.5px solid #e5e7eb"}}/>
                }
              </a>
            </div>)}
          </div>
        </div>}

        <div className="dc">
          <div className="fsec">👥 Workflow Participants</div>
          <div className="dg">
            <div><div className="dlbl" style={{marginBottom:6}}>Maker</div>
              <div className="uchip">
                <div className="uav" style={{background:bgFor(tr.maker?.name)}}>{tr.maker?.avatar}</div>
                <div><div className="uname">{tr.maker?.name}</div></div>
                <span className="role-badge role-maker" style={{marginLeft:4}}>Maker</span>
              </div>
            </div>
            <div><div className="dlbl" style={{marginBottom:6}}>Approver</div>
              {tr.approver?<div className="uchip" style={{background:"#f0fdf4",borderColor:"#bbf7d0"}}>
                <div className="uav" style={{background:bgFor(tr.approver?.name)}}>{tr.approver?.avatar}</div>
                <div><div className="uname">{tr.approver?.name}</div></div>
                <span className="role-badge role-approver" style={{marginLeft:4}}>Approver</span>
              </div>:<div style={{fontSize:12,color:"#9ca3af",background:"#f9fafb",border:"1px dashed #e5e7eb",borderRadius:7,padding:"8px 11px"}}>⏳ Awaiting…</div>}
            </div>
          </div>
        </div>

        <div className="dc">
          <div className="fsec">🕐 Activity Timeline</div>
          <div className="tl">
            {(tr.timeline||[]).map((t,i)=>{
              const tldots={"Transfer Initiated":"#4f46e5","Draft Saved":"#9ca3af","Approved":"#059669","Rejected":"#dc2626","In Transit":"#f97316","Receipt Acknowledged":"#0891b2","Closed":"#22c55e"};
              const dot=tldots[t.event]||"#9ca3af";
              return <div key={i} className="tl-item">
                <div className="tl-dot" style={{background:dot+"22",border:`1.5px solid ${dot}`}}>
                  <span style={{fontSize:10}}>{"Transfer Initiated"===t.event||"Draft Saved"===t.event?"📋":
                    "Approved"===t.event?"✅":"Rejected"===t.event?"❌":
                    "In Transit"===t.event?"🚚":"Receipt Acknowledged"===t.event?"📬":"🔒"}</span>
                </div>
                <div className="tl-body">
                  <div className="tl-event" style={{color:dot}}>{t.event}</div>
                  <div className="tl-by">by {t.by} · {t.at}</div>
                  {t.note&&<div className="tl-note">{t.note}</div>}
                </div>
              </div>;
            })}
          </div>
        </div>

        {canApprove&&mode==="view"&&<div className="ap amber">
          <div className="ap-title" style={{color:"#92400e"}}>⏳ Awaiting Your Approval</div>
          <div style={{fontSize:12.5,color:"#b45309"}}>You are the designated approver for this transfer.</div>
          <div className="ap-btns">
            <button className="btn btn-red btn-sm" onClick={()=>{setMode("reject");setRemark("");setRemarkErr("");}}>❌ Reject Transfer</button>
            <button className="btn btn-green btn-sm" onClick={()=>{setMode("approve");setRemark("");setRemarkErr("");}}>✅ Approve Transfer</button>
          </div>
        </div>}

        {canApprove&&mode==="approve"&&<div className="ap green">
          <div className="ap-title" style={{color:"#14532d"}}>✅ Confirm Approval</div>
          <label className="flbl">Approval Remarks<span className="freq">*</span></label>
          <textarea className="fta" value={remark} placeholder="Enter approval remarks…" onChange={e=>{setRemark(e.target.value);setRemarkErr("");}} rows={2} style={{marginBottom:8}}/>
          {remarkErr&&<div className="ferr">{remarkErr}</div>}
          <div className="ap-btns">
            <button className="btn btn-o btn-sm" onClick={()=>setMode("view")}>Cancel</button>
            <button className="btn btn-green btn-sm" onClick={doApprove}>✅ Confirm Approval</button>
          </div>
        </div>}

        {canApprove&&mode==="reject"&&<div className="ap red">
          <div className="ap-title" style={{color:"#7f1d1d"}}>❌ Confirm Rejection</div>
          <label className="flbl">Rejection Reason<span className="freq">*</span></label>
          <textarea className="fta" value={remark} placeholder="Provide a clear reason for rejection…" onChange={e=>{setRemark(e.target.value);setRemarkErr("");}} rows={2} style={{marginBottom:8,borderColor:"#fecaca"}}/>
          {remarkErr&&<div className="ferr">{remarkErr}</div>}
          <div className="ap-btns">
            <button className="btn btn-o btn-sm" onClick={()=>setMode("view")}>Cancel</button>
            <button className="btn btn-red btn-sm" onClick={doReject}>❌ Confirm Rejection</button>
          </div>
        </div>}

        {canMarkTransit&&<div className="ap amber">
          <div className="ap-title" style={{color:"#92400e"}}>🚚 Mark as In Transit</div>
          <div style={{fontSize:12.5,color:"#b45309"}}>Transfer is approved. Click below after dispatching the mould.</div>
          <div className="ap-btns">
            <button className="btn btn-amber btn-sm" onClick={doTransit}>🚚 Mark In Transit</button>
          </div>
        </div>}

        {canAcknowledge&&mode==="view"&&<div className="ap cyan">
          <div className="ap-title" style={{color:"#0c4a6e"}}>📬 Acknowledge Receipt</div>
          <div style={{fontSize:12.5,color:"#0369a1"}}>Confirm mould has been received at the destination.</div>
          <div className="ap-btns">
            <button className="btn btn-cyan btn-sm" onClick={()=>{setMode("receipt");setRemark("");setRemarkErr("");}}>📬 Acknowledge Receipt</button>
          </div>
        </div>}

        {canAcknowledge&&mode==="receipt"&&<div className="ap cyan">
          <div className="ap-title" style={{color:"#0c4a6e"}}>📬 Receipt Acknowledgement</div>
          <label className="flbl">Acknowledgement Note<span className="freq">*</span></label>
          <textarea className="fta" value={remark} placeholder="Confirm receipt details, condition of mould, etc." onChange={e=>{setRemark(e.target.value);setRemarkErr("");}} rows={2} style={{marginBottom:8}}/>
          {remarkErr&&<div className="ferr">{remarkErr}</div>}
          <div className="ap-btns">
            <button className="btn btn-o btn-sm" onClick={()=>setMode("view")}>Cancel</button>
            <button className="btn btn-cyan btn-sm" onClick={doAcknowledge}>✅ Confirm Receipt</button>
          </div>
        </div>}

        {canClose&&<div className="ap blue">
          <div className="ap-title" style={{color:"#3730a3"}}>🔒 Close Transfer</div>
          <div style={{fontSize:12.5,color:"#4338ca"}}>Receipt has been acknowledged. Close this transfer to complete the workflow.</div>
          <div className="ap-btns">
            <button className="btn btn-p btn-sm" onClick={doClose}>🔒 Close Transfer</button>
          </div>
        </div>}
      </div>

      <div className="mo-foot">
        <button className="btn btn-o" onClick={onClose}>Close</button>
        {canViewChallan&&<button className="btn btn-cyan" onClick={()=>setShowChallan(true)}>📄 View Challan</button>}
      </div>
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  CHALLAN REGISTER TAB
// ══════════════════════════════════════════════════════════════
function ChallanTab({transfers}){
  const [q,setQ]=useState("");const [pg,setPg]=useState(1);const [sel,setSel]=useState(null);
  const PER=8;
  const rows=transfers.filter(t=>t.challanNo&&(!q||[t.challanNo,t.id,t.mouldId,t.mouldName].some(s=>s&&s.toLowerCase().includes(q.toLowerCase()))));
  const pages=Math.max(1,Math.ceil(rows.length/PER));
  const paged=rows.slice((pg-1)*PER,pg*PER);
  return <div className="fade-in">
    <div className="toolbar">
      <div className="srch"><span className="srch-ico">🔍</span><input className="srch-inp" placeholder="Search challan no, mould…" value={q} onChange={e=>{setQ(e.target.value);setPg(1)}}/></div>
      <div style={{flex:1}}/>
      <button className="btn btn-o">⬇️ Export</button>
    </div>
    <div className="tbl-card">
      <div className="tbl-hdr">
        <div className="tbl-hdr-l"><div className="tbl-ico" style={{background:"#eef2ff"}}>📄</div><span className="tbl-t">Challan Register</span></div>
        <span className="tbl-cnt">{rows.length} challan{rows.length!==1?"s":""}</span>
      </div>
      {paged.length===0?<div className="empty"><div className="empty-ico">📄</div><div className="empty-t">No challans found</div></div>:(
        <table>
          <thead><tr><th>Challan No.</th><th>Transfer ID</th><th>Mould</th><th>Transfer Type</th><th>From → To</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.map(t=>{
              const ttLabel=TRANSFER_TYPES.find(x=>x.key===t.transferType)?.label||t.transferType;
              return <tr key={t.id}>
                <td><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:7,height:7,borderRadius:"50%",background:"#6366f1",flexShrink:0,display:"inline-block"}}/><span style={{fontFamily:"monospace",fontSize:12,fontWeight:800,color:"#4338ca"}}>{t.challanNo}</span></div></td>
                <td><span style={{fontFamily:"monospace",fontSize:11,color:"#6b7280"}}>{t.id}</span></td>
                <td><div style={{fontWeight:700,color:"#111827",fontSize:12}}>{t.mouldName}</div><div style={{fontSize:10,color:"#9ca3af"}}>{t.mouldId}</div></td>
                <td><span className="tt-badge" style={{fontSize:10}}>{ttLabel}</span></td>
                <td><div style={{fontSize:11.5,fontWeight:500}}>{t.fromName?.split("–")[0]?.trim()??t.fromName} → {t.toType==="maintenance"?"Maint.":t.toName?.split("–")[0]?.trim()??t.toName}</div></td>
                <td><span style={{fontSize:10.5,fontWeight:700,background:"#fffbeb",color:"#d97706",padding:"2px 7px",borderRadius:20,border:"1px solid #fde68a"}}>{t.reason}</span></td>
                <td><StatusBadge status={t.status}/></td>
                <td><div className="acts">
                  <button className="act v" onClick={()=>setSel(t)} title="View Challan">👁</button>
                  <button className="act c" title="Print">🖨</button>
                  <button className="act v" title="Download">⬇</button>
                </div></td>
              </tr>;
            })}
          </tbody>
        </table>
      )}
      <Pager page={pg} pages={pages} total={rows.length} per={PER} set={setPg}/>
    </div>
    {sel&&<div className="mo-ov" onClick={e=>e.target===e.currentTarget&&setSel(null)}>
      <div className="mo-bx" style={{maxWidth:720}}>
        <div className="mo-hdr"><div><div className="mo-title">📄 {sel.challanNo}</div><div className="mo-sub">Transfer Challan Document</div></div><button className="mo-cls" onClick={()=>setSel(null)}>✕</button></div>
        <div className="mo-body"><ChallanDoc tr={sel}/></div>
        <div className="mo-foot"><button className="btn btn-o" onClick={()=>setSel(null)}>Close</button><button className="btn btn-o">🖨️ Print</button><button className="btn btn-cyan">⬇️ Download</button></div>
      </div>
    </div>}
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════
const NAV_ITEMS=[
  { label: "Dashboard", icon: "📊", route: "/dashboard" },
  { label: "User Management", icon: "👥", route: "/user-management" },
  { label: "Masters", icon: "🗂", route: "/masters" },
  { label: "Mould Registry", icon: "🔩", route: "/mould-registry" },
  { label: "Transfers & Challan", icon: "🔄", route: "/challan",active: true },
  { label: "Mould Return", icon: "📥", route: "/return" },
  { label: "Depreciation", icon: "📉", route: "/depreciation" },
  { label: "Maintenance", icon: "🔧", route: "/maintenance" },
  { label: "Scrap / Dispose", icon: "🗑", route: "/scrap" },
  { label: "Reports", icon: "📈", route: "/reports" }
];

export default function MouldTransferPage(){
  const router=useRouter();
  const [transfers,setTransfers]=useState([]);
  const [activeTab,setActiveTab]=useState("transfers");
  const [q,setQ]=useState("");
  const [flt,setFlt]=useState("All");
  const [ttFlt,setTtFlt]=useState("All");
  const [pg,setPg]=useState(1);
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);
  const [showToast,toastNode]=useToast();
  
  const [user,setUser]=useState({name:"User",role:"Viewer"});
  const [roles, setRoles] = useState([]);
  
  // Database States
  const [dbMoulds, setDbMoulds] = useState([]);
  const [dbVendors, setDbVendors] = useState([]);
  const [dbMfg, setDbMfg] = useState([]);
  const [dbPlants, setDbPlants] = useState([]);
  const [dbReasons, setDbReasons] = useState([]);

  const PER=7;

  useEffect(()=>{
    const stored=localStorage.getItem("user");
    if(!stored){router.push("/login");return;}
    setUser(JSON.parse(stored));
    
    fetch('/api/roles').then(r=>r.json()).then(setRoles).catch(console.error);
    fetchTransfers();
    
    // Robust master data mapping
    Promise.all([
        fetch('/api/moulds?_t='+Date.now(), { cache: 'no-store' }).then(r=>r.ok ? r.json() : []),
        fetch('/api/masters?type=vendors&_t='+Date.now(), { cache: 'no-store' }).then(r=>r.ok ? r.json() : []),
        fetch('/api/masters?type=manufacturers&_t='+Date.now(), { cache: 'no-store' }).then(r=>r.ok ? r.json() : []),
        fetch('/api/masters?type=plants&_t='+Date.now(), { cache: 'no-store' }).then(r=>r.ok ? r.json() : []),
        fetch('/api/masters?type=transfer_reasons&_t='+Date.now(), { cache: 'no-store' }).then(r=>r.ok ? r.json() : [])
    ]).then(([moulds, vendors, mfgs, plants, reasons]) => {
        setDbMoulds(Array.isArray(moulds) ? moulds.map(m=>({ id: m.mouldIdAssetCode || m.mould_id_code, name: m.mouldName || m.mould_name, type: m.assetClassName || m.asset_class_name, locationName: m.locationName || m.location_name })) : []);
        setDbVendors(Array.isArray(vendors) ? vendors.map(v=>({ code: v.code, name: v.name, city: v.location })) : []);
        setDbMfg(Array.isArray(mfgs) ? mfgs.map(m=>({ code: m.code, name: m.name, city: m.country })) : []);
        setDbPlants(Array.isArray(plants) ? plants.map(p=>({ code: p.code, name: p.name })) : []);
        
        // Ensure Transfer Reason correctly fetches active entries, falling back to name/code
        setDbReasons(Array.isArray(reasons) ? reasons.filter(r => r.active !== false && r.active !== 0).map(r => r.name || r.code || r) : []);
    }).catch(console.error);

  },[router]);

  const fetchTransfers = async () => {
    try {
        const res = await fetch("/api/transfers?_t=" + Date.now(), { cache: 'no-store' });
        if(res.ok) setTransfers(await res.json());
    } catch(err) { console.error(err); }
  };

  // RBAC Setup
  const activeRole = roles.find(r => r.name === user.role);
  const privs = activeRole ? activeRole.privs : null;
  const isMaker = user.role === "Admin" || privs?.challan || privs?.transfer;
  const isApprover = user.role === "Admin" || privs?.receipt;

  const initials=user.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
  const currentUser = { name: user.name, avatar: initials };

  const updateTransfer= async (id,patch)=>{
    try {
        const res = await fetch("/api/transfers", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...patch })
        });
        if(res.ok) {
            fetchTransfers();
            const msgs={
              "Approved":"Transfer approved successfully ✅",
              "Rejected":"Transfer rejected",
              "In Transit":"Mould marked as In Transit 🚚",
              "Receipt Acknowledged":"Receipt acknowledged 📬",
              "Closed":"Transfer closed 🔒",
            };
            if(patch.status)showToast(msgs[patch.status]||"Transfer updated",patch.status==="Rejected"?"err":"ok");
        } else {
            showToast("Failed to update transfer", "err");
        }
    } catch(err) { showToast(err.message, "err"); }
  };

  const handleNewTransfer = async (t, isDraft) => {
    try {
        const formData = new FormData();
        Object.keys(t).forEach(key => {
            if(key !== 'challanImages' && key !== 'maker' && key !== 'timeline') {
                formData.append(key, t[key]);
            }
        });
        
        formData.append('maker', JSON.stringify(t.maker));
        formData.append('timeline', JSON.stringify(t.timeline));
        t.challanImages.forEach(img => {
            if(img.file) formData.append('challanImages', img.file);
        });

        const res = await fetch("/api/transfers", {
            method: "POST",
            body: formData
        });
        
        if(res.ok) {
            setModal(null);
            fetchTransfers(); 
            showToast(isDraft?`Draft saved: ${t.id}`:`${t.id} submitted — Challan ${t.challanNo} generated`,"ok");
        } else {
            showToast("Failed to save transfer", "err");
        }
    } catch(err) { showToast(err.message, "err"); }
  };

  if (!privs && user.role !== "Admin") {
      return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Loading privileges...</div>;
  }

  if (!isMaker && !isApprover && user.role !== "Admin") {
      return (
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column'}}>
              <h2>Access Denied</h2>
              <p>You do not have permission to view or manage Transfers & Challans.</p>
              <button onClick={() => router.push('/dashboard')} className="btn btn-o">Return to Dashboard</button>
          </div>
      );
  }

  // Force active tab correction if user lacks permission for the Challan Register tab
  if (activeTab === "challan" && !isMaker && !isApprover) setActiveTab("transfers");

  const filtered=transfers.filter(t=>{
    const ql=q.toLowerCase();
    return (!ql||[t.id,t.mouldId,t.mouldName,t.reason,t.challanNo||""].some(s=>s&&s.toLowerCase().includes(ql)))
      &&(flt==="All"||t.status===flt)
      &&(ttFlt==="All"||t.transferType===ttFlt);
  });
  const pages=Math.max(1,Math.ceil(filtered.length/PER));
  const paged=filtered.slice((pg-1)*PER,pg*PER);

  const stats={
    total:transfers.length,
    pending:transfers.filter(t=>t.status==="Pending Approval").length,
    transit:transfers.filter(t=>t.status==="In Transit").length,
    receipt:transfers.filter(t=>t.status==="Receipt Acknowledged").length,
    closed:transfers.filter(t=>t.status==="Closed").length,
    challans:transfers.filter(t=>t.challanNo).length,
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

  return <>
    <style>{CSS}</style>
    <div className="shell">
      {/* SIDEBAR */}
      <div className="sb">
        <div className="sb-brand">
          {/* If you want the ID Tech logo back in the future, uncomment the block below:
          <div style={{ padding: "0 10px" }}>
             <img src="/logo.png" alt="ID Tech Logo" style={{ width: "100%", maxHeight: 45, objectFit: "contain", display: "block", margin: "0 auto" }} />
          </div>
          */}
          
          <div className="sb-brand-row">
            <div className="sb-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><rect x="12" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".6"/><rect x="2" y="12" width="6" height="6" rx="1.5" fill="white" opacity=".6"/><rect x="12" y="12" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><circle cx="10" cy="10" r="1.8" fill="white"/></svg>
            </div>
            <div><div className="sb-name">MouldSys <span>Enterprise</span></div><div className="sb-sub">Asset Management Platform</div></div>
          </div>
        </div>
        <div className="sb-nav">
          <div className="sb-sec">Main</div>
          {NAV_ITEMS.map(n=>(
            <div key={n.label} className={`sb-link${n.active?" on":""}`} onClick={() => router.push(n.route)}>
              <span className="sb-ico">{n.icon}</span>{n.label}
            </div>
          ))}
        </div>
        <div className="sb-foot">
          <div className="sb-user">
            <div className="sb-av" style={{background:bgFor(currentUser.name)}}>{currentUser.avatar}</div>
            <div><div className="sb-uname">{currentUser.name}</div><div className="sb-urole">{user.role}</div></div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="topbar">
          <div className="tb-left">
            <div className="tb-title">Transfers &amp; Challan</div>
            <div style={{display:"flex", gap: 6, marginLeft: 10}}>
              {isMaker && <span style={{fontSize:10.5,background:"#eef2ff",color:"#4338ca",padding:"2px 9px",borderRadius:6,fontWeight:700,border:"1px solid #c7d2fe"}}>📋 Maker</span>}
              {isApprover && <span style={{fontSize:10.5,background:"#f0fdf4",color:"#15803d",padding:"2px 9px",borderRadius:6,fontWeight:700,border:"1px solid #bbf7d0"}}>✅ Approver</span>}
            </div>
          </div>
          <div className="tb-right">
            <div className="tb-notif">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2a4 4 0 00-4 4v2l-1 2h10l-1-2V6a4 4 0 00-4-4zM5.5 12a1.5 1.5 0 003 0" stroke="#6b7280" strokeWidth="1.3" strokeLinecap="round"/></svg>
              {stats.pending>0&&<div className="tb-ndot"/>}
            </div>
            <div className="tb-pill">
              <div className="tb-tav" style={{background:bgFor(currentUser.name)}}>{currentUser.avatar}</div>
              <span className="tb-nm">{currentUser.name}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
                Logout ➔
            </button>
          </div>
        </div>

        <div className="content">
          {/* STATS */}
          <div className="stats-row">
            {[
              {lbl:"Total Transfers",val:stats.total,     color:"#4f46e5",pct:100},
              {lbl:"Pending Approval",val:stats.pending,   color:"#d97706",pct:(stats.pending/Math.max(stats.total,1))*100},
              {lbl:"In Transit",      val:stats.transit,   color:"#f97316",pct:(stats.transit/Math.max(stats.total,1))*100},
              {lbl:"Receipt Ack.",    val:stats.receipt,   color:"#0891b2",pct:(stats.receipt/Math.max(stats.total,1))*100},
              {lbl:"Closed",          val:stats.closed,    color:"#22c55e",pct:(stats.closed/Math.max(stats.total,1))*100},
              {lbl:"Challans Issued", val:stats.challans,  color:"#6366f1",pct:(stats.challans/Math.max(stats.total,1))*100},
            ].map(s=><div key={s.lbl} className="sc">
              <div className="sc-lbl">{s.lbl}</div>
              <div className="sc-val" style={{color:s.color}}>{s.val}</div>
              <div className="sc-bar"><div className="sc-bar-fill" style={{width:`${s.pct}%`,background:s.color}}/></div>
            </div>)}
          </div>

          {/* TABS */}
          <div className="main-tabs">
            <button className={`mtab${activeTab==="transfers"?" on":""}`} onClick={()=>setActiveTab("transfers")}>
              🔄 Transfer Requests
              {stats.pending>0&&<span style={{background:"#f59e0b",color:"#fff",borderRadius:"50%",width:17,height:17,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:9.5,fontWeight:700,marginLeft:3}}>{stats.pending}</span>}
            </button>
            {(isMaker || isApprover) && <button className={`mtab${activeTab==="challan"?" on":""}`} onClick={()=>setActiveTab("challan")}>
              📄 Challan Register
              <span style={{fontSize:10.5,fontWeight:600,background:activeTab==="challan"?"rgba(255,255,255,.25)":"#f3f4f6",color:activeTab==="challan"?"#fff":"#6b7280",borderRadius:20,padding:"1px 7px",marginLeft:3}}>{stats.challans}</span>
            </button>}
          </div>

          {activeTab==="challan"&&<ChallanTab transfers={transfers}/>}

          {activeTab==="transfers"&&<div className="fade-in">
            {/* Context banners */}
            {isApprover&&stats.pending>0&&(
              <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:11,padding:"11px 15px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:16}}>⏳</span>
                <div><div style={{fontSize:12.5,fontWeight:700,color:"#92400e"}}>{stats.pending} transfer{stats.pending>1?"s":""} awaiting your approval</div>
                <div style={{fontSize:11.5,color:"#b45309",marginTop:1}}>Highlighted rows require action.</div></div>
              </div>
            )}
            {isApprover&&stats.receipt>0&&(
              <div style={{background:"#e0f2fe",border:"1px solid #bae6fd",borderRadius:11,padding:"11px 15px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:16}}>📬</span>
                <div><div style={{fontSize:12.5,fontWeight:700,color:"#0c4a6e"}}>{stats.receipt} transfer{stats.receipt>1?"s":""} pending receipt acknowledgement</div></div>
              </div>
            )}

            {/* Toolbar */}
            <div className="toolbar">
              <div className="srch"><span className="srch-ico">🔍</span>
                <input className="srch-inp" placeholder="Search ID, mould name, mould ID, reason…" value={q} onChange={e=>{setQ(e.target.value);setPg(1)}}/>
              </div>
              <select className="flt" value={flt} onChange={e=>{setFlt(e.target.value);setPg(1)}}>
                <option>All</option>
                {Object.keys(S).map(s=><option key={s}>{s}</option>)}
              </select>
              <select className="flt" value={ttFlt} onChange={e=>{setTtFlt(e.target.value);setPg(1)}}>
                <option value="All">All Types</option>
                {TRANSFER_TYPES.map(t=><option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
              <div style={{flex:1}}/>
              {isMaker&&<button className="btn btn-p" onClick={()=>setModal("new")}>+ Initiate Transfer</button>}
            </div>

            {/* TABLE */}
            <div className="tbl-card">
              <div className="tbl-hdr">
                <div className="tbl-hdr-l"><div className="tbl-ico" style={{background:"#eff6ff"}}>🔄</div><span className="tbl-t">Transfer Requests</span></div>
                <span className="tbl-cnt">{filtered.length} transfer{filtered.length!==1?"s":""}</span>
              </div>
              {paged.length===0?<div className="empty"><div className="empty-ico">🔄</div><div className="empty-t">No transfers found</div></div>:(
                <table>
                  <thead><tr>
                    <th>Challan / ID</th><th>Mould</th><th>Transfer Type</th>
                    <th>From → To</th><th>Reason</th><th>Vehicle / Consignment</th>
                    <th>Maker</th><th>Status</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {paged.map(t=>{
                      const ttLabel=TRANSFER_TYPES.find(x=>x.key===t.transferType)?.label||t.transferType;
                      const isPend=t.status==="Pending Approval";
                      return <tr key={t.id} className={isPend?"pend":""}>
                        <td>
                          <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:"#4338ca",marginBottom:1}}>{t.challanNo||"—"}</div>
                          <div style={{fontFamily:"monospace",fontSize:10,color:"#9ca3af"}}>{t.id}</div>
                        </td>
                        <td>
                          <div style={{fontWeight:700,color:"#111827",fontSize:12}}>{t.mouldName}</div>
                          <div style={{fontSize:10,color:"#9ca3af"}}>{t.mouldId}</div>
                        </td>
                        <td><span className="tt-badge">{ttLabel}</span></td>
                        <td>
                          <div style={{fontSize:11.5,color:"#374151",fontWeight:500}}>{(t.fromName||"").split("–")[0].trim()}</div>
                          <div style={{fontSize:10.5,color:"#9ca3af"}}>→ {t.toType==="maintenance"?"Maint. Bay":(t.toName||"").split("–")[0].trim()}</div>
                        </td>
                        <td><span style={{fontSize:10.5,fontWeight:700,background:"#fffbeb",color:"#d97706",padding:"2px 7px",borderRadius:20,border:"1px solid #fde68a"}}>{t.reason}</span></td>
                        <td>
                          <div style={{fontSize:11,color:"#374151"}}>{t.vehicleNo||<span style={{color:"#d1d5db"}}>—</span>}</div>
                          <div style={{fontSize:10,color:"#9ca3af"}}>{t.consignmentNo||""}</div>
                        </td>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <div style={{width:20,height:20,borderRadius:"50%",background:bgFor(t.maker?.name),display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#fff"}}>{t.maker?.avatar}</div>
                            <span style={{fontSize:11.5}}>{t.maker?.name}</span>
                          </div>
                        </td>
                        <td><StatusBadge status={t.status}/></td>
                        <td>
                          <div className="acts">
                            <button className="act v" title="View" onClick={()=>{setSelected(t);setModal("view");}}>👁</button>
                            {isApprover&&t.status==="Pending Approval"&&(
                              <><button className="act a" title="Approve" onClick={()=>{setSelected(t);setModal("view");}}>✓</button>
                              <button className="act r" title="Reject" onClick={()=>{setSelected(t);setModal("view");}}>✕</button></>
                            )}
                            {t.status==="Approved"&&isMaker&&<button className="act c" title="Mark Transit" onClick={()=>{setSelected(t);setModal("view");}}>🚚</button>}
                            {t.challanNo&&<button className="act c" title="Challan" onClick={()=>{setSelected(t);setModal("view");}}>📄</button>}
                          </div>
                        </td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              )}
              <Pager page={pg} pages={pages} total={filtered.length} per={PER} set={setPg}/>
            </div>
          </div>}
        </div>
      </div>
    </div>

    {modal==="new"&&<NewTransferModal 
        currentUser={currentUser} 
        onClose={()=>setModal(null)} 
        onSubmit={handleNewTransfer}
        mouldsDb={dbMoulds}
        vendorsDb={dbVendors}
        mfgDb={dbMfg}
        plantsDb={dbPlants}
        reasonsDb={dbReasons}
    />}

    {modal==="view"&&selected&&<ViewModal
      transfer={selected} allTransfers={transfers}
      onClose={()=>{setModal(null);setSelected(null);}}
      onUpdate={updateTransfer}
      isMaker={isMaker} isApprover={isApprover} currentUser={currentUser}/>}

    {toastNode}
  </>;
}