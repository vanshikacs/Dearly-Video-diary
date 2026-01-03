import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { getAllCaptures, getVideoBlob } from '../utils/db';

const GallerySection = () => {
  const [captures, setCaptures] = useState([]);
  const [videoUrls, setVideoUrls] = useState({});
  const [centerCapture, setCenterCapture] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadCaptures();
  }, []);

  const loadCaptures = async () => {
    const allCaptures = await getAllCaptures();
    const recent = allCaptures.slice(-9); // Last 9
    setCaptures(recent);

    // Set center (5th item)
    if (recent.length >= 5) {
      setCenterCapture(recent[4]);
    }

    // Load video URLs
    const urls = {};
    for (const capture of recent) {
      const blob = await getVideoBlob(capture.id);
      if (blob) {
        urls[capture.id] = URL.createObjectURL(blob);
      }
    }
    setVideoUrls(urls);
  };

  return (
    <section ref={scrollRef} className="py-32 relative overflow-hidden bg-paper">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          className="heading-bubble text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          GALLERY
        </motion.h2>

        {captures.length === 0 ? (
          <motion.div
            className="text-center py-32"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-3xl font-hand text-text-whisper">
              Nothing here yet. That's okay.
            </p>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center gap-6">
            {/* Left vertical pills */}
            <div className="flex flex-col gap-4">
              {captures.slice(0, 2).map((capture, index) => (
                <VerticalPill 
                  key={capture.id} 
                  capture={capture} 
                  videoUrl={videoUrls[capture.id]} 
                  delay={index * 0.1}
                  onClick={() => setSelectedMemory(capture)}
                />
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {captures.slice(2, 4).map((capture, index) => (
                <VerticalPill 
                  key={capture.id} 
                  capture={capture} 
                  videoUrl={videoUrls[capture.id]} 
                  delay={0.2 + index * 0.1}
                  onClick={() => setSelectedMemory(capture)}
                />
              ))}
            </div>

            {/* Center large card */}
            {centerCapture && (
              <motion.div
                className="relative w-96 h-96 rounded-full overflow-hidden shadow-soft border-4 border-white cursor-pointer"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.8 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedMemory(centerCapture)}
              >
                {videoUrls[centerCapture.id] ? (
                  <video
                    src={videoUrls[centerCapture.id]}
                    className="w-full h-full object-cover"
                    controls={false}
                    loop
                    muted
                    onMouseEnter={(e) => e.target.play()}
                    onMouseLeave={(e) => {
                      e.target.pause();
                      e.target.currentTime = 0;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blush-light to-sage-light flex items-center justify-center">
                    <span className="text-6xl">{getFeelingEmoji(centerCapture.feeling)}</span>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-ink/60 to-transparent">
                  <p className="text-white font-hand text-lg">
                    {new Date(centerCapture.timestamp).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Right vertical pills */}
            <div className="flex flex-col gap-4">
              {captures.slice(5, 7).map((capture, index) => (
                <VerticalPill 
                  key={capture.id} 
                  capture={capture} 
                  videoUrl={videoUrls[capture.id]} 
                  delay={0.6 + index * 0.1}
                  onClick={() => setSelectedMemory(capture)}
                />
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {captures.slice(7, 9).map((capture, index) => (
                <VerticalPill 
                  key={capture.id} 
                  capture={capture} 
                  videoUrl={videoUrls[capture.id]} 
                  delay={0.8 + index * 0.1}
                  onClick={() => setSelectedMemory(capture)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Video player modal */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div
              className="max-w-4xl w-full bg-paper rounded-puffy overflow-hidden shadow-soft"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={videoUrls[selectedMemory.id]}
                controls
                autoPlay
                className="w-full aspect-video bg-ink"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bubble text-ink mb-2">
                  {new Date(selectedMemory.timestamp).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <p className="text-text-whisper mb-4 font-hand">
                  {getFeelingEmoji(selectedMemory.feeling)} {selectedMemory.feeling}
                </p>
                <button onClick={() => setSelectedMemory(null)} className="btn-soft">
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

const VerticalPill = ({ capture, videoUrl, delay, onClick }) => {
  return (
    <motion.div
      className="relative w-32 h-48 rounded-full overflow-hidden shadow-gentle border-3 border-white group cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -5, scale: 1.05 }}
      onClick={onClick}
    >
      {videoUrl ? (
        <video
          src={videoUrl}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          muted
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blush-light to-sage-light flex items-center justify-center">
          <span className="text-3xl">{getFeelingEmoji(capture.feeling)}</span>
        </div>
      )}

      <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-all duration-500" />
    </motion.div>
  );
};

const getFeelingEmoji = (feeling) => {
  const emojis = {
    peaceful: '🕊️',
    grateful: '🙏',
    gentle: '🌸',
    quiet: '🌙',
    warm: '☕',
    hopeful: '🌿',
    tender: '💭',
    calm: '🌊',
    thoughtful: '🍂',
    nostalgic: '📜',
  };
  return emojis[feeling] || '💭';
};

export default GallerySection;