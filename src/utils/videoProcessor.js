// Simplified video processor using Canvas API (no FFmpeg needed)

export const trimVideo = async (blob, startTime = 0, duration = 5) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(blob);
    video.muted = true;
    
    video.onloadedmetadata = () => {
      const actualDuration = Math.min(duration, video.duration - startTime);
      video.currentTime = startTime;
    };
    
    video.onseeked = async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        
        const stream = canvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm',
        });
        
        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const outputBlob = new Blob(chunks, { type: 'video/webm' });
          URL.revokeObjectURL(video.src);
          resolve(outputBlob);
        };
        
        mediaRecorder.start();
        video.play();
        
        const startRecTime = Date.now();
        const drawFrame = () => {
          if (Date.now() - startRecTime >= duration * 1000 || video.ended) {
            video.pause();
            mediaRecorder.stop();
            return;
          }
          ctx.drawImage(video, 0, 0);
          requestAnimationFrame(drawFrame);
        };
        
        drawFrame();
        
      } catch (error) {
        reject(error);
      }
    };
    
    video.onerror = () => reject(new Error('Video loading failed'));
  });
};

export const addTextOverlay = async (blob, text, position = 'bottom') => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(blob);
    video.muted = true;
    
    video.onloadedmetadata = () => {
      video.currentTime = 0;
    };
    
    video.onseeked = async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        
        const stream = canvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm',
        });
        
        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const outputBlob = new Blob(chunks, { type: 'video/webm' });
          URL.revokeObjectURL(video.src);
          resolve(outputBlob);
        };
        
        mediaRecorder.start();
        video.play();
        
        const drawFrame = () => {
          if (video.ended) {
            mediaRecorder.stop();
            return;
          }
          
          ctx.drawImage(video, 0, 0);
          
          // Add overlay gradient
          const gradient = ctx.createLinearGradient(0, canvas.height - 100, 0, canvas.height);
          gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
          
          // Draw text
          ctx.font = '32px Caveat, cursive';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.fillText(text, canvas.width / 2, canvas.height - 40);
          
          requestAnimationFrame(drawFrame);
        };
        
        drawFrame();
        
      } catch (error) {
        reject(error);
      }
    };
    
    video.onerror = () => reject(new Error('Video processing failed'));
  });
};

export const stitchVideos = async (blobs) => {
  // For now, just return the first video with overlays
  // Full stitching would require FFmpeg or server-side processing
  if (blobs.length === 0) return null;
  return blobs[0];
};

export const applyKenBurns = async (blob) => {
  // Simplified: just return the blob for now
  return blob;
};

export const convertVideo = async (blob) => {
  // Return as-is since we're already in webm
  return blob;
};

export const loadFFmpeg = async () => {
  // Mock function - we're using Canvas API instead
  return Promise.resolve();
};