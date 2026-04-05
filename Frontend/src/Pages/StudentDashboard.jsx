import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { T } from "../theme";
import DeadlineTimer from "../Components/DeadlineTimer";
import {
  getAssignmentsForStudent, getSubmissionsByStudent,
  submitAssignment, getMarksForStudent
} from "../services/assignments";
import {
  BookOpen, ClipboardList, CheckCircle, Clock, Upload,
  X, FileText, GraduationCap, Eye, Star, Award,
  TrendingUp, AlertTriangle, RefreshCw
} from "lucide-react";

// ── Static courses (mock) ─────────────────────────────────────────────────────
const COURSES = [
  { id: 1, title: "Introduction to Mathematics", instructor: "Dr. Smith",   level: "Beginner",     icon: "📐", progress: 72 },
  { id: 2, title: "English Literature",          instructor: "Ms. Johnson", level: "Intermediate", icon: "📖", progress: 55 },
  { id: 3, title: "Physics Fundamentals",        instructor: "Mr. Lee",     level: "Intermediate", icon: "⚛️",  progress: 40 },
  { id: 4, title: "Computer Science Basics",     instructor: "Dr. Patel",   level: "Beginner",     icon: "💻", progress: 88 },
];
const LEVEL = {
  Beginner:     { bg: "#dcfce7", color: "#15803d" },
  Intermediate: { bg: "#fef9c3", color: "#854d0e" },
  Advanced:     { bg: "#fee2e2", color: "#dc2626" },
};

