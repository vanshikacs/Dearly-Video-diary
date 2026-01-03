import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Home from './pages/Home';
import ReflectionsPanel from './components/ReflectionsPanel';
import LettersToSelf from './components/LettersToSelf';
import MonthlyLettersViewer from './components/MonthlyLettersViewer';
import MomentsViewer from './components/MomentsViewer';

function Navigation() {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/reflections', label: 'Reflections' },
    { to: '/letters', label: 'Letters' },
    { to: '/monthly', label: 'Monthly' },
    { to: '/moments', label: 'Moments' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-lg border-b-2"
      style={{
        background: 'linear-gradient(180deg, rgba(255, 248, 243, 0.95) 0%, rgba(255, 245, 247, 0.92) 100%)',
        borderColor: 'rgba(255, 192, 203, 0.2)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-5 group">
            <motion.div
              className="relative flex items-center justify-center rounded-full"
              style={{
                width: '100px',
                height: '100px',
                minWidth: '100px',
                minHeight: '100px',
                flexShrink: 0,
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
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              whileHover={{
                scale: 1.08,
                rotate: [0, -3, 3, 0],
                transition: { duration: 0.6, ease: 'easeOut' }
              }}
            >
              {/* Outer decorative ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  border: '3px solid transparent',
                  backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgba(224, 166, 173, 0.6), rgba(244, 199, 195, 0.4), rgba(255, 218, 224, 0.5))',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                }}
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* Pulsing glow ring */}
              <motion.span 
                className="absolute rounded-full"
                style={{
                  inset: '-8px',
                  border: '2px solid rgba(224, 166, 173, 0.3)',
                  background: 'transparent',
                }}
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Sparkle effect */}
              <motion.div
                className="absolute"
                style={{
                  top: '15%',
                  right: '15%',
                  width: '8px',
                  height: '8px',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(224, 166, 173, 0.4) 70%, transparent 100%)',
                  borderRadius: '50%',
                  filter: 'blur(1px)',
                }}
                animate={{
                  opacity: [0.4, 1, 0.4],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
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
                  transition: { duration: 0.3 }
                }}
              />

              {/* Inner subtle highlight */}
              <span 
                className="absolute rounded-full pointer-events-none"
                style={{
                  inset: '8px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 60%)',
                }}
              />
            </motion.div>

            <span className="font-bubble text-3xl text-ink group-hover:text-blush-dark transition-colors duration-500">
              Dearly
            </span>
          </Link>

          <div className="flex gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative px-5 py-2"
              >
                <span
                  className={`
                    relative z-10 font-medium transition-colors duration-500
                    ${location.pathname === link.to
                      ? 'text-paper'
                      : 'text-ink hover:text-blush-dark'}
                  `}
                >
                  {link.label}
                </span>
                {location.pathname === link.to && (
                  <motion.div
                    className="absolute inset-0 bg-ink rounded-full"
                    layoutId="nav-bg"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen pt-24">
        <Navigation />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reflections" element={<ReflectionsPanel />} />
          <Route path="/letters" element={<LettersToSelf />} />
          <Route path="/monthly" element={<MonthlyLettersViewer />} />
          <Route path="/moments" element={<MomentsViewer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;