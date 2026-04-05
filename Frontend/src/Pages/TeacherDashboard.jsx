import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { T } from "../theme";
import DeadlineTimer from "../Components/DeadlineTimer";
import {
  createAssignment, getAllAssignments, getAllSubmissions,
  getAllStudents, getStudentsFromAssignments, getAllMarks, saveMark as saveMarkToDb
} from "../services/assignments";
import {
  LayoutDashboard, PlusCircle, ClipboardCheck, Star,
  Users, BookOpen, CheckCircle, Clock, ChevronDown, ChevronUp,
  Eye, X, FileText, Upload, TrendingUp, Award, AlertCircle,
  RefreshCw, Search, Filter, Sparkles
} from "lucide-react";
// ── Shared helpers ────────────────────────────────────────────────────────────
const ls = { fontSize: 12, fontWeight: 600, color: T.text, display: "block", marginBottom: 6 };
const is = {
  width: "100%", padding: "10px 13px", fontSize: 13,
  border: `1.5px solid ${T.border}`, borderRadius: 8, outline: "none",
  background: T.white, color: T.text, boxSizing: "border-box", fontFamily: "inherit",
  transition: "border-color 0.2s"
};

function FF({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label style={ls}>{label}</label>
      <input required type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={e => e.target.style.borderColor = T.primary}
        onBlur={e => e.target.style.borderColor = T.border}
        style={is} />
    </div>
  );
}

function Empty({ icon: Icon, title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "64px 20px" }}>
      {Icon && <Icon size={44} color={T.border} strokeWidth={1.2} style={{ marginBottom: 16 }} />}
      <p style={{ fontWeight: 700, color: T.text, fontSize: 15, margin: "0 0 6px" }}>{title}</p>
      {sub && <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>{sub}</p>}
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", top: 24, right: 24, zIndex: 9999,
      background: toast.type === "error" ? "#dc2626" : "#16a34a",
      color: "#fff", padding: "13px 20px", borderRadius: 12,
      fontSize: 13, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      display: "flex", alignItems: "center", gap: 8, animation: "slideIn 0.2s ease",
      maxWidth: 320
    }}>
      {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
      {toast.msg}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{
        width: 36, height: 36, border: `3px solid ${T.border}`,
        borderTopColor: T.primary, borderRadius: "50%",
        animation: "spin 0.8s linear infinite", margin: "0 auto 16px"
      }} />
      <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>Loading...</p>
    </div>
  );
}

