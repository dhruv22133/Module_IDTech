'use client';
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// ═══════════════════════════════════════════════════════════
//  REPORTS MODULE — MouldSys Enterprise
// ═══════════════════════════════════════════════════════════

const PLANTS=["","Plant A - Mumbai","Plant B - Pune","Plant C - Nashik","Plant D - Aurangabad"];
const TYPES=["","Injection Mould","Blow Mould","Die Cast Mould","Compression Mould"];
const STATUSES=["","Active","At Vendor","Under Maintenance","In Transit","End of Life","Retired","Scrapped"];
const VENDORS=["","Precision Tooling Co.","Elite Mould Makers","Bharat Engineering Works","Star Jobwork Solutions"];
const DEPTS=["","Production","Store","Maintenance","Quality","Tool Room","Security"];
const LOCS=["","Shop Floor A","Shop Floor B","Warehouse 1","Warehouse 2","Maintenance Bay","At Vendor"];
const CONDITIONS=["","Good","Fair","Poor","Critical"];

const REPORT_LIST = [
  { id:"mould_wise",    label:"Mould Wise",         icon:"🔩" },
  { id:"location_wise", label:"Location Wise",       icon:"📍" },
  { id:"vendor_wise",   label:"Vendor Wise",          icon:"🏭" },
  { id:"maintenance",   label:"Maintenance Report",   icon:"🔧" },
  { id:"transfer_log",  label:"Asset Transfer",       icon:"🔄" },
  { id:"transaction_log",label:"Transaction Log",     icon:"📋" },
  { id:"scrap_disposal", label:"Scrap/Disposal Assets",icon:"🗑" },
  { id:"aging",          label:"Aging Report",         icon:"📆" },
  { id:"physical_inv",   label:"Physical Inventory",   icon:"📡" },
  { id:"depreciation",   label:"Depreciation Report",  icon:"📉" },
  { id:"tag_replace",    label:"Tag Replacement Log",  icon:"🏷" },
];

// ── HARDCODED FALLBACK DATA ──
const DATA = [
  { id:1,tagId:"48464D000001",code:"MLD-0042",name:"Bumper Front LH",uom:"Nos",bom:"BOM-042",status:"At Vendor",desc:"Front bumper LH cavity",assetType:"Injection Mould",cat:"Die And Moulds",subCat:"Injection",plant:"Plant A - Mumbai",dept:"Production",loc:"Vendor - Precision Tooling",vendor:"Precision Tooling Co.",shots:470000,maxShots:500000,lifePct:94,cost:1850000,bookVal:185000,age:6.2,capDate:"2019-01-15",condition:"Fair",lastMaint:"2025-01-15",weight:4250,costCenter:"CC-001" },
  { id:2,tagId:"48464D000002",code:"MLD-0118",name:"Dashboard Panel RH",uom:"Nos",bom:"BOM-118",status:"At Vendor",desc:"Dashboard panel RH cavity",assetType:"Injection Mould",cat:"Die And Moulds",subCat:"Injection",plant:"Plant B - Pune",dept:"Production",loc:"Vendor - Elite Mould",vendor:"Elite Mould Makers",shots:440000,maxShots:500000,lifePct:88,cost:2200000,bookVal:264000,age:5.8,capDate:"2019-06-10",condition:"Poor",lastMaint:"2025-02-01",weight:3800,costCenter:"CC-002" },
  { id:3,tagId:"48464D000003",code:"MLD-0203",name:"Door Trim Inner LH",uom:"Nos",bom:"BOM-203",status:"End of Life",desc:"Door trim inner LH blow mould",assetType:"Blow Mould",cat:"Die And Moulds",subCat:"Blow",plant:"Plant A - Mumbai",dept:"Production",loc:"Warehouse 1",vendor:"Elite Mould Makers",shots:499200,maxShots:500000,lifePct:99.8,cost:1600000,bookVal:32000,age:7.5,capDate:"2017-09-20",condition:"Critical",lastMaint:"2024-12-20",weight:5200,costCenter:"CC-001" },
  { id:4,tagId:"48464D000004",code:"MLD-0087",name:"Grille Centre",uom:"Nos",bom:"BOM-087",status:"At Vendor",desc:"Centre grille die cast",assetType:"Die Cast Mould",cat:"Die And Moulds",subCat:"Die Cast",plant:"Plant C - Nashik",dept:"Tool Room",loc:"Vendor - Precision Tooling",vendor:"Precision Tooling Co.",shots:395000,maxShots:500000,lifePct:79,cost:2800000,bookVal:560000,age:4.1,capDate:"2021-02-05",condition:"Good",lastMaint:"2025-01-28",weight:5100,costCenter:"CC-003" },
  { id:5,tagId:"48464D000005",code:"MLD-0311",name:"Headlamp Bezel RH",uom:"Nos",bom:"BOM-311",status:"Under Maintenance",desc:"Headlamp bezel RH injection",assetType:"Injection Mould",cat:"Die And Moulds",subCat:"Injection",plant:"Plant D - Aurangabad",dept:"Maintenance",loc:"Maintenance Bay",vendor:"Bharat Engineering Works",shots:380000,maxShots:500000,lifePct:76,cost:1950000,bookVal:487500,age:8.0,capDate:"2017-03-12",condition:"Poor",lastMaint:"2025-02-10",weight:3600,costCenter:"CC-004" },
];

