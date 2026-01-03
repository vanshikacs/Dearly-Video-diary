import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  const orbitingImages = [
    { src: 'https://i.pinimg.com/1200x/41/11/c6/4111c6f8811510420e555bfc2aa9c2a3.jpg', delay: 0 },
    { src: 'https://i.pinimg.com/1200x/c6/9f/c3/c69fc3a7e4a7a171dab82c767788c4ba.jpg', delay: 1 },
    { src: 'https://i.pinimg.com/1200x/06/60/db/0660db75f47dd335154c1d13b8a7c661.jpg', delay: 2 },
    { src: 'https://i.pinimg.com/736x/5b/34/21/5b3421d5eba94d03ba60ad2b2bb6490b.jpg', delay: 3 },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
      {/* Smooth gradient overlay for perfect blending */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 240, 245, 0.4) 0%, transparent 70%)',
        }}
      />
      
      {/* TONS of Romantic floating doodles - hearts, envelopes, stamps */}
      <motion.div
        className="absolute top-20 left-[15%] w-10 h-10 opacity-25"
        style={{ color: '#C84B5C' }}
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute top-40 right-[8%] w-8 h-8 text-blush opacity-30"
        animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <path d="M22 6l-10 7L2 6" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-32 right-[12%] w-12 h-12 text-blush-dark opacity-35"
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute top-32 left-[25%] w-9 h-9 opacity-20"
        style={{ color: '#C84B5C' }}
        animate={{ y: [0, -12, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-48 left-[18%] w-11 h-11 text-blush opacity-25"
        animate={{ y: [0, -18, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute top-64 right-[22%] w-7 h-7 opacity-25"
        style={{ color: '#C84B5C' }}
        animate={{ y: [0, 10, 0], rotate: [0, -12, 0] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-24 right-[28%] w-10 h-10 text-blush-light opacity-30"
        animate={{ y: [0, -15, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute top-56 left-[8%] w-8 h-8 text-blush-dark opacity-25"
        animate={{ y: [0, 12, 0], rotate: [0, -7, 0] }}
        transition={{ duration: 9.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        </svg>
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
        {/* Central circular hero with orbiting images */}
        <div className="relative w-full max-w-xl mx-auto mb-12" style={{ height: '500px' }}>
          {/* Center large image */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full overflow-hidden shadow-soft border-4 border-white"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <img
              src="https://i.pinimg.com/1200x/ce/28/06/ce28067cb038a7415a4c46e245235301.jpg"
              alt="A gentle moment"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Curved text around center */}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <p className="font-hand text-2xl text-ink whitespace-nowrap">
             The art of treasuring the quietly beautiful.
            </p>
          </motion.div>

          {/* Orbiting small circles */}
          {orbitingImages.map((img, index) => (
            <motion.div
              key={index}
              className="absolute top-1/2 left-1/2 w-20 h-20 -ml-10 -mt-10"
              style={{
                transformOrigin: '50% 50%',
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: 'linear',
                delay: img.delay * 2,
              }}
            >
              <motion.div
                className="w-20 h-20 rounded-full overflow-hidden shadow-gentle border-3 border-white"
                style={{
                  transform: `translateX(${120 + index * 20}px)`,
                }}
                animate={{
                  rotate: -360,
                }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: img.delay * 2,
                }}
                whileHover={{ scale: 1.1 }}
              >
                <img
                  src={img.src}
                  alt="Moment"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Title and tagline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <h1 className="heading-bubble mb-6">
            Dearly
          </h1>
          
          <motion.p
            className="text-2xl md:text-3xl font-hand text-text-soft mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            A gentle place for your memories
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <button
              onClick={() => {
                const captureSection = document.getElementById('capture');
                captureSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-soft"
            >
              Begin
            </button>
            <button
              onClick={() => navigate('/letters')}
              className="btn-outline-soft"
            >
              Your Letters
            </button>
          </motion.div>
        </motion.div>

        {/* Decorative curve */}
        <motion.svg
          viewBox="0 0 400 60"
          className="mx-auto mt-16 w-64 opacity-20"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 2 }}
        >
          <motion.path
            d="M 10 30 Q 100 10, 200 30 T 390 30"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            className="text-ink"
          />
        </motion.svg>
      </div>
    </section>
  );
};

export default Hero;