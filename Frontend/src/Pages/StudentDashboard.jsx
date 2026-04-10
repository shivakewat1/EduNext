import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { T } from "../theme";
import DeadlineTimer from "../Components/DeadlineTimer";
import { getAssignmentsForStudent, getSubmissionsByStudent, submitAssignment, getMarksForStudent } from "../services/assignments";
import {
  BookOpen, ClipboardList, CheckCircle, Clock, Upload,
  X, FileText, GraduationCap, Eye, Star, Award,
  TrendingUp, AlertTriangle, RefreshCw, PlayCircle,
  ChevronRight, Users, BarChart2, Lock, LogOut
} from "lucide-react";

const MOCK_COURSES = [
  {
    id: 1, title: "Introduction to Mathematics", instructor: "Dr. Smith",
    level: "Beginner", icon: "📐", progress: 72,
    description: "A comprehensive introduction to core mathematical concepts including algebra, geometry, and basic calculus.",
    students: 124, duration: "8 weeks",
    topics: [
      { title: "Number Systems & Algebra",       done: true  },
      { title: "Linear Equations",               done: true  },
      { title: "Quadratic Equations",            done: true  },
      { title: "Geometry Basics",                done: false },
      { title: "Trigonometry Introduction",      done: false },
      { title: "Statistics & Probability",       done: false },
    ],
  },
  {
    id: 2, title: "English Literature", instructor: "Ms. Johnson",
    level: "Intermediate", icon: "📖", progress: 55,
    description: "Explore classic and modern literature, develop critical reading skills, and learn essay writing techniques.",
    students: 89, duration: "10 weeks",
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
    level: "Intermediate", icon: "⚛️", progress: 40,
    description: "Study the fundamental laws of physics — mechanics, thermodynamics, waves, and electromagnetism.",
    students: 76, duration: "12 weeks",
    topics: [
      { title: "Kinematics & Motion",        done: true  },
      { title: "Newton's Laws",              done: true  },
      { title: "Work, Energy & Power",       done: false },
      { title: "Thermodynamics",             done: false },
      { title: "Waves & Sound",              done: false },
      { title: "Electromagnetism",           done: false },
    ],
  },
  {
    id: 4, title: "Computer Science Basics", instructor: "Dr. Patel",
    level: "Beginner", icon: "💻", progress: 88,
    description: "Learn programming fundamentals, data structures, algorithms, and web development basics.",
    students: 210, duration: "6 weeks",
    topics: [
      { title: "Introduction to Programming",  done: true  },
      { title: "Variables & Data Types",       done: true  },
      { title: "Control Flow & Loops",         done: true  },
      { title: "Functions & Scope",            done: true  },
      { title: "Arrays & Objects",             done: true  },
      { title: "Web Development Basics",       done: false },
    ],
  },
];

const LEVEL_STYLE = {
  Beginner:     { bg: "#dcfce7", color: "#15803d" },
  Intermediate: { bg: "#fef9c3", color: "#854d0e" },
  Advanced:     { bg: "#fee2e2", color: "#dc2626" },
};

// ── Upload Modal ──────────────────────────────────────────────────────────────

