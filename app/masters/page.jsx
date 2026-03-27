'use client';
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── TABS & NAV CONFIG ────────────────────────────────────
const TABS = [
    { key: "vendor", label: "Vendor Master", icon: "🏭", color: "#0891b2", bg: "#e0f2fe", border: "#7dd3fc" },
    { key: "mfg", label: "Manufacturer Master", icon: "⚙️", color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
    { key: "type", label: "Mould Type", icon: "🔩", color: "#059669", bg: "#f0fdf4", border: "#6ee7b7" },
    { key: "reason", label: "Transfer Reason", icon: "🔄", color: "#d97706", bg: "#fffbeb", border: "#fcd34d" },
    { key: "depr", label: "Depreciation Method", icon: "📉", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
    { key: "plant", label: "Plant Master", icon: "🏗️", color: "#0284c7", bg: "#f0f9ff", border: "#7dd3fc" },
    { key: "dept", label: "Department Master", icon: "🏢", color: "#9333ea", bg: "#faf5ff", border: "#d8b4fe" },
    { key: "costCenter", label: "Cost Centre", icon: "💰", color: "#ea580c", bg: "#ffedd5", border: "#fcd34d" },
    { key: "technician", label: "Technician Master", icon: "🧑‍🔧", color: "#10b981", bg: "#dcfce7", border: "#6ee7b7" },
    { key: "maint_vendor", label: "Maint. Vendor", icon: "🛠️", color: "#f59e0b", bg: "#fef3c7", border: "#fcd34d" },
];

const NAV_ITEMS = [
    { label: "Dashboard", icon: "📊", route: "/dashboard" },
    { label: "User Management", icon: "👥", route: "/user-management" },
    { label: "Masters", icon: "🗂", route: "/masters", active: true },
    { label: "Mould Registry", icon: "🔩", route: "/mould-registry" },
    { label: "Transfers & Challan", icon: "🔄", route: "/challan" },
    { label: "Mould Return", icon: "📥", route: "/return" },
    { label: "Depreciation", icon: "📉", route: "/depreciation" },
    { label: "Maintenance", icon: "🔧", route: "/maintenance" },
    { label: "Scrap / Dispose", icon: "🗑", route: "/scrap" },
    { label: "Reports", icon: "📈", route: "/reports" }
];

// ─── HELPERS ─────────────────────────────────────────────
function avatarColor(str) {
    if (!str) return "#4f46e5";
    const cols = ["#4f46e5", "#0891b2", "#059669", "#d97706", "#7c3aed", "#dc2626", "#0284c7", "#9333ea"];
    let h = 0;
    for (let c of str) {
        h = c.charCodeAt(0) + ((h << 5) - h);
    }
    return cols[Math.abs(h) % cols.length];
}

function initials(name) {
    if (!name) return "U";
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

// ─── TOAST COMPONENT ─────────────────────────────────────
function Toast({ msg, type, onClose }) {
    return (
        <div className={`toast ${type === "error" ? "terr" : "tok"}`}>
            <span style={{ marginRight: 8 }}>{type === "error" ? "❌" : "✅"}</span>
            {msg}
            <button
                onClick={onClose}
                style={{
                    background: "transparent",
                    border: "none",
                    color: "#9ca3af",
                    cursor: "pointer",
                    marginLeft: 16,
                    fontSize: 16
                }}
            >
                &times;
            </button>
        </div>
    );
}

// ─── MODALS ───────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children, footer }) {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15,20,40,.45)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                backdropFilter: "blur(3px)"
            }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: 18,
                    width: "100%",
                    maxWidth: 600,
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: "0 32px 80px rgba(0,0,0,.2)",
                    animation: "modalIn .22s ease"
                }}
            >
                <div
                    style={{
                        padding: "20px 24px 16px",
                        borderBottom: "1px solid #f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        position: "sticky",
                        top: 0,
                        background: "#fff",
                        zIndex: 2,
                        borderRadius: "18px 18px 0 0"
                    }}
                >
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", letterSpacing: "-.02em" }}>
                            {title}
                        </div>
                        {subtitle && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{subtitle}</div>}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: 7,
                            border: "1.5px solid #e5e7eb",
                            background: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#6b7280"
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
                <div style={{ padding: "20px 24px" }}>{children}</div>
                {footer && (
                    <div
                        style={{
                            padding: "14px 24px",
                            borderTop: "1px solid #f3f4f6",
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 10,
                            background: "#fafafa",
                            borderRadius: "0 0 18px 18px"
                        }}
                    >
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── FORM PRIMITIVES ────────────────────────────────────
const FL = ({ label, req, children, hint }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label
            style={{
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                color: "#374151"
            }}
        >
            {label}
            {req && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
        </label>
        {children}
        {hint && <div style={{ fontSize: 10.5, color: "#9ca3af" }}>{hint}</div>}
    </div>
);

const FI = ({ err, disabled, ...p }) => (
    <input
        disabled={disabled}
        {...p}
        style={{
            height: 40,
            border: `1.5px solid ${err ? "#ef4444" : (disabled ? "#d1d5db" : "#e5e7eb")}`,
            borderRadius: 9,
            padding: "0 12px",
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            fontSize: 13,
            color: disabled ? "#9ca3af" : "#111827",
            background: disabled ? "#f3f4f6" : "#fafafa",
            cursor: disabled ? "not-allowed" : "text",
            outline: "none",
            width: "100%",
            ...p.style
        }}
        onFocus={e => {
            if (!disabled) e.target.style.borderColor = "#5b2be0";
        }}
        onBlur={e => {
            if (!disabled) e.target.style.borderColor = err ? "#ef4444" : "#e5e7eb";
        }}
    />
);

const FS = ({ children, ...p }) => (
    <select
        {...p}
        style={{
            height: 40,
            border: "1.5px solid #e5e7eb",
            borderRadius: 9,
            padding: "0 12px",
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            fontSize: 13,
            color: "#111827",
            background: "#fafafa",
            outline: "none",
            width: "100%",
            cursor: "pointer"
        }}
    >
        {children}
    </select>
);

const FRow2 = ({ children, style }) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, ...style }}>
        {children}
    </div>
);

const FRow3 = ({ children }) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {children}
    </div>
);

// ─── SHARED COMPONENTS ──────────────────────────────────
function Toolbar({ onSearch, onAdd, addLabel, accentColor, count }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200, maxWidth: 300, position: "relative" }}>
                <svg
                    style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
                    width="13"
                    height="13"
                    viewBox="0 0 13 13"
                    fill="none"
                >
                    <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <input
                    placeholder="Search…"
                    onChange={e => onSearch(e.target.value)}
                    style={{
                        width: "100%",
                        height: 36,
                        border: "1.5px solid #e5e7eb",
                        borderRadius: 8,
                        paddingLeft: 32,
                        paddingRight: 12,
                        fontFamily: "'Plus Jakarta Sans',sans-serif",
                        fontSize: 12.5,
                        color: "#111827",
                        background: "#fff",
                        outline: "none"
                    }}
                />
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                <span
                    style={{
                        fontSize: 12,
                        color: "#6b7280",
                        background: "#f3f4f6",
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontWeight: 500
                    }}
                >
                    {count} record{count !== 1 ? "s" : ""}
                </span>
                <button
                    onClick={onAdd}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        height: 36,
                        padding: "0 16px",
                        borderRadius: 8,
                        border: "none",
                        background: `linear-gradient(135deg,${accentColor},${accentColor}cc)`,
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: `0 4px 12px ${accentColor}44`
                    }}
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    {addLabel}
                </button>
            </div>
        </div>
    );
}

function ActBtns({ onEdit }) {
    return (
        <div style={{ display: "flex", gap: 5 }}>
            <button
                title="Edit"
                onClick={onEdit}
                style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    border: "1.5px solid #eef2ff",
                    background: "#eef2ff",
                    color: "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                }}
            >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M9 2.5l1.5 1.5-6.5 6.5H2.5v-2L9 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
            </button>
        </div>
    );
}

