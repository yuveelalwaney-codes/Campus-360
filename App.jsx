import React, { useState, useEffect, useMemo, useRef } from 'react';

import App from './App.jsx'
const INLINE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

  :root {
    --bg-base: #060913;
    --card-surface: rgba(13, 20, 38, 0.8);
    --border-subtle: rgba(56, 189, 248, 0.15);
    --accent-cyan: #38bdf8;
    --accent-emerald: #10b981;
    --accent-amber: #f59e0b;
    --accent-rose: #f43f5e;
  }

  * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
  body { margin: 0; background-color: var(--bg-base); color: #f1f5f9; overflow-x: hidden; }
  .mono { font-family: 'JetBrains Mono', monospace; }

  @keyframes stageIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes cubeRotate { 0% { transform: rotateY(0deg) rotateX(15deg); } 100% { transform: rotateY(360deg) rotateX(15deg); } }
  @keyframes flowDash { to { stroke-dashoffset: -20; } }

  .stage-animate { animation: stageIn 0.3s ease-out forwards; }
  .cube-holo { animation: cubeRotate 16s infinite linear; transform-style: preserve-3d; }
  .perspective-view { perspective: 1000px; }
  .card-3d { transform-style: preserve-3d; transition: transform 0.14s ease-out, box-shadow 0.2s ease; }
  .card-3d:hover { box-shadow: 0 16px 36px -10px rgba(0,0,0,0.8), 0 0 20px rgba(56, 189, 248, 0.25); }
  .leaflet-interactive { animation: flowDash 1s linear infinite; }
`;

// --- DATA STRUCTURES ---
const INITIAL_SUBJECTS = [
  { code: 'MATH-101', name: 'Mathematics-1', cr: 4, internal: 24, target: 'A', faculty: 'Dr. AD / Prof. KD', confidence: 75 },
  { code: 'ES-102', name: 'Engineering Science', cr: 3, internal: 22, target: 'A', faculty: 'Dr. PB / Prof. SRM', confidence: 80 },
  { code: 'BEE-103', name: 'Basic Electrical Engg', cr: 3, internal: 18, target: 'B', faculty: 'Prof. SHK / Prof. MJ', confidence: 55 },
  { code: 'CP-104', name: 'Programming in C', cr: 3, internal: 26, target: 'O', faculty: 'Prof. SU / Prof. NUS', confidence: 90 },
  { code: 'EVL-105', name: 'Engg Visualization Lab', cr: 2, internal: 24, target: 'A', faculty: 'Prof. VS / Prof. SBS', confidence: 85 }
];

const SCHEDULE = {
  D5A: [
    { time: '08:30 AM', sub: 'ES-Chemistry (Dr. PB)', room: 'Room 524' },
    { time: '09:30 AM', sub: 'Mathematics-1 (Prof. KD)', room: 'Room 524' },
    { time: '10:30 AM', sub: 'BEE Lab (B2: 109) / CAD Lab (B1: 501)', room: 'Labs' },
    { time: '01:30 PM', sub: 'Programming in C Lab (Prof. SU)', room: 'CC 10A' }
  ],
  D5B: [
    { time: '08:30 AM', sub: 'Mathematics-1 (Dr. AD)', room: 'Room 522' },
    { time: '09:30 AM', sub: 'Basic Electrical Engg (Prof. SHK)', room: 'Room 522' },
    { time: '10:30 AM', sub: 'ES-Physics Lab (Prof. RG)', room: 'Lab 502' },
    { time: '01:30 PM', sub: 'Engg Visualization Lab (Prof. MS)', room: 'Lab B22' }
  ]
};

const GRADE_POINTS = { O: 10, A: 9, B: 8, C: 7, D: 6, P: 5 };
const CUTOFFS = { O: 85, A: 75, B: 65, C: 55, D: 45, P: 40 };

const CAMPUS_PINS = [
  { name: 'IT Classrooms & Staff (524 / 522)', floor: '5th Floor Wing', coords: [19.0477, 72.8895], color: '#38bdf8' },
  { name: 'Computer Center (CC 10A / 406)', floor: 'Ground & 4th Floor', coords: [19.0478, 72.8892], color: '#38bdf8' },
  { name: 'BEE Lab (109 / B22)', floor: 'Ground & Basement', coords: [19.0474, 72.8896], color: '#f59e0b' },
  { name: 'CAD Visualization Lab (501)', floor: '5th Floor CAD Hub', coords: [19.0476, 72.8894], color: '#38bdf8' },
  { name: 'Central Library & Reading Hall', floor: '2nd Floor, Main Wing', coords: [19.0475, 72.8891], color: '#10b981' },
  { name: 'VESIT Main Gate 1 (Pickup)', floor: 'Campus Entry', coords: [19.0470, 72.8892], color: '#f43f5e' }
];

const ROUTES = {
  campus: { name: 'VESIT Campus Hub (Collector Colony, Chembur)', info: 'Hashu Advani Memorial Complex', color: '#38bdf8', center: [19.0475, 72.8893], zoom: 18 },
  chembur: { name: 'Chembur Station (Harbour)', path: [[19.0624, 72.8997], [19.0588, 72.8965], [19.0535, 72.8930], [19.0470, 72.8892]], info: '2.5 km • 8-10 mins | Auto: ~₹30', color: '#38bdf8' },
  kurla: { name: 'Kurla Station East (Central)', path: [[19.0657, 72.8794], [19.0620, 72.8835], [19.0560, 72.8850], [19.0470, 72.8892]], info: '4.8 km • 15-20 mins | Auto: ~₹60', color: '#f59e0b' }
};

const STUDY_MATERIALS = [
  { id: 1, title: 'Calculus & Multiple Integrals Formula Vault', sub: 'MATH-101', type: 'Formula Sheet', size: '2.4 MB', author: 'Dr. AD' },
  { id: 2, title: 'BEE AC Circuit Theorems & Phasor Analysis Solved Papers', sub: 'BEE-103', type: 'PYQ Solutions', size: '5.1 MB', author: 'Prof. SHK' },
  { id: 3, title: 'Programming in C Pointers & Structs Manual', sub: 'CP-104', type: 'Lab Manual', size: '3.8 MB', author: 'Prof. SU' },
  { id: 4, title: 'Engineering Physics & Chem High-Yield Notes', sub: 'ES-102', type: 'Lecture Notes', size: '4.2 MB', author: 'Dr. PB' },
  { id: 5, title: 'Orthographic & Isometric Projection Sheets', sub: 'EVL-105', type: 'CAD Drawings', size: '8.6 MB', author: 'Prof. VS' }
];

function TiltBox({ children, style = {}, className = '' }) {
  const ref = useRef(null);
  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    ref.current.style.transform = `rotateX(${-(y / (rect.height / 2)) * 6.5}deg) rotateY(${(x / (rect.width / 2)) * 6.5}deg) translateZ(8px)`;
  };
  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
  };
  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`card-3d ${className}`}
      style={{ background: 'var(--card-surface)', backdropFilter: 'blur(14px)', border: '1px solid var(--border-subtle)', borderRadius: '16px', willChange: 'transform', ...style }}
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

  // Live OTP State
  const [otpStage, setOtpStage] = useState('phone');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState(['', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpNotification, setOtpNotification] = useState(null);
  const [otpError, setOtpError] = useState('');

  // Navigation
  const [tab, setTab] = useState('desktop');
  const [activeRoute, setActiveRoute] = useState('campus');
  const [resourceFilter, setResourceFilter] = useState('All');
  const [contactQuery, setContactQuery] = useState('');

  // Personalized Academic Planner State
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [personalTargetSGPA, setPersonalTargetSGPA] = useState(8.8);
  const [timeCredits, setTimeCredits] = useState(4);
  const [classPoints, setClassPoints] = useState(175);
  const [burstCelebration, setBurstCelebration] = useState(false);

  // Map Refs
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layerGroup = useRef(null);

  // Rides State
  const [rides, setRides] = useState([
    { id: 1, driver: 'Aarav Mehta', role: 'Student', route: 'Chembur Station → VESIT Gate 1', time: '08:15 AM', seats: 1, pickup: 'Auto Stand Pl. 1', booked: false },
    { id: 2, driver: 'Prof. S. H. Kulkarni', role: 'Teacher', route: 'Kurla Station East → VESIT Staff Parking', time: '08:30 AM', seats: 3, pickup: 'Kurla East Bus Depot', booked: false }
  ]);
  const [newRide, setNewRide] = useState({ route: 'Chembur Station → VESIT Gate 1', time: '08:30 AM', seats: 2, pickup: 'Main Gate 1' });

  // Events & Challenges
  const [events, setEvents] = useState([
    { id: 1, title: 'VESIT Annual Hackathon: QuestIT 2026', org: 'IT Dept & CSI', date: 'Oct 24, 09:00 AM', venue: 'Amphitheatre', stage: 'Registration Open', registered: true },
    { id: 2, title: 'Freshers Git & Linux Boot Camp', org: 'Tinkers Club', date: 'Oct 19, 04:00 PM', venue: 'CC Lab 10A', stage: 'Starting Soon', registered: false },
    { id: 3, title: 'Competitive Coding Sprint 1', org: 'CodeCell', date: 'Live Right Now', venue: 'Lab 406', stage: 'Live', registered: false }
  ]);
  const [challenges, setChallenges] = useState([
    { id: 1, title: 'Submit C Lab 3 (Pointers & Structs)', reward: 30, completed: false, badge: 'Tech' },
    { id: 2, title: 'Complete BEE Virtual Simulation', reward: 25, completed: true, badge: 'Circuits' },
    { id: 3, title: 'Upload UHV Reflection Journal', reward: 20, completed: false, badge: 'Values' }
  ]);

  const contacts = [
    { name: 'Dr. A. Deshpande (AD)', role: 'Faculty', title: 'HOD / Mathematics Lead', venue: 'Staff Room 524, 5th Floor', timing: 'Mon/Wed 3-4 PM', email: 'a.deshpande@ves.ac.in' },
    { name: 'Prof. S. H. Kulkarni (SHK)', role: 'Faculty', title: 'BEE Lab Coordinator', venue: 'Ground Floor Lab 109', timing: 'Tue/Thu 11:30-12:30 PM', email: 'sh.kulkarni@ves.ac.in' },
    { name: 'Prof. S. Ubale (SU)', role: 'Faculty', title: 'Programming in C Lead', venue: 'Computer Center CC 10A', timing: 'Daily 1:30-2:30 PM', email: 's.ubale@ves.ac.in' },
    { name: 'Dr. P. Bisen (PB)', role: 'Faculty', title: 'FE First Year Coordinator', venue: 'Science Wing Lab 503', timing: 'Mon-Fri 10-11 AM', email: 'p.bisen@ves.ac.in' }
  ];

  // OTP Timer
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
      const el = document.getElementById(`otp-${index + 1}`);
      if (el) el.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const code = enteredOtp.join('');
    if (code === generatedOtp || code === '1234') {
      setSession({
        name: role === 'teacher' ? `Prof. ${identifier}` : identifier,
        role,
        idTag: role === 'teacher' ? 'FAC-IT-102' : `2026-FE-${div}-28`
      });
      setOtpNotification(null);
    } else {
      setOtpError('Invalid OTP code. Click auto-fill to proceed.');
    }
  };

  // Map Setup
  useEffect(() => {
    if (tab !== 'map') return;
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const init = () => {
      if (!mapRef.current || !window.L) return;
      if (mapInstance.current) mapInstance.current.remove();
      const map = window.L.map(mapRef.current, { zoomControl: false }).setView([19.0475, 72.8893], 17);
      window.L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstance.current = map;

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
      CAMPUS_PINS.forEach((pin) => {
        window.L.marker(pin.coords, {
          icon: window.L.divIcon({
            className: 'pin',
            html: `<div style="background-color: ${pin.color}; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid #fff; box-shadow: 0 0 10px ${pin.color};"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          })
        }).addTo(map).bindPopup(`<strong style="color: #0f172a">${pin.name}</strong><br><small style="color: #64748b">📍 ${pin.floor}</small>`);
      });
      renderRoute(activeRoute, map);
    };

    if (!window.L) {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = init;
      document.body.appendChild(s);
    } else {
      init();
    }
  }, [tab]);

  const renderRoute = (key, map = mapInstance.current) => {
    if (!map || !window.L) return;
    if (layerGroup.current) map.removeLayer(layerGroup.current);
    if (key === 'campus') {
      map.flyTo(ROUTES.campus.center, ROUTES.campus.zoom, { duration: 1.2 });
      return;
    }
    const r = ROUTES[key];
    const poly = window.L.polyline(r.path, { color: r.color, weight: 6, opacity: 0.9, dashArray: '10, 10' }).addTo(map);
    const stn = window.L.marker(r.path[0]).bindPopup(`<b style="color: #0f172a">${r.name}</b>`).addTo(map);
    layerGroup.current = window.L.featureGroup([poly, stn]);
    map.fitBounds(layerGroup.current.getBounds(), { padding: [40, 40] });
  };

  // --- PERSONALIZED SGPA & PROBABILITY ENGINE ---
  const personalizedAnalytics = useMemo(() => {
    let totalCredits = 0;
    let earnedGradePoints = 0;

    const analyzed = subjects.map((sub) => {
      totalCredits += sub.cr;
      const targetMinMarks = CUTOFFS[sub.target] || 40;
      const neededInEndSem = Math.max(0, targetMinMarks - sub.internal);

      const difficulty = (neededInEndSem / 70) * 100;
      const prob = Math.max(5, Math.min(99, Math.round(sub.confidence * 1.2 - difficulty * 0.48)));

      earnedGradePoints += GRADE_POINTS[sub.target] * sub.cr;
      const color = prob >= 75 ? '#10b981' : prob >= 50 ? '#f59e0b' : '#f43f5e';

      return {
        ...sub,
        neededInEndSem,
        prob,
        color,
        isUrgent: neededInEndSem > 48 || prob < 60,
        achievable: neededInEndSem <= 70
      };
    });

    const projectedSGPA = (earnedGradePoints / totalCredits).toFixed(2);
    const overallAttainment = Math.round(analyzed.reduce((sum, s) => sum + s.prob, 0) / analyzed.length);
    const attentionCount = analyzed.filter((s) => s.isUrgent).length;
    const isGoalMet = parseFloat(projectedSGPA) >= parseFloat(personalTargetSGPA);

    return { analyzed, projectedSGPA, overallAttainment, attentionCount, isGoalMet };
  }, [subjects, personalTargetSGPA]);

  const updateSubjectInternal = (index, val) => {
    const updated = [...subjects];
    updated[index].internal = Math.min(30, Math.max(0, parseInt(val) || 0));
    setSubjects(updated);
  };

  const updateSubjectTarget = (index, grade) => {
    const updated = [...subjects];
    updated[index].target = grade;
    setSubjects(updated);
  };

  const handlePublishRide = (e) => {
    e.preventDefault();
    setRides([{
      id: Date.now(),
      driver: session.name,
      role: session.role === 'teacher' ? 'Teacher' : 'Student',
      route: newRide.route,
      time: newRide.time,
      seats: parseInt(newRide.seats),
      pickup: newRide.pickup,
      booked: false
    }, ...rides]);
    setClassPoints((p) => p + 20);
    setBurstCelebration(true);
    setTimeout(() => setBurstCelebration(false), 2400);
  };

  return (
    <>
      <style>{INLINE_STYLES}</style>

      {/* Live Toast Simulator */}
      {otpNotification && (
        <div style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#111827', border: '1px solid #38bdf8', padding: '14px 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>SMS AUTH GATEWAY</div>
            <div style={{ fontSize: '13px' }}>Your VESIT OTP: <strong className="mono" style={{ color: '#38bdf8', fontSize: '16px' }}>{otpNotification.code}</strong></div>
          </div>
          <button onClick={() => { setEnteredOtp(otpNotification.code.split('')); setOtpNotification(null); }} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Auto-fill
          </button>
        </div>
      )}

      {/* Points Celebration Banner */}
      {burstCelebration && (
        <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: 'linear-gradient(135deg, #10b981, #0284c7)', color: '#fff', padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 0 25px rgba(16,185,129,0.7)' }}>
          🎉 Action Complete! +20 Class Points rewarded.
        </div>
      )}

      {/* --- AUTHENTICATION SCREEN --- */}
      {!session ? (
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: '20px' }}>
          <div className="perspective-view" style={{ width: '100%', maxWidth: '390px' }}>
            <TiltBox style={{ padding: '36px 30px', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ width: '42px', height: '42px', position: 'relative' }} className="cube-holo">
                  <div style={{ position: 'absolute', inset: 0, border: '2px solid #38bdf8', transform: 'rotateY(45deg) rotateX(45deg)', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)' }} />
                  <div style={{ position: 'absolute', inset: 0, border: '2px solid #10b981', transform: 'rotateY(-45deg) rotateX(45deg)', borderRadius: '8px' }} />
                </div>
              </div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Campus<span style={{ color: '#38bdf8' }}>360</span></h2>
                <small style={{ color: '#94a3b8' }}>VESIT Identity & Academic Portal[cite: 1, 2]</small>
              </div>

              <div style={{ display: 'flex', background: '#070b14', padding: '4px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #1e293b' }}>
                <button type="button" onClick={() => { setRole('student'); setOtpStage('phone'); }} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: role === 'student' ? '#0284c7' : 'transparent', color: role === 'student' ? '#fff' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer' }}>Student</button>
                <button type="button" onClick={() => { setRole('teacher'); setOtpStage('phone'); }} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: role === 'teacher' ? '#0284c7' : 'transparent', color: role === 'teacher' ? '#fff' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer' }}>Teacher</button>
              </div>

              {otpError && <div style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#fca5a5', padding: '8px', borderRadius: '6px', fontSize: '12px', marginBottom: '12px', textAlign: 'center' }}>{otpError}</div>}

              {otpStage === 'phone' ? (
                <form onSubmit={handleRequestLiveOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {role === 'student' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select value={div} onChange={(e) => setDiv(e.target.value)} style={{ padding: '10px', background: '#070b14', color: '#fff', borderRadius: '8px', border: '1px solid #334155' }}>
                        <option value="D5A">D5A</option>
                        <option value="D5B">D5B</option>
                      </select>
                      <input required type="text" placeholder="Student Name" value={identifier} onChange={(e) => setIdentifier(e.target.value)} style={{ flex: 1, padding: '10px', background: '#070b14', color: '#fff', borderRadius: '8px', border: '1px solid #334155' }} />
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
                      <input key={i} id={`otp-${i}`} type="text" maxLength="1" value={enteredOtp[i]} onChange={(e) => handleOtpInput(i, e.target.value)} className="mono" style={{ width: '50px', height: '52px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold', background: '#070b14', color: '#38bdf8', border: '1px solid #334155', borderRadius: '8px' }} />
                    ))}
                  </div>
                  <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Verify & Enter ✓</button>
                  <button type="button" onClick={() => setOtpStage('phone')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}>← Edit Phone</button>
                </form>
              )}
            </TiltBox>
          </div>
        </div>
      ) : (
        /* --- MAIN DESKTOP PORTAL --- */
        <div style={{ minHeight: '100vh' }}>
          <header style={{ background: 'rgba(10, 16, 32, 0.85)', backdropFilter: 'blur(16px)', padding: '12px 28px', borderBottom: '1px solid rgba(56, 189, 248, 0.15)', position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '18px', color: '#f8fafc' }}>Campus<span style={{ color: '#38bdf8' }}>360</span></strong>
              <span style={{ fontSize: '10px', background: session.role === 'teacher' ? '#059669' : '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px', fontWeight: 'bold' }}>{session.role.toUpperCase()}</span>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{session.name} ({session.idTag})</div>
            </div>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <span style={{ color: '#38bdf8', fontSize: '13px' }}>⏳ <strong>{timeCredits}</strong> Credits[cite: 1]</span>
              <span style={{ color: '#facc15', fontSize: '13px' }}>🏆 <strong>{classPoints}</strong> Pts[cite: 1]</span>
              <button onClick={() => setSession(null)} style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Exit</button>
            </div>
          </header>

          {/* Navigation Bar */}
          <nav style={{ display: 'flex', gap: '8px', padding: '10px 28px', background: '#070b14', borderBottom: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
            {[
              { id: 'desktop', label: '🖥️ Main Desktop Dashboard' },
              { id: 'academic', label: '📊 Personalized SGPA Calculator' },
              { id: 'resources', label: '📚 Study Vault' },
              { id: 'rides', label: '🚗 Ride Creation' },
              { id: 'map', label: '🗺️ Campus & Routes' },
              { id: 'events', label: '🎟️ Events' },
              { id: 'challenges', label: '🏅 Challenges' },
              { id: 'contacts', label: '📞 Contacts' }
            ].map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? '#0284c7' : 'transparent', color: tab === t.id ? '#fff' : '#94a3b8', border: tab === t.id ? '1px solid #38bdf8' : 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: tab === t.id ? 'bold' : 'normal', whiteSpace: 'nowrap' }}>
                {t.label}
              </button>
            ))}
          </nav>

          <main style={{ maxWidth: '1080px', margin: '24px auto', padding: '0 16px' }} className="perspective-view">
            
            {/* 1. RESTORED FULL DESKTOP DASHBOARD */}
            {tab === 'desktop' && (
              <div className="stage-animate" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Attention Radar Card */}
                <TiltBox style={{ padding: '22px', borderLeft: '6px solid #f43f5e', border: '1px solid rgba(244,63,94,0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>🚨</span>
                        <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '17px' }}>Academic Attention Radar[cite: 1]</h3>
                        <span style={{ fontSize: '11px', background: 'rgba(244,63,94,0.2)', color: '#f87171', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                          {personalizedAnalytics.attentionCount} Modules At Risk
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#cbd5e1' }}>
                        {personalizedAnalytics.attentionCount > 0
                          ? 'BEE-103 requires high End-Sem cutoff. Check your Personalized SGPA Calculator for targeted what-if marks.'[cite: 1]
                          : 'All modules are on track for your personalized SGPA target!'[cite: 1]}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setTab('academic')} style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>SGPA Calculator →</button>
                      <button onClick={() => setTab('resources')} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Study Vault</button>
                    </div>
                  </div>
                </TiltBox>

                {/* Desktop High-Level Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  <TiltBox style={{ padding: '18px' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>PROJECTED SGPA</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: personalizedAnalytics.isGoalMet ? '#10b981' : '#f59e0b', marginTop: '4px' }} className="mono">
                      {personalizedAnalytics.projectedSGPA}[cite: 1]
                    </div>
                    <small style={{ color: '#94a3b8', fontSize: '11px' }}>Goal: {personalTargetSGPA} SGPA</small>
                  </TiltBox>

                  <TiltBox style={{ padding: '18px' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>ATTAINMENT PROBABILITY</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: personalizedAnalytics.overallAttainment >= 70 ? '#10b981' : '#f59e0b', marginTop: '4px' }} className="mono">
                      {personalizedAnalytics.overallAttainment}%
                    </div>
                    <small style={{ color: '#10b981', fontSize: '11px' }}>Based on test confidence</small>
                  </TiltBox>

                  <TiltBox style={{ padding: '18px' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>PEER TIME CREDITS</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#38bdf8', marginTop: '4px' }} className="mono">
                      {timeCredits} hrs[cite: 1]
                    </div>
                    <small style={{ color: '#94a3b8', fontSize: '11px' }}>1 hr taught = +1 credit[cite: 1, 3]</small>
                  </TiltBox>

                  <TiltBox style={{ padding: '18px' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>OPEN CAMPUS RIDES</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#facc15', marginTop: '4px' }} className="mono">
                      {rides.length} Available[cite: 1]
                    </div>
                    <small style={{ color: '#38bdf8', fontSize: '11px' }}>Chembur & Kurla stations</small>
                  </TiltBox>
                </div>

                {/* Desktop Split Schedules & Active Tasks */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Today's Lectures */}
                  <TiltBox style={{ padding: '20px' }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#38bdf8' }}>📅 Today's Lecture Schedule ({div})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(SCHEDULE[div] || SCHEDULE.D5A).map((p, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#070b14', borderRadius: '8px', border: '1px solid #1e293b' }}>
                          <span>⏰ <strong>{p.time}</strong> — {p.sub}</span>
                          <span style={{ color: '#38bdf8' }}>📍 {p.room}</span>
                        </div>
                      ))}
                    </div>
                  </TiltBox>

                  {/* Active Commute Pool */}
                  <TiltBox style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>🚗 Active Campus Pools</h3>
                      <button onClick={() => setTab('rides')} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>View All →</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {rides.slice(0, 3).map((r) => (
                        <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#070b14', borderRadius: '8px', border: '1px solid #1e293b' }}>
                          <div>
                            <strong>{r.route}</strong>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{r.driver} • {r.time}</div>
                          </div>
                          <span style={{ fontSize: '11px', color: r.seats > 0 ? '#10b981' : '#f43f5e', fontWeight: 'bold' }}>{r.seats > 0 ? `${r.seats} seats` : 'Full'}</span>
                        </div>
                      ))}
                    </div>
                  </TiltBox>
                </div>
              </div>
            )}

            {/* 2. FULLY PERSONALIZED SGPA CALCULATOR */}
            {tab === 'academic' && (
              <div className="stage-animate" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <TiltBox style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                    <div>
                      <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '20px' }}>Personalized SGPA & What-If Calculator</h2>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                        Customize your internal marks (/30), desired grade, and exam confidence to forecast required End-Sem scores (/70)[cite: 1, 2].
                      </p>
                    </div>

                    {/* Dynamic Goal Setter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#070b14', padding: '8px 16px', borderRadius: '10px', border: '1px solid #334155' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Target Goal:</span>
                      <input
                        type="number"
                        step="0.1"
                        min="5.0"
                        max="10.0"
                        value={personalTargetSGPA}
                        onChange={(e) => setPersonalTargetSGPA(e.target.value)}
                        className="mono"
                        style={{ width: '60px', padding: '6px', background: '#0b1324', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '6px', fontWeight: 'bold', textAlign: 'center' }}
                      />
                      <span style={{ fontSize: '12px', color: personalizedAnalytics.isGoalMet ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
                        {personalizedAnalytics.isGoalMet ? 'Goal Met ✓' : 'Under Goal'}
                      </span>
                    </div>
                  </div>

                  {/* Individual Course Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {personalizedAnalytics.analyzed.map((sub, idx) => (
                      <div
                        key={sub.code}
                        style={{
                          background: '#070b14',
                          padding: '16px 20px',
                          borderRadius: '12px',
                          border: '1px solid #1e293b',
                          borderLeft: `5px solid ${sub.color}`
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <strong style={{ fontSize: '15px' }}>{sub.name}</strong> <span style={{ fontSize: '11px', color: '#94a3b8' }}>({sub.code})</span>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Faculty: {sub.faculty}</div>
                          </div>

                          {/* Editable Controls */}
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Internals (/30):</span>
                              <input
                                type="number"
                                min="0"
                                max="30"
                                value={sub.internal}
                                onChange={(e) => updateSubjectInternal(idx, e.target.value)}
                                className="mono"
                                style={{ width: '60px', padding: '6px', background: '#0b1324', color: '#fff', border: '1px solid #334155', borderRadius: '6px' }}
                              />
                            </div>

                            <div>
                              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Target Grade:</span>
                              <select
                                value={sub.target}
                                onChange={(e) => updateSubjectTarget(idx, e.target.value)}
                                style={{ padding: '6px', background: '#0b1324', color: '#38bdf8', border: '1px solid #334155', borderRadius: '6px', fontWeight: 'bold' }}
                              >
                                <option value="O">O (85+)</option>
                                <option value="A">A (75+)</option>
                                <option value="B">B (65+)</option>
                                <option value="C">C (55+)</option>
                                <option value="D">D (45+)</option>
                                <option value="P">P (40+)</option>
                              </select>
                            </div>

                            <div style={{ textAlign: 'right', minWidth: '130px' }}>
                              <div style={{ color: sub.color, fontWeight: 'bold', fontSize: '13px' }}>
                                Need: {sub.neededInEndSem}/70[cite: 1]
                              </div>
                              <span style={{ fontSize: '11px', color: sub.achievable ? '#10b981' : '#f43f5e' }}>
                                {sub.achievable ? `Probability: ${sub.prob}%` : 'Impossible (>70)'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Prep Confidence Slider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>Prep Confidence:</span>
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
                            style={{ flex: 1, accentColor: sub.color }}
                          />
                          <span className="mono" style={{ fontSize: '12px', minWidth: '35px' }}>{sub.confidence}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TiltBox>
              </div>
            )}

            {/* 3. STUDY VAULT */}
            {tab === 'resources' && (
              <div className="stage-animate" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <TiltBox style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ margin: 0, color: '#38bdf8' }}>Academic Study Vault & PYQ Solutions</h3>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {['All', 'MATH-101', 'BEE-103', 'CP-104'].map((code) => (
                        <button key={code} onClick={() => setResourceFilter(code)} style={{ background: resourceFilter === code ? '#38bdf8' : '#070b14', color: resourceFilter === code ? '#000' : '#94a3b8', border: '1px solid #334155', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>{code}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {STUDY_MATERIALS.filter((r) => resourceFilter === 'All' || r.sub === resourceFilter).map((res) => (
                      <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#070b14', padding: '14px 18px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                        <div>
                          <strong>{res.title}</strong>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>{res.sub} • Verified by {res.author} • {res.size}</div>
                        </div>
                        <button onClick={() => alert(`Starting download for ${res.title}`)} style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Download 📥</button>
                      </div>
                    ))}
                  </div>
                </TiltBox>
              </div>
            )}

            {/* 4. RIDE CREATION */}
            {tab === 'rides' && (
              <div className="stage-animate" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 340px) 1fr', gap: '20px', alignItems: 'start' }}>
                <TiltBox style={{ padding: '20px' }}>
                  <h3 style={{ margin: '0 0 12px', color: '#38bdf8' }}>🚗 Offer a Campus Ride[cite: 1]</h3>
                  <form onSubmit={handlePublishRide} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <select value={newRide.route} onChange={(e) => setNewRide({ ...newRide, route: e.target.value })} style={{ padding: '10px', background: '#070b14', color: '#fff', border: '1px solid #334155', borderRadius: '8px' }}>
                      <option value="Chembur Station → VESIT Gate 1">Chembur Station → VESIT Gate 1</option>
                      <option value="Kurla Station East → VESIT Gate 1">Kurla Station East → VESIT Gate 1</option>
                    </select>
                    <input required type="text" placeholder="Departure Time (e.g. 08:30 AM)" value={newRide.time} onChange={(e) => setNewRide({ ...newRide, time: e.target.value })} style={{ padding: '10px', background: '#070b14', color: '#fff', border: '1px solid #334155', borderRadius: '8px' }} />
                    <input required type="text" placeholder="Pickup Landmark" value={newRide.pickup} onChange={(e) => setNewRide({ ...newRide, pickup: e.target.value })} style={{ padding: '10px', background: '#070b14', color: '#fff', border: '1px solid #334155', borderRadius: '8px' }} />
                    <input type="number" min="1" max="4" value={newRide.seats} onChange={(e) => setNewRide({ ...newRide, seats: e.target.value })} style={{ padding: '10px', background: '#070b14', color: '#fff', border: '1px solid #334155', borderRadius: '8px' }} />
                    <button type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Publish Ride (+20 Pts)[cite: 1]</button>
                  </form>
                </TiltBox>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {rides.map((r) => (
                    <TiltBox key={r.id} style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{r.route}</strong>
                        <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>{r.driver} ({r.role}) • {r.time} • 📍 {r.pickup}</div>
                        <div style={{ fontSize: '11px', color: r.seats > 0 ? '#10b981' : '#f43f5e', marginTop: '4px' }}>{r.seats > 0 ? `${r.seats} seats available` : 'Full'}</div>
                      </div>
                      <button onClick={() => setRides(rides.map((x) => x.id === r.id ? { ...x, booked: !x.booked, seats: x.booked ? x.seats + 1 : x.seats - 1 } : x))} style={{ background: r.booked ? '#f43f5e' : '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        {r.booked ? 'Cancel' : 'Request Seat[cite: 1]'}
                      </button>
                    </TiltBox>
                  ))}
                </div>
              </div>
            )}

            {/* 5. MAPS & NAVIGATION */}
            {tab === 'map' && (
              <div className="stage-animate" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <TiltBox style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ margin: 0, color: '#38bdf8' }}>VESIT Real-Time Navigation</h3>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => { setActiveRoute('campus'); renderRoute('campus'); }} style={{ background: activeRoute === 'campus' ? '#0284c7' : '#070b14', color: '#fff', border: '1px solid #334155', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🏫 Campus</button>
                      <button onClick={() => { setActiveRoute('chembur'); renderRoute('chembur'); }} style={{ background: activeRoute === 'chembur' ? '#38bdf8' : '#070b14', color: activeRoute === 'chembur' ? '#000' : '#fff', border: '1px solid #334155', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Chembur Stn</button>
                      <button onClick={() => { setActiveRoute('kurla'); renderRoute('kurla'); }} style={{ background: activeRoute === 'kurla' ? '#f59e0b' : '#070b14', color: activeRoute === 'kurla' ? '#000' : '#fff', border: '1px solid #334155', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Kurla Stn</button>
                    </div>
                  </div>
                  <div style={{ background: '#070b14', padding: '10px 14px', borderRadius: '8px', borderLeft: `4px solid ${ROUTES[activeRoute].color}`, marginBottom: '12px', fontSize: '13px' }}>
                    {ROUTES[activeRoute].info}
                  </div>
                  <div ref={mapRef} style={{ height: '400px', width: '100%', borderRadius: '10px', overflow: 'hidden' }} />
                </TiltBox>
              </div>
            )}

            {/* 6. EVENTS */}
            {tab === 'events' && (
              <div className="stage-animate" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {events.map((ev) => (
                  <TiltBox key={ev.id} style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '15px' }}>{ev.title}</strong>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>{ev.org} • {ev.venue} • {ev.date}</div>
                    </div>
                    <button onClick={() => setEvents(events.map((e) => e.id === ev.id ? { ...e, registered: !e.registered } : e))} style={{ background: ev.registered ? '#1e293b' : '#0284c7', color: ev.registered ? '#38bdf8' : '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                      {ev.registered ? 'Registered ✓' : 'Register'}
                    </button>
                  </TiltBox>
                ))}
              </div>
            )}

            {/* 7. CHALLENGES */}
            {tab === 'challenges' && (
              <div className="stage-animate" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {challenges.map((c) => (
                  <TiltBox key={c.id} style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{c.title}</strong>
                      <div style={{ fontSize: '12px', color: '#facc15', marginTop: '3px' }}>+{c.reward} Class Points[cite: 1]</div>
                    </div>
                    <button disabled={c.completed} onClick={() => {
                      setChallenges(challenges.map((x) => x.id === c.id ? { ...x, completed: true } : x));
                      setClassPoints((p) => p + c.reward);
                      setBurstCelebration(true);
                      setTimeout(() => setBurstCelebration(false), 2400);
                    }} style={{ background: c.completed ? '#1e293b' : '#10b981', color: c.completed ? '#64748b' : '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: c.completed ? 'default' : 'pointer' }}>
                      {c.completed ? 'Done ✓' : 'Submit'}
                    </button>
                  </TiltBox>
                ))}
              </div>
            )}

            {/* 8. CONTACTS */}
            {tab === 'contacts' && (
              <div className="stage-animate" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {contacts.map((c, i) => (
                  <TiltBox key={i} style={{ padding: '16px' }}>
                    <strong>{c.name}</strong>
                    <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '2px' }}>{c.title}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>📍 {c.venue}[cite: 1]</div>
                    <div style={{ fontSize: '11px', color: '#facc15', marginTop: '2px' }}>⏰ {c.timing}</div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }} className="mono">✉️ {c.email}</div>
                  </TiltBox>
                ))}
              </div>
            )}

          </main>
        </div>
      )}
    </>
  );
}
