'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });



// ── Data ──────────────────────────────────────────────────────────────────
const ROLES = [
    { icon: "🏭", name: "OEM Admin", desc: "Full access" },
    { icon: "🔩", name: "Supplier", desc: "Tool operations" },
    { icon: "🔧", name: "Maintenance", desc: "Service & repair" },
    { icon: "👁", name: "Viewer", desc: "Read only" },
];

// ── Tiny helpers ──────────────────────────────────────────────────────────
function useField(init = "") {
    const [value, setValue] = useState(init);
    const [error, setError] = useState("");
    return {
        value, setValue, error, setError,
        onChange: e => { setValue(e.target.value); setError(""); }
    };
}

// ── Sub-components ────────────────────────────────────────────────────────
function InputField({ label, required, icon, type = "text", field, placeholder, rightEl }) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ marginBottom: 18 }}>
            <label style={{
                display: "block", fontSize: 12, fontWeight: 700,
                letterSpacing: "1px", textTransform: "uppercase", color: "#4a5568", marginBottom: 7
            }}>
                {label}{required && <span style={{ color: "#e53e3e", marginLeft: 3 }}>*</span>}
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span style={{ position: "absolute", left: 14, fontSize: 15, pointerEvents: "none", zIndex: 1 }}>{icon}</span>
                <input
                    type={type} value={field.value} onChange={field.onChange}
                    placeholder={placeholder}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    style={{
                        width: "100%", padding: "13px 14px 13px 44px",
                        paddingRight: rightEl ? 44 : 14,
                        background: field.error ? "#fff5f5" : focused ? "#fff" : "#f7f9fc",
                        border: `1.5px solid ${field.error ? "#e53e3e" : focused ? "#38b6ff" : "#e2e8f0"}`,
                        borderRadius: 10, fontFamily: "'Plus Jakarta Sans'", fontSize: 14,
                        color: "#0a2540", outline: "none",
                        boxShadow: field.error ? "0 0 0 3px rgba(229,62,62,.1)"
                            : focused ? "0 0 0 4px rgba(56,182,255,.12)" : "none",
                        transition: "all .2s",
                    }}
                />
                {rightEl && (
                    <span style={{
                        position: "absolute", right: 14, cursor: "pointer", fontSize: 15,
                        color: "#b0bec5", userSelect: "none"
                    }}
                        onClick={rightEl.onClick}>{rightEl.icon}</span>
                )}
            </div>
            {field.error && (
                <div style={{ fontSize: 11, color: "#e53e3e", marginTop: 5 }}>{field.error}</div>
            )}
        </div>
    );
}

function PrimaryBtn({ children, onClick, loading }) {
    return (
        <button onClick={onClick} disabled={loading}
            style={{
                width: "100%", padding: 14,
                background: "linear-gradient(135deg,#38b6ff,#1565c0)",
                border: "none", borderRadius: 10, color: "#fff",
                fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 15,
                cursor: loading ? "wait" : "pointer", letterSpacing: ".3px",
                boxShadow: "0 6px 20px rgba(56,182,255,.35)",
                transition: "all .2s", opacity: loading ? .8 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
        >
            {loading ? (
                <span style={{
                    width: 18, height: 18, border: "2px solid rgba(255,255,255,.4)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    display: "inline-block", animation: "spin .8s linear infinite"
                }} />
            ) : children}
        </button>
    );
}


function Checkbox({ checked, onChange, children }) {
    return (
        <label style={{
            display: "flex", alignItems: "center", gap: 8,
            cursor: "pointer", fontSize: 13, color: "#4a5568", userSelect: "none"
        }}>
            <input type="checkbox" checked={checked} onChange={onChange} style={{ display: "none" }} />
            <span style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0, transition: "all .2s",
                border: `2px solid ${checked ? "#38b6ff" : "#d1d5db"}`,
                background: checked ? "#38b6ff" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#fff",
            }}>{checked ? "✓" : ""}</span>
            {children}
        </label>
    );
}

