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
  BookOpen, ClipboardList, CheckCircle, Clock, Upload, X,
  FileText, GraduationCap, Eye, Star, AlertTriangle,
  RefreshCw, PlayCircle, ChevronRight, Users, Lock, LogOut,
  TrendingUp, Award
} from "lucide-react";

// ── Static Data ───────────────────────────────────────────────────────────────
const COURSES = [
  {
    id: 1, title: "Introduction to Mathematics", instructor: "Dr. Smith",
    level: "Beginner", icon: "📐", progress: 72, students: 124, duration: "8 weeks",
    description: "Core mathematical concepts including algebra, geometry, and basic calculus.",
    topics: [
      { title: "Number Systems & Algebra",  done: true  },
      { title: "Linear Equations",          done: true  },
      { title: "Quadratic Equations",       done: true  },
      { title: "Geometry Basics",           done: false },
      { title: "Trigonometry Introduction", done: false },
      { title: "Statistics & Probability",  done: false },
    ],
  },
  {
    id: 2, title: "English Literature", instructor: "Ms. Johnson",
    level: "Intermediate", icon: "📖", progress: 55, students: 89, duration: "10 weeks",
    description: "Classic and modern literature, critical reading skills, and essay writing techniques.",
    topics: [
      { title: "Introduction to Literary Analysis", done: true  },
      { title: "Shakespeare — Hamlet",              done: true  },
      { title: "Poetry & Prose",                    done: false },
      { title: "Modern Fiction",                    done: false },
      { title: "Essay Writing Techniques",          done: false },
    ],
  },
  {
    id: 3, title: "Physics Fundamentals", instructor: "Mr. Lee",
    level: "Intermediate", icon: "⚛️", progress: 40, students: 76, duration: "12 weeks",
    description: "Fundamental laws of physics — mechanics, thermodynamics, waves, and electromagnetism.",
    topics: [
      { title: "Kinematics & Motion",  done: true  },
      { title: "Newton's Laws",        done: true  },
      { title: "Work, Energy & Power", done: false },
      { title: "Thermodynamics",       done: false },
      { title: "Waves & Sound",        done: false },
      { title: "Electromagnetism",     done: false },
    ],
  },
  {
    id: 4, title: "Computer Science Basics", instructor: "Dr. Patel",
    level: "Beginner", icon: "💻", progress: 88, students: 210, duration: "6 weeks",
    description: "Programming fundamentals, data structures, algorithms, and web development basics.",
    topics: [
      { title: "Introduction to Programming", done: true  },
      { title: "Variables & Data Types",      done: true  },
      { title: "Control Flow & Loops",        done: true  },
      { title: "Functions & Scope",           done: true  },
      { title: "Arrays & Objects",            done: true  },
      { title: "Web Development Basics",      done: false },
    ],
  },
];

const LEVEL = {
  Beginner:     { bg: "#dcfce7", color: "#15803d" },
  Intermediate: { bg: "#fef9c3", color: "#854d0e" },
  Advanced:     { bg: "#fee2e2", color: "#dc2626" },
};

function gradeOf(mark, max) {
  const p = (mark / max) * 100;
  if (p >= 90) return { label: "A+", color: "#15803d", bg: "#dcfce7" };
  if (p >= 80) return { label: "A",  color: "#16a34a", bg: "#f0fdf4" };
  if (p >= 70) return { label: "B",  color: "#0891b2", bg: "#ecfeff" };
  if (p >= 60) return { label: "C",  color: "#d97706", bg: "#fffbeb" };
  if (p >= 50) return { label: "D",  color: "#ea580c", bg: "#fff7ed" };
  return              { label: "F",  color: "#dc2626", bg: "#fef2f2" };
}

