/**
 * AmbientDoodles.jsx — Dearly floating doodle system
 *
 * Built by reading the reference screenshot precisely:
 *   - 12+ doodles spread wall-to-wall: top-left, mid-left, bottom-left,
 *     top-right, mid-right, bottom-right, plus scattered interior
 *   - Hearts are primary (filled + outline), 30–40% opacity
 *   - Supporting cast: sparkle crosses, stamp squares, envelopes, dots
 *   - Blush-pink / soft-red palette exactly matching the screenshot
 *
 * Three density modes (all visible on both desktop AND mobile):
 *   "full"  → 22 doodles  — home page
 *   "page"  → 12 doodles  — inner pages
 *   "hero"  → 14 doodles  — hero section overlay
 *
 * Performance: transform + opacity only, pointer-events: none,
 * useMemo on preset selection, no layout thrashing.
 */

import { motion } from 'framer-motion';
import { useMemo } from 'react';

// ─── SVG shape library ────────────────────────────────────────────────────────

const SHAPES = {
  // Filled heart — primary identity shape
  heart: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  // Outline heart — visible in screenshot top-right and bottom-right
  heartOutline: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  // 4-point sparkle / cross — visible in screenshot as + shapes
  sparkle: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2L13.2 10.8L22 12L13.2 13.2L12 22L10.8 13.2L2 12L10.8 10.8Z" />
    </svg>
  ),
  // Dashed stamp square — visible in screenshot top-left area
  stamp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.5 2" className="w-full h-full">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  ),
  // Envelope outline — visible in screenshot top-right
  envelope: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  // Soft dot — depth filler
  dot: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <circle cx="12" cy="12" r="7" />
    </svg>
  ),
  // Thin ring — depth layer
  ring: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-full h-full">
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
  // Small cross / plus
  cross: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-full h-full">
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="4"  y1="12" x2="20" y2="12" />
    </svg>
  ),
};

// ─── Preset tables ────────────────────────────────────────────────────────────
//
// Each entry:
//   shape    — key into SHAPES
//   color    — exact hex
//   size     — px (rendered size)
//   top/left/right/bottom — CSS % strings
//   opacity  — number 0–1 (this is the base; animation breathes ±20%)
//   dur      — animation duration seconds
//   delay    — stagger delay seconds
//   y        — framer keyframe array for vertical drift
//   rot      — framer keyframe array for rotation
//   blur     — optional CSS filter blur (creates depth layers)
//
// Placement strategy from screenshot:
//   Left column:   ~5–15% from left, scattered top-to-bottom
//   Right column:  ~85–95% from left (so right: 5–15%)
//   Interior:      20–30% and 70–80% from left, mid-screen

/** 22 doodles — home page, desktop + mobile */
const PRESET_FULL = [
  // ── LEFT EDGE ─────────────────────────────────────────────────────────────
  // Large filled heart — top-left, exactly as in screenshot
  { shape:'heart',       color:'#C84B5C', size:22, top:'13%', left:'8%',   opacity:0.32, dur:8,   delay:0,    y:[-20,0,-20], rot:[0,5,0],  blur:0   },
  // Dashed stamp square — mid-upper-left, exactly as in screenshot
  { shape:'stamp',       color:'#C84B5C', size:24, top:'26%', left:'15%',  opacity:0.22, dur:12,  delay:2,    y:[0,-10,0],   rot:[0,4,0],  blur:0   },
  // Small cross/plus — lower-left quadrant
  { shape:'cross',       color:'#C84B5C', size:14, top:'50%', left:'4%',   opacity:0.30, dur:9,   delay:1,    y:[-12,0,-12], rot:[0,8,0],  blur:0   },
  // Dot — mid-left, deep layer
  { shape:'dot',         color:'#F4C7C3', size:9,  top:'36%', left:'11%',  opacity:0.28, dur:7,   delay:3,    y:[0,-8,0],    rot:[0,0,0],  blur:2   },
  // Small filled heart — lower-left
  { shape:'heart',       color:'#E8A4AD', size:13, top:'68%', left:'7%',   opacity:0.26, dur:9.5, delay:1.5,  y:[-14,0,-14], rot:[0,6,0],  blur:0   },
  // Ring — far left mid-screen, background layer
  { shape:'ring',        color:'#C84B5C', size:28, top:'45%', left:'2%',   opacity:0.13, dur:14,  delay:4,    y:[0,-10,0],   rot:[0,0,0],  blur:3   },
  // Heart outline — bottom-left
  { shape:'heartOutline',color:'#C84B5C', size:18, top:'82%', left:'14%',  opacity:0.22, dur:10,  delay:0.5,  y:[-10,0,-10], rot:[0,4,0],  blur:0   },

  // ── RIGHT EDGE ────────────────────────────────────────────────────────────
  // Envelope outline — top-right, exactly as in screenshot
  { shape:'envelope',    color:'#C84B5C', size:22, top:'32%', right:'5%',  opacity:0.22, dur:10,  delay:1.2,  y:[-10,0,-10], rot:[0,-4,0], blur:0   },
  // Small filled heart — mid-right, exactly as in screenshot
  { shape:'heart',       color:'#C84B5C', size:15, top:'44%', right:'7%',  opacity:0.28, dur:8,   delay:2.5,  y:[0,-14,0],   rot:[0,-6,0], blur:0   },
  // Large heart outline — bottom-right, exactly as in screenshot (large, ~28px)
  { shape:'heartOutline',color:'#C84B5C', size:28, top:'58%', right:'6%',  opacity:0.24, dur:11,  delay:0.8,  y:[-8,0,-8],   rot:[0,0,0],  blur:0   },
  // Sparkle — right, near bottom
  { shape:'sparkle',     color:'#D4758A', size:16, top:'74%', right:'10%', opacity:0.26, dur:7,   delay:3.5,  y:[0,-12,0],   rot:[0,18,0], blur:0   },
  // Dot — right-top
  { shape:'dot',         color:'#F4C7C3', size:7,  top:'16%', right:'12%', opacity:0.30, dur:6.5, delay:2,    y:[-6,0,-6],   rot:[0,0,0],  blur:1   },
  // Ring — far right, background
  { shape:'ring',        color:'#C84B5C', size:24, top:'88%', right:'4%',  opacity:0.15, dur:13,  delay:5,    y:[0,-8,0],    rot:[0,0,0],  blur:4   },

  // ── INTERIOR / MID-SCREEN ─────────────────────────────────────────────────
  // Small sparkle — upper interior left
  { shape:'sparkle',     color:'#E8A4AD', size:11, top:'19%', left:'26%',  opacity:0.25, dur:8,   delay:0.6,  y:[-10,0,-10], rot:[0,15,0], blur:0   },
  // Heart — upper interior right
  { shape:'heart',       color:'#D4758A', size:12, top:'22%', right:'22%', opacity:0.22, dur:9,   delay:1.8,  y:[0,-12,0],   rot:[0,-8,0], blur:0   },
  // Dot interior left, blurred — far background feel
  { shape:'dot',         color:'#FFD1DC', size:10, top:'55%', left:'22%',  opacity:0.20, dur:11,  delay:3.2,  y:[0,-6,0],    rot:[0,0,0],  blur:4   },
  // Dot interior right
  { shape:'dot',         color:'#F8D7DA', size:8,  top:'62%', right:'24%', opacity:0.22, dur:8,   delay:2.8,  y:[-6,0,-6],   rot:[0,0,0],  blur:2   },
  // Heart — lower interior
  { shape:'heart',       color:'#E8B4BC', size:14, top:'77%', left:'28%',  opacity:0.20, dur:10,  delay:1.2,  y:[-10,0,-10], rot:[0,5,0],  blur:0   },
  // Cross — lower interior right
  { shape:'cross',       color:'#E8A4AD', size:12, top:'80%', right:'28%', opacity:0.24, dur:7.5, delay:4,    y:[0,-8,0],    rot:[0,12,0], blur:0   },

  // ── TOP AREA ──────────────────────────────────────────────────────────────
  // Very subtle top-centre bloom dot
  { shape:'dot',         color:'#F4C7C3', size:6,  top:'6%',  left:'48%',  opacity:0.22, dur:9,   delay:5,    y:[-4,0,-4],   rot:[0,0,0],  blur:1   },
  // Stamp — top far right
  { shape:'stamp',       color:'#D4758A', size:20, top:'8%',  right:'18%', opacity:0.18, dur:11,  delay:2.3,  y:[0,-8,0],    rot:[0,3,0],  blur:0   },
  // Tiny sparkle top left
  { shape:'sparkle',     color:'#C84B5C', size:9,  top:'7%',  left:'30%',  opacity:0.22, dur:7,   delay:1.5,  y:[-8,0,-8],   rot:[0,20,0], blur:0   },
];