const AUDIT_DATA = [
  { id:"AUD-0012",vendor:"Precision Tooling Co.",city:"Pune",date:"05 Mar 2025",operator:"Rajesh Kumar",device:"Zebra MC3300",expected:4,found:4,notFound:0,extra:0,matchPct:100 },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#eef1f5;min-height:100vh;color:#111827}
.shell{display:flex;height:100vh;overflow:hidden}
.sb{width:220px;flex-shrink:0;background:linear-gradient(170deg,#3b3fe8 0%,#5b2be0 45%,#7c2fe8 100%);display:flex;flex-direction:column;position:relative;overflow:hidden}
.sb::after{content:'';position:absolute;bottom:-60px;left:-60px;width:240px;height:240px;border-radius:50%;background:rgba(255,255,255,.05)}
.sb-brand{padding:22px 20px 18px;border-bottom:1px solid rgba(255,255,255,.1)}
.sb-row{display:flex;align-items:center;gap:10px}
.sb-logo{width:36px;height:36px;background:rgba(255,255,255,.18);border-radius:9px;display:flex;align-items:center;justify-content:center}
.sb-nm{font-size:14px;font-weight:700;color:#fff}.sb-nm span{font-weight:400;opacity:.8}
.sb-tag{font-size:10px;color:rgba(255,255,255,.5);margin-top:1px}
.sb-nav{flex:1;padding:14px 12px;display:flex;flex-direction:column;gap:4px;overflow-y:auto}
.sb-sec{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.35);padding:10px 12px 4px;margin-top:6px}
.sb-lnk{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;cursor:pointer;color:rgba(255,255,255,.65);font-size:13px;font-weight:500;transition:background .15s}
.sb-lnk:hover{background:rgba(255,255,255,.1);color:#fff}
.sb-lnk.on{background:rgba(255,255,255,.18);color:#fff;font-weight:600}
.sb-foot{padding:16px 14px;border-top:1px solid rgba(255,255,255,.1)}
.sb-av{width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff}
.mn{flex:1;display:flex;flex-direction:column;overflow:hidden}
.top{height:56px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;box-shadow:0 1px 3px rgba(0,0,0,.05)}
.top-t{font-size:16px;font-weight:800;color:#111827}
.rl{display:flex;flex:1;overflow:hidden}
.rs{width:195px;flex-shrink:0;background:#fff;border-right:1px solid #e5e7eb;overflow-y:auto}
.rs-t{font-size:13px;font-weight:800;color:#374151;padding:14px 16px 10px;display:flex;align-items:center;gap:6px}
.rs-item{display:flex;align-items:center;gap:8px;padding:9px 16px;cursor:pointer;font-size:12.5px;color:#4b5563;transition:all .1s;border-left:3px solid transparent}
.rs-item:hover{background:#f0f4ff;color:#1e3a5f}
.rs-item.on{background:#e8f0fe;color:#1e3a5f;font-weight:700;border-left-color:#3b5bdb}
.rc{flex:1;overflow-y:auto;padding:16px 20px;background:#eef1f5}
.fcard{background:#fff;margin-bottom:16px;border-top:4px solid #3b5bdb}
.fcard-t{background:#3b5bdb;color:#fff;font-size:12.5px;font-weight:700;padding:9px 16px}
.fcard-b{padding:16px 18px}
.fg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px 18px}
.ff{display:flex;align-items:center;gap:0}
.ff-l{font-size:12px;font-weight:700;color:#1e3a5f;min-width:100px;flex-shrink:0}
.ff-i{flex:1;height:36px;border:1px solid #ccc;border-radius:3px;padding:0 10px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12.5px;color:#111;background:#fff;outline:none}
.ff-i:focus{border-color:#3b5bdb}
.ff-i::placeholder{color:#aaa}
.ff-s{flex:1;height:36px;border:1px solid #ccc;border-radius:3px;padding:0 8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12.5px;color:#374151;background:#fff;outline:none;cursor:pointer}
.factions{margin-top:14px}
.fbtn{height:36px;padding:0 22px;border:none;border-radius:3px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer}
.fbtn-go{background:#3b5bdb;color:#fff}.fbtn-go:hover{background:#2f4bc7}
.ebar{background:#3b5bdb;padding:8px 14px;display:flex;align-items:center;gap:6px}
.ebtn{height:30px;padding:0 14px;border-radius:3px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;border:none;color:#fff}
.eb-print{background:#6c757d}.eb-print:hover{background:#5a6268}
.eb-excel{background:#198754}.eb-excel:hover{background:#157347}
.eb-csv{background:#6f42c1}.eb-csv:hover{background:#5a32a3}
.eb-col{background:#0dcaf0;color:#000}.eb-col:hover{background:#0bb5d6}
.esrch{margin-left:auto;display:flex;align-items:center;gap:6px;color:#fff;font-size:12px;font-weight:500}
.esrch input{height:28px;width:170px;border:1px solid rgba(255,255,255,.4);border-radius:3px;padding:0 8px;font-size:12px;color:#fff;background:rgba(255,255,255,.15);outline:none}
.esrch input::placeholder{color:rgba(255,255,255,.5)}
.esrch input:focus{border-color:#fff;background:rgba(255,255,255,.25)}
.tw{background:#fff;border:1px solid #bbb;border-top:none;overflow-x:auto;margin-bottom:0}
table{width:100%;border-collapse:collapse;min-width:1200px}
thead th{padding:10px 10px;text-align:left;font-size:11px;font-weight:700;color:#fff;background:#4a5d8e;border:1px solid #6a7db0;white-space:nowrap;cursor:pointer;user-select:none;position:sticky;top:0;z-index:1;vertical-align:middle;line-height:1.35}
thead th:hover{background:#3d5080}
thead th .sa{margin-left:3px;font-size:8px;opacity:.7}
tbody td{padding:8px 10px;font-size:12px;color:#333;border:1px solid #ddd;white-space:normal;vertical-align:middle;line-height:1.4;background:#fff}
tbody tr:nth-child(even) td{background:#f8f9fb}
tbody tr:hover td{background:#e8f0fe}
.pg{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#fff;border:1px solid #bbb;border-top:none}
.pg-i{font-size:12px;color:#6b7280}
.pg-btns{display:flex;gap:2px}
.pgb{min-width:28px;height:28px;padding:0 6px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #ccc;background:#fff;color:#333}
.pgb.on{background:#3b5bdb;border-color:#3b5bdb;color:#fff}
.pgb:hover:not(.on){background:#e8f0fe}
.toast{position:fixed;bottom:20px;right:20px;background:#1e293b;color:#fff;padding:11px 18px;border-radius:6px;font-size:13px;z-index:2000;box-shadow:0 6px 20px rgba(0,0,0,.25);animation:ti .25s ease;border-left:4px solid #3b5bdb}
@keyframes ti{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.ftag{display:inline-block;padding:3px 8px;border-radius:4px;font-size:10px;font-weight:700;color:#fff;letter-spacing:1px}

/* Restore Audit Specific UI Styles */
.ag{display:grid;gap:14px}
.ac{background:#fff;border:1px solid #ddd;border-radius:6px;padding:14px 18px;cursor:pointer;transition:border .2s}
.ac:hover{border-color:#3b5bdb}
.ac-v{font-size:15px;font-weight:800;color:#111827;margin-bottom:2px}
.ac-m{font-size:12px;color:#6b7280;margin-bottom:12px}
.ac-stats{display:flex;gap:12px;margin-bottom:14px}
.ac-st{background:#f8f9fb;border:1px solid #eee;border-radius:4px;padding:8px 12px;flex:1;text-align:center}
.ac-st-n{font-size:18px;font-weight:800;color:#333}
.ac-st-l{font-size:9.5px;text-transform:uppercase;color:#888;margin-top:2px;font-weight:700}
.ac-bar{height:6px;background:#eee;border-radius:3px;overflow:hidden;margin-bottom:8px}
.ac-fill{height:100%;border-radius:3px}
.ac-tag{display:inline-block;padding:3px 8px;border-radius:4px;font-size:10px;font-weight:700}

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

const NAV_ITEMS=[
  { label: "Dashboard", icon: "📊", route: "/dashboard" },
  { label: "User Management", icon: "👥", route: "/user-management" },
  { label: "Masters", icon: "🗂", route: "/masters" },
  { label: "Mould Registry", icon: "🔩", route: "/mould-registry" },
  { label: "Transfers & Challan", icon: "🔄", route: "/challan"},
  { label: "Mould Return", icon: "📥", route: "/return" },
  { label: "Depreciation", icon: "📉", route: "/depreciation" },
  { label: "Maintenance", icon: "🔧", route: "/maintenance" },
  { label: "Scrap / Dispose", icon: "🗑", route: "/scrap" },
  { label: "Reports", icon: "📈", route: "/reports",active: true  }
];

function fmt(n){return "\u20B9"+Math.round(n).toLocaleString("en-IN")}

const COLS={
  mould_wise:[{k:"id",l:"Id",w:40},{k:"tagId",l:"Tag Id",w:110},{k:"code",l:"Asset Code",w:90},{k:"name",l:"Asset Name",w:130},{k:"uom",l:"Unit of Measure",w:70},{k:"bom",l:"BOM No.",w:70},{k:"status",l:"Asset Status",w:90},{k:"desc",l:"Asset Description",w:120},{k:"assetType",l:"Asset Type",w:110},{k:"cat",l:"Asset Category",w:100},{k:"subCat",l:"Asset Sub Category",w:90},{k:"plant",l:"Plant",w:100},{k:"dept",l:"Department",w:80},{k:"loc",l:"Location",w:130}],
  location_wise:[{k:"id",l:"Id",w:40},{k:"tagId",l:"Tag Id",w:110},{k:"code",l:"Asset Code",w:90},{k:"name",l:"Name",w:130},{k:"loc",l:"Current Location",w:140},{k:"plant",l:"Plant",w:100},{k:"status",l:"Status",w:90},{k:"vendor",l:"Vendor",w:130},{k:"lastMaint",l:"Last Maint.",w:90}],
  vendor_wise:[{k:"id",l:"Id",w:40},{k:"tagId",l:"Tag Id",w:110},{k:"code",l:"Asset Code",w:90},{k:"name",l:"Name",w:130},{k:"vendor",l:"Vendor",w:150},{k:"status",l:"Status",w:90},{k:"shots",l:"Shots",w:70},{k:"condition",l:"Condition",w:80},{k:"lastMaint",l:"Last Maint.",w:90}],
  maintenance:[{k:"id",l:"Id",w:90},{k:"code",l:"Mould ID",w:90},{k:"name",l:"Name",w:130},{k:"status",l:"Status",w:90},{k:"condition",l:"Condition",w:80},{k:"lastMaint",l:"Last Maint.",w:90},{k:"plant",l:"Plant",w:100},{k:"dept",l:"Dept",w:80}],
  transfer_log:[{k:"id",l:"Id",w:90},{k:"code",l:"Mould ID",w:90},{k:"name",l:"Name",w:130},{k:"vendor",l:"Vendor",w:150},{k:"status",l:"Status",w:90},{k:"loc",l:"Location",w:130},{k:"plant",l:"Plant",w:100}],
  scrap_disposal:[{k:"id",l:"Id",w:90},{k:"code",l:"Mould ID",w:90},{k:"name",l:"Name",w:130},{k:"status",l:"Status",w:90},{k:"condition",l:"Condition",w:80},{k:"cost",l:"Asset Value",w:90},{k:"bookVal",l:"Book Value",w:90},{k:"lifePct",l:"Eval. Score",w:60}],
  aging:[{k:"id",l:"Id",w:40},{k:"code",l:"Mould ID",w:90},{k:"name",l:"Name",w:130},{k:"assetType",l:"Type",w:110},{k:"capDate",l:"Cap. Date",w:90},{k:"age",l:"Age (Yrs)",w:65},{k:"cost",l:"Original Cost",w:100},{k:"bookVal",l:"Book Value",w:90},{k:"lifePct",l:"Life %",w:60}],
  depreciation:[{k:"id",l:"Id",w:40},{k:"code",l:"Mould ID",w:90},{k:"name",l:"Name",w:130},{k:"cost",l:"Cost",w:90},{k:"bookVal",l:"Book Value",w:90},{k:"age",l:"Age",w:55},{k:"shots",l:"Shots",w:70},{k:"maxShots",l:"Max Shots",w:70},{k:"lifePct",l:"Life %",w:60}],
  tag_replace:[{k:"id",l:"Id",w:40},{k:"tagId",l:"Tag Id",w:110},{k:"code",l:"Mould ID",w:90},{k:"name",l:"Name",w:130},{k:"plant",l:"Plant",w:100},{k:"status",l:"Status",w:90}],
};

export default function ReportsModule(){
  const router = useRouter();
  const [user, setUser] = useState({ name: "User", role: "Viewer" });
  const [roles, setRoles] = useState([]);
  
  // Database States
  const [dbMoulds, setDbMoulds] = useState([]);
  const [dbMaint, setDbMaint] = useState([]);
  const [dbTransfers, setDbTransfers] = useState([]);
  const [dbScrap, setDbScrap] = useState([]);

  const[rpt,setRpt]=useState("mould_wise");
  const[toast,setToast]=useState(null);
  const[tblQ,setTblQ]=useState("");
  const[sortK,setSortK]=useState(null);
  const[sortD,setSortD]=useState("asc");
  const[pg,setPg]=useState(1);
  const[selAudit,setSelAudit]=useState(null);
  
  // Filters
  const[fTag,setFTag]=useState("");
  const[fCode,setFCode]=useState("");
  const[fName,setFName]=useState("");
  const[fType,setFType]=useState("");
  const[fPlant,setFPlant]=useState("");
  const[fLoc,setFLoc]=useState("");
  const[fStatus,setFStatus]=useState("");
  const[fVendor,setFVendor]=useState("");
  const[fDept,setFDept]=useState("");
  const[fFrom,setFFrom]=useState("");
  const[fTo,setFTo]=useState("");
  const[filtered,setFiltered]=useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
    
    fetch('/api/roles').then(r=>r.json()).then(setRoles).catch(console.error);

    // Fetch live data
    Promise.all([
      fetch('/api/moulds?_t='+Date.now(), {cache:'no-store'}).then(r=>r.ok?r.json():[]),
      fetch('/api/maintenance?_t='+Date.now(), {cache:'no-store'}).then(r=>r.ok?r.json():[]),
      fetch('/api/transfers?_t='+Date.now(), {cache:'no-store'}).then(r=>r.ok?r.json():[]),
      fetch('/api/scrap?_t='+Date.now(), {cache:'no-store'}).then(r=>r.ok?r.json():[])
    ]).then(([moulds, maint, trans, scrap]) => {
      setDbMoulds(Array.isArray(moulds) ? moulds : []);
      setDbMaint(Array.isArray(maint) ? maint : []);
      setDbTransfers(Array.isArray(trans) ? trans : []);
      setDbScrap(Array.isArray(scrap) ? scrap : []);
    }).catch(console.error);

  }, [router]);

  const activeRole = roles.find(r => r.name === user.role);
  const privs = activeRole ? activeRole.privs : null;
  const canViewReports = user.role === 'Admin' || privs?.report === true;

  const currentUserInitials = user.name ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "U";
  const flash=m=>{setToast(m);setTimeout(()=>setToast(null),2500)};
  const PER=8;

  const isAudit = rpt === "physical_inv";

  // Dynamic Data Transformation
  const activeData = useMemo(() => {
      if (rpt === 'mould_wise') {
          return dbMoulds.map((m, i) => ({
              id: i + 1,
              tagId: m.tagId || "-",
              code: m.mouldIdAssetCode || m.mould_id_code || "-",
              name: m.mouldName || m.mould_name || "-",
              uom: m.baseUnitOfMeasure || m.base_uom || "-",
              bom: m.subNumber || m.sub_number || "-",
              status: "Active", 
              desc: m.description || "-",
              assetType: m.assetClassName || m.asset_class_name || "-",
              cat: "Die And Moulds",
              subCat: "-",
              plant: m.plant || "-",
              dept: m.costCenterName || m.cost_center_name || "-",
              loc: m.locationName || m.location_name || "-"
          }));
      }
      if (rpt === 'maintenance') {
          return dbMaint.map(m => ({
              id: m.id,
              code: m.mouldId,
              name: m.mouldName,
              status: m.status,
              condition: "—", 
              lastMaint: m.scheduledStart || m.reportedDate,
              plant: m.plant,
              dept: m.issueCategory || "—"
          }));
      }
      if (rpt === 'transfer_log') {
          return dbTransfers.map(t => ({
              id: t.id,
              code: t.mouldId,
              name: t.mouldName,
              vendor: t.toName,
              status: t.status,
              loc: t.toType,
              plant: t.fromName
          }));
      }
      if (rpt === 'scrap_disposal') {
          return dbScrap.map(s => ({
              id: s.id,
              code: s.mouldId,
              name: s.mouldName,
              status: s.status,
              condition: s.conditionRating,
              cost: Number(s.originalAssetValue || 0),
              bookVal: Number(s.currentBookValue || 0),
              lifePct: `${s.evaluationScore}%`
          }));
      }
      return DATA; 
  }, [rpt, dbMoulds, dbMaint, dbTransfers, dbScrap]);

  const applyFilters = useCallback(() => {
    let d = [...activeData];
    if(fTag) d = d.filter(m => (m.tagId || "").toLowerCase().includes(fTag.toLowerCase()));
    if(fCode) d = d.filter(m => (m.code || "").toLowerCase().includes(fCode.toLowerCase()));
    if(fName) d = d.filter(m => (m.name || "").toLowerCase().includes(fName.toLowerCase()));
    if(fType) d = d.filter(m => m.assetType === fType);
    if(fPlant) d = d.filter(m => m.plant === fPlant);
    if(fLoc) {
      if(fLoc === "At Vendor") d = d.filter(m => (m.loc || "").startsWith("Vendor"));
      else d = d.filter(m => (m.loc || "").includes(fLoc));
    }
    if(fStatus) d = d.filter(m => m.status === fStatus);
    if(fVendor) d = d.filter(m => m.vendor === fVendor);
    if(fDept) d = d.filter(m => m.dept === fDept);
    
    setFiltered(d);
    setPg(1);
  }, [activeData, fTag, fCode, fName, fType, fPlant, fLoc, fStatus, fVendor, fDept]);

  useEffect(() => {
      applyFilters();
  }, [applyFilters]);

  const tblData=useMemo(()=>{
    let d=[...filtered];
    if(tblQ){const s=tblQ.toLowerCase();d=d.filter(m=>(m.code||"").toLowerCase().includes(s)||(m.name||"").toLowerCase().includes(s)||(m.tagId||"").toLowerCase().includes(s))}
    if(sortK){d.sort((a,b)=>{const av=a[sortK],bv=b[sortK];if(typeof av==="number")return sortD==="asc"?av-bv:bv-av;return sortD==="asc"?String(av).localeCompare(String(bv)):String(bv).localeCompare(String(av))})}
    return d;
  },[filtered,tblQ,sortK,sortD]);

  const totalPg=Math.ceil(tblData.length/PER);
  const paged=tblData.slice((pg-1)*PER,pg*PER);
  const cols=COLS[rpt]||COLS.mould_wise;
  const toggleSort=k=>{if(sortK===k)setSortD(d=>d==="asc"?"desc":"asc");else{setSortK(k);setSortD("asc")}};
  const curLabel=REPORT_LIST.find(r=>r.id===rpt)?.label||"Report";

  const renderCell=(m,c)=>{
    const v=m[c.k];
    if(v==null) return "-";
    if(c.k==="cost"||c.k==="bookVal")return fmt(Number(v));
    if(c.k==="shots"||c.k==="maxShots")return Number(v).toLocaleString("en-IN");
    return String(v);
  };

  // ── Dynamic Audit Stats Simulator ──
  const expectedCount = dbMoulds.length || (selAudit ? selAudit.expected : 0);
  // Simulating 1 out of every 8 moulds missing for demonstration, unless DB is empty
  const foundCount = dbMoulds.length > 0 ? dbMoulds.filter((_, i) => i % 8 !== 0).length : (selAudit ? selAudit.found : 0);
  const notFoundCount = expectedCount - foundCount;
  const matchPct = expectedCount > 0 ? Math.round((foundCount / expectedCount) * 100) : 100;

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

  if (user.name === "User") {
      return (
          <>
            <style>{CSS}</style>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5', color: '#111827'}}>
                Loading privileges...
            </div>
          </>
      );
  }

  if (!canViewReports) {
      return (
          <>
            <style>{CSS}</style>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', background: '#f0f2f5', color: '#111827'}}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Access Denied</h2>
                <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>You do not have permission to view the Reports module.</p>
                <button onClick={() => router.push('/dashboard')} style={{ height: 38, padding: "0 18px", borderRadius: 9, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}>Return to Dashboard</button>
            </div>
          </>
      );
  }

  return(<>
    <style>{CSS}</style>
    <div className="shell">
      <div className="sb">
        <div className="sb-brand">
          <div className="sb-row" style={{ padding: "0 4px" }}>
            <div className="sb-logo"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><rect x="12" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".6"/><rect x="2" y="12" width="6" height="6" rx="1.5" fill="white" opacity=".6"/><rect x="12" y="12" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><circle cx="10" cy="10" r="1.8" fill="white"/></svg></div>
            <div><div className="sb-nm">MouldSys <span>Enterprise</span></div><div className="sb-tag">Asset Management Platform</div></div>
          </div>
        </div>
        <div className="sb-nav">
          <div className="sb-sec">Main</div>
          {NAV_ITEMS.map(n=><div key={n.label} className={`sb-lnk${n.active?" on":""}`} onClick={()=>router.push(n.route)}><span>{n.icon}</span>{n.label}</div>)}
        </div>
        <div className="sb-foot">
          <div className="sb-row">
            <div className="sb-av">{currentUserInitials}</div>
            <div><div style={{fontSize:12,fontWeight:600,color:"#fff"}}>{user.name}</div><div style={{fontSize:10,color:"rgba(255,255,255,.5)"}}>{user.role}</div></div>
          </div>
        </div>
      </div>
      
      <div className="mn">
        <div className="top">
            <div className="top-t">Reports</div>
            <button className="logout-btn" onClick={handleLogout}>
                Logout ➔
            </button>
        </div>
        <div className="rl">
          {/* Report sidebar */}
          <div className="rs">
            <div className="rs-t">📈 Report</div>
            {REPORT_LIST.map(r=><div key={r.id} className={`rs-item${rpt===r.id?" on":""}`} onClick={()=>{setRpt(r.id);setPg(1);setTblQ("");setSelAudit(null);setSortK(null)}}><span>{r.icon}</span>{r.label}</div>)}
          </div>

          {/* Content */}
          <div className="rc">

            {/* ═══ REGULAR REPORTS ═══ */}
            {!isAudit && <>
                {/* Filter form */}
                <div className="fcard">
                <div className="fcard-t">{REPORT_LIST.find(r=>r.id===rpt)?.icon} {curLabel}</div>
                <div className="fcard-b">
                    <div className="fg">
                    <div className="ff"><span className="ff-l">Tag Id</span><input className="ff-i" placeholder="Enter Tag Id.." value={fTag} onChange={e=>setFTag(e.target.value)}/></div>
                    <div className="ff"><span className="ff-l">Asset Code</span><input className="ff-i" placeholder="Enter Asset Code.." value={fCode} onChange={e=>setFCode(e.target.value)}/></div>
                    <div className="ff"><span className="ff-l">Asset Name</span><input className="ff-i" placeholder="Enter Asset Name.." value={fName} onChange={e=>setFName(e.target.value)}/></div>
                    <div className="ff"><span className="ff-l">Asset Type</span><select className="ff-s" value={fType} onChange={e=>setFType(e.target.value)}><option value="">Select Asset Type</option>{TYPES.filter(Boolean).map(t=><option key={t}>{t}</option>)}</select></div>
                    <div className="ff"><span className="ff-l">Department</span><select className="ff-s" value={fDept} onChange={e=>setFDept(e.target.value)}><option value="">Select Department</option>{DEPTS.filter(Boolean).map(d=><option key={d}>{d}</option>)}</select></div>
                    <div className="ff"><span className="ff-l">Select Plant</span><select className="ff-s" value={fPlant} onChange={e=>setFPlant(e.target.value)}><option value="">Select Plant</option>{PLANTS.filter(Boolean).map(p=><option key={p}>{p}</option>)}</select></div>
                    <div className="ff"><span className="ff-l">Location</span><select className="ff-s" value={fLoc} onChange={e=>setFLoc(e.target.value)}><option value="">Select Location</option>{LOCS.filter(Boolean).map(l=><option key={l}>{l}</option>)}</select></div>
                    <div className="ff"><span className="ff-l">Asset Status</span><select className="ff-s" value={fStatus} onChange={e=>setFStatus(e.target.value)}><option value="">Select Asset Status</option>{STATUSES.filter(Boolean).map(s=><option key={s}>{s}</option>)}</select></div>
                    <div className="ff"><span className="ff-l">Vendor</span><select className="ff-s" value={fVendor} onChange={e=>setFVendor(e.target.value)}><option value="">Select Vendor</option>{VENDORS.filter(Boolean).map(v=><option key={v}>{v}</option>)}</select></div>
                    <div className="ff"><span className="ff-l">From Date</span><input type="date" className="ff-i" value={fFrom} onChange={e=>setFFrom(e.target.value)}/></div>
                    <div className="ff"><span className="ff-l">To Date</span><input type="date" className="ff-i" value={fTo} onChange={e=>setFTo(e.target.value)}/></div>
                    </div>
                    <div className="factions">
                    <button className="fbtn fbtn-go" onClick={applyFilters}>Submit</button>
                    <button className="fbtn" style={{background:"#f1f5f9",color:"#475569",border:"1px solid #cbd5e1",marginLeft:10}} onClick={()=>{setFTag("");setFCode("");setFName("");setFType("");setFPlant("");setFLoc("");setFStatus("");setFVendor("");setFDept("");setFFrom("");setFTo("");}}>Clear</button>
                    </div>
                </div>
                </div>

                {/* Export bar */}
                <div className="ebar">
                <button className="ebtn eb-print" onClick={()=>flash("Printing...")}>Print</button>
                <button className="ebtn eb-excel" onClick={()=>flash("Excel exported")}>Excel</button>
                <button className="ebtn eb-csv" onClick={()=>flash("CSV exported")}>CSV</button>
                <button className="ebtn eb-col">Column visibility ▾</button>
                <div className="esrch"><span>Search:</span><input value={tblQ} onChange={e=>{setTblQ(e.target.value);setPg(1)}} placeholder=""/></div>
                </div>

                {/* Table */}
                <div className="tw" style={{maxHeight:"calc(100vh - 380px)",overflowY:"auto"}}>
                <table>
                    <thead><tr>{cols.map(c=><th key={c.k} style={{minWidth:c.w}} onClick={()=>toggleSort(c.k)}>{c.l}<span className="sa">{sortK===c.k?(sortD==="asc"?"\u25B2":"\u25BC"):"\u21C5"}</span></th>)}</tr></thead>
                    <tbody>
                    {paged.length===0&&<tr><td colSpan={cols.length} style={{textAlign:"center",padding:30,color:"#999"}}>No data found</td></tr>}
                    {paged.map(m=><tr key={m.id}>{cols.map(c=><td key={c.k}>{renderCell(m,c)}</td>)}</tr>)}
                    </tbody>
                </table>
                </div>

                {/* Pagination */}
                <div className="pg">
                <div className="pg-i">Showing {tblData.length===0?0:(pg-1)*PER+1} to {Math.min(pg*PER,tblData.length)} of {tblData.length} entries</div>
                <div className="pg-btns">
                    <button className="pgb" onClick={()=>setPg(1)}>First</button>
                    <button className="pgb" onClick={()=>setPg(p=>Math.max(1,p-1))}>Prev</button>
                    {Array.from({length:Math.min(5,totalPg)},(_,i)=>{const s=Math.max(1,Math.min(pg-2,totalPg-4));const p=s+i;return p<=totalPg?<button key={p} className={`pgb${pg===p?" on":""}`} onClick={()=>setPg(p)}>{p}</button>:null})}
                    <button className="pgb" onClick={()=>setPg(p=>Math.min(totalPg,p+1))}>Next</button>
                    <button className="pgb" onClick={()=>setPg(totalPg)}>Last</button>
                </div>
                </div>
            </>}

            {/* ═══ PHYSICAL INVENTORY AUDIT ═══ */}
            {isAudit && <>
              <div className="fcard">
                <div className="fcard-t">📡 Physical Inventory Audit</div>
                <div className="fcard-b">
                  <div style={{fontSize:12,color:"#555",lineHeight:1.6,marginBottom:12}}>
                    Operator with handheld reader goes to vendor {"\u2192"} Selects vendor location {"\u2192"} System fetches expected mould list {"\u2192"} Scans RFID tags {"\u2192"} Uploads photos {"\u2192"} Data syncs here with Found / Not Found status.
                  </div>
                  <div className="fg">
                    <div className="ff"><span className="ff-l">Vendor</span><select className="ff-s" value={fVendor} onChange={e=>setFVendor(e.target.value)}><option value="">All Vendors</option>{VENDORS.filter(Boolean).map(v=><option key={v}>{v}</option>)}</select></div>
                    <div className="ff"><span className="ff-l">From Date</span><input type="date" className="ff-i" value={fFrom} onChange={e=>setFFrom(e.target.value)}/></div>
                    <div className="ff"><span className="ff-l">To Date</span><input type="date" className="ff-i" value={fTo} onChange={e=>setFTo(e.target.value)}/></div>
                  </div>
                  <div className="factions"><button className="fbtn fbtn-go" onClick={()=>flash("Filters applied")}>Submit</button></div>
                </div>
              </div>

              {!selAudit && <>
                <div className="ebar" style={{borderRadius:3}}><button className="ebtn eb-print" onClick={()=>flash("Printing")}>Print</button><button className="ebtn eb-excel" onClick={()=>flash("Excel")}>Excel</button><button className="ebtn eb-csv" onClick={()=>flash("CSV")}>CSV</button></div>
                <div className="ag" style={{marginTop:14}}>
                  {AUDIT_DATA.map(a=>(
                    <div key={a.id} className="ac" onClick={()=>setSelAudit(a)}>
                      <div className="ac-v">{a.vendor}</div>
                      <div className="ac-m">{a.id} | {a.city} | {a.date}</div>
                      <div className="ac-m">Operator: {a.operator} | {a.device}</div>
                      <div className="ac-stats">
                        <div className="ac-st"><div className="ac-st-n">{expectedCount}</div><div className="ac-st-l">Expected</div></div>
                        <div className="ac-st"><div className="ac-st-n" style={{color:"#198754"}}>{foundCount}</div><div className="ac-st-l">Found</div></div>
                        <div className="ac-st"><div className="ac-st-n" style={{color:notFoundCount?"#dc3545":"#198754"}}>{notFoundCount}</div><div className="ac-st-l">Not Found</div></div>
                        <div className="ac-st"><div className="ac-st-n" style={{color:a.extra?"#fd7e14":"#888"}}>{a.extra}</div><div className="ac-st-l">Extra</div></div>
                      </div>
                      <div className="ac-bar"><div className="ac-fill" style={{width:`${matchPct}%`,background:matchPct===100?"#198754":"#dc3545"}}/></div>
                      <div className="ac-tag" style={{background:matchPct===100?"#d1e7dd":"#f8d7da",color:matchPct===100?"#0f5132":"#842029"}}>{matchPct}% Match</div>
                    </div>
                  ))}
                </div>
              </>}

              {selAudit && <>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                  <button className="fbtn" style={{background:"#6c757d",color:"#fff"}} onClick={()=>setSelAudit(null)}>{"\u2190"} Back</button>
                  <div style={{flex:1}}><div style={{fontSize:15,fontWeight:800}}>{selAudit.id} - {selAudit.vendor}</div><div style={{fontSize:12,color:"#666"}}>{selAudit.city} | {selAudit.date} | {selAudit.operator} | {selAudit.device}</div></div>
                  <button className="ebtn eb-excel" style={{height:32}} onClick={()=>flash("Exported")}>Excel</button>
                  <button className="ebtn eb-print" style={{height:32}} onClick={()=>flash("Print")}>Print</button>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:14}}>
                  {[["Expected",expectedCount,"#333"],["Found",foundCount,"#198754"],["Not Found",notFoundCount,notFoundCount?"#dc3545":"#198754"],["Extra",selAudit.extra,selAudit.extra?"#fd7e14":"#888"],["Match",matchPct+"%",matchPct===100?"#198754":"#dc3545"]].map(([l,v,c],i)=>(
                    <div key={i} style={{background:"#fff",border:"1px solid #ddd",borderRadius:4,padding:10,textAlign:"center"}}>
                      <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",color:"#888"}}>{l}</div>
                      <div style={{fontSize:20,fontWeight:800,color:c,marginTop:3}}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="ebar" style={{borderRadius:"3px 3px 0 0"}}><span style={{color:"#fff",fontSize:12,fontWeight:700}}>Mould-by-Mould Scan Results</span></div>
                <div className="tw" style={{borderTop:"none", maxHeight: "calc(100vh - 400px)", overflowY: "auto"}}>
                  <table style={{minWidth:1200}}>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Mould ID</th>
                            <th>Name</th>
                            <th>Tag ID</th>
                            <th>Plant</th>
                            <th>Location</th>
                            <th>RFID Scanned</th>
                            <th>Scan Time</th>
                            <th>Condition</th>
                            <th>Photo</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                      {dbMoulds.length === 0 && (
                          <tr><td colSpan="11" style={{textAlign:"center", padding: 20, color: "#6b7280"}}>No moulds found in registry</td></tr>
                      )}
                      {dbMoulds.map((m,i)=> {
                          // Simulating missing scans for realistic demonstration (every 8th mould is 'Not Found')
                          const isFound = i % 8 !== 0; 
                          
                          return (
                            <tr key={i} style={{background: isFound ? "#f0fdf4" : "#fef2f2"}}>
                              <td>
                                {isFound 
                                    ? <span className="ftag" style={{background:"#198754", padding: "4px 8px"}}>FOUND</span> 
                                    : <span className="ftag" style={{background:"#dc3545", padding: "4px 8px"}}>NOT FOUND</span>}
                              </td>
                              <td style={{fontWeight:700,color:"#3b5bdb"}}>{m.mouldIdAssetCode || m.mould_id_code || "—"}</td>
                              <td style={{fontWeight:600}}>{m.mouldName || m.mould_name || "—"}</td>
                              <td style={{fontFamily:"monospace",fontSize:11}}>{m.tagId || "—"}</td>
                              <td>{m.plant || "—"}</td>
                              <td>{m.locationName || m.location_name || "—"}</td>
                              <td>
                                {isFound ? <span style={{color:"#198754",fontWeight:600}}>Yes</span> : <span style={{color:"#dc3545",fontWeight:600}}>No</span>}
                              </td>
                              <td>{isFound ? `10:${String(30 + (i % 30)).padStart(2, '0')} AM` : "—"}</td>
                              <td>{isFound ? "Good" : "—"}</td>
                              <td>{isFound ? <span style={{color:"#0d6efd",fontWeight:600}}>📸 Yes</span> : "—"}</td>
                              <td style={{whiteSpace:"normal",maxWidth:180,lineHeight:1.4}}>{isFound ? "Verified" : "Missing from location"}</td>
                            </tr>
                          )
                      })}
                    </tbody>
                  </table>
                </div>
              </>}
            </>}

          </div>
        </div>
      </div>
    </div>
    {toast&&<div className="toast">{toast}</div>}
  </>);
}