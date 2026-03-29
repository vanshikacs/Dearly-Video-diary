import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Square, Feather } from 'lucide-react';
import { saveCapture, saveVideoBlob } from '../utils/db';
import { getSupportedMimeType } from '../utils/videoProcessor';

const FEELINGS = [
  { id: 'peaceful',   emoji: '🕊️', label: 'Peaceful'   },
  { id: 'grateful',   emoji: '🙏', label: 'Grateful'   },
  { id: 'gentle',     emoji: '🌸', label: 'Gentle'     },
  { id: 'quiet',      emoji: '🌙', label: 'Quiet'      },
  { id: 'warm',       emoji: '☕', label: 'Warm'       },
  { id: 'hopeful',    emoji: '🌿', label: 'Hopeful'    },
  { id: 'tender',     emoji: '💭', label: 'Tender'     },
  { id: 'calm',       emoji: '🌊', label: 'Calm'       },
  { id: 'thoughtful', emoji: '🍂', label: 'Thoughtful' },
  { id: 'nostalgic',  emoji: '📜', label: 'Nostalgic'  },
];

const PROMPTS = [
  "What stayed with you today?",
  "Was there a moment that felt small but mattered?",
  "What would you tell today, if it could listen?",
  "What softened in you recently?",
  "What did you notice that you usually miss?",
];

