import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Download, Sparkles } from 'lucide-react';
import { getAllMoments, deleteMoment } from '../utils/db';
import { generateMoment, downloadMoment } from '../utils/momentGenerator';

const THEMES = [
  { id: 'older',    label: 'Older memories',  emoji: '📜' },
  { id: 'peaceful', label: 'Peaceful moments', emoji: '🕊️' },
  { id: 'recent',   label: 'Recent days',      emoji: '🌸' },
];

const MomentsViewer = () => {
  const [moments, setMoments]             = useState([]);
  const [selectedMoment, setSelectedMoment] = useState(null);
  const [isGenerating, setIsGenerating]   = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [selectedTheme, setSelectedTheme]  = useState('older');
  const [error, setError]                 = useState('');

  // Keep track of created object URLs so we can revoke them on unmount
  const urlsRef = useRef([]);

  useEffect(() => {
    loadMoments();
    return () => {
      // Clean up all object URLs when component unmounts
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const loadMoments = async () => {
    const all = await getAllMoments();
    setMoments(all.sort((a, b) => b.createdAt - a.createdAt));
  };

  /** Create a stable object URL and track it for later cleanup */
  const makeBlobUrl = (blob) => {
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    urlsRef.current.push(url);
    return url;
  };

  const handleGenerateMoment = async () => {
    setIsGenerating(true);
    setError('');

    const steps = [
      'Gathering your memories...',
      'Choosing the best moments...',
      'Trimming clips...',
      'Weaving them together...',
      'Adding finishing touches...',
    ];
    let stepIndex = 0;
    setGenerationStep(steps[0]);

    const stepTimer = setInterval(() => {
      stepIndex = Math.min(stepIndex + 1, steps.length - 1);
      setGenerationStep(steps[stepIndex]);
    }, 2200);

    try {
      const moment = await generateMoment({ theme: selectedTheme });
      clearInterval(stepTimer);

      await loadMoments();
      // Attach a fresh URL for the selected moment modal
      setSelectedMoment({ ...moment, _url: makeBlobUrl(moment.blob) });
    } catch (err) {
      clearInterval(stepTimer);
      console.error('Moment generation failed:', err);
      setError(err.message || 'Could not create moment. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const openMoment = (moment) => {
    if (!moment.blob) return;
    setSelectedMoment({ ...moment, _url: makeBlobUrl(moment.blob) });
  };

  const closeModal = () => {
    // Revoke the temporary URL we made for the modal
    if (selectedMoment?._url) {
      URL.revokeObjectURL(selectedMoment._url);
      urlsRef.current = urlsRef.current.filter((u) => u !== selectedMoment._url);
    }
    setSelectedMoment(null);
  };

  const themeLabel = (id) => THEMES.find((t) => t.id === id);

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="heading-bubble mb-6">Moments</h2>
        <p className="text-2xl font-hand text-text-soft">
          Your memories, softly woven together
        </p>
      </motion.div>

      {/* Generation card */}
      <motion.div
        className="card-gentle mb-16 paper-grain max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <Film className="w-8 h-8 text-ink" />
          <h3 className="text-3xl font-bubble text-ink">Create a moment</h3>
        </div>

        <div className="mb-8">
          <p className="text-sm font-medium text-text-soft mb-4">Choose a feeling:</p>
          <div className="flex flex-wrap gap-3">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`px-6 py-3 rounded-full border-2 transition-all duration-500 ${
                  selectedTheme === theme.id
                    ? 'bg-ink text-paper border-ink scale-105 shadow-gentle'
                    : 'bg-white/60 border-blush-light hover:border-ink'
                }`}
              >
                <span className="mr-2">{theme.emoji}</span>
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <motion.p
            className="text-sm text-blush-dark mb-6 p-4 bg-blush-light/30 rounded-soft"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        {!isGenerating ? (
          <button onClick={handleGenerateMoment} className="btn-soft w-full">
            <Sparkles className="w-5 h-5 inline mr-2" />
            Create moment
          </button>
        ) : (
          <div className="text-center py-12">
            <motion.div
              className="w-16 h-16 mx-auto mb-6 border-4 border-blush border-t-ink rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-xl font-hand text-text-soft">{generationStep}</p>
            <p className="text-sm text-text-whisper mt-2 font-hand">This takes a moment...</p>
          </div>
        )}
      </motion.div>

      {/* Moments grid */}
      {moments.length > 0 && (
        <div>
          <h3 className="text-3xl font-bubble text-ink mb-8 text-center">Your moments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moments.map((moment, index) => (
              <MomentCard
                key={moment.id}
                moment={moment}
                index={index}
                themeLabel={themeLabel}
                onOpen={() => openMoment(moment)}
                onDownload={() => downloadMoment(moment.blob, moment.theme)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen player */}
      <AnimatePresence>
        {selectedMoment && (
          <motion.div
            className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="max-w-2xl w-full bg-paper rounded-puffy overflow-hidden shadow-soft"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMoment._url && (
                <video
                  src={selectedMoment._url}
                  controls
                  autoPlay
                  className="w-full bg-ink"
                  style={{
                    aspectRatio: selectedMoment.aspectRatio === '9:16' ? '9/16' :
                                 selectedMoment.aspectRatio === '1:1'  ? '1/1'  : '16/9',
                    maxHeight: '70vh',
                  }}
                />
              )}
              <div className="p-8">
                <h3 className="text-3xl font-bubble text-ink mb-2">
                  {themeLabel(selectedMoment.theme)?.emoji}{' '}
                  {themeLabel(selectedMoment.theme)?.label}
                </h3>
                <p className="text-text-whisper mb-6 font-hand">
                  Created {new Date(selectedMoment.createdAt).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric',
                  })} · {selectedMoment.clipCount} {selectedMoment.clipCount === 1 ? 'clip' : 'clips'}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => downloadMoment(selectedMoment.blob, selectedMoment.theme)}
                    className="btn-soft"
                  >
                    <Download className="w-5 h-5 inline mr-2" />
                    Keep forever
                  </button>
                  <button onClick={closeModal} className="btn-outline-soft">Close</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── MomentCard ───────────────────────────────────────────────────────────────
// Kept as separate component so its URL lifecycle is isolated per card render.
const MomentCard = ({ moment, index, themeLabel, onOpen, onDownload }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (moment.blob) {
      const url = URL.createObjectURL(moment.blob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [moment.blob]);

  const theme = themeLabel(moment.theme);

  return (
    <motion.div
      className="card-gentle group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      onClick={onOpen}
    >
      <div className="rounded-soft mb-4 overflow-hidden relative bg-gradient-to-br from-blush-light/30 to-sage-light/30"
        style={{
          aspectRatio: moment.aspectRatio === '9:16' ? '9/16' :
                       moment.aspectRatio === '1:1'  ? '1/1'  : '16/9',
          maxHeight: '280px',
        }}
      >
        {previewUrl && (
          <video src={previewUrl} className="w-full h-full object-cover" muted />
        )}
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-all duration-500 flex items-center justify-center">
          <Film className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-hand text-lg text-ink">
            {theme?.emoji} {theme?.label}
          </p>
          <p className="text-sm text-text-whisper">
            {new Date(moment.createdAt).toLocaleDateString()} · {moment.clipCount}{' '}
            {moment.clipCount === 1 ? 'clip' : 'clips'}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDownload(); }}
          className="p-3 hover:bg-blush-light rounded-full transition-colors"
        >
          <Download className="w-5 h-5 text-ink" />
        </button>
      </div>
    </motion.div>
  );
};

export default MomentsViewer;