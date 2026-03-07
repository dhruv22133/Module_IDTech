'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ─── SEED DATA ────────────────────────────────────────────
const SEED_VENDORS = [
  { id:1, code:"VND-001", name:"Precision Tooling Co", location:"Pune, Maharashtra", contact:"Anil Sharma", email:"anil@precisiontooling.com", phone:"+91 98201 34567", machines:[{tonnage:"250T",count:4},{tonnage:"500T",count:2},{tonnage:"800T",count:1}] },
  { id:2, code:"VND-002", name:"Elite Mould Makers",   location:"Nashik, Maharashtra", contact:"Suresh Patil", email:"suresh@elitemoulds.com", phone:"+91 97655 22341", machines:[{tonnage:"350T",count:3},{tonnage:"600T",count:2}] },
  { id:3, code:"VND-003", name:"Bharat Engineering",   location:"Aurangabad, Maharashtra", contact:"Prakash Deshpande", email:"pd@bharateng.com", phone:"+91 99203 88120", machines:[{tonnage:"200T",count:5},{tonnage:"400T",count:3},{tonnage:"1000T",count:1}] },
  { id:4, code:"VND-004", name:"Global Mould Solutions",location:"Mumbai, Maharashtra", contact:"Vikram Joshi", email:"vj@globalmoulds.com", phone:"+91 98190 11223", machines:[{tonnage:"500T",count:6}] },
];

const SEED_MANUFACTURERS = [
  { id:1, code:"SUP-001", name:"Tata Moulds Pvt Ltd",       country:"India",   contact:"Rajesh Kumar",  email:"rk@tatamoulds.com",    phone:"+91 98201 00001", specialty:"Automotive Exterior" },
  { id:2, code:"SUP-002", name:"Bharat Engineering Works",  country:"India",   contact:"Sunil Verma",   email:"sv@bharateng.com",     phone:"+91 98201 00002", specialty:"Interior Trims"      },
  { id:3, code:"SUP-003", name:"Precision Tooling Co",      country:"India",   contact:"Anita Sinha",   email:"as@precisiontool.com", phone:"+91 98201 00003", specialty:"Die Cast"            },
  { id:4, code:"SUP-004", name:"Elite Mould Makers",        country:"India",   contact:"Mohan Das",     email:"md@elitemoulds.com",   phone:"+91 98201 00004", specialty:"Blow Moulding"       },
  { id:5, code:"SUP-005", name:"Shree Tools & Dies",        country:"India",   contact:"Pankaj Shah",   email:"ps@shreetool.com",     phone:"+91 98201 00005", specialty:"General Purpose"     },
];

const SEED_MOULD_TYPES = [
  { id:1, code:"MT-001", name:"Injection Mould",    description:"Standard thermoplastic injection moulding",    cavities:"Multi-cavity", material:"P20 Steel" },
  { id:2, code:"MT-002", name:"Blow Mould",         description:"Hollow plastic parts via blow moulding",       cavities:"Single",       material:"Aluminium" },
  { id:3, code:"MT-003", name:"Die Cast",           description:"Metal die casting for structural components",  cavities:"Single",       material:"H13 Steel" },
  { id:4, code:"MT-004", name:"Compression Mould",  description:"High pressure thermoset moulding",            cavities:"Multi-cavity", material:"P20 Steel" },
  { id:5, code:"MT-005", name:"Rotational Mould",   description:"Hollow parts via rotational moulding process", cavities:"Single",       material:"Aluminium" },
];

const SEED_TRANSFER_REASONS = [
  { id:1, code:"TR-001", name:"Jobwork",              description:"Mould sent to vendor for production jobwork",            active:true  },
  { id:2, code:"TR-002", name:"Maintenance & Repair", description:"Mould sent for scheduled or corrective maintenance",     active:true  },
  { id:3, code:"TR-003", name:"Inter-plant Transfer",  description:"Mould moved between company plant locations",           active:true  },
  { id:4, code:"TR-004", name:"Trial Run",             description:"Mould sent for trial production run at vendor/plant",   active:true  },
  { id:5, code:"TR-005", name:"Modification",          description:"Mould sent for engineering changes or modifications",   active:false },
  { id:6, code:"TR-006", name:"Calibration",           description:"Mould sent for measurement and calibration",            active:true  },
];

const SEED_DEPR_METHODS = [
  { id:1, code:"DM-001", name:"Straight Line Method",          abbr:"SLM", description:"Equal depreciation over asset life",            rate:"10-20%" },
  { id:2, code:"DM-002", name:"Written Down Value",            abbr:"WDV", description:"Declining balance on book value each year",      rate:"15-40%" },
  { id:3, code:"DM-003", name:"Units of Production",           abbr:"UOP", description:"Depreciation based on actual shots/cycles",      rate:"Per Shot" },
  { id:4, code:"DM-004", name:"Double Declining Balance",      abbr:"DDB", description:"Accelerated depreciation, 2x straight line",     rate:"20-50%" },
  { id:5, code:"DM-005", name:"Sum of Years Digits",           abbr:"SYD", description:"Accelerated method based on remaining life sum", rate:"Variable" },
];

const TABS = [
  { key:"vendor",       label:"Vendor Master",       icon:"🏭", color:"#0891b2", bg:"#e0f2fe", border:"#7dd3fc" },
  { key:"manufacturer", label:"Manufacturer Master",  icon:"⚙️",  color:"#7c3aed", bg:"#f5f3ff", border:"#c4b5fd" },
  { key:"mouldType",    label:"Mould Type",           icon:"🔩", color:"#059669", bg:"#f0fdf4", border:"#6ee7b7" },
  { key:"transferReason",label:"Transfer Reason",     icon:"🔄", color:"#d97706", bg:"#fffbeb", border:"#fcd34d" },
  { key:"deprMethod",   label:"Depreciation Method",  icon:"📉", color:"#dc2626", bg:"#fef2f2", border:"#fca5a5" },
];

