import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { T } from "../theme";

const MOCK_ASSIGNMENTS = [
  { id: 1, title: "Math Homework Chapter 5", description: "Complete exercises 1-20 from chapter 5", deadline: "2025-04-10T23:59:00", courseId: 1, submitted: false },
  { id: 2, title: "English Essay Assignment", description: "Write a 500-word essay on Shakespeare", deadline: "2025-04-12T23:59:00", courseId: 2, submitted: true, submission: "Completed essay on Hamlet" },
  { id: 3, title: "Physics Lab Report", description: "Write report on simple pendulum experiment", deadline: "2025-04-15T23:59:00", courseId: 3, submitted: false },
];

export default function StudentDashboard() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{
        background: T.gradientHero, padding: `48px ${T.px} 40px`, color: "#fff"
      }}>
        <div style={{ maxWidth: T.maxWidth, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Student Portal
            </span>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: "8px 0 4px" }}>
              {userProfile?.name}
            </h1>
            <p style={{ fontSize: 13, opacity: 0.75, margin: 0 }}>{userProfile?.email}</p>
          </div>
          <button onClick={handleLogout} style={{
            background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)",
            padding: "10px 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13,
            transition: "all 0.2s"
          }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: T.maxWidth, margin: "0 auto", padding: T.px }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 40 }}>
          {[
            { label: "Courses Enrolled", value: "3" },
            { label: "Assignments Pending", value: assignments.filter(a => !a.submitted).length },
            { label: "Completed", value: assignments.filter(a => a.submitted).length },
          ].map((stat, idx) => (
            <div key={idx} style={{
              background: T.white, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: 20
            }}>
              <p style={{ margin: 0, fontSize: 12, color: T.textMuted, fontWeight: 600, marginBottom: 8 }}>{stat.label}</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: T.primary }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Assignments */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: "0 0 20px" }}>📝 Assignments</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {assignments.map(a => {
              const isPast = new Date(a.deadline) < new Date();
              return (
                <div key={a.id} style={{
                  border: `1.5px solid ${a.submitted ? "#c3e6cb" : isPast ? "#f5c6c6" : T.border}`,
                  borderRadius: T.radiusSm, padding: 16, background: a.submitted ? "#f5fef5" : T.white
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.text }}>{a.title}</h3>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                      background: a.submitted ? "#d4edda" : "#fff3cd", color: a.submitted ? "#276221" : "#856404"
                    }}>
                      {a.submitted ? "✓ Submitted" : "Pending"}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 12px", fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>{a.description}</p>
                  <p style={{ margin: "0 0 12px", fontSize: 12, color: isPast ? "#c62828" : T.textMuted, fontWeight: 600 }}>
                    Due: {new Date(a.deadline).toLocaleDateString()}
                  </p>
                  {!a.submitted && <button style={{
                    width: "100%", padding: "10px", background: T.primary, color: "#fff", border: "none", borderRadius: T.radiusSm,
                    fontWeight: 600, fontSize: 12, cursor: "pointer"
                  }}>Submit Assignment</button>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


const COURSES = [
  { id: 1, title: "Introduction to Mathematics", instructor: "Dr. Smith", level: "Beginner", icon: "📐" },
  { id: 2, title: "English Literature", instructor: "Ms. Johnson", level: "Intermediate", icon: "📖" },
  { id: 3, title: "Physics Fundamentals", instructor: "Mr. Lee", level: "Intermediate", icon: "⚛️" },
  { id: 4, title: "Computer Science Basics", instructor: "Dr. Patel", level: "Beginner", icon: "💻" },
  { id: 5, title: "World History", instructor: "Ms. Garcia", level: "Advanced", icon: "🌍" },
];

const LEVEL = {
  Beginner: { bg: "#d4edda", color: "#276221" },
  Intermediate: { bg: "#fff3cd", color: "#856404" },
  Advanced: { bg: "#fde8e8", color: "#c62828" },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ dot, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot, display: "inline-block" }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </span>
    </div>
  );
}

function EmptyBox({ text }) {
  return (
    <div style={{
      background: T.white, border: `1.5px dashed ${T.border}`, borderRadius: T.radius,
      padding: "36px 20px", textAlign: "center", color: T.textMuted, fontSize: 13, marginBottom: 8
    }}>{text}</div>
  );
}

function CardGrid({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
      {children}
    </div>
  );
}

function AssignmentCard({ assignment: a, status, submission, onSubmit }) {
  const [hov, setHov] = useState(false);
  const isPast = new Date(a.deadline) < new Date();

  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: T.white, borderRadius: T.radius, padding: 22,
        border: `1.5px solid ${status === "submitted" ? "#c3e6cb" : isPast ? "#f5c6c6" : T.border}`,
        boxShadow: hov ? T.shadowHover : T.shadow,
        transform: hov ? "translateY(-2px)" : "none",
        transition: "all 0.22s", display: "flex", flexDirection: "column", gap: 10
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 14, lineHeight: 1.4 }}>{a.title}</p>
        <span style={{
          flexShrink: 0, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
          background: status === "submitted" ? "#d4edda" : "#fff3cd",
          color: status === "submitted" ? "#276221" : "#856404"
        }}>
          {status === "submitted" ? "✓ Submitted" : "Pending"}
        </span>
      </div>

      <p style={{
        margin: 0, fontSize: 12, color: T.textMuted, lineHeight: 1.6,
        overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
      }}>{a.description}</p>

      <DeadlineTimer deadline={a.deadline} />

      {submission && (
        <div style={{
          background: T.primaryLight, borderRadius: 8, padding: "8px 12px",
          fontSize: 12, color: T.primary, border: `1px solid ${T.border}`
        }}>
          <span style={{ color: T.textMuted }}>Answer: </span>{submission.content}
        </div>
      )}

      {status === "pending" && (
        <button onClick={onSubmit}
          onMouseEnter={e => e.currentTarget.style.background = T.primaryDark}
          onMouseLeave={e => e.currentTarget.style.background = T.primary}
          style={{
            marginTop: 4, width: "100%", padding: "11px 0", borderRadius: 10,
            border: "none", background: T.primary, color: "#fff",
            fontWeight: 700, fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "background 0.2s"
          }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4" />
          </svg>
          Submit Assignment
        </button>
      )}
    </div>
  );
}

function CourseCard({ course: c }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: T.white, borderRadius: T.radius, padding: 24,
        border: `1.5px solid ${hov ? T.border : "transparent"}`,
        boxShadow: hov ? T.shadowHover : T.shadow,
        transform: hov ? "translateY(-2px)" : "none",
        transition: "all 0.22s", cursor: "default"
      }}
    >
      <div style={{
        width: 48, height: 48, background: T.primaryLight, borderRadius: 12,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, marginBottom: 14
      }}>{c.icon}</div>
      <p style={{ fontWeight: 700, color: T.text, fontSize: 14, margin: "0 0 6px" }}>{c.title}</p>
      <p style={{ fontSize: 12, color: T.textMuted, margin: "0 0 12px" }}>👤 {c.instructor}</p>
      <span style={{
        fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
        background: LEVEL[c.level].bg, color: LEVEL[c.level].color
      }}>{c.level}</span>
    </div>
  );
}