function Toast({ msg, icon, show }) {
    return (
        <div style={{
            position: "fixed", bottom: 32, right: 32, zIndex: 999,
            background: "#0a2540", color: "#fff",
            padding: "14px 20px", borderRadius: 12,
            display: "flex", alignItems: "center", gap: 10,
            fontSize: 14, fontWeight: 600,
            boxShadow: "0 8px 30px rgba(0,0,0,.2)",
            transform: show ? "translateY(0)" : "translateY(80px)",
            opacity: show ? 1 : 0,
            transition: "all .35s cubic-bezier(.34,1.56,.64,1)",
            pointerEvents: "none",
        }}>
            <span style={{ fontSize: 20 }}>{icon}</span>{msg}
        </div>
    );
}

// ── Brand Panel ───────────────────────────────────────────────────────────
function BrandPanel() {
    return (
        <div style={{
            width: "44%", flexShrink: 0,
            background: "linear-gradient(160deg,#0a2540 0%,#0d3660 55%,#1251a3 100%)",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            padding: "48px 52px", position: "relative", overflow: "hidden",
        }}>
            {/* Decorative rings */}
            {[{ w: 520, h: 520, t: -120, r: -160 }, { w: 340, h: 340, b: -80, l: -80 }].map((c, i) => (
                <div key={i} style={{
                    position: "absolute", width: c.w, height: c.h, borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,.07)",
                    top: c.t, right: c.r, bottom: c.b, left: c.l, pointerEvents: "none"
                }} />
            ))}
            <div style={{
                position: "absolute", width: 220, height: 220, borderRadius: "50%",
                background: "radial-gradient(circle,rgba(56,182,255,.18) 0%,transparent 70%)",
                top: "30%", right: -40, pointerEvents: "none"
            }} />

            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 1 }}>
                <div style={{
                    width: 46, height: 46, background: "linear-gradient(135deg,#38b6ff,#1565c0)",
                    borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, boxShadow: "0 8px 24px rgba(56,182,255,.35)"
                }}>⬡</div>
                <div>
                    <div style={{ fontWeight: 800, fontSize: 20, color: "#fff", letterSpacing: .5 }}>ToolTrack RFID</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", letterSpacing: "2px", textTransform: "uppercase", marginTop: 3 }}>
                        Automotive Tool Management
                    </div>
                </div>
            </div>

            {/* Hero */}
            <div style={{ position: "relative", zIndex: 1 }}>
                <h1 style={{
                    fontSize: 38, fontWeight: 800, color: "#fff", lineHeight: 1.2,
                    letterSpacing: "-.5px", marginBottom: 20
                }}>
                    Track every tool,<br />
                    <span style={{ color: "#38b6ff" }}>every shot,</span><br />
                    every supplier.
                </h1>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,.55)", lineHeight: 1.7, maxWidth: 340 }}>
                    End-to-end RFID-powered tool and mould lifecycle management for automotive OEMs and their supply chain.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 32 }}>
                    {[
                        { icon: "📡", text: "Real-time RFID tracking across all bays & suppliers" },
                        { icon: "🔧", text: "Automated maintenance scheduling & alerts" },
                        { icon: "♻️", text: "End-of-life scrapping with full audit trail" },
                    ].map((f, i) => (
                        <div key={i} style={{
                            display: "flex", alignItems: "center", gap: 12,
                            background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
                            borderRadius: 12, padding: "12px 16px"
                        }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 9, background: "rgba(56,182,255,.2)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 16, flexShrink: 0
                            }}>{f.icon}</div>
                            <span style={{ fontSize: 13, color: "rgba(255,255,255,.7)", fontWeight: 500 }}>{f.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            <p style={{ fontSize: 12, color: "rgba(255,255,255,.25)", position: "relative", zIndex: 1 }}>
                © 2026 ToolTrack RFID · Trusted by 6 OEMs · 128+ tools tracked
            </p>
        </div>
    );
}

// ── Login Page ────────────────────────────────────────────────────────────
function LoginPage({ onSwitch, onToast }) {
    const email = useField();
    const password = useField();
    const [showPw, setShowPw] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    function validate() {
        let ok = true;
        if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
            email.setError("Please enter a valid email address"); ok = false;
        }
        if (!password.value) { password.setError("Password is required"); ok = false; }
        return ok;
    }

    async function handleLogin() {
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.value, password: password.value }),
            });
            const data = await res.json();
            if (!res.ok) { onToast(data.error, "❌"); return; }
            localStorage.setItem("user", JSON.stringify({ name: data.user.name, role: data.user.role }));
            onToast(`Welcome back, ${data.user.name}! 👋`, "✅");
            setTimeout(() => router.push("/dashboard"), 1500);
        } catch (err) {
            onToast("Something went wrong. Please try again.", "❌");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ animation: "fadeIn .3s ease" }}>
            <div style={{ marginBottom: 32 }}>
                <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: "2.5px",
                    textTransform: "uppercase", color: "#38b6ff", marginBottom: 10
                }}>Welcome back</div>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0a2540", letterSpacing: "-.4px" }}>
                    Sign in to your account
                </h2>
                <p style={{ fontSize: 14, color: "#7a8fa6", marginTop: 6, lineHeight: 1.6 }}>
                    Enter your credentials to access the ToolTrack dashboard.
                </p>
            </div>


            <InputField label="Email Address" required icon="✉️" type="email" field={email}
                placeholder="you@company.com" />

            <InputField label="Password" required icon="🔒" type={showPw ? "text" : "password"}
                field={password} placeholder="Enter your password"
                rightEl={{ icon: showPw ? "🙈" : "👁", onClick: () => setShowPw(p => !p) }} />

            {/* Remember / Forgot */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                <Checkbox checked={remember} onChange={e => setRemember(e.target.checked)}>
                    Remember me for 30 days
                </Checkbox>
                <a href="#" style={{ fontSize: 13, color: "#38b6ff", fontWeight: 600, textDecoration: "none" }}>
                    Forgot password?
                </a>
            </div>

            <PrimaryBtn onClick={handleLogin} loading={loading}>Sign In</PrimaryBtn>

        </div>
    );
}

