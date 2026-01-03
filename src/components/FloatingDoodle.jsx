import { motion } from 'framer-motion';

const FloatingDoodle = ({ type, className = '', delay = 0 }) => {
  const doodles = {
    heart: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          fill="currentColor"
          opacity="0.4"
        />
      </svg>
    ),
    envelope: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path
          d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity="0.3"
        />
        <path
          d="M22 6l-10 7L2 6"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
        />
      </svg>
    ),
    stamp: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" strokeDasharray="2 2" />
        <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.25" />
        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      </svg>
    ),
    bow: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path
          d="M12 12 L6 6 L12 8 L18 6 L12 12 L6 18 L12 16 L18 18 Z"
          fill="currentColor"
          opacity="0.3"
        />
        <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.5" />
      </svg>
    ),
    sparkle: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path
          d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
          opacity="0.35"
        />
      </svg>
    ),
  };

  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
      animate={{
        opacity: [0.2, 0.5, 0.2],
        scale: [0.9, 1, 0.9],
        rotate: [0, 8, 0],
        y: [0, -25, 0],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {doodles[type] || doodles.heart}
    </motion.div>
  );
};

export default FloatingDoodle;