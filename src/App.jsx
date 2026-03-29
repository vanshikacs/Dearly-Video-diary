/**
 * App.jsx — unchanged except PageShell.
 *
 * The only fix: PageShell previously rendered doodles inside
 * `className="md:hidden"`, meaning desktop users on every inner page
 * saw zero ambient doodles. That wrapper is removed — doodles now
 * render on both desktop and mobile on all pages.
 *
 * Home.jsx handles its own doodles (density="full" on both breakpoints).
 * All other pages get density="page" via PageShell.
 */

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import ReflectionsPanel from './components/ReflectionsPanel';
import LettersToSelf from './components/LettersToSelf';
import MonthlyLettersViewer from './components/MonthlyLettersViewer';
import MomentsViewer from './components/MomentsViewer';
import ProfilePanel from './components/ProfilePanel';
import { AmbientDoodles } from './components/AmbientDoodles';

const ALL_LINKS = [
  { to: '/',            label: 'Home',   icon: HomeIcon,     activeIcon: HomeIconFilled    },
  { to: '/reflections', label: 'Reflect',icon: LeafIcon,     activeIcon: LeafIconFilled    },
  { to: '/letters',     label: 'Letters',icon: MailIcon,     activeIcon: MailIconFilled    },
  { to: '/monthly',     label: 'Monthly',icon: BookIcon,     activeIcon: BookIconFilled    },
  { to: '/moments',     label: 'Moments',icon: FilmIcon,     activeIcon: FilmIconFilled    },
  { to: '/profile',     label: 'Profile',icon: BlossomIcon,  activeIcon: BlossomIconFilled },
];