// ── Sign Up Page ──────────────────────────────────────────────────────────
function SignupPage({ onSwitch, onToast }) {
    const firstName = useField();
    const lastName = useField();
    const email = useField();
    const company = useField();
    const password = useField();
    const [showPw, setShowPw] = useState(false);
    const [role, setRole] = useState(0);
    const [terms, setTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    // Password strength
    const pwVal = password.value;
    const strength = [
        pwVal.length >= 8,
        /[A-Z]/.test(pwVal),
        /[0-9]/.test(pwVal),
        /[^A-Za-z0-9]/.test(pwVal),
    ].filter(Boolean).length;
    const strengthColors = ["#e53e3e", "#f6ad55", "#48bb78", "#38b6ff"];
    const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

    function validate() {
        let ok = true;
        if (!firstName.value.trim()) { firstName.setError("Required"); ok = false; }
        if (!lastName.value.trim()) { lastName.setError("Required"); ok = false; }
        if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
            email.setError("Please enter a valid email"); ok = false;
        }
        if (!company.value.trim()) { company.setError("Required"); ok = false; }
        if (pwVal.length < 8) { password.setError("Password must be at least 8 characters"); ok = false; }
        if (!terms) { onToast("Please accept the Terms of Service", "⚠️"); ok = false; }
        return ok;
    }

    async function handleSignup() {
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: firstName.value,
                    lastName: lastName.value,
                    email: email.value,
                    company: company.value,
                    role: ROLES[role].name,
                    password: password.value,
                }),
            });
            const data = await res.json();
            if (!res.ok) { onToast(data.error, "❌"); return; }
            onToast("Account created! Please sign in. 🎉", "🎉");
            setTimeout(() => onSwitch("login"), 2200);
        } catch (err) {
            onToast("Something went wrong. Please try again.", "❌");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ animation: "fadeIn .3s ease" }}>
            <div style={{ marginBottom: 28 }}>
                <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: "2.5px",
                    textTransform: "uppercase", color: "#38b6ff", marginBottom: 10
                }}>Get started</div>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0a2540", letterSpacing: "-.4px" }}>
                    Create your account
                </h2>
                <p style={{ fontSize: 14, color: "#7a8fa6", marginTop: 6, lineHeight: 1.6 }}>
                    Set up ToolTrack access for your organisation.
                </p>
            </div>

            {/* Role selector */}
            <div style={{ marginBottom: 18 }}>
                <label style={{
                    display: "block", fontSize: 12, fontWeight: 700, letterSpacing: "1px",
                    textTransform: "uppercase", color: "#4a5568", marginBottom: 7
                }}>Select Your Role</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {ROLES.map((r, i) => (
                        <div key={i} onClick={() => setRole(i)}
                            style={{
                                padding: "12px 14px", textAlign: "center", cursor: "pointer",
                                background: role === i ? "rgba(56,182,255,.08)" : "#f7f9fc",
                                border: `1.5px solid ${role === i ? "#38b6ff" : "#e2e8f0"}`,
                                borderRadius: 10, transition: "all .2s",
                            }}>
                            <div style={{ fontSize: 22, marginBottom: 5 }}>{r.icon}</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#0a2540" }}>{r.name}</div>
                            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{r.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Name row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <InputField label="First Name" required icon="👤" field={firstName} placeholder="Rahul" />
                <InputField label="Last Name" required icon="👤" field={lastName} placeholder="Sharma" />
            </div>

            <InputField label="Work Email" required icon="✉️" type="email" field={email}
                placeholder="you@company.com" />

            <InputField label="Company / Organisation" required icon="🏢" field={company}
                placeholder="e.g. Bharat Forge Ltd" />

            {/* Password */}
            <InputField label="Create Password" required icon="🔒"
                type={showPw ? "text" : "password"} field={password} placeholder="Min. 8 characters"
                rightEl={{ icon: showPw ? "🙈" : "👁", onClick: () => setShowPw(p => !p) }} />

            {/* Strength meter */}
            {pwVal.length > 0 && (
                <div style={{ marginTop: -12, marginBottom: 16 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{
                                flex: 1, height: 3, borderRadius: 2, transition: "background .3s",
                                background: i <= strength ? strengthColors[strength - 1] : "#e2e8f0"
                            }} />
                        ))}
                    </div>
                    <div style={{ fontSize: 11, color: strength > 0 ? strengthColors[strength - 1] : "#94a3b8" }}>
                        {strengthLabels[strength - 1] || "Weak"}
                    </div>
                </div>
            )}

            {/* Terms */}
            <div style={{ marginBottom: 20 }}>
                <Checkbox checked={terms} onChange={e => setTerms(e.target.checked)}>
                    <span style={{ marginLeft: 4 }}>
                        I agree to the{" "}
                        <a href="#" style={{ color: "#38b6ff", fontWeight: 600 }}>Terms of Service</a>
                        {" "}and{" "}
                        <a href="#" style={{ color: "#38b6ff", fontWeight: 600 }}>Privacy Policy</a>
                    </span>
                </Checkbox>
            </div>

            <PrimaryBtn onClick={handleSignup} loading={loading}>Create Account</PrimaryBtn>

            <div style={{ textAlign: "center", fontSize: 13, color: "#7a8fa6", marginTop: 22 }}>
                Already have an account?{" "}
                <span onClick={() => onSwitch("login")}
                    style={{ color: "#38b6ff", fontWeight: 700, cursor: "pointer" }}>
                    Sign in →
                </span>
            </div>
        </div>
    );
}