// ── Shared Modal Backdrop ─────────────────────────────────────────────────────
function Backdrop({ onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
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
      await submitAssignment(assignment.id, studentEmail, data, tab === "file" ? file : null);
      onSubmit(assignment.id, data);
    } catch { setError("Failed to submit. Please try again."); setSubmitting(false); }
  }

  const canSubmit = tab === "file" ? !!file : !!text.trim();

  return (
    <Backdrop onClose={onClose}>
      <div style={{ background: T.white, borderRadius: 20, width: "min(520px, 95vw)", boxShadow: "0 24px 64px rgba(79,70,229,0.22)", overflow: "hidden", animation: "fadeUp 0.2s ease" }}>
        {/* Header */}
        <div style={{ background: T.gradientCard, padding: "20px 24px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.12em" }}>Submit Assignment</p>
            <p style={{ margin: "5px 0 2px", fontWeight: 800, fontSize: 16 }}>{assignment.title}</p>
            {assignment.course && <p style={{ margin: 0, fontSize: 12, opacity: 0.75 }}>{assignment.course}</p>}
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", color: "#fff", display: "flex" }}><X size={16} /></button>
        </div>
        {/* Deadline */}
        <div style={{ padding: "10px 24px", background: T.bg, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 7 }}>
          <Clock size={13} color={T.textMuted} />
          <span style={{ fontSize: 12, color: T.textMuted }}>Deadline:</span>
          <DeadlineTimer deadline={assignment.deadline} />
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
          {[{ key: "file", icon: Upload, label: "Upload File" }, { key: "text", icon: FileText, label: "Text Answer" }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: "12px 0", border: "none", background: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              color: tab === t.key ? T.primary : T.textMuted,
              borderBottom: tab === t.key ? `2px solid ${T.primary}` : "2px solid transparent", transition: "all 0.2s"
            }}><t.icon size={14} strokeWidth={2} />{t.label}</button>
          ))}
        </div>
        {/* Body */}
        <div style={{ padding: 24 }}>
          {tab === "file" ? (
            <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
              onClick={() => fileRef.current.click()}
              style={{ border: `2px dashed ${dragOver ? T.primary : file ? "#4ade80" : T.border}`, borderRadius: 14, padding: "36px 20px", textAlign: "center", background: dragOver ? T.primaryLight : file ? "#f0fdf4" : T.bg, cursor: "pointer", transition: "all 0.2s" }}>
              <input ref={fileRef} type="file" style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} />
              {file ? (
                <div>
                  <div style={{ fontSize: 38, marginBottom: 8 }}>📄</div>
                  <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 14 }}>{file.name}</p>
                  <p style={{ margin: "4px 0 10px", fontSize: 12, color: T.textMuted }}>{(file.size / 1024).toFixed(1)} KB</p>
                  <button onClick={e => { e.stopPropagation(); setFile(null); }} style={{ fontSize: 12, color: "#dc2626", background: "#fee2e2", border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>Remove</button>
                </div>
              ) : (
                <div>
                  <Upload size={32} color={T.primary} strokeWidth={1.5} style={{ marginBottom: 10 }} />
                  <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 14 }}>Drag & drop your file here</p>
                  <p style={{ margin: "5px 0 0", fontSize: 12, color: T.textMuted }}>or click to browse — PDF, DOC, images supported</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.text, display: "block", marginBottom: 7 }}>Your Answer</label>
              <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Write your answer here..." rows={6}
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
    </Backdrop>
  );
}