function UploadModal({ assignment, studentEmail, onClose, onSubmit }) {
  const [tab, setTab] = useState("file"); // "file" | "text"
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }

  async function handleSubmit() {
    if (tab === "file" && !file) return;
    if (tab === "text" && !text.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const submissionData = tab === "file"
        ? { type: "file", name: file.name, size: file.size }
        : { type: "text", content: text };
      await submitAssignment(assignment.id, studentEmail, submissionData);
      onSubmit(assignment.id, submissionData);
    } catch (e) {
      setError("Failed to submit. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }} onClick={onClose}>
      <div style={{
        background: T.white, borderRadius: 20, width: "100%", maxWidth: 520,
        boxShadow: "0 24px 64px rgba(79,70,229,0.2)", overflow: "hidden"
      }} onClick={e => e.stopPropagation()}>

        {/* Modal Header */}
        <div style={{ background: T.gradientCard, padding: "22px 28px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.1em" }}>Submit Assignment</p>
            <p style={{ margin: "6px 0 0", fontWeight: 800, fontSize: 16 }}>{assignment.title}</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.8 }}>{assignment.course}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "#fff", display: "flex" }}>
            <X size={18} />
          </button>
        </div>

        {/* Deadline */}
        <div style={{ padding: "14px 28px", background: T.bg, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={14} color={T.textMuted} />
          <span style={{ fontSize: 12, color: T.textMuted }}>Deadline:</span>
          <DeadlineTimer deadline={assignment.deadline} />
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
          {[
            { key: "file", icon: Upload, label: "Upload File" },
            { key: "text", icon: FileText, label: "Text Answer" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: "14px 0", border: "none", background: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              color: tab === t.key ? T.primary : T.textMuted,
              borderBottom: tab === t.key ? `2px solid ${T.primary}` : "2px solid transparent",
              transition: "all 0.2s"
            }}>
              <t.icon size={15} strokeWidth={2} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: 28 }}>
          {tab === "file" ? (
            <div>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current.click()}
                style={{
                  border: `2px dashed ${dragOver ? T.primary : file ? "#4ade80" : T.border}`,
                  borderRadius: 14, padding: "40px 20px", textAlign: "center",
                  background: dragOver ? T.primaryLight : file ? "#f0fdf4" : T.bg,
                  cursor: "pointer", transition: "all 0.2s"
                }}
              >
                <input ref={fileRef} type="file" style={{ display: "none" }}
                  onChange={e => setFile(e.target.files[0])} />
                {file ? (
                  <div>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
                    <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 14 }}>{file.name}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: T.textMuted }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <button onClick={e => { e.stopPropagation(); setFile(null); }} style={{
                      marginTop: 12, fontSize: 12, color: "#c62828", background: "#fde8e8",
                      border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer"
                    }}>Remove</button>
                  </div>
                ) : (
                  <div>
                    <Upload size={36} color={T.primary} strokeWidth={1.5} style={{ marginBottom: 12 }} />
                    <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 14 }}>
                      Drag & drop your file here
                    </p>
                    <p style={{ margin: "6px 0 0", fontSize: 12, color: T.textMuted }}>
                      or click to browse — PDF, DOC, DOCX, images supported
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.text, display: "block", marginBottom: 8 }}>
                Your Answer
              </label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Write your answer here..."
                rows={7}
                style={{
                  width: "100%", padding: "12px 14px", fontSize: 13,
                  border: `1.5px solid ${T.border}`, borderRadius: 10,
                  outline: "none", resize: "vertical", fontFamily: "inherit",
                  color: T.text, background: T.bg, boxSizing: "border-box", lineHeight: 1.7
                }}
                onFocus={e => e.target.style.borderColor = T.primary}
                onBlur={e => e.target.style.borderColor = T.border}
              />
              <p style={{ fontSize: 11, color: T.textMuted, margin: "6px 0 0" }}>
                {text.trim().split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
          )}

          {error && (
            <p style={{ color: "#dc2626", fontSize: 12, margin: "12px 0 0", textAlign: "center" }}>{error}</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting || (tab === "file" ? !file : !text.trim())}
            style={{
              marginTop: 12, width: "100%", padding: "13px 0",
              background: submitting || (tab === "file" ? !file : !text.trim()) ? T.border : T.gradientCard,
              color: submitting || (tab === "file" ? !file : !text.trim()) ? T.textMuted : "#fff",
              border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14,
              cursor: submitting || (tab === "file" ? !file : !text.trim()) ? "not-allowed" : "pointer",
              transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}
          >
            {submitting ? (
              <>
                <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                Submitting...
              </>
            ) : (
              <><Upload size={16} strokeWidth={2.5} /> Submit Assignment</>
            )}
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
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }} onClick={onClose}>
      <div style={{
        background: T.white, borderRadius: 20, width: "100%", maxWidth: 480,
        boxShadow: "0 24px 64px rgba(79,70,229,0.2)", overflow: "hidden"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", padding: "22px 28px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.1em" }}>✓ Submitted</p>
            <p style={{ margin: "6px 0 0", fontWeight: 800, fontSize: 16 }}>{assignment.title}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "#fff", display: "flex" }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: 28 }}>
          {sub?.type === "file" ? (
            <div style={{ background: T.bg, borderRadius: 12, padding: 20, display: "flex", alignItems: "center", gap: 14, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 36 }}>📄</div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 14 }}>{sub.name}</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: T.textMuted }}>{(sub.size / 1024).toFixed(1)} KB · File uploaded</p>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Your Answer</p>
              <div style={{ background: T.bg, borderRadius: 12, padding: 18, border: `1px solid ${T.border}`, fontSize: 13, color: T.text, lineHeight: 1.75 }}>
                {sub?.content}
              </div>
            </div>
          )}
          <button onClick={onClose} style={{
            marginTop: 20, width: "100%", padding: "12px 0", background: T.bg,
            color: T.text, border: `1px solid ${T.border}`, borderRadius: 12,
            fontWeight: 600, fontSize: 13, cursor: "pointer"
          }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Assignment Card ───────────────────────────────────────────────────────────

function AssignmentCard({ a, onUpload, onView }) {
  const [hov, setHov] = useState(false);
  const isPast = new Date(a.deadline) < new Date();

  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: T.white, borderRadius: T.radius, padding: 22,
        border: `1.5px solid ${a.submitted ? "#bbf7d0" : isPast ? "#fecaca" : hov ? T.primary : T.border}`,
        boxShadow: hov ? T.shadowHover : T.shadow,
        transform: hov ? "translateY(-3px)" : "none",
        transition: "all 0.22s", display: "flex", flexDirection: "column", gap: 12
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: a.submitted ? "#dcfce7" : isPast ? "#fee2e2" : T.primaryLight,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          {a.submitted
            ? <CheckCircle size={20} color="#16a34a" strokeWidth={2} />
            : isPast
              ? <Clock size={20} color="#dc2626" strokeWidth={2} />
              : <ClipboardList size={20} color={T.primary} strokeWidth={1.8} />
          }
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, flexShrink: 0,
          background: a.submitted ? "#dcfce7" : isPast ? "#fee2e2" : "#fef9c3",
          color: a.submitted ? "#15803d" : isPast ? "#dc2626" : "#854d0e"
        }}>
          {a.submitted ? "✓ Submitted" : isPast ? "Overdue" : "Pending"}
        </span>
      </div>

      {/* Title & course */}
      <div>
        <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 14, lineHeight: 1.4 }}>{a.title}</p>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: T.primary, fontWeight: 600 }}>{a.course}</p>
      </div>

      <p style={{ margin: 0, fontSize: 12, color: T.textMuted, lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {a.description}
      </p>

      <DeadlineTimer deadline={a.deadline} />

      {/* Action button */}
      {a.submitted ? (
        <button onClick={() => onView(a)}
          style={{
            width: "100%", padding: "10px 0", borderRadius: 10, border: `1.5px solid #bbf7d0`,
            background: "#f0fdf4", color: "#15803d", fontWeight: 700, fontSize: 12,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#dcfce7"}
          onMouseLeave={e => e.currentTarget.style.background = "#f0fdf4"}
        >
          <Eye size={14} strokeWidth={2} /> View Submission
        </button>
      ) : (
        <button onClick={() => onUpload(a)}
          disabled={isPast}
          style={{
            width: "100%", padding: "10px 0", borderRadius: 10, border: "none",
            background: isPast ? T.border : T.gradientCard,
            color: isPast ? T.textMuted : "#fff",
            fontWeight: 700, fontSize: 12, cursor: isPast ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "all 0.2s"
          }}
        >
          <Upload size={14} strokeWidth={2.5} />
          {isPast ? "Deadline Passed" : "Submit Assignment"}
        </button>
      )}
    </div>
  );
}

// ── Course Modal ──────────────────────────────────────────────────────────────
function CourseModal({ c, onClose }) {
  const done = c.topics ? c.topics.filter(t => t.done).length : 0;
  const total = c.topics ? c.topics.length : 0;
  const pct = total ? Math.round((done / total) * 100) : c.progress;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: T.white, borderRadius: 20, width: "100%", maxWidth: 540, boxShadow: "0 24px 64px rgba(79,70,229,0.22)", overflow: "hidden", animation: "fadeUp 0.2s ease", maxHeight: "90vh", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: T.gradientCard, padding: "22px 26px", color: "#fff", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, background: "rgba(255,255,255,0.2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{c.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Course</p>
                <p style={{ margin: "4px 0 2px", fontWeight: 800, fontSize: 17, lineHeight: 1.2 }}>{c.title}</p>
                <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>👤 {c.instructor}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", color: "#fff", display: "flex", flexShrink: 0 }}><X size={17} /></button>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
            {c.students && <span style={{ fontSize: 12, opacity: 0.85, display: "flex", alignItems: "center", gap: 5 }}><Users size={13} strokeWidth={2} />{c.students} students</span>}
            {c.duration && <span style={{ fontSize: 12, opacity: 0.85, display: "flex", alignItems: "center", gap: 5 }}><Clock size={13} strokeWidth={2} />{c.duration}</span>}
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "rgba(255,255,255,0.2)" }}>{c.level}</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {/* Progress */}
          <div style={{ padding: "16px 26px", borderBottom: `1px solid ${T.border}`, background: T.bg }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Your Progress</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.primary }}>{pct}%{total > 0 ? ` — ${done}/${total} topics` : ""}</span>
            </div>
            <div style={{ height: 8, background: T.border, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: T.gradientCard, borderRadius: 99 }} />
            </div>
          </div>

          {/* Description */}
          {c.description && (
            <div style={{ padding: "16px 26px", borderBottom: `1px solid ${T.border}` }}>
              <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>About</p>
              <p style={{ margin: 0, fontSize: 13, color: T.text, lineHeight: 1.75 }}>{c.description}</p>
            </div>
          )}

          {/* Topics */}
          {c.topics && c.topics.length > 0 && (
            <div style={{ padding: "16px 26px" }}>
              <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Course Topics</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {c.topics.map((topic, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, background: topic.done ? "#f0fdf4" : T.bg, border: `1px solid ${topic.done ? "#bbf7d0" : T.border}` }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: topic.done ? "#dcfce7" : T.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {topic.done ? <CheckCircle size={14} color="#16a34a" strokeWidth={2.5} /> : <Lock size={12} color={T.textMuted} strokeWidth={2} />}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: topic.done ? 600 : 500, color: topic.done ? T.text : T.textMuted, flex: 1 }}>{i + 1}. {topic.title}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: topic.done ? "#dcfce7" : T.border, color: topic.done ? "#15803d" : T.textMuted }}>
                      {topic.done ? "Done" : "Upcoming"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 26px", borderTop: `1px solid ${T.border}`, background: T.bg, flexShrink: 0 }}>
          <button onClick={onClose} style={{ width: "100%", padding: "12px 0", background: T.gradientCard, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <PlayCircle size={16} strokeWidth={2} /> Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Course Card ───────────────────────────────────────────────────────────────

function CourseCard({ c, onClick }) {
  const [hov, setHov] = useState(false);
  const done = c.topics ? c.topics.filter(t => t.done).length : 0;
  const total = c.topics ? c.topics.length : 0;

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onClick} style={{
        background: T.white, borderRadius: T.radius, overflow: "hidden",
        border: `1.5px solid ${hov ? T.primary : T.border}`,
        boxShadow: hov ? T.shadowHover : T.shadow,
        transform: hov ? "translateY(-3px)" : "none",
        transition: "all 0.22s", cursor: "pointer"
      }}>
      <div style={{ height: 4, background: T.gradientCard }} />
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 46, height: 46, background: T.primaryLight, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
            {c.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 14, lineHeight: 1.3 }}>{c.title}</p>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: T.textMuted }}>👤 {c.instructor}</p>
          </div>
          <ChevronRight size={16} color={hov ? T.primary : T.textMuted} strokeWidth={2} style={{ flexShrink: 0, transition: "color 0.2s" }} />
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: LEVEL_STYLE[c.level]?.bg || T.bg, color: LEVEL_STYLE[c.level]?.color || T.textMuted }}>
            {c.level}
          </span>
          {total > 0 && (
            <span style={{ fontSize: 11, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircle size={11} color="#16a34a" strokeWidth={2.5} /> {done}/{total} topics
            </span>
          )}
          {c.students && (
            <span style={{ fontSize: 11, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
              <Users size={11} strokeWidth={2} /> {c.students}
            </span>
          )}
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

  // Load assignments + submissions + marks from Firestore
  useEffect(() => {
    if (!userProfile?.email) return;
    async function load() {
      setLoading(true);
      try {
        const [rawAssignments, rawSubmissions, rawMarks] = await Promise.all([
          getAssignmentsForStudent(userProfile.email),
          getSubmissionsByStudent(userProfile.email),
          getMarksForStudent(userProfile.email),
        ]);
        const merged = rawAssignments.map(a => {
          const sub = rawSubmissions.find(s => s.assignmentId === a.id);
          return { ...a, submitted: !!sub, submission: sub || null };
        });
        setAssignments(merged);
        setMarks(rawMarks);
      } catch (e) {
        console.error("Failed to load data:", e);
      }
      setLoading(false);
    }
    load();
  }, [userProfile?.email]);

  const pending = assignments.filter(a => !a.submitted);
  const submitted = assignments.filter(a => a.submitted);
  const overdue = pending.filter(a => new Date(a.deadline) < new Date());

  const handleLogout = async () => {
    try { await logout(); navigate("/login"); }
    catch (e) { console.error(e); }
  };

  function handleSubmit(id, submissionData) {
    setAssignments(prev => prev.map(a =>
      a.id === id ? { ...a, submitted: true, submission: submissionData } : a
    ));
    setUploadTarget(null);
  }

  const tabs = [
    { key: "assignments", icon: ClipboardList, label: "Assignments", count: pending.length },
    { key: "courses", icon: BookOpen, label: "Courses", count: MOCK_COURSES.length },
    { key: "submitted", icon: CheckCircle, label: "Submitted", count: submitted.length },
    { key: "marks", icon: Star, label: "My Marks", count: marks.length },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Upload Modal */}
      {uploadTarget && (
        <UploadModal
          assignment={uploadTarget}
          studentEmail={userProfile?.email}
          onClose={() => setUploadTarget(null)}
          onSubmit={handleSubmit}
        />
      )}

      {/* View Modal */}
      {viewTarget && (
        <ViewModal
          assignment={viewTarget}
          onClose={() => setViewTarget(null)}
        />
      )}

      {/* Course Modal */}
      {courseTarget && (
        <CourseModal c={courseTarget} onClose={() => setCourseTarget(null)} />
      )}

      {/* ── Header ── */}
      <div style={{ background: T.gradientHero, padding: `48px ${T.px} 40px`, color: "#fff" }}>
        <div style={{ maxWidth: T.maxWidth, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20, marginBottom: 36 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Student Portal
              </span>
              <h1 style={{ fontSize: 30, fontWeight: 800, margin: "8px 0 4px", display: "flex", alignItems: "center", gap: 12 }}>
                <GraduationCap size={30} strokeWidth={1.8} />
                {userProfile?.name || "Student"}
              </h1>
              <p style={{ fontSize: 13, opacity: 0.75, margin: 0 }}>{userProfile?.email}</p>
            </div>
            <button onClick={handleLogout} style={{
              background: "rgba(255,255,255,0.15)", color: "#fff",
              border: "1.5px solid rgba(255,255,255,0.3)",
              padding: "10px 20px", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 13,
              display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s"
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            >
              <LogOut size={15} strokeWidth={2} /> Logout
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
            {[
              { label: "Enrolled Courses", value: MOCK_COURSES.length, icon: BookOpen },
              { label: "Pending", value: pending.length, icon: Clock },
              { label: "Submitted", value: submitted.length, icon: CheckCircle },
              { label: "Overdue", value: overdue.length, icon: ClipboardList },
            ].map(s => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "16px 18px",
                border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)"
              }}>
                <s.icon size={18} color="rgba(255,255,255,0.8)" strokeWidth={1.8} style={{ marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{s.value}</p>
                <p style={{ margin: "5px 0 0", fontSize: 11, opacity: 0.75, fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ background: T.white, borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 10, boxShadow: T.shadow }}>
        <div style={{ maxWidth: T.maxWidth, margin: "0 auto", padding: `0 ${T.px}`, display: "flex" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: "16px 20px", fontSize: 13, fontWeight: 600, border: "none", background: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
              borderBottom: activeTab === t.key ? `2px solid ${T.primary}` : "2px solid transparent",
              color: activeTab === t.key ? T.primary : T.textMuted, transition: "all 0.2s"
            }}>
              <t.icon size={15} strokeWidth={2} />
              {t.label}
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                background: activeTab === t.key ? T.primaryLight : T.bg,
                color: activeTab === t.key ? T.primary : T.textMuted
              }}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: T.maxWidth, margin: "0 auto", padding: `36px ${T.px}` }}>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: T.textMuted }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${T.border}`, borderTopColor: T.primary, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ fontSize: 14, margin: 0 }}>Loading your assignments...</p>
          </div>
        ) : (
        <>
        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div>
            {overdue.length > 0 && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12,
                padding: "12px 18px", marginBottom: 24, fontSize: 13, color: "#dc2626",
                display: "flex", alignItems: "center", gap: 8
              }}>
                <Clock size={15} strokeWidth={2} />
                You have {overdue.length} overdue assignment{overdue.length > 1 ? "s" : ""}. Submit as soon as possible.
              </div>
            )}
            {pending.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: T.textMuted }}>
                <CheckCircle size={48} color="#4ade80" strokeWidth={1.5} style={{ marginBottom: 16 }} />
                <p style={{ fontWeight: 700, fontSize: 16, color: T.text, margin: "0 0 6px" }}>All caught up!</p>
                <p style={{ fontSize: 13, margin: 0 }}>No pending assignments right now.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 22 }}>
                {pending.map(a => (
                  <AssignmentCard key={a.id} a={a} onUpload={setUploadTarget} onView={setViewTarget} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 22 }}>
            {MOCK_COURSES.map(c => <CourseCard key={c.id} c={c} onClick={() => setCourseTarget(c)} />)}
          </div>
        )}

        {/* Submitted Tab */}
        {activeTab === "submitted" && (
          <div>
            {submitted.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: T.textMuted }}>
                <Upload size={48} color={T.primary} strokeWidth={1.5} style={{ marginBottom: 16 }} />
                <p style={{ fontWeight: 700, fontSize: 16, color: T.text, margin: "0 0 6px" }}>No submissions yet</p>
                <p style={{ fontSize: 13, margin: 0 }}>Submit your assignments from the Assignments tab.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 22 }}>
                {submitted.map(a => (
                  <AssignmentCard key={a.id} a={a} onUpload={setUploadTarget} onView={setViewTarget} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Marks Tab */}
        {activeTab === "marks" && (
          <div>
            {marks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: T.textMuted }}>
                <Star size={48} color={T.primary} strokeWidth={1.5} style={{ marginBottom: 16 }} />
                <p style={{ fontWeight: 700, fontSize: 16, color: T.text, margin: "0 0 6px" }}>No marks yet</p>
                <p style={{ fontSize: 13, margin: 0 }}>Your teacher hasn't graded any submissions yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Summary card */}
                {marks.length > 0 && (() => {
                  const avg = (marks.reduce((a, m) => a + m.marks, 0) / marks.length).toFixed(1);
                  const highest = Math.max(...marks.map(m => m.marks));
                  return (
                    <div style={{ background: T.gradientCard, borderRadius: T.radius, padding: "20px 24px", color: "#fff", display: "flex", gap: 32, flexWrap: "wrap" }}>
                      {[
                        { label: "Assignments Graded", value: marks.length },
                        { label: "Average Score", value: avg },
                        { label: "Highest Score", value: highest },
                      ].map(s => (
                        <div key={s.label}>
                          <p style={{ margin: 0, fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{s.value}</p>
                          <p style={{ margin: "4px 0 0", fontSize: 11, opacity: 0.8 }}>{s.label}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Marks table */}
                <div style={{ background: T.white, borderRadius: T.radius, border: `1px solid ${T.border}`, boxShadow: T.shadow, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: T.bg }}>
                        {["Assignment", "Marks", "Out of", "Grade", "Percentage"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "12px 20px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {marks.map(m => {
                        const pct = Math.round((m.marks / m.maxMarks) * 100);
                        const grade = pct >= 90 ? { label: "A+", color: "#15803d", bg: "#dcfce7" }
                          : pct >= 80 ? { label: "A", color: "#16a34a", bg: "#f0fdf4" }
                          : pct >= 70 ? { label: "B", color: "#0891b2", bg: "#ecfeff" }
                          : pct >= 60 ? { label: "C", color: "#d97706", bg: "#fffbeb" }
                          : pct >= 50 ? { label: "D", color: "#ea580c", bg: "#fff7ed" }
                          : { label: "F", color: "#dc2626", bg: "#fef2f2" };
                        const assignment = assignments.find(a => a.id === m.assignmentId);
                        return (
                          <tr key={m.id} style={{ borderBottom: `1px solid ${T.border}` }}
                            onMouseEnter={e => e.currentTarget.style.background = T.bg}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            <td style={{ padding: "14px 20px", fontWeight: 600, color: T.text }}>
                              {assignment?.title || m.assignmentId}
                            </td>
                            <td style={{ padding: "14px 20px", fontWeight: 800, fontSize: 16, color: T.primary }}>{m.marks}</td>
                            <td style={{ padding: "14px 20px", color: T.textMuted }}>{m.maxMarks}</td>
                            <td style={{ padding: "14px 20px" }}>
                              <span style={{ fontSize: 13, fontWeight: 800, padding: "4px 12px", borderRadius: 20, background: grade.bg, color: grade.color }}>
                                {grade.label}
                              </span>
                            </td>
                            <td style={{ padding: "14px 20px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ flex: 1, height: 6, background: T.border, borderRadius: 99, overflow: "hidden", maxWidth: 100 }}>
                                  <div style={{ height: "100%", width: `${pct}%`, background: T.gradientCard, borderRadius: 99 }} />
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
