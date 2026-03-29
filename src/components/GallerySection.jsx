import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { getAllCaptures, getVideoBlob } from '../utils/db';

const GallerySection = () => {
  const [captures, setCaptures]       = useState([]);
  const [videoUrls, setVideoUrls]     = useState({});
  const [centerCapture, setCenterCapture] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null);

  useEffect(() => { loadCaptures(); }, []);

  const loadCaptures = async () => {
    const all = await getAllCaptures();
    const recent = all.slice(-9);
    setCaptures(recent);
    if (recent.length >= 5) setCenterCapture(recent[4]);

    const urls = {};
    for (const capture of recent) {
      const blob = await getVideoBlob(capture.id);
      if (blob) urls[capture.id] = URL.createObjectURL(blob);
    }
    setVideoUrls(urls);
  };

  const getFeelingEmoji = (feeling) => {
    const map = { peaceful:'🕊️', grateful:'🙏', gentle:'🌸', quiet:'🌙', warm:'☕', hopeful:'🌿', tender:'💭', calm:'🌊', thoughtful:'🍂', nostalgic:'📜' };
    return map[feeling] || '💭';
  };

  const formatDate = (ts) =>
    new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <section className="py-16 md:py-32 relative overflow-hidden bg-paper">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="heading-bubble text-center mb-10 md:mb-20 px-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          GALLERY
        </motion.h2>

        {captures.length === 0 ? (
          <motion.div
            className="text-center py-16 md:py-32 px-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-2xl md:text-3xl font-hand text-text-whisper">
              Nothing here yet. That's okay.
            </p>
          </motion.div>
        ) : (
          <>
            {/* ── Mobile: horizontal scroll strip ──────────────────────────── */}
            <div className="md:hidden">
              <div
                className="flex gap-3 overflow-x-auto pb-4 px-4 scrollbar-hidden snap-x snap-mandatory"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {captures.map((capture, index) => (
                  <motion.div
                    key={capture.id}
                    className="flex-shrink-0 snap-center cursor-pointer relative rounded-2xl overflow-hidden shadow-gentle border-2 border-white/70"
                    style={{ width: '140px', height: '200px' }}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06, duration: 0.5 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedMemory(capture)}
                  >
                    {videoUrls[capture.id] ? (
                      <video
                        src={videoUrls[capture.id]}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blush-light to-sage-light flex items-center justify-center">
                        <span className="text-4xl">{getFeelingEmoji(capture.feeling)}</span>
                      </div>
                    )}
                    {/* Date overlay */}
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-ink/50 to-transparent">
                      <p className="text-white text-xs font-hand leading-tight">
                        {formatDate(capture.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              {/* Scroll hint */}
              <p className="text-center text-xs text-text-whisper mt-2 font-hand opacity-60">
                scroll to see more →
              </p>
            </div>

            {/* ── Desktop: orbital pill layout ─────────────────────────────── */}
            <div className="hidden md:flex items-center justify-center gap-6 px-6">
              <div className="flex flex-col gap-4">
                {captures.slice(0, 2).map((c, i) => (
                  <VerticalPill key={c.id} capture={c} videoUrl={videoUrls[c.id]} delay={i*0.1} getFeelingEmoji={getFeelingEmoji} onClick={() => setSelectedMemory(c)} />
                ))}
              </div>
              <div className="flex flex-col gap-4">
                {captures.slice(2, 4).map((c, i) => (
                  <VerticalPill key={c.id} capture={c} videoUrl={videoUrls[c.id]} delay={0.2+i*0.1} getFeelingEmoji={getFeelingEmoji} onClick={() => setSelectedMemory(c)} />
                ))}
              </div>

              {/* Center large circle */}
              {centerCapture && (
                <motion.div
                  className="relative w-80 h-80 rounded-full overflow-hidden shadow-soft border-4 border-white cursor-pointer flex-shrink-0"
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  whileHover={{ scale: 1.04 }}
                  onClick={() => setSelectedMemory(centerCapture)}
                >
                  {videoUrls[centerCapture.id] ? (
                    <video
                      src={videoUrls[centerCapture.id]}
                      className="w-full h-full object-cover"
                      muted loop
                      onMouseEnter={(e) => e.target.play()}
                      onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blush-light to-sage-light flex items-center justify-center">
                      <span className="text-6xl">{getFeelingEmoji(centerCapture.feeling)}</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-ink/55 to-transparent">
                    <p className="text-white font-hand text-base">
                      {new Date(centerCapture.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col gap-4">
                {captures.slice(5, 7).map((c, i) => (
                  <VerticalPill key={c.id} capture={c} videoUrl={videoUrls[c.id]} delay={0.6+i*0.1} getFeelingEmoji={getFeelingEmoji} onClick={() => setSelectedMemory(c)} />
                ))}
              </div>
              <div className="flex flex-col gap-4">
                {captures.slice(7, 9).map((c, i) => (
                  <VerticalPill key={c.id} capture={c} videoUrl={videoUrls[c.id]} delay={0.8+i*0.1} getFeelingEmoji={getFeelingEmoji} onClick={() => setSelectedMemory(c)} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Memory modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div
              className="w-full sm:max-w-2xl bg-paper rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-soft"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle on mobile */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 bg-blush-light rounded-full" />
              </div>

              <video
                src={videoUrls[selectedMemory.id]}
                controls
                autoPlay
                playsInline
                className="w-full bg-ink"
                style={{ maxHeight: '55vh' }}
              />
              <div className="p-5 md:p-8">
                <h3 className="text-xl md:text-2xl font-bubble text-ink mb-1">
                  {new Date(selectedMemory.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <p className="text-text-whisper mb-5 font-hand">
                  {getFeelingEmoji(selectedMemory.feeling)} {selectedMemory.feeling}
                </p>
                <button onClick={() => setSelectedMemory(null)} className="btn-soft w-full sm:w-auto">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const VerticalPill = ({ capture, videoUrl, delay, getFeelingEmoji, onClick }) => (
  <motion.div
    className="relative w-28 h-44 rounded-full overflow-hidden shadow-gentle border-2 border-white group cursor-pointer flex-shrink-0"
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6 }}
    whileHover={{ y: -4, scale: 1.04 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
  >
    {videoUrl ? (
      <video src={videoUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" muted />
    ) : (
      <div className="w-full h-full bg-gradient-to-br from-blush-light to-sage-light flex items-center justify-center">
        <span className="text-2xl">{getFeelingEmoji(capture.feeling)}</span>
      </div>
    )}
    <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-all duration-500" />
  </motion.div>
);

export default GallerySection;