/**
 * Hero.jsx — restored to match the reference screenshot
 *
 * What the screenshot shows:
 *   - Tagline "The art of treasuring the quietly beautiful." sits ABOVE
 *     the orbit cluster, roughly 160px from top of visible area
 *   - Centre circle is ~250px on screen — visually dominant
 *   - One orbiting thumbnail visible top-left of cluster (~60px circle)
 *   - The whole composition sits slightly below screen-centre
 *   - Soft pinkish background, no harsh elements
 *   - "Dearly" title is large bubble text below the cluster
 *
 * Changes from previous version:
 *   - Container: clamp(280px,82vw,460px) — up from 260/400
 *   - Centre photo: clamp(160px,50vw,240px) — up from 152/220
 *   - Three glow rings retained but stronger (higher opacity values)
 *   - Added gentle float animation on the entire cluster (y: 0 → -12 → 0)
 *   - Tagline visible on BOTH mobile and desktop (it's above orbit in screenshot)
 *   - Orbit radius scaled to match new container
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AmbientDoodles } from './AmbientDoodles';

const ORBITING_IMAGES = [
  { src: 'https://i.pinimg.com/1200x/41/11/c6/4111c6f8811510420e555bfc2aa9c2a3.jpg', angle: 0   },
  { src: 'https://i.pinimg.com/1200x/c6/9f/c3/c69fc3a7e4a7a171dab82c767788c4ba.jpg', angle: 90  },
  { src: 'https://i.pinimg.com/1200x/06/60/db/0660db75f47dd335154c1d13b8a7c661.jpg', angle: 180 },
  { src: 'https://i.pinimg.com/736x/5b/34/21/5b3421d5eba94d03ba60ad2b2bb6490b.jpg', angle: 270 },
];

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden px-5 py-14 md:py-20">

      {/* Hero-density doodles */}
      <AmbientDoodles density="hero" />

      {/* ── Background atmosphere layers ──────────────────────────────── */}
      {/* Main warm radial — creates the pinkish-cream bloom of the screenshot */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 85% 75% at 50% 48%, rgba(255,228,236,0.60) 0%, rgba(255,240,245,0.25) 55%, transparent 75%)',
        }}
      />
      {/* Top-left warm bloom */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-80px', left: '-80px',
          width: '420px', height: '380px',
          background: 'radial-gradient(circle, rgba(200,75,92,0.10) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Bottom-right cool sage bloom */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-40px', right: '-40px',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(168,200,176,0.12) 0%, transparent 65%)',
          filter: 'blur(50px)',
        }}
      />

      {/* ── Main content column ───────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-xl mx-auto flex flex-col items-center text-center gap-5 md:gap-7">

        {/* Tagline — shown ABOVE orbit on both mobile and desktop */}
        {/* This matches the screenshot exactly */}
        <motion.p
          className="font-hand text-base sm:text-lg text-ink leading-relaxed px-4"
          style={{ opacity: 0 }}
          animate={{ opacity: 0.72 }}
          transition={{ delay: 0.4, duration: 1.2 }}
        >
          The art of treasuring the quietly beautiful.
        </motion.p>

        {/* ── Orbit cluster ─────────────────────────────────────────────── */}
        {/* Bigger container — matches the large visual presence in screenshot */}
        <motion.div
          className="relative"
          style={{
            width:  'clamp(280px, 82vw, 460px)',
            height: 'clamp(280px, 82vw, 460px)',
          }}
          // Gentle float — the whole cluster breathes up and down slowly
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* ── Glow halo system ─────────────────────────────────────── */}

          {/* Ring 1 — outermost bloom, very diffuse */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{
              width:  'clamp(250px, 78vw, 420px)',
              height: 'clamp(250px, 78vw, 420px)',
              background: 'radial-gradient(circle, rgba(200,75,92,0.16) 0%, transparent 62%)',
            }}
            animate={{ scale: [1, 1.20, 1], opacity: [0.55, 0.90, 0.55] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />

          {/* Ring 2 — mid glow */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{
              width:  'clamp(215px, 66vw, 355px)',
              height: 'clamp(215px, 66vw, 355px)',
              background: 'radial-gradient(circle, rgba(200,75,92,0.26) 0%, transparent 60%)',
            }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.70, 1, 0.70] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Spinning dashed ring */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{
              width:  'clamp(195px, 60vw, 320px)',
              height: 'clamp(195px, 60vw, 320px)',
              border: '1.5px dashed rgba(200,75,92,0.25)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          />

          {/* Ring 3 — innermost bloom, tight against photo */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{
              width:  'clamp(178px, 55vw, 295px)',
              height: 'clamp(178px, 55vw, 295px)',
              background: 'radial-gradient(circle, rgba(200,75,92,0.32) 0%, transparent 52%)',
            }}
            animate={{ scale: [1, 1.07, 1], opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          />

          {/* ── Centre photo circle ───────────────────────────────────── */}
          {/* This is the dominant visual — large, white-bordered, soft-shadowed */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden border-4 border-white"
            style={{
              width:  'clamp(160px, 50vw, 240px)',
              height: 'clamp(160px, 50vw, 240px)',
              boxShadow: [
                '0 12px 48px rgba(200,75,92,0.30)',
                '0 4px 16px rgba(0,0,0,0.07)',
                '0 0 0 7px rgba(255,255,255,0.60)',
                '0 0 0 13px rgba(200,75,92,0.08)',
              ].join(', '),
            }}
            initial={{ scale: 0.72, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <img
              src="https://i.pinimg.com/1200x/ce/28/06/ce28067cb038a7415a4c46e245235301.jpg"
              alt="A gentle moment"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* ── Orbiting thumbnails ───────────────────────────────────── */}
          {ORBITING_IMAGES.map((img, index) => {
            const armDuration = 30 + index * 5;
            return (
              <motion.div
                key={index}
                className="absolute top-1/2 left-1/2"
                style={{
                  width:  'clamp(50px, 14vw, 68px)',
                  height: 'clamp(50px, 14vw, 68px)',
                  marginTop:  'calc(-1 * clamp(25px, 7vw, 34px))',
                  marginLeft: 'calc(-1 * clamp(25px, 7vw, 34px))',
                  transformOrigin: 'clamp(25px, 7vw, 34px) clamp(25px, 7vw, 34px)',
                }}
                animate={{ rotate: [img.angle, img.angle + 360] }}
                transition={{ duration: armDuration, repeat: Infinity, ease: 'linear' }}
              >
                <motion.div
                  className="w-full h-full rounded-full overflow-hidden border-2 border-white"
                  style={{
                    transform: `translateX(clamp(115px, 34vw, 178px)) rotate(${-img.angle}deg)`,
                    boxShadow: '0 3px 12px rgba(200,75,92,0.22)',
                  }}
                  animate={{ rotate: [-(img.angle), -(img.angle + 360)] }}
                  transition={{ duration: armDuration, repeat: Infinity, ease: 'linear' }}
                >
                  <img src={img.src} alt="" className="w-full h-full object-cover" />
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Title & subtitle ──────────────────────────────────────────── */}
        <motion.div
          className="flex flex-col items-center gap-2 md:gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1, ease: 'easeOut' }}
        >
          {/* Micro-rule */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-px" style={{ background: 'rgba(200,75,92,0.30)' }} />
            <motion.span
              style={{ color: '#C84B5C', opacity: 0.50, fontSize: '9px' }}
              animate={{ opacity: [0.28, 0.65, 0.28] }}
              transition={{ duration: 2.8, repeat: Infinity }}
            >✦</motion.span>
            <div className="w-8 h-px" style={{ background: 'rgba(200,75,92,0.30)' }} />
          </div>

          <h1 className="heading-bubble leading-none">Dearly</h1>

          <motion.p
            className="text-sm sm:text-base md:text-lg font-hand text-text-soft max-w-[260px] sm:max-w-sm leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            A gentle place for your memories
          </motion.p>
        </motion.div>

        {/* ── CTAs ──────────────────────────────────────────────────────── */}
        <motion.div
          className="flex gap-3 justify-center w-full"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.9 }}
        >
          <motion.button
            onClick={() => document.getElementById('capture')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-soft min-h-[52px] px-8 flex-1 sm:flex-none sm:px-10"
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.04 }}
            style={{ boxShadow: '0 5px 24px rgba(200,75,92,0.40), 0 1px 4px rgba(200,75,92,0.18)' }}
          >
            Begin
          </motion.button>
          <motion.button
            onClick={() => navigate('/letters')}
            className="btn-outline-soft min-h-[52px] px-6 flex-1 sm:flex-none"
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.04 }}
          >
            Your Letters
          </motion.button>
        </motion.div>

        {/* Decorative wave */}
        <motion.svg
          viewBox="0 0 400 40"
          className="w-28 sm:w-40 md:w-52"
          style={{ opacity: 0 }}
          animate={{ opacity: 0.16 }}
          transition={{ duration: 3, delay: 2.2 }}
        >
          <path d="M 10 20 Q 100 5, 200 20 T 390 20" stroke="#C84B5C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </motion.svg>

      </div>
    </section>
  );
};

export default Hero;