// ── Submission Viewer Modal ───────────────────────────────────────────────────
function SubModal({ sub, student, assignment, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }} onClick={onClose}>
      <div style={{
        background: T.white, borderRadius: 20, width: "100%", maxWidth: 500,
        boxShadow: "0 24px 64px rgba(79,70,229,0.22)", overflow: "hidden",
        animation: "slideIn 0.2s ease"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ background: T.gradientCard, padding: "22px 28px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.12em" }}>Submission</p>
            <p style={{ margin: "6px 0 2px", fontWeight: 800, fontSize: 17 }}>{assignment}</p>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>{student}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", color: "#fff", display: "flex" }}>
            <X size={17} />
          </button>
        </div>
        <div style={{ padding: 28 }}>
          {/* Submission time */}
          {sub?.submittedAt && (
            <p style={{ fontSize: 11, color: T.textMuted, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 5 }}>
              <Clock size={12} strokeWidth={2} />
              Submitted: {sub.submittedAt?.toDate ? sub.submittedAt.toDate().toLocaleString() : new Date(sub.submittedAt).toLocaleString()}
            </p>
          )}

          {sub?.type === "file" || sub?.name ? (
            <div>
              {/* Image preview */}
              {sub?.url && sub?.fileType?.startsWith("image/") && (
                <div style={{ marginBottom: 14, borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}` }}>
                  <img src={sub.url} alt={sub.name} style={{ width: "100%", maxHeight: 280, objectFit: "contain", background: T.bg, display: "block" }} />
                </div>
              )}

              {/* File info card */}
              <div style={{ background: T.bg, borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 14, border: `1px solid ${T.border}` }}>
                <div style={{ width: 44, height: 44, background: T.primaryLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {sub?.fileType?.startsWith("image/") ? "🖼️" : sub?.fileType === "application/pdf" ? "📄" : <Upload size={20} color={T.primary} strokeWidth={1.8} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub.name || "File uploaded"}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: T.textMuted }}>
                    {sub.size ? `${(sub.size / 1024).toFixed(1)} KB · ` : ""}{sub.fileType || "File submission"}
                  </p>
                </div>
                {sub?.url && (
                  <a href={sub.url} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 12, fontWeight: 700, color: T.primary, background: T.primaryLight,
                    border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                    textDecoration: "none", display: "flex", alignItems: "center", gap: 5, flexShrink: 0
                  }}>
                    <Upload size={13} strokeWidth={2.5} style={{ transform: "rotate(180deg)" }} />
                    Open
                  </a>
                )}
              </div>
            </div>
          ) : sub?.content ? (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>Written Answer</p>
              <div style={{ background: T.bg, borderRadius: 12, padding: 18, border: `1px solid ${T.border}`, fontSize: 13, color: T.text, lineHeight: 1.8, maxHeight: 280, overflowY: "auto", whiteSpace: "pre-wrap" }}>
                {sub.content}
              </div>
              <p style={{ fontSize: 11, color: T.textMuted, margin: "6px 0 0" }}>
                {sub.content.trim().split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
          ) : (
            <div style={{ background: T.bg, borderRadius: 12, padding: 18, border: `1px solid ${T.border}`, fontSize: 13, color: T.textMuted, textAlign: "center" }}>
              No submission content available.
            </div>
          )}
          <button onClick={onClose} style={{
            marginTop: 20, width: "100%", padding: "12px 0", background: T.bg,
            color: T.text, border: `1px solid ${T.border}`, borderRadius: 12,
            fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "background 0.15s"
          }}
            onMouseEnter={e => e.currentTarget.style.background = T.border}
            onMouseLeave={e => e.currentTarget.style.background = T.bg}
          >Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ assignments, submissions, students, marks, onTabChange }) {
  const totalPossible = assignments.reduce((acc, a) => acc + (a.assignedTo?.length || 0), 0);
  const subRate = totalPossible ? Math.round((submissions.length / totalPossible) * 100) : 0;
  const allM = Object.values(marks).flatMap(m => Object.values(m)).filter(v => v !== "").map(Number);
  const avg = allM.length ? (allM.reduce((a, b) => a + b, 0) / allM.length).toFixed(1) : "—";

  const stats = [
    { icon: BookOpen,      label: "Assignments",      value: assignments.length,  color: T.primary,  bg: T.primaryLight },
    { icon: Users,         label: "Students",          value: students.length,     color: "#7c3aed",  bg: "#f5f3ff" },
    { icon: ClipboardCheck,label: "Submissions",       value: submissions.length,  color: "#16a34a",  bg: "#f0fdf4" },
    { icon: TrendingUp,    label: "Submission Rate",   value: `${subRate}%`,       color: "#d97706",  bg: "#fffbeb" },
    { icon: Award,         label: "Class Average",     value: avg,                 color: "#0891b2",  bg: "#ecfeff" },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 18, marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: T.white, borderRadius: T.radius, padding: "20px 22px",
            border: `1px solid ${T.border}`, boxShadow: T.shadow,
            display: "flex", alignItems: "center", gap: 16,
            transition: "box-shadow 0.2s, transform 0.2s"
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = T.shadowHover; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = T.shadow; e.currentTarget.style.transform = "none"; }}
          >
            <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon size={21} color={s.color} strokeWidth={1.8} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: T.text, lineHeight: 1 }}>{s.value}</p>
              <p style={{ margin: "5px 0 0", fontSize: 11, color: T.textMuted, fontWeight: 600 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24 }} className="overview-grid">
        {/* Recent assignments table */}
        <div style={{ background: T.white, borderRadius: T.radius, border: `1px solid ${T.border}`, boxShadow: T.shadow, overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: T.text }}>Recent Assignments</p>
            <button onClick={() => onTabChange("create")} style={{
              fontSize: 12, fontWeight: 700, color: T.primary, background: T.primaryLight,
              border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5
            }}>
              <PlusCircle size={13} strokeWidth={2.5} /> New
            </button>
          </div>
          {assignments.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: T.textMuted, fontSize: 13 }}>No assignments yet.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: T.bg }}>
                  {["Assignment", "Students", "Deadline", "Progress"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "9px 18px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assignments.slice(0, 6).map(a => {
                  const subCount = submissions.filter(s => s.assignmentId === a.id).length;
                  const total = a.assignedTo?.length || 0;
                  const pct = total ? Math.round((subCount / total) * 100) : 0;
                  return (
                    <tr key={a.id} style={{ borderBottom: `1px solid ${T.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = T.bg}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "13px 18px" }}>
                        <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 13 }}>{a.title}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: T.textMuted }}>{a.maxMarks || 100} marks</p>
                      </td>
                      <td style={{ padding: "13px 18px", color: T.textMuted, fontSize: 12 }}>{total}</td>
                      <td style={{ padding: "13px 18px" }}><DeadlineTimer deadline={a.deadline} /></td>
                      <td style={{ padding: "13px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 5, background: T.border, borderRadius: 99, overflow: "hidden", maxWidth: 70 }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#16a34a" : T.gradientCard, borderRadius: 99 }} />
                          </div>
                          <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, minWidth: 28 }}>{subCount}/{total}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Students list */}
        <div style={{ background: T.white, borderRadius: T.radius, border: `1px solid ${T.border}`, boxShadow: T.shadow, overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: `1px solid ${T.border}` }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: T.text }}>Students</p>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: T.textMuted }}>{students.length} registered</p>
          </div>
          {students.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: T.textMuted, fontSize: 13 }}>No students yet.</div>
          ) : (
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {students.map((s, i) => {
                const initials = s.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
                const subCount = submissions.filter(sub => sub.studentEmail?.toLowerCase() === s.email?.toLowerCase()).length;
                return (
                  <div key={s.id || i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 18px", borderBottom: `1px solid ${T.border}`,
                    transition: "background 0.15s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = T.bg}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%", background: T.gradientCard,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0
                    }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</p>
                      <p style={{ margin: "1px 0 0", fontSize: 11, color: T.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.email}</p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.primary, background: T.primaryLight, padding: "2px 8px", borderRadius: 20, flexShrink: 0 }}>
                      {subCount} sub
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Create Tab ────────────────────────────────────────────────────────────────
function CreateTab({ students, onCreated, showToast, userProfile }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  function toggleStudent(email) {
    setSelectedStudents(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!selectedStudents.length) return showToast("Select at least one student.", "error");
    setLoading(true);
    try {
      await createAssignment({ title, description, deadline, maxMarks: Number(maxMarks), assignedTo: selectedStudents, createdBy: userProfile.email });
      showToast("Assignment created!");
      setTitle(""); setDescription(""); setDeadline(""); setMaxMarks("100"); setSelectedStudents([]); setSearch("");
      onCreated();
    } catch { showToast("Error creating assignment.", "error"); }
    setLoading(false);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }} className="create-grid">
      {/* Form card */}
      <div style={{ background: T.white, borderRadius: T.radius, padding: 28, boxShadow: T.shadow, border: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ width: 38, height: 38, background: T.gradientCard, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={18} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: T.text }}>New Assignment</p>
            <p style={{ margin: 0, fontSize: 11, color: T.textMuted }}>Fill in the details below</p>
          </div>
        </div>

        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FF label="Title" value={title} onChange={setTitle} placeholder="e.g. Chapter 3 Summary" />
          <div>
            <label style={ls}>Description</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="Describe the assignment..."
              onFocus={e => e.target.style.borderColor = T.primary}
              onBlur={e => e.target.style.borderColor = T.border}
              style={{ ...is, resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={ls}>Deadline</label>
              <input type="datetime-local" required value={deadline} onChange={e => setDeadline(e.target.value)}
                onFocus={e => e.target.style.borderColor = T.primary}
                onBlur={e => e.target.style.borderColor = T.border}
                style={is} />
            </div>
            <FF label="Total Marks" value={maxMarks} onChange={setMaxMarks} placeholder="100" type="number" />
          </div>

          {/* Student selector */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ ...ls, marginBottom: 0 }}>
                Assign to Students
                {selectedStudents.length > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: T.primary, background: T.primaryLight, padding: "1px 7px", borderRadius: 20 }}>
                    {selectedStudents.length} selected
                  </span>
                )}
              </label>
              {students.length > 0 && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => setSelectedStudents(students.map(s => s.email))}
                    style={{ fontSize: 11, color: T.primary, background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>
                    All
                  </button>
                  <span style={{ color: T.border }}>·</span>
                  <button type="button" onClick={() => setSelectedStudents([])}
                    style={{ fontSize: 11, color: T.textMuted, background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>
                    Clear
                  </button>
                </div>
              )}
            </div>

            {students.length === 0 ? (
              <div style={{ background: T.bg, borderRadius: 8, padding: "14px 16px", fontSize: 12, color: T.textMuted, border: `1px dashed ${T.border}` }}>
                No students registered yet. Students appear here after they sign up.
              </div>
            ) : (
              <>
                {/* Search */}
                <div style={{ position: "relative", marginBottom: 8 }}>
                  <Search size={13} color={T.textMuted} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search students..."
                    style={{ ...is, paddingLeft: 30, fontSize: 12 }} />
                </div>
                <div style={{ border: `1.5px solid ${T.border}`, borderRadius: 8, maxHeight: 180, overflowY: "auto", background: T.bg }}>
                  {filtered.length === 0 ? (
                    <p style={{ padding: "12px 14px", fontSize: 12, color: T.textMuted, margin: 0 }}>No students found.</p>
                  ) : filtered.map(s => {
                    const checked = selectedStudents.includes(s.email);
                    const initials = s.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
                    return (
                      <label key={s.email} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                        cursor: "pointer", background: checked ? T.primaryLight : "transparent",
                        transition: "background 0.15s", borderBottom: `1px solid ${T.border}`
                      }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleStudent(s.email)}
                          style={{ accentColor: T.primary, width: 14, height: 14 }} />
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: checked ? T.gradientCard : T.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: checked ? "#fff" : T.textMuted, flexShrink: 0 }}>
                          {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 12 }}>{s.name}</p>
                          <p style={{ margin: 0, fontSize: 10, color: T.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</p>
                        </div>
                        {checked && <CheckCircle size={14} color={T.primary} strokeWidth={2.5} />}
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <button type="submit" disabled={loading} style={{
            background: loading ? T.border : T.gradientCard, color: loading ? T.textMuted : "#fff",
            border: "none", padding: "13px 0", borderRadius: 10, fontWeight: 700, fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer", marginTop: 4,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "opacity 0.2s"
          }}>
            {loading
              ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Creating...</>
              : <><PlusCircle size={16} strokeWidth={2.5} /> Create Assignment</>
            }
          </button>
        </form>
      </div>

      {/* Live preview */}
      <div>
        <p style={{ fontWeight: 700, fontSize: 14, color: T.text, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 7 }}>
          <Eye size={15} color={T.textMuted} strokeWidth={2} /> Live Preview
        </p>
        {!title ? (
          <div style={{ background: T.white, borderRadius: T.radius, border: `1.5px dashed ${T.border}`, padding: "52px 20px", textAlign: "center" }}>
            <FileText size={36} color={T.border} strokeWidth={1.2} style={{ marginBottom: 12 }} />
            <p style={{ fontWeight: 600, color: T.textMuted, fontSize: 13, margin: 0 }}>Start typing to see preview</p>
          </div>
        ) : (
          <div style={{ background: T.white, borderRadius: T.radius, border: `1.5px solid ${T.primary}`, boxShadow: T.shadowHover, overflow: "hidden" }}>
            <div style={{ background: T.gradientCard, padding: "18px 22px", color: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 16, lineHeight: 1.3 }}>{title}</p>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 20, flexShrink: 0, marginLeft: 10 }}>
                  {maxMarks} marks
                </span>
              </div>
              {deadline && <div style={{ marginTop: 10 }}><DeadlineTimer deadline={deadline} /></div>}
            </div>
            <div style={{ padding: "18px 22px" }}>
              <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.75, margin: "0 0 16px" }}>{description || "No description."}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.textMuted }}>
                <Users size={13} strokeWidth={2} />
                {selectedStudents.length > 0
                  ? `${selectedStudents.length} student${selectedStudents.length > 1 ? "s" : ""} assigned`
                  : "No students selected"}
              </div>
            </div>
          </div>
        )}

        {/* Selected students chips */}
        {selectedStudents.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>Assigned to</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {selectedStudents.map(email => {
                const s = students.find(st => st.email === email);
                return (
                  <span key={email} style={{
                    fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
                    background: T.primaryLight, color: T.primary,
                    display: "flex", alignItems: "center", gap: 5
                  }}>
                    {s?.name || email}
                    <button onClick={() => toggleStudent(email)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: T.primary, display: "flex" }}>
                      <X size={11} strokeWidth={2.5} />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Submissions Tab ───────────────────────────────────────────────────────────
function SubmissionsTab({ assignments, submissions, students, onRefresh, loading }) {
  const [expanded, setExpanded] = useState(null);
  const [viewSub, setViewSub] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = assignments.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()));

  function getSub(assignmentId, email) {
    return submissions.find(s => s.assignmentId === assignmentId && s.studentEmail?.toLowerCase().trim() === email?.toLowerCase().trim());
  }
  function getExtraSubs(assignmentId, assignedEmails) {
    return submissions.filter(s => s.assignmentId === assignmentId && !assignedEmails.map(e => e.toLowerCase()).includes(s.studentEmail?.toLowerCase()));
  }
  function getName(email) {
    return students.find(s => s.email?.toLowerCase().trim() === email?.toLowerCase().trim())?.name || email;
  }

  if (loading) return <Spinner />;
  if (assignments.length === 0) return <Empty icon={ClipboardCheck} title="No assignments yet" sub="Create an assignment first." />;

  return (
    <div>
      {viewSub && <SubModal sub={viewSub.sub} student={viewSub.student} assignment={viewSub.assignment} onClose={() => setViewSub(null)} />}

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={13} color={T.textMuted} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assignments..."
            style={{ ...is, paddingLeft: 32, fontSize: 12 }} />
        </div>
        <button onClick={onRefresh} style={{
          display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600,
          color: T.primary, background: T.primaryLight, border: "none", borderRadius: 8,
          padding: "9px 16px", cursor: "pointer"
        }}>
          <RefreshCw size={13} strokeWidth={2.5} /> Refresh
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.map(a => {
          const emails = a.assignedTo || [];
          const subs = emails.filter(e => getSub(a.id, e));
          const extra = getExtraSubs(a.id, emails);
          const total = emails.length;
          const pct = total ? Math.round((subs.length / total) * 100) : 0;
          const isOpen = expanded === a.id;

          return (
            <div key={a.id} style={{ background: T.white, borderRadius: T.radius, border: `1px solid ${T.border}`, boxShadow: T.shadow, overflow: "hidden" }}>
              <div onClick={() => setExpanded(isOpen ? null : a.id)} style={{
                padding: "16px 22px", cursor: "pointer", display: "flex",
                justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap",
                transition: "background 0.15s"
              }}
                onMouseEnter={e => e.currentTarget.style.background = T.bg}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: T.text }}>{a.title}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 11, color: T.textMuted }}>{a.description?.slice(0, 70)}{a.description?.length > 70 ? "…" : ""}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                  <DeadlineTimer deadline={a.deadline} />
                  <div style={{ textAlign: "center", minWidth: 44 }}>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: pct === 100 ? "#16a34a" : T.primary, lineHeight: 1 }}>{subs.length + extra.length}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 9, color: T.textMuted, fontWeight: 700, textTransform: "uppercase" }}>/ {total}</p>
                  </div>
                  <div style={{ width: 72 }}>
                    <div style={{ height: 5, background: T.border, borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#16a34a" : T.gradientCard, borderRadius: 99, transition: "width 0.5s" }} />
                    </div>
                    <p style={{ margin: "3px 0 0", fontSize: 9, color: T.textMuted, textAlign: "right", fontWeight: 600 }}>{pct}%</p>
                  </div>
                  {isOpen ? <ChevronUp size={16} color={T.textMuted} /> : <ChevronDown size={16} color={T.textMuted} />}
                </div>
              </div>

              {isOpen && (
                <div style={{ borderTop: `1px solid ${T.border}`, overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: T.bg }}>
                        {["Student", "Email", "Status", "Submission", "Max Marks"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "9px 18px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {emails.map(email => {
                        const sub = getSub(a.id, email);
                        return (
                          <tr key={email} style={{ borderBottom: `1px solid ${T.border}` }}
                            onMouseEnter={e => e.currentTarget.style.background = T.bg}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            <td style={{ padding: "12px 18px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 28, height: 28, borderRadius: "50%", background: sub ? "#dcfce7" : T.bg, border: `1px solid ${sub ? "#bbf7d0" : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: sub ? "#15803d" : T.textMuted, flexShrink: 0 }}>
                                  {getName(email).slice(0, 2).toUpperCase()}
                                </div>
                                <span style={{ fontWeight: 600, color: T.text, fontSize: 13 }}>{getName(email)}</span>
                              </div>
                            </td>
                            <td style={{ padding: "12px 18px", color: T.textMuted, fontSize: 11 }}>{email}</td>
                            <td style={{ padding: "12px 18px" }}>
                              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: sub ? "#dcfce7" : "#fef9c3", color: sub ? "#15803d" : "#854d0e" }}>
                                {sub ? "✓ Submitted" : "Pending"}
                              </span>
                            </td>
                            <td style={{ padding: "12px 18px" }}>
                              {sub ? (
                                <button onClick={() => setViewSub({ sub, student: getName(email), assignment: a.title })}
                                  style={{ fontSize: 11, color: T.primary, background: T.primaryLight, border: "none", borderRadius: 6, padding: "5px 11px", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                                  <Eye size={12} strokeWidth={2} /> View
                                </button>
                              ) : <span style={{ color: T.textMuted, fontSize: 12 }}>—</span>}
                            </td>
                            <td style={{ padding: "12px 18px", color: T.textMuted, fontSize: 12, fontWeight: 700 }}>{a.maxMarks || 100}</td>
                          </tr>
                        );
                      })}
                      {extra.map(sub => (
                        <tr key={sub.studentEmail} style={{ borderBottom: `1px solid ${T.border}`, background: "#fffbeb" }}>
                          <td style={{ padding: "12px 18px", fontWeight: 600, color: T.text, fontSize: 13 }}>{getName(sub.studentEmail)}</td>
                          <td style={{ padding: "12px 18px", color: T.textMuted, fontSize: 11 }}>{sub.studentEmail}</td>
                          <td style={{ padding: "12px 18px" }}><span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "#dcfce7", color: "#15803d" }}>✓ Submitted</span></td>
                          <td style={{ padding: "12px 18px" }}>
                            <button onClick={() => setViewSub({ sub, student: getName(sub.studentEmail), assignment: a.title })}
                              style={{ fontSize: 11, color: T.primary, background: T.primaryLight, border: "none", borderRadius: 6, padding: "5px 11px", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                              <Eye size={12} strokeWidth={2} /> View
                            </button>
                          </td>
                          <td style={{ padding: "12px 18px", color: T.textMuted, fontSize: 12, fontWeight: 700 }}>{a.maxMarks || 100}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Marks Tab ─────────────────────────────────────────────────────────────────
function MarksTab({ assignments, submissions, students, marks, setMarks, showToast, loading }) {
  const [saving, setSaving] = useState({});
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = assignments.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()));

  function getSub(aId, email) {
    return submissions.find(s => s.assignmentId === aId && s.studentEmail?.toLowerCase().trim() === email?.toLowerCase().trim());
  }
  function getName(email) {
    return students.find(s => s.email?.toLowerCase().trim() === email?.toLowerCase().trim())?.name || email;
  }
  function getMark(aId, email) { return marks[aId]?.[email] ?? ""; }
  function setMark(aId, email, val) {
    setMarks(prev => ({ ...prev, [aId]: { ...(prev[aId] || {}), [email]: val } }));
  }
  function grade(mark, max) {
    const p = (mark / max) * 100;
    if (p >= 90) return { label: "A+", color: "#15803d", bg: "#dcfce7" };
    if (p >= 80) return { label: "A",  color: "#16a34a", bg: "#f0fdf4" };
    if (p >= 70) return { label: "B",  color: "#0891b2", bg: "#ecfeff" };
    if (p >= 60) return { label: "C",  color: "#d97706", bg: "#fffbeb" };
    if (p >= 50) return { label: "D",  color: "#ea580c", bg: "#fff7ed" };
    return { label: "F", color: "#dc2626", bg: "#fef2f2" };
  }
  async function save(aId, email, max) {
    const val = getMark(aId, email);
    if (val === "" || isNaN(+val)) return showToast("Enter a valid number.", "error");
    if (+val < 0 || +val > max) return showToast(`Marks must be 0–${max}.`, "error");
    const key = `${aId}-${email}`;
    setSaving(p => ({ ...p, [key]: true }));
    try { await saveMarkToDb(aId, email, val, max); showToast(`Saved for ${getName(email)}!`); }
    catch { showToast("Failed to save.", "error"); }
    setSaving(p => ({ ...p, [key]: false }));
  }

  if (loading) return <Spinner />;
  if (assignments.length === 0) return <Empty icon={Star} title="No assignments yet" sub="Create assignments to start grading." />;

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={13} color={T.textMuted} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assignments..."
            style={{ ...is, paddingLeft: 32, fontSize: 12 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Filter size={13} color={T.textMuted} />
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{
            fontSize: 12, padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
            background: T.white, color: T.text, cursor: "pointer", outline: "none"
          }}>
            <option value="all">All Students</option>
            <option value="submitted">Submitted Only</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {filtered.map(a => {
          const max = a.maxMarks || 100;
          const rows = (a.assignedTo || []).filter(email => {
            const sub = getSub(a.id, email);
            if (filter === "submitted") return !!sub;
            if (filter === "pending") return !sub;
            return true;
          });
          const gradedCount = (a.assignedTo || []).filter(e => getMark(a.id, e) !== "").length;
          const total = a.assignedTo?.length || 0;
          const gradedMarks = (a.assignedTo || []).map(e => getMark(a.id, e)).filter(v => v !== "").map(Number);

          return (
            <div key={a.id} style={{ background: T.white, borderRadius: T.radius, border: `1px solid ${T.border}`, boxShadow: T.shadow, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ padding: "16px 22px", borderBottom: `1px solid ${T.border}`, background: T.bg, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: T.text }}>{a.title}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 11, color: T.textMuted }}>
                    Total: {max} marks · Graded: {gradedCount}/{total}
                    {gradedMarks.length > 0 && ` · Avg: ${(gradedMarks.reduce((a,b)=>a+b,0)/gradedMarks.length).toFixed(1)}`}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <DeadlineTimer deadline={a.deadline} />
                  {/* Graded progress */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 60, height: 5, background: T.border, borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: total ? `${(gradedCount/total)*100}%` : "0%", background: T.gradientCard, borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 10, color: T.textMuted, fontWeight: 700 }}>{gradedCount}/{total} graded</span>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: T.bg }}>
                      {["Student", "Submission", `Marks / ${max}`, "Grade", "Action"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "9px 18px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(email => {
                      const sub = getSub(a.id, email);
                      const val = getMark(a.id, email);
                      const key = `${a.id}-${email}`;
                      const g = val !== "" ? grade(+val, max) : null;
                      const initials = getName(email).slice(0, 2).toUpperCase();
                      return (
                        <tr key={email} style={{ borderBottom: `1px solid ${T.border}` }}
                          onMouseEnter={e => e.currentTarget.style.background = T.bg}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding: "13px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.gradientCard, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                                {initials}
                              </div>
                              <div>
                                <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 13 }}>{getName(email)}</p>
                                <p style={{ margin: "1px 0 0", fontSize: 10, color: T.textMuted }}>{email}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "13px 18px" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: sub ? "#dcfce7" : "#fef9c3", color: sub ? "#15803d" : "#854d0e" }}>
                              {sub ? "✓ Submitted" : "Pending"}
                            </span>
                          </td>
                          <td style={{ padding: "13px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <input type="number" min="0" max={max} value={val}
                                onChange={e => setMark(a.id, email, e.target.value)}
                                placeholder="—" disabled={!sub}
                                style={{
                                  width: 68, padding: "7px 10px", fontSize: 15, fontWeight: 800,
                                  border: `1.5px solid ${val !== "" ? T.primary : T.border}`,
                                  borderRadius: 8, outline: "none", textAlign: "center",
                                  background: !sub ? T.bg : T.white, color: T.text,
                                  cursor: !sub ? "not-allowed" : "text"
                                }}
                                onFocus={e => e.target.style.borderColor = T.primary}
                                onBlur={e => e.target.style.borderColor = val !== "" ? T.primary : T.border}
                              />
                              <span style={{ fontSize: 11, color: T.textMuted }}>/ {max}</span>
                            </div>
                            {val !== "" && (
                              <div style={{ marginTop: 5, height: 3, background: T.border, borderRadius: 99, width: 76, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${Math.min((+val/max)*100,100)}%`, background: T.gradientCard, borderRadius: 99 }} />
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "13px 18px" }}>
                            {g
                              ? <span style={{ fontSize: 14, fontWeight: 800, padding: "4px 13px", borderRadius: 20, background: g.bg, color: g.color }}>{g.label}</span>
                              : <span style={{ color: T.textMuted, fontSize: 12 }}>—</span>
                            }
                          </td>
                          <td style={{ padding: "13px 18px" }}>
                            <button onClick={() => save(a.id, email, max)}
                              disabled={!sub || val === "" || saving[key]}
                              style={{
                                fontSize: 12, fontWeight: 700, padding: "7px 16px", borderRadius: 8, border: "none",
                                background: (!sub || val === "") ? T.bg : T.gradientCard,
                                color: (!sub || val === "") ? T.textMuted : "#fff",
                                cursor: (!sub || val === "") ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s"
                              }}>
                              {saving[key]
                                ? <><span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Saving</>
                                : <><CheckCircle size={13} strokeWidth={2.5} /> Save</>
                              }
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Stats footer */}
              {gradedMarks.length > 0 && (
                <div style={{ padding: "12px 22px", borderTop: `1px solid ${T.border}`, background: T.bg, display: "flex", gap: 24, flexWrap: "wrap" }}>
                  {[
                    { label: "Average", value: `${(gradedMarks.reduce((a,b)=>a+b,0)/gradedMarks.length).toFixed(1)} / ${max}` },
                    { label: "Highest", value: `${Math.max(...gradedMarks)} / ${max}` },
                    { label: "Lowest",  value: `${Math.min(...gradedMarks)} / ${max}` },
                    { label: "Graded",  value: `${gradedCount} / ${total}` },
                  ].map(s => (
                    <div key={s.label}>
                      <p style={{ margin: 0, fontSize: 9, color: T.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.label}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 800, color: T.primary }}>{s.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const { userProfile } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Auto-refresh submissions when switching to that tab
  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === "submissions" || tab === "marks") loadAll();
  }

  async function loadAll() {
    setLoading(true);
    const [a, s, m] = await Promise.all([getAllAssignments(), getAllSubmissions(), getAllMarks()]);
    setAssignments(a); setSubmissions(s);
    let u = await getAllStudents();
    if (u.length === 0) u = await getStudentsFromAssignments();
    setStudents(u);
    const mm = {};
    m.forEach(({ assignmentId, studentEmail, marks }) => {
      if (!mm[assignmentId]) mm[assignmentId] = {};
      mm[assignmentId][studentEmail] = String(marks);
    });
    setMarks(mm);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleCreated() {
    const a = await getAllAssignments();
    setAssignments(a);
  }

  const initials = userProfile?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "T";

  const tabs = [
    { key: "overview",     icon: LayoutDashboard, label: "Overview" },
    { key: "create",       icon: PlusCircle,      label: "Create" },
    { key: "submissions",  icon: ClipboardCheck,  label: "Submissions", count: submissions.length },
    { key: "marks",        icon: Star,            label: "Marks" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <Toast toast={toast} />

      {/* ── Hero Header ── */}
      <div style={{ background: T.gradientHero, padding: `40px ${T.px} 36px`, color: "#fff" }}>
        <div style={{ maxWidth: T.maxWidth, margin: "0 auto" }}>
          {/* Profile row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 800, flexShrink: 0
            }}>{initials}</div>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, opacity: 0.7, letterSpacing: "0.12em", textTransform: "uppercase" }}>Teacher Portal</p>
              <h1 style={{ margin: "4px 0 2px", fontSize: 24, fontWeight: 800, lineHeight: 1.2 }}>
                {userProfile?.name || "Teacher"}
              </h1>
              <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>{userProfile?.email}</p>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <button onClick={loadAll} style={{
                background: "rgba(255,255,255,0.15)", color: "#fff",
                border: "1.5px solid rgba(255,255,255,0.3)",
                padding: "8px 16px", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 12,
                display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s"
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
              >
                <RefreshCw size={13} strokeWidth={2.5} /> Refresh
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
            {[
              { icon: BookOpen,       label: "Assignments",  value: assignments.length },
              { icon: Users,          label: "Students",     value: students.length },
              { icon: ClipboardCheck, label: "Submissions",  value: submissions.length },
              { icon: Star,           label: "Graded",       value: Object.values(marks).reduce((acc, m) => acc + Object.values(m).filter(v => v !== "").length, 0) },
            ].map(s => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.14)", borderRadius: 12, padding: "14px 16px",
                border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(8px)"
              }}>
                <s.icon size={16} color="rgba(255,255,255,0.75)" strokeWidth={1.8} style={{ marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{s.value}</p>
                <p style={{ margin: "4px 0 0", fontSize: 10, opacity: 0.7, fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ background: T.white, borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100, boxShadow: T.shadow }}>
        <div style={{ maxWidth: T.maxWidth, margin: "0 auto", padding: `0 ${T.px}`, display: "flex", overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => handleTabChange(t.key)} style={{
              padding: "15px 18px", fontSize: 13, fontWeight: 600, border: "none", background: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
              borderBottom: activeTab === t.key ? `2px solid ${T.primary}` : "2px solid transparent",
              color: activeTab === t.key ? T.primary : T.textMuted, transition: "all 0.2s"
            }}>
              <t.icon size={14} strokeWidth={2} />
              {t.label}
              {t.count !== undefined && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 20,
                  background: activeTab === t.key ? T.primaryLight : T.bg,
                  color: activeTab === t.key ? T.primary : T.textMuted
                }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: T.maxWidth, margin: "0 auto", padding: `32px ${T.px}` }}>
        {activeTab === "overview" && (
          loading ? <Spinner /> :
          <OverviewTab assignments={assignments} submissions={submissions} students={students} marks={marks} onTabChange={handleTabChange} />
        )}
        {activeTab === "create" && (
          <CreateTab students={students} onCreated={handleCreated} showToast={showToast} userProfile={userProfile} />
        )}
        {activeTab === "submissions" && (
          <SubmissionsTab assignments={assignments} submissions={submissions} students={students} onRefresh={loadAll} loading={loading} />
        )}
        {activeTab === "marks" && (
          <MarksTab assignments={assignments} submissions={submissions} students={students} marks={marks} setMarks={setMarks} showToast={showToast} loading={loading} />
        )}
      </div>
    </div>
  );
}
