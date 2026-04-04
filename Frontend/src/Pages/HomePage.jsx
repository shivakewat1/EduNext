import { useState } from "react";
import { Link } from "react-router-dom";
import { T } from "../theme";
import {
  ClipboardList, BookOpen, BarChart2, ShieldCheck,
  Timer, Globe, Trophy, Star, CheckCircle, Users, GraduationCap, Zap,
  MessageSquareQuote, UserCircle, Briefcase, Share2
} from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────────────

const features = [
  { icon: ClipboardList, title: "Smart Assignments", desc: "Create, assign, and track assignments with deadlines and real-time submission status." },
  { icon: BookOpen, title: "Course Library", desc: "Browse a curated library of courses across subjects, levels, and instructors." },
  { icon: BarChart2, title: "Live Assessment", desc: "Monitor student performance and submission rates from a clean dashboard." },
  { icon: ShieldCheck, title: "Secure & Role-Based", desc: "Separate portals for teachers and students — everyone sees exactly what they need." },
  { icon: Timer, title: "Deadline Timers", desc: "Live countdown timers on every assignment so nothing slips through the cracks." },
  { icon: Globe, title: "Access Anywhere", desc: "Cloud-powered and fully responsive — works on any device, anytime." },
];

const stats = [
  { icon: Users, value: "500+", label: "Active Students" },
  { icon: GraduationCap, value: "50+", label: "Expert Teachers" },
  { icon: ClipboardList, value: "1,200+", label: "Assignments Created" },
  { icon: Star, value: "98%", label: "Satisfaction Rate" },
];

const steps = [
  { num: "01", icon: CheckCircle, title: "Create Your Account", desc: "Sign up as a teacher or student in under a minute. No credit card required." },
  { num: "02", icon: Zap, title: "Set Up Your Dashboard", desc: "Teachers add assignments; students see their tasks instantly on their dashboard." },
  { num: "03", icon: Trophy, title: "Submit & Track", desc: "Students submit work, teachers review — all in one clean, organized place." },
];

const testimonials = [
  { name: "Sarah Johnson", role: "High School Teacher", text: "EduConnect completely changed how I manage my classroom. Creating and tracking assignments has never been this easy.", icon: UserCircle },
  { name: "Ali Hassan", role: "Student, Grade 10", text: "I always know exactly what's due and when. The deadline timer is a lifesaver for staying on top of my work.", icon: GraduationCap },
  { name: "Dr. Patel", role: "University Lecturer", text: "The submission tracking table saves me hours every week. I can see at a glance who has submitted and who hasn't.", icon: Briefcase },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function Tag({ children }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
      color: T.accent, display: "inline-block", marginBottom: 12
    }}>{children}</span>
  );
}

function SectionHeading({ children }) {
  return (
    <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: T.text, margin: "0 0 16px", lineHeight: 1.25 }}>
      {children}
    </h2>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: T.white, borderRadius: 16, padding: "28px 24px",
      border: `1.5px solid ${hov ? T.primary : T.border}`,
      boxShadow: hov ? T.shadowHover : T.shadow,
      transform: hov ? "translateY(-4px)" : "none",
      transition: "all 0.25s", cursor: "default"
    }}>
      <div style={{
        width: 54, height: 54, background: T.primaryLight, borderRadius: 14,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 18
      }}>
        <Icon size={26} color={T.primary} strokeWidth={1.8} />
      </div>
      <p style={{ fontWeight: 700, color: T.text, fontSize: 15, margin: "0 0 8px" }}>{title}</p>
      <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.75, margin: 0 }}>{desc}</p>
    </div>
  );
}

