/**
 * videoProcessor.js
 *
 * Canvas-based video processing. No FFmpeg dependency.
 * Handles: trim, text overlay, sequential multi-clip stitching with audio, Ken Burns zoom.
 */

// ─── Safe MIME type selection ─────────────────────────────────────────────────

export const getSupportedMimeType = () => {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const createVideoElement = (src) => {
  const video = document.createElement('video');
  video.src = src;
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = 'anonymous';
  return video;
};

// ─── Trim ─────────────────────────────────────────────────────────────────────

export const trimVideo = (blob, startTime = 0, duration = 5) => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const video = createVideoElement(url);

    video.onloadedmetadata = () => {
      const safeDuration = Math.min(duration, Math.max(0, video.duration - startTime));
      video.currentTime = startTime;

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');

        const mimeType = getSupportedMimeType();
        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
        const chunks = [];

        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => {
          URL.revokeObjectURL(url);
          resolve(new Blob(chunks, { type: mimeType || 'video/webm' }));
        };
        recorder.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };

        recorder.start(100);
        video.play();

        const started = Date.now();
        const draw = () => {
          const elapsed = (Date.now() - started) / 1000;
          if (elapsed >= safeDuration || video.ended) {
            video.pause();
            recorder.stop();
            return;
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(draw);
        };
        draw();
      };
    };

    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Video load failed')); };
  });
};

// ─── Text Overlay ─────────────────────────────────────────────────────────────

export const addTextOverlay = (blob, text, position = 'bottom') => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const video = createVideoElement(url);

    video.onloadedmetadata = () => {
      video.currentTime = 0;

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');

        const mimeType = getSupportedMimeType();
        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
        const chunks = [];

        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => {
          URL.revokeObjectURL(url);
          resolve(new Blob(chunks, { type: mimeType || 'video/webm' }));
        };
        recorder.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };

        recorder.start(100);
        video.play();

        const drawFrame = () => {
          if (video.ended || video.paused) { recorder.stop(); return; }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          _drawTextOverlay(ctx, canvas.width, canvas.height, text, position, 1);
          requestAnimationFrame(drawFrame);
        };
        drawFrame();
      };
    };

    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Overlay video load failed')); };
  });
};

// ─── Multi-clip Stitcher ──────────────────────────────────────────────────────

/**
 * Stitches clips into one video, optionally with music.
 *
 * clips: Array of { blob, overlayText?, startTime?, duration? }
 *
 * options:
 *   targetWidth, targetHeight — output resolution
 *   fps                       — frames per second (default 30)
 *   fadeDuration              — crossfade seconds (0 = cut)
 *   audioBuffer               — AudioBuffer to mix in (from audioEngine.js)
 *                               Pass null for no music.
 */