const NAV_ITEMS = [
  { label:"Dashboard",             icon:"📊", route:"/dashboard"       },
  { label:"Mould Registry",         icon:"🔩", route:"/mould-registry"  },
  { label:"Maintenance",            icon:"🔧", route:"/maintenance"     },
  { label:"Transfers & Challan",     icon:"🔄", route:"/challan" },
  {label:"Mould Return",        icon:"📥", route:"/return" },
  {label:"Depreciation",        icon:"📉", route:"/depreciation"},
  { label:"Scrap / Dispose",     icon:"🗑", route:"/scrap" },
  { label:"Masters",         icon:"🗂", route:"/masters", active:true },
  { label:"User Management", icon:"👥", route:"/user-management" },
  { label:"Reports",         icon:"📈", route:"/reports"         },
];

// ─── HELPERS ─────────────────────────────────────────────
function avatarColor(str) {
  const cols = ["#4f46e5","#0891b2","#059669","#d97706","#7c3aed","#dc2626","#0284c7","#9333ea"];
  let h = 0; for (let c of str) h = c.charCodeAt(0)+((h<<5)-h);
  return cols[Math.abs(h)%cols.length];
}
function initials(name) { return name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2); }

// ─── MODAL ───────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children, footer }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,20,40,.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(3px)"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#fff",borderRadius:18,width:"100%",maxWidth:600,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,.2)",animation:"modalIn .22s ease"}}>
        <div style={{padding:"20px 24px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"#fff",zIndex:2,borderRadius:"18px 18px 0 0"}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:"#111827",letterSpacing:"-.02em"}}>{title}</div>
            {subtitle && <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:7,border:"1.5px solid #e5e7eb",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#6b7280"}}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div style={{padding:"20px 24px"}}>{children}</div>
        {footer && <div style={{padding:"14px 24px",borderTop:"1px solid #f3f4f6",display:"flex",justifyContent:"flex-end",gap:10,background:"#fafafa",borderRadius:"0 0 18px 18px"}}>{footer}</div>}
      </div>
    </div>
  );
}

function DeleteModal({ name, onClose, onConfirm }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,20,40,.45)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(3px)"}}>
      <div style={{background:"#fff",borderRadius:18,width:"100%",maxWidth:400,boxShadow:"0 32px 80px rgba(0,0,0,.2)",animation:"modalIn .22s ease"}}>
        <div style={{padding:"28px 24px",textAlign:"center"}}>
          <div style={{width:52,height:52,background:"#fef2f2",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",color:"#dc2626"}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{fontSize:17,fontWeight:800,color:"#111827",marginBottom:8}}>Delete this record?</div>
          <p style={{fontSize:13,color:"#6b7280",lineHeight:1.6}}>You are about to delete <strong style={{color:"#111827"}}>{name}</strong>. This action cannot be undone.</p>
        </div>
        <div style={{padding:"12px 24px 20px",display:"flex",justifyContent:"center",gap:10}}>
          <button onClick={onClose} style={{height:38,padding:"0 20px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",color:"#374151"}}>Cancel</button>
          <button onClick={onConfirm} style={{height:38,padding:"0 20px",borderRadius:9,border:"none",background:"#dc2626",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(220,38,38,.3)"}}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── FORM PRIMITIVES ────────────────────────────────────
const FL = ({label,req,children,hint}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    <label style={{fontSize:10.5,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:"#374151"}}>
      {label}{req&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}
    </label>
    {children}
    {hint&&<div style={{fontSize:10.5,color:"#9ca3af"}}>{hint}</div>}
  </div>
);
const FI = ({err,...p}) => (
  <input {...p} style={{height:40,border:`1.5px solid ${err?"#ef4444":"#e5e7eb"}`,borderRadius:9,padding:"0 12px",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:13,color:"#111827",background:"#fafafa",outline:"none",width:"100%",...p.style}}
    onFocus={e=>e.target.style.borderColor="#5b2be0"}
    onBlur={e=>e.target.style.borderColor=err?"#ef4444":"#e5e7eb"}/>
);
const FS = ({children,...p}) => (
  <select {...p} style={{height:40,border:"1.5px solid #e5e7eb",borderRadius:9,padding:"0 12px",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:13,color:"#111827",background:"#fafafa",outline:"none",width:"100%",cursor:"pointer"}}>
    {children}
  </select>
);
const FRow2 = ({children,style}) => <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,...style}}>{children}</div>;
const FRow3 = ({children}) => <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>{children}</div>;

// ─── SHARED COMPONENTS ──────────────────────────────────
function Toolbar({ onSearch, onAdd, addLabel, accentColor, count }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
      <div style={{flex:1,minWidth:200,maxWidth:300,position:"relative"}}>
        <svg style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#9ca3af"}} width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.4"/><path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <input placeholder="Search…" onChange={e=>onSearch(e.target.value)}
          style={{width:"100%",height:36,border:"1.5px solid #e5e7eb",borderRadius:8,paddingLeft:32,paddingRight:12,fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:12.5,color:"#111827",background:"#fff",outline:"none"}}/>
      </div>
      <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:12,color:"#6b7280",background:"#f3f4f6",padding:"3px 10px",borderRadius:20,fontWeight:500}}>{count} record{count!==1?"s":""}</span>
        <button onClick={onAdd} style={{display:"inline-flex",alignItems:"center",gap:6,height:36,padding:"0 16px",borderRadius:8,border:"none",background:`linear-gradient(135deg,${accentColor},${accentColor}cc)`,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 12px ${accentColor}44`}}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
          {addLabel}
        </button>
      </div>
    </div>
  );
}

function ActBtns({ onView, onEdit, onDelete }) {
  return (
    <div style={{display:"flex",gap:5}}>
      {onView&&<button title="View" onClick={onView} style={actStyle("#e0f2fe","#0891b2")}><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><ellipse cx="6.5" cy="6.5" rx="5" ry="3.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="6.5" cy="6.5" r="1.6" stroke="currentColor" strokeWidth="1.3"/></svg></button>}
      <button title="Edit" onClick={onEdit} style={actStyle("#eef2ff","#4f46e5")}><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2.5l1.5 1.5-6.5 6.5H2.5v-2L9 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg></button>
      <button title="Delete" onClick={onDelete} style={actStyle("#fef2f2","#dc2626")}><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 4h9M5 4V3a1 1 0 011-1h1a1 1 0 011 1v1M3.5 4l.5 7h5l.5-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg></button>
    </div>
  );
}
function actStyle(bg,color){return{width:28,height:28,borderRadius:7,border:`1.5px solid ${bg}`,background:bg,color,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}

function TH({children,right}) { return <th style={{padding:"9px 14px",textAlign:right?"right":"left",fontSize:10.5,fontWeight:700,letterSpacing:".07em",textTransform:"uppercase",color:"#9ca3af",background:"#f9fafb",borderBottom:"1px solid #f0f0f0",whiteSpace:"nowrap"}}>{children}</th>; }
function TD({children,right,bold}) { return <td style={{padding:"11px 14px",textAlign:right?"right":"left",fontSize:13,color:bold?"#111827":"#374151",fontWeight:bold?600:400,verticalAlign:"middle",borderBottom:"1px solid #f9fafb"}}>{children}</td>; }

function EmptyState({msg}) {
  return (
    <tr><td colSpan={20}><div style={{padding:"48px 0",textAlign:"center",color:"#9ca3af"}}>
      <div style={{fontSize:32,marginBottom:10}}>📭</div>
      <div style={{fontSize:14,fontWeight:600,color:"#6b7280"}}>{msg||"No records found"}</div>
    </div></td></tr>
  );
}

function Toast({ msg, type, onClose }) {
  return (
    <div style={{position:"fixed",bottom:24,right:24,background:"#111827",color:"#fff",padding:"12px 18px",borderRadius:12,fontSize:13,fontWeight:500,zIndex:2000,display:"flex",alignItems:"center",gap:10,boxShadow:"0 8px 30px rgba(0,0,0,.25)",animation:"toastIn .3s ease",borderLeft:`4px solid ${type==="error"?"#ef4444":"#10b981"}`}}>
      {type==="error"?"❌":"✅"} {msg}
      <button onClick={onClose} style={{marginLeft:8,background:"none",border:"none",color:"rgba(255,255,255,.5)",cursor:"pointer",fontSize:14}}>✕</button>
    </div>
  );
}

// ─── MACHINE TABLE EDITOR ────────────────────────────────
function MachineEditor({ machines, onChange }) {
  const add    = () => onChange([...machines,{tonnage:"",count:1}]);
  const remove = i => onChange(machines.filter((_,idx)=>idx!==i));
  const update = (i,k,v) => onChange(machines.map((m,idx)=>idx===i?{...m,[k]:v}:m));
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <label style={{fontSize:10.5,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:"#374151"}}>Machines (Tonnage & Count)</label>
        <button onClick={add} style={{fontSize:11,fontWeight:600,color:"#4f46e5",background:"#eef2ff",border:"1px solid #c7d2fe",borderRadius:6,padding:"3px 10px",cursor:"pointer"}}>+ Add Row</button>
      </div>
      {machines.map((m,i) => (
        <div key={i} style={{display:"flex",gap:8,marginBottom:6,alignItems:"center"}}>
          <input value={m.tonnage} onChange={e=>update(i,"tonnage",e.target.value)} placeholder="e.g. 500T"
            style={{flex:2,height:36,border:"1.5px solid #e5e7eb",borderRadius:8,padding:"0 10px",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:12.5,outline:"none",background:"#fafafa"}}/>
          <input type="number" value={m.count} onChange={e=>update(i,"count",e.target.value)} placeholder="Count" min={1}
            style={{flex:1,height:36,border:"1.5px solid #e5e7eb",borderRadius:8,padding:"0 10px",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:12.5,outline:"none",background:"#fafafa"}}/>
          <button onClick={()=>remove(i)} style={{width:28,height:28,borderRadius:7,border:"1.5px solid #fecaca",background:"#fef2f2",color:"#dc2626",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
      ))}
      {machines.length===0 && <div style={{fontSize:12,color:"#9ca3af",fontStyle:"italic"}}>No machines added yet</div>}
    </div>
  );
}

// ─── VENDOR MASTER ───────────────────────────────────────
function VendorMaster({ toast }) {
  const [vendors, setVendors] = useState(SEED_VENDORS);
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(null);
  const [delTarget, setDelTarget] = useState(null);

  const BLANK = { code:"",name:"",location:"",contact:"",email:"",phone:"",machines:[{tonnage:"",count:1}] };

  const filtered = vendors.filter(v =>
    [v.code,v.name,v.location,v.contact,v.email].some(f=>f.toLowerCase().includes(search.toLowerCase()))
  );

  const save = form => {
    if (modal.mode==="add") {
      setVendors(v=>[...v,{...form,id:Date.now()}]);
      toast("Vendor added successfully");
    } else {
      setVendors(v=>v.map(x=>x.id===form.id?form:x));
      toast("Vendor updated successfully");
    }
    setModal(null);
  };

  return (
    <div>
      <Toolbar onSearch={setSearch} onAdd={()=>setModal({mode:"add",form:{...BLANK,machines:[{tonnage:"",count:1}]}})}
        addLabel="Add Vendor" accentColor="#0891b2" count={filtered.length}/>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            <TH>Vendor Code</TH><TH>Vendor Name</TH><TH>Location</TH>
            <TH>Contact Person</TH><TH>Email</TH><TH>Phone</TH><TH>Machines</TH><TH right>Actions</TH>
          </tr></thead>
          <tbody>
            {filtered.length===0 ? <EmptyState msg="No vendors found"/> : filtered.map(v=>(
              <tr key={v.id} style={{transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background="#fafbff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                <TD><span style={{fontSize:11,fontWeight:700,background:"#e0f2fe",color:"#0369a1",padding:"2px 8px",borderRadius:5}}>{v.code}</span></TD>
                <TD><div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:avatarColor(v.name),display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>{initials(v.name)}</div>
                  <span style={{fontWeight:600,color:"#111827",fontSize:13}}>{v.name}</span>
                </div></TD>
                <TD>{v.location}</TD>
                <TD>{v.contact}</TD>
                <TD><span style={{fontSize:12,color:"#4f46e5"}}>{v.email}</span></TD>
                <TD>{v.phone}</TD>
                <TD>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {v.machines.map((m,i)=>(
                      <span key={i} style={{fontSize:10.5,fontWeight:600,background:"#f3f4f6",color:"#374151",padding:"2px 7px",borderRadius:5,border:"1px solid #e5e7eb"}}>{m.count}×{m.tonnage}</span>
                    ))}
                  </div>
                </TD>
                <TD right><ActBtns onEdit={()=>setModal({mode:"edit",form:JSON.parse(JSON.stringify(v))})} onDelete={()=>setDelTarget(v)}/></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && <VendorForm mode={modal.mode} initial={modal.form} onClose={()=>setModal(null)} onSave={save}/>}
      {delTarget && <DeleteModal name={delTarget.name} onClose={()=>setDelTarget(null)} onConfirm={()=>{ setVendors(v=>v.filter(x=>x.id!==delTarget.id)); toast("Vendor deleted"); setDelTarget(null); }}/>}
    </div>
  );
}

function VendorForm({ mode, initial, onClose, onSave }) {
  const [f, setF] = useState(JSON.parse(JSON.stringify(initial)));
  const [err, setErr] = useState({});
  const s = (k,v) => setF(x=>({...x,[k]:v}));

  const validate = () => {
    const e={};
    if(!f.code.trim()) e.code="Required";
    if(!f.name.trim()) e.name="Required";
    return e;
  };

  return (
    <Modal title={mode==="add"?"Add New Vendor":"Edit Vendor"} subtitle={mode==="edit"?`Editing ${f.name}`:undefined}
      onClose={onClose} footer={<>
        <button onClick={onClose} style={outlineBtn}>Cancel</button>
        <button onClick={()=>{ const e=validate(); if(Object.keys(e).length){setErr(e);return;} onSave(f); }} style={primaryBtn("#0891b2")}>
          {mode==="add"?"Save Vendor":"Update Vendor"}
        </button>
      </>}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <FRow2><FL label="Vendor Code" req><FI value={f.code} onChange={e=>s("code",e.target.value)} placeholder="VND-005" err={err.code}/></FL>
          <FL label="Vendor Name" req><FI value={f.name} onChange={e=>s("name",e.target.value)} placeholder="Company Pvt Ltd" err={err.name}/></FL></FRow2>
        <FL label="Location"><FI value={f.location} onChange={e=>s("location",e.target.value)} placeholder="City, State"/></FL>
        <FRow3>
          <FL label="Contact Person"><FI value={f.contact} onChange={e=>s("contact",e.target.value)} placeholder="Full Name"/></FL>
          <FL label="Email"><FI type="email" value={f.email} onChange={e=>s("email",e.target.value)} placeholder="email@company.com"/></FL>
          <FL label="Phone"><FI value={f.phone} onChange={e=>s("phone",e.target.value)} placeholder="+91 98xxx xxxxx"/></FL>
        </FRow3>
        <MachineEditor machines={f.machines} onChange={v=>s("machines",v)}/>
      </div>
    </Modal>
  );
}

// ─── MANUFACTURER MASTER ─────────────────────────────────
function ManufacturerMaster({ toast }) {
  const [mfrs, setMfrs] = useState(SEED_MANUFACTURERS);
  const [search, setSearch] = useState("");
  const [modal, setModal]   = useState(null);
  const [delTarget, setDel] = useState(null);
  const BLANK = { code:"",name:"",country:"India",contact:"",email:"",phone:"",specialty:"" };
  const filtered = mfrs.filter(m=>[m.code,m.name,m.contact,m.email].some(f=>f.toLowerCase().includes(search.toLowerCase())));
  const save = form => {
    if(modal.mode==="add"){ setMfrs(v=>[...v,{...form,id:Date.now()}]); toast("Manufacturer added"); }
    else { setMfrs(v=>v.map(x=>x.id===form.id?form:x)); toast("Manufacturer updated"); }
    setModal(null);
  };
  return (
    <div>
      <Toolbar onSearch={setSearch} onAdd={()=>setModal({mode:"add",form:{...BLANK}})}
        addLabel="Add Manufacturer" accentColor="#7c3aed" count={filtered.length}/>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            <TH>Supplier Code</TH><TH>Supplier Name</TH><TH>Country</TH>
            <TH>Contact</TH><TH>Email</TH><TH>Phone</TH><TH>Specialty</TH><TH right>Actions</TH>
          </tr></thead>
          <tbody>
            {filtered.length===0?<EmptyState msg="No manufacturers found"/>:filtered.map(m=>(
              <tr key={m.id} onMouseEnter={e=>e.currentTarget.style.background="#fafbff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                <TD><span style={{fontSize:11,fontWeight:700,background:"#f5f3ff",color:"#6d28d9",padding:"2px 8px",borderRadius:5}}>{m.code}</span></TD>
                <TD><div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:avatarColor(m.name),display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>{initials(m.name)}</div>
                  <span style={{fontWeight:600,color:"#111827",fontSize:13}}>{m.name}</span>
                </div></TD>
                <TD>{m.country}</TD>
                <TD>{m.contact}</TD>
                <TD><span style={{fontSize:12,color:"#4f46e5"}}>{m.email}</span></TD>
                <TD>{m.phone}</TD>
                <TD><span style={{fontSize:11.5,fontWeight:600,background:"#f0fdf4",color:"#15803d",padding:"2px 8px",borderRadius:5,border:"1px solid #bbf7d0"}}>{m.specialty}</span></TD>
                <TD right><ActBtns onEdit={()=>setModal({mode:"edit",form:JSON.parse(JSON.stringify(m))})} onDelete={()=>setDel(m)}/></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <Modal title={modal.mode==="add"?"Add Manufacturer":"Edit Manufacturer"} onClose={()=>setModal(null)} footer={<>
          <button onClick={()=>setModal(null)} style={outlineBtn}>Cancel</button>
          <button onClick={()=>save(modal.form)} style={primaryBtn("#7c3aed")}>{modal.mode==="add"?"Save":"Update"}</button>
        </>}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <FRow2>
              <FL label="Supplier Code" req><FI value={modal.form.code} onChange={e=>setModal(m=>({...m,form:{...m.form,code:e.target.value}}))}/></FL>
              <FL label="Supplier Name" req><FI value={modal.form.name} onChange={e=>setModal(m=>({...m,form:{...m.form,name:e.target.value}}))}/></FL>
            </FRow2>
            <FRow2>
              <FL label="Country"><FI value={modal.form.country} onChange={e=>setModal(m=>({...m,form:{...m.form,country:e.target.value}}))}/></FL>
              <FL label="Specialty"><FI value={modal.form.specialty} onChange={e=>setModal(m=>({...m,form:{...m.form,specialty:e.target.value}}))}/></FL>
            </FRow2>
            <FRow3>
              <FL label="Contact Person"><FI value={modal.form.contact} onChange={e=>setModal(m=>({...m,form:{...m.form,contact:e.target.value}}))}/></FL>
              <FL label="Email"><FI value={modal.form.email} onChange={e=>setModal(m=>({...m,form:{...m.form,email:e.target.value}}))}/></FL>
              <FL label="Phone"><FI value={modal.form.phone} onChange={e=>setModal(m=>({...m,form:{...m.form,phone:e.target.value}}))}/></FL>
            </FRow3>
          </div>
        </Modal>
      )}
      {delTarget && <DeleteModal name={delTarget.name} onClose={()=>setDel(null)} onConfirm={()=>{ setMfrs(v=>v.filter(x=>x.id!==delTarget.id)); toast("Manufacturer deleted"); setDel(null); }}/>}
    </div>
  );
}

// ─── MOULD TYPE MASTER ───────────────────────────────────
function MouldTypeMaster({ toast }) {
  const [types, setTypes] = useState(SEED_MOULD_TYPES);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [delTarget, setDel] = useState(null);
  const BLANK = { code:"",name:"",description:"",cavities:"Single",material:"" };
  const filtered = types.filter(t=>[t.code,t.name,t.description].some(f=>f.toLowerCase().includes(search.toLowerCase())));
  const save = form => {
    if(modal.mode==="add"){ setTypes(v=>[...v,{...form,id:Date.now()}]); toast("Mould type added"); }
    else { setTypes(v=>v.map(x=>x.id===form.id?form:x)); toast("Mould type updated"); }
    setModal(null);
  };
  return (
    <div>
      <Toolbar onSearch={setSearch} onAdd={()=>setModal({mode:"add",form:{...BLANK}})}
        addLabel="Add Mould Type" accentColor="#059669" count={filtered.length}/>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            <TH>Code</TH><TH>Mould Type</TH><TH>Description</TH><TH>Cavities</TH><TH>Material</TH><TH right>Actions</TH>
          </tr></thead>
          <tbody>
            {filtered.length===0?<EmptyState msg="No mould types found"/>:filtered.map(t=>(
              <tr key={t.id} onMouseEnter={e=>e.currentTarget.style.background="#fafbff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                <TD><span style={{fontSize:11,fontWeight:700,background:"#f0fdf4",color:"#15803d",padding:"2px 8px",borderRadius:5}}>{t.code}</span></TD>
                <TD bold>{t.name}</TD>
                <TD><span style={{fontSize:12,color:"#6b7280"}}>{t.description}</span></TD>
                <TD><span style={{fontSize:11.5,fontWeight:600,background:"#eef2ff",color:"#4338ca",padding:"2px 8px",borderRadius:5,border:"1px solid #c7d2fe"}}>{t.cavities}</span></TD>
                <TD>{t.material}</TD>
                <TD right><ActBtns onEdit={()=>setModal({mode:"edit",form:JSON.parse(JSON.stringify(t))})} onDelete={()=>setDel(t)}/></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <Modal title={modal.mode==="add"?"Add Mould Type":"Edit Mould Type"} onClose={()=>setModal(null)} footer={<>
          <button onClick={()=>setModal(null)} style={outlineBtn}>Cancel</button>
          <button onClick={()=>save(modal.form)} style={primaryBtn("#059669")}>{modal.mode==="add"?"Save":"Update"}</button>
        </>}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <FRow2>
              <FL label="Type Code" req><FI value={modal.form.code} onChange={e=>setModal(m=>({...m,form:{...m.form,code:e.target.value}}))}/></FL>
              <FL label="Type Name" req><FI value={modal.form.name} onChange={e=>setModal(m=>({...m,form:{...m.form,name:e.target.value}}))}/></FL>
            </FRow2>
            <FL label="Description"><FI value={modal.form.description} onChange={e=>setModal(m=>({...m,form:{...m.form,description:e.target.value}}))}/></FL>
            <FRow2>
              <FL label="Cavity Type">
                <FS value={modal.form.cavities} onChange={e=>setModal(m=>({...m,form:{...m.form,cavities:e.target.value}}))}>
                  <option>Single</option><option>Multi-cavity</option><option>Family</option><option>Stack</option>
                </FS>
              </FL>
              <FL label="Mould Material"><FI value={modal.form.material} onChange={e=>setModal(m=>({...m,form:{...m.form,material:e.target.value}})) } placeholder="e.g. P20 Steel"/></FL>
            </FRow2>
          </div>
        </Modal>
      )}
      {delTarget && <DeleteModal name={delTarget.name} onClose={()=>setDel(null)} onConfirm={()=>{ setTypes(v=>v.filter(x=>x.id!==delTarget.id)); toast("Mould type deleted"); setDel(null); }}/>}
    </div>
  );
}

// ─── TRANSFER REASON MASTER ──────────────────────────────
function TransferReasonMaster({ toast }) {
  const [reasons, setReasons] = useState(SEED_TRANSFER_REASONS);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [delTarget, setDel] = useState(null);
  const BLANK = { code:"",name:"",description:"",active:true };
  const filtered = reasons.filter(r=>[r.code,r.name,r.description].some(f=>f.toLowerCase().includes(search.toLowerCase())));
  const save = form => {
    if(modal.mode==="add"){ setReasons(v=>[...v,{...form,id:Date.now()}]); toast("Transfer reason added"); }
    else { setReasons(v=>v.map(x=>x.id===form.id?form:x)); toast("Transfer reason updated"); }
    setModal(null);
  };
  const toggleActive = id => { setReasons(v=>v.map(x=>x.id===id?{...x,active:!x.active}:x)); toast("Status updated"); };
  return (
    <div>
      <Toolbar onSearch={setSearch} onAdd={()=>setModal({mode:"add",form:{...BLANK}})}
        addLabel="Add Reason" accentColor="#d97706" count={filtered.length}/>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            <TH>Code</TH><TH>Reason Name</TH><TH>Description</TH><TH>Status</TH><TH right>Actions</TH>
          </tr></thead>
          <tbody>
            {filtered.length===0?<EmptyState msg="No transfer reasons found"/>:filtered.map(r=>(
              <tr key={r.id} onMouseEnter={e=>e.currentTarget.style.background="#fafbff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                <TD><span style={{fontSize:11,fontWeight:700,background:"#fffbeb",color:"#b45309",padding:"2px 8px",borderRadius:5}}>{r.code}</span></TD>
                <TD bold>{r.name}</TD>
                <TD><span style={{fontSize:12,color:"#6b7280"}}>{r.description}</span></TD>
                <TD>
                  <div onClick={()=>toggleActive(r.id)} style={{display:"inline-flex",alignItems:"center",gap:7,cursor:"pointer"}}>
                    <div style={{width:36,height:20,borderRadius:10,background:r.active?"#059669":"#e5e7eb",position:"relative",transition:"background .2s"}}>
                      <div style={{width:14,height:14,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:r.active?19:3,transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
                    </div>
                    <span style={{fontSize:11.5,fontWeight:600,color:r.active?"#15803d":"#9ca3af"}}>{r.active?"Active":"Inactive"}</span>
                  </div>
                </TD>
                <TD right><ActBtns onEdit={()=>setModal({mode:"edit",form:JSON.parse(JSON.stringify(r))})} onDelete={()=>setDel(r)}/></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <Modal title={modal.mode==="add"?"Add Transfer Reason":"Edit Transfer Reason"} onClose={()=>setModal(null)} footer={<>
          <button onClick={()=>setModal(null)} style={outlineBtn}>Cancel</button>
          <button onClick={()=>save(modal.form)} style={primaryBtn("#d97706")}>{modal.mode==="add"?"Save":"Update"}</button>
        </>}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <FRow2>
              <FL label="Reason Code" req><FI value={modal.form.code} onChange={e=>setModal(m=>({...m,form:{...m.form,code:e.target.value}}))}/></FL>
              <FL label="Reason Name" req><FI value={modal.form.name} onChange={e=>setModal(m=>({...m,form:{...m.form,name:e.target.value}}))}/></FL>
            </FRow2>
            <FL label="Description"><FI value={modal.form.description} onChange={e=>setModal(m=>({...m,form:{...m.form,description:e.target.value}}))}/></FL>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div onClick={()=>setModal(m=>({...m,form:{...m.form,active:!m.form.active}}))} style={{width:38,height:22,borderRadius:11,background:modal.form.active?"#059669":"#e5e7eb",position:"relative",cursor:"pointer",transition:"background .2s"}}>
                <div style={{width:16,height:16,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:modal.form.active?19:3,transition:"left .2s"}}/>
              </div>
              <span style={{fontSize:13,fontWeight:500,color:"#374151"}}>Active</span>
            </div>
          </div>
        </Modal>
      )}
      {delTarget && <DeleteModal name={delTarget.name} onClose={()=>setDel(null)} onConfirm={()=>{ setReasons(v=>v.filter(x=>x.id!==delTarget.id)); toast("Reason deleted"); setDel(null); }}/>}
    </div>
  );
}

// ─── DEPRECIATION METHOD MASTER ──────────────────────────
function DepreciationMaster({ toast }) {
  const [methods, setMethods] = useState(SEED_DEPR_METHODS);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [delTarget, setDel] = useState(null);
  const BLANK = { code:"",name:"",abbr:"",description:"",rate:"" };
  const filtered = methods.filter(m=>[m.code,m.name,m.abbr,m.description].some(f=>f.toLowerCase().includes(search.toLowerCase())));
  const save = form => {
    if(modal.mode==="add"){ setMethods(v=>[...v,{...form,id:Date.now()}]); toast("Depreciation method added"); }
    else { setMethods(v=>v.map(x=>x.id===form.id?form:x)); toast("Method updated"); }
    setModal(null);
  };
  return (
    <div>
      <Toolbar onSearch={setSearch} onAdd={()=>setModal({mode:"add",form:{...BLANK}})}
        addLabel="Add Method" accentColor="#dc2626" count={filtered.length}/>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            <TH>Code</TH><TH>Method Name</TH><TH>Abbreviation</TH><TH>Description</TH><TH>Rate</TH><TH right>Actions</TH>
          </tr></thead>
          <tbody>
            {filtered.length===0?<EmptyState msg="No depreciation methods found"/>:filtered.map(m=>(
              <tr key={m.id} onMouseEnter={e=>e.currentTarget.style.background="#fafbff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                <TD><span style={{fontSize:11,fontWeight:700,background:"#fef2f2",color:"#b91c1c",padding:"2px 8px",borderRadius:5}}>{m.code}</span></TD>
                <TD bold>{m.name}</TD>
                <TD><span style={{fontFamily:"monospace",fontSize:13,fontWeight:700,background:"#f3f4f6",color:"#374151",padding:"2px 8px",borderRadius:5}}>{m.abbr}</span></TD>
                <TD><span style={{fontSize:12,color:"#6b7280"}}>{m.description}</span></TD>
                <TD><span style={{fontSize:12,fontWeight:700,color:"#dc2626"}}>{m.rate}</span></TD>
                <TD right><ActBtns onEdit={()=>setModal({mode:"edit",form:JSON.parse(JSON.stringify(m))})} onDelete={()=>setDel(m)}/></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <Modal title={modal.mode==="add"?"Add Depreciation Method":"Edit Method"} onClose={()=>setModal(null)} footer={<>
          <button onClick={()=>setModal(null)} style={outlineBtn}>Cancel</button>
          <button onClick={()=>save(modal.form)} style={primaryBtn("#dc2626")}>{modal.mode==="add"?"Save":"Update"}</button>
        </>}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <FRow3>
              <FL label="Code" req><FI value={modal.form.code} onChange={e=>setModal(m=>({...m,form:{...m.form,code:e.target.value}}))}/></FL>
              <FL label="Method Name" req><FI value={modal.form.name} onChange={e=>setModal(m=>({...m,form:{...m.form,name:e.target.value}}))}/></FL>
              <FL label="Abbreviation"><FI value={modal.form.abbr} onChange={e=>setModal(m=>({...m,form:{...m.form,abbr:e.target.value}})) } placeholder="e.g. SLM"/></FL>
            </FRow3>
            <FL label="Description"><FI value={modal.form.description} onChange={e=>setModal(m=>({...m,form:{...m.form,description:e.target.value}}))}/></FL>
            <FL label="Rate / Basis" hint="e.g. 10-20%, Per Shot, Variable"><FI value={modal.form.rate} onChange={e=>setModal(m=>({...m,form:{...m.form,rate:e.target.value}})) } placeholder="e.g. 15-20%"/></FL>
          </div>
        </Modal>
      )}
      {delTarget && <DeleteModal name={delTarget.name} onClose={()=>setDel(null)} onConfirm={()=>{ setMethods(v=>v.filter(x=>x.id!==delTarget.id)); toast("Method deleted"); setDel(null); }}/>}
    </div>
  );
}

// ─── BUTTON STYLES ───────────────────────────────────────
const outlineBtn = {height:38,padding:"0 18px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",color:"#374151"};
function primaryBtn(color){return{height:38,padding:"0 18px",borderRadius:9,border:"none",background:`linear-gradient(135deg,${color},${color}bb)`,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 12px ${color}44`};}

// ─── ROOT COMPONENT ──────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#f0f2f5;min-height:100vh;color:#111827}
@keyframes modalIn{from{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.shell{display:flex;height:100vh;overflow:hidden}
.sidebar{width:220px;flex-shrink:0;background:linear-gradient(170deg,#3b3fe8 0%,#5b2be0 45%,#7c2fe8 100%);display:flex;flex-direction:column;position:relative;overflow:hidden}
.sidebar::after{content:'';position:absolute;bottom:-60px;left:-60px;width:240px;height:240px;border-radius:50%;background:rgba(255,255,255,.05);pointer-events:none}
.sb-brand{padding:20px 18px 16px;border-bottom:1px solid rgba(255,255,255,.1)}
.sb-row{display:flex;align-items:center;gap:10px}
.sb-icon{width:34px;height:34px;background:rgba(255,255,255,.18);border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sb-name{font-size:13px;font-weight:700;color:#fff}.sb-name span{font-weight:400;opacity:.8}
.sb-sub{font-size:10px;color:rgba(255,255,255,.45);margin-top:1px}
.sb-nav{flex:1;padding:12px 10px;display:flex;flex-direction:column;gap:3px;overflow-y:auto}
.sb-sec{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.3);padding:8px 10px 4px}
.sb-item{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:8px;cursor:pointer;color:rgba(255,255,255,.6);font-size:12.5px;font-weight:500;transition:background .15s}
.sb-item:hover{background:rgba(255,255,255,.1);color:#fff}
.sb-item.active{background:rgba(255,255,255,.18);color:#fff;font-weight:700}
.sb-footer{padding:14px 12px;border-top:1px solid rgba(255,255,255,.1)}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.topbar{height:56px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;box-shadow:0 1px 4px rgba(0,0,0,.05)}
.content{flex:1;overflow-y:auto;padding:20px 24px 28px}
`;

export default function MastersPage() {
  const [activeTab, setActiveTab] = useState("vendor");
  const [toastMsg, setToastMsg]   = useState(null);
  const [user, setUser] = useState({ name: "User", role: "Viewer" });
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
  }, []);

  const initials = user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const showToast = msg => {
    setToastMsg(msg);
    setTimeout(()=>setToastMsg(null), 3200);
  };

  const activeTabDef = TABS.find(t=>t.key===activeTab);

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">

        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sb-brand">
            <div className="sb-row">
              <div className="sb-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".9"/>
                  <rect x="12" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".6"/>
                  <rect x="2" y="12" width="6" height="6" rx="1.5" fill="white" opacity=".6"/>
                  <rect x="12" y="12" width="6" height="6" rx="1.5" fill="white" opacity=".9"/>
                  <circle cx="10" cy="10" r="1.8" fill="white"/>
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
            {NAV_ITEMS.map(n=>(
              <div key={n.label} className={`sb-item${n.active?" active":""}`}
                onClick={() => router.push(n.route)}>
                <span>{n.icon}</span>{n.label}
              </div>
            ))}
          </div>
          <div className="sb-footer">
            <div className="sb-row">
              <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0}}>{initials}</div>
              <div><div style={{fontSize:11.5,fontWeight:600,color:"#fff"}}>{user.name}</div><div style={{fontSize:10,color:"rgba(255,255,255,.45)"}}>{user.role}</div></div>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="main">
          {/* Topbar */}
          <div className="topbar">
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{fontSize:12,color:"#9ca3af",display:"flex",alignItems:"center",gap:4}}>
                <span>Administration</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div style={{fontSize:16,fontWeight:800,color:"#111827",letterSpacing:"-.02em"}}>Masters</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:8,border:"1.5px solid #e5e7eb",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#6b7280",position:"relative"}}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2a4 4 0 00-4 4v2l-1 2h10l-1-2V6a4 4 0 00-4-4zM5.5 12a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                <div style={{width:6,height:6,background:"#ef4444",borderRadius:"50%",position:"absolute",top:7,right:7,border:"1.5px solid #fff"}}/>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:7,background:"#f9fafb",border:"1.5px solid #e5e7eb",borderRadius:9,padding:"4px 10px 4px 5px"}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:"#4f46e5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff"}}>{initials}</div>
                <span style={{fontSize:11.5,fontWeight:600,color:"#374151"}}>{user.name}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="content">

            {/* Page header */}
            <div style={{marginBottom:20}}>
              <div style={{fontSize:20,fontWeight:800,color:"#111827",letterSpacing:"-.025em"}}>Master Configuration</div>
              <div style={{fontSize:13,color:"#6b7280",marginTop:3}}>Manage all reference data used across the mould tracking system</div>
            </div>

            {/* Tab bar */}
            <div style={{display:"flex",gap:6,marginBottom:20,background:"#fff",padding:6,borderRadius:14,border:"1px solid #e5e7eb",boxShadow:"0 1px 4px rgba(0,0,0,.04)",flexWrap:"wrap"}}>
              {TABS.map(tab=>{
                const isActive = activeTab===tab.key;
                return (
                  <button key={tab.key} onClick={()=>setActiveTab(tab.key)}
                    style={{display:"flex",alignItems:"center",gap:7,height:38,padding:"0 16px",borderRadius:9,border:`1.5px solid ${isActive?tab.border:"transparent"}`,background:isActive?tab.bg:"transparent",color:isActive?tab.color:"#6b7280",fontSize:13,fontWeight:isActive?700:500,cursor:"pointer",transition:"all .15s",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                    <span style={{fontSize:15}}>{tab.icon}</span>
                    {tab.label}
                    {isActive && (
                      <span style={{fontSize:10,fontWeight:700,background:tab.color,color:"#fff",padding:"1px 6px",borderRadius:10,marginLeft:2}}>
                        {tab.key==="vendor"?SEED_VENDORS.length:tab.key==="manufacturer"?SEED_MANUFACTURERS.length:tab.key==="mouldType"?SEED_MOULD_TYPES.length:tab.key==="transferReason"?SEED_TRANSFER_REASONS.length:SEED_DEPR_METHODS.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content card */}
            <div style={{background:"transparent",animation:"fadeUp .3s ease both"}}>
              {/* Section header */}
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <div style={{width:36,height:36,borderRadius:10,background:activeTabDef.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,border:`1.5px solid ${activeTabDef.border}`}}>
                  {activeTabDef.icon}
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:800,color:"#111827"}}>{activeTabDef.label}</div>
                  <div style={{fontSize:12,color:"#6b7280",marginTop:1}}>
                    {activeTab==="vendor" && "Manage jobwork vendors — companies that perform production on behalf"}
                    {activeTab==="manufacturer" && "Manage mould manufacturers — suppliers who fabricate moulds"}
                    {activeTab==="mouldType" && "Define types and categories of moulds in the system"}
                    {activeTab==="transferReason" && "Configurable reasons used when initiating mould transfers"}
                    {activeTab==="deprMethod" && "Depreciation methods used for mould asset valuation"}
                  </div>
                </div>
              </div>

              {activeTab==="vendor"         && <VendorMaster toast={showToast}/>}
              {activeTab==="manufacturer"   && <ManufacturerMaster toast={showToast}/>}
              {activeTab==="mouldType"      && <MouldTypeMaster toast={showToast}/>}
              {activeTab==="transferReason" && <TransferReasonMaster toast={showToast}/>}
              {activeTab==="deprMethod"     && <DepreciationMaster toast={showToast}/>}
            </div>

          </div>
        </div>
      </div>

      {toastMsg && <Toast msg={toastMsg} type="success" onClose={()=>setToastMsg(null)}/>}
    </>
  );
}