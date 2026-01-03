import { useState } from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import CaptureComponent from '../components/CaptureComponent';
import CloudDividerSection from '../components/CloudDividerSection';
import GallerySection from '../components/GallerySection';

const Home = () => {
  const [captureKey, setCaptureKey] = useState(0);

  const handleCaptureComplete = () => {
    setCaptureKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background floating doodles - scattered across entire page with softer colors */}
      <motion.div
        className="fixed top-1/4 left-[5%] w-10 h-10 opacity-15 pointer-events-none z-0"
        style={{ color: '#FFB6C1' }}
        animate={{ y: [0, -30, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="8" />
        </svg>
      </motion.div>

      <motion.div
        className="fixed top-2/3 right-[8%] w-8 h-8 opacity-18 pointer-events-none z-0"
        style={{ color: '#FFD1DC' }}
        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        </svg>
      </motion.div>

      <motion.div
        className="fixed bottom-1/4 left-[12%] w-7 h-7 opacity-20 pointer-events-none z-0"
        style={{ color: '#FFC0CB' }}
        animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        </svg>
      </motion.div>

      <motion.div
        className="fixed top-1/2 right-[15%] w-9 h-9 opacity-12 pointer-events-none z-0"
        style={{ color: '#E8B4BC' }}
        animate={{ y: [0, 25, 0], rotate: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </motion.div>

      <motion.div
        className="fixed bottom-1/3 right-[25%] w-6 h-6 opacity-25 pointer-events-none z-0"
        style={{ color: '#FFE4E1' }}
        animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="6" />
        </svg>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10">
        <Hero />
        
        <section className="py-20 px-6">
          <CaptureComponent key={captureKey} onCaptureComplete={handleCaptureComplete} />
        </section>

        <CloudDividerSection />

        <GallerySection key={`gallery-${captureKey}`} />

        {/* Reflections preview */}
        <section className="py-32 relative">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-4xl font-bubble text-ink mb-6">
                Reflections
              </h3>
              <p className="text-xl font-hand text-text-soft mb-8 max-w-2xl mx-auto">
                Patterns noticed gently, without judgment
              </p>
              <a href="/reflections" className="btn-soft">
                See your reflections
              </a>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <motion.footer
          className="py-16 text-center relative overflow-hidden border-t-2 border-blush-light/30"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto px-6">
            <p className="font-hand text-3xl text-ink mb-4">
              Dearly
            </p>
            <p className="text-text-whisper text-sm">
              A gentle place for your memories
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default Home;