import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Download, Sparkles } from 'lucide-react';
import { getAllMoments, deleteMoment } from '../utils/db';
import { generateMoment, downloadMoment } from '../utils/momentGenerator';
import { loadFFmpeg } from '../utils/videoProcessor';

const MomentsViewer = () => {
  const [moments, setMoments] = useState([]);
  const [selectedMoment, setSelectedMoment] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('older');

  useEffect(() => {
    loadMoments();
  }, []);

  const loadMoments = async () => {
    const all = await getAllMoments();
    setMoments(all.sort((a, b) => b.createdAt - a.createdAt));
  };

  const handleGenerateMoment = async () => {
    setIsGenerating(true);
    setGenerationStep('Gathering your memories...');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGenerationStep('Creating your moment...');

      const moment = await generateMoment({ theme: selectedTheme });

      await loadMoments();
      setSelectedMoment(moment);
      setIsGenerating(false);
      setGenerationStep('');

    } catch (error) {
      console.error('Moment generation failed:', error);
      setGenerationStep('');
      setIsGenerating(false);
      
      if (error.message.includes('Nothing here yet')) {
        alert("Nothing here yet. That's okay.\n\nCapture a few video moments first, then return here.");
      } else {
        alert('Could not create moment. Please try again.');
      }
    }
  };

  const themes = [
    { id: 'older', label: 'Older memories', emoji: '📜' },
    { id: 'peaceful', label: 'Peaceful moments', emoji: '🕊️' },
    { id: 'recent', label: 'Recent days', emoji: '🌸' },
  ];

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
            {themes.map(theme => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`
                  px-6 py-3 rounded-full border-2 transition-all duration-500
                  ${selectedTheme === theme.id
                    ? 'bg-ink text-paper border-ink scale-105 shadow-gentle'
                    : 'bg-white/60 border-blush-light hover:border-ink'}
                `}
              >
                <span className="mr-2">{theme.emoji}</span>
                {theme.label}
              </button>
            ))}
          </div>
        </div>

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
            <p className="text-xl font-hand text-text-soft">
              {generationStep}
            </p>
          </div>
        )}
      </motion.div>

      {/* Moments grid */}
      {moments.length > 0 && (
        <div>
          <h3 className="text-3xl font-bubble text-ink mb-8 text-center">Your moments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moments.map((moment, index) => (
              <motion.div
                key={moment.id}
                className="card-gentle group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedMoment(moment)}
              >
                <div className="aspect-video bg-gradient-to-br from-blush-light/30 to-sage-light/30 rounded-soft mb-4 overflow-hidden relative">
                  {moment.blob && (
                    <video
                      src={URL.createObjectURL(moment.blob)}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-all duration-500 flex items-center justify-center">
                    <Film className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-hand text-lg text-ink">
                      {themes.find(t => t.id === moment.theme)?.emoji} {themes.find(t => t.id === moment.theme)?.label}
                    </p>
                    <p className="text-sm text-text-whisper">
                      {new Date(moment.createdAt).toLocaleDateString()} • {moment.clipCount} clips
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadMoment(moment.blob, moment.theme);
                    }}
                    className="p-3 hover:bg-blush-light rounded-full transition-colors"
                  >
                    <Download className="w-5 h-5 text-ink" />
                  </button>
                </div>
              </motion.div>
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
            onClick={() => setSelectedMoment(null)}
          >
            <motion.div
              className="max-w-5xl w-full bg-paper rounded-puffy overflow-hidden shadow-soft"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={selectedMoment.blob ? URL.createObjectURL(selectedMoment.blob) : ''}
                controls
                autoPlay
                className="w-full aspect-video bg-ink"
              />
              <div className="p-8">
                <h3 className="text-3xl font-bubble text-ink mb-2">
                  {themes.find(t => t.id === selectedMoment.theme)?.emoji}{' '}
                  {themes.find(t => t.id === selectedMoment.theme)?.label}
                </h3>
                <p className="text-text-whisper mb-6 font-hand">
                  Created {new Date(selectedMoment.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => downloadMoment(selectedMoment.blob, selectedMoment.theme)}
                    className="btn-soft"
                  >
                    <Download className="w-5 h-5 inline mr-2" />
                    Keep forever
                  </button>
                  <button onClick={() => setSelectedMoment(null)} className="btn-outline-soft">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MomentsViewer;