// ── View Submission Modal ─────────────────────────────────────────────────────
function ViewModal({ assignment, onClose }) {
  const sub = assignment.submission;
  return (
    <Backdrop onClose={onClose}>
      <div style={{ background: T.white, borderRadius: 20, width: "min(480px, 95vw)", boxShadow: "0 24px 64px rgba(79,70,229,0.22)", overflow: "hidden", animation: "fadeUp 0.2s ease" }}>
        <div style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", padding: "20px 24px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.12em" }}>✓ Submitted</p>
            <p style={{ margin: "5px 0 0", fontWeight: 800, fontSize: 16 }}>{assignment.title}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", color: "#fff", display: "flex" }}><X size={16} /></button>
        </div>
        <div style={{ padding: 24 }}>
          {sub?.url && sub?.fileType?.startsWith("image/") && (
            <div style={{ marginBottom: 14, borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}` }}>
              <img src={sub.url} alt={sub.name} style={{ width: "100%", maxHeight: 260, objectFit: "contain", background: T.bg, display: "block" }} />
            </div>
          )}
          {sub?.type === "file" || sub?.name ? (
            <div style={{ background: T.bg, borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 14, border: `1px solid ${T.border}` }}>
              <div style={{ width: 42, height: 42, background: "#dcfce7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📄</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub.name || "File uploaded"}</p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: T.textMuted }}>{sub.size ? `${(sub.size / 1024).toFixed(1)} KB · ` : ""}File submission</p>
              </div>
              {sub?.url && (
                <a href={sub.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 700, color: T.primary, background: T.primaryLight, border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", textDecoration: "none", flexShrink: 0 }}>Open</a>
              )}
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 9, textTransform: "uppercase", letterSpacing: "0.08em" }}>Your Answer</p>
              <div style={{ background: T.bg, borderRadius: 12, padding: 16, border: `1px solid ${T.border}`, fontSize: 13, color: T.text, lineHeight: 1.8, maxHeight: 220, overflowY: "auto", whiteSpace: "pre-wrap" }}>{sub?.content || "—"}</div>
            </div>
          )}
          <button onClick={onClose} style={{ marginTop: 16, width: "100%", padding: "11px 0", background: T.bg, color: T.text, border: `1px solid ${T.border}`, borderRadius: 12, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Close</button>
        </div>
      </div>
    </Backdrop>
  );
}

// ── Course Modal ──────────────────────────────────────────────────────────────
function CourseModal({ c, onClose }) {
  const done = c.topics?.filter(t => t.done).length || 0;
  const total = c.topics?.length || 0;
  const pct = total ? Math.round((done / total) * 100) : c.progress;

  return (
    <Backdrop onClose={onClose}>
      <div style={{ background: T.white, borderRadius: 20, width: "min(540px, 95vw)", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(79,70,229,0.22)", overflow: "hidden", animation: "fadeUp 0.2s ease" }}>
        <div style={{ background: T.gradientCard, padding: "20px 24px", color: "#fff", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 50, height: 50, background: "rgba(255,255,255,0.2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{c.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Course</p>
                <p style={{ margin: "4px 0 2px", fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>{c.title}</p>
                <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>👤 {c.instructor}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", color: "#fff", display: "flex", flexShrink: 0 }}><X size={16} /></button>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
            {c.students && <span style={{ fontSize: 12, opacity: 0.85, display: "flex", alignItems: "center", gap: 5 }}><Users size={13} strokeWidth={2} />{c.students} students</span>}
            {c.duration && <span style={{ fontSize: 12, opacity: 0.85, display: "flex", alignItems: "center", gap: 5 }}><Clock size={13} strokeWidth={2} />{c.duration}</span>}
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "rgba(255,255,255,0.2)" }}>{c.level}</span>
          </div>
        </div>

        <div style={{ overflowY: "auto", flex: 1 }}>
          <div style={{ padding: "14px 24px", borderBottom: `1px solid ${T.border}`, background: T.bg }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Your Progress</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.primary }}>{pct}%{total > 0 ? ` — ${done}/${total}` : ""}</span>
            </div>
            <div style={{ height: 8, background: T.border, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: T.gradientCard, borderRadius: 99 }} />
            </div>
          </div>

          {c.description && (
            <div style={{ padding: "14px 24px", borderBottom: `1px solid ${T.border}` }}>
              <p style={{ margin: "0 0 5px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>About</p>
              <p style={{ margin: 0, fontSize: 13, color: T.text, lineHeight: 1.75 }}>{c.description}</p>
            </div>
          )}

          {c.topics?.length > 0 && (
            <div style={{ padding: "14px 24px" }}>
              <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Topics</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {c.topics.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: t.done ? "#f0fdf4" : T.bg, border: `1px solid ${t.done ? "#bbf7d0" : T.border}` }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: t.done ? "#dcfce7" : T.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {t.done ? <CheckCircle size={13} color="#16a34a" strokeWidth={2.5} /> : <Lock size={11} color={T.textMuted} strokeWidth={2} />}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: t.done ? 600 : 500, color: t.done ? T.text : T.textMuted, flex: 1 }}>{i + 1}. {t.title}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: t.done ? "#dcfce7" : T.border, color: t.done ? "#15803d" : T.textMuted }}>
                      {t.done ? "Done" : "Upcoming"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "12px 24px", borderTop: `1px solid ${T.border}`, background: T.bg, flexShrink: 0 }}>
          <button onClick={onClose} style={{ width: "100%", padding: "12px 0", background: T.gradientCard, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <PlayCircle size={15} strokeWidth={2} /> Continue Learning
          </button>
        </div>
      </div>
    </Backdrop>
  );
}

// ── Assignment Card ───────────────────────────────────────────────────────────
function AssignmentCard({ a, onUpload, onView, mark }) {
  const [hov, setHov] = useState(false);
  const isPast = new Date(a.deadline) < new Date();
  const g = mark ? gradeOf(mark.marks, mark.maxMarks) : null;

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: T.white, borderRadius: T.radius, overflow: "hidden",
      border: `1.5px solid ${a.submitted ? "#bbf7d0" : isPast ? "#fecaca" : hov ? T.primary : T.border}`,
      boxShadow: hov ? T.shadowHover : T.shadow,
      transform: hov ? "translateY(-3px)" : "none",
      transition: "all 0.22s", display: "flex", flexDirection: "column"
    }}>
      <div style={{ height: 3, background: a.submitted ? "linear-gradient(90deg,#16a34a,#4ade80)" : isPast ? "linear-gradient(90deg,#dc2626,#f87171)" : T.gradientCard }} />
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {/* Status row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: a.submitted ? "#dcfce7" : isPast ? "#fee2e2" : T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {a.submitted ? <CheckCircle size={17} color="#16a34a" strokeWidth={2} /> : isPast ? <AlertTriangle size={17} color="#dc2626" strokeWidth={2} /> : <ClipboardList size={17} color={T.primary} strokeWidth={1.8} />}
          </div>
          <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            {g && <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: g.bg, color: g.color }}>{g.label} · {mark.marks}/{mark.maxMarks}</span>}
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: a.submitted ? "#dcfce7" : isPast ? "#fee2e2" : "#fef9c3", color: a.submitted ? "#15803d" : isPast ? "#dc2626" : "#854d0e" }}>
              {a.submitted ? "✓ Done" : isPast ? "Overdue" : "Pending"}
            </span>
          </div>
        </div>

        <div>
          <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 14, lineHeight: 1.35 }}>{a.title}</p>
          {a.course && <p style={{ margin: "3px 0 0", fontSize: 11, color: T.primary, fontWeight: 600 }}>{a.course}</p>}
        </div>

        <p style={{ margin: 0, fontSize: 12, color: T.textMuted, lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.description}</p>

        <DeadlineTimer deadline={a.deadline} />

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
function CourseCard({ c, onClick }) {
  const [hov, setHov] = useState(false);
  const done = c.topics?.filter(t => t.done).length || 0;
  const total = c.topics?.length || 0;

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick} style={{
      background: T.white, borderRadius: T.radius, overflow: "hidden",
      border: `1.5px solid ${hov ? T.primary : T.border}`,
      boxShadow: hov ? T.shadowHover : T.shadow,
      transform: hov ? "translateY(-3px)" : "none",
      transition: "all 0.22s", cursor: "pointer"
    }}>
      <div style={{ height: 3, background: T.gradientCard }} />
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, background: T.primaryLight, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{c.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 14, lineHeight: 1.3 }}>{c.title}</p>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: T.textMuted }}>👤 {c.instructor}</p>
          </div>
          <ChevronRight size={15} color={hov ? T.primary : T.textMuted} strokeWidth={2} style={{ flexShrink: 0, transition: "color 0.2s" }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: LEVEL[c.level]?.bg || T.bg, color: LEVEL[c.level]?.color || T.textMuted }}>{c.level}</span>
          {total > 0 && <span style={{ fontSize: 11, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={11} color="#16a34a" strokeWidth={2.5} />{done}/{total}</span>}
          {c.students && <span style={{ fontSize: 11, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}><Users size={11} strokeWidth={2} />{c.students}</span>}
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Progress</span>
            <span style={{ fontSize: 11, color: T.primary, fontWeight: 800 }}>{c.progress}%</span>
          </div>
          <div style={{ height: 5, background: T.border, borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${c.progress}%`, background: T.gradientCard, borderRadius: 99, transition: "width 0.6s ease" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Marks Tab ─────────────────────────────────────────────────────────────────
function MarksSection({ marks, assignments }) {
  if (marks.length === 0) return (
    <div style={{ textAlign: "center", padding: "64px 20px" }}>
      <Star size={44} color={T.border} strokeWidth={1.2} style={{ marginBottom: 14 }} />
      <p style={{ fontWeight: 700, fontSize: 15, color: T.text, margin: "0 0 6px" }}>No marks yet</p>
      <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>Your teacher hasn't graded any submissions yet.</p>
    </div>
  );

  const avg = (marks.reduce((a, m) => a + m.marks, 0) / marks.length).toFixed(1);
  const highest = Math.max(...marks.map(m => m.marks));
  const lowest = Math.min(...marks.map(m => m.marks));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Summary */}
      <div style={{ background: T.gradientCard, borderRadius: T.radius, padding: "20px 24px", color: "#fff", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 16 }}>
        {[
          { icon: Award,      label: "Graded",  value: marks.length },
          { icon: TrendingUp, label: "Average", value: avg },
          { icon: Star,       label: "Highest", value: highest },
          { icon: CheckCircle,label: "Lowest",  value: lowest },
        ].map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.18)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon size={17} color="#fff" strokeWidth={1.8} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{s.value}</p>
              <p style={{ margin: "3px 0 0", fontSize: 10, opacity: 0.75, fontWeight: 600 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: T.white, borderRadius: T.radius, border: `1px solid ${T.border}`, boxShadow: T.shadow, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: T.bg }}>
                {["Assignment", "Marks", "Out of", "Grade", "Progress"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "11px 18px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {marks.map(m => {
                const pct = Math.round((m.marks / m.maxMarks) * 100);
                const g = gradeOf(m.marks, m.maxMarks);
                const asgn = assignments.find(a => a.id === m.assignmentId);
                return (
                  <tr key={m.id} style={{ borderBottom: `1px solid ${T.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = T.bg}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "13px 18px" }}>
                      <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 13 }}>{asgn?.title || "Assignment"}</p>
                      {asgn?.course && <p style={{ margin: "2px 0 0", fontSize: 11, color: T.primary }}>{asgn.course}</p>}
                    </td>
                    <td style={{ padding: "13px 18px", fontWeight: 800, fontSize: 17, color: T.primary }}>{m.marks}</td>
                    <td style={{ padding: "13px 18px", color: T.textMuted }}>{m.maxMarks}</td>
                    <td style={{ padding: "13px 18px" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, padding: "4px 11px", borderRadius: 20, background: g.bg, color: g.color }}>{g.label}</span>
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 5, background: T.border, borderRadius: 99, overflow: "hidden", maxWidth: 90 }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: T.gradientCard, borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: T.text, minWidth: 32 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
  const [courseTarget, setCourseTarget] = useState(null);

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
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
      `}</style>

      {uploadTarget && <UploadModal assignment={uploadTarget} studentEmail={userProfile?.email} onClose={() => setUploadTarget(null)} onSubmit={handleSubmit} />}
      {viewTarget   && <ViewModal   assignment={viewTarget}   onClose={() => setViewTarget(null)} />}
      {courseTarget && <CourseModal c={courseTarget}          onClose={() => setCourseTarget(null)} />}

      {/* ── Hero Header ── */}
      <div style={{ background: T.gradientHero, padding: `40px ${T.px} 36px`, color: "#fff" }}>
        <div style={{ maxWidth: T.maxWidth, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, flexShrink: 0 }}>{initials}</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, opacity: 0.7, letterSpacing: "0.12em", textTransform: "uppercase" }}>Student Portal</p>
              <h1 style={{ margin: "4px 0 2px", fontSize: 24, fontWeight: 800, lineHeight: 1.2 }}>{userProfile?.name || "Student"}</h1>
              <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>{userProfile?.email}</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={load} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)", padding: "8px 14px", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}>
                <RefreshCw size={13} strokeWidth={2.5} /> Refresh
              </button>
              <button onClick={async () => { try { await logout(); navigate("/login"); } catch(e){} }} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)", padding: "8px 14px", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}>
                <LogOut size={13} strokeWidth={2} /> Logout
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
            {[
              { icon: BookOpen,      label: "Courses",   value: COURSES.length,   tab: "courses" },
              { icon: Clock,         label: "Pending",   value: pending.length,   tab: "assignments" },
              { icon: CheckCircle,   label: "Submitted", value: submitted.length, tab: "submitted" },
              { icon: AlertTriangle, label: "Overdue",   value: overdue.length,   tab: "assignments" },
            ].map(s => (
              <div key={s.label} onClick={() => setActiveTab(s.tab)} style={{ background: "rgba(255,255,255,0.14)", borderRadius: 12, padding: "13px 15px", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}>
                <s.icon size={15} color="rgba(255,255,255,0.75)" strokeWidth={1.8} style={{ marginBottom: 7 }} />
                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{s.value}</p>
                <p style={{ margin: "4px 0 0", fontSize: 10, opacity: 0.7, fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ background: T.white, borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100, boxShadow: T.shadow }}>
        <div style={{ maxWidth: T.maxWidth, margin: "0 auto", padding: `0 ${T.px}`, display: "flex", overflowX: "auto" }} className="tab-bar">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: "14px 16px", fontSize: 13, fontWeight: 600, border: "none", background: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
              borderBottom: activeTab === t.key ? `2px solid ${T.primary}` : "2px solid transparent",
              color: activeTab === t.key ? T.primary : T.textMuted, transition: "all 0.2s"
            }}>
              <t.icon size={14} strokeWidth={2} />
              {t.label}
              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 20, background: activeTab === t.key ? T.primaryLight : T.bg, color: activeTab === t.key ? T.primary : T.textMuted }}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: T.maxWidth, margin: "0 auto", padding: `28px ${T.px}` }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: 34, height: 34, border: `3px solid ${T.border}`, borderTopColor: T.primary, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
            <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>Loading your data...</p>
          </div>
        ) : (
          <>
            {/* Assignments */}
            {activeTab === "assignments" && (
              <div>
                {overdue.length > 0 && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "11px 16px", marginBottom: 20, fontSize: 13, color: "#dc2626", display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertTriangle size={14} strokeWidth={2} />
                    {overdue.length} overdue assignment{overdue.length > 1 ? "s" : ""} — submit as soon as possible.
                  </div>
                )}
                {pending.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "64px 20px" }}>
                    <CheckCircle size={44} color="#4ade80" strokeWidth={1.2} style={{ marginBottom: 14 }} />
                    <p style={{ fontWeight: 700, fontSize: 15, color: T.text, margin: "0 0 6px" }}>All caught up!</p>
                    <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>No pending assignments right now.</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
                    {pending.map(a => <AssignmentCard key={a.id} a={a} onUpload={setUploadTarget} onView={setViewTarget} mark={marks.find(m => m.assignmentId === a.id)} />)}
                  </div>
                )}
              </div>
            )}

            {/* Submitted */}
            {activeTab === "submitted" && (
              submitted.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 20px" }}>
                  <Upload size={44} color={T.border} strokeWidth={1.2} style={{ marginBottom: 14 }} />
                  <p style={{ fontWeight: 700, fontSize: 15, color: T.text, margin: "0 0 6px" }}>No submissions yet</p>
                  <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>Submit your assignments from the Assignments tab.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
                  {submitted.map(a => <AssignmentCard key={a.id} a={a} onUpload={setUploadTarget} onView={setViewTarget} mark={marks.find(m => m.assignmentId === a.id)} />)}
                </div>
              )
            )}

            {/* Marks */}
            {activeTab === "marks" && <MarksSection marks={marks} assignments={assignments} />}

            {/* Courses */}
            {activeTab === "courses" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
                {COURSES.map(c => <CourseCard key={c.id} c={c} onClick={() => setCourseTarget(c)} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