/** 12 doodles — inner pages, desktop + mobile */
const PRESET_PAGE = [
  { shape:'heart',       color:'#C84B5C', size:20, top:'10%', left:'7%',   opacity:0.30, dur:8,   delay:0,    y:[-18,0,-18], rot:[0,5,0],  blur:0   },
  { shape:'heartOutline',color:'#C84B5C', size:22, top:'32%', right:'6%',  opacity:0.22, dur:11,  delay:1.5,  y:[0,-10,0],   rot:[0,0,0],  blur:0   },
  { shape:'sparkle',     color:'#E8A4AD', size:12, top:'18%', right:'14%', opacity:0.25, dur:8,   delay:0.7,  y:[-10,0,-10], rot:[0,15,0], blur:0   },
  { shape:'heart',       color:'#E8A4AD', size:13, top:'50%', right:'7%',  opacity:0.24, dur:9,   delay:2,    y:[-12,0,-12], rot:[0,-6,0], blur:0   },
  { shape:'stamp',       color:'#C84B5C', size:20, top:'24%', left:'14%',  opacity:0.18, dur:12,  delay:2.5,  y:[0,-8,0],    rot:[0,4,0],  blur:0   },
  { shape:'envelope',    color:'#C84B5C', size:18, top:'68%', right:'5%',  opacity:0.20, dur:10,  delay:1,    y:[0,-10,0],   rot:[0,-4,0], blur:0   },
  { shape:'cross',       color:'#C84B5C', size:14, top:'55%', left:'5%',   opacity:0.28, dur:9,   delay:1,    y:[-10,0,-10], rot:[0,8,0],  blur:0   },
  { shape:'dot',         color:'#F4C7C3', size:8,  top:'38%', left:'10%',  opacity:0.25, dur:7,   delay:3,    y:[0,-6,0],    rot:[0,0,0],  blur:2   },
  { shape:'heart',       color:'#D4758A', size:11, top:'75%', left:'12%',  opacity:0.22, dur:9.5, delay:1.8,  y:[-10,0,-10], rot:[0,5,0],  blur:0   },
  { shape:'ring',        color:'#C84B5C', size:26, top:'44%', left:'2%',   opacity:0.12, dur:14,  delay:4,    y:[0,-8,0],    rot:[0,0,0],  blur:3   },
  { shape:'heartOutline',color:'#C84B5C', size:24, top:'80%', right:'5%',  opacity:0.20, dur:11,  delay:0.5,  y:[-8,0,-8],   rot:[0,0,0],  blur:0   },
  { shape:'sparkle',     color:'#D4758A', size:14, top:'85%', right:'18%', opacity:0.24, dur:7,   delay:3.5,  y:[0,-10,0],   rot:[0,18,0], blur:0   },
];

/** 14 doodles — hero section, clustered but covering full viewport */
const PRESET_HERO = [
  { shape:'heart',       color:'#C84B5C', size:20, top:'11%', left:'8%',   opacity:0.30, dur:7,   delay:0,    y:[-18,0,-18], rot:[0,5,0],  blur:0   },
  { shape:'stamp',       color:'#C84B5C', size:22, top:'25%', left:'16%',  opacity:0.20, dur:12,  delay:2,    y:[0,-8,0],    rot:[0,4,0],  blur:0   },
  { shape:'sparkle',     color:'#E8A4AD', size:12, top:'19%', left:'27%',  opacity:0.25, dur:8,   delay:0.6,  y:[-10,0,-10], rot:[0,16,0], blur:0   },
  { shape:'cross',       color:'#C84B5C', size:14, top:'52%', left:'4%',   opacity:0.28, dur:9,   delay:1,    y:[-12,0,-12], rot:[0,8,0],  blur:0   },
  { shape:'dot',         color:'#F4C7C3', size:8,  top:'37%', left:'10%',  opacity:0.26, dur:7,   delay:3,    y:[0,-6,0],    rot:[0,0,0],  blur:2   },
  { shape:'heart',       color:'#E8B4BC', size:14, top:'70%', left:'8%',   opacity:0.24, dur:10,  delay:1.5,  y:[-10,0,-10], rot:[0,6,0],  blur:0   },
  // Right side
  { shape:'envelope',    color:'#C84B5C', size:20, top:'31%', right:'5%',  opacity:0.22, dur:10,  delay:1.2,  y:[-10,0,-10], rot:[0,-4,0], blur:0   },
  { shape:'heart',       color:'#C84B5C', size:14, top:'44%', right:'7%',  opacity:0.28, dur:8,   delay:2.5,  y:[0,-14,0],   rot:[0,-6,0], blur:0   },
  { shape:'heartOutline',color:'#C84B5C', size:26, top:'57%', right:'6%',  opacity:0.22, dur:11,  delay:0.8,  y:[-8,0,-8],   rot:[0,0,0],  blur:0   },
  { shape:'sparkle',     color:'#D4758A', size:14, top:'73%', right:'10%', opacity:0.26, dur:7,   delay:3.5,  y:[0,-12,0],   rot:[0,18,0], blur:0   },
  { shape:'dot',         color:'#F4C7C3', size:7,  top:'15%', right:'12%', opacity:0.28, dur:6.5, delay:2,    y:[-6,0,-6],   rot:[0,0,0],  blur:1   },
  // Top accents
  { shape:'sparkle',     color:'#C84B5C', size:10, top:'7%',  left:'32%',  opacity:0.22, dur:7,   delay:1.5,  y:[-8,0,-8],   rot:[0,20,0], blur:0   },
  { shape:'stamp',       color:'#D4758A', size:18, top:'9%',  right:'19%', opacity:0.18, dur:11,  delay:2.3,  y:[0,-8,0],    rot:[0,3,0],  blur:0   },
  { shape:'ring',        color:'#C84B5C', size:22, top:'42%', left:'2%',   opacity:0.12, dur:14,  delay:4,    y:[0,-8,0],    rot:[0,0,0],  blur:3   },
];