// ─── SVG icon set ─────────────────────────────────────────────────────────────
function HomeIcon()         { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function HomeIconFilled()   { return <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function LeafIcon()         { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 1-13 4.5L17 8z"/></svg>; }
function LeafIconFilled()   { return <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 1-13 4.5L17 8z"/></svg>; }
function MailIcon()         { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }
function MailIconFilled()   { return <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none"/></svg>; }
function BookIcon()         { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>; }
function BookIconFilled()   { return <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>; }
function FilmIcon()         { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>; }
function FilmIconFilled()   { return <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/><line x1="17" y1="2" x2="17" y2="22" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/><line x1="2" y1="12" x2="22" y2="12" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/></svg>; }
function BlossomIcon()      { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><circle cx="12" cy="12" r="3"/><path d="M12 2a2 2 0 0 1 0 4 2 2 0 0 1 0-4M12 18a2 2 0 0 1 0 4 2 2 0 0 1 0-4M2 12a2 2 0 0 1 4 0 2 2 0 0 1-4 0M18 12a2 2 0 0 1 4 0 2 2 0 0 1-4 0M4.93 4.93a2 2 0 0 1 2.83 2.83 2 2 0 0 1-2.83-2.83M16.24 16.24a2 2 0 0 1 2.83 2.83 2 2 0 0 1-2.83-2.83M4.93 19.07a2 2 0 0 1 2.83-2.83 2 2 0 0 1-2.83 2.83M16.24 7.76a2 2 0 0 1 2.83-2.83 2 2 0 0 1-2.83 2.83"/></svg>; }
function BlossomIconFilled(){ return <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><circle cx="12" cy="12" r="3"/><path d="M12 2a2 2 0 0 1 0 4 2 2 0 0 1 0-4M12 18a2 2 0 0 1 0 4 2 2 0 0 1 0-4M2 12a2 2 0 0 1 4 0 2 2 0 0 1-4 0M18 12a2 2 0 0 1 4 0 2 2 0 0 1-4 0M4.93 4.93a2 2 0 0 1 2.83 2.83 2 2 0 0 1-2.83-2.83M16.24 16.24a2 2 0 0 1 2.83 2.83 2 2 0 0 1-2.83-2.83M4.93 19.07a2 2 0 0 1 2.83-2.83 2 2 0 0 1-2.83 2.83M16.24 7.76a2 2 0 0 1 2.83-2.83 2 2 0 0 1-2.83 2.83"/></svg>; }

// ─── Desktop top nav ──────────────────────────────────────────────────────────
function TopNav() {
  const location = useLocation();
  return (
    <nav
      className="hidden md:block fixed top-0 left-0 right-0 z-40 backdrop-blur-lg border-b-2"
      style={{
        background: 'linear-gradient(180deg, rgba(255,248,243,0.97) 0%, rgba(255,245,247,0.94) 100%)',
        borderColor: 'rgba(255,192,203,0.2)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
  className="relative flex items-center justify-center rounded-full flex-shrink-0"
  style={{
    width: '100px',
    height: '100px',
    minWidth: '100px',
    minHeight: '100px',
    background: 'linear-gradient(135deg, rgba(244, 199, 195, 0.35) 0%, rgba(255, 218, 224, 0.25) 50%, rgba(255, 240, 245, 0.15) 100%)',
    boxShadow: '0 8px 32px rgba(224, 166, 173, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
  }}
  animate={{
    boxShadow: [
      '0 8px 32px rgba(224, 166, 173, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
      '0 12px 40px rgba(224, 166, 173, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      '0 8px 32px rgba(224, 166, 173, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
    ],
  }}
  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
  whileHover={{
    scale: 1.08,
    rotate: [0, -3, 3, 0],
    transition: { duration: 0.6, ease: 'easeOut' },
  }}
  whileTap={{ scale: 0.95 }}
>
  <motion.div
    className="absolute inset-0 rounded-full"
    style={{
      border: '3px solid transparent',
      backgroundImage:
        'linear-gradient(white, white), linear-gradient(135deg, rgba(224, 166, 173, 0.6), rgba(244, 199, 195, 0.4), rgba(255, 218, 224, 0.5))',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
    }}
    animate={{ rotate: 360 }}
    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
  />

  <motion.span
    className="absolute rounded-full"
    style={{
      inset: '-8px',
      border: '2px solid rgba(224, 166, 173, 0.3)',
      background: 'transparent',
    }}
    animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
  />

  <motion.div
    className="absolute"
    style={{
      top: '15%',
      right: '15%',
      width: '8px',
      height: '8px',
      background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(224,166,173,0.4) 70%, transparent 100%)',
      borderRadius: '50%',
      filter: 'blur(1px)',
    }}
    animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
  />

  <motion.img
    src="/dearly-icon.png"
    alt="Dearly"
    style={{
      width: '85px',
      height: '85px',
      objectFit: 'cover',
      imageRendering: 'crisp-edges',
      filter: 'drop-shadow(0 4px 12px rgba(224, 166, 173, 0.4))',
    }}
    className="relative z-10"
    whileHover={{
      scale: 1.05,
      filter: 'drop-shadow(0 6px 16px rgba(224, 166, 173, 0.6))',
      transition: { duration: 0.3 },
    }}
  />

  <span
    className="absolute rounded-full pointer-events-none"
    style={{
      inset: '8px',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%)',
    }}
  />
</motion.div>
          <span className="font-bubble text-3xl text-ink group-hover:text-blush-dark transition-colors duration-500">
  Dearly
</span>
        </Link>
        <div className="flex gap-1">
          {ALL_LINKS.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to} className="relative px-4 py-2">
                <span className={`relative z-10 text-sm font-medium transition-colors duration-500 ${active ? 'text-paper' : 'text-ink hover:text-blush-dark'}`}>
                  {link.label}
                </span>
                {active && (
                  <motion.div
                    className="absolute inset-0 bg-ink rounded-full"
                    layoutId="top-nav-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// ─── Mobile bottom nav ────────────────────────────────────────────────────────
function BottomNav() {
  const location = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div
        className="relative mx-3 mb-2 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,245,248,0.90)',
          backdropFilter: 'blur(28px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
          boxShadow: '0 -1px 0 rgba(255,192,203,0.25), 0 8px 32px rgba(200,75,92,0.08), 0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid rgba(255,192,203,0.22)',
        }}
      >
        <div className="absolute top-0 left-8 right-8 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,192,203,0.6) 50%, transparent)' }} />
        <div className="flex items-stretch px-1 py-1">
          {ALL_LINKS.map((link) => {
            const active = location.pathname === link.to;
            const Icon = link.icon;
            const ActiveIcon = link.activeIcon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="flex flex-col items-center justify-center flex-1 py-2 px-1 relative min-h-[54px] select-none"
              >
                {active && (
                  <motion.div
                    className="absolute inset-x-0.5 inset-y-0.5 rounded-xl"
                    layoutId="bottom-tab-bg"
                    style={{ background: 'linear-gradient(135deg, rgba(200,75,92,0.12), rgba(232,180,188,0.08))' }}
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  />
                )}
                <motion.div
                  className="relative flex items-center justify-center"
                  style={{ color: active ? '#C84B5C' : '#B0939B' }}
                  whileTap={{ scale: 0.82, y: -1 }}
                  animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={active ? { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] } : { duration: 0.2 }}
                >
                  {active ? <ActiveIcon /> : <Icon />}
                  {active && (
                    <motion.div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{ background: 'radial-gradient(circle, rgba(200,75,92,0.2) 0%, transparent 70%)' }}
                      animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </motion.div>
                <motion.span
                  className="relative text-[9px] font-medium tracking-wide mt-0.5 leading-none"
                  style={{ color: active ? '#C84B5C' : '#B0939B', fontWeight: active ? 600 : 400 }}
                  animate={{ opacity: active ? 1 : 0.75 }}
                >
                  {link.label}
                </motion.span>
                {active && (
                  <motion.div
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: '#C84B5C' }}
                    layoutId="bottom-tab-dot"
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────
// FIX: previously wrapped doodles in `className="md:hidden"` — removed.
// Now renders AmbientDoodles on ALL pages on BOTH desktop and mobile.
// Home page handles its own doodles (density="full") so PageShell skips it.
function PageShell({ children }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Doodles on every inner page — desktop AND mobile */}
      {!isHome && <AmbientDoodles density="page" />}

      {/* Warm glow blob at the top of every page */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[140vw] h-48 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(200,75,92,0.06) 0%, transparent 70%)',
          filter: 'blur(32px)',
          zIndex: 0,
        }}
      />
      {children}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <div className="min-h-screen md:pt-[68px] pb-[80px] md:pb-0">
        <TopNav />
        <BottomNav />
        <PageShell>
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/reflections" element={<ReflectionsPanel />} />
            <Route path="/letters"     element={<LettersToSelf />} />
            <Route path="/monthly"     element={<MonthlyLettersViewer />} />
            <Route path="/moments"     element={<MomentsViewer />} />
            <Route path="/profile"     element={<ProfilePanel />} />
          </Routes>
        </PageShell>
      </div>
    </Router>
  );
}

export default App;