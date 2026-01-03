import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { generateReflections } from '../utils/reflectionsAnalyzer';

const ReflectionsPanel = () => {
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReflections();
  }, []);

  const loadReflections = async () => {
    setLoading(true);
    const generated = await generateReflections();
    setReflections(generated);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <motion.div
          className="w-16 h-16 border-4 border-blush border-t-ink rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="heading-bubble mb-6">Reflections</h2>
        <p className="text-2xl font-hand text-text-soft">
          Patterns noticed gently
        </p>
      </motion.div>

      <div className="space-y-8">
        {reflections.map((reflection, index) => (
          <motion.div
            key={index}
            className="card-cloud relative"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.15, duration: 0.8 }}
            whileHover={{ y: -5 }}
          >
            {/* Decorative icon */}
            <div className="absolute -top-6 left-8">
              <motion.div
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-gentle border-2 border-blush"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {reflection.icon}
              </motion.div>
            </div>

            <div className="pt-8">
              <h3 className="text-2xl font-bubble text-ink mb-4">
                {reflection.title}
              </h3>
              <p className="text-lg text-text-soft leading-relaxed">
                {reflection.message}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {reflections.length === 0 && (
        <motion.div
          className="text-center py-20 card-gentle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-6xl mb-6 block">🌱</span>
          <h3 className="text-3xl font-bubble text-ink mb-4">
            Nothing here yet
          </h3>
          <p className="text-xl font-hand text-text-whisper max-w-md mx-auto">
            That's okay. When you're ready, this space will hold your reflections gently.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ReflectionsPanel;