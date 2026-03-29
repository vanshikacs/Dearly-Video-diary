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
  const [moments, setMoments]                   = useState([]);
  const [selectedMoment, setSelectedMoment]     = useState(null);
  const [isGenerating, setIsGenerating]         = useState(false);
  const [generationStep, setGenerationStep]     = useState('');
  const [selectedTheme, setSelectedTheme]       = useState('older');
  const [error, setError]                       = useState('');
  const urlsRef = useRef([]);

  useEffect(() => {
    loadMoments();
    return () => { urlsRef.current.forEach((u) => URL.revokeObjectURL(u)); };
  }, []);

  const loadMoments = async () => {
    const all = await getAllMoments();
    setMoments(all.sort((a, b) => b.createdAt - a.createdAt));
  };

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
    let idx = 0;
    setGenerationStep(steps[0]);
    const timer = setInterval(() => { idx = Math.min(idx + 1, steps.length - 1); setGenerationStep(steps[idx]); }, 2200);

    try {
      const moment = await generateMoment({ theme: selectedTheme });
      clearInterval(timer);
      await loadMoments();
      setSelectedMoment({ ...moment, _url: makeBlobUrl(moment.blob) });
    } catch (err) {
      clearInterval(timer);
      setError(err.message || 'Could not create moment. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const openMoment = (m) => {
    if (!m.blob) return;
    setSelectedMoment({ ...m, _url: makeBlobUrl(m.blob) });
  };

  const closeModal = () => {
    if (selectedMoment?._url) {
      URL.revokeObjectURL(selectedMoment._url);
      urlsRef.current = urlsRef.current.filter((u) => u !== selectedMoment._url);
    }
    setSelectedMoment(null);
  };

  const themeLabel = (id) => THEMES.find((t) => t.id === id);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-20">

      {/* Page title */}
      <motion.div className="text-center mb-10 md:mb-16" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="heading-bubble mb-3 md:mb-6">Moments</h2>
        <p className="text-lg md:text-2xl font-hand text-text-soft">
          Your memories, softly woven together
        </p>
      </motion.div>

      {/* Generation card */}
      <motion.div
        className="card-gentle paper-grain mb-10 md:mb-16"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Film className="w-6 h-6 text-ink flex-shrink-0" />
          <h3 className="text-2xl md:text-3xl font-bubble text-ink">Create a moment</h3>
        </div>

        {/* Theme chips — scroll on mobile */}
        <p className="text-sm font-medium text-text-soft mb-3">Choose a feeling:</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hidden mb-7"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={`
                flex-shrink-0 px-5 py-3 rounded-full border-2 text-sm font-medium transition-all duration-400
                ${selectedTheme === theme.id
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-white/60 border-blush-light'}
              `}
            >
              {theme.emoji} {theme.label}
            </button>
          ))}
        </div>

        {error && (
          <motion.p
            className="text-sm text-blush-dark mb-5 p-4 bg-blush-light/30 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        {!isGenerating ? (
          <button onClick={handleGenerateMoment} className="btn-soft w-full min-h-[52px] flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Create moment
          </button>
        ) : (
          <div className="text-center py-10">
            <motion.div
              className="w-14 h-14 mx-auto mb-5 border-4 border-blush border-t-ink rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-lg font-hand text-text-soft">{generationStep}</p>
            <p className="text-sm text-text-whisper mt-1 font-hand">This takes a moment...</p>
          </div>
        )}
      </motion.div>

      {/* Moments grid */}
      {moments.length > 0 && (
        <div>
          <h3 className="text-2xl md:text-3xl font-bubble text-ink mb-6 text-center">Your moments</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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

      {/* Full-screen player — bottom sheet on mobile */}
      <AnimatePresence>
        {selectedMoment && (
          <motion.div
            className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="w-full sm:max-w-2xl bg-paper rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-soft"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 bg-blush-light rounded-full" />
              </div>

              {selectedMoment._url && (
                <video
                  src={selectedMoment._url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full bg-ink"
                  style={{
                    aspectRatio: selectedMoment.aspectRatio === '9:16' ? '9/16' :
                                 selectedMoment.aspectRatio === '1:1'  ? '1/1'  : '16/9',
                    maxHeight: '65vh',
                  }}
                />
              )}
              <div className="p-5 md:p-8">
                <h3 className="text-xl md:text-2xl font-bubble text-ink mb-1">
                  {themeLabel(selectedMoment.theme)?.emoji}{' '}
                  {themeLabel(selectedMoment.theme)?.label}
                </h3>
                <p className="text-text-whisper mb-5 font-hand text-sm">
                  Created {new Date(selectedMoment.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  {' · '}{selectedMoment.clipCount} {selectedMoment.clipCount === 1 ? 'clip' : 'clips'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => downloadMoment(selectedMoment.blob, selectedMoment.theme)}
                    className="btn-soft flex-1 min-h-[52px] flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Keep forever
                  </button>
                  <button onClick={closeModal} className="btn-outline-soft flex-1 min-h-[52px]">Close</button>
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
      className="card-gentle group cursor-pointer active:scale-[0.98] transition-transform"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      onClick={onOpen}
    >
      <div
        className="rounded-2xl mb-4 overflow-hidden relative bg-gradient-to-br from-blush-light/30 to-sage-light/30"
        style={{
          aspectRatio: moment.aspectRatio === '9:16' ? '9/16' :
                       moment.aspectRatio === '1:1'  ? '1/1'  : '16/9',
          maxHeight: '240px',
        }}
      >
        {previewUrl && (
          <video src={previewUrl} className="w-full h-full object-cover" muted playsInline />
        )}
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/15 transition-all duration-500 flex items-center justify-center">
          <Film className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-hand text-base text-ink truncate">
            {theme?.emoji} {theme?.label}
          </p>
          <p className="text-xs text-text-whisper">
            {new Date(moment.createdAt).toLocaleDateString()} · {moment.clipCount}{' '}
            {moment.clipCount === 1 ? 'clip' : 'clips'}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDownload(); }}
          className="p-3 hover:bg-blush-light rounded-full transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <Download className="w-4 h-4 text-ink" />
        </button>
      </div>
    </motion.div>
  );
};

export default MomentsViewer;