const CaptureComponent = ({ onCaptureComplete }) => {
  const [step, setStep]                   = useState('idle');
  const [isRecording, setIsRecording]     = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream]               = useState(null);
  const [recordedBlob, setRecordedBlob]   = useState(null);
  const [writtenText, setWrittenText]     = useState('Dearly,\n\n');
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [showPrompt, setShowPrompt]       = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');

  const videoRef         = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const timerRef         = useRef(null);
  const textareaRef      = useRef(null);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stream]);

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;

      const mimeType = getSupportedMimeType();
      let recorder;
      try { recorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : {}); }
      catch (_) { recorder = new MediaRecorder(mediaStream); }

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'video/webm' });
        setRecordedBlob(blob);
        setStep('preview');
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = URL.createObjectURL(blob);
        }
      };
      recorder.start();
      setIsRecording(true);
      setStep('recording');
      timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Camera permission is needed to record. Please allow access and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleContinueToWriting = () => {
    setStep('writing');
    setTimeout(() => textareaRef.current?.focus(), 300);
  };

  const handleSaveCapture = async () => {
    if (!selectedFeeling) return;
    setStep('saving');
    try {
      const capture = {
        feeling: selectedFeeling,
        text: writtenText,
        timestamp: Date.now(),
        date: new Date().toISOString(),
        duration: recordingTime,
      };
      const captureId = await saveCapture(capture);
      if (recordedBlob) await saveVideoBlob(captureId, recordedBlob);

      setRecordedBlob(null);
      setWrittenText('Dearly,\n\n');
      setSelectedFeeling(null);
      setRecordingTime(0);
      setStep('idle');
      setShowPrompt(false);
      if (onCaptureComplete) onCaptureComplete(captureId);
    } catch (err) {
      console.error('Save error:', err);
      setStep('feeling');
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <motion.div
      id="capture"
      className="card-gentle max-w-4xl mx-auto paper-grain relative overflow-hidden"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Corner doodles — hidden on mobile to reduce noise */}
      <motion.div
        className="absolute -top-6 -right-6 w-10 h-10 text-blush opacity-30 hidden sm:block"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        </svg>
      </motion.div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Video className="w-6 h-6 text-ink flex-shrink-0" />
        <h3 className="text-2xl md:text-3xl font-bubble text-ink">Capture softly</h3>
      </div>

      {/* Video preview */}
      <div className="relative bg-gradient-to-br from-blush-light/30 to-sage-light/30 rounded-2xl overflow-hidden mb-6 border-2 border-blush-light"
        style={{ aspectRatio: '4/3' }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted={step === 'recording'}
          playsInline
          className="w-full h-full object-cover"
        />
        {step === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper/80 backdrop-blur-sm">
            <p className="text-base md:text-xl text-text-whisper font-hand px-4 text-center">
              When you're ready
            </p>
          </div>
        )}
        {isRecording && (
          <motion.div
            className="absolute top-3 right-3 flex items-center gap-2 bg-ink text-paper px-4 py-2 rounded-full text-sm"
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-blush rounded-full" />
            <span className="font-mono font-medium">{formatTime(recordingTime)}</span>
          </motion.div>
        )}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">

        {step === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center pt-2">
            <motion.button
              onClick={startRecording}
              className="btn-soft min-h-[52px] px-10"
              whileTap={{ scale: 0.95 }}
            >
              Begin
            </motion.button>
          </motion.div>
        )}

        {step === 'recording' && (
          <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center pt-2">
            <motion.button
              onClick={stopRecording}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blush-dark text-white rounded-full font-medium shadow-gentle min-h-[52px]"
              whileTap={{ scale: 0.95 }}
            >
              <Square className="w-4 h-4" />
              Pause
            </motion.button>
          </motion.div>
        )}

        {step === 'preview' && (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              onClick={() => { setRecordedBlob(null); setRecordingTime(0); setStep('idle'); }}
              className="btn-outline-soft min-h-[52px]"
            >
              Start over
            </button>
            <button onClick={handleContinueToWriting} className="btn-soft min-h-[52px]">
              Continue
            </button>
          </motion.div>
        )}

        {step === 'writing' && (
          <motion.div key="writing" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <textarea
              ref={textareaRef}
              value={writtenText}
              onChange={(e) => setWrittenText(e.target.value)}
              placeholder="What stayed with you?"
              className="w-full h-36 md:h-48 px-4 py-4 bg-white/60 border-2 border-blush-light rounded-2xl focus:outline-none focus:border-ink transition-all duration-500 resize-none font-body text-text-soft text-base mb-4"
              style={{ lineHeight: '1.75' }}
            />

            {!showPrompt ? (
              <button
                onClick={() => { setCurrentPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]); setShowPrompt(true); }}
                className="text-sm text-ink-light hover:text-ink transition-colors mb-5 flex items-center gap-2"
              >
                <Feather className="w-4 h-4" />
                Need a gentle prompt?
              </button>
            ) : (
              <motion.p
                className="text-base font-hand text-ink mb-5 p-4 bg-blush-light/30 rounded-2xl"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {currentPrompt}
              </motion.p>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button onClick={() => setStep('preview')} className="btn-outline-soft min-h-[52px]">Back</button>
              <button onClick={() => setStep('feeling')} className="btn-soft min-h-[52px]">Continue</button>
            </div>
          </motion.div>
        )}

        {step === 'feeling' && (
          <motion.div key="feeling" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="text-center text-base md:text-xl font-hand text-text-soft mb-5">
              How does today feel?
            </p>
            {/* 2 cols on mobile, 5 cols on sm+ */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {FEELINGS.map((feeling, index) => (
                <motion.button
                  key={feeling.id}
                  onClick={() => setSelectedFeeling(feeling.id)}
                  className={`
                    rounded-2xl flex flex-col items-center justify-center py-4 px-2
                    transition-all duration-400 border-2
                    ${selectedFeeling === feeling.id
                      ? 'border-ink bg-blush-light/50 shadow-gentle scale-105'
                      : 'border-transparent bg-white/40'}
                  `}
                  style={{ minHeight: '80px' }}
                  initial={{ opacity: 0, scale: 0.85, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.35 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-3xl mb-1">{feeling.emoji}</span>
                  <span className="text-xs font-medium text-text-soft leading-tight">{feeling.label}</span>
                </motion.button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button onClick={() => setStep('writing')} className="btn-outline-soft min-h-[52px]">Back</button>
              <button
                onClick={handleSaveCapture}
                disabled={!selectedFeeling}
                className={`btn-soft min-h-[52px] ${!selectedFeeling ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                Keep this
              </button>
            </div>
          </motion.div>
        )}

        {step === 'saving' && (
          <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
            <motion.div
              className="w-14 h-14 mx-auto mb-5 border-4 border-blush border-t-ink rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-lg font-hand text-text-whisper">Saving gently...</p>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
};

export default CaptureComponent;