function grade(mark, max) {
  const p = (mark / max) * 100;
  if (p >= 90) return { label: "A+", color: "#15803d", bg: "#dcfce7" };
  if (p >= 80) return { label: "A",  color: "#16a34a", bg: "#f0fdf4" };
  if (p >= 70) return { label: "B",  color: "#0891b2", bg: "#ecfeff" };
  if (p >= 60) return { label: "C",  color: "#d97706", bg: "#fffbeb" };
  if (p >= 50) return { label: "D",  color: "#ea580c", bg: "#fff7ed" };
  return { label: "F", color: "#dc2626", bg: "#fef2f2" };
}

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ assignment, studentEmail, onClose, onSubmit }) {
  const [tab, setTab] = useState("file");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  async function handleSubmit() {
    if (tab === "file" && !file) return;
    if (tab === "text" && !text.trim()) return;
    setSubmitting(true); setError("");
    try {
      const data = tab === "file"
        ? { type: "file", name: file.name, size: file.size }
        : { type: "text", content: text };
      // Pass actual file object for Storage upload
      await submitAssignment(assignment.id, studentEmail, data, tab === "file" ? file : null);
      onSubmit(assignment.id, data);
    } catch { setError("Failed to submit. Please try again."); setSubmitting(false); }
  }

  const canSubmit = tab === "file" ? !!file : !!text.trim();

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: T.white, borderRadius: 20, width: "100%", maxWidth: 520, boxShadow: "0 24px 64px rgba(79,70,229,0.22)", overflow: "hidden", animation: "fadeUp 0.2s ease" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background: T.gradientCard, padding: "20px 26px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.12em" }}>Submit Assignment</p>
            <p style={{ margin: "5px 0 2px", fontWeight: 800, fontSize: 17 }}>{assignment.title}</p>
            {assignment.course && <p style={{ margin: 0, fontSize: 12, opacity: 0.75 }}>{assignment.course}</p>}
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", color: "#fff", display: "flex" }}><X size={17} /></button>
        </div>
        {/* Deadline strip */}
        <div style={{ padding: "11px 26px", background: T.bg, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={13} color={T.textMuted} />
          <span style={{ fontSize: 12, color: T.textMuted }}>Deadline:</span>
          <DeadlineTimer deadline={assignment.deadline} />
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
          {[{ key: "file", icon: Upload, label: "Upload File" }, { key: "text", icon: FileText, label: "Text Answer" }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: "13px 0", border: "none", background: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              color: tab === t.key ? T.primary : T.textMuted,
              borderBottom: tab === t.key ? `2px solid ${T.primary}` : "2px solid transparent", transition: "all 0.2s"
            }}><t.icon size={14} strokeWidth={2} />{t.label}</button>
          ))}
        </div>
        {/* Body */}
        <div style={{ padding: 26 }}>
          {tab === "file" ? (
            <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
              onClick={() => fileRef.current.click()}
              style={{ border: `2px dashed ${dragOver ? T.primary : file ? "#4ade80" : T.border}`, borderRadius: 14, padding: "36px 20px", textAlign: "center", background: dragOver ? T.primaryLight : file ? "#f0fdf4" : T.bg, cursor: "pointer", transition: "all 0.2s" }}>
              <input ref={fileRef} type="file" style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} />
              {file ? (
                <div>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>📄</div>
                  <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 14 }}>{file.name}</p>
                  <p style={{ margin: "4px 0 10px", fontSize: 12, color: T.textMuted }}>{(file.size / 1024).toFixed(1)} KB</p>
                  <button onClick={e => { e.stopPropagation(); setFile(null); }} style={{ fontSize: 12, color: "#dc2626", background: "#fee2e2", border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>Remove</button>
                </div>
              ) : (
                <div>
                  <Upload size={34} color={T.primary} strokeWidth={1.5} style={{ marginBottom: 10 }} />
                  <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 14 }}>Drag & drop your file here</p>
                  <p style={{ margin: "5px 0 0", fontSize: 12, color: T.textMuted }}>or click to browse — PDF, DOC, images supported</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.text, display: "block", marginBottom: 7 }}>Your Answer</label>
              <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Write your answer here..." rows={7}
                style={{ width: "100%", padding: "12px 14px", fontSize: 13, border: `1.5px solid ${T.border}`, borderRadius: 10, outline: "none", resize: "vertical", fontFamily: "inherit", color: T.text, background: T.bg, boxSizing: "border-box", lineHeight: 1.75 }}
                onFocus={e => e.target.style.borderColor = T.primary} onBlur={e => e.target.style.borderColor = T.border} />
              <p style={{ fontSize: 11, color: T.textMuted, margin: "5px 0 0" }}>{text.trim().split(/\s+/).filter(Boolean).length} words</p>
            </div>
          )}
          {error && <p style={{ color: "#dc2626", fontSize: 12, margin: "10px 0 0", textAlign: "center" }}>{error}</p>}
          <button onClick={handleSubmit} disabled={submitting || !canSubmit} style={{
            marginTop: 14, width: "100%", padding: "13px 0",
            background: (!canSubmit || submitting) ? T.border : T.gradientCard,
            color: (!canSubmit || submitting) ? T.textMuted : "#fff",
            border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14,
            cursor: (!canSubmit || submitting) ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s"
          }}>
            {submitting
              ? <><span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Submitting...</>
              : <><Upload size={15} strokeWidth={2.5} />Submit Assignment</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── View Submission Modal ─────────────────────────────────────────────────────
function ViewModal({ assignment, onClose }) {
  const sub = assignment.submission;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: T.white, borderRadius: 20, width: "100%", maxWidth: 480, boxShadow: "0 24px 64px rgba(79,70,229,0.22)", overflow: "hidden", animation: "fadeUp 0.2s ease" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", padding: "20px 26px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.12em" }}>✓ Submitted</p>
            <p style={{ margin: "5px 0 0", fontWeight: 800, fontSize: 17 }}>{assignment.title}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", color: "#fff", display: "flex" }}><X size={17} /></button>
        </div>
        <div style={{ padding: 26 }}>
          {sub?.type === "file" ? (
            <div style={{ background: T.bg, borderRadius: 12, padding: 18, display: "flex", alignItems: "center", gap: 14, border: `1px solid ${T.border}` }}>
              <div style={{ width: 44, height: 44, background: "#dcfce7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📄</div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 14 }}>{sub.name}</p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: T.textMuted }}>{(sub.size / 1024).toFixed(1)} KB · File uploaded</p>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 9, textTransform: "uppercase", letterSpacing: "0.08em" }}>Your Answer</p>
              <div style={{ background: T.bg, borderRadius: 12, padding: 16, border: `1px solid ${T.border}`, fontSize: 13, color: T.text, lineHeight: 1.8, maxHeight: 220, overflowY: "auto" }}>{sub?.content}</div>
            </div>
          )}
          <button onClick={onClose} style={{ marginTop: 18, width: "100%", padding: "11px 0", background: T.bg, color: T.text, border: `1px solid ${T.border}`, borderRadius: 12, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Assignment Card ───────────────────────────────────────────────────────────
function AssignmentCard({ a, onUpload, onView, mark }) {
  const [hov, setHov] = useState(false);
  const isPast = new Date(a.deadline) < new Date();
  const g = mark ? grade(mark.marks, mark.maxMarks) : null;

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: T.white, borderRadius: T.radius, overflow: "hidden",
      border: `1.5px solid ${a.submitted ? "#bbf7d0" : isPast ? "#fecaca" : hov ? T.primary : T.border}`,
      boxShadow: hov ? T.shadowHover : T.shadow,
      transform: hov ? "translateY(-3px)" : "none",
      transition: "all 0.22s", display: "flex", flexDirection: "column"
    }}>
      {/* Color top bar */}
      <div style={{ height: 4, background: a.submitted ? "linear-gradient(90deg,#16a34a,#4ade80)" : isPast ? "linear-gradient(90deg,#dc2626,#f87171)" : T.gradientCard }} />

      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 11, flex: 1 }}>
        {/* Status row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: a.submitted ? "#dcfce7" : isPast ? "#fee2e2" : T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {a.submitted ? <CheckCircle size={18} color="#16a34a" strokeWidth={2} /> : isPast ? <AlertTriangle size={18} color="#dc2626" strokeWidth={2} /> : <ClipboardList size={18} color={T.primary} strokeWidth={1.8} />}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {g && <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 20, background: g.bg, color: g.color }}>{g.label} · {mark.marks}/{mark.maxMarks}</span>}
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: a.submitted ? "#dcfce7" : isPast ? "#fee2e2" : "#fef9c3", color: a.submitted ? "#15803d" : isPast ? "#dc2626" : "#854d0e" }}>
              {a.submitted ? "✓ Done" : isPast ? "Overdue" : "Pending"}
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 14, lineHeight: 1.35 }}>{a.title}</p>
          {a.course && <p style={{ margin: "3px 0 0", fontSize: 11, color: T.primary, fontWeight: 600 }}>{a.course}</p>}
        </div>

        <p style={{ margin: 0, fontSize: 12, color: T.textMuted, lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.description}</p>

        <DeadlineTimer deadline={a.deadline} />

        {/* Action */}
        {a.submitted ? (
          <button onClick={() => onView(a)} style={{ width: "100%", padding: "9px 0", borderRadius: 9, border: "1.5px solid #bbf7d0", background: "#f0fdf4", color: "#15803d", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#dcfce7"} onMouseLeave={e => e.currentTarget.style.background = "#f0fdf4"}>
            <Eye size={13} strokeWidth={2} /> View Submission
          </button>
        ) : (
          <button onClick={() => !isPast && onUpload(a)} disabled={isPast} style={{ width: "100%", padding: "9px 0", borderRadius: 9, border: "none", background: isPast ? T.bg : T.gradientCard, color: isPast ? T.textMuted : "#fff", fontWeight: 700, fontSize: 12, cursor: isPast ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "all 0.2s" }}>
            <Upload size={13} strokeWidth={2.5} />
            {isPast ? "Deadline Passed" : "Submit Assignment"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Course Card ───────────────────────────────────────────────────────────────
function CourseCard({ c }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: T.white, borderRadius: T.radius, overflow: "hidden",
      border: `1.5px solid ${hov ? T.primary : T.border}`,
      boxShadow: hov ? T.shadowHover : T.shadow,
      transform: hov ? "translateY(-3px)" : "none", transition: "all 0.22s"
    }}>
      <div style={{ height: 4, background: T.gradientCard }} />
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 46, height: 46, background: T.primaryLight, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{c.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 14, lineHeight: 1.3 }}>{c.title}</p>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: T.textMuted }}>👤 {c.instructor}</p>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: LEVEL[c.level].bg, color: LEVEL[c.level].color, flexShrink: 0 }}>{c.level}</span>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Progress</span>
            <span style={{ fontSize: 11, color: T.primary, fontWeight: 800 }}>{c.progress}%</span>
          </div>
          <div style={{ height: 6, background: T.border, borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${c.progress}%`, background: T.gradientCard, borderRadius: 99, transition: "width 0.6s ease" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Marks Tab Content ─────────────────────────────────────────────────────────
function MarksTab({ marks, assignments }) {
  if (marks.length === 0) return (
    <div style={{ textAlign: "center", padding: "64px 20px" }}>
      <Star size={48} color={T.border} strokeWidth={1.2} style={{ marginBottom: 14 }} />
      <p style={{ fontWeight: 700, fontSize: 16, color: T.text, margin: "0 0 6px" }}>No marks yet</p>
      <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>Your teacher hasn't graded any submissions yet.</p>
    </div>
  );

  const avg = (marks.reduce((a, m) => a + m.marks, 0) / marks.length).toFixed(1);
  const highest = Math.max(...marks.map(m => m.marks));
  const lowest = Math.min(...marks.map(m => m.marks));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Summary banner */}
      <div style={{ background: T.gradientCard, borderRadius: T.radius, padding: "22px 28px", color: "#fff", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 20 }}>
        {[
          { icon: Award,      label: "Graded",   value: marks.length },
          { icon: TrendingUp, label: "Average",  value: avg },
          { icon: Star,       label: "Highest",  value: highest },
          { icon: CheckCircle,label: "Lowest",   value: lowest },
        ].map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, background: "rgba(255,255,255,0.18)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon size={18} color="#fff" strokeWidth={1.8} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{s.value}</p>
              <p style={{ margin: "3px 0 0", fontSize: 10, opacity: 0.75, fontWeight: 600 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Marks table */}
      <div style={{ background: T.white, borderRadius: T.radius, border: `1px solid ${T.border}`, boxShadow: T.shadow, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: T.bg }}>
              {["Assignment", "Marks", "Out of", "Grade", "Progress"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "11px 20px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {marks.map(m => {
              const pct = Math.round((m.marks / m.maxMarks) * 100);
              const g = grade(m.marks, m.maxMarks);
              const asgn = assignments.find(a => a.id === m.assignmentId);
              return (
                <tr key={m.id} style={{ borderBottom: `1px solid ${T.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = T.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 20px" }}>
                    <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 13 }}>{asgn?.title || "Assignment"}</p>
                    {asgn?.course && <p style={{ margin: "2px 0 0", fontSize: 11, color: T.primary }}>{asgn.course}</p>}
                  </td>
                  <td style={{ padding: "14px 20px", fontWeight: 800, fontSize: 18, color: T.primary }}>{m.marks}</td>
                  <td style={{ padding: "14px 20px", color: T.textMuted, fontSize: 13 }}>{m.maxMarks}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, padding: "4px 12px", borderRadius: 20, background: g.bg, color: g.color }}>{g.label}</span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ flex: 1, height: 6, background: T.border, borderRadius: 99, overflow: "hidden", maxWidth: 100 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: T.gradientCard, borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.text, minWidth: 34 }}>{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assignments");
  const [uploadTarget, setUploadTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  async function load() {
    if (!userProfile?.email) return;
    setLoading(true);
    try {
      const [rawA, rawS, rawM] = await Promise.all([
        getAssignmentsForStudent(userProfile.email),
        getSubmissionsByStudent(userProfile.email),
        getMarksForStudent(userProfile.email),
      ]);
      setAssignments(rawA.map(a => {
        const sub = rawS.find(s => s.assignmentId === a.id);
        return { ...a, submitted: !!sub, submission: sub || null };
      }));
      setMarks(rawM);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => { load(); }, [userProfile?.email]);

  const pending   = assignments.filter(a => !a.submitted);
  const submitted = assignments.filter(a => a.submitted);
  const overdue   = pending.filter(a => new Date(a.deadline) < new Date());

  function handleSubmit(id, data) {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, submitted: true, submission: data } : a));
    setUploadTarget(null);
  }

  const initials = userProfile?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "S";

  const tabs = [
    { key: "assignments", icon: ClipboardList, label: "Assignments", count: pending.length },
    { key: "submitted",   icon: CheckCircle,   label: "Submitted",   count: submitted.length },
    { key: "marks",       icon: Star,          label: "My Marks",    count: marks.length },
    { key: "courses",     icon: BookOpen,       label: "Courses",     count: COURSES.length },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
      `}</style>

      {uploadTarget && <UploadModal assignment={uploadTarget} studentEmail={userProfile?.email} onClose={() => setUploadTarget(null)} onSubmit={handleSubmit} />}
      {viewTarget   && <ViewModal   assignment={viewTarget}   onClose={() => setViewTarget(null)} />}

      {/* ── Hero Header ── */}
      <div style={{ background: T.gradientHero, padding: `40px ${T.px} 36px`, color: "#fff" }}>
        <div style={{ maxWidth: T.maxWidth, margin: "0 auto" }}>
          {/* Profile row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, opacity: 0.7, letterSpacing: "0.12em", textTransform: "uppercase" }}>Student Portal</p>
              <h1 style={{ margin: "4px 0 2px", fontSize: 24, fontWeight: 800, lineHeight: 1.2 }}>{userProfile?.name || "Student"}</h1>
              <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>{userProfile?.email}</p>
            </div>
            <button onClick={load} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)", padding: "8px 16px", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}>
              <RefreshCw size={13} strokeWidth={2.5} /> Refresh
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
            {[
              { icon: BookOpen,    label: "Courses",   value: COURSES.length,    onClick: () => setActiveTab("courses") },
              { icon: Clock,       label: "Pending",   value: pending.length,    onClick: () => setActiveTab("assignments") },
              { icon: CheckCircle, label: "Submitted", value: submitted.length,  onClick: () => setActiveTab("submitted") },
              { icon: AlertTriangle, label: "Overdue", value: overdue.length,    onClick: () => setActiveTab("assignments") },
            ].map(s => (
              <div key={s.label} onClick={s.onClick} style={{ background: "rgba(255,255,255,0.14)", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}>
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
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: "15px 18px", fontSize: 13, fontWeight: 600, border: "none", background: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
              borderBottom: activeTab === t.key ? `2px solid ${T.primary}` : "2px solid transparent",
              color: activeTab === t.key ? T.primary : T.textMuted, transition: "all 0.2s"
            }}>
              <t.icon size={14} strokeWidth={2} />
              {t.label}
              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 20, background: activeTab === t.key ? T.primaryLight : T.bg, color: activeTab === t.key ? T.primary : T.textMuted }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: T.maxWidth, margin: "0 auto", padding: `32px ${T.px}` }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${T.border}`, borderTopColor: T.primary, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
            <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>Loading your data...</p>
          </div>
        ) : (
          <>
            {/* Assignments Tab */}
            {activeTab === "assignments" && (
              <div>
                {overdue.length > 0 && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "11px 16px", marginBottom: 22, fontSize: 13, color: "#dc2626", display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertTriangle size={15} strokeWidth={2} />
                    {overdue.length} overdue assignment{overdue.length > 1 ? "s" : ""} — submit as soon as possible.
                  </div>
                )}
                {pending.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "64px 20px" }}>
                    <CheckCircle size={48} color="#4ade80" strokeWidth={1.2} style={{ marginBottom: 14 }} />
                    <p style={{ fontWeight: 700, fontSize: 16, color: T.text, margin: "0 0 6px" }}>All caught up!</p>
                    <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>No pending assignments right now.</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                    {pending.map(a => {
                      const m = marks.find(mk => mk.assignmentId === a.id);
                      return <AssignmentCard key={a.id} a={a} onUpload={setUploadTarget} onView={setViewTarget} mark={m} />;
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Submitted Tab */}
            {activeTab === "submitted" && (
              submitted.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 20px" }}>
                  <Upload size={48} color={T.border} strokeWidth={1.2} style={{ marginBottom: 14 }} />
                  <p style={{ fontWeight: 700, fontSize: 16, color: T.text, margin: "0 0 6px" }}>No submissions yet</p>
                  <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>Submit your assignments from the Assignments tab.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                  {submitted.map(a => {
                    const m = marks.find(mk => mk.assignmentId === a.id);
                    return <AssignmentCard key={a.id} a={a} onUpload={setUploadTarget} onView={setViewTarget} mark={m} />;
                  })}
                </div>
              )
            )}

            {/* Marks Tab */}
            {activeTab === "marks" && <MarksTab marks={marks} assignments={assignments} />}

            {/* Courses Tab */}
            {activeTab === "courses" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                {COURSES.map(c => <CourseCard key={c.id} c={c} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