function StatusToggle({ status, onToggle }) {
    const isActive = status === 'Active';
    return (
        <div onClick={onToggle} style={{ display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
            <div
                style={{
                    width: 36,
                    height: 20,
                    borderRadius: 10,
                    background: isActive ? "#059669" : "#e5e7eb",
                    position: "relative",
                    transition: "background .2s"
                }}
            >
                <div
                    style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: "#fff",
                        position: "absolute",
                        top: 3,
                        left: isActive ? 19 : 3,
                        transition: "left .2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,.2)"
                    }}
                />
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: isActive ? "#15803d" : "#9ca3af" }}>
                {isActive ? "Active" : "Inactive"}
            </span>
        </div>
    );
}

function TH({ children, right }) {
    return (
        <th
            style={{
                padding: "9px 14px",
                textAlign: right ? "right" : "left",
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: ".07em",
                textTransform: "uppercase",
                color: "#9ca3af",
                background: "#f9fafb",
                borderBottom: "1px solid #f0f0f0",
                whiteSpace: "nowrap"
            }}
        >
            {children}
        </th>
    );
}

function TD({ children, right, bold }) {
    return (
        <td
            style={{
                padding: "11px 14px",
                textAlign: right ? "right" : "left",
                fontSize: 13,
                color: bold ? "#111827" : "#374151",
                fontWeight: bold ? 600 : 400,
                verticalAlign: "middle",
                borderBottom: "1px solid #f9fafb"
            }}
        >
            {children}
        </td>
    );
}

