/**
 * Home.jsx — one targeted fix only.
 *
 * Previous: `<div className="hidden md:block"><AmbientDoodles density="full" /></div>`
 * That hid doodles on desktop-home. Now rendered without the hide wrapper,
 * visible on all screen sizes. Everything else is unchanged.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import CaptureComponent from '../components/CaptureComponent';
import CloudDividerSection from '../components/CloudDividerSection';
import GallerySection from '../components/GallerySection';
import { AmbientDoodles, SparkDivider, PetalTrail } from '../components/AmbientDoodles';

const Home = () => {
  const [captureKey, setCaptureKey] = useState(0);

  return (
    <div className="min-h-screen relative overflow-x-hidden">

      {/* Full doodle layer — desktop AND mobile on home page */}
      {/* FIX: was `className="hidden md:block"` — that wrapper is gone */}
      <AmbientDoodles density="full" />

      {/* Persistent gradient depth blobs */}
      <div
        className="fixed top-1/3 right-[-15%] w-72 h-72 rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(200,75,92,0.07) 0%, transparent 70%)', filter: 'blur(50px)' }}
      />
      <div
        className="fixed bottom-1/4 left-[-10%] w-64 h-64 rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(168,200,176,0.09) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />

      <div className="relative z-10">
        <Hero />

        <SparkDivider className="mx-6 my-2" />

        <section className="py-8 md:py-16 px-4 md:px-6">
          <CaptureComponent
            key={captureKey}
            onCaptureComplete={() => setCaptureKey((p) => p + 1)}
          />
        </section>

        <SparkDivider className="mx-6" />

        <CloudDividerSection />

        <GallerySection key={`gallery-${captureKey}`} />

        {/* Reflections teaser */}
        <section className="py-14 md:py-28 px-4 relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(200,75,92,0.04) 0%, transparent 100%)' }}
          />
          <div className="max-w-lg md:max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            >
              <PetalTrail count={3} className="mb-5" />
              <motion.div
                className="card-gentle relative overflow-hidden"
                whileHover={{ y: -6, boxShadow: '0 16px 48px rgba(200,75,92,0.16)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <div
                  className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(200,75,92,0.10) 0%, transparent 70%)' }}
                />
                <motion.span
                  className="absolute top-4 right-5 text-xs"
                  style={{ color: '#C84B5C', opacity: 0.4 }}
                  animate={{ opacity: [0.25, 0.6, 0.25], rotate: [0, 20, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >✦</motion.span>
                <h3 className="text-2xl md:text-3xl font-bubble text-ink mb-3 relative z-10">Reflections</h3>
                <p className="text-sm md:text-lg font-hand text-text-soft mb-6 relative z-10">
                  Patterns noticed gently, without judgment
                </p>
                <Link to="/reflections">
                  <motion.span
                    className="btn-soft inline-flex min-h-[50px] px-8"
                    whileTap={{ scale: 0.95 }}
                    style={{ boxShadow: '0 4px 18px rgba(200,75,92,0.28)' }}
                  >
                    See your reflections
                  </motion.span>
                </Link>
              </motion.div>
              <PetalTrail count={3} className="mt-5" />
            </motion.div>
          </div>
        </section>

        <motion.footer
          className="py-10 md:py-16 text-center relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div
            className="absolute top-0 left-8 right-8 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(200,75,92,0.2) 30%, rgba(200,75,92,0.3) 50%, rgba(200,75,92,0.2) 70%, transparent)' }}
          />
          <motion.p
            className="font-hand text-2xl md:text-3xl text-ink mb-2"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            Dearly
          </motion.p>
          <p className="text-text-whisper text-xs md:text-sm">A gentle place for your memories</p>
          <div className="flex items-center justify-center gap-3 mt-5 opacity-30">
            <div className="w-8 h-px" style={{ background: '#C84B5C' }} />
            <span className="text-xs" style={{ color: '#C84B5C' }}>✦</span>
            <div className="w-8 h-px" style={{ background: '#C84B5C' }} />
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default Home;