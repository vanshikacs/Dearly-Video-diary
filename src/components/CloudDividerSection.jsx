import { motion } from 'framer-motion';

const CloudDividerSection = () => {
  return (
    <section className="relative py-24 scallop-top scallop-bottom bg-blush-light/40">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Cute illustration placeholder */}
        <motion.div
  className="w-48 h-48 mx-auto mb-8"
  initial={{ opacity: 0, scale: 0.8 }}
  whileInView={{ opacity: 1, scale: 1 }}
  viewport={{ once: true }}
  animate={{ y: [0, -10, 0] }}
  transition={{
    opacity: { duration: 0.8 },
    scale: { duration: 0.8 },
    y: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  }}
>
          {/* Simple hand-drawn style illustration */}
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Cloud character */}
            <path
              d="M60 110 C60 90 70 80 85 80 C87 70 95 65 105 65 C115 65 123 70 125 80 C140 80 150 90 150 110 C150 125 140 135 125 135 L85 135 C70 135 60 125 60 110 Z"
              fill="#F4C7C3"
              stroke="#8B7355"
              strokeWidth="2"
            />
            {/* Happy face */}
            <circle cx="90" cy="100" r="4" fill="#8B7355" />
            <circle cx="120" cy="100" r="4" fill="#8B7355" />
            <path
              d="M 90 115 Q 105 125 120 115"
              stroke="#8B7355"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Paper/letter */}
            <rect x="80" y="140" width="40" height="35" rx="4" fill="white" stroke="#8B7355" strokeWidth="2" />
            <line x1="88" y1="150" x2="112" y2="150" stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="88" y1="158" x2="112" y2="158" stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="88" y1="166" x2="105" y2="166" stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.div>

        <motion.p
          className="text-2xl md:text-3xl font-hand text-ink leading-relaxed max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Every moment you keep here becomes a letter—to yourself, from yourself, waiting patiently.
        </motion.p>

        <motion.div
          className="mt-8 flex justify-center gap-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <span className="text-blush text-2xl">✦</span>
          <span className="text-sage text-xl">✦</span>
          <span className="text-blush-dark text-2xl">✦</span>
        </motion.div>
      </div>
    </section>
  );
};

export default CloudDividerSection;