export const stitchVideos = (clips, options = {}) => {
  if (!clips || clips.length === 0) return Promise.reject(new Error('No clips to stitch'));

  if (clips.length === 1 && !options.audioBuffer) {
    const { blob, overlayText } = clips[0];
    if (overlayText) return addTextOverlay(blob, overlayText, 'bottom');
    return Promise.resolve(blob);
  }

  const {
    targetWidth  = 720,
    targetHeight = 1280,
    fps          = 30,
    fadeDuration = 0.4,
    audioBuffer  = null,   // AudioBuffer | null
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width  = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    // ── Build combined stream (video + optional audio) ──────────────────────
    const canvasStream = canvas.captureStream(fps);
    let stopAudio = null;

    let recordStream = canvasStream;

    if (audioBuffer) {
      try {
        // Import createAudioStreamFromBuffer inline to avoid circular dep issues
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const streamDest = audioCtx.createMediaStreamDestination();

        const masterGain = audioCtx.createGain();
        masterGain.gain.value = 0;
        masterGain.connect(streamDest);
        masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.75, audioCtx.currentTime + 1.0);

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true;
        source.connect(masterGain);
        source.start(audioCtx.currentTime);

        stopAudio = (fadeOut = 1.5) => {
          const now = audioCtx.currentTime;
          masterGain.gain.setValueAtTime(masterGain.gain.value, now);
          masterGain.gain.linearRampToValueAtTime(0, now + fadeOut);
          setTimeout(() => {
            try { source.stop(); audioCtx.close(); } catch (_) {}
          }, fadeOut * 1000 + 200);
        };

        // Combine canvas video tracks + audio track into one stream
        const audioTrack = streamDest.stream.getAudioTracks()[0];
        const videoTrack = canvasStream.getVideoTracks()[0];
        if (audioTrack && videoTrack) {
          recordStream = new MediaStream([videoTrack, audioTrack]);
        }
      } catch (e) {
        console.warn('Audio mixing failed, proceeding without audio:', e);
      }
    }

    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(recordStream, mimeType ? { mimeType } : {});
    const chunks = [];

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      if (stopAudio) stopAudio(0.1);
      resolve(new Blob(chunks, { type: mimeType || 'video/webm' }));
    };
    recorder.onerror = reject;

    recorder.start(100);

    // ── Sequential clip processing ──────────────────────────────────────────
    let clipIndex = 0;
    const urls = [];

    const processNextClip = () => {
      if (clipIndex >= clips.length) {
        // Fade out audio before stopping recorder
        if (stopAudio) stopAudio(0.8);
        setTimeout(() => recorder.stop(), 900);
        urls.forEach((u) => URL.revokeObjectURL(u));
        return;
      }

      const clipDef = clips[clipIndex];
      const { blob, overlayText, startTime = 0, duration } = clipDef;
      const url = URL.createObjectURL(blob);
      urls.push(url);

      const video = createVideoElement(url);

      video.onloadedmetadata = () => {
        const clipDur = duration
          ? Math.min(duration, video.duration - startTime)
          : video.duration - startTime;

        video.currentTime = startTime;

        video.onseeked = () => {
          video.play().catch(reject);
          const clipStart = Date.now();

          const draw = () => {
            const elapsed = (Date.now() - clipStart) / 1000;

            if (elapsed >= clipDur || video.ended) {
              video.pause();
              clipIndex++;
              processNextClip();
              return;
            }

            let alpha = 1;
            if (fadeDuration > 0 && clipIndex > 0 && elapsed < fadeDuration) {
              alpha = elapsed / fadeDuration;
            }
            if (fadeDuration > 0 && elapsed > clipDur - fadeDuration) {
              alpha = Math.min(alpha, (clipDur - elapsed) / fadeDuration);
            }
            alpha = Math.max(0, Math.min(1, alpha));

            ctx.globalAlpha = alpha;
            _drawCoveredFrame(ctx, video, targetWidth, targetHeight);
            ctx.globalAlpha = 1;

            if (overlayText) {
              _drawTextOverlayOnCtx(ctx, targetWidth, targetHeight, overlayText, alpha);
            }

            requestAnimationFrame(draw);
          };
          draw();
        };
      };

      video.onerror = () => reject(new Error(`Clip ${clipIndex} failed to load`));
    };

    processNextClip();
  });
};

// ─── Ken Burns ────────────────────────────────────────────────────────────────

export const applyKenBurns = (blob, zoomFactor = 1.08) => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const video = createVideoElement(url);

    video.onloadedmetadata = () => {
      video.currentTime = 0;

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width  = video.videoWidth  || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        const mimeType = getSupportedMimeType();
        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
        const chunks = [];

        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => {
          URL.revokeObjectURL(url);
          resolve(new Blob(chunks, { type: mimeType || 'video/webm' }));
        };
        recorder.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };

        recorder.start(100);
        video.play();

        const totalDur = video.duration;
        const started = Date.now();

        const draw = () => {
          if (video.ended || video.paused) { recorder.stop(); return; }
          const progress = Math.min((Date.now() - started) / 1000 / totalDur, 1);
          const scale = 1 + (zoomFactor - 1) * progress;
          const sw = w * scale;
          const sh = h * scale;
          ctx.drawImage(video, (w - sw) / 2, (h - sh) / 2, sw, sh);
          requestAnimationFrame(draw);
        };
        draw();
      };
    };

    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Ken Burns load failed')); };
  });
};

// ─── Internal draw helpers ────────────────────────────────────────────────────

function _drawCoveredFrame(ctx, video, tw, th) {
  const vw = video.videoWidth || tw;
  const vh = video.videoHeight || th;
  const scale = Math.max(tw / vw, th / vh);
  ctx.drawImage(video, (tw - vw * scale) / 2, (th - vh * scale) / 2, vw * scale, vh * scale);
}

function _drawTextOverlay(ctx, w, h, text, position, alpha) {
  const isBottom = position !== 'top';
  const grad = ctx.createLinearGradient(0, isBottom ? h - 100 : 0, 0, isBottom ? h : 100);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, `rgba(0,0,0,${0.55 * alpha})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, isBottom ? h - 100 : 0, w, 100);
  ctx.font = `bold ${Math.floor(h * 0.038)}px "Caveat", cursive, sans-serif`;
  ctx.fillStyle = `rgba(255,255,255,${0.92 * alpha})`;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 6;
  ctx.fillText(text, w / 2, isBottom ? h - 40 : 60);
  ctx.shadowBlur = 0;
}

function _drawTextOverlayOnCtx(ctx, w, h, text, alpha) {
  _drawTextOverlay(ctx, w, h, text, 'bottom', alpha);
}

export const convertVideo = (blob) => Promise.resolve(blob);
export const loadFFmpeg   = () => Promise.resolve();