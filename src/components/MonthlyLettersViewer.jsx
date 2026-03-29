import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar } from 'lucide-react';
import { getAllMonthlyLetters, generateMonthlyLetter } from '../utils/monthlyLetterGenerator';

const MonthlyLettersViewer = () => {
  const [letters, setLetters]       = useState([]);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { loadLetters(); }, []);

  const loadLetters = async () => {
    const all = await getAllMonthlyLetters();
    setLetters(all.sort((a, b) => b.createdAt - a.createdAt));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const now = new Date();
    try {
      const letter = await generateMonthlyLetter(now.getMonth() + 1, now.getFullYear());
      if (letter) { await loadLetters(); setSelectedLetter(letter); }
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  return (
    <div className="max-w-2xl md:max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-20">
      <motion.div className="text-center mb-10 md:mb-16" initial={{opacity:0,y:24}} animate={{opacity:1,y:0}}>
        <h2 className="heading-bubble mb-3 md:mb-6">Monthly Letters</h2>
        <p className="text-base md:text-2xl font-hand text-text-soft max-w-sm md:max-w-2xl mx-auto">
          At each month's end, Dearly writes you a letter about the time that passed
        </p>
      </motion.div>

      {letters.length === 0 ? (
        <div className="text-center py-12 md:py-16 card-gentle">
          <BookOpen className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-5 text-blush" />
          <h3 className="text-xl md:text-2xl font-bubble text-ink mb-3">No letters yet</h3>
          <p className="text-sm md:text-lg font-hand text-text-whisper mb-8 max-w-xs md:max-w-md mx-auto">
            Keep capturing moments. At the month's end, a letter will appear here.
          </p>
          {!generating ? (
            <button onClick={handleGenerate} className="btn-soft min-h-[52px] px-8">
              Generate for this month
            </button>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <motion.div className="w-5 h-5 border-2 border-blush border-t-ink rounded-full"
                animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:'linear'}} />
              <span className="font-hand text-text-soft">Writing...</span>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Grid — 1 col mobile, 3 col md */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
            {letters.map((letter, index) => (
              <motion.div key={letter.id}
                className="card-gentle cursor-pointer group active:scale-[0.98] transition-transform"
                initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:index*0.08}}
                whileHover={{y:-4}}
                onClick={()=>setSelectedLetter(letter)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-6 h-6 text-blush flex-shrink-0" />
                  <h3 className="text-lg md:text-xl font-bubble text-ink">
                    {new Date(letter.year, letter.month-1).toLocaleDateString('en-US',{month:'long',year:'numeric'})}
                  </h3>
                </div>
                <p className="text-sm text-text-whisper mb-3">
                  {letter.captureCount} {letter.captureCount===1?'moment':'moments'} captured
                </p>
                <p className="text-sm text-ink group-hover:underline">Read letter →</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            {!generating ? (
              <button onClick={handleGenerate} className="btn-outline-soft min-h-[52px] px-8">
                Generate for this month
              </button>
            ) : (
              <motion.div className="w-10 h-10 mx-auto border-4 border-blush border-t-ink rounded-full"
                animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:'linear'}} />
            )}
          </div>
        </>
      )}

      {/* Letter modal — bottom sheet on mobile */}
      {selectedLetter && (
        <motion.div
          className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto"
          initial={{opacity:0}} animate={{opacity:1}}
          onClick={()=>setSelectedLetter(null)}
        >
          <motion.div
            className="w-full sm:max-w-3xl bg-paper rounded-t-3xl sm:rounded-3xl p-6 md:p-12 sm:my-8 shadow-soft paper-grain max-h-[90vh] overflow-y-auto"
            initial={{y:80,opacity:0}} animate={{y:0,opacity:1}}
            exit={{y:80,opacity:0}}
            transition={{type:'spring',stiffness:300,damping:30}}
            onClick={(e)=>e.stopPropagation()}
          >
            {/* Drag handle mobile */}
            <div className="flex justify-center mb-4 sm:hidden">
              <div className="w-10 h-1 bg-blush-light rounded-full" />
            </div>

            <div className="mb-6">
              <h3 className="text-3xl md:text-4xl font-bubble monthly-letter-heading mb-1">
                {new Date(selectedLetter.year, selectedLetter.month-1).toLocaleDateString('en-US',{month:'long',year:'numeric'})}
              </h3>
              <p className="text-sm text-text-whisper font-hand">
                {selectedLetter.captureCount} {selectedLetter.captureCount===1?'moment':'moments'} remembered
              </p>
            </div>

            <p className="monthly-letter-text whitespace-pre-wrap leading-loose text-base md:text-lg font-body mb-8">
              {selectedLetter.content}
            </p>

            <button onClick={()=>setSelectedLetter(null)} className="btn-soft w-full sm:w-auto min-h-[52px] px-8">
              Keep this close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MonthlyLettersViewer;