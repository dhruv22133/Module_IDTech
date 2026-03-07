'use client';
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

// ══════════════════════════════════════════════════════════════
//  MOULD SCRAP MODULE — MouldSys Enterprise
// ══════════════════════════════════════════════════════════════

// ── MASTER DATA ─────────────────────────────────────────────
const MOULDS = [
  { id:"MLD-0042", name:"Bumper Front LH",      type:"Injection Mould", plant:"Plant A – Mumbai",     location:"Shop Floor A",   shots:470000, maxShots:500000, assetValue:1850000, bookValue:185000,  age:"6.2 yrs", status:"Active",           lastMaint:"2025-01-15", condition:"Fair" },
  { id:"MLD-0118", name:"Dashboard Panel RH",   type:"Injection Mould", plant:"Plant B – Pune",       location:"Shop Floor B",   shots:440000, maxShots:500000, assetValue:2200000, bookValue:264000,  age:"5.8 yrs", status:"Active",           lastMaint:"2025-02-01", condition:"Poor" },
  { id:"MLD-0203", name:"Door Trim Inner LH",   type:"Blow Mould",      plant:"Plant A – Mumbai",     location:"Warehouse 1",    shots:499200, maxShots:500000, assetValue:1600000, bookValue:32000,   age:"7.5 yrs", status:"End of Life",      lastMaint:"2024-12-20", condition:"Critical" },
  { id:"MLD-0087", name:"Grille Centre",         type:"Die Cast Mould",  plant:"Plant C – Nashik",     location:"Shop Floor A",   shots:395000, maxShots:500000, assetValue:2800000, bookValue:560000,  age:"4.1 yrs", status:"Active",           lastMaint:"2025-01-28", condition:"Good" },
  { id:"MLD-0311", name:"Headlamp Bezel RH",    type:"Injection Mould", plant:"Plant D – Aurangabad", location:"Maintenance Bay", shots:498500, maxShots:500000, assetValue:1950000, bookValue:48750,   age:"8.0 yrs", status:"Under Maintenance",lastMaint:"2025-02-10", condition:"Poor" },
  { id:"MLD-0512", name:"A-Pillar Cover RH",    type:"Blow Mould",      plant:"Plant B – Pune",       location:"Shop Floor A",   shots:220000, maxShots:500000, assetValue:1400000, bookValue:700000,  age:"3.2 yrs", status:"Active",           lastMaint:"2025-01-05", condition:"Good" },
  { id:"MLD-0634", name:"Rear Bumper Assembly", type:"Compression Mould",plant:"Plant A – Mumbai",    location:"Warehouse 2",    shots:495000, maxShots:500000, assetValue:3200000, bookValue:96000,   age:"9.1 yrs", status:"End of Life",      lastMaint:"2024-11-30", condition:"Critical" },
  { id:"MLD-0721", name:"Console Side Panel",   type:"Injection Mould", plant:"Plant B – Pune",       location:"Maintenance Bay", shots:310000, maxShots:500000, assetValue:1750000, bookValue:437500,  age:"4.8 yrs", status:"Under Maintenance",lastMaint:"2025-02-18", condition:"Fair" },
  { id:"MLD-0819", name:"Fender Extension LH",  type:"Die Cast Mould",  plant:"Plant C – Nashik",     location:"Shop Floor B",   shots:497800, maxShots:500000, assetValue:2100000, bookValue:42000,   age:"7.8 yrs", status:"End of Life",      lastMaint:"2024-10-12", condition:"Critical" },
  { id:"MLD-0923", name:"Tailgate Inner Panel", type:"Injection Mould", plant:"Plant A – Mumbai",     location:"Warehouse 1",    shots:492000, maxShots:500000, assetValue:2450000, bookValue:122500,  age:"8.5 yrs", status:"Retired",          lastMaint:"2024-09-05", condition:"Scrap" },
];

const SCRAP_REASONS = [
  { key:"eol",           label:"End of Life – Shot Count Exceeded",    icon:"⏱",  color:"#6b7280" },
  { key:"irreparable",   label:"Irreparable Damage / Beyond Repair",  icon:"💥", color:"#dc2626" },
  { key:"obsolete",      label:"Product Obsolescence / Model Change",  icon:"📦", color:"#d97706" },
  { key:"cost_unviable", label:"Repair Cost Unviable (> 60% Asset)",   icon:"💰", color:"#7c3aed" },
  { key:"quality_fail",  label:"Consistent Quality Failure / Rejects", icon:"❌", color:"#ef4444" },
  { key:"tech_upgrade",  label:"Technology Upgrade / Replacement",     icon:"🔄", color:"#0891b2" },
  { key:"safety",        label:"Safety Hazard / Compliance Issue",     icon:"⚠️",  color:"#b91c1c" },
  { key:"customer_req",  label:"Customer Requirement / Directive",     icon:"📋", color:"#059669" },
];

const DISPOSAL_METHODS = [
  { key:"scrap_sale",     label:"Scrap Sale (Metal Weight)",     icon:"⚖️",  description:"Sell mould as scrap metal by weight" },
  { key:"auction",        label:"Auction / Tender Sale",         icon:"🔨", description:"Sell via auction or tender process" },
  { key:"return_customer",label:"Return to Customer / OEM",      icon:"🔙", description:"Return to customer who owns the mould" },
  { key:"donate",         label:"Donate to Training Institute",  icon:"🎓", description:"Donate for educational purposes" },
  { key:"destroy",        label:"Destroy / Dismantle",           icon:"🗑", description:"Complete destruction and disposal" },
  { key:"recycle",        label:"Recycle Components",            icon:"♻️",  description:"Salvage reusable components before scrap" },
];

const CONDITION_RATINGS = [
  { key:"critical", label:"Critical – Unusable",     color:"#dc2626", bg:"#fef2f2", border:"#fca5a5", pct:0  },
  { key:"poor",     label:"Poor – Major Issues",     color:"#d97706", bg:"#fffbeb", border:"#fcd34d", pct:25 },
  { key:"fair",     label:"Fair – Needs Repair",     color:"#0891b2", bg:"#e0f2fe", border:"#7dd3fc", pct:50 },
  { key:"good",     label:"Good – Minor Wear",       color:"#059669", bg:"#f0fdf4", border:"#6ee7b7", pct:75 },
  { key:"excellent",label:"Excellent – Like New",     color:"#15803d", bg:"#dcfce7", border:"#86efac", pct:100 },
];

const EVALUATION_CHECKLIST = [
  { id:"EV01", task:"Cavity surface condition assessment", category:"Surface",    weight:15 },
  { id:"EV02", task:"Core & cavity alignment check",       category:"Alignment",  weight:10 },
  { id:"EV03", task:"Cooling channel integrity test",      category:"Cooling",    weight:10 },
  { id:"EV04", task:"Hot runner / gate system evaluation",  category:"Gate System", weight:12 },
  { id:"EV05", task:"Ejector system functionality test",    category:"Ejector",    weight:10 },
  { id:"EV06", task:"Guide pin & bush wear measurement",   category:"Guide",      weight:8  },
  { id:"EV07", task:"Dimensional accuracy (CMM report)",    category:"Precision",  weight:15 },
  { id:"EV08", task:"Trial production quality check",       category:"Quality",    weight:12 },
  { id:"EV09", task:"Structural integrity & crack test",    category:"Structure",  weight:8  },
];

const SCRAP_VENDORS = [
  { code:"SV-001", name:"Metro Scrap Dealers",         city:"Mumbai",     rate:42, uom:"₹/kg" },
  { code:"SV-002", name:"National Metal Recyclers",    city:"Pune",       rate:45, uom:"₹/kg" },
  { code:"SV-003", name:"Green Earth Recycling",       city:"Nashik",     rate:40, uom:"₹/kg" },
  { code:"SV-004", name:"Industrial Salvage Corp",     city:"Aurangabad", rate:44, uom:"₹/kg" },
];

const PLANTS = ["Plant A – Mumbai","Plant B – Pune","Plant C – Nashik","Plant D – Aurangabad"];

const USERS = {
  maker:       { id:"USR-001", name:"Rajesh Kumar",     role:"Maker",         avatar:"RK" },
  reviewer:    { id:"USR-003", name:"Priya Mehta",      role:"Technical Reviewer", avatar:"PM" },
  approver:    { id:"USR-002", name:"Sunita Rao",       role:"Approver",      avatar:"SR" },
  finance:     { id:"USR-004", name:"Amit Desai",       role:"Finance Head",  avatar:"AD" },
};

const NAV_ITEMS = [
  { label:"Dashboard",           icon:"📊", route:"/dashboard"       },
  { label:"Mould Registry",      icon:"🔩", route:"/mould-registry"  },
  { label:"Maintenance",         icon:"🔧", route:"/maintenance"     },
  { label:"Transfers & Challan", icon:"🔄", route:"/challan"         },
  {label:"Mould Return",        icon:"📥", route:"/return" },
  {label:"Depreciation",        icon:"📉", route:"/depreciation"},
  { label:"Scrap / Dispose",     icon:"🗑", route:"/scrap", active:true },
  { label:"Masters",             icon:"🗂", route:"/masters"         },
  { label:"User Management",     icon:"👥", route:"/user-management" },
  { label:"Reports",             icon:"📈", route:"/reports"         },
];

// ── Counters ────────────────────────────────────────────────
let scrapCounter = 18;
const nextScrapId = () => `SCR-2025-${String(++scrapCounter).padStart(4,"0")}`;