function TestimonialCard({ name, role, text, icon: Icon }) {
  return (
    <div style={{
      background: T.white, borderRadius: 16, padding: 28,
      border: `1px solid ${T.border}`, boxShadow: T.shadow,
      display: "flex", flexDirection: "column", gap: 16
    }}>
      <MessageSquareQuote size={28} color={T.primary} strokeWidth={1.5} />
      <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>
        "{text}"
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 44, height: 44, background: T.primaryLight, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Icon size={22} color={T.primary} strokeWidth={1.8} />
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: 14 }}>{name}</p>
          <p style={{ margin: 0, fontSize: 12, color: T.textMuted }}>{role}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", color: T.text }}>

      {/* ── HERO ── */}
      <section style={{
        background: `linear-gradient(135deg, ${T.primary} 0%, ${T.accent} 100%)`,
        padding: `90px ${T.px} 80px`, color: "#fff", position: "relative", overflow: "hidden"
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -80, left: "40%", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        <div style={{ maxWidth: T.maxWidth, margin: "0 auto", display: "flex", alignItems: "center", gap: 64, flexWrap: "wrap", position: "relative" }}>
          {/* Left */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
              background: "rgba(255,255,255,0.18)", padding: "5px 16px", borderRadius: 20,
              display: "inline-block", marginBottom: 24, border: "1px solid rgba(255,255,255,0.25)"
            }}>Award Winning Platform · Since 2024</span>

            <h1 style={{ fontSize: "clamp(34px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 22px", letterSpacing: "-0.5px" }}>
              We Make Your<br />
              <span style={{ color: "#a8e6df" }}>Learning Better</span>
            </h1>

            <p style={{ fontSize: 16, opacity: 0.88, lineHeight: 1.75, maxWidth: 460, marginBottom: 40 }}>
              A modern platform connecting teachers and students — manage assignments, track progress, and learn better together.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 44 }}>
              <Link to="/signup" style={{
                fontSize: 14, fontWeight: 700, color: T.primary, textDecoration: "none",
                background: "#fff", padding: "14px 36px", borderRadius: 30,
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)", transition: "transform 0.2s"
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}
              >Get Started →</Link>
              <Link to="/login" style={{
                fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none",
                background: "rgba(255,255,255,0.15)", padding: "14px 30px", borderRadius: 30,
                border: "1.5px solid rgba(255,255,255,0.35)", transition: "background 0.2s"
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
              >Log In</Link>
            </div>

            <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
              {[
                { icon: BookOpen, label: "Crafted Curriculum" },
                { icon: Zap, label: "Innovative Tools" },
                { icon: Star, label: "Budget Friendly" },
              ].map(b => (
                <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.78 }}>
                  <b.icon size={13} color="#fff" strokeWidth={2} />
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — visual card stack */}
          <div style={{ flex: 1, minWidth: 260, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ position: "relative", width: 300, height: 320 }}>
              {/* Back card */}
              <div style={{
                position: "absolute", top: 20, left: 20, right: -20, bottom: -20,
                background: "rgba(255,255,255,0.1)", borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.15)"
              }} />
              {/* Main card */}
              <div style={{
                position: "relative", background: "rgba(255,255,255,0.18)", borderRadius: 20,
                padding: 28, border: "1px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(8px)", height: "100%", boxSizing: "border-box",
                display: "flex", flexDirection: "column", justifyContent: "space-between"
              }}>
                <GraduationCap size={52} color="rgba(255,255,255,0.9)" strokeWidth={1.2} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 18, margin: "0 0 6px" }}>EduConnect</p>
                  <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>Your complete learning management platform</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[{ n: "3", l: "Assignments" }, { n: "5", l: "Courses" }, { n: "2", l: "Submitted" }].map(s => (
                    <div key={s.l} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 12px", flex: 1, textAlign: "center" }}>
                      <p style={{ fontWeight: 800, fontSize: 18, margin: 0 }}>{s.n}</p>
                      <p style={{ fontSize: 10, opacity: 0.8, margin: 0 }}>{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: T.white, borderBottom: `1px solid ${T.border}` }}>
        <div style={{
          maxWidth: T.maxWidth, margin: "0 auto", padding: `36px ${T.px}`,
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8
        }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{
              textAlign: "center", padding: "16px 8px",
              borderRight: i < stats.length - 1 ? `1px solid ${T.border}` : "none"
            }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                <s.icon size={22} color={T.primary} strokeWidth={1.8} />
              </div>
              <p style={{ fontSize: 34, fontWeight: 800, color: T.primary, margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 13, color: T.textMuted, margin: "6px 0 0", fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT / HISTORY ── */}
      <section style={{ padding: `88px ${T.px}` }}>
        <div style={{ maxWidth: T.maxWidth, margin: "0 auto", display: "flex", gap: 72, alignItems: "center", flexWrap: "wrap" }}>
          {/* Visual */}
          <div style={{ flex: 1, minWidth: 260, position: "relative" }}>
            <div style={{
              background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
              borderRadius: 20, height: 320,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <BookOpen size={90} color="rgba(255,255,255,0.85)" strokeWidth={1} />
            </div>
            {/* Floating badge */}
            <div style={{
              position: "absolute", bottom: -18, right: -18,
              background: T.white, borderRadius: 14, padding: "14px 20px",
              boxShadow: T.shadowHover, border: `1px solid ${T.border}`,
              display: "flex", alignItems: "center", gap: 10
            }}>
              <Trophy size={28} color={T.primary} strokeWidth={1.8} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: T.text }}>Award Winning</p>
                <p style={{ margin: 0, fontSize: 11, color: T.textMuted }}>Studio Since 2024</p>
              </div>
            </div>
          </div>

          {/* Text */}
          <div style={{ flex: 1.4, minWidth: 300 }}>
            <Tag>HISTORY of Our Creation</Tag>
            <SectionHeading>Built for <span style={{ color: T.primary }}>Modern Education</span></SectionHeading>
            <p style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.85, marginBottom: 28 }}>
              EduConnect was built to bridge the gap between educators and learners. We believe every student deserves clear visibility into their tasks, and every teacher deserves powerful tools to manage their classroom — all in one place.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 32 }}>
              {[
                { icon: Trophy, text: "Award Winning" },
                { icon: Timer, text: "24/7 Support" },
                { icon: Users, text: "Professional Staff" },
                { icon: Star, text: "Fair Pricing" },
              ].map(item => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <item.icon size={16} color={T.primary} strokeWidth={2} />
                  <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{item.text}</span>
                </div>
              ))}
            </div>
            <Link to="/signup" style={{
              fontSize: 13, fontWeight: 700, color: T.white, textDecoration: "none",
              background: T.primary, padding: "12px 30px", borderRadius: 26, display: "inline-block",
              transition: "background 0.2s"
            }}
              onMouseEnter={e => e.currentTarget.style.background = T.primaryDark}
              onMouseLeave={e => e.currentTarget.style.background = T.primary}
            >Get Started Free</Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: T.white, padding: `88px ${T.px}` }}>
        <div style={{ maxWidth: T.maxWidth, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Tag>Simple Process</Tag>
            <SectionHeading>How It <span style={{ color: T.primary }}>Works</span></SectionHeading>
            <p style={{ fontSize: 14, color: T.textMuted, maxWidth: 480, margin: "0 auto" }}>
              Get up and running in minutes — no technical knowledge required.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32, position: "relative" }}>
            {steps.map((s, i) => (
              <div key={s.num} style={{ textAlign: "center", padding: "0 16px" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: i % 2 === 0 ? T.primary : T.primaryLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px", boxShadow: T.shadow
                }}>
                  <s.icon size={28} color={i % 2 === 0 ? "#fff" : T.primary} strokeWidth={1.8} />
                </div>
                <p style={{ fontWeight: 700, fontSize: 16, color: T.text, margin: "0 0 10px" }}>{s.title}</p>
                <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.75, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: `88px ${T.px}`, background: T.bg }}>
        <div style={{ maxWidth: T.maxWidth, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <Tag>Why People CHOOSE US</Tag>
            <SectionHeading>Our Creative <span style={{ color: T.primary }}>Services</span></SectionHeading>
            <p style={{ fontSize: 14, color: T.textMuted, maxWidth: 480, margin: "0 auto" }}>
              Everything you need to run a modern, efficient classroom — in one platform.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 24 }}>
            {features.map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: T.white, padding: `88px ${T.px}` }}>
        <div style={{ maxWidth: T.maxWidth, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <Tag>What People Say</Tag>
            <SectionHeading>Our Professional <span style={{ color: T.primary }}>Designers</span></SectionHeading>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {testimonials.map((t, i) => <TestimonialCard key={i} {...t} />)}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{
        background: `linear-gradient(135deg, ${T.primary} 0%, ${T.accent} 100%)`,
        padding: `80px ${T.px}`, color: "#fff", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: -40, right: 80, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.2 }}>
            Ready to Transform Your Classroom?
          </h2>
          <p style={{ fontSize: 15, opacity: 0.88, marginBottom: 36, lineHeight: 1.7 }}>
            Join hundreds of teachers and students already using EduConnect to manage assignments, track progress, and learn smarter.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/signup" style={{
              fontSize: 14, fontWeight: 700, color: T.primary, textDecoration: "none",
              background: "#fff", padding: "14px 36px", borderRadius: 30,
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)"
            }}>Create Free Account</Link>
            <Link to="/login" style={{
              fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none",
              background: "rgba(255,255,255,0.15)", padding: "14px 30px", borderRadius: 30,
              border: "1.5px solid rgba(255,255,255,0.35)"
            }}>Log In</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: T.primaryDark, color: "rgba(255,255,255,0.65)", padding: `56px ${T.px} 28px` }}>
        <div style={{
          maxWidth: T.maxWidth, margin: "0 auto",
          display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: 40, marginBottom: 40,
          flexWrap: "wrap"
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, background: T.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GraduationCap size={18} color="#fff" strokeWidth={2} />
              </div>
              <span style={{ fontWeight: 800, color: "#fff", fontSize: 16 }}>EduConnect</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.75, margin: "0 0 20px", maxWidth: 220 }}>
              Modern learning management platform for teachers and students worldwide.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {[Globe, Share2, Users].map((Icon, i) => (
                <div key={i} style={{
                  width: 34, height: 34, background: "rgba(255,255,255,0.1)", borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
                }}>
                  <Icon size={16} color="rgba(255,255,255,0.7)" strokeWidth={1.8} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigate */}
          <div>
            <p style={{ fontWeight: 700, color: "#fff", fontSize: 13, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Navigate</p>
            {["Home", "Login", "Sign Up"].map(l => (
              <p key={l} style={{ fontSize: 13, margin: "0 0 10px", cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
              >{l}</p>
            ))}
          </div>

          {/* Popular */}
          <div>
            <p style={{ fontWeight: 700, color: "#fff", fontSize: 13, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Popular Links</p>
            {["Dashboard", "Assignments", "Courses", "Assessment"].map(l => (
              <p key={l} style={{ fontSize: 13, margin: "0 0 10px", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
              >{l}</p>
            ))}
          </div>

          {/* Newsletter */}
          <div>
            <p style={{ fontWeight: 700, color: "#fff", fontSize: 13, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Stay Updated</p>
            <p style={{ fontSize: 12, marginBottom: 14, lineHeight: 1.6 }}>Subscribe to get the latest updates and news.</p>
            <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)" }}>
              <input placeholder="Your email address" style={{
                padding: "10px 14px", fontSize: 12, border: "none",
                outline: "none", flex: 1, background: "rgba(255,255,255,0.08)",
                color: "#fff"
              }} />
              <button style={{
                background: T.accent, color: "#fff", border: "none",
                padding: "10px 16px", cursor: "pointer", fontSize: 16, fontWeight: 700
              }}>→</button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          maxWidth: T.maxWidth, margin: "0 auto",
          borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 22,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 12, fontSize: 12
        }}>
          <span>© 2026 EduConnect. All rights reserved.</span>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy Policy", "Terms of Service", "Contact"].map(l => (
              <span key={l} style={{ cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
              >{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