// ─── Single doodle component ──────────────────────────────────────────────────

const Doodle = ({ shape, color, size, top, left, right, bottom, opacity, dur, delay, y, rot, blur = 0 }) => (
  <motion.div
    className="fixed pointer-events-none select-none"
    style={{
      top, left, right, bottom,
      width: `${size}px`,
      height: `${size}px`,
      color,
      opacity,
      zIndex: 1,
      filter: blur > 0 ? `blur(${blur}px)` : undefined,
      // Blurred ones simulate distance — they create the layered depth
    }}
    animate={{ y, rotate: rot }}
    transition={{
      duration: dur,
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
      delay,
    }}
  >
    {SHAPES[shape] || SHAPES.heart}
  </motion.div>
);

// ─── Background glow orbs ─────────────────────────────────────────────────────
// Large blurred radial blobs. These create the warm pinkish-cream atmosphere
// visible in the screenshot background.

const GlowOrb = ({ color, width, height, top, left, right, bottom, opacity, dur, delay }) => (
  <motion.div
    className="fixed pointer-events-none rounded-full"
    style={{
      top, left, right, bottom,
      width, height,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      opacity,
      filter: 'blur(60px)',
      zIndex: 0,
    }}
    animate={{ scale: [1, 1.08, 1], opacity: [opacity * 0.8, opacity, opacity * 0.8] }}
    transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

// ─── Main AmbientDoodles component ───────────────────────────────────────────

export const AmbientDoodles = ({ density = 'page' }) => {
  const doodles = useMemo(() => {
    if (density === 'full') return PRESET_FULL;
    if (density === 'hero') return PRESET_HERO;
    return PRESET_PAGE;
  }, [density]);

  return (
    <>
      {/* Warm pinkish-cream background glow — creates the screenshot atmosphere */}
      <GlowOrb color="rgba(200,75,92,0.14)"  width="360px" height="360px" top="-5%"  left="-10%"  opacity={1} dur={10} delay={0}   />
      <GlowOrb color="rgba(244,199,195,0.25)" width="500px" height="400px" top="20%"  left="-5%"   opacity={1} dur={14} delay={1.5} />
      <GlowOrb color="rgba(232,180,188,0.20)" width="420px" height="420px" top="30%"  right="-10%" opacity={1} dur={12} delay={2}   />
      <GlowOrb color="rgba(255,209,220,0.18)" width="380px" height="320px" bottom="0" left="15%"   opacity={1} dur={11} delay={3.5} />
      <GlowOrb color="rgba(168,200,176,0.09)" width="280px" height="280px" bottom="5%" right="5%"  opacity={1} dur={13} delay={4}   />

      {/* Doodle layer */}
      {doodles.map((d, i) => <Doodle key={i} {...d} />)}
    </>
  );
};

// ─── Section sparkle divider ──────────────────────────────────────────────────

export const SparkDivider = ({ className = '' }) => (
  <div className={`relative flex items-center justify-center py-2 ${className}`}>
    <div
      className="absolute inset-x-6 h-px"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(200,75,92,0.22) 25%, rgba(200,75,92,0.38) 50%, rgba(200,75,92,0.22) 75%, transparent)' }}
    />
    <motion.span
      className="relative text-xs"
      style={{ color: '#C84B5C', opacity: 0.5 }}
      animate={{ opacity: [0.28, 0.65, 0.28], scale: [0.88, 1.18, 0.88] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      ✦
    </motion.span>
  </div>
);

// ─── Petal trail ──────────────────────────────────────────────────────────────

export const PetalTrail = ({ count = 5, className = '' }) => (
  <div className={`flex items-center justify-center gap-3 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <motion.span
        key={i}
        style={{ color: '#E8B4BC', fontSize: '11px', opacity: 0.5 }}
        animate={{ y: [0, -5, 0], opacity: [0.32, 0.62, 0.32] }}
        transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 }}
      >
        🌸
      </motion.span>
    ))}
  </div>
);

export default AmbientDoodles;