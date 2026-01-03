import { getAllCaptures, getVideoBlob, saveMoment } from './db';
import { trimVideo, addTextOverlay, stitchVideos, applyKenBurns, convertVideo } from './videoProcessor';

const FEELING_EMOJIS = {
  peaceful: '🕊️',
  grateful: '🙏',
  gentle: '🌸',
  quiet: '🌙',
  warm: '☕',
  hopeful: '🌿',
  tender: '💭',
  calm: '🌊',
};

const CLIP_DURATION = 5; // seconds per clip
const MAX_CLIPS = 5;

export const generateMoment = async (options = {}) => {
  const {
    theme = 'older',
    clipDuration = CLIP_DURATION,
    maxClips = 3, // Reduced for performance
  } = options;
  
  try {
    const captures = await getAllCaptures();
    const capturesWithVideo = [];
    
    for (const capture of captures) {
      const blob = await getVideoBlob(capture.id);
      if (blob) {
        capturesWithVideo.push({ ...capture, videoBlob: blob });
      }
    }
    
    if (capturesWithVideo.length === 0) {
      throw new Error("Nothing here yet. That's okay.");
    }
    
    let selected = selectByTheme(capturesWithVideo, theme, Math.min(maxClips, capturesWithVideo.length));
    
    if (selected.length === 0) {
      throw new Error('Not enough moments captured yet.');
    }
    
    // Use first video with text overlay
    const capture = selected[0];
    
    let clip = await trimVideo(capture.videoBlob, 0, clipDuration);
    
    const dateText = new Date(capture.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    
    const feelingEmoji = FEELING_EMOJIS[capture.feeling] || '💭';
    const overlayText = `${dateText}  ${feelingEmoji}`;
    
    clip = await addTextOverlay(clip, overlayText, 'bottom');
    
    const momentData = {
      blob: clip,
      theme,
      clipCount: 1,
      createdAt: Date.now(),
      captures: [capture.id],
    };
    
    const momentId = await saveMoment(momentData);
    
    return {
      id: momentId,
      blob: clip,
      url: URL.createObjectURL(clip),
      ...momentData,
    };
    
  } catch (error) {
    console.error('Moment generation failed:', error);
    throw error;
  }
};

const selectByTheme = (captures, theme, maxClips) => {
  let selected = [];
  
  switch (theme) {
    case 'older':
      // Select oldest memories
      selected = captures
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(0, maxClips);
      break;
      
    case 'peaceful':
      // Select gentle feelings
      selected = captures
        .filter(c => ['peaceful', 'gentle', 'calm', 'quiet'].includes(c.feeling))
        .sort(() => Math.random() - 0.5)
        .slice(0, maxClips);
      break;
      
    case 'recent':
      // Most recent
      selected = captures
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, maxClips);
      break;
      
    default:
      // Random selection
      selected = captures
        .sort(() => Math.random() - 0.5)
        .slice(0, maxClips);
      break;
  }
  
  return selected;
};

// Download moment as MP4
export const downloadMoment = (blob, filename = 'moment') => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dearly-${filename}-${Date.now()}.mp4`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};