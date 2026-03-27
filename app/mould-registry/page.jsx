'use client';
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

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
.sb-nav{flex:1;padding:12px 10px;display:flex;flex-direction:column;gap:3px;overflow-y:auto;z-index:1;position:relative}
.sb-sec{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.3);padding:8px 10px 4px}
.sb-item{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:8px;cursor:pointer;color:rgba(255,255,255,.6);font-size:12.5px;font-weight:500;transition:background .15s}
.sb-item:hover{background:rgba(255,255,255,.1);color:#fff}
.sb-item.active{background:rgba(255,255,255,.18);color:#fff;font-weight:700}
.sb-footer{padding:14px 12px;border-top:1px solid rgba(255,255,255,.1);z-index:1;position:relative}
.sb-user-row{display:flex;align-items:center;gap:8px}
.sb-avatar{width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0}
.sb-uname{font-size:12px;font-weight:600;color:#fff}
.sb-urole{font-size:10px;color:rgba(255,255,255,.5)}

/* ── MAIN ── */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}

/* Topbar */
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

/* Connect Reader btn */
.btn-connect{display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 16px;border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;border:none;background:linear-gradient(135deg,#10b981,#059669);color:#fff;box-shadow:0 4px 12px rgba(16,185,129,.3);transition:all .15s}
.btn-connect:hover{opacity:.9;transform:translateY(-1px)}

/* Content scroll area */
.content{flex:1;overflow-y:auto;padding:24px 28px}

/* TABS */
.main-tabs{display:flex;gap:0;background:#fff;border-radius:11px;border:1px solid #e5e7eb;padding:3px;margin-bottom:20px;width:fit-content;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.mtab{height:33px;padding:0 18px;border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;border:none;background:transparent;color:#6b7280;transition:all .14s;display:flex;align-items:center;gap:6px;white-space:nowrap}
.mtab:hover{color:#4f46e5}
.mtab.on{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;box-shadow:0 3px 10px rgba(79,70,229,.28)}

/* Page header row */
.page-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px}
.page-hdr-title{font-size:20px;font-weight:800;color:#111827;letter-spacing:-.025em}
.page-hdr-sub{font-size:13px;color:#6b7280;margin-top:3px}
.page-hdr-right{display:flex;gap:10px}

/* Form card */
.form-card{background:#fff;border-radius:16px;border:1px solid #e5e7eb;box-shadow:0 1px 6px rgba(0,0,0,.05);overflow:hidden;margin-bottom:18px}

/* Section header */
.sec-hdr{display:flex;align-items:center;gap:12px;padding:14px 22px;background:linear-gradient(90deg,#f8faff 0%,#fff 100%);border-bottom:2px solid #e8edff;position:relative}
.sec-hdr::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,#4f46e5,#7c3aed);border-radius:0 2px 2px 0}
.sec-hdr-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
.sec-hdr-title{font-size:13px;font-weight:800;color:#1e1b4b;letter-spacing:.06em;text-transform:uppercase}
.sec-hdr-badge{font-size:10.5px;font-weight:600;background:#eef2ff;color:#4338ca;padding:2px 8px;border-radius:20px;border:1px solid #c7d2fe;margin-left:auto}

/* Form grid */
.form-grid{padding:20px 22px;display:grid;gap:18px 24px}
.cols-3{grid-template-columns:1fr 1fr 1fr}

/* Field */
.field{display:flex;flex-direction:column;gap:5px}
.field-label{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;display:flex;align-items:center;gap:3px}
.req{color:#ef4444;font-size:11px}
.field-input,.field-select{height:42px;border:1.5px solid #e5e7eb;border-radius:10px;padding:0 13px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;color:#111827;background:#fafafa;outline:none;width:100%;transition:border-color .2s,box-shadow .2s,background .2s}
.field-input:focus,.field-select:focus{border-color:#5b2be0;background:#fff;box-shadow:0 0 0 3px rgba(91,43,224,.08)}
.field-input::placeholder{color:#b0bec5;font-size:13px}
.field-input.auto-fill{background:#f0fdf4;border-color:#bbf7d0;color:#15803d;font-style:italic}
.field-input.readonly{background:#f9fafb;color:#6b7280;cursor:not-allowed}
.field-select{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:34px}
.field-hint{font-size:10.5px;color:#9ca3af;margin-top:1px}
.field-err{font-size:10.5px;color:#ef4444;margin-top:1px}
.field-input.err,.field-select.err{border-color:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.07)}

/* Date input */
.field-input[type=date]{color:#374151}
.field-input[type=date]::-webkit-calendar-picker-indicator{opacity:.4;cursor:pointer}

/* File upload */
.file-wrap{position:relative;display:flex;align-items:center;gap:0;height:42px;border:1.5px dashed #d1d5db;border-radius:10px;overflow:hidden;background:#fafafa;transition:border-color .2s}
.file-wrap:hover{border-color:#5b2be0;background:#f5f3ff}
.file-wrap input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
.file-btn{height:100%;padding:0 14px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:12px;font-weight:600;white-space:nowrap;display:flex;align-items:center;gap:5px;flex-shrink:0}
.file-name{flex:1;padding:0 12px;font-size:12px;color:#9ca3af;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.file-name.has-file{color:#374151;font-weight:500}

/* Number field */
.num-wrap{position:relative}
.num-wrap .field-input{padding-right:50px}
.num-tag{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:10.5px;font-weight:700;color:#9ca3af;background:#f3f4f6;padding:2px 6px;border-radius:4px;pointer-events:none}

/* Textarea */
.field-textarea{border:1.5px solid #e5e7eb;border-radius:10px;padding:10px 13px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;color:#111827;background:#fafafa;outline:none;width:100%;resize:vertical;min-height:60px;transition:border-color .2s,box-shadow .2s}
.field-textarea:focus{border-color:#5b2be0;background:#fff;box-shadow:0 0 0 3px rgba(91,43,224,.08)}

/* Footer bar */
.form-footer{background:#fff;border-top:1px solid #e5e7eb;padding:16px 28px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;box-shadow:0 -2px 8px rgba(0,0,0,.04)}
.footer-hint{font-size:12px;color:#9ca3af;display:flex;align-items:center;gap:6px}
.footer-actions{display:flex;gap:10px}
.btn{display:inline-flex;align-items:center;gap:7px;height:40px;padding:0 20px;border-radius:10px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;font-weight:600;cursor:pointer;transition:all .15s;border:none}
.btn-primary{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;box-shadow:0 4px 14px rgba(91,43,224,.28)}
.btn-primary:hover{opacity:.9;transform:translateY(-1px)}
.btn-success{background:linear-gradient(135deg,#10b981,#059669);color:#fff;box-shadow:0 4px 14px rgba(16,185,129,.28)}
.btn-success:hover{opacity:.9;transform:translateY(-1px)}
.btn-outline{background:#fff;color:#374151;border:1.5px solid #e5e7eb}
.btn-outline:hover{border-color:#5b2be0;color:#5b2be0}
.btn-ghost{background:transparent;color:#6b7280;border:1.5px solid transparent}
.btn-ghost:hover{background:#f3f4f6;color:#374151}

/* Toast */
.toast{position:fixed;bottom:24px;right:24px;background:#111827;color:#fff;padding:13px 20px;border-radius:12px;font-size:13.5px;font-weight:500;z-index:2000;display:flex;align-items:center;gap:10px;box-shadow:0 8px 30px rgba(0,0,0,.25);animation:toastIn .3s ease}
.tok{border-left:4px solid #10b981}
.terr{border-left:4px solid #ef4444}
@keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

/* Steps indicator */
.steps{display:flex;align-items:center;gap:0;margin-bottom:22px}
.step{display:flex;align-items:center;gap:8px}
.step-circle{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;transition:all .2s}
.step-circle.done{background:#4f46e5;color:#fff;box-shadow:0 2px 8px rgba(79,70,229,.35)}
.step-circle.active{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;box-shadow:0 2px 12px rgba(79,70,229,.4)}
.step-circle.pending{background:#f3f4f6;color:#9ca3af;border:1.5px solid #e5e7eb}
.step-label{font-size:12px;font-weight:600;color:#374151}
.step-label.active{color:#4f46e5}
.step-label.pending{color:#9ca3af}
.step-line{flex:1;height:2px;background:#e5e7eb;min-width:24px;margin:0 6px}
.step-line.done{background:linear-gradient(90deg,#4f46e5,#7c3aed)}

/* Reader status */
.reader-status{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:500;padding:7px 14px;border-radius:8px;border:1.5px solid}
.reader-disconnected{color:#9ca3af;border-color:#e5e7eb;background:#f9fafb}
.reader-connected{color:#15803d;border-color:#bbf7d0;background:#f0fdf4}
.reader-dot{width:7px;height:7px;border-radius:50%}

/* TABLE (List View) */
.tbl-card{background:#fff;border-radius:14px;border:1px solid #e5e7eb;box-shadow:0 1px 5px rgba(0,0,0,.04);overflow:hidden;margin-bottom:18px}
.tbl-hdr{padding:14px 18px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between}
.tbl-t{font-size:14px;font-weight:800;color:#111827}
table{width:100%;border-collapse:collapse}
thead th{padding:12px 16px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;background:#f9fafb;border-bottom:1px solid #f0f0f0;white-space:nowrap}
tbody td{padding:14px 16px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;vertical-align:middle}
tbody tr:last-child td{border:none}
tbody tr:hover td{background:#fafbff}
.empty-state{padding:60px 20px;text-align:center;color:#9ca3af}
.empty-icon{font-size:40px;margin-bottom:12px;opacity:0.5}

/* ACTION BUTTONS */
.act-btn{width:32px;height:32px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;color:#6b7280;transition:all .15s;font-size:15px}
.act-btn:hover{border-color:#4f46e5;color:#4f46e5;background:#eef2ff}

/* MODAL */
.mov{position:fixed;inset:0;background:rgba(15,20,40,.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(3px)}
.mbox{background:#fff;border-radius:18px;width:100%;max-width:850px;max-height:92vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,.2);animation:fadeUp .22s ease}
.mhdr{padding:20px 24px 16px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:2;border-radius:18px 18px 0 0}
.mt{font-size:17px;font-weight:800;color:#111827}
.msub{font-size:12px;color:#6b7280;margin-top:2px}
.mcls{width:32px;height:32px;border-radius:8px;border:1.5px solid #e5e7eb;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#6b7280;font-size:16px}
.mcls:hover{background:#fef2f2;border-color:#dc2626;color:#dc2626}
.mbody{padding:22px 24px}
.mfoot{padding:16px 24px;border-top:1px solid #f3f4f6;display:flex;justify-content:flex-end;gap:10px;background:#fafafa;border-radius:0 0 18px 18px;position:sticky;bottom:0}
.v-sec{font-size:12px;font-weight:800;color:#4f46e5;text-transform:uppercase;letter-spacing:.05em;margin:24px 0 12px;padding-bottom:6px;border-bottom:1px solid #e5e7eb}
.v-sec:first-child{margin-top:0}
.vg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.vf{background:#f9fafb;border-radius:8px;padding:10px 12px;border:1px solid #f3f4f6}
.vf-l{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin-bottom:3px}
.vf-v{font-size:13px;font-weight:600;color:#111827;word-break:break-word}

/* Fade-in stagger */
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.fade-1{animation:fadeUp .4s ease .05s both}
.fade-2{animation:fadeUp .4s ease .12s both}
.fade-3{animation:fadeUp .4s ease .18s both}
.fade-4{animation:fadeUp .4s ease .24s both}
.fade-5{animation:fadeUp .4s ease .30s both}
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

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY"];

const NAV_ITEMS = [
    { label: "Dashboard", icon: "📊", route: "/dashboard" },
    { label: "User Management", icon: "👥", route: "/user-management"},
    { label: "Masters", icon: "🗂", route: "/masters" },
    { label: "Mould Registry", icon: "🔩", route: "/mould-registry", active: true },
    { label: "Transfers & Challan", icon: "🔄", route: "/challan" },
    { label: "Mould Return", icon: "📥", route: "/return" },
    { label: "Depreciation", icon: "📉", route: "/depreciation" },
    { label: "Maintenance", icon: "🔧", route: "/maintenance" },
    { label: "Scrap / Dispose", icon: "🗑", route: "/scrap" },
    { label: "Reports", icon: "📈", route: "/reports" }
];

export default function MouldRegistration() {
  const router = useRouter();
  const [user, setUser] = useState({ name: "User", role: "Viewer" });
  const [readerConnected, setReaderConnected] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const imgRef = useRef();
  const cadRef = useRef();

  const [activeTab, setActiveTab] = useState("form");
  const [mouldsList, setMouldsList] = useState([]);
  const [viewModal, setViewModal] = useState(null);
  const [roles, setRoles] = useState([]);

  // Dropdown Master Data populated via database
  const [opts, setOpts] = useState({
      suppliers: [],
      deprKeys: [],
      assetClasses: [],
      locations: [], 
      costCenters: [],
      plants: [],
      uoms: []
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
    
    fetch('/api/roles')
        .then(res => res.json())
        .then(data => setRoles(data))
        .catch(console.error);

    fetch(`/api/dropdowns?_t=${Date.now()}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
            setOpts({
                suppliers: data?.manufacturers || [],
                deprKeys: data?.deprMethods || [],
                assetClasses: data?.mouldTypes || [],
                locations: data?.vendors || [], 
                costCenters: data?.costCenters || [],
                plants: data?.plants || [],
                uoms: data?.uoms || []
            });
        }).catch(console.error);

    fetchMoulds();
  }, [router]);

  const activeRole = roles.find(r => r.name === user.role);
  const privs = activeRole ? activeRole.privs : null;

  useEffect(() => {
      if (privs && privs.mouldReg) {
          if (!privs.mouldReg.add && activeTab === "form") {
              setActiveTab("list");
          }
      }
  }, [privs, activeTab]);

  const fetchMoulds = async () => {
      try {
          const res = await fetch(`/api/moulds?_t=${Date.now()}`, { cache: 'no-store' });
          if(res.ok) setMouldsList(await res.json());
      } catch (err) { console.error(err); }
  };

  const initialsName = user.name ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "U";

  const [form, setForm] = useState({
    tagId: "", mouldIdAssetCode: "", mouldName: "",
    costCenterCode: "", costCenterName: "", supplierCode: "", supplierName: "",
    poNumber: "", poDate: "", capitalizationOn: "", depreciationCalcOn: "", depreciationOnKey: "",
    assetLife: "", mouldImage: null, assetClassCode: "", assetClassName: "",
    subNumber: "", locationCode: "", locationName: "", plant: "", baseUnitOfMeasure: "",
    guaranteedLifeTotalShots: "", currentShotCount: "", description: "",
    cumAcqValue: "", transAcqValue: "", currency: "INR", cadFile: null,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCostCenter = v => {
      set("costCenterCode", v);
      const found = (opts?.costCenters || []).find(c => c.code === v);
      set("costCenterName", found ? found.name : "");
  };

  const handleLocation = v => {
      set("locationCode", v);
      const found = (opts?.locations || []).find(l => l.code === v);
      set("locationName", found ? found.name : "");
  };

  const handleSupplierCode = v => { 
      set("supplierCode", v); 
      const found = (opts?.suppliers || []).find(s => s.code === v);
      set("supplierName", found ? found.name : ""); 
  };
  
  const handleAssetClass = v => { 
      set("assetClassCode", v); 
      const found = (opts?.assetClasses || []).find(a => a.code === v);
      set("assetClassName", found ? found.name : ""); 
  };

  const handleFile = (e, nameKey) => {
    const f = e.target.files[0];
    if (f) set(nameKey, f); 
  };

  const validate = () => {
    const e = {};
    if (!form.tagId.trim())            e.tagId = "Required";
    if (!form.mouldIdAssetCode.trim()) e.mouldIdAssetCode = "Required";
    if (!form.mouldName.trim())        e.mouldName = "Required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    
    try {
        const formData = new FormData();
        Object.keys(form).forEach(key => {
            if (form[key] !== null && form[key] !== undefined && form[key] !== "") {
                formData.append(key, form[key]);
            }
        });

        const res = await fetch("/api/moulds", {
            method: "POST",
            body: formData 
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error);

        setErrors({});
        showToast("Mould registered successfully in Database!", "ok");
        handleReset();
        fetchMoulds();
        setActiveTab("list");
    } catch (err) {
        showToast(err.message, "err");
    }
  };

  const handleReset = () => {
    setForm({
      tagId:"", mouldIdAssetCode:"", mouldName:"", costCenterCode:"", costCenterName:"", 
      supplierCode:"", supplierName:"", poNumber:"", poDate:"", capitalizationOn:"", 
      depreciationCalcOn:"", depreciationOnKey:"", assetLife:"", mouldImage: null, 
      assetClassCode:"", assetClassName:"", subNumber:"", locationCode:"", locationName:"", 
      plant:"", baseUnitOfMeasure:"", guaranteedLifeTotalShots:"", currentShotCount:"", 
      description:"", cumAcqValue:"", transAcqValue:"", currency:"INR", cadFile: null,
    });
    setErrors({});
  };

  const showToast = (msg, type="ok") => { setToast({msg, type}); setTimeout(() => setToast(null), 3500); };

  const step1Done = form.tagId && form.mouldIdAssetCode && form.mouldName;
  const step2Done = step1Done && form.costCenterCode && form.supplierCode;

  const fDate = (d) => d ? String(d).split('T')[0] : "—";

  if (!privs && user.role !== "Admin") {
      return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Loading configurations...</div>;
  }

  const hasViewAccess = user.role === "Admin" || privs?.mouldReg?.view;
  const hasAddAccess = user.role === "Admin" || privs?.mouldReg?.add;

  if (!hasViewAccess && !hasAddAccess) {
      return (
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column'}}>
              <h2>Access Denied</h2>
              <p>You do not have permission to view the Mould Registry.</p>
              <button onClick={() => router.push('/dashboard')} style={{ height: 38, padding: "0 18px", borderRadius: 9, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}>Return to Dashboard</button>
          </div>
      );
  }

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
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sb-brand">
            {/* If you want the ID Tech logo back in the future, uncomment the image below:
              <div style={{ padding: "20px 16px" }}>
                <img src="/logo.png" alt="ID Tech Logo" style={{ width: "100%", maxHeight: 45, objectFit: "contain", display: "block", margin: "0 auto" }} />
              </div>
            */}
            
            {/* Restored original MouldSys logo */}
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
                    className={`sb-item${n.active ? " active" : ""}`} 
                    onClick={() => {
                        
                            router.push(n.route);
                        
                    }}
                >
                    <span>{n.icon}</span>{n.label}
                </div>
            ))}
          </div>
          <div className="sb-footer">
            <div className="sb-user-row">
                <div className="sb-avatar">{initialsName}</div>
                <div><div className="sb-uname">{user.name}</div><div className="sb-urole">{user.role}</div></div>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="main">
          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-left"><div className="topbar-breadcrumb"><span>Mould Registry</span><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/></svg></div><div className="topbar-title">Mould Management</div></div>
            <div className="topbar-right">
              <div className={`reader-status ${readerConnected?"reader-connected":"reader-disconnected"}`}><div className="reader-dot" style={{background:readerConnected?"#16a34a":"#d1d5db"}}/>{readerConnected ? "Reader Connected" : "Reader Disconnected"}</div>
              <button className="btn-connect" onClick={()=>{ setReaderConnected(v=>!v); }}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v3M7 10v3M1 7h3M10 7h3M3.2 3.2l2.1 2.1M8.7 8.7l2.1 2.1M3.2 10.8l2.1-2.1M8.7 5.3l2.1-2.1" stroke="white" strokeWidth="1.4" strokeLinecap="round"/></svg>{readerConnected ? "Disconnect" : "Connect Reader"}</button>
              <div className="notif-btn"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2a5 5 0 00-5 5v2l-1 2h12l-1-2V7a5 5 0 00-5-5zM6.5 13.5a1.5 1.5 0 003 0" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round"/></svg><div className="notif-dot"/></div>
              <div className="tb-user-pill"><div className="tb-avatar">{initialsName}</div><span className="tb-uname">{user.name}</span></div>
              <button className="logout-btn" onClick={handleLogout}>
                Logout ➔
            </button>
            </div>
          </div>

          <div className="content">
            <div className="main-tabs fade-1">
              {hasAddAccess && <button className={`mtab${activeTab === "form" ? " on" : ""}`} onClick={() => setActiveTab("form")}>📝 Register New</button>}
              {hasViewAccess && <button className={`mtab${activeTab === "list" ? " on" : ""}`} onClick={() => setActiveTab("list")}>📋 Registry List ({mouldsList?.length || 0})</button>}
            </div>

            {/* FORM TAB */}
            {activeTab === "form" && hasAddAccess && (
              <>
                <div className="page-hdr fade-1"><div className="page-hdr-left"><div className="page-hdr-title">Register New Mould</div><div className="page-hdr-sub">Fill in identification, manufacturer and asset details to register a mould asset</div></div><div className="page-hdr-right"><button className="btn btn-outline" onClick={handleReset}><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5A4.5 4.5 0 1110.9 4M2 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Reset</button></div></div>
                
                <div className="steps fade-1" style={{marginBottom:22}}>
                  {[{num:1,label:"Identification",done:!!step1Done},{num:2,label:"Manufacturer Details",done:!!step2Done},{num:3,label:"Asset Details",done:false}].map((s,i,arr) => (
                    <div key={s.num} style={{display:"flex",alignItems:"center",flex:i<arr.length-1?1:"initial"}}>
                      <div className="step"><div className={`step-circle ${s.done?"done":i===0||(!arr[i-1]?.done&&i>0)?"pending":""} ${!s.done&&(i===0||(arr[i-1]?.done))?"active":""}`}>{s.done ? <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> : s.num}</div><span className={`step-label ${s.done?"active":!s.done&&(i===0)?"active":"pending"}`}>{s.label}</span></div>
                      {i < arr.length-1 && <div className={`step-line${s.done?" done":""}`}/>}
                    </div>
                  ))}
                </div>

                <div className="form-card fade-2">
                  <div className="sec-hdr"><div className="sec-hdr-icon" style={{background:"#eef2ff"}}>🏷</div><div className="sec-hdr-title">Identification</div><span className="sec-hdr-badge">Required</span></div>
                  <div className="form-grid cols-3">
                    <div className="field"><label className="field-label">Tag ID <span className="req">*</span></label><input className={`field-input${errors.tagId?" err":""}`} value={form.tagId} onChange={e=>{set("tagId",e.target.value);setErrors(v=>({...v,tagId:""}))}} placeholder="e.g. TAG-2025-001"/>{errors.tagId && <div className="field-err">{errors.tagId}</div>}<div className="field-hint">Scanned from RFID/barcode reader</div></div>
                    <div className="field"><label className="field-label">Mould ID / Asset Code <span className="req">*</span></label><input className={`field-input${errors.mouldIdAssetCode?" err":""}`} value={form.mouldIdAssetCode} onChange={e=>{set("mouldIdAssetCode",e.target.value);setErrors(v=>({...v,mouldIdAssetCode:""}))}} placeholder="e.g. MLD-001-2025"/>{errors.mouldIdAssetCode && <div className="field-err">{errors.mouldIdAssetCode}</div>}</div>
                    <div className="field"><label className="field-label">Mould Name <span className="req">*</span></label><input className={`field-input${errors.mouldName?" err":""}`} value={form.mouldName} onChange={e=>{set("mouldName",e.target.value);setErrors(v=>({...v,mouldName:""}))}} placeholder="e.g. Bumper Front LH Cavity Mould"/>{errors.mouldName && <div className="field-err">{errors.mouldName}</div>}</div>
                  </div>
                </div>

                <div className="form-card fade-3">
                  <div className="sec-hdr"><div className="sec-hdr-icon" style={{background:"#fff7ed"}}>🏭</div><div className="sec-hdr-title">Manufacturer Details</div><span className="sec-hdr-badge" style={{background:"#fff7ed",color:"#c2410c",borderColor:"#fed7aa"}}>Financial</span></div>
                  <div className="form-grid cols-3">
                    <div className="field"><label className="field-label">Cost Center Code</label>
                      <select className="field-select" value={form.costCenterCode} onChange={e=>handleCostCenter(e.target.value)}>
                        <option value="">— Select —</option>{opts?.costCenters?.map(c=><option key={c.code} value={c.code}>{c.code}</option>)}
                      </select>
                    </div>
                    <div className="field"><label className="field-label">Cost Center Name</label><input className={`field-input${form.costCenterName?" auto-fill":""}`} value={form.costCenterName} readOnly placeholder="Auto-populated"/></div>
                    
                    <div className="field"><label className="field-label">Supplier Code</label>
                      <select className="field-select" value={form.supplierCode} onChange={e=>handleSupplierCode(e.target.value)}>
                        <option value="">— Select —</option>{opts?.suppliers?.map(s=><option key={s.code} value={s.code}>{s.code}</option>)}
                      </select>
                    </div>
                    <div className="field"><label className="field-label">Supplier Name</label><input className={`field-input${form.supplierName?" auto-fill":""}`} value={form.supplierName} readOnly placeholder="Auto-populated..."/></div>
                    
                    <div className="field"><label className="field-label">PO Number</label><input className="field-input" value={form.poNumber} onChange={e=>set("poNumber",e.target.value)} placeholder="PO-..."/></div>
                    <div className="field"><label className="field-label">PO Date</label><input type="date" className="field-input" value={form.poDate} onChange={e=>set("poDate",e.target.value)}/></div>
                    <div className="field"><label className="field-label">Capitalization On</label><input type="date" className="field-input" value={form.capitalizationOn} onChange={e=>set("capitalizationOn",e.target.value)}/></div>
                    <div className="field"><label className="field-label">Depreciation Calculation On</label><input type="date" className="field-input" value={form.depreciationCalcOn} onChange={e=>set("depreciationCalcOn",e.target.value)}/></div>
                    
                    <div className="field"><label className="field-label">Depreciation On Key</label>
                      <select className="field-select" value={form.depreciationOnKey} onChange={e=>set("depreciationOnKey",e.target.value)}>
                        <option value="">— Select —</option>{opts?.deprKeys?.map(d=><option key={d.name} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-card fade-4">
                  <div className="sec-hdr"><div className="sec-hdr-icon" style={{background:"#f0fdf4"}}>📦</div><div className="sec-hdr-title">Asset Details</div><span className="sec-hdr-badge" style={{background:"#f0fdf4",color:"#15803d",borderColor:"#bbf7d0"}}>Technical</span></div>
                  <div className="form-grid cols-3" style={{paddingBottom:0}}>
                    <div className="field"><label className="field-label">Asset Life <span style={{fontSize:10,color:"#9ca3af"}}>(Yrs)</span></label><div className="num-wrap"><input type="number" className="field-input" value={form.assetLife} onChange={e=>set("assetLife",e.target.value)} placeholder="0"/><span className="num-tag">Yrs</span></div></div><div/>
                    <div className="field"><label className="field-label">Mould Image</label><div className="file-wrap"><div className="file-btn"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 4l3-3 3 3M1 9v1a1 1 0 001 1h8a1 1 0 001-1V9" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> File</div><span className={`file-name${form.mouldImage?" has-file":""}`}>{form.mouldImage?.name||"No file"}</span><input type="file" accept="image/*" ref={imgRef} onChange={e=>handleFile(e,"mouldImage")}/></div></div>
                  </div>
                  <div className="form-grid cols-3" style={{paddingTop:0,paddingBottom:0}}>
                    <div className="field"><label className="field-label">Asset Class Code</label>
                      <select className="field-select" value={form.assetClassCode} onChange={e=>handleAssetClass(e.target.value)}>
                        <option value="">— Select —</option>{opts?.assetClasses?.map(a=><option key={a.code} value={a.code}>{a.code}</option>)}
                      </select>
                    </div>
                    <div className="field"><label className="field-label">Asset Class Name</label><input className={`field-input${form.assetClassName?" auto-fill":""}`} value={form.assetClassName} readOnly placeholder="Auto-populated"/></div>
                    <div className="field"><label className="field-label">Sub Number</label><input className="field-input" value={form.subNumber} onChange={e=>set("subNumber",e.target.value)} placeholder="001"/></div>
                  </div>
                  <div className="form-grid cols-3" style={{paddingTop:0,paddingBottom:0}}>
                    <div className="field"><label className="field-label">Location Code</label>
                      <select className="field-select" value={form.locationCode} onChange={e=>handleLocation(e.target.value)}>
                        <option value="">— Select —</option>{opts?.locations?.map(l=><option key={l.code} value={l.code}>{l.code}</option>)}
                      </select>
                    </div>
                    <div className="field"><label className="field-label">Location Name</label><input className={`field-input${form.locationName?" auto-fill":""}`} value={form.locationName} readOnly placeholder="Auto-populated"/></div>
                    <div className="field"><label className="field-label">Plant</label>
                      <select className="field-select" value={form.plant} onChange={e=>set("plant",e.target.value)}>
                        <option value="">— Select —</option>{opts?.plants?.map(p=><option key={p.name} value={p.name}>{p.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-grid cols-3" style={{paddingTop:0,paddingBottom:0}}>
                    <div className="field"><label className="field-label">Base UOM</label>
                      <select className="field-select" value={form.baseUnitOfMeasure} onChange={e=>set("baseUnitOfMeasure",e.target.value)}>
                        <option value="">— Select —</option>{opts?.uoms?.map(u=><option key={u.name} value={u.name}>{u.name}</option>)}
                      </select>
                    </div>
                    <div className="field"><label className="field-label">Guaranteed Life (Shots)</label><div className="num-wrap"><input type="number" className="field-input" value={form.guaranteedLifeTotalShots} onChange={e=>set("guaranteedLifeTotalShots",e.target.value)} placeholder="500000"/><span className="num-tag">Shots</span></div></div>
                    <div className="field"><label className="field-label">Current Shot Count</label><div className="num-wrap"><input type="number" className="field-input" value={form.currentShotCount} onChange={e=>set("currentShotCount",e.target.value)} placeholder="0"/><span className="num-tag">Shots</span></div></div>
                  </div>
                  <div className="form-grid cols-3" style={{paddingTop:0,paddingBottom:0}}>
                    <div className="field"><label className="field-label">Description</label><textarea className="field-textarea" value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Notes..." rows={2}/></div>
                    <div className="field"><label className="field-label">Cum. Acq. Value</label><div className="num-wrap"><input type="number" className="field-input" value={form.cumAcqValue} onChange={e=>set("cumAcqValue",e.target.value)} placeholder="0.00"/><span className="num-tag">₹</span></div><label className="field-label" style={{marginTop:10}}>Trans. Acq. Value</label><div className="num-wrap"><input type="number" className="field-input" value={form.transAcqValue} onChange={e=>set("transAcqValue",e.target.value)} placeholder="0.00"/><span className="num-tag">₹</span></div></div>
                    <div className="field"><label className="field-label">Drawing / CAD (PDF)</label><div className="file-wrap"><div className="file-btn" style={{background:"linear-gradient(135deg,#0891b2,#0e7490)"}}><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 4l3-3 3 3M1 9v1a1 1 0 001 1h8a1 1 0 001-1V9" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> File</div><span className={`file-name${form.cadFile?" has-file":""}`}>{form.cadFile?.name||"No file"}</span><input type="file" accept=".pdf,.dwg,.dxf" ref={cadRef} onChange={e=>handleFile(e,"cadFile")}/></div><label className="field-label" style={{marginTop:10}}>Currency</label>
                      <select className="field-select" value={form.currency} onChange={e=>set("currency",e.target.value)}>
                        {CURRENCIES?.map(c=><option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div><div style={{height:4}}/>
                </div>

                <div className="form-footer fade-5" style={{ margin: "-24px -28px -28px", marginTop: "20px" }}>
                  <div className="footer-hint"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#9ca3af" strokeWidth="1.2"/><line x1="7" y1="5" x2="7" y2="7.5" stroke="#9ca3af" strokeWidth="1.4" strokeLinecap="round"/><circle cx="7" cy="9.5" r=".7" fill="#9ca3af"/></svg> Fields marked <span style={{color:"#ef4444",fontWeight:700}}>*</span> are required</div>
                  <div className="footer-actions"><button className="btn btn-ghost" onClick={handleReset}>Reset Form</button><button className="btn btn-outline">Save as Draft</button><button className="btn btn-success" onClick={handleSubmit}>Submit Registration</button></div>
                </div>
              </>
            )}

            {/* LIST TAB */}
            {activeTab === "list" && hasViewAccess && (
              <div className="fade-2">
                <div className="tbl-card">
                  <div className="tbl-hdr"><div className="tbl-t">Registered Moulds ({mouldsList?.length || 0})</div></div>
                  {!mouldsList || mouldsList.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">📋</div><div style={{ fontSize: 15, fontWeight: 700, color: "#374151" }}>No moulds registered yet</div></div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table>
                        <thead>
                          <tr><th>Mould ID</th><th>Mould Name</th><th>Tag ID</th><th>Plant</th><th>Asset Class</th><th>Supplier</th><th>Date Reg.</th><th style={{textAlign:"center"}}>Actions</th></tr>
                        </thead>
                        <tbody>
                          {mouldsList?.map(m => (
                            <tr key={m.id}>
                              <td><span style={{ fontWeight: 700, color: "#4f46e5", fontFamily: "monospace", fontSize: 12 }}>{m.mouldIdAssetCode || m.mould_id_code}</span></td>
                              <td><div style={{ fontWeight: 600, color: "#111827" }}>{m.mouldName || m.mould_name}</div></td>
                              <td><span style={{ fontFamily: "monospace", color: "#6b7280" }}>{m.tagId || m.tag_id}</span></td>
                              <td>{m.plant || "—"}</td>
                              <td>{m.assetClassName || m.asset_class_name || "—"}</td>
                              <td>{m.supplierName || m.supplier_name || "—"}</td>
                              <td>{m.regDate || fDate(m.created_at)}</td>
                              <td style={{textAlign:"center"}}><button className="act-btn" onClick={() => setViewModal(m)}>👁</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewModal && (
        <div className="mov" onClick={e => e.target === e.currentTarget && setViewModal(null)}>
          <div className="mbox">
            <div className="mhdr">
              <div>
                <div className="mt">{viewModal.mouldName || viewModal.mould_name}</div>
                <div className="msub">Asset Code: <span style={{color:"#4f46e5",fontFamily:"monospace",fontWeight:700}}>{viewModal.mouldIdAssetCode || viewModal.mould_id_code}</span> • Tag ID: {viewModal.tagId || viewModal.tag_id}</div>
              </div>
              <button className="mcls" onClick={() => setViewModal(null)}>x</button>
            </div>
            <div className="mbody">
              <div className="v-sec">Identification & Asset Details</div>
              <div className="vg">
                {[
                  ["Asset Class", (viewModal.assetClassCode || viewModal.asset_class_code) ? `${viewModal.assetClassCode || viewModal.asset_class_code} - ${viewModal.assetClassName || viewModal.asset_class_name}` : "—"],
                  ["Sub Number", viewModal.subNumber || viewModal.sub_number || "—"],
                  ["Location", (viewModal.locationCode || viewModal.location_code) ? `${viewModal.locationCode || viewModal.location_code} - ${viewModal.locationName || viewModal.location_name}` : "—"],
                  ["Plant", viewModal.plant || "—"],
                  ["Base UOM", viewModal.baseUnitOfMeasure || viewModal.base_uom || "—"],
                  ["Asset Life (Yrs)", viewModal.assetLife || viewModal.asset_life || "—"],
                  ["Description", viewModal.description || "—"]
                ].map(([l, v]) => <div key={l} className="vf"><div className="vf-l">{l}</div><div className="vf-v">{v}</div></div>)}
              </div>

              <div className="v-sec">Manufacturer & Financials</div>
              <div className="vg">
                {[
                  ["Cost Center", (viewModal.costCenterCode || viewModal.cost_center_code) ? `${viewModal.costCenterCode || viewModal.cost_center_code} - ${viewModal.costCenterName || viewModal.cost_center_name}` : "—"],
                  ["Supplier", (viewModal.supplierCode || viewModal.supplier_code) ? `${viewModal.supplierCode || viewModal.supplier_code} - ${viewModal.supplierName || viewModal.supplier_name}` : "—"],
                  ["PO Number & Date", (viewModal.poNumber || viewModal.po_number) ? `${viewModal.poNumber || viewModal.po_number} (${viewModal.poDate || viewModal.po_date ? fDate(viewModal.poDate || viewModal.po_date) : "No Date"})` : "—"],
                  ["Capitalization Date", (viewModal.capitalizationOn || viewModal.cap_date) ? fDate(viewModal.capitalizationOn || viewModal.cap_date) : "—"],
                  ["Depreciation Key", viewModal.depreciationOnKey || viewModal.depr_key || "—"],
                  ["Depr. Calculation Date", (viewModal.depreciationCalcOn || viewModal.depr_calc_date) ? fDate(viewModal.depreciationCalcOn || viewModal.depr_calc_date) : "—"],
                  ["Cum. Acq. Value", (viewModal.cumAcqValue || viewModal.cum_acq_value) ? `₹${viewModal.cumAcqValue || viewModal.cum_acq_value}` : "—"],
                  ["Trans. Acq. Value", (viewModal.transAcqValue || viewModal.trans_acq_value) ? `₹${viewModal.transAcqValue || viewModal.trans_acq_value}` : "—"],
                  ["Currency", viewModal.currency || "—"]
                ].map(([l, v]) => <div key={l} className="vf"><div className="vf-l">{l}</div><div className="vf-v">{v}</div></div>)}
              </div>

              <div className="v-sec">Technical Data</div>
              <div className="vg">
                {[
                  ["Guaranteed Life (Shots)", viewModal.guaranteedLifeTotalShots || viewModal.guaranteed_shots || "—"],
                  ["Current Shot Count", viewModal.currentShotCount || viewModal.current_shots || "—"],
                  ["Mould Image", (viewModal.mouldImage || viewModal.mould_image) ? <a href={viewModal.mouldImage || viewModal.mould_image} target="_blank" style={{color:"#4f46e5", textDecoration:"underline", fontWeight:600}}>View Image</a> : "Not Uploaded"],
                  ["Drawing / CAD File", (viewModal.drawingCadFile || viewModal.cad_file) ? <a href={viewModal.drawingCadFile || viewModal.cad_file} target="_blank" style={{color:"#4f46e5", textDecoration:"underline", fontWeight:600}}>View Document</a> : "Not Uploaded"]
                ].map(([l, v]) => <div key={l} className="vf"><div className="vf-l">{l}</div><div className="vf-v">{v}</div></div>)}
              </div>
            </div>
            <div className="mfoot">
              <button className="btn btn-outline" onClick={() => setViewModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type === "ok" ? "tok" : "terr"}`}>{toast.type === "ok" ? "✅" : "❌"} <span style={{marginLeft: 8}}>{toast.msg}</span></div>}
    </>
  );
}