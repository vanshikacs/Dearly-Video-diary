import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { generateReflections } from '../utils/reflectionsAnalyzer';

const ReflectionsPanel = () => {
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => { loadReflections(); }, []);

  const loadReflections = async () => {
    setLoading(true);
    const generated = await generateReflections();
    setReflections(generated);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <motion.div
          className="w-12 h-12 border-4 border-blush border-t-ink rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl md:max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-20">

      <motion.div
        className="text-center mb-10 md:mb-16"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="heading-bubble mb-3 md:mb-6">Reflections</h2>
        <p className="text-lg md:text-2xl font-hand text-text-soft">
          Patterns noticed gently
        </p>
      </motion.div>

      {reflections.length === 0 ? (
        <motion.div
          className="text-center py-16 card-gentle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-5xl mb-5 block">🌱</span>
          <h3 className="text-2xl md:text-3xl font-bubble text-ink mb-4">Nothing here yet</h3>
          <p className="text-base md:text-xl font-hand text-text-whisper max-w-xs md:max-w-md mx-auto">
            That's okay. When you're ready, this space will hold your reflections gently.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-10 md:space-y-8">
          {reflections.map((reflection, index) => (
            <motion.div
              key={index}
              className="card-cloud relative pt-12 md:pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.12, duration: 0.7 }}
            >
              {/* Icon badge */}
              <div className="absolute -top-6 left-5 md:left-8">
                <motion.div
                  className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center text-2xl shadow-gentle border-2 border-blush"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {reflection.icon}
                </motion.div>
              </div>

              <h3 className="text-xl md:text-2xl font-bubble text-ink mb-3">
                {reflection.title}
              </h3>
              <p className="text-base md:text-lg text-text-soft leading-relaxed">
                {reflection.message}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReflectionsPanel;