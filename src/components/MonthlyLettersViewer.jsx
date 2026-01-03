import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar } from 'lucide-react';
import { getAllMonthlyLetters, generateMonthlyLetter } from '../utils/monthlyLetterGenerator';

const MonthlyLettersViewer = () => {
  const [letters, setLetters] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadLetters();
  }, []);

  const loadLetters = async () => {
    const all = await getAllMonthlyLetters();
    setLetters(all.sort((a, b) => b.createdAt - a.createdAt));
  };

  const handleGenerateCurrentMonth = async () => {
    setGenerating(true);
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    try {
      const letter = await generateMonthlyLetter(month, year);
      if (letter) {
        await loadLetters();
        setSelectedLetter(letter);
      }
    } catch (error) {
      console.error('Failed to generate letter:', error);
    }
    
    setGenerating(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="heading-bubble mb-6">Monthly Letters</h2>
        <p className="text-2xl font-hand text-text-soft max-w-2xl mx-auto">
          At each month's end, Dearly writes you a letter about the time that passed
        </p>
      </motion.div>

      {letters.length === 0 ? (
        <div className="text-center py-16 card-gentle">
          <BookOpen className="w-16 h-16 mx-auto mb-6 text-blush" />
          <h3 className="text-2xl font-bubble text-ink mb-4">
            No letters yet
          </h3>
          <p className="text-lg font-hand text-text-whisper mb-8 max-w-md mx-auto">
            Keep capturing moments. At the month's end, a letter will appear here.
          </p>
          
          {!generating ? (
            <button onClick={handleGenerateCurrentMonth} className="btn-soft">
              Generate for this month
            </button>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <motion.div
                className="w-6 h-6 border-3 border-blush border-t-ink rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span className="font-hand text-text-soft">Writing...</span>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {letters.map((letter, index) => (
              <motion.div
                key={letter.id}
                className="card-gentle cursor-pointer group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => setSelectedLetter(letter)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-8 h-8 text-blush" />
                  <h3 className="text-xl font-bubble text-ink">
                    {new Date(letter.year, letter.month - 1).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h3>
                </div>
                
                <p className="text-sm text-text-whisper mb-4">
                  {letter.captureCount} {letter.captureCount === 1 ? 'moment' : 'moments'} captured
                </p>
                
                <p className="text-ink text-sm group-hover:underline">
                  Read letter →
                </p>
              </motion.div>
            ))}
          </div>

          {!generating ? (
            <div className="text-center">
              <button onClick={handleGenerateCurrentMonth} className="btn-outline-soft">
                Generate for this month
              </button>
            </div>
          ) : (
            <div className="text-center">
              <motion.div
                className="w-12 h-12 mx-auto border-4 border-blush border-t-ink rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          )}
        </>
      )}

      {/* Letter reading modal */}
      {selectedLetter && (
        <motion.div
          className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedLetter(null)}
        >
          <motion.div
            className="max-w-3xl w-full bg-paper rounded-puffy p-12 my-8 shadow-soft paper-grain"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8">
              <h3 className="text-4xl font-bubble monthly-letter-heading mb-2">
                {new Date(selectedLetter.year, selectedLetter.month - 1).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>
              <p className="text-sm text-text-whisper font-hand">
                {selectedLetter.captureCount} {selectedLetter.captureCount === 1 ? 'moment' : 'moments'} remembered
              </p>
            </div>

            <div className="prose prose-lg max-w-none mb-8">
              <p className="monthly-letter-text whitespace-pre-wrap leading-loose text-lg font-body">
                {selectedLetter.content}
              </p>
            </div>

            <div className="text-center">
              <button onClick={() => setSelectedLetter(null)} className="btn-soft">
                Keep this close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MonthlyLettersViewer;