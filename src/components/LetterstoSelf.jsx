import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Calendar, Heart } from 'lucide-react';
import { saveLetter, getAllLetters, getReadyLetters, markLetterAsOpened } from '../utils/db';

const LettersToSelf = () => {
  const [step, setStep] = useState('list'); // list, write, schedule, sent
  const [letterText, setLetterText] = useState('Dearly,\n\n');
  const [deliveryOption, setDeliveryOption] = useState(null);
  const [customDate, setCustomDate] = useState('');
  const [allLetters, setAllLetters] = useState([]);
  const [readyLetters, setReadyLetters] = useState([]);
  const [openingLetter, setOpeningLetter] = useState(null);

  useEffect(() => {
    loadLetters();
  }, []);

  const loadLetters = async () => {
    const all = await getAllLetters();
    const ready = await getReadyLetters();
    setAllLetters(all.sort((a, b) => b.createdAt - a.createdAt));
    setReadyLetters(ready);
  };

  const deliveryOptions = [
    { id: 'month', label: 'One month from now', days: 30 },
    { id: 'quarter', label: 'Three months from now', days: 90 },
    { id: 'year', label: 'Next year', days: 365 },
    { id: 'custom', label: 'Choose a date', days: null },
  ];

  const handleSaveLetter = async () => {
    if (!deliveryOption) return;

    let deliveryDate;
    if (deliveryOption === 'custom') {
      deliveryDate = new Date(customDate).getTime();
    } else {
      const option = deliveryOptions.find(o => o.id === deliveryOption);
      deliveryDate = Date.now() + (option.days * 24 * 60 * 60 * 1000);
    }

    const letter = {
      text: letterText,
      deliveryDate,
      createdAt: Date.now(),
      opened: false,
    };

    await saveLetter(letter);
    setStep('sent');
    
    setTimeout(() => {
      setStep('list');
      setLetterText('Dearly,\n\n');
      setDeliveryOption(null);
      setCustomDate('');
      loadLetters();
    }, 3000);
  };

  const handleOpenLetter = async (letter) => {
    setOpeningLetter(letter);
    await markLetterAsOpened(letter.id);
    await loadLetters();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="heading-bubble mb-6">Letters to Self</h2>
        <p className="text-2xl font-hand text-text-soft">
          Write to future you
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Ready letters */}
            {readyLetters.length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-bubble text-ink mb-6">Waiting for you</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {readyLetters.map((letter) => (
                    <EnvelopeCard
                      key={letter.id}
                      letter={letter}
                      onOpen={() => handleOpenLetter(letter)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Scheduled letters */}
            {allLetters.filter(l => !l.opened && l.deliveryDate > Date.now()).length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-bubble text-ink mb-6">On their way</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {allLetters
                    .filter(l => !l.opened && l.deliveryDate > Date.now())
                    .map((letter) => (
                      <ScheduledLetterCard key={letter.id} letter={letter} />
                    ))}
                </div>
              </div>
            )}

            {/* Opened letters */}
            {allLetters.filter(l => l.opened).length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-bubble text-ink mb-6">Already read</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {allLetters
                    .filter(l => l.opened)
                    .map((letter) => (
                      <OpenedLetterCard key={letter.id} letter={letter} />
                    ))}
                </div>
              </div>
            )}

            {allLetters.length === 0 && (
              <div className="text-center py-16 card-gentle mb-12">
                <Mail className="w-16 h-16 mx-auto mb-6 text-blush" />
                <p className="text-xl font-hand text-text-whisper">
                  No letters yet. Write one when you're ready.
                </p>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={() => setStep('write')}
                className="btn-soft"
              >
                Write a letter
              </button>
            </div>
          </motion.div>
        )}

        {step === 'write' && (
          <motion.div
            key="write"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card-gentle paper-grain max-w-3xl mx-auto"
          >
            <h3 className="text-3xl font-bubble text-ink mb-6">Write gently</h3>
            <textarea
              value={letterText}
              onChange={(e) => setLetterText(e.target.value)}
              placeholder="What would you tell yourself later?"
              className="w-full h-96 px-6 py-5 bg-white/60 border-2 border-blush-light rounded-soft focus:outline-none focus:border-ink transition-all duration-500 resize-none font-body text-text-soft text-lg mb-6"
              style={{ lineHeight: '1.9' }}
            />

            <div className="flex justify-center gap-4">
              <button onClick={() => setStep('list')} className="btn-outline-soft">
                Not yet
              </button>
              <button
                onClick={() => setStep('schedule')}
                disabled={letterText.trim().length < 20}
                className={`btn-soft ${letterText.trim().length < 20 ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {step === 'schedule' && (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card-gentle max-w-3xl mx-auto"
          >
            <h3 className="text-3xl font-bubble text-ink mb-6">When should it arrive?</h3>
            
            <div className="space-y-4 mb-8">
              {deliveryOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setDeliveryOption(option.id)}
                  className={`
                    w-full p-6 rounded-soft border-2 text-left transition-all duration-500
                    ${deliveryOption === option.id
                      ? 'border-ink bg-blush-light/50 shadow-gentle'
                      : 'border-blush-light bg-white/40 hover:border-blush'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <Calendar className="w-6 h-6 text-ink" />
                    <span className="text-lg font-medium text-ink">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {deliveryOption === 'custom' && (
              <div className="mb-8">
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-6 py-4 bg-white/60 border-2 border-blush-light rounded-soft focus:outline-none focus:border-ink transition-all duration-500"
                />
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button onClick={() => setStep('write')} className="btn-outline-soft">
                Back
              </button>
              <button
                onClick={handleSaveLetter}
                disabled={!deliveryOption || (deliveryOption === 'custom' && !customDate)}
                className={`btn-soft ${(!deliveryOption || (deliveryOption === 'custom' && !customDate)) ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                Send to future
              </button>
            </div>
          </motion.div>
        )}

        {step === 'sent' && (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Mail className="w-24 h-24 mx-auto mb-8 text-blush" />
            </motion.div>
            <h3 className="text-4xl font-bubble text-ink mb-4">
              On its way
            </h3>
            <p className="text-xl font-hand text-text-soft">
              Your letter will find you when the time is right.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opened letter modal */}
      <AnimatePresence>
        {openingLetter && (
          <motion.div
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpeningLetter(null)}
          >
            <motion.div
              className="max-w-2xl w-full bg-paper rounded-puffy p-12 shadow-soft paper-grain"
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, rotate: 5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm text-text-whisper mb-6 font-hand">
                A letter you once wrote, for today
              </p>
              <div className="prose prose-lg max-w-none">
                <p className="text-text-soft whitespace-pre-wrap leading-relaxed text-lg">
                  {openingLetter.text}
                </p>
              </div>
              <div className="mt-8 text-right">
                <p className="text-sm text-text-whisper font-hand">
                  Written {new Date(openingLetter.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="mt-8 text-center">
                <button onClick={() => setOpeningLetter(null)} className="btn-soft">
                  Keep this close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EnvelopeCard = ({ letter, onOpen }) => {
  return (
    <motion.div
      className="relative card-gentle cursor-pointer group"
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onOpen}
    >
      <div className="absolute -top-6 -right-6 w-16 h-16 bg-blush rounded-full flex items-center justify-center shadow-gentle">
        <Heart className="w-8 h-8 text-white" />
      </div>
      
      <Mail className="w-12 h-12 text-blush mb-4" />
      <p className="text-lg font-hand text-ink mb-2">
        A letter you once wrote, for today
      </p>
      <p className="text-sm text-text-whisper">
        Written {new Date(letter.createdAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        })}
      </p>
      
      <div className="mt-6">
        <span className="text-sm font-medium text-ink group-hover:underline">
          Open gently →
        </span>
      </div>
    </motion.div>
  );
};

const ScheduledLetterCard = ({ letter }) => {
  const daysUntil = Math.ceil((letter.deliveryDate - Date.now()) / (1000 * 60 * 60 * 24));
  
  return (
    <motion.div
      className="card-gentle"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Mail className="w-10 h-10 text-ink-light opacity-40 mb-4" />
      <p className="text-lg font-hand text-text-soft mb-2">
        Arriving in {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
      </p>
      <p className="text-sm text-text-whisper">
        {new Date(letter.deliveryDate).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      </p>
    </motion.div>
  );
};

const OpenedLetterCard = ({ letter }) => {
  return (
    <motion.div
      className="card-gentle opacity-60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6 }}
    >
      <Mail className="w-10 h-10 text-ink-light opacity-30 mb-4" />
      <p className="text-sm text-text-whisper">
        Opened {new Date(letter.openedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      </p>
    </motion.div>
  );
};

export default LettersToSelf;