// ── Root App ──────────────────────────────────────────────────────────────
export default function App() {
    const [page, setPage] = useState("login");
    const [toast, setToast] = useState({ show: false, msg: "", icon: "✅" });

    function showToast(msg, icon = "✅") {
        setToast({ show: true, msg, icon });
        setTimeout(() => setToast(t => ({ ...t, show: false })), 3200);
    }

    const css = `
    @keyframes spin    { to { transform: rotate(360deg); } }
    @keyframes fadeIn  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    * { box-sizing: border-box; }
    body { margin:0; background:#f0f4f8; font-family:'Plus Jakarta Sans',sans-serif; }
    a { text-decoration:none; }
    a:hover { text-decoration:underline; }
    ::-webkit-scrollbar { width:5px; }
    ::-webkit-scrollbar-thumb { background:rgba(56,182,255,.3); border-radius:3px; }
  `;

    return (
        <>
            <style>{css}</style>
            <div style={{ display: "flex", minHeight: "100vh", overflow: "hidden" }}>

                {/* Brand */}
                <BrandPanel />

                {/* Form panel */}
                <div style={{
                    flex: 1, background: "#fff", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    padding: "48px 64px", overflowY: "auto"
                }}>
                    <div style={{ width: "100%", maxWidth: 400 }}>
                        {page === "login"
                            ? <LoginPage onSwitch={setPage} onToast={showToast} />
                            : <SignupPage onSwitch={setPage} onToast={showToast} />
                        }
                    </div>
                </div>
            </div>

            <Toast msg={toast.msg} icon={toast.icon} show={toast.show} />
        </>
    );
}