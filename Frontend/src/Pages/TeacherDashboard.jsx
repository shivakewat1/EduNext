import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { T } from "../theme";

export default function TeacherDashboard() {
  const { userProfile } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("create");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function load() {
      const [a, s, u] = await Promise.all([getAllAssignments(), getAllSubmissions(), getAllStudents()]);
      setAssignments(a); setSubmissions(s); setStudents(u);
    }
    load();
  }, []);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function toggleStudent(email) {
    setSelectedStudents(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!selectedStudents.length) return showToast("Select at least one student.", "error");
    setLoading(true);
    try {
      await createAssignment({ title, description, deadline, assignedTo: selectedStudents, createdBy: userProfile.email });
      showToast("Assignment created successfully!");
      setTitle(""); setDescription(""); setDeadline(""); setSelectedStudents([]);
      const updated = await getAllAssignments();
      setAssignments(updated);
    } catch {
      showToast("Error creating assignment.", "error");
    }
    setLoading(false);
  }

  function getSubmission(assignmentId, studentEmail) {
    return submissions.find(s => s.assignmentId === assignmentId && s.studentEmail === studentEmail);
  }

  const tabs = [
    { key: "create", label: "Create Assignment" },
    { key: "submissions", label: "Submissions" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 999,
          background: toast.type === "error" ? "#c62828" : T.primary,
          color: "#fff", padding: "12px 20px", borderRadius: 12,
          fontSize: 13, fontWeight: 500, boxShadow: T.shadowHover
        }}>
          {toast.type === "error" ? "✕ " : "✓ "}{toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{
        background: T.gradientHero,
        padding: `48px ${T.px} 40px`, color: "#fff"
      }}>
        <div style={{ maxWidth: T.maxWidth, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Teacher Portal
            </span>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: "8px 0 4px" }}>
              {userProfile?.name}
            </h1>
            <p style={{ fontSize: 13, opacity: 0.75, margin: 0 }}>{userProfile?.email}</p>
          </div>
          {/* Quick stats */}
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { label: "Assignments", value: assignments.length },
              { label: "Students", value: students.length },
              { label: "Submissions", value: submissions.length },
            ].map(s => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.18)", borderRadius: 12,
                padding: "12px 20px", textAlign: "center"
              }}>
                <p style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: 11, opacity: 0.8, margin: "2px 0 0" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: T.white, borderBottom: `1px solid ${T.border}`,
        position: "sticky", top: 0, zIndex: 10, boxShadow: T.shadow
      }}>
        <div style={{ maxWidth: T.maxWidth, margin: "0 auto", padding: `0 ${T.px}`, display: "flex" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: "16px 20px", fontSize: 13, fontWeight: 600,
              border: "none", background: "none", cursor: "pointer",
              borderBottom: activeTab === t.key ? `2px solid ${T.primary}` : "2px solid transparent",
              color: activeTab === t.key ? T.primary : T.textMuted,
              transition: "all 0.2s"
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: T.maxWidth, margin: "0 auto", padding: `36px ${T.px}` }}>

        {/* Create Tab */}
        {activeTab === "create" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>

            {/* Form */}
            <div style={{ background: T.white, borderRadius: T.radius, padding: 28, boxShadow: T.shadow, border: `1px solid ${T.border}` }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: T.text, margin: "0 0 24px" }}>New Assignment</h2>
              <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <FormField label="Title" value={title} onChange={setTitle} placeholder="e.g. Chapter 3 Summary" />
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={3}
                    placeholder="Describe the assignment..."
                    style={{ ...inputStyle, resize: "none" }} />
                </div>
                <div>
                  <label style={labelStyle}>Deadline</label>
                  <input type="datetime-local" required value={deadline}
                    onChange={e => setDeadline(e.target.value)} style={inputStyle} />
                </div>

                {/* Student selector */}
                <div>
                  <label style={labelStyle}>Assign to Students</label>
                  {students.length === 0 ? (
                    <p style={{ fontSize: 12, color: T.textMuted }}>No students registered yet.</p>
                  ) : (
                    <div style={{
                      border: `1.5px solid ${T.border}`, borderRadius: T.radiusSm,
                      padding: 12, maxHeight: 140, overflowY: "auto", background: T.bg
                    }}>
                      {students.map(s => (
                        <label key={s.email} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", padding: "4px 0" }}>
                          <input type="checkbox" checked={selectedStudents.includes(s.email)}
                            onChange={() => toggleStudent(s.email)}
                            style={{ accentColor: T.primary }} />
                          <span style={{ color: T.text, fontWeight: 500 }}>{s.name}</span>
                          <span style={{ color: T.textMuted, fontSize: 11 }}>({s.email})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <button type="submit" disabled={loading} style={{
                  background: loading ? T.accent : T.primary, color: "#fff", border: "none",
                  padding: "12px 0", borderRadius: 10, fontWeight: 700, fontSize: 14,
                  cursor: loading ? "not-allowed" : "pointer", marginTop: 4
                }}>
                  {loading ? "Creating..." : "Create Assignment →"}
                </button>
              </form>
            </div>

            {/* Assignments list */}
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: T.text, margin: "0 0 20px" }}>All Assignments</h2>
              {assignments.length === 0 ? (
                <EmptyBox text="No assignments yet." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {assignments.map(a => (
                    <div key={a.id} style={{
                      background: T.white, borderRadius: T.radius, padding: 20,
                      border: `1px solid ${T.border}`, boxShadow: T.shadow
                    }}>
                      <p style={{ fontWeight: 700, color: T.text, margin: "0 0 4px", fontSize: 14 }}>{a.title}</p>
                      <p style={{ fontSize: 12, color: T.textMuted, margin: "0 0 10px" }}>{a.description}</p>
                      <DeadlineTimer deadline={a.deadline} />
                      <p style={{ fontSize: 11, color: T.textMuted, marginTop: 8 }}>
                        Assigned to: {a.assignedTo?.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === "submissions" && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: T.text, margin: "0 0 24px" }}>Submission Status</h2>
            {assignments.length === 0 ? (
              <EmptyBox text="No assignments created yet." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {assignments.map(a => (
                  <div key={a.id} style={{
                    background: T.white, borderRadius: T.radius, padding: 24,
                    border: `1px solid ${T.border}`, boxShadow: T.shadow
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                      <p style={{ fontWeight: 700, color: T.text, margin: 0, fontSize: 15 }}>{a.title}</p>
                      <DeadlineTimer deadline={a.deadline} />
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: T.bg }}>
                            {["Student", "Status", "Submission"].map(h => (
                              <th key={h} style={{
                                textAlign: "left", padding: "10px 14px", fontSize: 11,
                                fontWeight: 700, color: T.textMuted, textTransform: "uppercase",
                                letterSpacing: "0.05em", borderBottom: `1px solid ${T.border}`
                              }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(a.assignedTo || []).map(email => {
                            const sub = getSubmission(a.id, email);
                            return (
                              <tr key={email} style={{ borderBottom: `1px solid ${T.border}` }}>
                                <td style={{ padding: "12px 14px", color: T.text, fontWeight: 500 }}>{email}</td>
                                <td style={{ padding: "12px 14px" }}>
                                  <span style={{
                                    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                                    background: sub ? "#d4edda" : "#fff3cd",
                                    color: sub ? "#276221" : "#856404"
                                  }}>
                                    {sub ? "✓ Submitted" : "Pending"}
                                  </span>
                                </td>
                                <td style={{ padding: "12px 14px", color: T.textMuted, fontSize: 12 }}>
                                  {sub ? sub.content : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#1a1a2e", display: "block", marginBottom: 6 };
const inputStyle = {
  width: "100%", padding: "10px 13px", fontSize: 13,
  border: `1.5px solid ${T.border}`, borderRadius: 8, outline: "none",
  background: T.bg, color: T.text, boxSizing: "border-box", fontFamily: "inherit"
};

function FormField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input required value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={inputStyle} />
    </div>
  );
}

function EmptyBox({ text }) {
  return (
    <div style={{
      background: T.white, border: `1.5px dashed ${T.border}`, borderRadius: T.radius,
      padding: "40px 20px", textAlign: "center", color: T.textMuted, fontSize: 13
    }}>{text}</div>
  );
}