// ── SEED SCRAP RECORDS ──────────────────────────────────────
const SEED_RECORDS = [
  {
    id:"SCR-2025-0016", mouldId:"MLD-0203", mouldName:"Door Trim Inner LH", mouldType:"Blow Mould", plant:"Plant A – Mumbai",
    scrapReason:"eol", reasonDetail:"Shot count 499,200 exceeds guaranteed life of 500,000. Cavity wear beyond acceptable limits. Multiple repair attempts exhausted.",
    conditionRating:"critical",
    evaluationScore:18, evaluationChecklist: EVALUATION_CHECKLIST.map(c => ({...c,score:2,remark:"Failed"})),
    disposalMethod:"scrap_sale", scrapVendor:"SV-001", scrapWeight:4200, scrapRate:42, estimatedScrapValue:176400,
    originalAssetValue:1600000, currentBookValue:32000, accumulatedDepreciation:1568000, netLoss:0, salvageValue:176400,
    mouldWeight:4200, mouldMaterial:"Aluminium",
    lastMaintenanceDate:"2024-12-20", totalMaintenanceCost:385000, lifetimeShots:499200, maxShots:500000,
    requestedBy:USERS.maker, reviewedBy:USERS.reviewer, approvedBy:USERS.approver, financeApprovedBy:USERS.finance,
    requestDate:"2025-02-20", reviewDate:"2025-02-22", approvalDate:"2025-02-24", financeApprovalDate:"2025-02-25", disposalDate:"2025-03-01",
    gatePassNo:"GP-2025-0312", invoiceNo:"INV-SCR-2025-0089", ewayBillNo:"EWB-2025-44556",
    certificateOfDestruction:"", environmentalClearance:"ENV-CLR-2025-044",
    beforeImages:[], afterImages:[], documents:[],
    remarks:"End of life. All repair options exhausted. Scrap sale to Metro Scrap Dealers completed.",
    status:"Disposed",
    timeline:[
      { event:"Scrap Request Created",   by:"Rajesh Kumar",  at:"20 Feb 2025, 10:00 AM", note:"EOL – 499,200 shots completed" },
      { event:"Technical Review Started", by:"Priya Mehta",   at:"21 Feb 2025, 09:30 AM", note:"Evaluation checklist initiated" },
      { event:"Review Completed",         by:"Priya Mehta",   at:"22 Feb 2025, 04:00 PM", note:"Score: 18/100 – Recommended for scrap" },
      { event:"Management Approval",      by:"Sunita Rao",    at:"24 Feb 2025, 11:00 AM", note:"Approved for disposal" },
      { event:"Finance Approval",         by:"Amit Desai",    at:"25 Feb 2025, 02:00 PM", note:"Asset write-off approved" },
      { event:"Disposal Completed",       by:"Rajesh Kumar",  at:"01 Mar 2025, 03:30 PM", note:"Scrap sale completed. GP-2025-0312 issued" },
    ]
  },
  {
    id:"SCR-2025-0017", mouldId:"MLD-0634", mouldName:"Rear Bumper Assembly", mouldType:"Compression Mould", plant:"Plant A – Mumbai",
    scrapReason:"irreparable", reasonDetail:"Major structural crack in cavity block (150mm+). Cooling channel corrosion severe. Repair estimate ₹22,00,000 exceeds 60% of asset value.",
    conditionRating:"critical",
    evaluationScore:12, evaluationChecklist: EVALUATION_CHECKLIST.map(c => ({...c,score:1,remark:"Critical"})),
    disposalMethod:"recycle", scrapVendor:"SV-002", scrapWeight:6800, scrapRate:45, estimatedScrapValue:306000,
    originalAssetValue:3200000, currentBookValue:96000, accumulatedDepreciation:3104000, netLoss:0, salvageValue:306000,
    mouldWeight:6800, mouldMaterial:"P20 Steel",
    lastMaintenanceDate:"2024-11-30", totalMaintenanceCost:620000, lifetimeShots:495000, maxShots:500000,
    requestedBy:USERS.maker, reviewedBy:USERS.reviewer, approvedBy:null, financeApprovedBy:null,
    requestDate:"2025-03-02", reviewDate:"2025-03-04", approvalDate:"", financeApprovalDate:"", disposalDate:"",
    gatePassNo:"", invoiceNo:"", ewayBillNo:"",
    certificateOfDestruction:"", environmentalClearance:"",
    beforeImages:[], afterImages:[], documents:[],
    remarks:"Crack propagation beyond repair. Components to be salvaged before scrap.",
    status:"Pending Approval",
    timeline:[
      { event:"Scrap Request Created",   by:"Rajesh Kumar",  at:"02 Mar 2025, 09:00 AM", note:"Irreparable damage – structural crack" },
      { event:"Technical Review Started", by:"Priya Mehta",   at:"03 Mar 2025, 10:00 AM", note:"On-site evaluation with CMM" },
      { event:"Review Completed",         by:"Priya Mehta",   at:"04 Mar 2025, 03:00 PM", note:"Score: 12/100 – Scrap recommended" },
    ]
  },
  {
    id:"SCR-2025-0018", mouldId:"MLD-0819", mouldName:"Fender Extension LH", mouldType:"Die Cast Mould", plant:"Plant C – Nashik",
    scrapReason:"obsolete", reasonDetail:"Vehicle model XM-200 discontinued. No alternate usage identified. Customer confirmed no further requirement.",
    conditionRating:"poor",
    evaluationScore:35, evaluationChecklist: EVALUATION_CHECKLIST.map(c => ({...c,score:4,remark:"Moderate wear"})),
    disposalMethod:"return_customer", scrapVendor:"", scrapWeight:5100, scrapRate:0, estimatedScrapValue:0,
    originalAssetValue:2100000, currentBookValue:42000, accumulatedDepreciation:2058000, netLoss:42000, salvageValue:0,
    mouldWeight:5100, mouldMaterial:"H13 Steel",
    lastMaintenanceDate:"2024-10-12", totalMaintenanceCost:290000, lifetimeShots:497800, maxShots:500000,
    requestedBy:USERS.maker, reviewedBy:null, approvedBy:null, financeApprovedBy:null,
    requestDate:"2025-03-05", reviewDate:"", approvalDate:"", financeApprovalDate:"", disposalDate:"",
    gatePassNo:"", invoiceNo:"", ewayBillNo:"",
    certificateOfDestruction:"", environmentalClearance:"",
    beforeImages:[], afterImages:[], documents:[],
    remarks:"Customer (OEM) confirmed model discontinuation. Awaiting return logistics.",
    status:"Under Review",
    timeline:[
      { event:"Scrap Request Created", by:"Rajesh Kumar", at:"05 Mar 2025, 11:30 AM", note:"Product obsolescence – model XM-200 discontinued" },
    ]
  },
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
.sb-brand{padding:22px 20px 18px;border-bottom:1px solid rgba(255,255,255,0.1)}
.sb-brand-row{display:flex;align-items:center;gap:10px}
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
.kpi-card.featured{background:linear-gradient(135deg,#dc2626 0%,#b91c1c 100%);border-color:transparent}
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
.tab-btn:hover{color:#dc2626}
.tab-btn.active{color:#dc2626;border-bottom-color:#dc2626}

/* ── TABLE ── */
.tbl{width:100%;border-collapse:separate;border-spacing:0}
.tbl th{font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;padding:10px 14px;text-align:left;border-bottom:2px solid #fce4e4;background:#fffafa}
.tbl td{font-size:13px;padding:12px 14px;border-bottom:1px solid #f3f4f6;color:#374151}
.tbl tr:hover td{background:#fffafa}
.tbl-link{color:#dc2626;font-weight:600;cursor:pointer;text-decoration:none}
.tbl-link:hover{text-decoration:underline}

/* ── BADGES ── */
.badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;white-space:nowrap}
.badge-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}

/* ── CARD ── */
.card{background:#fff;border-radius:16px;border:1px solid #e5e7eb;box-shadow:0 1px 6px rgba(0,0,0,.05);overflow:hidden;margin-bottom:18px}
.sec-hdr{display:flex;align-items:center;gap:12px;padding:14px 22px;background:linear-gradient(90deg,#fffafa 0%,#fff 100%);border-bottom:2px solid #fce4e4;position:relative}
.sec-hdr::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,#dc2626,#b91c1c);border-radius:0 2px 2px 0}
.sec-hdr-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
.sec-hdr-title{font-size:13px;font-weight:800;color:#1e1b4b;letter-spacing:.06em;text-transform:uppercase}
.sec-hdr-badge{font-size:10.5px;font-weight:600;background:#fef2f2;color:#dc2626;padding:2px 8px;border-radius:20px;border:1px solid #fca5a5;margin-left:auto}

/* ── FORM ── */
.form-grid{padding:20px 22px;display:grid;gap:18px 24px}
.cols-2{grid-template-columns:1fr 1fr}
.cols-3{grid-template-columns:1fr 1fr 1fr}
.cols-4{grid-template-columns:1fr 1fr 1fr 1fr}
.full-span{grid-column:1 / -1}

.field{display:flex;flex-direction:column;gap:5px}
.field-label{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;display:flex;align-items:center;gap:3px}
.req{color:#ef4444;font-size:11px}
.field-input,.field-select{height:42px;border:1.5px solid #e5e7eb;border-radius:10px;padding:0 13px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;color:#111827;background:#fafafa;outline:none;width:100%;transition:border-color .2s,box-shadow .2s,background .2s}
.field-input:focus,.field-select:focus{border-color:#dc2626;background:#fff;box-shadow:0 0 0 3px rgba(220,38,38,.08)}
.field-input::placeholder{color:#b0bec5;font-size:13px}
.field-input.readonly{background:#f9fafb;color:#6b7280;cursor:not-allowed}
.field-input.auto-fill{background:#fef2f2;border-color:#fca5a5;color:#991b1b;font-style:italic}
.field-select{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:34px}
.field-textarea{border:1.5px solid #e5e7eb;border-radius:10px;padding:10px 13px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;color:#111827;background:#fafafa;outline:none;width:100%;resize:vertical;min-height:60px;transition:border-color .2s,box-shadow .2s}
.field-textarea:focus{border-color:#dc2626;background:#fff;box-shadow:0 0 0 3px rgba(220,38,38,.08)}
.field-textarea::placeholder{color:#b0bec5;font-size:13px}
.field-hint{font-size:10.5px;color:#9ca3af;margin-top:1px}
.field-err{font-size:10.5px;color:#ef4444;margin-top:1px}
.field-input.err,.field-select.err{border-color:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.07)}
.num-wrap{position:relative}
.num-wrap .field-input{padding-right:50px}
.num-tag{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:10.5px;font-weight:700;color:#9ca3af;background:#f3f4f6;padding:2px 6px;border-radius:4px;pointer-events:none}

/* ── BUTTONS ── */
.btn{display:inline-flex;align-items:center;gap:7px;height:40px;padding:0 20px;border-radius:10px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;font-weight:600;cursor:pointer;transition:all .15s;border:none}
.btn-danger{background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;box-shadow:0 4px 14px rgba(220,38,38,.28)}
.btn-danger:hover{opacity:.9;transform:translateY(-1px)}
.btn-primary{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;box-shadow:0 4px 14px rgba(91,43,224,.28)}
.btn-primary:hover{opacity:.9;transform:translateY(-1px)}
.btn-success{background:linear-gradient(135deg,#10b981,#059669);color:#fff;box-shadow:0 4px 14px rgba(16,185,129,.28)}
.btn-success:hover{opacity:.9;transform:translateY(-1px)}
.btn-outline{background:#fff;color:#374151;border:1.5px solid #e5e7eb}
.btn-outline:hover{border-color:#dc2626;color:#dc2626}
.btn-ghost{background:transparent;color:#6b7280;border:1.5px solid transparent}
.btn-ghost:hover{background:#f3f4f6;color:#374151}
.btn-sm{height:34px;padding:0 14px;font-size:12px;border-radius:8px}
.btn-xs{height:28px;padding:0 10px;font-size:11px;border-radius:6px}

/* ── FILE UPLOAD ── */
.file-wrap{position:relative;display:flex;align-items:center;gap:0;height:42px;border:1.5px dashed #d1d5db;border-radius:10px;overflow:hidden;background:#fafafa;transition:border-color .2s}
.file-wrap:hover{border-color:#dc2626;background:#fffafa}
.file-wrap input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
.file-btn{height:100%;padding:0 14px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;font-size:12px;font-weight:600;white-space:nowrap;display:flex;align-items:center;gap:5px;flex-shrink:0}
.file-name{flex:1;padding:0 12px;font-size:12px;color:#9ca3af;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}

/* ── REASON SELECTOR ── */
.reason-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:20px 22px}
.reason-card{border:1.5px solid #e5e7eb;border-radius:12px;padding:14px 16px;cursor:pointer;transition:all .15s;background:#fafafa;display:flex;align-items:flex-start;gap:12px}
.reason-card:hover{border-color:#fca5a5;background:#fffafa}
.reason-card.selected{border-color:#dc2626;background:#fef2f2;box-shadow:0 0 0 3px rgba(220,38,38,.08)}
.reason-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;background:#f3f4f6}
.reason-card.selected .reason-icon{background:#fecaca}
.reason-label{font-size:13px;font-weight:700;color:#111827}
.reason-check{width:20px;height:20px;border-radius:50%;border:2px solid #d1d5db;margin-left:auto;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s}
.reason-card.selected .reason-check{background:#dc2626;border-color:#dc2626}

/* ── EVAL CHECKLIST ── */
.eval-item{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;transition:background .1s}
.eval-item:hover{background:#fffafa}
.eval-task{flex:1;font-size:13px;color:#374151}
.eval-cat{font-size:10px;font-weight:600;padding:2px 8px;border-radius:10px;background:#f3f4f6;color:#6b7280;white-space:nowrap}
.eval-weight{font-size:10px;font-weight:700;color:#9ca3af;white-space:nowrap;min-width:36px;text-align:center}
.eval-score{display:flex;gap:3px}
.eval-dot{width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;color:#6b7280;transition:all .12s}
.eval-dot:hover{border-color:#dc2626;color:#dc2626}
.eval-dot.on1{background:#fef2f2;border-color:#fca5a5;color:#dc2626}
.eval-dot.on2{background:#fffbeb;border-color:#fcd34d;color:#d97706}
.eval-dot.on3{background:#f0fdf4;border-color:#6ee7b7;color:#059669}
.eval-remark{height:30px;border:1px solid #e5e7eb;border-radius:6px;padding:0 8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:11.5px;color:#374151;background:#fafafa;outline:none;width:100px}
.eval-remark:focus{border-color:#dc2626}

/* ── DISPOSAL SELECTOR ── */
.disposal-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:20px 22px}
.disposal-card{border:1.5px solid #e5e7eb;border-radius:12px;padding:16px;cursor:pointer;transition:all .15s;background:#fafafa;text-align:center}
.disposal-card:hover{border-color:#fca5a5;background:#fffafa}
.disposal-card.selected{border-color:#dc2626;background:#fef2f2;box-shadow:0 0 0 3px rgba(220,38,38,.08)}
.disposal-icon{font-size:28px;margin-bottom:8px}
.disposal-label{font-size:13px;font-weight:700;color:#111827}
.disposal-desc{font-size:11px;color:#6b7280;margin-top:3px}

/* ── WORKFLOW STEPPER ── */
.wf-wrap{background:#fff;border-radius:14px;border:1px solid #e5e7eb;padding:18px 22px;margin-bottom:18px;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.wf-inner{display:flex;align-items:center}
.wf-step{display:flex;align-items:center;gap:7px;flex-shrink:0}
.wf-circle{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0;transition:all .2s}
.wf-done{background:linear-gradient(135deg,#059669,#047857);color:#fff;box-shadow:0 3px 9px rgba(5,150,105,.3)}
.wf-active{background:linear-gradient(135deg,#d97706,#b45309);color:#fff;box-shadow:0 3px 12px rgba(217,119,6,.35);animation:wfPulse 2s infinite}
.wf-pending{background:#f3f4f6;color:#9ca3af;border:1.5px solid #e5e7eb}
.wf-rejected{background:#dc2626;color:#fff}
@keyframes wfPulse{0%,100%{box-shadow:0 3px 9px rgba(217,119,6,.35)}50%{box-shadow:0 3px 18px rgba(217,119,6,.6)}}
.wf-lbl{font-size:11.5px;font-weight:700;color:#374151}
.wf-sub{font-size:9.5px;color:#9ca3af}
.wf-line{flex:1;height:2px;background:#e5e7eb;margin:0 8px;min-width:20px}
.wf-line.done{background:linear-gradient(90deg,#059669,#047857)}

/* ── DETAIL ── */
.detail-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;padding:16px 22px}
.detail-item{display:flex;flex-direction:column;gap:2px}
.detail-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af}
.detail-value{font-size:13.5px;font-weight:600;color:#111827}

/* ── ASSET WRITE-OFF CARD ── */
.writeoff-grid{display:grid;grid-template-columns:1fr 1fr;gap:0}
.wo-col{padding:16px 22px}
.wo-col:first-child{border-right:1px solid #f3f4f6}
.wo-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f3f4f6}
.wo-row:last-child{border-bottom:none}
.wo-label{font-size:13px;color:#374151}
.wo-value{font-size:13px;font-weight:600;color:#111827}
.wo-total{font-size:14px;font-weight:800;padding:10px 0 4px;border-top:2px solid #e5e7eb;margin-top:4px}

/* ── TIMELINE ── */
.tl-item{display:flex;gap:14px;position:relative;padding-bottom:18px}
.tl-item::before{content:'';position:absolute;left:13px;top:26px;bottom:0;width:2px;background:#fce4e4}
.tl-item:last-child::before{display:none}
.tl-dot{width:28px;height:28px;border-radius:50%;background:#fef2f2;border:2px solid #fca5a5;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;z-index:1}
.tl-body{flex:1}
.tl-event{font-size:13px;font-weight:700;color:#111827}
.tl-meta{font-size:11px;color:#6b7280;margin-top:2px}
.tl-note{font-size:12px;color:#4b5563;margin-top:3px;background:#fffafa;padding:6px 10px;border-radius:8px;border-left:3px solid #fca5a5}

/* ── SEARCH & FILTER ── */
.filter-bar{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap}
.search-box{display:flex;align-items:center;gap:8px;height:40px;border:1.5px solid #e5e7eb;border-radius:10px;padding:0 14px;background:#fff;flex:1;min-width:200px;max-width:360px}
.search-box input{border:none;outline:none;background:none;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#111827;width:100%}
.search-box input::placeholder{color:#9ca3af}
.filter-pill{display:flex;align-items:center;gap:5px;height:36px;padding:0 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;color:#374151;transition:all .15s;font-family:'Plus Jakarta Sans',sans-serif}
.filter-pill:hover,.filter-pill.active{border-color:#dc2626;color:#dc2626;background:#fef2f2}

/* ── PAGE HEADER ── */
.page-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.page-hdr-title{font-size:20px;font-weight:800;color:#111827;letter-spacing:-.025em}
.page-hdr-sub{font-size:13px;color:#6b7280;margin-top:3px}
.page-hdr-right{display:flex;gap:10px}

/* ── SCORE BAR ── */
.score-bar-wrap{display:flex;align-items:center;gap:10px;margin:8px 0}
.score-bar-bg{flex:1;height:10px;background:#f3f4f6;border-radius:5px;overflow:hidden}
.score-bar-fill{height:100%;border-radius:5px;transition:width .6s ease}
.score-value{font-size:16px;font-weight:800;min-width:50px;text-align:right}

/* ── FOOTER ── */
.form-footer{background:#fff;border-top:1px solid #e5e7eb;padding:16px 28px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;box-shadow:0 -2px 8px rgba(0,0,0,.04)}
.footer-hint{font-size:12px;color:#9ca3af;display:flex;align-items:center;gap:6px}
.footer-actions{display:flex;gap:10px}

/* ── TOAST ── */
.toast{position:fixed;bottom:24px;right:24px;background:#111827;color:#fff;padding:13px 20px;border-radius:12px;font-size:13.5px;font-weight:500;z-index:2000;display:flex;align-items:center;gap:10px;box-shadow:0 8px 30px rgba(0,0,0,.25);animation:toastIn .3s ease;border-left:4px solid #dc2626}
@keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

/* ── CONDITION BAR ── */
.cond-bar{display:flex;gap:3px;height:8px;border-radius:4px;overflow:hidden;width:100%;max-width:100px}
.cond-seg{flex:1;transition:background .2s}

/* ── SHOT PROGRESS ── */
.shot-bar{height:6px;background:#f3f4f6;border-radius:3px;overflow:hidden;margin-top:4px}
.shot-fill{height:100%;border-radius:3px}
`;

// ── HELPERS ─────────────────────────────────────────────────
function statusBadge(s) {
  const map = {
    "Under Review":      { bg:"#e0f2fe", color:"#0891b2", border:"#7dd3fc" },
    "Pending Approval":  { bg:"#fffbeb", color:"#d97706", border:"#fcd34d" },
    "Approved":          { bg:"#f0fdf4", color:"#059669", border:"#6ee7b7" },
    "Disposed":          { bg:"#f3f4f6", color:"#6b7280", border:"#d1d5db" },
    "Rejected":          { bg:"#fef2f2", color:"#dc2626", border:"#fca5a5" },
    "Disposal In Progress":{ bg:"#f5f3ff", color:"#7c3aed", border:"#c4b5fd" },
  };
  const m = map[s] || map["Under Review"];
  return <span className="badge" style={{ background:m.bg, color:m.color, border:`1px solid ${m.border}` }}><span className="badge-dot" style={{ background:m.color }}/>{s}</span>;
}

function conditionBadge(c) {
  const cr = CONDITION_RATINGS.find(x => x.key === c);
  if (!cr) return null;
  return <span className="badge" style={{ background:cr.bg, color:cr.color, border:`1px solid ${cr.border}` }}>{cr.label.split(" – ")[0]}</span>;
}

function reasonBadge(r) {
  const sr = SCRAP_REASONS.find(x => x.key === r);
  if (!sr) return null;
  return <span className="badge" style={{ background:"#fef2f2", color:sr.color, border:`1px solid #fca5a5` }}>{sr.icon} {sr.label.split(" – ")[0]}</span>;
}

function getScoreColor(score) {
  if (score <= 25) return "#dc2626";
  if (score <= 50) return "#d97706";
  if (score <= 75) return "#0891b2";
  return "#059669";
}

function initials(name) { return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2); }

// ══════════════════════════════════════════════════════════════
//  COMPONENT
// ══════════════════════════════════════════════════════════════
export default function MouldScrap() {
  const router = useRouter();
  const [records, setRecords] = useState(SEED_RECORDS);
  const [currentView, setCurrentView] = useState("list");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [createStep, setCreateStep] = useState(1); // 1: Mould & Reason, 2: Evaluation, 3: Disposal & Finance, 4: Review & Submit
  const [user, setUser] = useState({ name: "User", role: "Viewer" });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
  }, []);

  const userInitials = user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  // ── Form state ──
  const emptyForm = {
    mouldId:"", scrapReason:"", reasonDetail:"",
    conditionRating:"", evaluationChecklist: EVALUATION_CHECKLIST.map(c => ({...c, score:0, remark:""})),
    disposalMethod:"", scrapVendor:"", scrapWeight:"", scrapRate:"",
    remarks:"",
    gatePassNo:"", invoiceNo:"", ewayBillNo:"",
    environmentalClearance:"",
  };
  const [form, setForm] = useState({...emptyForm});
  const set = (k, v) => setForm(f => ({...f, [k]:v}));

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(null), 3500); };

  const selectedMould = MOULDS.find(m => m.id === form.mouldId);

  // ── Evaluation score ──
  const evalScore = form.evaluationChecklist.reduce((sum, c) => {
    const maxPerItem = 10;
    return sum + Math.round((c.score / 3) * c.weight);
  }, 0);
  const evalTotal = EVALUATION_CHECKLIST.reduce((sum, c) => sum + c.weight, 0);
  const evalPct = Math.round((evalScore / evalTotal) * 100);

  // ── Financial calculations ──
  const estScrapValue = (parseFloat(form.scrapWeight) || 0) * (parseFloat(form.scrapRate) || 0);

  // ── Filters ──
  const filtered = records.filter(r => {
    if (activeTab !== "all") {
      if (activeTab === "disposed" && r.status !== "Disposed") return false;
      if (activeTab === "pending" && !["Under Review","Pending Approval"].includes(r.status)) return false;
      if (activeTab === "approved" && r.status !== "Approved" && r.status !== "Disposal In Progress") return false;
    }
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
    pending: records.filter(r => ["Under Review","Pending Approval"].includes(r.status)).length,
    disposed: records.filter(r => r.status === "Disposed").length,
    totalAssetValue: records.reduce((s,r) => s + (r.originalAssetValue || 0), 0),
    totalSalvage: records.reduce((s,r) => s + (r.salvageValue || r.estimatedScrapValue || 0), 0),
  };

  // ── Validate ──
  const validateStep = (step) => {
    const e = {};
    if (step === 1) {
      if (!form.mouldId) e.mouldId = "Required";
      if (!form.scrapReason) e.scrapReason = "Select a reason";
      if (!form.reasonDetail.trim()) e.reasonDetail = "Provide detail";
    }
    if (step === 3) {
      if (!form.disposalMethod) e.disposalMethod = "Select disposal method";
    }
    return e;
  };

  const handleNext = () => {
    const e = validateStep(createStep);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setCreateStep(s => Math.min(s + 1, 4));
  };

  const handleBack = () => setCreateStep(s => Math.max(s - 1, 1));

  // ── Submit ──
  const handleSubmit = () => {
    const mould = MOULDS.find(m => m.id === form.mouldId);
    const vendor = SCRAP_VENDORS.find(v => v.code === form.scrapVendor);
    const newRec = {
      id: nextScrapId(),
      mouldId: form.mouldId, mouldName: mould?.name || "", mouldType: mould?.type || "", plant: mould?.plant || "",
      scrapReason: form.scrapReason,
      reasonDetail: form.reasonDetail,
      conditionRating: form.conditionRating,
      evaluationScore: evalPct,
      evaluationChecklist: form.evaluationChecklist,
      disposalMethod: form.disposalMethod,
      scrapVendor: form.scrapVendor,
      scrapWeight: parseFloat(form.scrapWeight) || 0,
      scrapRate: parseFloat(form.scrapRate) || (vendor?.rate || 0),
      estimatedScrapValue: estScrapValue,
      originalAssetValue: mould?.assetValue || 0,
      currentBookValue: mould?.bookValue || 0,
      accumulatedDepreciation: (mould?.assetValue || 0) - (mould?.bookValue || 0),
      netLoss: Math.max(0, (mould?.bookValue || 0) - estScrapValue),
      salvageValue: estScrapValue,
      mouldWeight: parseFloat(form.scrapWeight) || 0,
      mouldMaterial: mould?.type?.includes("Die Cast") ? "H13 Steel" : mould?.type?.includes("Blow") ? "Aluminium" : "P20 Steel",
      lastMaintenanceDate: mould?.lastMaint || "",
      totalMaintenanceCost: 0,
      lifetimeShots: mould?.shots || 0,
      maxShots: mould?.maxShots || 0,
      requestedBy: USERS.maker, reviewedBy:null, approvedBy:null, financeApprovedBy:null,
      requestDate: new Date().toISOString().slice(0,10),
      reviewDate:"", approvalDate:"", financeApprovalDate:"", disposalDate:"",
      gatePassNo:"", invoiceNo:"", ewayBillNo:"",
      certificateOfDestruction:"", environmentalClearance: form.environmentalClearance,
      beforeImages:[], afterImages:[], documents:[],
      remarks: form.remarks,
      status:"Under Review",
      timeline:[
        { event:"Scrap Request Created", by:USERS.maker.name, at:new Date().toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}), note:`${SCRAP_REASONS.find(r=>r.key===form.scrapReason)?.label || ""}` },
      ]
    };
    setRecords(prev => [newRec, ...prev]);
    setForm({...emptyForm});
    setCreateStep(1);
    setCurrentView("list");
    showToast(`🗑 Scrap request ${newRec.id} created for ${newRec.mouldId}`);
  };

  // ── Update evaluation score ──
  const setEvalScore = (idx, score) => {
    const items = [...form.evaluationChecklist];
    items[idx] = {...items[idx], score};
    set("evaluationChecklist", items);
  };
  const setEvalRemark = (idx, remark) => {
    const items = [...form.evaluationChecklist];
    items[idx] = {...items[idx], remark};
    set("evaluationChecklist", items);
  };

  // ── Workflow step state for detail view ──
  const getWorkflowSteps = (rec) => {
    const steps = [
      { label:"Request", sub:"Maker", icon:"📋" },
      { label:"Review", sub:"Technical", icon:"🔍" },
      { label:"Approval", sub:"Manager", icon:"✅" },
      { label:"Finance", sub:"Finance Head", icon:"💰" },
      { label:"Disposal", sub:"Execution", icon:"🗑" },
    ];
    const statusMap = {
      "Under Review": 1,
      "Pending Approval": 2,
      "Approved": 3,
      "Disposal In Progress": 3,
      "Disposed": 5,
      "Rejected": -1,
    };
    const activeIdx = statusMap[rec.status] || 0;
    return steps.map((s, i) => ({
      ...s,
      state: rec.status === "Rejected" ? (i === activeIdx ? "rejected" : i < activeIdx ? "done" : "pending")
        : i < activeIdx ? "done" : i === activeIdx ? "active" : "pending"
    }));
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
            <div className="sb-brand-row">
              <div className="sb-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><rect x="12" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".6"/><rect x="2" y="12" width="6" height="6" rx="1.5" fill="white" opacity=".6"/><rect x="12" y="12" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><circle cx="10" cy="10" r="1.8" fill="white"/></svg>
              </div>
              <div>
                <div className="sb-name">MouldSys <span>Enterprise</span></div>
                <div className="sb-sub">Asset Management Platform</div>
              </div>
            </div>
          </div>
          <div className="sb-nav">
            <div className="sb-section">Main</div>
            {NAV_ITEMS.map(n => (
              <div key={n.label} className={`sb-item${n.active?" active":""}`}
                onClick={() => router.push(n.route)}><span>{n.icon}</span>{n.label}</div>
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
          <div className="topbar">
            <div className="topbar-left">
              <div className="topbar-breadcrumb">
                <span>Modules</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div className="topbar-title">Mould Scrap & Disposal</div>
            </div>
            <div className="topbar-right">
              <div className="notif-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2a5 5 0 00-5 5v2l-1 2h12l-1-2V7a5 5 0 00-5-5zM6.5 13.5a1.5 1.5 0 003 0" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round"/></svg>
                <div className="notif-dot"/>
              </div>
              <div className="tb-user-pill"><div className="tb-avatar">{userInitials}</div><span className="tb-uname">{user.name}</span></div>
            </div>
          </div>

          <div className="content">

            {/* ══════════════ LIST VIEW ══════════════ */}
            {currentView === "list" && (<>
              <div className="page-hdr">
                <div>
                  <div className="page-hdr-title">Scrap & Disposal Management</div>
                  <div className="page-hdr-sub">Evaluate, approve and track mould scrap requests with full asset write-off</div>
                </div>
                <div className="page-hdr-right">
                  <button className="btn btn-danger" onClick={() => { setForm({...emptyForm}); setErrors({}); setCreateStep(1); setCurrentView("create"); }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                    New Scrap Request
                  </button>
                </div>
              </div>

              <div className="kpi-strip">
                <div className="kpi-card featured">
                  <div className="kpi-label white">Total Requests</div>
                  <div className="kpi-value white">{kpis.total}</div>
                  <div className="kpi-sub white">All scrap records</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-label">Pending Review</div>
                  <div className="kpi-value" style={{color:"#d97706"}}>{kpis.pending}</div>
                  <div className="kpi-sub">Awaiting action</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-label">Disposed</div>
                  <div className="kpi-value" style={{color:"#6b7280"}}>{kpis.disposed}</div>
                  <div className="kpi-sub">Completed</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-label">Asset Value</div>
                  <div className="kpi-value">₹{(kpis.totalAssetValue/100000).toFixed(1)}L</div>
                  <div className="kpi-sub">Original value</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-label">Salvage Recovered</div>
                  <div className="kpi-value" style={{color:"#059669"}}>₹{(kpis.totalSalvage/1000).toFixed(1)}K</div>
                  <div className="kpi-sub">Scrap sale value</div>
                </div>
              </div>

              <div className="tab-strip">
                {[{k:"all",l:"All Requests"},{k:"pending",l:"Pending"},{k:"approved",l:"Approved"},{k:"disposed",l:"Disposed"}].map(t => (
                  <button key={t.k} className={`tab-btn${activeTab===t.k?" active":""}`} onClick={()=>setActiveTab(t.k)}>{t.l}</button>
                ))}
              </div>

              <div className="filter-bar">
                <div className="search-box">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#9ca3af" strokeWidth="1.5"/><path d="M10 10l3 3" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <input placeholder="Search by Scrap ID, Mould ID or Name…" value={search} onChange={e=>setSearch(e.target.value)}/>
                </div>
                {["all","Under Review","Pending Approval","Approved","Disposed","Rejected"].map(s => (
                  <button key={s} className={`filter-pill${filterStatus===s?" active":""}`} onClick={()=>setFilterStatus(s)}>{s==="all"?"All Status":s}</button>
                ))}
              </div>

              <div className="card" style={{overflow:"auto"}}>
                <table className="tbl">
                  <thead><tr>
                    <th>Scrap ID</th><th>Mould</th><th>Reason</th><th>Condition</th><th>Eval Score</th><th>Book Value</th><th>Salvage</th><th>Status</th><th>Action</th>
                  </tr></thead>
                  <tbody>
                    {filtered.length === 0 && <tr><td colSpan={9} style={{textAlign:"center",color:"#9ca3af",padding:40}}>No scrap records found</td></tr>}
                    {filtered.map(r => (
                      <tr key={r.id}>
                        <td><span className="tbl-link" onClick={()=>{setSelectedRecord(r);setCurrentView("detail")}}>{r.id}</span></td>
                        <td>
                          <div style={{fontWeight:600}}>{r.mouldId}</div>
                          <div style={{fontSize:11,color:"#6b7280"}}>{r.mouldName}</div>
                        </td>
                        <td>{reasonBadge(r.scrapReason)}</td>
                        <td>{conditionBadge(r.conditionRating)}</td>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:50,height:6,background:"#f3f4f6",borderRadius:3,overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${r.evaluationScore}%`,background:getScoreColor(r.evaluationScore),borderRadius:3}}/>
                            </div>
                            <span style={{fontSize:12,fontWeight:700,color:getScoreColor(r.evaluationScore)}}>{r.evaluationScore}%</span>
                          </div>
                        </td>
                        <td style={{fontWeight:600}}>₹{(r.currentBookValue/1000).toFixed(0)}K</td>
                        <td style={{fontWeight:600,color:"#059669"}}>₹{((r.salvageValue||r.estimatedScrapValue)/1000).toFixed(0)}K</td>
                        <td>{statusBadge(r.status)}</td>
                        <td><button className="btn btn-outline btn-xs" onClick={()=>{setSelectedRecord(r);setCurrentView("detail")}}>View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>)}

            {/* ══════════════ CREATE VIEW ══════════════ */}
            {currentView === "create" && (<>
              <div className="page-hdr">
                <div>
                  <div className="page-hdr-title">New Scrap Request</div>
                  <div className="page-hdr-sub">Step {createStep} of 4 — {["Mould & Reason","Technical Evaluation","Disposal & Finance","Review & Submit"][createStep-1]}</div>
                </div>
                <div className="page-hdr-right">
                  <button className="btn btn-ghost" onClick={()=>{setCurrentView("list");setForm({...emptyForm});setCreateStep(1);setErrors({})}}>← Back to List</button>
                </div>
              </div>

              {/* Step indicator */}
              <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:22}}>
                {["Mould & Reason","Evaluation","Disposal","Submit"].map((s,i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",flex:i<3?1:"initial"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,
                        background:i+1<createStep?"linear-gradient(135deg,#059669,#047857)":i+1===createStep?"linear-gradient(135deg,#dc2626,#b91c1c)":"#f3f4f6",
                        color:i+1<=createStep?"#fff":"#9ca3af",border:i+1>createStep?"1.5px solid #e5e7eb":"none",
                        boxShadow:i+1===createStep?"0 3px 12px rgba(220,38,38,.35)":"none"}}>
                        {i+1<createStep ? <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> : i+1}
                      </div>
                      <span style={{fontSize:12,fontWeight:i+1===createStep?700:500,color:i+1<=createStep?"#111827":"#9ca3af"}}>{s}</span>
                    </div>
                    {i<3 && <div style={{flex:1,height:2,background:i+1<createStep?"#059669":"#e5e7eb",margin:"0 8px",minWidth:20}}/>}
                  </div>
                ))}
              </div>

              {/* ── STEP 1: Mould Selection & Scrap Reason ── */}
              {createStep === 1 && (<>
                <div className="card">
                  <div className="sec-hdr">
                    <div className="sec-hdr-icon" style={{background:"#fef2f2"}}>🔩</div>
                    <div className="sec-hdr-title">Mould Selection</div>
                    <span className="sec-hdr-badge">Step 1</span>
                  </div>
                  <div className="form-grid cols-3">
                    <div className="field">
                      <label className="field-label">Mould ID <span className="req">*</span></label>
                      <select className={`field-select${errors.mouldId?" err":""}`} value={form.mouldId} onChange={e=>set("mouldId",e.target.value)}>
                        <option value="">— Select Mould —</option>
                        {MOULDS.map(m => <option key={m.id} value={m.id}>{m.id} – {m.name} ({m.condition})</option>)}
                      </select>
                      {errors.mouldId && <div className="field-err">{errors.mouldId}</div>}
                    </div>
                    <div className="field"><label className="field-label">Mould Name</label><input className={`field-input${selectedMould?" auto-fill":""}`} value={selectedMould?.name || ""} readOnly/></div>
                    <div className="field"><label className="field-label">Mould Type</label><input className={`field-input${selectedMould?" auto-fill":""}`} value={selectedMould?.type || ""} readOnly/></div>
                    <div className="field"><label className="field-label">Plant / Location</label><input className={`field-input${selectedMould?" auto-fill":""}`} value={selectedMould ? `${selectedMould.plant} – ${selectedMould.location}` : ""} readOnly/></div>
                    <div className="field"><label className="field-label">Current Status</label><input className={`field-input${selectedMould?" auto-fill":""}`} value={selectedMould?.status || ""} readOnly/></div>
                    <div className="field"><label className="field-label">Condition</label><input className={`field-input${selectedMould?" auto-fill":""}`} value={selectedMould?.condition || ""} readOnly/></div>
                  </div>
                  {selectedMould && (
                    <div style={{padding:"0 22px 16px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:16}}>
                      <div style={{background:"#f9fafb",borderRadius:10,padding:"10px 14px",border:"1px solid #e5e7eb"}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:".06em"}}>Shot Count</div>
                        <div style={{fontSize:15,fontWeight:800,color:"#111827",marginTop:4}}>{selectedMould.shots.toLocaleString()}</div>
                        <div className="shot-bar"><div className="shot-fill" style={{width:`${(selectedMould.shots/selectedMould.maxShots)*100}%`,background:(selectedMould.shots/selectedMould.maxShots) > 0.9 ? "#dc2626" : "#d97706"}}/></div>
                        <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>{((selectedMould.shots/selectedMould.maxShots)*100).toFixed(1)}% of {selectedMould.maxShots.toLocaleString()}</div>
                      </div>
                      <div style={{background:"#f9fafb",borderRadius:10,padding:"10px 14px",border:"1px solid #e5e7eb"}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:".06em"}}>Original Value</div>
                        <div style={{fontSize:15,fontWeight:800,color:"#111827",marginTop:4}}>₹{(selectedMould.assetValue/100000).toFixed(2)}L</div>
                      </div>
                      <div style={{background:"#f9fafb",borderRadius:10,padding:"10px 14px",border:"1px solid #e5e7eb"}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:".06em"}}>Book Value</div>
                        <div style={{fontSize:15,fontWeight:800,color:"#dc2626",marginTop:4}}>₹{(selectedMould.bookValue/1000).toFixed(0)}K</div>
                      </div>
                      <div style={{background:"#f9fafb",borderRadius:10,padding:"10px 14px",border:"1px solid #e5e7eb"}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:".06em"}}>Age</div>
                        <div style={{fontSize:15,fontWeight:800,color:"#111827",marginTop:4}}>{selectedMould.age}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card">
                  <div className="sec-hdr">
                    <div className="sec-hdr-icon" style={{background:"#fffbeb"}}>⚠️</div>
                    <div className="sec-hdr-title">Scrap Reason</div>
                    {errors.scrapReason && <span className="sec-hdr-badge" style={{background:"#fef2f2",color:"#dc2626",borderColor:"#fca5a5"}}>{errors.scrapReason}</span>}
                  </div>
                  <div className="reason-grid">
                    {SCRAP_REASONS.map(r => (
                      <div key={r.key} className={`reason-card${form.scrapReason===r.key?" selected":""}`} onClick={()=>set("scrapReason",r.key)}>
                        <div className="reason-icon" style={{background:form.scrapReason===r.key?"#fecaca":"#f3f4f6"}}>{r.icon}</div>
                        <div style={{flex:1}}><div className="reason-label">{r.label}</div></div>
                        <div className="reason-check">
                          {form.scrapReason===r.key && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="form-grid cols-2" style={{paddingTop:0}}>
                    <div className="field full-span">
                      <label className="field-label">Detailed Reason / Justification <span className="req">*</span></label>
                      <textarea className={`field-textarea${errors.reasonDetail?" err":""}`} value={form.reasonDetail} onChange={e=>set("reasonDetail",e.target.value)} placeholder="Provide detailed justification for scrapping this mould…" rows={4}/>
                      {errors.reasonDetail && <div className="field-err">{errors.reasonDetail}</div>}
                    </div>
                    <div className="field">
                      <label className="field-label">Condition Rating</label>
                      <select className="field-select" value={form.conditionRating} onChange={e=>set("conditionRating",e.target.value)}>
                        <option value="">— Select —</option>
                        {CONDITION_RATINGS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label">Mould Condition Photos</label>
                      <div className="file-wrap">
                        <div className="file-btn"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 4l3-3 3 3M1 9v1a1 1 0 001 1h8a1 1 0 001-1V9" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> Upload Photos</div>
                        <span className="file-name">JPG, PNG · Max 5MB each</span>
                        <input type="file" accept="image/*" multiple/>
                      </div>
                    </div>
                  </div>
                </div>
              </>)}

              {/* ── STEP 2: Technical Evaluation ── */}
              {createStep === 2 && (<>
                <div className="card">
                  <div className="sec-hdr">
                    <div className="sec-hdr-icon" style={{background:"#e0f2fe"}}>🔍</div>
                    <div className="sec-hdr-title">Technical Evaluation Checklist</div>
                    <span className="sec-hdr-badge" style={{background:evalPct<=30?"#fef2f2":evalPct<=60?"#fffbeb":"#f0fdf4",
                      color:getScoreColor(evalPct),borderColor:evalPct<=30?"#fca5a5":evalPct<=60?"#fcd34d":"#6ee7b7"}}>
                      Score: {evalPct}%
                    </span>
                  </div>
                  <div style={{padding:"16px 22px"}}>
                    <div style={{marginBottom:14}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#6b7280",marginBottom:6}}>Overall Evaluation Score</div>
                      <div className="score-bar-wrap">
                        <div className="score-bar-bg"><div className="score-bar-fill" style={{width:`${evalPct}%`,background:getScoreColor(evalPct)}}/></div>
                        <span className="score-value" style={{color:getScoreColor(evalPct)}}>{evalPct}%</span>
                      </div>
                      <div style={{fontSize:11,color:"#9ca3af"}}>Rate each item 1 (Critical) to 3 (Acceptable). Score below 30% = recommended for scrap.</div>
                    </div>

                    <div style={{display:"grid",gridTemplateColumns:"1fr 80px 60px 120px 100px",gap:0,padding:"8px 14px",background:"#fafbff",borderRadius:8,marginBottom:8}}>
                      <span style={{fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:".06em"}}>Evaluation Task</span>
                      <span style={{fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:".06em"}}>Category</span>
                      <span style={{fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:".06em",textAlign:"center"}}>Wt.</span>
                      <span style={{fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:".06em",textAlign:"center"}}>Score (1-3)</span>
                      <span style={{fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:".06em"}}>Remark</span>
                    </div>
                    {form.evaluationChecklist.map((ck, i) => (
                      <div key={ck.id} className="eval-item" style={{display:"grid",gridTemplateColumns:"1fr 80px 60px 120px 100px",gap:0}}>
                        <span className="eval-task">{ck.task}</span>
                        <span className="eval-cat">{ck.category}</span>
                        <span className="eval-weight">{ck.weight}%</span>
                        <div className="eval-score" style={{justifyContent:"center"}}>
                          {[1,2,3].map(s => (
                            <div key={s} className={`eval-dot${ck.score===s?(s===1?" on1":s===2?" on2":" on3"):""}`} onClick={()=>setEvalScore(i,s)}>
                              {s}
                            </div>
                          ))}
                        </div>
                        <input className="eval-remark" placeholder="Remark" value={ck.remark} onChange={e=>setEvalRemark(i,e.target.value)}/>
                      </div>
                    ))}
                  </div>
                </div>
              </>)}

              {/* ── STEP 3: Disposal & Finance ── */}
              {createStep === 3 && (<>
                <div className="card">
                  <div className="sec-hdr">
                    <div className="sec-hdr-icon" style={{background:"#f5f3ff"}}>🗑</div>
                    <div className="sec-hdr-title">Disposal Method</div>
                    {errors.disposalMethod && <span className="sec-hdr-badge" style={{background:"#fef2f2",color:"#dc2626",borderColor:"#fca5a5"}}>{errors.disposalMethod}</span>}
                  </div>
                  <div className="disposal-grid">
                    {DISPOSAL_METHODS.map(d => (
                      <div key={d.key} className={`disposal-card${form.disposalMethod===d.key?" selected":""}`} onClick={()=>set("disposalMethod",d.key)}>
                        <div className="disposal-icon">{d.icon}</div>
                        <div className="disposal-label">{d.label}</div>
                        <div className="disposal-desc">{d.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div className="sec-hdr">
                    <div className="sec-hdr-icon" style={{background:"#fffbeb"}}>💰</div>
                    <div className="sec-hdr-title">Financial & Scrap Details</div>
                    <span className="sec-hdr-badge" style={{background:"#fffbeb",color:"#d97706",borderColor:"#fcd34d"}}>Asset Write-Off</span>
                  </div>
                  <div className="form-grid cols-3">
                    <div className="field">
                      <label className="field-label">Scrap Vendor / Buyer</label>
                      <select className="field-select" value={form.scrapVendor} onChange={e=>{
                        set("scrapVendor",e.target.value);
                        const v = SCRAP_VENDORS.find(v=>v.code===e.target.value);
                        if (v) set("scrapRate", String(v.rate));
                      }}>
                        <option value="">— Select Vendor —</option>
                        {SCRAP_VENDORS.map(v => <option key={v.code} value={v.code}>{v.name} – {v.city} ({v.rate} {v.uom})</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label">Mould Weight (kg)</label>
                      <div className="num-wrap">
                        <input type="number" className="field-input" value={form.scrapWeight} onChange={e=>set("scrapWeight",e.target.value)} placeholder="e.g. 4200"/>
                        <span className="num-tag">Kg</span>
                      </div>
                    </div>
                    <div className="field">
                      <label className="field-label">Scrap Rate (₹/kg)</label>
                      <div className="num-wrap">
                        <input type="number" className="field-input" value={form.scrapRate} onChange={e=>set("scrapRate",e.target.value)} placeholder="e.g. 42"/>
                        <span className="num-tag">₹/kg</span>
                      </div>
                    </div>
                  </div>
                  {selectedMould && (
                    <div style={{padding:"0 22px 20px"}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                        <div style={{background:"#f9fafb",borderRadius:12,padding:16,border:"1px solid #e5e7eb"}}>
                          <div style={{fontSize:12,fontWeight:800,color:"#111827",marginBottom:12,textTransform:"uppercase",letterSpacing:".06em"}}>Asset Summary</div>
                          {[
                            ["Original Asset Value", `₹${(selectedMould.assetValue/100000).toFixed(2)}L`],
                            ["Accumulated Depreciation", `₹${((selectedMould.assetValue - selectedMould.bookValue)/100000).toFixed(2)}L`],
                            ["Current Book Value", `₹${(selectedMould.bookValue/1000).toFixed(0)}K`],
                          ].map(([l,v],i) => (
                            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<2?"1px solid #e5e7eb":"none"}}>
                              <span style={{fontSize:13,color:"#374151"}}>{l}</span>
                              <span style={{fontSize:13,fontWeight:600,color:"#111827"}}>{v}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{background:"#fffafa",borderRadius:12,padding:16,border:"1px solid #fce4e4"}}>
                          <div style={{fontSize:12,fontWeight:800,color:"#dc2626",marginBottom:12,textTransform:"uppercase",letterSpacing:".06em"}}>Scrap Value Estimate</div>
                          {[
                            ["Estimated Scrap Value", `₹${estScrapValue.toLocaleString()}`],
                            ["Net Loss on Disposal", `₹${Math.max(0, selectedMould.bookValue - estScrapValue).toLocaleString()}`],
                            ["Recovery %", `${selectedMould.assetValue > 0 ? ((estScrapValue / selectedMould.assetValue) * 100).toFixed(1) : 0}%`],
                          ].map(([l,v],i) => (
                            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<2?"1px solid #fce4e4":"none"}}>
                              <span style={{fontSize:13,color:"#374151"}}>{l}</span>
                              <span style={{fontSize:13,fontWeight:700,color:i===1?"#dc2626":"#059669"}}>{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="form-grid cols-3" style={{paddingTop:0}}>
                    <div className="field">
                      <label className="field-label">Environmental Clearance No.</label>
                      <input className="field-input" value={form.environmentalClearance} onChange={e=>set("environmentalClearance",e.target.value)} placeholder="e.g. ENV-CLR-2025-XXX"/>
                    </div>
                    <div className="field">
                      <label className="field-label">Supporting Documents</label>
                      <div className="file-wrap">
                        <div className="file-btn" style={{background:"linear-gradient(135deg,#7c3aed,#6d28d9)"}}><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 4l3-3 3 3M1 9v1a1 1 0 001 1h8a1 1 0 001-1V9" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> Upload</div>
                        <span className="file-name">PDF, Images · Max 10MB</span>
                        <input type="file" multiple/>
                      </div>
                    </div>
                    <div className="field">
                      <label className="field-label">Remarks / Notes</label>
                      <textarea className="field-textarea" value={form.remarks} onChange={e=>set("remarks",e.target.value)} placeholder="Additional notes…" rows={2}/>
                    </div>
                  </div>
                </div>
              </>)}

              {/* ── STEP 4: Review & Submit ── */}
              {createStep === 4 && (<>
                <div className="card">
                  <div className="sec-hdr">
                    <div className="sec-hdr-icon" style={{background:"#f0fdf4"}}>📋</div>
                    <div className="sec-hdr-title">Review Summary</div>
                    <span className="sec-hdr-badge" style={{background:"#f0fdf4",color:"#059669",borderColor:"#6ee7b7"}}>Final Check</span>
                  </div>
                  <div className="detail-grid">
                    <div className="detail-item"><span className="detail-label">Mould</span><span className="detail-value">{form.mouldId} – {selectedMould?.name}</span></div>
                    <div className="detail-item"><span className="detail-label">Type</span><span className="detail-value">{selectedMould?.type}</span></div>
                    <div className="detail-item"><span className="detail-label">Plant</span><span className="detail-value">{selectedMould?.plant}</span></div>
                    <div className="detail-item"><span className="detail-label">Scrap Reason</span><span className="detail-value">{SCRAP_REASONS.find(r=>r.key===form.scrapReason)?.label || "—"}</span></div>
                    <div className="detail-item"><span className="detail-label">Condition</span><span className="detail-value">{CONDITION_RATINGS.find(c=>c.key===form.conditionRating)?.label || "—"}</span></div>
                    <div className="detail-item"><span className="detail-label">Eval Score</span><span className="detail-value" style={{color:getScoreColor(evalPct)}}>{evalPct}%</span></div>
                    <div className="detail-item"><span className="detail-label">Disposal Method</span><span className="detail-value">{DISPOSAL_METHODS.find(d=>d.key===form.disposalMethod)?.label || "—"}</span></div>
                    <div className="detail-item"><span className="detail-label">Scrap Vendor</span><span className="detail-value">{SCRAP_VENDORS.find(v=>v.code===form.scrapVendor)?.name || "N/A"}</span></div>
                    <div className="detail-item"><span className="detail-label">Estimated Scrap Value</span><span className="detail-value" style={{color:"#059669"}}>₹{estScrapValue.toLocaleString()}</span></div>
                  </div>
                  {selectedMould && (
                    <div style={{padding:"0 22px 16px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                      <div style={{background:"#fef2f2",borderRadius:10,padding:"12px 14px",border:"1px solid #fca5a5",textAlign:"center"}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#dc2626",textTransform:"uppercase"}}>Book Value</div>
                        <div style={{fontSize:18,fontWeight:800,color:"#dc2626",marginTop:4}}>₹{(selectedMould.bookValue/1000).toFixed(0)}K</div>
                      </div>
                      <div style={{background:"#f0fdf4",borderRadius:10,padding:"12px 14px",border:"1px solid #6ee7b7",textAlign:"center"}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#059669",textTransform:"uppercase"}}>Salvage Value</div>
                        <div style={{fontSize:18,fontWeight:800,color:"#059669",marginTop:4}}>₹{estScrapValue.toLocaleString()}</div>
                      </div>
                      <div style={{background:"#fffbeb",borderRadius:10,padding:"12px 14px",border:"1px solid #fcd34d",textAlign:"center"}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#d97706",textTransform:"uppercase"}}>Net Loss</div>
                        <div style={{fontSize:18,fontWeight:800,color:"#d97706",marginTop:4}}>₹{Math.max(0, selectedMould.bookValue - estScrapValue).toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                  <div style={{padding:"0 22px 16px"}}>
                    <div style={{background:"#fffafa",border:"1.5px solid #fca5a5",borderRadius:12,padding:16,display:"flex",gap:12,alignItems:"flex-start"}}>
                      <span style={{fontSize:20}}>⚠️</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:"#991b1b"}}>Irreversible Action Warning</div>
                        <div style={{fontSize:12,color:"#7f1d1d",marginTop:3}}>Submitting this scrap request will initiate the approval workflow. Once approved and disposed, the mould asset will be permanently written off from the asset register. This action cannot be undone.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>)}
            </>)}

            {/* ══════════════ DETAIL VIEW ══════════════ */}
            {currentView === "detail" && selectedRecord && (<>
              <div className="page-hdr">
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div className="page-hdr-title">{selectedRecord.id}</div>
                    {statusBadge(selectedRecord.status)}
                    {conditionBadge(selectedRecord.conditionRating)}
                  </div>
                  <div className="page-hdr-sub">{selectedRecord.mouldId} – {selectedRecord.mouldName} | {selectedRecord.plant}</div>
                </div>
                <div className="page-hdr-right">
                  <button className="btn btn-ghost" onClick={()=>{setCurrentView("list");setSelectedRecord(null)}}>← Back to List</button>
                </div>
              </div>

              {/* Workflow stepper */}
              <div className="wf-wrap">
                <div className="wf-inner">
                  {getWorkflowSteps(selectedRecord).map((s,i,arr) => (
                    <div key={i} style={{display:"flex",alignItems:"center",flex:i<arr.length-1?1:"initial"}}>
                      <div className="wf-step">
                        <div className={`wf-circle ${s.state==="done"?"wf-done":s.state==="active"?"wf-active":s.state==="rejected"?"wf-rejected":"wf-pending"}`}>
                          {s.state==="done" ? <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> : s.icon}
                        </div>
                        <div>
                          <div className="wf-lbl">{s.label}</div>
                          <div className="wf-sub">{s.sub}</div>
                        </div>
                      </div>
                      {i<arr.length-1 && <div className={`wf-line${s.state==="done"?" done":""}`}/>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Overview */}
              <div className="card">
                <div className="sec-hdr">
                  <div className="sec-hdr-icon" style={{background:"#fef2f2"}}>📋</div>
                  <div className="sec-hdr-title">Scrap Request Overview</div>
                  {reasonBadge(selectedRecord.scrapReason)}
                </div>
                <div className="detail-grid">
                  <div className="detail-item"><span className="detail-label">Mould ID</span><span className="detail-value">{selectedRecord.mouldId}</span></div>
                  <div className="detail-item"><span className="detail-label">Mould Name</span><span className="detail-value">{selectedRecord.mouldName}</span></div>
                  <div className="detail-item"><span className="detail-label">Mould Type</span><span className="detail-value">{selectedRecord.mouldType}</span></div>
                  <div className="detail-item"><span className="detail-label">Plant</span><span className="detail-value">{selectedRecord.plant}</span></div>
                  <div className="detail-item"><span className="detail-label">Lifetime Shots</span><span className="detail-value">{selectedRecord.lifetimeShots?.toLocaleString()} / {selectedRecord.maxShots?.toLocaleString()}</span></div>
                  <div className="detail-item"><span className="detail-label">Mould Material</span><span className="detail-value">{selectedRecord.mouldMaterial}</span></div>
                  <div className="detail-item"><span className="detail-label">Weight</span><span className="detail-value">{selectedRecord.mouldWeight?.toLocaleString()} Kg</span></div>
                  <div className="detail-item"><span className="detail-label">Eval Score</span><span className="detail-value" style={{color:getScoreColor(selectedRecord.evaluationScore)}}>{selectedRecord.evaluationScore}%</span></div>
                  <div className="detail-item"><span className="detail-label">Disposal Method</span><span className="detail-value">{DISPOSAL_METHODS.find(d=>d.key===selectedRecord.disposalMethod)?.label || "—"}</span></div>
                </div>
                <div style={{padding:"0 22px 16px"}}>
                  <div className="detail-label" style={{marginBottom:4}}>Reason Detail</div>
                  <div style={{fontSize:13,color:"#374151",background:"#fffafa",padding:"10px 14px",borderRadius:10,border:"1px solid #fce4e4"}}>{selectedRecord.reasonDetail}</div>
                </div>
              </div>

              {/* Financial */}
              <div className="card">
                <div className="sec-hdr">
                  <div className="sec-hdr-icon" style={{background:"#fffbeb"}}>💰</div>
                  <div className="sec-hdr-title">Financial Summary & Asset Write-Off</div>
                </div>
                <div className="writeoff-grid">
                  <div className="wo-col">
                    <div style={{fontSize:11,fontWeight:800,color:"#6b7280",textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>Asset Details</div>
                    {[
                      ["Original Asset Value", `₹${(selectedRecord.originalAssetValue/100000).toFixed(2)}L`],
                      ["Accumulated Depreciation", `₹${(selectedRecord.accumulatedDepreciation/100000).toFixed(2)}L`],
                      ["Current Book Value", `₹${(selectedRecord.currentBookValue/1000).toFixed(0)}K`],
                      ["Total Maintenance Spent", `₹${(selectedRecord.totalMaintenanceCost/1000).toFixed(0)}K`],
                    ].map(([l,v],i) => (
                      <div key={i} className="wo-row"><span className="wo-label">{l}</span><span className="wo-value">{v}</span></div>
                    ))}
                  </div>
                  <div className="wo-col">
                    <div style={{fontSize:11,fontWeight:800,color:"#dc2626",textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>Disposal & Recovery</div>
                    {[
                      ["Scrap Vendor", SCRAP_VENDORS.find(v=>v.code===selectedRecord.scrapVendor)?.name || "N/A"],
                      ["Scrap Weight", `${selectedRecord.scrapWeight?.toLocaleString()} Kg`],
                      ["Scrap Rate", `₹${selectedRecord.scrapRate}/kg`],
                      ["Salvage / Scrap Value", `₹${(selectedRecord.salvageValue||selectedRecord.estimatedScrapValue||0).toLocaleString()}`],
                      ["Net Loss", `₹${(selectedRecord.netLoss||0).toLocaleString()}`],
                    ].map(([l,v],i) => (
                      <div key={i} className="wo-row"><span className="wo-label">{l}</span><span className="wo-value" style={{color:i===4?"#dc2626":i===3?"#059669":"#111827"}}>{v}</span></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Compliance & Docs */}
              <div className="card">
                <div className="sec-hdr">
                  <div className="sec-hdr-icon" style={{background:"#f0fdf4"}}>📄</div>
                  <div className="sec-hdr-title">Compliance & Documentation</div>
                </div>
                <div className="detail-grid" style={{gridTemplateColumns:"1fr 1fr 1fr 1fr"}}>
                  <div className="detail-item"><span className="detail-label">Gate Pass No.</span><span className="detail-value">{selectedRecord.gatePassNo || "—"}</span></div>
                  <div className="detail-item"><span className="detail-label">Invoice No.</span><span className="detail-value">{selectedRecord.invoiceNo || "—"}</span></div>
                  <div className="detail-item"><span className="detail-label">E-Way Bill</span><span className="detail-value">{selectedRecord.ewayBillNo || "—"}</span></div>
                  <div className="detail-item"><span className="detail-label">Env. Clearance</span><span className="detail-value">{selectedRecord.environmentalClearance || "—"}</span></div>
                  <div className="detail-item"><span className="detail-label">Requested By</span><span className="detail-value">{selectedRecord.requestedBy?.name || "—"}</span></div>
                  <div className="detail-item"><span className="detail-label">Reviewed By</span><span className="detail-value">{selectedRecord.reviewedBy?.name || "Pending"}</span></div>
                  <div className="detail-item"><span className="detail-label">Approved By</span><span className="detail-value">{selectedRecord.approvedBy?.name || "Pending"}</span></div>
                  <div className="detail-item"><span className="detail-label">Finance Approved</span><span className="detail-value">{selectedRecord.financeApprovedBy?.name || "Pending"}</span></div>
                </div>
              </div>

              {/* Timeline */}
              <div className="card">
                <div className="sec-hdr">
                  <div className="sec-hdr-icon" style={{background:"#fef2f2"}}>⏱</div>
                  <div className="sec-hdr-title">Activity Timeline</div>
                </div>
                <div style={{padding:"18px 22px"}}>
                  {selectedRecord.timeline?.map((t,i) => (
                    <div key={i} className="tl-item">
                      <div className="tl-dot">{i===0?"🔔":i===selectedRecord.timeline.length-1?"📌":"➡️"}</div>
                      <div className="tl-body">
                        <div className="tl-event">{t.event}</div>
                        <div className="tl-meta">By {t.by} · {t.at}</div>
                        {t.note && <div className="tl-note">{t.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>)}

          </div>{/* /content */}

          {/* Footer for create view */}
          {currentView === "create" && (
            <div className="form-footer">
              <div className="footer-hint">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#9ca3af" strokeWidth="1.2"/><line x1="7" y1="5" x2="7" y2="7.5" stroke="#9ca3af" strokeWidth="1.4" strokeLinecap="round"/><circle cx="7" cy="9.5" r=".7" fill="#9ca3af"/></svg>
                Step {createStep} of 4 — {["Select mould & reason","Evaluate mould condition","Configure disposal","Review & submit"][createStep-1]}
              </div>
              <div className="footer-actions">
                {createStep > 1 && <button className="btn btn-ghost" onClick={handleBack}>← Previous</button>}
                <button className="btn btn-outline" onClick={()=>{setCurrentView("list");setForm({...emptyForm});setCreateStep(1);setErrors({})}}>Cancel</button>
                {createStep < 4 && <button className="btn btn-primary" onClick={handleNext}>Next Step →</button>}
                {createStep === 4 && (
                  <button className="btn btn-danger" onClick={handleSubmit}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Submit Scrap Request
                  </button>
                )}
              </div>
            </div>
          )}

        </div>{/* /main */}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}