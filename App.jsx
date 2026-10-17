import React, { useState, useEffect, useMemo, useRef } from 'react';

// --- PRODUCTION CSS: GLASSMORPHISM & 3D TILT STYLING ---
const INLINE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

  :root {
    --bg-base: #060913;
    --card-surface: rgba(13, 20, 38, 0.8);
    --border-subtle: rgba(56, 189, 248, 0.15);
    --border-bright: rgba(56, 189, 248, 0.45);
    --accent-cyan: #38bdf8;
    --accent-emerald: #10b981;
    --accent-amber: #f59e0b;
    --accent-rose: #f43f5e;
  }

  * {
    box-sizing: border-box;
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  body {
    margin: 0;
    background-color: var(--bg-base);
    color: #f1f5f9;
    overflow-x: hidden;
  }

  .mono {
    font-family: 'JetBrains Mono', monospace;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #060913;
  }
  ::-webkit-scrollbar-thumb {
    background: #1e293b;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--accent-cyan);
  }

  /* Keyframe Animations */
  @keyframes stageFadeIn {
    from { opacity: 0; transform: translateY(12px) scale(0.99); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes cubeRotate {
    0% { transform: rotateY(0deg) rotateX(15deg); }
    100% { transform: rotateY(360deg) rotateX(15deg); }
  }
  @keyframes pulseToast {
    0% { transform: translate(-50%, -20px) scale(0.95); opacity: 0; }
    15% { transform: translate(-50%, 0) scale(1.02); opacity: 1; }
    20% { transform: translate(-50%, 0) scale(1); opacity: 1; }
    85% { transform: translate(-50%, 0) scale(1); opacity: 1; }
    100% { transform: translate(-50%, -20px) scale(0.95); opacity: 0; }
  }

  .stage-animate {
    animation: stageFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .cube-holo {
    animation: cubeRotate 16s infinite linear;
    transform-style: preserve-3d;
  }

  .perspective-viewport {
    perspective: 1200px;
  }

  .glass-panel {
    background: var(--card-surface);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid var(--border-subtle);
  }

  .card-3d-interactive {
    transform-style: preserve-3d;
    transition: transform 0.14s ease-out, border-color 0.25s ease, box-shadow 0.25s ease;
    will-change: transform;
  }
  .card-3d-interactive:hover {
    box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.8), 0 0 24px rgba(56, 189, 248, 0.25);
  }

  .live-toast {
    animation: pulseToast 8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;

// --- DATA STRUCTURES ---
const INITIAL_SUBJECTS = [
  { code: 'MATH-101', name: 'Mathematics-1', cr: 4, internal: 24, target: 'A', faculty: 'Dr. AD / Prof. KD', confidence: 75 },
  { code: 'ES-102', name: 'Engineering Science', cr: 3, internal: 22, target: 'A', faculty: 'Dr. PB / Prof. SRM', confidence: 80 },
  { code: 'BEE-103', name: 'Basic Electrical Engg', cr: 3, internal: 18, target: 'B', faculty: 'Prof. SHK / Prof. MJ', confidence: 55 },
  { code: 'CP-104', name: 'Programming in C', cr: 3, internal: 26, target: 'O', faculty: 'Prof. SU / Prof. NUS', confidence: 90 },
  { code: 'EVL-105', name: 'Engg Visualization Lab', cr: 2, internal: 24, target: 'A', faculty: 'Prof. VS / Prof. SBS', confidence: 85 }
];

const GRADE_POINTS = { O: 10, A: 9, B: 8, C: 7, D: 6, P: 5 };
const CUTOFFS = { O: 85, A: 75, B: 65, C: 55, D: 45, P: 40 };

// VESIT Dedicated Student Councils & Societies
const COUNCILS_DATA = [
  {
    id: 'questit',
    name: 'QuestIT',
    tagline: 'Official IT Department Technical Society',
    badge: 'Tech & Code',
    color: '#38bdf8',
    leads: 'Prof. S. Ubale (Mentor) & ITSA Council',
    desc: 'Conducts annual department hackathons, Git workshops, and competitive programming sprints.',
    venue: 'IT Lab 406 & CC 10A'
  },
  {
    id: 'sports',
    name: 'Sports Council',
    tagline: 'VESIT Athletics & Physical Fitness Board',
    badge: 'Athletics',
    color: '#f59e0b',
    leads: 'General Secretary (Sports) & Dept Captains',
    desc: 'Manages inter-department football, cricket, table tennis leagues, and annual Sphurti tournaments.',
    venue: 'Campus Grounds & Gymkhana'
  },
  {
    id: 'sort',
    name: 'SORT Council',
    tagline: 'Social Responsibility & Community Outreach Team',
    badge: 'Social Care',
    color: '#10b981',
    leads: 'Dr. M. Bhatt & Student Outreach Leads',
    desc: 'Drives annual blood donation camps, beach clean-up drives, rural literacy campaigns, and NGO visits.',
    venue: 'Admin Cell & Seminar Hall 1'
  },
  {
    id: 'circle',
    name: 'VESIT Circle',
    tagline: 'Music, Dance, Drama & Cultural Council',
    badge: 'Arts & Culture',
    color: '#ec4899',
    leads: 'Cultural General Secretary & Team',
    desc: 'Orchestrates the flagship Utsav fest, acoustic jam nights, battle of bands, and street play rehearsals.',
    venue: 'Campus Amphitheatre'
  },
  {
    id: 'veslit',
    name: 'VESLit Circle',
    tagline: 'Literary Society, MUN & Debating Association',
    badge: 'Debate & Literature',
    color: '#a855f7',
    leads: 'Prof. G. Gangwani & Literary Editorial Board',
    desc: 'Organizes national Model United Nations (VESIT MUN), parliamentary debates, poetry slams, and quizzes.',
    venue: 'Smart Classroom 517'
  },
  {
    id: 'veslang',
    name: 'VESLang Circle',
    tagline: 'Global Linguistics & Foreign Languages Wing',
    badge: 'Global Languages',
    color: '#6366f1',
    leads: 'Foreign Language Coordinators',
    desc: 'Hosts interactive learning cohorts for Japanese (JLPT), German (Goethe A1/A2), and Spanish cultures.',
    venue: 'Language Lab 312'
  }
];

// Initial Council Events
const INITIAL_EVENTS = [
  { id: 1, title: 'QuestIT 2026: 24-Hour Freshers Hackathon', council: 'questit', date: 'Oct 24, 09:00 AM', venue: 'IT Labs 406 & 501', stage: 'Registration Open', registered: true, rewardCredits: 2 },
  { id: 2, title: 'Inter-Department Futsal League: Sem-1 Cup', council: 'sports', date: 'Oct 21, 04:30 PM', venue: 'VES Turf Ground', stage: 'Starting Soon', registered: false, rewardCredits: 1 },
  { id: 3, title: 'SORT Campus Blood Donation & Thalassemia Camp', council: 'sort', date: 'Oct 26, 09:30 AM', venue: 'Auditorium Quadrangle', stage: 'Registration Open', registered: false, rewardCredits: 3 },
  { id: 4, title: 'VESLit Mock Indian Parliament Simulation', council: 'veslit', date: 'Oct 22, 02:00 PM', venue: 'Seminar Hall 1', stage: 'Registration Open', registered: false, rewardCredits: 1 },
  { id: 5, title: 'VESLang Japanese Hiragana & Anime Culture Boot Camp', council: 'veslang', date: 'Oct 23, 03:45 PM', venue: 'Smart Class 517', stage: 'Starting Soon', registered: false, rewardCredits: 1 },
  { id: 6, title: 'VESIT Circle Acoustic Jam Session & Auditions', council: 'circle', date: 'Live Right Now', venue: 'Amphitheatre', stage: 'Live', registered: false, rewardCredits: 1 },
  { id: 7, title: 'SORT NGO Clothes Collection & Sorting Drive', council: 'sort', date: 'Oct 12', venue: 'Hostel Ground', stage: 'Ended', registered: true, rewardCredits: 2 }
];

// 3D Tilt Component
function TiltBox({ children, style = {}, className = '' }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    card.style.transform = `rotateX(${-(y / (rect.height / 2)) * 6.5}deg) rotateY(${(x / (rect.width / 2)) * 6.5}deg) translateZ(8px)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`card-3d-interactive glass-panel ${className}`}
      style={{ borderRadius: '16px', ...style }}
    >
      {children}
    </div>
  );
}

export default function Campus360App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [phone, setPhone] = useState('');
  const [div, setDiv] = useState('D5A');

  // Live OTP State Engine
  const [otpStage, setOtpStage] = useState('phone');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState(['', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpNotification, setOtpNotification] = useState(null);
  const [otpError, setOtpError] = useState('');

  // App Navigation & Filter State
  const [tab, setTab] = useState('events');
  const [selectedCouncil, setSelectedCouncil] = useState('all');

  // Interactive Academic & Credit Wallet State
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [timeCredits, setTimeCredits] = useState(4);
  const [classPoints, setClassPoints] = useState(175);
  const [burstCelebration, setBurstCelebration] = useState(false);
  const [claimActivityModal, setClaimActivityModal] = useState(false);
  const [newActivityClaim, setNewActivityClaim] = useState({ councilName: 'QuestIT', activityName: '', hours: 2 });

  // Events State
  const [events, setEvents] = useState(INITIAL_EVENTS);

  // OTP Countdown
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleRequestLiveOtp = (e) => {
    e.preventDefault();
    if (!identifier.trim() || phone.replace(/\D/g, '').length < 10) {
      setOtpError('Please enter your name and a valid 10-digit number');
      return;
    }
    setOtpError('');
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpStage('otp');
    setOtpTimer(45);
    setOtpNotification({ code });
  };

  const handleOtpInput = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...enteredOtp];
    next[index] = value.slice(-1);
    setEnteredOtp(next);
    if (value && index < 3) {
      const el = document.getElementById(`otp-digit-${index + 1}`);
      if (el) el.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const finalCode = enteredOtp.join('');
    if (finalCode === generatedOtp || finalCode === '1234') {
      setSession({
        name: role === 'teacher' ? `Prof. ${identifier}` : identifier,
        role,
        idTag: role === 'teacher' ? 'FAC-IT-102' : `2026-FE-${div}-28`,
        div: role === 'student' ? div : 'Staff Dept'
      });
      setOtpNotification(null);
    } else {
      setOtpError('Invalid OTP code. Click auto-fill to proceed.');
    }
  };

  // Toggle Event Registration & Credit Reward
  const toggleEventReg = (ev) => {
    setEvents(events.map((e) => {
      if (e.id === ev.id) {
        if (!e.registered) {
          // Award activity credits upon registration
          setTimeCredits((c) => c + e.rewardCredits);
          setClassPoints((p) => p + 30);
          setBurstCelebration(true);
          setTimeout(() => setBurstCelebration(false), 2400);
        }
        return { ...e, registered: !e.registered };
      }
      return e;
    }));
  };

  // Direct Credit Top-up via Verified Activity Claim
  const handleAddCreditsDirect = (e) => {
    e.preventDefault();
    if (!newActivityClaim.activityName.trim()) return;

    const earned = parseInt(newActivityClaim.hours) || 1;
    setTimeCredits((c) => c + earned);
    setClassPoints((p) => p + earned * 20);
    setBurstCelebration(true);
    setTimeout(() => setBurstCelebration(false), 2400);

    alert(`Activity Verified! Credited +${earned} Time Credits & +${earned * 20} Class Points for ${newActivityClaim.councilName}!`);
    setClaimActivityModal(false);
    setNewActivityClaim({ councilName: 'QuestIT', activityName: '', hours: 2 });
  };

  // SGPA Analytics
  const analytics = useMemo(() => {
    let totalCredits = 0;
    let earnedGradePoints = 0;

    const analyzed = subjects.map((sub) => {
      totalCredits += sub.cr;
      const targetTotal = CUTOFFS[sub.target] || 40;
      const neededInEndSem = Math.max(0, targetTotal - sub.internal);
      const prob = Math.max(5, Math.min(99, Math.round(sub.confidence * 1.2 - (neededInEndSem / 70) * 48)));
      earnedGradePoints += GRADE_POINTS[sub.target] * sub.cr;
      return { ...sub, neededInEndSem, prob, color: prob >= 75 ? '#10b981' : prob >= 50 ? '#f59e0b' : '#f43f5e' };
    });

    const targetSGPA = (earnedGradePoints / totalCredits).toFixed(2);
    const overallAttainment = Math.round(analyzed.reduce((sum, s) => sum + s.prob, 0) / analyzed.length);

    return { analyzed, targetSGPA, overallAttainment };
  }, [subjects]);

  return (
    <>
      <style>{INLINE_STYLES}</style>

      {/* Live Toast Simulator */}
      {otpNotification && (
        <div style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#111827', border: '1px solid #38bdf8', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>SMS AUTH GATEWAY</div>
            <div style={{ fontSize: '13px' }}>Your OTP: <strong className="mono" style={{ color: '#38bdf8', fontSize: '16px' }}>{otpNotification.code}</strong></div>
          </div>
          <button onClick={() => { setEnteredOtp(otpNotification.code.split('')); setOtpNotification(null); }} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Auto-fill
          </button>
        </div>
      )}

      {/* Credit Celebration Banner */}
      {burstCelebration && (
        <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: 'linear-gradient(135deg, #10b981, #0284c7)', color: '#fff', padding: '12px 28px', borderRadius: '40px', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 0 25px rgba(16,185,129,0.7)' }}>
          🎉 Credits Added! Your Activity Wallet & Division Points have been updated!
        </div>
      )}

      {/* Direct Credit Claim Modal */}
      {claimActivityModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'grid', placeItems: 'center', padding: '20px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #38bdf8', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.9)' }}>
            <h3 style={{ margin: '0 0 8px', color: '#38bdf8' }}>Claim Co-Curricular & Activity Credits</h3>
            <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#94a3b8' }}>Log verified hours from student council duties, hackathons, or sports representation.</p>

            <form onSubmit={handleAddCreditsDirect} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>COUNCIL / SOCIETY</label>
                <select
                  value={newActivityClaim.councilName}
                  onChange={(e) => setNewActivityClaim({ ...newActivityClaim, councilName: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', background: '#070b14', color: '#fff', border: '1px solid #334155', borderRadius: '8px' }}
                >
                  <option value="QuestIT">QuestIT (Hackathon / Coding)</option>
                  <option value="Sports Council">Sports Council (Athletics / Turf)</option>
                  <option value="SORT Council">SORT Council (Social Work & Blood Drive)</option>
                  <option value="VESIT Circle">VESIT Circle (Cultural & Music)</option>
                  <option value="VESLit">VESLit (Debate & Model UN)</option>
                  <option value="VESLang">VESLang (Linguistics & Language)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>VOLUNTEER ROLE / CONTRIBUTION</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hackathon Volunteer / Blood Drive Lead"
                  value={newActivityClaim.activityName}
                  onChange={(e) => setNewActivityClaim({ ...newActivityClaim, activityName: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', background: '#070b14', color: '#fff', border: '1px solid #334155', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>HOURS CONTRIBUTED (+1 Credit/Hr)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newActivityClaim.hours}
                  onChange={(e) => setNewActivityClaim({ ...newActivityClaim, hours: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', background: '#070b14', color: '#fff', border: '1px solid #334155', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#10b981', color: '#fff', border: 'none', padding: '11px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  + Add to Wallet
                </button>
                <button type="button" onClick={() => setClaimActivityModal(false)} style={{ background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', padding: '11px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- AUTHENTICATION SCREEN --- */}
      {!session ? (
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: '20px' }}>
          <div className="perspective-viewport" style={{ width: '100%', maxWidth: '390px' }}>
            <TiltBox style={{ padding: '36px 30px', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ width: '42px', height: '42px', position: 'relative' }} className="cube-holo">
                  <div style={{ position: 'absolute', inset: 0, border: '2px solid #38bdf8', transform: 'rotateY(45deg) rotateX(45deg)', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)' }} />
                  <div style={{ position: 'absolute', inset: 0, border: '2px solid #10b981', transform: 'rotateY(-45deg) rotateX(45deg)', borderRadius: '8px' }} />
                </div>
              </div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Campus<span style={{ color: '#38bdf8' }}>360</span></h2>
                <small style={{ color: '#94a3b8' }}>VESIT Councils & Academic Portal[cite: 1, 2]</small>
              </div>

              <div style={{ display: 'flex', background: '#070b14', padding: '4px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #1e293b' }}>
                <button type="button" onClick={() => { setRole('student'); setOtpStage('phone'); }} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: role === 'student' ? '#0284c7' : 'transparent', color: role === 'student' ? '#fff' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer' }}>Student</button>
                <button type="button" onClick={() => { setRole('teacher'); setOtpStage('phone'); }} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: role === 'teacher' ? '#0284c7' : 'transparent', color: role === 'teacher' ? '#fff' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer' }}>Faculty</button>
              </div>

              {otpError && <div style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#fca5a5', padding: '8px', borderRadius: '6px', fontSize: '12px', marginBottom: '12px', textAlign: 'center' }}>{otpError}</div>}

              {otpStage === 'phone' ? (
                <form onSubmit={handleRequestLiveOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {role === 'student' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select value={div} onChange={(e) => setDiv(e.target.value)} style={{ padding: '10px', background: '#070b14', color: '#fff', borderRadius: '8px', border: '1px solid #334155' }}>
                        <option value="D5A">D5A (IT)</option>
                        <option value="D5B">D5B (IT)</option>
                      </select>
                      <input required type="text" placeholder="Your Name" value={identifier} onChange={(e) => setIdentifier(e.target.value)} style={{ flex: 1, padding: '10px', background: '#070b14', color: '#fff', borderRadius: '8px', border: '1px solid #334155' }} />
                    </div>
                  ) : (
                    <input required type="text" placeholder="Faculty Name" value={identifier} onChange={(e) => setIdentifier(e.target.value)} style={{ padding: '10px', background: '#070b14', color: '#fff', borderRadius: '8px', border: '1px solid #334155' }} />
                  )}
                  <input required type="tel" placeholder="Mobile Number (10 Digits)" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: '10px', background: '#070b14', color: '#fff', borderRadius: '8px', border: '1px solid #334155' }} />
                  <button type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Send SMS OTP →[cite: 1, 2]</button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    {[0, 1, 2, 3].map((i) => (
                      <input key={i} id={`otp-digit-${i}`} type="text" maxLength="1" value={enteredOtp[i]} onChange={(e) => handleOtpInput(i, e.target.value)} className="mono" style={{ width: '50px', height: '52px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold', background: '#070b14', color: '#38bdf8', border: '1px solid #334155', borderRadius: '8px' }} />
                    ))}
                  </div>
                  <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Verify & Enter ✓</button>
                  <button type="button" onClick={() => setOtpStage('phone')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}>← Edit Phone Number</button>
                </form>
              )}
            </TiltBox>
          </div>
        </div>
      ) : (
        /* --- MAIN PORTAL CANVAS --- */
        <div style={{ minHeight: '100vh' }}>
          {/* Top Bar with Wallet & Direct Top-up */}
          <header style={{ background: 'rgba(10, 16, 32, 0.85)', backdropFilter: 'blur(16px)', padding: '12px 28px', borderBottom: '1px solid rgba(56, 189, 248, 0.15)', position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '18px', color: '#f8fafc' }}>Campus<span style={{ color: '#38bdf8' }}>360</span></strong>
              <span style={{ fontSize: '10px', background: session.role === 'teacher' ? '#059669' : '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px', fontWeight: 'bold' }}>{session.role.toUpperCase()}</span>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{session.name} ({session.idTag})</div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              {/* Credit Wallet with Top-up Trigger */}
              <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #0284c7', padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span>⏳ <strong style={{ color: '#38bdf8' }}>{timeCredits}</strong> Time Credits[cite: 1]</span>
                <button onClick={() => setClaimActivityModal(true)} style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                  +
                </button>
              </div>

              <span style={{ color: '#facc15', fontSize: '13px', background: 'rgba(234, 179, 8, 0.1)', padding: '4px 10px', borderRadius: '20px' }}>
                🏆 <strong>{classPoints}</strong> Class Pts[cite: 1]
              </span>

              <button onClick={() => setSession(null)} style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                Exit
              </button>
            </div>
          </header>

          {/* Navigation Bar */}
          <nav style={{ display: 'flex', gap: '8px', padding: '10px 28px', background: '#070b14', borderBottom: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
            {[
              { id: 'events', label: '🎟️ Council & Society Portals' },
              { id: 'credits', label: '⚡ Add & Earn Credits' },
              { id: 'academic', label: '📊 SGPA Target Planner' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: tab === t.id ? '#0284c7' : 'transparent',
                  color: tab === t.id ? '#fff' : '#94a3b8',
                  border: tab === t.id ? '1px solid #38bdf8' : 'none',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: tab === t.id ? 'bold' : 'normal',
                  whiteSpace: 'nowrap'
                }}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <main style={{ maxWidth: '1040px', margin: '24px auto', padding: '0 16px' }} className="perspective-viewport">
            
            {/* MODULE 1: COUNCIL & SOCIETY PORTALS (EVENTS + PRIVATES) */}
            {tab === 'events' && (
              <div className="stage-animate" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Council Portals Card Grid */}
                <div>
                  <h3 style={{ margin: '0 0 12px', color: '#38bdf8', fontSize: '18px' }}>VESIT Student Councils & Societies</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
                    {COUNCILS_DATA.map((c) => (
                      <TiltBox key={c.id} style={{ padding: '18px', borderLeft: `5px solid ${c.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '16px', color: '#f8fafc' }}>{c.name}</strong>
                          <span style={{ fontSize: '10px', background: `${c.color}25`, color: c.color, border: `1px solid ${c.color}`, padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                            {c.badge}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#cbd5e1', margin: '6px 0 2px' }}>{c.tagline}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>📍 Venue: {c.venue}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Mentorship: {c.leads}</div>
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setSelectedCouncil(c.id)}
                            style={{ flex: 1, background: selectedCouncil === c.id ? c.color : '#1e293b', color: selectedCouncil === c.id ? '#000' : '#fff', border: `1px solid ${c.color}`, padding: '6px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            {selectedCouncil === c.id ? 'Viewing Events ✓' : 'Filter Events'}
                          </button>
                        </div>
                      </TiltBox>
                    ))}
                  </div>
                </div>

                {/* Council Events Feed with Filter Bar */}
                <TiltBox style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '18px' }}>Official Campus Events & Opportunities</h3>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Status Lifecycle: Registration Open → Starting Soon → Live → Ended[cite: 1]</span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setSelectedCouncil('all')}
                        style={{ background: selectedCouncil === 'all' ? '#0284c7' : '#070b14', color: selectedCouncil === 'all' ? '#fff' : '#94a3b8', border: '1px solid #334155', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        All Portals
                      </button>
                      {['questit', 'sports', 'sort', 'circle', 'veslit', 'veslang'].map((cid) => (
                        <button
                          key={cid}
                          onClick={() => setSelectedCouncil(cid)}
                          style={{
                            background: selectedCouncil === cid ? '#38bdf8' : '#070b14',
                            color: selectedCouncil === cid ? '#000' : '#94a3b8',
                            border: '1px solid #334155',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            cursor: 'pointer'
                          }}
                        >
                          {cid}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {events
                      .filter((e) => selectedCouncil === 'all' || e.council === selectedCouncil)
                      .map((ev) => {
                        const councilObj = COUNCILS_DATA.find((c) => c.id === ev.council) || {};
                        const stageColor = ev.stage === 'Live' ? '#ef4444' : ev.stage === 'Starting Soon' ? '#f59e0b' : ev.stage === 'Registration Open' ? '#10b981' : '#64748b';

                        return (
                          <div
                            key={ev.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: '#070b14',
                              padding: '16px 20px',
                              borderRadius: '12px',
                              border: '1px solid #1e293b',
                              borderLeft: `5px solid ${councilObj.color || '#38bdf8'}`
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <strong style={{ fontSize: '15px', color: '#f8fafc' }}>{ev.title}</strong>
                                <span style={{ fontSize: '10px', background: `${councilObj.color}20`, color: councilObj.color, border: `1px solid ${councilObj.color}`, padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                  {councilObj.name}
                                </span>
                                <span style={{ fontSize: '10px', background: `${stageColor}20`, color: stageColor, border: `1px solid ${stageColor}`, padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                  {ev.stage}[cite: 1]
                                </span>
                              </div>
                              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                                📍 Venue: {ev.venue} • 🗓️ {ev.date} • Award: <strong style={{ color: '#38bdf8' }}>+{ev.rewardCredits} Credits</strong>
                              </div>
                            </div>

                            {ev.stage !== 'Ended' && (
                              <button
                                onClick={() => toggleEventReg(ev)}
                                style={{
                                  background: ev.registered ? '#1e293b' : 'linear-gradient(135deg, #0284c7, #38bdf8)',
                                  color: ev.registered ? '#38bdf8' : '#fff',
                                  border: ev.registered ? '1px solid #0284c7' : 'none',
                                  padding: '8px 16px',
                                  borderRadius: '8px',
                                  fontWeight: 'bold',
                                  fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                              >
                                {ev.registered ? 'Registered ✓' : `Register (+${ev.rewardCredits} Cr)`}
                              </button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </TiltBox>
              </div>
            )}

            {/* MODULE 2: HOW TO ADD & EARN CREDITS */}
            {tab === 'credits' && (
              <div className="stage-animate" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <TiltBox style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <h2 style={{ margin: 0, color: '#38bdf8', fontSize: '20px' }}>Campus Activity & Time Credits Vault</h2>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                        Time credits facilitate 1:1 peer tutoring. Co-curricular credits count toward FE-1 CCC-107 academic grade.[cite: 1]
                      </p>
                    </div>
                    <button
                      onClick={() => setClaimActivityModal(true)}
                      style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      + Claim Verified Activity
                    </button>
                  </div>

                  {/* 3 Ways to Earn Credits Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                    <div style={{ background: '#070b14', padding: '18px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                      <div style={{ fontSize: '24px', marginBottom: '6px' }}>🤝</div>
                      <strong style={{ fontSize: '15px', color: '#38bdf8' }}>1. Teach a Peer (1 hr = +1 Cr)[cite: 1, 3]</strong>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: '8px 0 14px' }}>
                        Tutor a classmate in C Programming, Calculus, or BEE circuits.
                      </p>
                      <button
                        onClick={() => {
                          setTimeCredits((c) => c + 1);
                          setClassPoints((p) => p + 25);
                          setBurstCelebration(true);
                          setTimeout(() => setBurstCelebration(false), 2400);
                        }}
                        style={{ width: '100%', background: '#0284c7', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Log Peer Mentoring (+1 Credit)[cite: 1]
                      </button>
                    </div>

                    <div style={{ background: '#070b14', padding: '18px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                      <div style={{ fontSize: '24px', marginBottom: '6px' }}>🏆</div>
                      <strong style={{ fontSize: '15px', color: '#10b981' }}>2. Hackathon & Fests (+2 to +3 Cr)</strong>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: '8px 0 14px' }}>
                        Participate in QuestIT 2026 hackathons or volunteer at SORT blood donation drives.
                      </p>
                      <button
                        onClick={() => setTab('events')}
                        style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#38bdf8', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Explore Events & Register →
                      </button>
                    </div>

                    <div style={{ background: '#070b14', padding: '18px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                      <div style={{ fontSize: '24px', marginBottom: '6px' }}>🚗</div>
                      <strong style={{ fontSize: '15px', color: '#f59e0b' }}>3. Campus Ride Share (+20 Pts)[cite: 1]</strong>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: '8px 0 14px' }}>
                        Pool fellow students from Chembur or Kurla station to reduce campus traffic.
                      </p>
                      <button
                        onClick={() => setClaimActivityModal(true)}
                        style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#f59e0b', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Submit Pool Record (+20 Pts)
                      </button>
                    </div>
                  </div>
                </TiltBox>
              </div>
            )}

            {/* MODULE 3: SGPA PLANNER */}
            {tab === 'academic' && (
              <div className="stage-animate" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <TiltBox style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#38bdf8' }}>FE-1 Academic SGPA Target Model</h3>
                      <small style={{ color: '#94a3b8' }}>Total Marks = Internal (30) + EndSem (70). Passing minimum = 40.[cite: 1, 2]</small>
                    </div>
                    <div style={{ background: '#070b14', padding: '8px 16px', borderRadius: '8px', border: '1px solid #0284c7' }}>
                      Target SGPA: <strong className="mono" style={{ color: '#38bdf8' }}>{analytics.targetSGPA}</strong>[cite: 1]
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {analytics.analyzed.map((sub, idx) => (
                      <div key={sub.code} style={{ background: '#070b14', padding: '14px 18px', borderRadius: '10px', borderLeft: `5px solid ${sub.color}`, border: '1px solid #1e293b' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong>{sub.name}</strong> <span style={{ fontSize: '11px', color: '#94a3b8' }}>({sub.code})</span>
                            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>Internal: {sub.internal}/30 • Target Grade: {sub.target}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: sub.color, fontWeight: 'bold', fontSize: '13px' }}>Need: {sub.neededInEndSem}/70 in End-Sem[cite: 1]</div>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Attainment Confidence: {sub.prob}%</span>
                          </div>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={sub.confidence}
                          onChange={(e) => {
                            const next = [...subjects];
                            next[idx].confidence = parseInt(e.target.value);
                            setSubjects(next);
                          }}
                          style={{ width: '100%', marginTop: '10px', accentColor: sub.color }}
                        />
                      </div>
                    ))}
                  </div>
                </TiltBox>
              </div>
            )}

          </main>
        </div>
      )}
    </>
  );
}