function EmptyState({ msg }) {
    return (
        <tr>
            <td colSpan={20}>
                <div style={{ padding: "48px 0", textAlign: "center", color: "#9ca3af" }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#6b7280" }}>
                        {msg || "No records found"}
                    </div>
                </div>
            </td>
        </tr>
    );
}

// ─── CUSTOM HOOK FOR API ────────────────────────────────
function useMasterData(type, toast) {
    const [data, setData] = useState([]);

    const fetchList = useCallback(async () => {
        try {
            const res = await fetch(`/api/masters?type=${type}&_t=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) {
                setData(await res.json());
            } else {
                console.error("Failed to fetch data:", await res.text());
            }
        } catch (err) {
            console.error(err);
        }
    }, [type]);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const saveRecord = async (form, isEdit) => {
        try {
            const res = await fetch(`/api/masters?type=${type}`, {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.error);
            toast(`${isEdit ? "Updated" : "Added"} successfully`);
            fetchList();
            return true;
        } catch (err) {
            toast(err.message, "error");
            return false;
        }
    };

    return { data, saveRecord };
}

// ─── VENDOR MASTER ───────────────────────────────────────
function VendorMaster({ toast, currentUser }) {
    const { data: vendors, saveRecord } = useMasterData('vendors', toast);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(null);

    const BLANK = {
        code: "",
        name: "",
        location: "",
        contact: "",
        email: "",
        phone: "",
        status: "Active",
        machines: [{ tonnage: "", count: 1 }]
    };

    const filtered = vendors.filter(v =>
        [v.code, v.name, v.location, v.contact, v.email].some(f => (f || "").toLowerCase().includes(search.toLowerCase()))
    );

    const save = async (form) => {
        const success = await saveRecord({ ...form, createdBy: currentUser.name }, modal?.mode === "edit");
        if (success) setModal(null);
    };

    return (
        <div>
            <Toolbar
                onSearch={setSearch}
                onAdd={() => setModal({ mode: "add", form: { ...BLANK } })}
                addLabel="Add Vendor"
                accentColor="#0891b2"
                count={filtered.length}
            />
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <TH>Code</TH>
                            <TH>Vendor Name</TH>
                            <TH>Location</TH>
                            <TH>Contact</TH>
                            <TH>Email</TH>
                            <TH>Status</TH>
                            <TH right>Actions</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <EmptyState msg="No vendors found" />
                        ) : (
                            filtered.map(v => (
                                <tr key={v.id}>
                                    <TD>
                                        <span style={{ fontSize: 11, fontWeight: 700, background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: 5 }}>
                                            {v.code}
                                        </span>
                                    </TD>
                                    <TD>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: "50%",
                                                    background: avatarColor(v.name),
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    color: "#fff",
                                                    flexShrink: 0
                                                }}
                                            >
                                                {initials(v.name)}
                                            </div>
                                            <span style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{v.name}</span>
                                        </div>
                                    </TD>
                                    <TD>{v.location || "—"}</TD>
                                    <TD>{v.contact || "—"}</TD>
                                    <TD>
                                        <span style={{ fontSize: 12, color: "#4f46e5" }}>{v.email || "—"}</span>
                                    </TD>
                                    <TD>
                                        <StatusToggle
                                            status={v.status}
                                            onToggle={() => saveRecord({ ...v, status: v.status === 'Active' ? 'Inactive' : 'Active' }, true)}
                                        />
                                    </TD>
                                    <TD right>
                                        <ActBtns onEdit={() => setModal({ mode: "edit", form: JSON.parse(JSON.stringify(v)) })} />
                                    </TD>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {modal && (
                <Modal
                    title={modal?.mode === "add" ? "Add Vendor" : "Edit Vendor"}
                    onClose={() => setModal(null)}
                    footer={
                        <>
                            <button onClick={() => setModal(null)} style={outlineBtn}>Cancel</button>
                            <button
                                onClick={() => {
                                    if (!modal?.form?.code || !modal?.form?.name) return toast("Code and Name required", "error");
                                    save(modal.form);
                                }}
                                style={primaryBtn("#0891b2")}
                            >
                                {modal?.mode === "add" ? "Save" : "Update"}
                            </button>
                        </>
                    }
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <FRow2>
                            <FL label="Vendor Code" req>
                                <FI
                                    disabled={modal?.mode === 'edit'}
                                    value={modal?.form?.code || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), code: e.target.value } }))}
                                />
                            </FL>
                            <FL label="Vendor Name" req>
                                <FI
                                    value={modal?.form?.name || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), name: e.target.value } }))}
                                />
                            </FL>
                        </FRow2>
                        <FL label="Location">
                            <FI
                                value={modal?.form?.location || ""}
                                onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), location: e.target.value } }))}
                            />
                        </FL>
                        <FRow3>
                            <FL label="Contact">
                                <FI
                                    value={modal?.form?.contact || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), contact: e.target.value } }))}
                                />
                            </FL>
                            <FL label="Email">
                                <FI
                                    type="email"
                                    value={modal?.form?.email || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), email: e.target.value } }))}
                                />
                            </FL>
                            <FL label="Phone">
                                <FI
                                    value={modal?.form?.phone || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), phone: e.target.value } }))}
                                />
                            </FL>
                        </FRow3>
                        <MachineEditor
                            machines={modal?.form?.machines || []}
                            onChange={v => setModal(m => ({ ...m, form: { ...(m?.form || {}), machines: v } }))}
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
                            <div
                                onClick={() => setModal(m => ({ ...m, form: { ...(m?.form || {}), status: m?.form?.status === 'Active' ? 'Inactive' : 'Active' } }))}
                                style={{
                                    width: 38,
                                    height: 22,
                                    borderRadius: 11,
                                    background: modal?.form?.status === 'Active' ? "#059669" : "#e5e7eb",
                                    position: "relative",
                                    cursor: "pointer",
                                    transition: "background .2s"
                                }}
                            >
                                <div
                                    style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        background: "#fff",
                                        position: "absolute",
                                        top: 3,
                                        left: modal?.form?.status === 'Active' ? 19 : 3,
                                        transition: "left .2s"
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                                {modal?.form?.status === 'Active' ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

function MachineEditor({ machines, onChange }) {
    const add = () => onChange([...machines, { tonnage: "", count: 1 }]);
    const remove = i => onChange(machines.filter((_, idx) => idx !== i));
    const update = (i, k, v) => onChange(machines.map((m, idx) => idx === i ? { ...m, [k]: v } : m));
    
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#374151" }}>
                    Machines
                </label>
                <button
                    onClick={add}
                    style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#4f46e5",
                        background: "#eef2ff",
                        border: "1px solid #c7d2fe",
                        borderRadius: 6,
                        padding: "3px 10px",
                        cursor: "pointer"
                    }}
                >
                    + Add
                </button>
            </div>
            {machines.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <input
                        value={m.tonnage}
                        onChange={e => update(i, "tonnage", e.target.value)}
                        placeholder="Tonnage"
                        style={{
                            flex: 2,
                            height: 36,
                            border: "1.5px solid #e5e7eb",
                            borderRadius: 8,
                            padding: "0 10px",
                            fontSize: 12.5,
                            outline: "none",
                            background: "#fafafa"
                        }}
                    />
                    <input
                        type="number"
                        value={m.count}
                        onChange={e => update(i, "count", e.target.value)}
                        min={1}
                        style={{
                            flex: 1,
                            height: 36,
                            border: "1.5px solid #e5e7eb",
                            borderRadius: 8,
                            padding: "0 10px",
                            fontSize: 12.5,
                            outline: "none",
                            background: "#fafafa"
                        }}
                    />
                    <button
                        onClick={() => remove(i)}
                        style={{
                            width: 36,
                            borderRadius: 7,
                            border: "1.5px solid #fecaca",
                            background: "#fef2f2",
                            color: "#dc2626",
                            cursor: "pointer"
                        }}
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}

// ─── MANUFACTURER MASTER ─────────────────────────────────
function ManufacturerMaster({ toast }) {
    const { data: mfrs, saveRecord } = useMasterData('manufacturers', toast);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(null);

    const BLANK = { code: "", name: "", country: "India", contact: "", email: "", phone: "", specialty: "", status: "Active" };
    
    const filtered = mfrs.filter(m =>
        [m.code, m.name, m.contact, m.email].some(f => (f || "").toLowerCase().includes(search.toLowerCase()))
    );
    
    const save = async (form) => {
        if (await saveRecord(form, modal?.mode === "edit")) setModal(null);
    };

    return (
        <div>
            <Toolbar
                onSearch={setSearch}
                onAdd={() => setModal({ mode: "add", form: { ...BLANK } })}
                addLabel="Add Manufacturer"
                accentColor="#7c3aed"
                count={filtered.length}
            />
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <TH>Code</TH>
                            <TH>Supplier Name</TH>
                            <TH>Country</TH>
                            <TH>Contact</TH>
                            <TH>Email</TH>
                            <TH>Status</TH>
                            <TH right>Actions</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <EmptyState msg="No manufacturers found" />
                        ) : (
                            filtered.map(m => (
                                <tr key={m.id}>
                                    <TD>
                                        <span style={{ fontSize: 11, fontWeight: 700, background: "#f5f3ff", color: "#6d28d9", padding: "2px 8px", borderRadius: 5 }}>
                                            {m.code}
                                        </span>
                                    </TD>
                                    <TD>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: "50%",
                                                    background: avatarColor(m.name),
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    color: "#fff",
                                                    flexShrink: 0
                                                }}
                                            >
                                                {initials(m.name)}
                                            </div>
                                            <span style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{m.name}</span>
                                        </div>
                                    </TD>
                                    <TD>{m.country || "—"}</TD>
                                    <TD>{m.contact || "—"}</TD>
                                    <TD><span style={{ fontSize: 12, color: "#4f46e5" }}>{m.email || "—"}</span></TD>
                                    <TD>
                                        <StatusToggle
                                            status={m.status}
                                            onToggle={() => saveRecord({ ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' }, true)}
                                        />
                                    </TD>
                                    <TD right>
                                        <ActBtns onEdit={() => setModal({ mode: "edit", form: JSON.parse(JSON.stringify(m)) })} />
                                    </TD>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {modal && (
                <Modal
                    title={modal?.mode === "add" ? "Add Manufacturer" : "Edit Manufacturer"}
                    onClose={() => setModal(null)}
                    footer={
                        <>
                            <button onClick={() => setModal(null)} style={outlineBtn}>Cancel</button>
                            <button
                                onClick={() => {
                                    if (!modal?.form?.code || !modal?.form?.name) return toast("Code and Name required", "error");
                                    save(modal.form);
                                }}
                                style={primaryBtn("#7c3aed")}
                            >
                                {modal?.mode === "add" ? "Save" : "Update"}
                            </button>
                        </>
                    }
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <FRow2>
                            <FL label="Code" req>
                                <FI
                                    disabled={modal?.mode === 'edit'}
                                    value={modal?.form?.code || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), code: e.target.value } }))}
                                />
                            </FL>
                            <FL label="Name" req>
                                <FI
                                    value={modal?.form?.name || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), name: e.target.value } }))}
                                />
                            </FL>
                        </FRow2>
                        <FRow2>
                            <FL label="Country">
                                <FI
                                    value={modal?.form?.country || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), country: e.target.value } }))}
                                />
                            </FL>
                            <FL label="Specialty">
                                <FI
                                    value={modal?.form?.specialty || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), specialty: e.target.value } }))}
                                />
                            </FL>
                        </FRow2>
                        <FRow3>
                            <FL label="Contact">
                                <FI
                                    value={modal?.form?.contact || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), contact: e.target.value } }))}
                                />
                            </FL>
                            <FL label="Email">
                                <FI
                                    value={modal?.form?.email || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), email: e.target.value } }))}
                                />
                            </FL>
                            <FL label="Phone">
                                <FI
                                    value={modal?.form?.phone || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), phone: e.target.value } }))}
                                />
                            </FL>
                        </FRow3>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
                            <div
                                onClick={() => setModal(m => ({ ...m, form: { ...(m?.form || {}), status: m?.form?.status === 'Active' ? 'Inactive' : 'Active' } }))}
                                style={{
                                    width: 38,
                                    height: 22,
                                    borderRadius: 11,
                                    background: modal?.form?.status === 'Active' ? "#059669" : "#e5e7eb",
                                    position: "relative",
                                    cursor: "pointer",
                                    transition: "background .2s"
                                }}
                            >
                                <div
                                    style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        background: "#fff",
                                        position: "absolute",
                                        top: 3,
                                        left: modal?.form?.status === 'Active' ? 19 : 3,
                                        transition: "left .2s"
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                                {modal?.form?.status === 'Active' ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ─── MOULD TYPE MASTER ───────────────────────────────────
function MouldTypeMaster({ toast }) {
    const { data: types, saveRecord } = useMasterData('mould_types', toast);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(null);

    const BLANK = { code: "", name: "", description: "", cavities: "Single", material: "", status: "Active" };
    
    const filtered = types.filter(t =>
        [t.code, t.name, t.description].some(f => (f || "").toLowerCase().includes(search.toLowerCase()))
    );
    
    const save = async (form) => {
        if (await saveRecord(form, modal?.mode === "edit")) setModal(null);
    };

    return (
        <div>
            <Toolbar
                onSearch={setSearch}
                onAdd={() => setModal({ mode: "add", form: { ...BLANK } })}
                addLabel="Add Mould Type"
                accentColor="#059669"
                count={filtered.length}
            />
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <TH>Code</TH>
                            <TH>Mould Type</TH>
                            <TH>Description</TH>
                            <TH>Cavities</TH>
                            <TH>Status</TH>
                            <TH right>Actions</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <EmptyState msg="No mould types found" />
                        ) : (
                            filtered.map(t => (
                                <tr key={t.id}>
                                    <TD>
                                        <span style={{ fontSize: 11, fontWeight: 700, background: "#f0fdf4", color: "#15803d", padding: "2px 8px", borderRadius: 5 }}>
                                            {t.code}
                                        </span>
                                    </TD>
                                    <TD bold>{t.name}</TD>
                                    <TD><span style={{ fontSize: 12, color: "#6b7280" }}>{t.description || "—"}</span></TD>
                                    <TD>
                                        {t.cavities && (
                                            <span style={{ fontSize: 11.5, fontWeight: 600, background: "#eef2ff", color: "#4338ca", padding: "2px 8px", borderRadius: 5, border: "1px solid #c7d2fe" }}>
                                                {t.cavities}
                                            </span>
                                        )}
                                    </TD>
                                    <TD>
                                        <StatusToggle
                                            status={t.status}
                                            onToggle={() => saveRecord({ ...t, status: t.status === 'Active' ? 'Inactive' : 'Active' }, true)}
                                        />
                                    </TD>
                                    <TD right>
                                        <ActBtns onEdit={() => setModal({ mode: "edit", form: JSON.parse(JSON.stringify(t)) })} />
                                    </TD>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {modal && (
                <Modal
                    title={modal?.mode === "add" ? "Add Mould Type" : "Edit Mould Type"}
                    onClose={() => setModal(null)}
                    footer={
                        <>
                            <button onClick={() => setModal(null)} style={outlineBtn}>Cancel</button>
                            <button
                                onClick={() => {
                                    if (!modal?.form?.code || !modal?.form?.name) return toast("Code and Name required", "error");
                                    save(modal.form);
                                }}
                                style={primaryBtn("#059669")}
                            >
                                {modal?.mode === "add" ? "Save" : "Update"}
                            </button>
                        </>
                    }
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <FRow2>
                            <FL label="Code" req>
                                <FI
                                    disabled={modal?.mode === 'edit'}
                                    value={modal?.form?.code || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), code: e.target.value } }))}
                                />
                            </FL>
                            <FL label="Type Name" req>
                                <FI
                                    value={modal?.form?.name || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), name: e.target.value } }))}
                                />
                            </FL>
                        </FRow2>
                        <FL label="Description">
                            <FI
                                value={modal?.form?.description || ""}
                                onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), description: e.target.value } }))}
                            />
                        </FL>
                        <FRow2>
                            <FL label="Cavities">
                                <FS
                                    value={modal?.form?.cavities || "Single"}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), cavities: e.target.value } }))}
                                >
                                    <option>Single</option>
                                    <option>Multi-cavity</option>
                                    <option>Family</option>
                                    <option>Stack</option>
                                </FS>
                            </FL>
                            <FL label="Material">
                                <FI
                                    value={modal?.form?.material || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), material: e.target.value } }))}
                                />
                            </FL>
                        </FRow2>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
                            <div
                                onClick={() => setModal(m => ({ ...m, form: { ...(m?.form || {}), status: m?.form?.status === 'Active' ? 'Inactive' : 'Active' } }))}
                                style={{
                                    width: 38,
                                    height: 22,
                                    borderRadius: 11,
                                    background: modal?.form?.status === 'Active' ? "#059669" : "#e5e7eb",
                                    position: "relative",
                                    cursor: "pointer",
                                    transition: "background .2s"
                                }}
                            >
                                <div
                                    style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        background: "#fff",
                                        position: "absolute",
                                        top: 3,
                                        left: modal?.form?.status === 'Active' ? 19 : 3,
                                        transition: "left .2s"
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                                {modal?.form?.status === 'Active' ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ─── TRANSFER REASON MASTER ──────────────────────────────
function TransferReasonMaster({ toast }) {
    const { data: reasons, saveRecord } = useMasterData('transfer_reasons', toast);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(null);

    const BLANK = { code: "", name: "", description: "", status: "Active" };
    
    const filtered = reasons.filter(r =>
        [r.code, r.name, r.description].some(f => (f || "").toLowerCase().includes(search.toLowerCase()))
    );
    
    const save = async (form) => {
        if (await saveRecord(form, modal?.mode === "edit")) setModal(null);
    };

    return (
        <div>
            <Toolbar
                onSearch={setSearch}
                onAdd={() => setModal({ mode: "add", form: { ...BLANK } })}
                addLabel="Add Reason"
                accentColor="#d97706"
                count={filtered.length}
            />
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <TH>Code</TH>
                            <TH>Reason Name</TH>
                            <TH>Description</TH>
                            <TH>Status</TH>
                            <TH right>Actions</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <EmptyState msg="No transfer reasons found" />
                        ) : (
                            filtered.map(r => (
                                <tr key={r.id}>
                                    <TD>
                                        <span style={{ fontSize: 11, fontWeight: 700, background: "#fffbeb", color: "#b45309", padding: "2px 8px", borderRadius: 5 }}>
                                            {r.code}
                                        </span>
                                    </TD>
                                    <TD bold>{r.name}</TD>
                                    <TD><span style={{ fontSize: 12, color: "#6b7280" }}>{r.description || "—"}</span></TD>
                                    <TD>
                                        <StatusToggle
                                            status={r.status}
                                            onToggle={() => saveRecord({ ...r, status: r.status === 'Active' ? 'Inactive' : 'Active' }, true)}
                                        />
                                    </TD>
                                    <TD right>
                                        <ActBtns onEdit={() => setModal({ mode: "edit", form: JSON.parse(JSON.stringify(r)) })} />
                                    </TD>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {modal && (
                <Modal
                    title={modal?.mode === "add" ? "Add Reason" : "Edit Reason"}
                    onClose={() => setModal(null)}
                    footer={
                        <>
                            <button onClick={() => setModal(null)} style={outlineBtn}>Cancel</button>
                            <button
                                onClick={() => {
                                    if (!modal?.form?.code || !modal?.form?.name) return toast("Code and Name required", "error");
                                    save(modal.form);
                                }}
                                style={primaryBtn("#d97706")}
                            >
                                {modal?.mode === "add" ? "Save" : "Update"}
                            </button>
                        </>
                    }
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <FRow2>
                            <FL label="Code" req>
                                <FI
                                    disabled={modal?.mode === 'edit'}
                                    value={modal?.form?.code || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), code: e.target.value } }))}
                                />
                            </FL>
                            <FL label="Name" req>
                                <FI
                                    value={modal?.form?.name || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), name: e.target.value } }))}
                                />
                            </FL>
                        </FRow2>
                        <FL label="Description">
                            <FI
                                value={modal?.form?.description || ""}
                                onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), description: e.target.value } }))}
                            />
                        </FL>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
                            <div
                                onClick={() => setModal(m => ({ ...m, form: { ...(m?.form || {}), status: m?.form?.status === 'Active' ? 'Inactive' : 'Active' } }))}
                                style={{
                                    width: 38,
                                    height: 22,
                                    borderRadius: 11,
                                    background: modal?.form?.status === 'Active' ? "#059669" : "#e5e7eb",
                                    position: "relative",
                                    cursor: "pointer",
                                    transition: "background .2s"
                                }}
                            >
                                <div
                                    style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        background: "#fff",
                                        position: "absolute",
                                        top: 3,
                                        left: modal?.form?.status === 'Active' ? 19 : 3,
                                        transition: "left .2s"
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                                {modal?.form?.status === 'Active' ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ─── DEPRECIATION METHOD MASTER ──────────────────────────
function DepreciationMaster({ toast }) {
    const { data: methods, saveRecord } = useMasterData('depreciation_methods', toast);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(null);

    const BLANK = { code: "", name: "", abbr: "", description: "", rate: "", status: "Active" };
    
    const filtered = methods.filter(m =>
        [m.code, m.name, m.abbr, m.description].some(f => (f || "").toLowerCase().includes(search.toLowerCase()))
    );
    
    const save = async (form) => {
        if (await saveRecord(form, modal?.mode === "edit")) setModal(null);
    };

    return (
        <div>
            <Toolbar
                onSearch={setSearch}
                onAdd={() => setModal({ mode: "add", form: { ...BLANK } })}
                addLabel="Add Method"
                accentColor="#dc2626"
                count={filtered.length}
            />
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <TH>Code</TH>
                            <TH>Method Name</TH>
                            <TH>Abbreviation</TH>
                            <TH>Description</TH>
                            <TH>Rate</TH>
                            <TH>Status</TH>
                            <TH right>Actions</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <EmptyState msg="No methods found" />
                        ) : (
                            filtered.map(m => (
                                <tr key={m.id}>
                                    <TD>
                                        <span style={{ fontSize: 11, fontWeight: 700, background: "#fef2f2", color: "#b91c1c", padding: "2px 8px", borderRadius: 5 }}>
                                            {m.code}
                                        </span>
                                    </TD>
                                    <TD bold>{m.name}</TD>
                                    <TD>
                                        {m.abbr && (
                                            <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, background: "#f3f4f6", color: "#374151", padding: "2px 8px", borderRadius: 5 }}>
                                                {m.abbr}
                                            </span>
                                        )}
                                    </TD>
                                    <TD><span style={{ fontSize: 12, color: "#6b7280" }}>{m.description || "—"}</span></TD>
                                    <TD><span style={{ fontSize: 12, fontWeight: 700, color: "#dc2626" }}>{m.rate || "—"}</span></TD>
                                    <TD>
                                        <StatusToggle
                                            status={m.status}
                                            onToggle={() => saveRecord({ ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' }, true)}
                                        />
                                    </TD>
                                    <TD right>
                                        <ActBtns onEdit={() => setModal({ mode: "edit", form: JSON.parse(JSON.stringify(m)) })} />
                                    </TD>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {modal && (
                <Modal
                    title={modal?.mode === "add" ? "Add Method" : "Edit Method"}
                    onClose={() => setModal(null)}
                    footer={
                        <>
                            <button onClick={() => setModal(null)} style={outlineBtn}>Cancel</button>
                            <button
                                onClick={() => {
                                    if (!modal?.form?.code || !modal?.form?.name) return toast("Code and Name required", "error");
                                    save(modal.form);
                                }}
                                style={primaryBtn("#dc2626")}
                            >
                                {modal?.mode === "add" ? "Save" : "Update"}
                            </button>
                        </>
                    }
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <FRow3>
                            <FL label="Code" req>
                                <FI
                                    disabled={modal?.mode === 'edit'}
                                    value={modal?.form?.code || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), code: e.target.value } }))}
                                />
                            </FL>
                            <FL label="Name" req>
                                <FI
                                    value={modal?.form?.name || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), name: e.target.value } }))}
                                />
                            </FL>
                            <FL label="Abbr.">
                                <FI
                                    value={modal?.form?.abbr || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), abbr: e.target.value } }))}
                                />
                            </FL>
                        </FRow3>
                        <FL label="Description">
                            <FI
                                value={modal?.form?.description || ""}
                                onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), description: e.target.value } }))}
                            />
                        </FL>
                        <FL label="Rate / Basis">
                            <FI
                                value={modal?.form?.rate || ""}
                                onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), rate: e.target.value } }))}
                            />
                        </FL>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
                            <div
                                onClick={() => setModal(m => ({ ...m, form: { ...(m?.form || {}), status: m?.form?.status === 'Active' ? 'Inactive' : 'Active' } }))}
                                style={{
                                    width: 38,
                                    height: 22,
                                    borderRadius: 11,
                                    background: modal?.form?.status === 'Active' ? "#059669" : "#e5e7eb",
                                    position: "relative",
                                    cursor: "pointer",
                                    transition: "background .2s"
                                }}
                            >
                                <div
                                    style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        background: "#fff",
                                        position: "absolute",
                                        top: 3,
                                        left: modal?.form?.status === 'Active' ? 19 : 3,
                                        transition: "left .2s"
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                                {modal?.form?.status === 'Active' ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ─── PLANT MASTER ────────────────────────────────────────
function PlantMaster({ toast, currentUser }) {
    const { data: plants, saveRecord } = useMasterData('plants', toast);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(null);

    const BLANK = { code: "", name: "", location: "", contact: "", email: "", phone: "", status: "Active" };
    
    const filtered = plants.filter(p =>
        [p.code, p.name, p.location, p.contact, p.email].some(f => (f || "").toLowerCase().includes(search.toLowerCase()))
    );
    
    const save = async (form) => {
        if (await saveRecord({ ...form, createdBy: currentUser.name }, modal?.mode === "edit")) setModal(null);
    };

    return (
        <div>
            <Toolbar
                onSearch={setSearch}
                onAdd={() => setModal({ mode: "add", form: { ...BLANK } })}
                addLabel="Add Plant"
                accentColor="#0284c7"
                count={filtered.length}
            />
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <TH>Code</TH>
                            <TH>Plant Name</TH>
                            <TH>Location</TH>
                            <TH>Contact</TH>
                            <TH>Email</TH>
                            <TH>Status</TH>
                            <TH right>Actions</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <EmptyState msg="No plants found" />
                        ) : (
                            filtered.map(p => (
                                <tr key={p.id}>
                                    <TD>
                                        <span style={{ fontSize: 11, fontWeight: 700, background: "#f0f9ff", color: "#0369a1", padding: "2px 8px", borderRadius: 5 }}>
                                            {p.code}
                                        </span>
                                    </TD>
                                    <TD>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: "50%",
                                                    background: avatarColor(p.name),
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    color: "#fff",
                                                    flexShrink: 0
                                                }}
                                            >
                                                {initials(p.name)}
                                            </div>
                                            <span style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{p.name}</span>
                                        </div>
                                    </TD>
                                    <TD>{p.location || "—"}</TD>
                                    <TD>{p.contact || "—"}</TD>
                                    <TD><span style={{ fontSize: 12, color: "#4f46e5" }}>{p.email || "—"}</span></TD>
                                    <TD>
                                        <StatusToggle
                                            status={p.status}
                                            onToggle={() => saveRecord({ ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' }, true)}
                                        />
                                    </TD>
                                    <TD right>
                                        <ActBtns onEdit={() => setModal({ mode: "edit", form: JSON.parse(JSON.stringify(p)) })} />
                                    </TD>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {modal && (
                <Modal
                    title={modal?.mode === "add" ? "Add Plant" : "Edit Plant"}
                    onClose={() => setModal(null)}
                    footer={
                        <>
                            <button onClick={() => setModal(null)} style={outlineBtn}>Cancel</button>
                            <button
                                onClick={() => {
                                    if (!modal?.form?.code || !modal?.form?.name) return toast("Code and Name required", "error");
                                    save(modal.form);
                                }}
                                style={primaryBtn("#0284c7")}
                            >
                                {modal?.mode === "add" ? "Save" : "Update"}
                            </button>
                        </>
                    }
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <FRow2>
                            <FL label="Plant Code" req>
                                <FI
                                    disabled={modal?.mode === 'edit'}
                                    value={modal?.form?.code || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), code: e.target.value } }))}
                                />
                            </FL>
                            <FL label="Plant Name" req>
                                <FI
                                    value={modal?.form?.name || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), name: e.target.value } }))}
                                />
                            </FL>
                        </FRow2>
                        <FL label="Location">
                            <FI
                                value={modal?.form?.location || ""}
                                onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), location: e.target.value } }))}
                            />
                        </FL>
                        <FL label="Contact Person">
                            <FI
                                value={modal?.form?.contact || ""}
                                onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), contact: e.target.value } }))}
                            />
                        </FL>
                        <FRow2>
                            <FL label="Email">
                                <FI
                                    type="email"
                                    value={modal?.form?.email || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), email: e.target.value } }))}
                                />
                            </FL>
                            <FL label="Phone">
                                <FI
                                    value={modal?.form?.phone || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), phone: e.target.value } }))}
                                />
                            </FL>
                        </FRow2>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
                            <div
                                onClick={() => setModal(m => ({ ...m, form: { ...(m?.form || {}), status: m?.form?.status === 'Active' ? 'Inactive' : 'Active' } }))}
                                style={{
                                    width: 38,
                                    height: 22,
                                    borderRadius: 11,
                                    background: modal?.form?.status === 'Active' ? "#059669" : "#e5e7eb",
                                    position: "relative",
                                    cursor: "pointer",
                                    transition: "background .2s"
                                }}
                            >
                                <div
                                    style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        background: "#fff",
                                        position: "absolute",
                                        top: 3,
                                        left: modal?.form?.status === 'Active' ? 19 : 3,
                                        transition: "left .2s"
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                                {modal?.form?.status === 'Active' ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ─── DEPARTMENT MASTER ───────────────────────────────────
function DepartmentMaster({ toast, currentUser }) {
    const { data: depts, saveRecord } = useMasterData('departments', toast);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(null);

    const BLANK = { code: "", name: "", status: "Active" };
    
    const filtered = depts.filter(d =>
        [d.code, d.name].some(f => (f || "").toLowerCase().includes(search.toLowerCase()))
    );
    
    const save = async (form) => {
        if (await saveRecord({ ...form, createdBy: currentUser.name }, modal?.mode === "edit")) setModal(null);
    };

    return (
        <div>
            <Toolbar
                onSearch={setSearch}
                onAdd={() => setModal({ mode: "add", form: { ...BLANK } })}
                addLabel="Add Department"
                accentColor="#9333ea"
                count={filtered.length}
            />
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <TH>Code</TH>
                            <TH>Department Name</TH>
                            <TH>Status</TH>
                            <TH right>Actions</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <EmptyState msg="No departments found" />
                        ) : (
                            filtered.map(d => (
                                <tr key={d.id}>
                                    <TD>
                                        <span style={{ fontSize: 11, fontWeight: 700, background: "#faf5ff", color: "#7e22ce", padding: "2px 8px", borderRadius: 5 }}>
                                            {d.code}
                                        </span>
                                    </TD>
                                    <TD>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: "50%",
                                                    background: avatarColor(d.name),
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    color: "#fff",
                                                    flexShrink: 0
                                                }}
                                            >
                                                {initials(d.name)}
                                            </div>
                                            <span style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{d.name}</span>
                                        </div>
                                    </TD>
                                    <TD>
                                        <StatusToggle
                                            status={d.status}
                                            onToggle={() => saveRecord({ ...d, status: d.status === 'Active' ? 'Inactive' : 'Active' }, true)}
                                        />
                                    </TD>
                                    <TD right>
                                        <ActBtns onEdit={() => setModal({ mode: "edit", form: JSON.parse(JSON.stringify(d)) })} />
                                    </TD>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {modal && (
                <Modal
                    title={modal?.mode === "add" ? "Add Department" : "Edit Department"}
                    onClose={() => setModal(null)}
                    footer={
                        <>
                            <button onClick={() => setModal(null)} style={outlineBtn}>Cancel</button>
                            <button
                                onClick={() => {
                                    if (!modal?.form?.code || !modal?.form?.name) return toast("Code and Name required", "error");
                                    save(modal.form);
                                }}
                                style={primaryBtn("#9333ea")}
                            >
                                {modal?.mode === "add" ? "Save" : "Update"}
                            </button>
                        </>
                    }
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <FRow2>
                            <FL label="Department Code" req>
                                <FI
                                    disabled={modal?.mode === 'edit'}
                                    value={modal?.form?.code || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), code: e.target.value } }))}
                                />
                            </FL>
                            <FL label="Department Name" req>
                                <FI
                                    value={modal?.form?.name || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), name: e.target.value } }))}
                                />
                            </FL>
                        </FRow2>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
                            <div
                                onClick={() => setModal(m => ({ ...m, form: { ...(m?.form || {}), status: m?.form?.status === 'Active' ? 'Inactive' : 'Active' } }))}
                                style={{
                                    width: 38,
                                    height: 22,
                                    borderRadius: 11,
                                    background: modal?.form?.status === 'Active' ? "#059669" : "#e5e7eb",
                                    position: "relative",
                                    cursor: "pointer",
                                    transition: "background .2s"
                                }}
                            >
                                <div
                                    style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        background: "#fff",
                                        position: "absolute",
                                        top: 3,
                                        left: modal?.form?.status === 'Active' ? 19 : 3,
                                        transition: "left .2s"
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                                {modal?.form?.status === 'Active' ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ─── COST CENTER MASTER ───────────────────────────────────
function CostCenterMaster({ toast, currentUser }) {
    const { data: costCenters, saveRecord } = useMasterData('cost_centers', toast);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(null);

    const BLANK = { code: "", name: "", status: "Active" };
    
    const filtered = costCenters.filter(c =>
        [c.code, c.name].some(f => (f || "").toLowerCase().includes(search.toLowerCase()))
    );
    
    const save = async (form) => {
        if (await saveRecord({ ...form, createdBy: currentUser.name }, modal?.mode === "edit")) setModal(null);
    };

    return (
        <div>
            <Toolbar
                onSearch={setSearch}
                onAdd={() => setModal({ mode: "add", form: { ...BLANK } })}
                addLabel="Add Cost Centre"
                accentColor="#ea580c"
                count={filtered.length}
            />
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <TH>Cost Centre Code</TH>
                            <TH>Cost Centre Name</TH>
                            <TH>Status</TH>
                            <TH right>Actions</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <EmptyState msg="No cost centres found" />
                        ) : (
                            filtered.map(c => (
                                <tr key={c.id}>
                                    <TD>
                                        <span style={{ fontSize: 11, fontWeight: 700, background: "#ffedd5", color: "#c2410c", padding: "2px 8px", borderRadius: 5 }}>
                                            {c.code}
                                        </span>
                                    </TD>
                                    <TD>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: "50%",
                                                    background: avatarColor(c.name),
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    color: "#fff",
                                                    flexShrink: 0
                                                }}
                                            >
                                                {initials(c.name)}
                                            </div>
                                            <span style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{c.name}</span>
                                        </div>
                                    </TD>
                                    <TD>
                                        <StatusToggle
                                            status={c.status}
                                            onToggle={() => saveRecord({ ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' }, true)}
                                        />
                                    </TD>
                                    <TD right>
                                        <ActBtns onEdit={() => setModal({ mode: "edit", form: JSON.parse(JSON.stringify(c)) })} />
                                    </TD>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {modal && (
                <Modal
                    title={modal?.mode === "add" ? "Add Cost Centre" : "Edit Cost Centre"}
                    onClose={() => setModal(null)}
                    footer={
                        <>
                            <button onClick={() => setModal(null)} style={outlineBtn}>Cancel</button>
                            <button
                                onClick={() => {
                                    if (!modal?.form?.code || !modal?.form?.name) return toast("Code and Name required", "error");
                                    save(modal.form);
                                }}
                                style={primaryBtn("#ea580c")}
                            >
                                {modal?.mode === "add" ? "Save" : "Update"}
                            </button>
                        </>
                    }
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <FRow2>
                            <FL label="Cost Centre Code" req>
                                <FI
                                    disabled={modal?.mode === 'edit'}
                                    value={modal?.form?.code || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), code: e.target.value } }))}
                                />
                            </FL>
                            <FL label="Cost Centre Name" req>
                                <FI
                                    value={modal?.form?.name || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), name: e.target.value } }))}
                                />
                            </FL>
                        </FRow2>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
                            <div
                                onClick={() => setModal(m => ({ ...m, form: { ...(m?.form || {}), status: m?.form?.status === 'Active' ? 'Inactive' : 'Active' } }))}
                                style={{
                                    width: 38,
                                    height: 22,
                                    borderRadius: 11,
                                    background: modal?.form?.status === 'Active' ? "#059669" : "#e5e7eb",
                                    position: "relative",
                                    cursor: "pointer",
                                    transition: "background .2s"
                                }}
                            >
                                <div
                                    style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        background: "#fff",
                                        position: "absolute",
                                        top: 3,
                                        left: modal?.form?.status === 'Active' ? 19 : 3,
                                        transition: "left .2s"
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                                {modal?.form?.status === 'Active' ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ─── TECHNICIAN MASTER ───────────────────────────────────
function TechnicianMaster({ toast, currentUser }) {
    const { data: techs, saveRecord } = useMasterData('technicians', toast);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(null);

    const BLANK = { code: "", name: "", speciality: "", shift: "Day", status: "Active" };
    
    const filtered = techs.filter(t =>
        [t.code, t.name, t.speciality, t.shift].some(f => (f || "").toLowerCase().includes(search.toLowerCase()))
    );

    const save = async (form) => {
        if (await saveRecord(form, modal?.mode === "edit")) setModal(null);
    };

    return (
        <div>
            <Toolbar
                onSearch={setSearch}
                onAdd={() => setModal({ mode: "add", form: { ...BLANK } })}
                addLabel="Add Technician"
                accentColor="#10b981"
                count={filtered.length}
            />
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <TH>Code</TH>
                            <TH>Technician Name</TH>
                            <TH>Speciality</TH>
                            <TH>Shift</TH>
                            <TH>Status</TH>
                            <TH right>Actions</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <EmptyState msg="No technicians found" />
                        ) : (
                            filtered.map(t => (
                                <tr key={t.id}>
                                    <TD>
                                        <span style={{ fontSize: 11, fontWeight: 700, background: "#dcfce7", color: "#047857", padding: "2px 8px", borderRadius: 5 }}>
                                            {t.code}
                                        </span>
                                    </TD>
                                    <TD>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: "50%",
                                                    background: avatarColor(t.name),
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    color: "#fff",
                                                    flexShrink: 0
                                                }}
                                            >
                                                {initials(t.name)}
                                            </div>
                                            <span style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{t.name}</span>
                                        </div>
                                    </TD>
                                    <TD>{t.speciality || "—"}</TD>
                                    <TD>{t.shift || "—"}</TD>
                                    <TD>
                                        <StatusToggle
                                            status={t.status}
                                            onToggle={() => saveRecord({ ...t, status: t.status === 'Active' ? 'Inactive' : 'Active' }, true)}
                                        />
                                    </TD>
                                    <TD right>
                                        <ActBtns onEdit={() => setModal({ mode: "edit", form: JSON.parse(JSON.stringify(t)) })} />
                                    </TD>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {modal && (
                <Modal
                    title={modal?.mode === "add" ? "Add Technician" : "Edit Technician"}
                    onClose={() => setModal(null)}
                    footer={
                        <>
                            <button onClick={() => setModal(null)} style={outlineBtn}>Cancel</button>
                            <button
                                onClick={() => {
                                    if (!modal?.form?.code || !modal?.form?.name) return toast("Code and Name required", "error");
                                    save(modal.form);
                                }}
                                style={primaryBtn("#10b981")}
                            >
                                {modal?.mode === "add" ? "Save" : "Update"}
                            </button>
                        </>
                    }
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <FRow2>
                            <FL label="Code" req>
                                <FI
                                    disabled={modal?.mode === 'edit'}
                                    value={modal?.form?.code || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), code: e.target.value } }))}
                                />
                            </FL>
                            <FL label="Name" req>
                                <FI
                                    value={modal?.form?.name || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), name: e.target.value } }))}
                                />
                            </FL>
                        </FRow2>
                        <FRow2>
                            <FL label="Speciality">
                                <FI
                                    value={modal?.form?.speciality || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), speciality: e.target.value } }))}
                                />
                            </FL>
                            <FL label="Shift">
                                <FS
                                    value={modal?.form?.shift || "Day"}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), shift: e.target.value } }))}
                                >
                                    <option>Day</option>
                                    <option>Night</option>
                                    <option>General</option>
                                </FS>
                            </FL>
                        </FRow2>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
                            <div
                                onClick={() => setModal(m => ({ ...m, form: { ...(m?.form || {}), status: m?.form?.status === 'Active' ? 'Inactive' : 'Active' } }))}
                                style={{
                                    width: 38,
                                    height: 22,
                                    borderRadius: 11,
                                    background: modal?.form?.status === 'Active' ? "#059669" : "#e5e7eb",
                                    position: "relative",
                                    cursor: "pointer",
                                    transition: "background .2s"
                                }}
                            >
                                <div
                                    style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        background: "#fff",
                                        position: "absolute",
                                        top: 3,
                                        left: modal?.form?.status === 'Active' ? 19 : 3,
                                        transition: "left .2s"
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                                {modal?.form?.status === 'Active' ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ─── MAINT VENDOR MASTER ───────────────────────────────────
function MaintVendorMaster({ toast, currentUser }) {
    const { data: vendors, saveRecord } = useMasterData('maint_vendors', toast);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(null);

    const BLANK = { code: "", name: "", city: "", status: "Active" };
    
    const filtered = vendors.filter(v =>
        [v.code, v.name, v.city].some(f => (f || "").toLowerCase().includes(search.toLowerCase()))
    );

    const save = async (form) => {
        if (await saveRecord(form, modal?.mode === "edit")) setModal(null);
    };

    return (
        <div>
            <Toolbar
                onSearch={setSearch}
                onAdd={() => setModal({ mode: "add", form: { ...BLANK } })}
                addLabel="Add Maint. Vendor"
                accentColor="#f59e0b"
                count={filtered.length}
            />
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <TH>Code</TH>
                            <TH>Vendor Name</TH>
                            <TH>City</TH>
                            <TH>Status</TH>
                            <TH right>Actions</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <EmptyState msg="No maintenance vendors found" />
                        ) : (
                            filtered.map(v => (
                                <tr key={v.id}>
                                    <TD>
                                        <span style={{ fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: 5 }}>
                                            {v.code}
                                        </span>
                                    </TD>
                                    <TD>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: "50%",
                                                    background: avatarColor(v.name),
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    color: "#fff",
                                                    flexShrink: 0
                                                }}
                                            >
                                                {initials(v.name)}
                                            </div>
                                            <span style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{v.name}</span>
                                        </div>
                                    </TD>
                                    <TD>{v.city || "—"}</TD>
                                    <TD>
                                        <StatusToggle
                                            status={v.status}
                                            onToggle={() => saveRecord({ ...v, status: v.status === 'Active' ? 'Inactive' : 'Active' }, true)}
                                        />
                                    </TD>
                                    <TD right>
                                        <ActBtns onEdit={() => setModal({ mode: "edit", form: JSON.parse(JSON.stringify(v)) })} />
                                    </TD>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {modal && (
                <Modal
                    title={modal?.mode === "add" ? "Add Maint. Vendor" : "Edit Maint. Vendor"}
                    onClose={() => setModal(null)}
                    footer={
                        <>
                            <button onClick={() => setModal(null)} style={outlineBtn}>Cancel</button>
                            <button
                                onClick={() => {
                                    if (!modal?.form?.code || !modal?.form?.name) return toast("Code and Name required", "error");
                                    save(modal.form);
                                }}
                                style={primaryBtn("#f59e0b")}
                            >
                                {modal?.mode === "add" ? "Save" : "Update"}
                            </button>
                        </>
                    }
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <FRow2>
                            <FL label="Code" req>
                                <FI
                                    disabled={modal?.mode === 'edit'}
                                    value={modal?.form?.code || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), code: e.target.value } }))}
                                />
                            </FL>
                            <FL label="Name" req>
                                <FI
                                    value={modal?.form?.name || ""}
                                    onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), name: e.target.value } }))}
                                />
                            </FL>
                        </FRow2>
                        <FL label="City">
                            <FI
                                value={modal?.form?.city || ""}
                                onChange={e => setModal(m => ({ ...m, form: { ...(m?.form || {}), city: e.target.value } }))}
                            />
                        </FL>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
                            <div
                                onClick={() => setModal(m => ({ ...m, form: { ...(m?.form || {}), status: m?.form?.status === 'Active' ? 'Inactive' : 'Active' } }))}
                                style={{
                                    width: 38,
                                    height: 22,
                                    borderRadius: 11,
                                    background: modal?.form?.status === 'Active' ? "#059669" : "#e5e7eb",
                                    position: "relative",
                                    cursor: "pointer",
                                    transition: "background .2s"
                                }}
                            >
                                <div
                                    style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        background: "#fff",
                                        position: "absolute",
                                        top: 3,
                                        left: modal?.form?.status === 'Active' ? 19 : 3,
                                        transition: "left .2s"
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                                {modal?.form?.status === 'Active' ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ─── BUTTON STYLES ───────────────────────────────────────
const outlineBtn = {
    height: 38,
    padding: "0 18px",
    borderRadius: 9,
    border: "1.5px solid #e5e7eb",
    background: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    color: "#374151"
};

function primaryBtn(color) {
    return {
        height: 38,
        padding: "0 18px",
        borderRadius: 9,
        border: "none",
        background: `linear-gradient(135deg,${color},${color}bb)`,
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: `0 4px 12px ${color}44`
    };
}

// ─── ROOT COMPONENT ──────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f0f2f5; min-height: 100vh; color: #111827; }
@keyframes modalIn { from { opacity: 0; transform: scale(.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes toastIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

.shell { display: flex; height: 100vh; overflow: hidden; }
.sidebar { width: 220px; flex-shrink: 0; background: linear-gradient(170deg, #3b3fe8 0%, #5b2be0 45%, #7c2fe8 100%); display: flex; flex-direction: column; position: relative; overflow: hidden; }
.sidebar::after { content: ''; position: absolute; bottom: -60px; left: -60px; width: 240px; height: 240px; border-radius: 50%; background: rgba(255,255,255,.05); pointer-events: none; }
.sb-brand { padding: 20px 16px 14px; border-bottom: 1px solid rgba(255,255,255,.1); z-index: 1; position: relative; }
.sb-brand-row { display: flex; items-align: center; gap: 10px; }
.sb-icon { width: 36px; height: 36px; background: rgba(255,255,255,.18); border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sb-name { font-size: 14px; font-weight: 700; color: #fff; }
.sb-name span { font-weight: 400; opacity: .8; }
.sb-sub { font-size: 10px; color: rgba(255,255,255,.5); margin-top: 1px; }
.sb-nav { flex: 1; padding: 12px 10px; display: flex; flex-direction: column; gap: 3px; overflow-y: auto; z-index: 1; position: relative; }
.sb-sec { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.3); padding: 8px 10px 4px; }
.sb-item { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 8px; cursor: pointer; color: rgba(255,255,255,.6); font-size: 12.5px; font-weight: 500; transition: background .15s; }
.sb-item:hover { background: rgba(255,255,255,.1); color: #fff; }
.sb-item.active { background: rgba(255,255,255,.18); color: #fff; font-weight: 700; }
.sb-footer { padding: 14px 12px; border-top: 1px solid rgba(255,255,255,.1); z-index: 1; position: relative; }

.main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.topbar { height: 56px; background: #fff; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; flex-shrink: 0; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
.content { flex: 1; overflow-y: auto; padding: 20px 24px 28px; }

.toast { position: fixed; bottom: 24px; right: 24px; background: #111827; color: #fff; padding: 13px 20px; border-radius: 12px; font-size: 13.5px; font-weight: 500; z-index: 2000; box-shadow: 0 8px 30px rgba(0,0,0,.25); animation: toastIn .3s ease; display: flex; align-items: center; }
.tok { border-left: 4px solid #10b981; }
.terr { border-left: 4px solid #ef4444; }

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

export default function MastersPage() {
    const [roles, setRoles] = useState([]);
    const [activeTab, setActiveTab] = useState("vendor");
    const [toastMsg, setToastMsg] = useState(null);
    const [toastType, setToastType] = useState("success");
    const [user, setUser] = useState({ name: "User", role: "Viewer" });
    const router = useRouter();

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) {
            router.push("/login");
            return;
        }
        setUser(JSON.parse(stored));

        fetch('/api/roles')
            .then(res => res.json())
            .then(data => setRoles(data))
            .catch(console.error);
    }, [router]);

    const activeRole = roles.find(r => r.name === user.role);
    const privs = activeRole ? activeRole.privs : null;

    const availableTabs = TABS.filter(t => {
        if (user.role === "Admin") return true;
        if (t.key === 'costCenter') return privs?.masters?.costCenter === true;
        if (!privs || !privs.masters) return false;
        return privs.masters[t.key];
    });

    useEffect(() => {
        if (availableTabs.length > 0 && !availableTabs.find(t => t.key === activeTab)) {
            setActiveTab(availableTabs[0].key);
        }
    }, [availableTabs, activeTab]);

    const initialsName = initials(user.name);

    const showToast = (msg, type = "success") => {
        setToastMsg(msg);
        setToastType(type);
        setTimeout(() => setToastMsg(null), 3200);
    };

    const activeTabDef = TABS.find(t => t.key === activeTab);

    if (!privs && user.role !== "Admin") {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Loading configurations...
            </div>
        );
    }

    if (availableTabs.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
                <h2>Access Denied</h2>
                <p>You do not have permission to view the Masters module.</p>
                <button onClick={() => router.push('/dashboard')} style={outlineBtn}>
                    Return to Dashboard
                </button>
            </div>
        );
    }

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            localStorage.removeItem("user");
            router.push("/login");
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <>
            <style>{CSS}</style>
            <div className="shell">
                <div className="sidebar">
                    <div className="sb-brand">
                        <div className="sb-brand-row">
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
                            <div
                                key={n.label}
                                className={`sb-item${n.active ? " active" : ""}`}
                                onClick={() => router.push(n.route)}
                            >
                                <span>{n.icon}</span>{n.label}
                            </div>
                        ))}
                    </div>
                    <div className="sb-footer">
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    background: "rgba(255,255,255,.2)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: "#fff",
                                    flexShrink: 0
                                }}
                            >
                                {initialsName}
                            </div>
                            <div>
                                <div style={{ fontSize: 11.5, fontWeight: 600, color: "#fff" }}>{user.name}</div>
                                <div style={{ fontSize: 10, color: "rgba(255,255,255,.45)" }}>{user.role}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="main">
                    <div className="topbar">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ fontSize: 12, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
                                <span>Administration</span>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M4 2l4 4-4 4" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", letterSpacing: "-.02em" }}>
                                Masters
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 8,
                                    border: "1.5px solid #e5e7eb",
                                    background: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    color: "#6b7280",
                                    position: "relative"
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M7 2a4 4 0 00-4 4v2l-1 2h10l-1-2V6a4 4 0 00-4-4zM5.5 12a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                </svg>
                                <div style={{ width: 6, height: 6, background: "#ef4444", borderRadius: "50%", position: "absolute", top: 7, right: 7, border: "1.5px solid #fff" }} />
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 7,
                                    background: "#f9fafb",
                                    border: "1.5px solid #e5e7eb",
                                    borderRadius: 9,
                                    padding: "4px 10px 4px 5px"
                                }}
                            >
                                <div
                                    style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: "50%",
                                        background: "#4f46e5",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 9,
                                        fontWeight: 700,
                                        color: "#fff"
                                    }}
                                >
                                    {initialsName}
                                </div>
                                <span style={{ fontSize: 11.5, fontWeight: 600, color: "#374151" }}>{user.name}</span>
                            </div>
                            <button className="logout-btn" onClick={handleLogout}>Logout ➔</button>
                        </div>
                    </div>

                    <div className="content">
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 20, fontWeight: 800, color: "#111827", letterSpacing: "-.025em" }}>
                                Master Configuration
                            </div>
                            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>
                                Manage all reference data used across the mould tracking system
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: 6,
                                marginBottom: 20,
                                background: "#fff",
                                padding: 6,
                                borderRadius: 14,
                                border: "1px solid #e5e7eb",
                                boxShadow: "0 1px 4px rgba(0,0,0,.04)",
                                flexWrap: "wrap"
                            }}
                        >
                            {availableTabs.map(tab => {
                                const isActive = activeTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 7,
                                            height: 38,
                                            padding: "0 16px",
                                            borderRadius: 9,
                                            border: `1.5px solid ${isActive ? tab.border : "transparent"}`,
                                            background: isActive ? tab.bg : "transparent",
                                            color: isActive ? tab.color : "#6b7280",
                                            fontSize: 13,
                                            fontWeight: isActive ? 700 : 500,
                                            cursor: "pointer",
                                            transition: "all .15s",
                                            fontFamily: "'Plus Jakarta Sans',sans-serif"
                                        }}
                                    >
                                        <span style={{ fontSize: 15 }}>{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {activeTabDef && (
                            <div style={{ background: "transparent", animation: "fadeUp .3s ease both" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 10,
                                            background: activeTabDef.bg,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 18,
                                            border: `1.5px solid ${activeTabDef.border}`
                                        }}
                                    >
                                        {activeTabDef.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>
                                            {activeTabDef.label}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>
                                            {activeTab === "vendor" && "Manage jobwork vendors — companies that perform production on behalf"}
                                            {activeTab === "mfg" && "Manage mould manufacturers — suppliers who fabricate moulds"}
                                            {activeTab === "type" && "Define types and categories of moulds in the system"}
                                            {activeTab === "reason" && "Configurable reasons used when initiating mould transfers"}
                                            {activeTab === "depr" && "Depreciation methods used for mould asset valuation"}
                                            {activeTab === "plant" && "Manage plant locations where moulds are deployed"}
                                            {activeTab === "dept" && "Manage departments for mould ownership and tracking"}
                                            {activeTab === "costCenter" && "Manage cost centres for financial tracking and depreciation"}
                                            {activeTab === "technician" && "Manage technicians assigned to maintenance tasks"}
                                            {activeTab === "maint_vendor" && "Manage external vendors specifically for maintenance jobwork"}
                                        </div>
                                    </div>
                                </div>

                                {activeTab === "vendor" && <VendorMaster toast={showToast} currentUser={user} />}
                                {activeTab === "mfg" && <ManufacturerMaster toast={showToast} />}
                                {activeTab === "type" && <MouldTypeMaster toast={showToast} />}
                                {activeTab === "reason" && <TransferReasonMaster toast={showToast} />}
                                {activeTab === "depr" && <DepreciationMaster toast={showToast} />}
                                {activeTab === "plant" && <PlantMaster toast={showToast} currentUser={user} />}
                                {activeTab === "dept" && <DepartmentMaster toast={showToast} currentUser={user} />}
                                {activeTab === "costCenter" && <CostCenterMaster toast={showToast} currentUser={user} />}
                                {activeTab === "technician" && <TechnicianMaster toast={showToast} currentUser={user} />}
                                {activeTab === "maint_vendor" && <MaintVendorMaster toast={showToast} currentUser={user} />}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {toastMsg && (
                <Toast
                    msg={toastMsg}
                    type={toastType}
                    onClose={() => setToastMsg(null)}
                />
            )}
        </>
    );
}