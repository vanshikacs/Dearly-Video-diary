/**
 * ProfilePanel.jsx — deeply personal profile with working audio previews.
 *
 * Built-in tracks: previewed via Web Audio API (audioEngine.js)
 * Uploaded music:  previewed via a hidden <audio> element
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfile, saveProfile, saveProfileMusic, getProfileMusic, DEFAULT_PROFILE } from '../utils/db';
import { previewBuiltInTrack, stopPreview } from '../utils/audioEngine';

// ─── Data ─────────────────────────────────────────────────────────────────────

const AVATAR_OPTIONS = ['🌸', '🕊️', '🌿', '🌙', '☕', '🌊', '🍂', '💭', '🌻', '🦋', '✨', '🌷'];

const MOOD_CHIPS = [
  { id: 'peaceful',   emoji: '🕊️', label: 'Peaceful' },
  { id: 'nostalgic',  emoji: '📜', label: 'Nostalgic' },
  { id: 'warm',       emoji: '☕', label: 'Warm' },
  { id: 'thoughtful', emoji: '🍂', label: 'Thoughtful' },
  { id: 'quiet',      emoji: '🌙', label: 'Quiet' },
  { id: 'hopeful',    emoji: '🌿', label: 'Hopeful' },
  { id: 'tender',     emoji: '💭', label: 'Tender' },
  { id: 'grateful',   emoji: '🙏', label: 'Grateful' },
  { id: 'gentle',     emoji: '🌸', label: 'Gentle' },
  { id: 'calm',       emoji: '🌊', label: 'Calm' },
];

const THEMES = [
  {
    id: 'blush', label: 'Blush', description: 'Soft pinks, warm paper, gentle light',
    bg: 'linear-gradient(135deg, #FFE4EC 0%, #FFF0F5 40%, #FFE8D6 100%)',
    accent: '#C84B5C', swatch: ['#FFE4EC', '#F4C7C3', '#C84B5C'],
  },
  {
    id: 'dusk', label: 'Dusk', description: 'Lavender hours, fading light',
    bg: 'linear-gradient(135deg, #E8E0F5 0%, #F2EEF8 40%, #D4C8E8 100%)',
    accent: '#7B5EA7', swatch: ['#E8E0F5', '#B8A8D8', '#7B5EA7'],
  },
  {
    id: 'forest', label: 'Forest', description: 'Sage, moss, quiet mornings',
    bg: 'linear-gradient(135deg, #E0EDE4 0%, #F0F5F0 40%, #D4E8D8 100%)',
    accent: '#4A7C59', swatch: ['#E0EDE4', '#A8C8B0', '#4A7C59'],
  },
  {
    id: 'parchment', label: 'Parchment', description: 'Old letters, warm amber, ink',
    bg: 'linear-gradient(135deg, #F5ECD7 0%, #FBF5E8 40%, #EDE0C8 100%)',
    accent: '#8B6914', swatch: ['#F5ECD7', '#D4B896', '#8B6914'],
  },
  {
    id: 'midnight', label: 'Midnight', description: 'Deep hours, stars, introspection',
    bg: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 40%, #0F3460 100%)',
    accent: '#A8B8D8', swatch: ['#2A2A4E', '#6878A8', '#A8B8D8'], dark: true,
  },
];

const MUSIC_VIBES = [
  { id: 'ambient',   label: 'Ambient',   description: 'Soft drones, texture, air', emoji: '🌫️' },
  { id: 'classical', label: 'Classical', description: 'Piano, strings, chamber',   emoji: '🎹' },
  { id: 'lofi',      label: 'Lo-fi',     description: 'Warm, crackly, golden',     emoji: '🎷' },
  { id: 'cinematic', label: 'Cinematic', description: 'Sweeping, emotional',       emoji: '🎬' },
  { id: 'folk',      label: 'Folk',      description: 'Acoustic, earthy, close',   emoji: '🪕' },
  { id: 'none',      label: 'Silence',   description: 'Just the visuals',          emoji: '🤍' },
];

const ENERGY_LEVELS = [
  { id: 'still',   label: 'Still'   },
  { id: 'gentle',  label: 'Gentle'  },
  { id: 'flowing', label: 'Flowing' },
  { id: 'warm',    label: 'Warm'    },
];

export const BUILT_IN_TRACKS = [
  { id: 'morning_haze',  label: 'Morning Haze',   vibe: 'ambient',   energy: 'still',   emoji: '🌅' },
  { id: 'paper_piano',   label: 'Paper Piano',    vibe: 'classical', energy: 'gentle',  emoji: '🎹' },
  { id: 'golden_hour',   label: 'Golden Hour',    vibe: 'lofi',      energy: 'gentle',  emoji: '🌇' },
  { id: 'open_field',    label: 'Open Field',     vibe: 'ambient',   energy: 'gentle',  emoji: '🌾' },
  { id: 'quiet_strings', label: 'Quiet Strings',  vibe: 'classical', energy: 'still',   emoji: '🎻' },
  { id: 'rain_window',   label: 'Rain on Window', vibe: 'ambient',   energy: 'still',   emoji: '🌧️' },
  { id: 'worn_cassette', label: 'Worn Cassette',  vibe: 'lofi',      energy: 'warm',    emoji: '📼' },
  { id: 'dusk_guitar',   label: 'Dusk Guitar',    vibe: 'folk',      energy: 'flowing', emoji: '🎸' },
];

const TRANSITIONS = [
  { id: 'fade',    label: 'Fade',    description: 'Soft in and out'       },
  { id: 'cut',     label: 'Cut',     description: 'Clean and direct'      },
  { id: 'dissolve',label: 'Dissolve',description: 'Melts between moments' },
  { id: 'dreamy',  label: 'Dreamy',  description: 'Soft blur between scenes'},
];

const OVERLAY_STYLES = [
  { id: 'none',    label: 'None',    description: 'Purely visual'         },
  { id: 'minimal', label: 'Minimal', description: 'Date only, quiet'      },
  { id: 'soft',    label: 'Soft',    description: 'Date + feeling, gently'},
  { id: 'poetic',  label: 'Poetic',  description: 'Full written moment'   },
];

const TEXT_STYLES = [
  { id: 'handwritten', label: 'Handwritten', font: 'Caveat, cursive' },
  { id: 'serif',       label: 'Serif',       font: 'Georgia, serif'  },
  { id: 'tiny',        label: 'Tiny',        font: 'monospace'       },
];

const ASPECT_RATIOS = [
  { id: '9:16', label: '9 : 16', icon: '▯', description: 'Story / Reel' },
  { id: '16:9', label: '16 : 9', icon: '▭', description: 'Widescreen'   },
  { id: '1:1',  label: '1 : 1',  icon: '□', description: 'Square'       },
];

const CLIP_LENGTHS = [3, 5, 7, 10];
const getTheme = (id) => THEMES.find((t) => t.id === id) || THEMES[0];

// ─── Main component ───────────────────────────────────────────────────────────

const ProfilePanel = () => {
  const [profile, setProfile]             = useState(null);
  const [saved, setSaved]                 = useState(false);
  const [saving, setSaving]               = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [uploadedMusicBlob, setUploadedMusicBlob] = useState(null);
  const [playingTrackId, setPlayingTrackId]       = useState(null);

  const musicInputRef   = useRef(null);
  const uploadedAudioRef = useRef(null); // <audio> for user-uploaded file
  const stopPreviewRef  = useRef(null);  // cleanup fn for built-in previews

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopPreview();
      if (uploadedAudioRef.current) uploadedAudioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    getProfile().then(setProfile);
    getProfileMusic().then((b) => { if (b) setUploadedMusicBlob(b); });
  }, []);

  const set = useCallback((field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }, []);

  const toggleMood = (id) => {
    const current = profile.moodIdentity || [];
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    set('moodIdentity', next.length === 0 ? [id] : next);
  };

  // ── Audio preview logic ─────────────────────────────────────────────────
  const handlePlayTrack = (trackId) => {
    // Stop anything currently playing
    stopPreview();
    if (uploadedAudioRef.current) {
      uploadedAudioRef.current.pause();
      uploadedAudioRef.current.currentTime = 0;
    }

    if (playingTrackId === trackId) {
      // Same track tapped again → stop
      setPlayingTrackId(null);
      return;
    }

    if (trackId === 'uploaded') {
      if (uploadedAudioRef.current) {
        uploadedAudioRef.current.currentTime = 0;
        uploadedAudioRef.current.play().catch(() => {});
        setPlayingTrackId('uploaded');
        uploadedAudioRef.current.onended = () => setPlayingTrackId(null);
      }
      return;
    }

    // Built-in track — use Web Audio procedural generator
    try {
      previewBuiltInTrack(trackId);
      setPlayingTrackId(trackId);
      // Auto-stop after 12 seconds (a gentle preview)
      const timer = setTimeout(() => {
        stopPreview();
        setPlayingTrackId(null);
      }, 12000);
      stopPreviewRef.current = () => {
        clearTimeout(timer);
        stopPreview();
        setPlayingTrackId(null);
      };
    } catch (e) {
      console.warn('Preview failed:', e);
    }
  };

  const handleStopPreview = () => {
    stopPreviewRef.current?.();
    stopPreview();
    if (uploadedAudioRef.current) uploadedAudioRef.current.pause();
    setPlayingTrackId(null);
  };

  const handleMusicUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedMusicBlob(file);
    set('uploadedMusicName', file.name);
    set('defaultMusicTrackId', 'uploaded');

    // Wire up the audio element
    if (uploadedAudioRef.current) {
      uploadedAudioRef.current.src = URL.createObjectURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    handleStopPreview();
    try {
      const updated = await saveProfile(profile);
      if (uploadedMusicBlob) await saveProfileMusic(uploadedMusicBlob);
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2800);
    } catch (e) {
      console.error('Profile save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="w-12 h-12 border-4 border-blush border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  const themeStyle = getTheme(profile.theme);

  return (
    <div className="min-h-screen relative">
      {/* Hidden audio element for uploaded music preview */}
      <audio ref={uploadedAudioRef} preload="none" />

      {/* Page background */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-all duration-1000"
        style={{ background: themeStyle.bg, opacity: 0.35 }}
      />
      <AmbientParticles theme={themeStyle} />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16 pb-40">

        {/* Header */}
        <ProfileHeader
          profile={profile}
          themeStyle={themeStyle}
          onSet={set}
          avatarOptions={AVATAR_OPTIONS}
        />

        <SectionDivider />

        {/* Theme */}
        <SectionBlock
          title="The look of your world"
          subtitle="Choose the light your memories live in"
          active={activeSection === 'theme'}
          onToggle={() => setActiveSection((s) => s === 'theme' ? null : 'theme')}
        >
          <div className="grid grid-cols-1 gap-4">
            {THEMES.map((t) => (
              <ThemeCard key={t.id} theme={t} selected={profile.theme === t.id} onSelect={() => set('theme', t.id)} />
            ))}
          </div>
        </SectionBlock>

        <SectionDivider />

        {/* Mood */}
        <SectionBlock
          title="How you tend to feel"
          subtitle="These shape which memories find their way into your reels"
          active={activeSection === 'mood'}
          onToggle={() => setActiveSection((s) => s === 'mood' ? null : 'mood')}
        >
          <div className="flex flex-wrap gap-3">
            {MOOD_CHIPS.map((chip) => (
              <MoodChip
                key={chip.id}
                chip={chip}
                selected={(profile.moodIdentity || []).includes(chip.id)}
                accent={themeStyle.accent}
                onToggle={() => toggleMood(chip.id)}
              />
            ))}
          </div>
          {(profile.moodIdentity || []).length > 0 && (
            <p className="text-sm font-hand mt-5 opacity-60" style={{ color: themeStyle.accent }}>
              Reels will lean toward {(profile.moodIdentity || []).join(', ')} moments.
            </p>
          )}
        </SectionBlock>

        <SectionDivider />

        {/* Sound */}
        <SectionBlock
          title="The sound of your memories"
          subtitle="Music that plays beneath your reels — tap ▶ to hear a preview"
          active={activeSection === 'sound'}
          onToggle={() => setActiveSection((s) => s === 'sound' ? null : 'sound')}
        >
          {/* Vibe */}
          <Label accent={themeStyle.accent}>Music vibe</Label>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {MUSIC_VIBES.map((v) => (
              <MusicVibeCard
                key={v.id} vibe={v}
                selected={profile.musicVibe === v.id}
                accent={themeStyle.accent}
                onSelect={() => set('musicVibe', v.id)}
              />
            ))}
          </div>

          {/* Energy */}
          <Label accent={themeStyle.accent}>Energy level</Label>
          <div className="flex gap-2 mb-8">
            {ENERGY_LEVELS.map((e) => (
              <motion.button
                key={e.id}
                onClick={() => set('musicEnergy', e.id)}
                className="flex-1 py-3 rounded-full text-sm font-medium transition-all duration-500 border-2"
                style={{
                  borderColor: profile.musicEnergy === e.id ? themeStyle.accent : 'rgba(0,0,0,0.08)',
                  background:  profile.musicEnergy === e.id ? themeStyle.accent : 'rgba(255,255,255,0.5)',
                  color:       profile.musicEnergy === e.id ? 'white' : 'inherit',
                }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              >
                {e.label}
              </motion.button>
            ))}
          </div>

          {/* Instrumental only */}
          <div className="flex items-center justify-between mb-8 px-1">
            <div>
              <p className="font-medium text-base">Instrumental only</p>
              <p className="text-sm opacity-60">No lyrics — just sound</p>
            </div>
            <Toggle checked={profile.instrumentalOnly} accent={themeStyle.accent} onChange={(v) => set('instrumentalOnly', v)} />
          </div>

          {/* Built-in tracks */}
          <Label accent={themeStyle.accent}>Built-in tracks — tap ▶ to preview</Label>
          <div className="space-y-2 mb-8">
            {BUILT_IN_TRACKS
              .filter((t) => profile.musicVibe === 'none' || t.vibe === profile.musicVibe || t.energy === profile.musicEnergy)
              .slice(0, 5)
              .map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  selected={profile.defaultMusicTrackId === track.id}
                  playing={playingTrackId === track.id}
                  accent={themeStyle.accent}
                  onSelect={() => set('defaultMusicTrackId', track.id)}
                  onPreview={() => handlePlayTrack(track.id)}
                />
              ))}
          </div>

          {/* Upload personal music */}
          <Label accent={themeStyle.accent}>Your own music</Label>
          <div
            className="rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-500 hover:opacity-80 mb-3"
            style={{ borderColor: `${themeStyle.accent}40` }}
            onClick={() => musicInputRef.current?.click()}
          >
            {profile.uploadedMusicName ? (
              <div>
                <p className="text-2xl mb-1">🎵</p>
                <p className="font-medium">{profile.uploadedMusicName}</p>
                <p className="text-sm opacity-50 mt-1">Tap to replace</p>
              </div>
            ) : (
              <div>
                <p className="text-3xl mb-2">🎶</p>
                <p className="font-medium">Upload your own music</p>
                <p className="text-sm opacity-50 mt-1">MP3, WAV, AAC — your personal soundtrack</p>
              </div>
            )}
          </div>

          {/* Uploaded music preview row */}
          {profile.uploadedMusicName && (
            <TrackCard
              track={{ id: 'uploaded', label: profile.uploadedMusicName, emoji: '🎵', vibe: 'custom', energy: 'custom' }}
              selected={profile.defaultMusicTrackId === 'uploaded'}
              playing={playingTrackId === 'uploaded'}
              accent={themeStyle.accent}
              onSelect={() => set('defaultMusicTrackId', 'uploaded')}
              onPreview={() => handlePlayTrack('uploaded')}
            />
          )}

          <input ref={musicInputRef} type="file" accept="audio/*" className="hidden" onChange={handleMusicUpload} />

          {/* Global stop button when something is playing */}
          <AnimatePresence>
            {playingTrackId && (
              <motion.button
                onClick={handleStopPreview}
                className="mt-5 w-full py-3 rounded-full text-sm font-medium border-2 transition-all duration-300"
                style={{ borderColor: themeStyle.accent, color: themeStyle.accent }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                whileHover={{ scale: 1.02 }}
              >
                ■ Stop preview
              </motion.button>
            )}
          </AnimatePresence>
        </SectionBlock>

        <SectionDivider />

        {/* Reel style */}
        <SectionBlock
          title="How your reels feel"
          subtitle="The rhythm and texture of your moments"
          active={activeSection === 'reel'}
          onToggle={() => setActiveSection((s) => s === 'reel' ? null : 'reel')}
        >
          <Label accent={themeStyle.accent}>Shape</Label>
          <div className="flex gap-4 mb-8">
            {ASPECT_RATIOS.map((r) => (
              <motion.button
                key={r.id}
                onClick={() => set('aspectRatio', r.id)}
                className="flex-1 py-5 rounded-2xl border-2 text-center transition-all duration-500"
                style={{
                  borderColor: profile.aspectRatio === r.id ? themeStyle.accent : 'rgba(0,0,0,0.08)',
                  background:  profile.aspectRatio === r.id ? `${themeStyle.accent}15` : 'rgba(255,255,255,0.5)',
                }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              >
                <div style={{ fontSize: r.id === '9:16' ? '1.2rem' : r.id === '16:9' ? '2rem' : '1.6rem', lineHeight: 1 }}>{r.icon}</div>
                <p className="text-xs font-medium mt-1">{r.label}</p>
                <p className="text-xs opacity-50">{r.description}</p>
              </motion.button>
            ))}
          </div>

          <Label accent={themeStyle.accent}>Seconds per clip</Label>
          <div className="flex gap-3 mb-8">
            {CLIP_LENGTHS.map((len) => (
              <motion.button
                key={len}
                onClick={() => set('clipLength', len)}
                className="flex-1 py-3 rounded-full border-2 font-medium transition-all duration-400"
                style={{
                  borderColor: profile.clipLength === len ? themeStyle.accent : 'rgba(0,0,0,0.08)',
                  background:  profile.clipLength === len ? themeStyle.accent : 'rgba(255,255,255,0.5)',
                  color:       profile.clipLength === len ? 'white' : 'inherit',
                }}
                whileHover={{ scale: 1.05 }}
              >
                {len}s
              </motion.button>
            ))}
          </div>

          <Label accent={themeStyle.accent}>Between clips</Label>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {TRANSITIONS.map((t) => (
              <motion.button
                key={t.id}
                onClick={() => set('transition', t.id)}
                className="py-4 px-4 rounded-2xl border-2 text-left transition-all duration-400"
                style={{
                  borderColor: profile.transition === t.id ? themeStyle.accent : 'rgba(0,0,0,0.08)',
                  background:  profile.transition === t.id ? `${themeStyle.accent}12` : 'rgba(255,255,255,0.5)',
                }}
                whileHover={{ y: -2 }}
              >
                <p className="font-medium text-sm">{t.label}</p>
                <p className="text-xs opacity-50 mt-0.5">{t.description}</p>
              </motion.button>
            ))}
          </div>

          <Label accent={themeStyle.accent}>Text overlays</Label>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {OVERLAY_STYLES.map((o) => (
              <motion.button
                key={o.id}
                onClick={() => { set('overlayStyle', o.id); set('includeTextOverlays', o.id !== 'none'); }}
                className="py-4 px-4 rounded-2xl border-2 text-left transition-all duration-400"
                style={{
                  borderColor: profile.overlayStyle === o.id ? themeStyle.accent : 'rgba(0,0,0,0.08)',
                  background:  profile.overlayStyle === o.id ? `${themeStyle.accent}12` : 'rgba(255,255,255,0.5)',
                }}
                whileHover={{ y: -2 }}
              >
                <p className="font-medium text-sm">{o.label}</p>
                <p className="text-xs opacity-50 mt-0.5">{o.description}</p>
              </motion.button>
            ))}
          </div>

          {profile.overlayStyle !== 'none' && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <Label accent={themeStyle.accent}>Text style</Label>
              <div className="flex gap-3 mb-8">
                {TEXT_STYLES.map((ts) => (
                  <motion.button
                    key={ts.id}
                    onClick={() => set('textStyle', ts.id)}
                    className="flex-1 py-4 rounded-2xl border-2 text-center transition-all duration-400"
                    style={{
                      borderColor: profile.textStyle === ts.id ? themeStyle.accent : 'rgba(0,0,0,0.08)',
                      background:  profile.textStyle === ts.id ? `${themeStyle.accent}12` : 'rgba(255,255,255,0.5)',
                      fontFamily: ts.font,
                    }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <p className="text-sm">{ts.label}</p>
                    <p className="text-xs opacity-40 mt-1" style={{ fontFamily: ts.font }}>Jan 3 🕊️</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <div className="flex items-center justify-between px-1">
            <div>
              <p className="font-medium">Ken Burns zoom</p>
              <p className="text-sm opacity-60">Slow gentle zoom on each clip</p>
            </div>
            <Toggle checked={profile.kenBurns} accent={themeStyle.accent} onChange={(v) => set('kenBurns', v)} />
          </div>
        </SectionBlock>

        <SectionDivider />

        {/* Memory fields */}
        <SectionBlock
          title="Words that belong to this space"
          subtitle="Personal anchors — only you will ever read these"
          active={activeSection === 'memory'}
          onToggle={() => setActiveSection((s) => s === 'memory' ? null : 'memory')}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium tracking-widest uppercase opacity-50 mb-3" style={{ color: themeStyle.accent }}>
                A line that feels like home
              </label>
              <input
                type="text"
                value={profile.tagline}
                onChange={(e) => set('tagline', e.target.value)}
                placeholder="e.g. the quiet after rain, the warmth before sleep"
                className="w-full px-5 py-4 rounded-2xl border-2 bg-white/50 focus:outline-none transition-all duration-500 font-hand text-lg"
                style={{ borderColor: profile.tagline ? `${themeStyle.accent}60` : 'rgba(0,0,0,0.08)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium tracking-widest uppercase opacity-50 mb-3" style={{ color: themeStyle.accent }}>
                What this space should remind you of
              </label>
              <textarea
                value={profile.memoryReminder}
                onChange={(e) => set('memoryReminder', e.target.value)}
                placeholder="e.g. slow mornings, the smell of old books..."
                rows={3}
                className="w-full px-5 py-4 rounded-2xl border-2 bg-white/50 focus:outline-none transition-all duration-500 font-hand text-base resize-none leading-relaxed"
                style={{ borderColor: profile.memoryReminder ? `${themeStyle.accent}60` : 'rgba(0,0,0,0.08)' }}
              />
            </div>
          </div>
        </SectionBlock>

        <SectionDivider />

        {/* Live preview */}
        <ReelPreviewCard profile={profile} themeStyle={themeStyle} />

        {/* Save */}
        <div className="mt-16 text-center">
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.div key="saved" initial={{ opacity: 0, scale: 0.9, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="inline-block">
                <p className="text-2xl font-hand" style={{ color: themeStyle.accent }}>✨ Kept softly</p>
              </motion.div>
            ) : (
              <motion.button
                key="save"
                onClick={handleSave}
                disabled={saving}
                className="px-12 py-5 rounded-full text-white font-medium text-lg shadow-lg transition-all duration-500"
                style={{ background: `linear-gradient(135deg, ${themeStyle.accent} 0%, ${themeStyle.accent}CC 100%)`, opacity: saving ? 0.7 : 1 }}
                whileHover={{ scale: saving ? 1 : 1.04, y: saving ? 0 : -2 }}
                whileTap={{ scale: 0.97 }}
              >
                {saving ? 'Saving...' : 'Keep these close'}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Label = ({ accent, children }) => (
  <p className="text-xs font-medium tracking-widest uppercase opacity-50 mb-4" style={{ color: accent }}>
    {children}
  </p>
);

const ProfileHeader = ({ profile, themeStyle, onSet, avatarOptions }) => {
  const [editingName, setEditingName] = useState(false);
  const [showAvatars, setShowAvatars] = useState(false);

  return (
    <motion.div className="text-center mb-4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
      <div className="relative inline-block mb-6">
        <motion.button
          onClick={() => setShowAvatars(!showAvatars)}
          className="relative w-28 h-28 rounded-full flex items-center justify-center text-5xl shadow-lg border-4 border-white/80"
          style={{ background: themeStyle.bg }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
        >
          {profile.avatarEmoji}
          <div className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-sm font-medium" style={{ background: 'rgba(0,0,0,0.25)', color: 'white' }}>
            change
          </div>
        </motion.button>
        <AnimatePresence>
          {showAvatars && (
            <motion.div
              className="absolute top-full left-1/2 mt-3 bg-white/95 backdrop-blur-sm rounded-3xl p-4 shadow-2xl z-20"
              style={{ transform: 'translateX(-50%)', minWidth: '280px' }}
              initial={{ opacity: 0, scale: 0.9, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="flex flex-wrap gap-3 justify-center">
                {avatarOptions.map((emoji) => (
                  <motion.button key={emoji} onClick={() => { onSet('avatarEmoji', emoji); setShowAvatars(false); }}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors"
                    style={{ background: profile.avatarEmoji === emoji ? `${themeStyle.accent}20` : 'transparent' }}
                    whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                  >{emoji}</motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {editingName ? (
        <input
          type="text" value={profile.name} onChange={(e) => onSet('name', e.target.value)}
          onBlur={() => setEditingName(false)} onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
          placeholder="Your name"
          className="text-4xl font-bubble text-center bg-transparent border-b-2 outline-none w-full max-w-xs mx-auto block pb-2"
          style={{ borderColor: themeStyle.accent, color: themeStyle.accent }}
          autoFocus
        />
      ) : (
        <motion.button onClick={() => setEditingName(true)} className="block w-full text-center" whileHover={{ scale: 1.02 }}>
          {profile.name
            ? <h1 className="text-4xl font-bubble" style={{ color: themeStyle.accent }}>{profile.name}</h1>
            : <h1 className="text-3xl font-bubble opacity-30" style={{ color: themeStyle.accent }}>Who are you?</h1>
          }
        </motion.button>
      )}

      {profile.tagline && <p className="mt-3 text-lg font-hand opacity-60">{profile.tagline}</p>}

      {(profile.moodIdentity || []).length > 0 && (
        <motion.div className="flex flex-wrap gap-2 justify-center mt-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {(profile.moodIdentity || []).map((id) => {
            const chip = MOOD_CHIPS.find((c) => c.id === id);
            return chip ? (
              <span key={id} className="px-4 py-1.5 rounded-full text-sm font-medium"
                style={{ background: `${themeStyle.accent}18`, color: themeStyle.accent, border: `1px solid ${themeStyle.accent}40` }}>
                {chip.emoji} {chip.label}
              </span>
            ) : null;
          })}
        </motion.div>
      )}
    </motion.div>
  );
};

const ThemeCard = ({ theme, selected, onSelect }) => (
  <motion.button onClick={onSelect} className="w-full rounded-3xl overflow-hidden text-left border-2 transition-all duration-500"
    style={{ borderColor: selected ? theme.accent : 'transparent', boxShadow: selected ? `0 4px 24px ${theme.accent}30` : 'none' }}
    whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}
  >
    <div className="h-16" style={{ background: theme.bg }}>
      <div className="flex items-end justify-end p-3 h-full gap-2">
        {theme.swatch.map((c, i) => (
          <div key={i} className="rounded-full border-2 border-white/60" style={{ width: i === 2 ? '18px' : '12px', height: i === 2 ? '18px' : '12px', background: c }} />
        ))}
      </div>
    </div>
    <div className="px-5 py-3 flex items-center justify-between" style={{ background: selected ? `${theme.accent}10` : 'rgba(255,255,255,0.7)' }}>
      <div>
        <p className="font-medium text-base">{theme.label}</p>
        <p className="text-sm opacity-50">{theme.description}</p>
      </div>
      {selected && (
        <motion.div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{ background: theme.accent }} initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.div>
      )}
    </div>
  </motion.button>
);

const MoodChip = ({ chip, selected, accent, onToggle }) => (
  <motion.button onClick={onToggle}
    className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-400 border-2"
    style={{ background: selected ? `${accent}18` : 'rgba(255,255,255,0.6)', borderColor: selected ? accent : 'rgba(0,0,0,0.08)', color: selected ? accent : 'inherit' }}
    whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.95 }}
  >
    {chip.emoji} {chip.label}
  </motion.button>
);

const MusicVibeCard = ({ vibe, selected, accent, onSelect }) => (
  <motion.button onClick={onSelect}
    className="p-4 rounded-2xl border-2 text-left transition-all duration-400"
    style={{ background: selected ? `${accent}12` : 'rgba(255,255,255,0.5)', borderColor: selected ? accent : 'rgba(0,0,0,0.08)' }}
    whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-center gap-3 mb-1">
      <span className="text-xl">{vibe.emoji}</span>
      <p className="font-medium text-sm">{vibe.label}</p>
    </div>
    <p className="text-xs opacity-50 pl-9">{vibe.description}</p>
  </motion.button>
);

/**
 * TrackCard — shows track info + a play/stop preview button.
 * Tapping the play button previews the track audio.
 * Tapping the card label selects it as the default track.
 */
const TrackCard = ({ track, selected, playing, accent, onSelect, onPreview }) => (
  <div
    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-400"
    style={{ background: selected ? `${accent}10` : 'rgba(255,255,255,0.5)', borderColor: selected ? accent : 'rgba(0,0,0,0.06)' }}
  >
    {/* Play/stop preview button */}
    <motion.button
      onClick={(e) => { e.stopPropagation(); onPreview(); }}
      className="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all duration-300 border-2"
      style={{
        background: playing ? accent : 'transparent',
        borderColor: playing ? accent : `${accent}60`,
        color: playing ? 'white' : accent,
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={playing ? 'Stop preview' : 'Preview'}
    >
      {playing ? '■' : '▶'}
    </motion.button>

    {/* Track info — tap to set as default */}
    <motion.button onClick={onSelect} className="flex-1 text-left" whileHover={{ x: 2 }}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{track.emoji}</span>
        <p className="font-medium text-sm">{track.label}</p>
      </div>
      <p className="text-xs opacity-40 capitalize pl-7">{track.vibe} · {track.energy}</p>
    </motion.button>

    {/* Selected indicator */}
    {selected ? (
      <motion.div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0" style={{ background: accent }} initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.div>
    ) : (
      <div className="w-5 h-5 rounded-full border-2 flex-shrink-0" style={{ borderColor: 'rgba(0,0,0,0.12)' }} />
    )}
  </div>
);

const SectionBlock = ({ title, subtitle, active, onToggle, children }) => (
  <motion.div className="mb-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
    <button onClick={onToggle} className="w-full text-left mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bubble text-ink leading-tight">{title}</h2>
          <p className="text-base font-hand opacity-50 mt-1">{subtitle}</p>
        </div>
        <motion.div animate={{ rotate: active ? 45 : 0 }} transition={{ duration: 0.3 }} className="text-2xl opacity-30 mt-1 flex-shrink-0">+</motion.div>
      </div>
    </button>
    <AnimatePresence>
      {active && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }} style={{ overflow: 'hidden' }}>
          <div className="pb-2">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const Toggle = ({ checked, accent, onChange }) => (
  <motion.button onClick={() => onChange(!checked)} className="relative flex-shrink-0 rounded-full transition-colors duration-400" style={{ width: '52px', height: '28px', background: checked ? accent : 'rgba(0,0,0,0.1)' }} whileTap={{ scale: 0.93 }}>
    <motion.div className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md" animate={{ left: checked ? '28px' : '4px' }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
  </motion.button>
);

const SectionDivider = () => (
  <div className="my-12 flex items-center gap-4 opacity-20">
    <div className="flex-1 h-px bg-current" />
    <span className="text-lg">✦</span>
    <div className="flex-1 h-px bg-current" />
  </div>
);

const ReelPreviewCard = ({ profile, themeStyle }) => {
  const textFont = profile.textStyle === 'serif' ? 'Georgia, serif' : profile.textStyle === 'tiny' ? 'monospace' : 'Caveat, cursive';
  const overlayText = profile.overlayStyle === 'none' ? null : profile.overlayStyle === 'minimal' ? 'Jan 3' : profile.overlayStyle === 'poetic' ? 'Jan 3 · the light was gentle today' : 'Jan 3  🕊️';
  const aspectStyle = profile.aspectRatio === '9:16' ? { width: '120px', height: '213px' } : profile.aspectRatio === '1:1' ? { width: '160px', height: '160px' } : { width: '220px', height: '124px' };
  const trackName = profile.defaultMusicTrackId === 'uploaded' ? profile.uploadedMusicName || 'Your music' : BUILT_IN_TRACKS.find((t) => t.id === profile.defaultMusicTrackId)?.label ?? (profile.musicVibe !== 'none' ? `${profile.musicVibe} · ${profile.musicEnergy}` : 'Silence');

  return (
    <motion.div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)', border: `1.5px solid ${themeStyle.accent}30`, boxShadow: `0 12px 48px ${themeStyle.accent}15` }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="px-6 pt-6 pb-4" style={{ borderBottom: `1px solid ${themeStyle.accent}20` }}>
        <p className="text-xs font-medium tracking-widest uppercase opacity-60" style={{ color: themeStyle.accent }}>Your reel will look like this</p>
      </div>
      <div className="p-6 flex items-center gap-8">
        <div className="flex-shrink-0 flex items-center justify-center">
          <div className="rounded-2xl overflow-hidden relative flex items-end" style={{ ...aspectStyle, background: themeStyle.bg, border: `2px solid ${themeStyle.accent}30` }}>
            <div className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(45deg, ${themeStyle.swatch[0]}, ${themeStyle.swatch[2]})` }} />
            {overlayText && (
              <div className="relative z-10 w-full px-3 py-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent)' }}>
                <p style={{ fontFamily: textFont, fontSize: '10px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.3 }}>{overlayText}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 space-y-3">
          {[
            ['Format',     profile.aspectRatio],
            ['Clips',      `${profile.clipLength}s each`],
            ['Transition', TRANSITIONS.find((t) => t.id === profile.transition)?.label ?? profile.transition],
            ['Music',      trackName],
            ['Mood',       (profile.moodIdentity || []).slice(0, 2).join(', ') || '—'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline gap-2">
              <span className="text-xs font-medium opacity-40 w-20 flex-shrink-0" style={{ color: themeStyle.accent }}>{label}</span>
              <span className="text-sm font-medium truncate">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const PARTICLES = [
  { top: '8%',  left: '5%',   size: 6, dur: 8,  delay: 0,   emoji: '✦' },
  { top: '15%', right: '8%',  size: 8, dur: 11, delay: 2,   emoji: '✦' },
  { top: '45%', left: '3%',   size: 5, dur: 9,  delay: 1,   emoji: '·' },
  { top: '60%', right: '5%',  size: 7, dur: 12, delay: 3,   emoji: '✦' },
  { top: '80%', left: '8%',   size: 5, dur: 10, delay: 0.5, emoji: '·' },
  { top: '25%', right: '12%', size: 4, dur: 7,  delay: 1.5, emoji: '·' },
];

const AmbientParticles = ({ theme }) => (
  <>
    {PARTICLES.map((p, i) => (
      <motion.div key={i} className="fixed pointer-events-none z-0 select-none"
        style={{ top: p.top, left: p.left, right: p.right, fontSize: `${p.size}px`, color: theme.accent, opacity: 0.25 }}
        animate={{ y: [0, -16, 0], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
      >
        {p.emoji}
      </motion.div>
    ))}
  </>
);

export default ProfilePanel;