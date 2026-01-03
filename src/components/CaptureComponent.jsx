import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Square, Feather } from 'lucide-react';
import { saveCapture, saveVideoBlob } from '../utils/db';

const FEELINGS = [
  { id: 'peaceful', emoji: '🕊️', label: 'Peaceful' },
  { id: 'grateful', emoji: '🙏', label: 'Grateful' },
  { id: 'gentle', emoji: '🌸', label: 'Gentle' },
  { id: 'quiet', emoji: '🌙', label: 'Quiet' },
  { id: 'warm', emoji: '☕', label: 'Warm' },
  { id: 'hopeful', emoji: '🌿', label: 'Hopeful' },
  { id: 'tender', emoji: '💭', label: 'Tender' },
  { id: 'calm', emoji: '🌊', label: 'Calm' },
  { id: 'thoughtful', emoji: '🍂', label: 'Thoughtful' },
  { id: 'nostalgic', emoji: '📜', label: 'Nostalgic' },
];

const PROMPTS = [
  "What stayed with you today?",
  "Was there a moment that felt small but mattered?",
  "What would you tell today, if it could listen?",
  "What softened in you recently?",
  "What did you notice that you usually miss?",
];

const CaptureComponent = ({ onCaptureComplete }) => {
  const [step, setStep] = useState('idle'); // idle, recording, preview, writing, feeling, saving
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [writtenText, setWrittenText] = useState('Dearly,\n\n');
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stream]);

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        setStep('preview');
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = URL.createObjectURL(blob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStep('recording');
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Camera access error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleContinueToWriting = () => {
    setStep('writing');
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 300);
  };

  const handleShowPrompt = () => {
    const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setCurrentPrompt(prompt);
    setShowPrompt(true);
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
      if (recordedBlob) {
        await saveVideoBlob(captureId, recordedBlob);
      }

      // Reset
      setRecordedBlob(null);
      setWrittenText('Dearly,\n\n');
      setSelectedFeeling(null);
      setRecordingTime(0);
      setStep('idle');
      setShowPrompt(false);
      
      if (onCaptureComplete) {
        onCaptureComplete(captureId);
      }

    } catch (err) {
      console.error('Save error:', err);
      setStep('feeling');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      id="capture"
      className="card-gentle max-w-4xl mx-auto paper-grain relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Floating doodles around capture */}
      <motion.div
        className="absolute -top-8 -right-8 w-12 h-12 text-blush opacity-40"
        animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute -bottom-6 -left-6 w-10 h-10 text-sage opacity-30"
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </motion.div>
      
      <div className="flex items-center gap-3 mb-8">
        <Video className="w-7 h-7 text-ink" />
        <h3 className="text-3xl font-bubble text-ink">Capture softly</h3>
      </div>

      {/* Video preview */}
      <div className="relative aspect-video bg-gradient-to-br from-blush-light/30 to-sage-light/30 rounded-soft overflow-hidden mb-8 border-3 border-blush-light">
        <video
          ref={videoRef}
          autoPlay
          muted={step === 'recording'}
          playsInline
          className="w-full h-full object-cover"
        />
        
        {step === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper/80 backdrop-blur-sm">
            <p className="text-xl text-text-whisper font-hand">
              When you're ready
            </p>
          </div>
        )}

        {isRecording && (
          <motion.div
            className="absolute top-6 right-6 flex items-center gap-3 bg-ink text-paper px-5 py-3 rounded-full"
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-3 h-3 bg-paper rounded-full" />
            <span className="font-mono font-medium">{formatTime(recordingTime)}</span>
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.button
              onClick={startRecording}
              className="btn-soft"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Begin
            </motion.button>
          </motion.div>
        )}

        {step === 'recording' && (
          <motion.div
            key="recording"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.button
              onClick={stopRecording}
              className="px-8 py-4 bg-blush-dark text-white rounded-full font-medium shadow-gentle hover:bg-blush transition-all duration-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Square className="w-5 h-5 inline mr-2" />
              Pause
            </motion.button>
          </motion.div>
        )}

        {step === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center gap-4"
          >
            <button onClick={() => {
              setRecordedBlob(null);
              setRecordingTime(0);
              setStep('idle');
            }} className="btn-outline-soft">
              Start over
            </button>
            <button onClick={handleContinueToWriting} className="btn-soft">
              Continue
            </button>
          </motion.div>
        )}

        {step === 'writing' && (
          <motion.div
            key="writing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-6">
              <textarea
                ref={textareaRef}
                value={writtenText}
                onChange={(e) => setWrittenText(e.target.value)}
                placeholder="What stayed with you?"
                className="w-full h-48 px-6 py-5 bg-white/60 border-2 border-blush-light rounded-soft focus:outline-none focus:border-ink transition-all duration-500 resize-none font-body text-text-soft"
                style={{ lineHeight: '1.8' }}
              />
            </div>

            {!showPrompt && (
              <button
                onClick={handleShowPrompt}
                className="text-sm text-ink-light hover:text-ink transition-colors mb-6 flex items-center gap-2"
              >
                <Feather className="w-4 h-4" />
                Need a gentle prompt?
              </button>
            )}

            {showPrompt && (
              <motion.p
                className="text-lg font-hand text-ink mb-6 p-4 bg-blush-light/30 rounded-soft"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {currentPrompt}
              </motion.p>
            )}

            <div className="flex justify-center gap-4">
              <button onClick={() => setStep('preview')} className="btn-outline-soft">
                Back
              </button>
              <button onClick={() => setStep('feeling')} className="btn-soft">
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {step === 'feeling' && (
          <motion.div
            key="feeling"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-center text-xl font-hand text-text-soft mb-6">
              How does today feel?
            </p>
            
            <div className="grid grid-cols-5 gap-4 mb-8">
              {FEELINGS.map((feeling, index) => (
                <motion.button
                  key={feeling.id}
                  onClick={() => setSelectedFeeling(feeling.id)}
                  className={`
                    aspect-square rounded-soft flex flex-col items-center justify-center
                    transition-all duration-500 border-3
                    ${selectedFeeling === feeling.id
                      ? 'border-ink bg-blush-light/50 shadow-gentle scale-105'
                      : 'border-transparent bg-white/40 hover:border-blush-light'}
                  `}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  whileHover={{ scale: 1.08, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-4xl mb-2">{feeling.emoji}</span>
                  <span className="text-xs font-medium text-text-soft">
                    {feeling.label}
                  </span>
                </motion.button>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={() => setStep('writing')} className="btn-outline-soft">
                Back
              </button>
              <button
                onClick={handleSaveCapture}
                disabled={!selectedFeeling}
                className={`btn-soft ${!selectedFeeling ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                Keep this
              </button>
            </div>
          </motion.div>
        )}

        {step === 'saving' && (
          <motion.div
            key="saving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-6 border-4 border-blush border-t-ink rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-xl font-hand text-text-whisper">
              Saving gently...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CaptureComponent;