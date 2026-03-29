/**
 * ProfilePanel.jsx — mobile-first personal profile experience.
 * Every section is touch-friendly, thumb-accessible, and elegantly scaled.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfile, saveProfile, saveProfileMusic, getProfileMusic } from '../utils/db';
import { previewBuiltInTrack, stopPreview } from '../utils/audioEngine';

// ─── Data ─────────────────────────────────────────────────────────────────────

const AVATAR_OPTIONS = ['🌸', '🕊️', '🌿', '🌙', '☕', '🌊', '🍂', '💭', '🌻', '🦋', '✨', '🌷'];

const MOOD_CHIPS = [
  { id: 'peaceful',   emoji: '🕊️', label: 'Peaceful'   },
  { id: 'nostalgic',  emoji: '📜', label: 'Nostalgic'  },
  { id: 'warm',       emoji: '☕', label: 'Warm'        },
  { id: 'thoughtful', emoji: '🍂', label: 'Thoughtful' },
  { id: 'quiet',      emoji: '🌙', label: 'Quiet'       },
  { id: 'hopeful',    emoji: '🌿', label: 'Hopeful'    },
  { id: 'tender',     emoji: '💭', label: 'Tender'      },
  { id: 'grateful',   emoji: '🙏', label: 'Grateful'   },
  { id: 'gentle',     emoji: '🌸', label: 'Gentle'      },
  { id: 'calm',       emoji: '🌊', label: 'Calm'        },
];

const THEMES = [
  { id: 'blush',     label: 'Blush',     description: 'Soft pinks, warm paper',     bg: 'linear-gradient(135deg,#FFE4EC,#FFF0F5,#FFE8D6)', accent: '#C84B5C', swatch: ['#FFE4EC','#F4C7C3','#C84B5C'] },
  { id: 'dusk',      label: 'Dusk',      description: 'Lavender hours',              bg: 'linear-gradient(135deg,#E8E0F5,#F2EEF8,#D4C8E8)', accent: '#7B5EA7', swatch: ['#E8E0F5','#B8A8D8','#7B5EA7'] },
  { id: 'forest',    label: 'Forest',    description: 'Sage, moss, mornings',        bg: 'linear-gradient(135deg,#E0EDE4,#F0F5F0,#D4E8D8)', accent: '#4A7C59', swatch: ['#E0EDE4','#A8C8B0','#4A7C59'] },
  { id: 'parchment', label: 'Parchment', description: 'Old letters, warm amber',     bg: 'linear-gradient(135deg,#F5ECD7,#FBF5E8,#EDE0C8)', accent: '#8B6914', swatch: ['#F5ECD7','#D4B896','#8B6914'] },
  { id: 'midnight',  label: 'Midnight',  description: 'Deep hours, introspection',   bg: 'linear-gradient(135deg,#1A1A2E,#16213E,#0F3460)',  accent: '#A8B8D8', swatch: ['#2A2A4E','#6878A8','#A8B8D8'], dark: true },
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

const MUSIC_VIBES     = [
  { id: 'ambient',   label: 'Ambient',   description: 'Drones, texture, air',   emoji: '🌫️' },
  { id: 'classical', label: 'Classical', description: 'Piano, strings, chamber', emoji: '🎹' },
  { id: 'lofi',      label: 'Lo-fi',     description: 'Warm, crackly, golden',   emoji: '🎷' },
  { id: 'cinematic', label: 'Cinematic', description: 'Sweeping, emotional',      emoji: '🎬' },
  { id: 'folk',      label: 'Folk',      description: 'Acoustic, earthy',         emoji: '🪕' },
  { id: 'none',      label: 'Silence',   description: 'Just the visuals',         emoji: '🤍' },
];
const ENERGY_LEVELS   = ['still','gentle','flowing','warm'];
const TRANSITIONS     = [
  { id: 'fade',    label: 'Fade',    description: 'Soft in and out'    },
  { id: 'cut',     label: 'Cut',     description: 'Clean and direct'   },
  { id: 'dissolve',label: 'Dissolve',description: 'Melts between clips'},
  { id: 'dreamy',  label: 'Dreamy',  description: 'Blur between scenes'},
];
const OVERLAY_STYLES  = [
  { id: 'none',    label: 'None',    description: 'Purely visual'        },
  { id: 'minimal', label: 'Minimal', description: 'Date only'            },
  { id: 'soft',    label: 'Soft',    description: 'Date + feeling'       },
  { id: 'poetic',  label: 'Poetic',  description: 'Full written moment'  },
];
const TEXT_STYLES     = [
  { id: 'handwritten', label: 'Handwritten', font: 'Caveat, cursive' },
  { id: 'serif',       label: 'Serif',       font: 'Georgia, serif'  },
  { id: 'tiny',        label: 'Tiny',        font: 'monospace'       },
];
const ASPECT_RATIOS   = [
  { id: '9:16', label: '9:16', icon: '▯', description: 'Story' },
  { id: '16:9', label: '16:9', icon: '▭', description: 'Wide'  },
  { id: '1:1',  label: '1:1',  icon: '□', description: 'Square'},
];
const CLIP_LENGTHS    = [3, 5, 7, 10];

const getTheme = (id) => THEMES.find((t) => t.id === id) || THEMES[0];

// ─── Main component ───────────────────────────────────────────────────────────

const ProfilePanel = () => {
  const [profile, setProfile]             = useState(null);
  const [saved, setSaved]                 = useState(false);
  const [saving, setSaving]               = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [uploadedMusicBlob, setUploadedMusicBlob] = useState(null);
  const [playingTrackId, setPlayingTrackId]       = useState(null);

  const musicInputRef    = useRef(null);
  const uploadedAudioRef = useRef(null);
  const stopPreviewRef   = useRef(null);

  useEffect(() => {
    return () => { stopPreview(); if (uploadedAudioRef.current) uploadedAudioRef.current.pause(); };
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
    const cur = profile.moodIdentity || [];
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    set('moodIdentity', next.length === 0 ? [id] : next);
  };

  const handlePlayTrack = (trackId) => {
    stopPreview();
    if (uploadedAudioRef.current) { uploadedAudioRef.current.pause(); uploadedAudioRef.current.currentTime = 0; }
    if (playingTrackId === trackId) { setPlayingTrackId(null); return; }

    if (trackId === 'uploaded') {
      if (uploadedAudioRef.current) {
        uploadedAudioRef.current.currentTime = 0;
        uploadedAudioRef.current.play().catch(() => {});
        setPlayingTrackId('uploaded');
        uploadedAudioRef.current.onended = () => setPlayingTrackId(null);
      }
      return;
    }
    try {
      previewBuiltInTrack(trackId);
      setPlayingTrackId(trackId);
      const timer = setTimeout(() => { stopPreview(); setPlayingTrackId(null); }, 12000);
      stopPreviewRef.current = () => { clearTimeout(timer); stopPreview(); setPlayingTrackId(null); };
    } catch (e) { console.warn('Preview failed:', e); }
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
    if (uploadedAudioRef.current) uploadedAudioRef.current.src = URL.createObjectURL(file);
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
    } catch (e) { console.error('Profile save failed:', e); }
    finally { setSaving(false); }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div className="w-12 h-12 border-4 border-blush border-t-transparent rounded-full"
          animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
      </div>
    );
  }

  const themeStyle = getTheme(profile.theme);

  return (
    <div className="min-h-screen relative">
      <audio ref={uploadedAudioRef} preload="none" />

      {/* Theme background */}
      <div className="fixed inset-0 pointer-events-none z-0 transition-all duration-1000"
        style={{ background: themeStyle.bg, opacity: 0.3 }} />

      {/* Ambient particles — desktop only to avoid mobile clutter */}
      <div className="hidden md:block">
        {[
          { top:'8%', left:'5%', size:6, dur:8, delay:0 },
          { top:'25%', right:'8%', size:5, dur:10, delay:2 },
          { top:'60%', left:'3%', size:4, dur:9, delay:1 },
        ].map((p, i) => (
          <motion.div key={i} className="fixed pointer-events-none z-0 select-none"
            style={{ top:p.top, left:p.left, right:p.right, fontSize:`${p.size}px`, color:themeStyle.accent, opacity:0.2 }}
            animate={{ y:[0,-14,0], opacity:[0.12,0.3,0.12] }}
            transition={{ duration:p.dur, repeat:Infinity, ease:'easeInOut', delay:p.delay }}
          >✦</motion.div>
        ))}
      </div>

      {/* Content — narrow on mobile, wider on desktop */}
      <div className="relative z-10 max-w-xl md:max-w-2xl mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-32 md:pb-40">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <ProfileHeader profile={profile} themeStyle={themeStyle} onSet={set} />

        <Divider />

        {/* ── Theme ────────────────────────────────────────────────────────── */}
        <Section title="The look of your world" subtitle="Choose the light your memories live in"
          active={activeSection==='theme'} onToggle={() => setActiveSection(s => s==='theme'?null:'theme')}>
          <div className="space-y-3">
            {THEMES.map((t) => <ThemeCard key={t.id} theme={t} selected={profile.theme===t.id} onSelect={()=>set('theme',t.id)} />)}
          </div>
        </Section>

        <Divider />

        {/* ── Mood ─────────────────────────────────────────────────────────── */}
        <Section title="How you tend to feel" subtitle="Shapes which memories find their way into your reels"
          active={activeSection==='mood'} onToggle={() => setActiveSection(s => s==='mood'?null:'mood')}>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {MOOD_CHIPS.map((chip) => (
              <MoodChip key={chip.id} chip={chip}
                selected={(profile.moodIdentity||[]).includes(chip.id)}
                accent={themeStyle.accent}
                onToggle={()=>toggleMood(chip.id)} />
            ))}
          </div>
          {(profile.moodIdentity||[]).length > 0 && (
            <p className="text-sm font-hand mt-4 opacity-60" style={{color:themeStyle.accent}}>
              Reels will lean toward {(profile.moodIdentity||[]).join(', ')} moments.
            </p>
          )}
        </Section>

        <Divider />

        {/* ── Sound ────────────────────────────────────────────────────────── */}
        <Section title="The sound of your memories" subtitle="Tap ▶ to preview a track before choosing"
          active={activeSection==='sound'} onToggle={() => setActiveSection(s => s==='sound'?null:'sound')}>

          <Label accent={themeStyle.accent}>Music vibe</Label>
          {/* Horizontal scroll on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hidden mb-7" style={{WebkitOverflowScrolling:'touch'}}>
            {MUSIC_VIBES.map((v) => (
              <motion.button key={v.id} onClick={()=>set('musicVibe',v.id)}
                className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border-2 text-center transition-all duration-400"
                style={{
                  minWidth:'80px',
                  background: profile.musicVibe===v.id ? `${themeStyle.accent}15` : 'rgba(255,255,255,0.5)',
                  borderColor: profile.musicVibe===v.id ? themeStyle.accent : 'rgba(0,0,0,0.07)',
                }}
                whileTap={{scale:0.96}}
              >
                <span className="text-xl">{v.emoji}</span>
                <span className="text-xs font-medium">{v.label}</span>
              </motion.button>
            ))}
          </div>

          <Label accent={themeStyle.accent}>Energy</Label>
          <div className="flex gap-2 mb-7">
            {ENERGY_LEVELS.map((e) => (
              <motion.button key={e} onClick={()=>set('musicEnergy',e)}
                className="flex-1 py-3 rounded-full border-2 text-xs md:text-sm font-medium transition-all duration-400 capitalize"
                style={{
                  borderColor: profile.musicEnergy===e ? themeStyle.accent : 'rgba(0,0,0,0.08)',
                  background:  profile.musicEnergy===e ? themeStyle.accent : 'rgba(255,255,255,0.5)',
                  color:       profile.musicEnergy===e ? 'white' : 'inherit',
                }}
                whileTap={{scale:0.96}}
              >{e}</motion.button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-7 px-1">
            <div>
              <p className="font-medium text-sm md:text-base">Instrumental only</p>
              <p className="text-xs md:text-sm opacity-60">No lyrics — just sound</p>
            </div>
            <Toggle checked={profile.instrumentalOnly} accent={themeStyle.accent} onChange={(v)=>set('instrumentalOnly',v)} />
          </div>

          <Label accent={themeStyle.accent}>Built-in tracks</Label>
          <div className="space-y-2 mb-7">
            {BUILT_IN_TRACKS
              .filter((t) => profile.musicVibe==='none' || t.vibe===profile.musicVibe || t.energy===profile.musicEnergy)
              .slice(0,5)
              .map((track) => (
                <TrackCard key={track.id} track={track}
                  selected={profile.defaultMusicTrackId===track.id}
                  playing={playingTrackId===track.id}
                  accent={themeStyle.accent}
                  onSelect={()=>set('defaultMusicTrackId',track.id)}
                  onPreview={()=>handlePlayTrack(track.id)}
                />
              ))}
          </div>

          <Label accent={themeStyle.accent}>Your own music</Label>
          <div
            className="rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition-opacity hover:opacity-80 mb-3"
            style={{borderColor:`${themeStyle.accent}40`}}
            onClick={()=>musicInputRef.current?.click()}
          >
            {profile.uploadedMusicName ? (
              <div>
                <p className="text-2xl mb-1">🎵</p>
                <p className="font-medium text-sm">{profile.uploadedMusicName}</p>
                <p className="text-xs opacity-50 mt-1">Tap to replace</p>
              </div>
            ) : (
              <div>
                <p className="text-3xl mb-2">🎶</p>
                <p className="font-medium text-sm">Upload your own music</p>
                <p className="text-xs opacity-50 mt-1">MP3, WAV, AAC</p>
              </div>
            )}
          </div>

          {profile.uploadedMusicName && (
            <TrackCard
              track={{id:'uploaded', label:profile.uploadedMusicName, emoji:'🎵', vibe:'custom', energy:'custom'}}
              selected={profile.defaultMusicTrackId==='uploaded'}
              playing={playingTrackId==='uploaded'}
              accent={themeStyle.accent}
              onSelect={()=>set('defaultMusicTrackId','uploaded')}
              onPreview={()=>handlePlayTrack('uploaded')}
            />
          )}

          <input ref={musicInputRef} type="file" accept="audio/*" className="hidden" onChange={handleMusicUpload} />

          <AnimatePresence>
            {playingTrackId && (
              <motion.button onClick={handleStopPreview}
                className="mt-5 w-full py-3 rounded-full text-sm font-medium border-2 min-h-[48px] transition-all duration-300"
                style={{borderColor:themeStyle.accent, color:themeStyle.accent}}
                initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}}
                whileTap={{scale:0.97}}
              >■ Stop preview</motion.button>
            )}
          </AnimatePresence>
        </Section>

        <Divider />

        {/* ── Reel style ────────────────────────────────────────────────────── */}
        <Section title="How your reels feel" subtitle="Rhythm, texture, and pacing"
          active={activeSection==='reel'} onToggle={() => setActiveSection(s => s==='reel'?null:'reel')}>

          <Label accent={themeStyle.accent}>Shape</Label>
          <div className="flex gap-3 mb-7">
            {ASPECT_RATIOS.map((r) => (
              <motion.button key={r.id} onClick={()=>set('aspectRatio',r.id)}
                className="flex-1 py-4 rounded-2xl border-2 text-center transition-all duration-400"
                style={{
                  borderColor: profile.aspectRatio===r.id ? themeStyle.accent : 'rgba(0,0,0,0.08)',
                  background:  profile.aspectRatio===r.id ? `${themeStyle.accent}15` : 'rgba(255,255,255,0.5)',
                }}
                whileTap={{scale:0.97}}
              >
                <div className="text-2xl md:text-3xl mb-1 opacity-60">{r.icon}</div>
                <p className="text-xs font-medium">{r.label}</p>
                <p className="text-[10px] md:text-xs opacity-50">{r.description}</p>
              </motion.button>
            ))}
          </div>

          <Label accent={themeStyle.accent}>Seconds per clip</Label>
          <div className="flex gap-2 mb-7">
            {CLIP_LENGTHS.map((len) => (
              <motion.button key={len} onClick={()=>set('clipLength',len)}
                className="flex-1 py-3 rounded-full border-2 font-medium text-sm transition-all duration-400 min-h-[48px]"
                style={{
                  borderColor: profile.clipLength===len ? themeStyle.accent : 'rgba(0,0,0,0.08)',
                  background:  profile.clipLength===len ? themeStyle.accent : 'rgba(255,255,255,0.5)',
                  color:       profile.clipLength===len ? 'white' : 'inherit',
                }}
                whileTap={{scale:0.97}}
              >{len}s</motion.button>
            ))}
          </div>

          <Label accent={themeStyle.accent}>Between clips</Label>
          <div className="grid grid-cols-2 gap-2 mb-7">
            {TRANSITIONS.map((t) => (
              <motion.button key={t.id} onClick={()=>set('transition',t.id)}
                className="py-4 px-3 rounded-2xl border-2 text-left transition-all duration-400"
                style={{
                  borderColor: profile.transition===t.id ? themeStyle.accent : 'rgba(0,0,0,0.08)',
                  background:  profile.transition===t.id ? `${themeStyle.accent}12` : 'rgba(255,255,255,0.5)',
                }}
                whileTap={{scale:0.97}}
              >
                <p className="font-medium text-sm">{t.label}</p>
                <p className="text-[11px] md:text-xs opacity-50 mt-0.5">{t.description}</p>
              </motion.button>
            ))}
          </div>

          <Label accent={themeStyle.accent}>Text overlays</Label>
          <div className="grid grid-cols-2 gap-2 mb-7">
            {OVERLAY_STYLES.map((o) => (
              <motion.button key={o.id}
                onClick={()=>{ set('overlayStyle',o.id); set('includeTextOverlays',o.id!=='none'); }}
                className="py-4 px-3 rounded-2xl border-2 text-left transition-all duration-400"
                style={{
                  borderColor: profile.overlayStyle===o.id ? themeStyle.accent : 'rgba(0,0,0,0.08)',
                  background:  profile.overlayStyle===o.id ? `${themeStyle.accent}12` : 'rgba(255,255,255,0.5)',
                }}
                whileTap={{scale:0.97}}
              >
                <p className="font-medium text-sm">{o.label}</p>
                <p className="text-[11px] md:text-xs opacity-50 mt-0.5">{o.description}</p>
              </motion.button>
            ))}
          </div>

          {profile.overlayStyle !== 'none' && (
            <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}>
              <Label accent={themeStyle.accent}>Text style</Label>
              <div className="flex gap-2 mb-7">
                {TEXT_STYLES.map((ts) => (
                  <motion.button key={ts.id} onClick={()=>set('textStyle',ts.id)}
                    className="flex-1 py-4 rounded-2xl border-2 text-center transition-all duration-400"
                    style={{
                      borderColor: profile.textStyle===ts.id ? themeStyle.accent : 'rgba(0,0,0,0.08)',
                      background:  profile.textStyle===ts.id ? `${themeStyle.accent}12` : 'rgba(255,255,255,0.5)',
                      fontFamily: ts.font,
                    }}
                    whileTap={{scale:0.97}}
                  >
                    <p className="text-xs md:text-sm">{ts.label}</p>
                    <p className="text-[10px] opacity-40 mt-1" style={{fontFamily:ts.font}}>Jan 3 🕊️</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <div className="flex items-center justify-between px-1">
            <div>
              <p className="font-medium text-sm md:text-base">Ken Burns zoom</p>
              <p className="text-xs md:text-sm opacity-60">Slow gentle zoom on each clip</p>
            </div>
            <Toggle checked={profile.kenBurns} accent={themeStyle.accent} onChange={(v)=>set('kenBurns',v)} />
          </div>
        </Section>

        <Divider />

        {/* ── Memory fields ─────────────────────────────────────────────────── */}
        <Section title="Words that belong to this space" subtitle="Personal anchors — only you will ever read these"
          active={activeSection==='memory'} onToggle={() => setActiveSection(s => s==='memory'?null:'memory')}>
          <div className="space-y-5">
            <div>
              <Label accent={themeStyle.accent}>A line that feels like home</Label>
              <input type="text" value={profile.tagline}
                onChange={(e)=>set('tagline',e.target.value)}
                placeholder="e.g. the quiet after rain, the warmth before sleep"
                className="w-full px-4 py-4 rounded-2xl border-2 bg-white/50 focus:outline-none transition-all duration-500 font-hand text-base"
                style={{borderColor: profile.tagline?`${themeStyle.accent}60`:'rgba(0,0,0,0.08)'}}
              />
            </div>
            <div>
              <Label accent={themeStyle.accent}>What this space should remind you of</Label>
              <textarea value={profile.memoryReminder}
                onChange={(e)=>set('memoryReminder',e.target.value)}
                placeholder="e.g. slow mornings, the smell of old books..."
                rows={3}
                className="w-full px-4 py-4 rounded-2xl border-2 bg-white/50 focus:outline-none transition-all duration-500 font-hand text-base resize-none leading-relaxed"
                style={{borderColor: profile.memoryReminder?`${themeStyle.accent}60`:'rgba(0,0,0,0.08)'}}
              />
            </div>
          </div>
        </Section>

        <Divider />

        {/* ── Preview card ──────────────────────────────────────────────────── */}
        <ReelPreviewCard profile={profile} themeStyle={themeStyle} />

        {/* ── Save ─────────────────────────────────────────────────────────── */}
        <div className="mt-12 md:mt-16 text-center">
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.p key="saved" className="text-xl font-hand" style={{color:themeStyle.accent}}
                initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0}}>
                ✨ Kept softly
              </motion.p>
            ) : (
              <motion.button key="save" onClick={handleSave} disabled={saving}
                className="px-10 md:px-12 py-4 md:py-5 rounded-full text-white font-medium text-base md:text-lg shadow-lg transition-all duration-500 min-h-[52px] w-full sm:w-auto"
                style={{background:`linear-gradient(135deg,${themeStyle.accent},${themeStyle.accent}CC)`, opacity:saving?0.7:1}}
                whileHover={{scale:saving?1:1.03}} whileTap={{scale:0.97}}
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
  <p className="text-[10px] md:text-xs font-medium tracking-widest uppercase opacity-50 mb-3" style={{color:accent}}>
    {children}
  </p>
);

const ProfileHeader = ({ profile, themeStyle, onSet }) => {
  const [editingName, setEditingName] = useState(false);
  const [showAvatars, setShowAvatars] = useState(false);

  return (
    <motion.div className="text-center mb-4" initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.9}}>
      {/* Avatar */}
      <div className="relative inline-block mb-5">
        <motion.button
          onClick={()=>setShowAvatars(!showAvatars)}
          className="w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center text-4xl md:text-5xl shadow-lg border-4 border-white/80 transition-all duration-500"
          style={{background:themeStyle.bg}}
          whileTap={{scale:0.95}}
        >
          {profile.avatarEmoji}
        </motion.button>
        <AnimatePresence>
          {showAvatars && (
            <motion.div
              className="absolute top-full left-1/2 mt-3 bg-white/96 backdrop-blur-sm rounded-3xl p-4 shadow-2xl z-20"
              style={{transform:'translateX(-50%)', width:'min(280px,80vw)'}}
              initial={{opacity:0,scale:0.9,y:-8}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.9}}
            >
              <div className="flex flex-wrap gap-3 justify-center">
                {AVATAR_OPTIONS.map((emoji) => (
                  <motion.button key={emoji}
                    onClick={()=>{ onSet('avatarEmoji',emoji); setShowAvatars(false); }}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-2xl transition-colors min-w-[44px] min-h-[44px]"
                    style={{background: profile.avatarEmoji===emoji?`${themeStyle.accent}20`:'transparent'}}
                    whileTap={{scale:0.9}}
                  >{emoji}</motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Name */}
      {editingName ? (
        <input type="text" value={profile.name} onChange={(e)=>onSet('name',e.target.value)}
          onBlur={()=>setEditingName(false)} onKeyDown={(e)=>e.key==='Enter'&&setEditingName(false)}
          placeholder="Your name"
          className="text-3xl md:text-4xl font-bubble text-center bg-transparent border-b-2 outline-none w-full max-w-xs mx-auto block pb-2 mb-2"
          style={{borderColor:themeStyle.accent, color:themeStyle.accent}}
          autoFocus
        />
      ) : (
        <motion.button onClick={()=>setEditingName(true)} className="block w-full text-center mb-2" whileTap={{scale:0.98}}>
          {profile.name
            ? <h1 className="text-3xl md:text-4xl font-bubble" style={{color:themeStyle.accent}}>{profile.name}</h1>
            : <h1 className="text-2xl md:text-3xl font-bubble opacity-30" style={{color:themeStyle.accent}}>Who are you?</h1>
          }
        </motion.button>
      )}

      {profile.tagline && (
        <p className="text-base md:text-lg font-hand opacity-60 px-4">{profile.tagline}</p>
      )}

      {(profile.moodIdentity||[]).length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {(profile.moodIdentity||[]).map((id) => {
            const chip = MOOD_CHIPS.find((c)=>c.id===id);
            return chip ? (
              <span key={id} className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{background:`${themeStyle.accent}18`, color:themeStyle.accent, border:`1px solid ${themeStyle.accent}35`}}>
                {chip.emoji} {chip.label}
              </span>
            ) : null;
          })}
        </div>
      )}
    </motion.div>
  );
};

const ThemeCard = ({ theme, selected, onSelect }) => (
  <motion.button onClick={onSelect}
    className="w-full rounded-2xl overflow-hidden text-left border-2 transition-all duration-500"
    style={{borderColor:selected?theme.accent:'transparent', boxShadow:selected?`0 4px 20px ${theme.accent}28`:'none'}}
    whileTap={{scale:0.99}}
  >
    <div className="h-14" style={{background:theme.bg}}>
      <div className="flex items-end justify-end p-3 h-full gap-2">
        {theme.swatch.map((c,i)=>(
          <div key={i} className="rounded-full border-2 border-white/60"
            style={{width:i===2?'16px':'10px', height:i===2?'16px':'10px', background:c}} />
        ))}
      </div>
    </div>
    <div className="px-4 py-3 flex items-center justify-between"
      style={{background:selected?`${theme.accent}10`:'rgba(255,255,255,0.7)'}}>
      <div>
        <p className="font-medium text-sm">{theme.label}</p>
        <p className="text-xs opacity-50">{theme.description}</p>
      </div>
      {selected && (
        <motion.div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
          style={{background:theme.accent}} initial={{scale:0}} animate={{scale:1}}>✓</motion.div>
      )}
    </div>
  </motion.button>
);

const MoodChip = ({ chip, selected, accent, onToggle }) => (
  <motion.button onClick={onToggle}
    className="px-4 py-2.5 rounded-full text-xs md:text-sm font-medium transition-all duration-400 border-2 min-h-[44px]"
    style={{
      background: selected?`${accent}18`:'rgba(255,255,255,0.6)',
      borderColor: selected?accent:'rgba(0,0,0,0.08)',
      color: selected?accent:'inherit',
    }}
    whileTap={{scale:0.94}}
  >
    {chip.emoji} {chip.label}
  </motion.button>
);

const TrackCard = ({ track, selected, playing, accent, onSelect, onPreview }) => (
  <div className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-400"
    style={{background:selected?`${accent}10`:'rgba(255,255,255,0.5)', borderColor:selected?accent:'rgba(0,0,0,0.06)'}}>
    <motion.button onClick={(e)=>{e.stopPropagation();onPreview();}}
      className="w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0 border-2 transition-all duration-300 min-w-[44px] min-h-[44px]"
      style={{background:playing?accent:'transparent', borderColor:playing?accent:`${accent}55`, color:playing?'white':accent}}
      whileTap={{scale:0.9}}
    >{playing?'■':'▶'}</motion.button>
    <motion.button onClick={onSelect} className="flex-1 text-left min-w-0" whileHover={{x:2}}>
      <div className="flex items-center gap-2">
        <span className="text-base">{track.emoji}</span>
        <p className="font-medium text-sm truncate">{track.label}</p>
      </div>
      <p className="text-xs opacity-40 capitalize pl-6 truncate">{track.vibe} · {track.energy}</p>
    </motion.button>
    {selected
      ? <motion.div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
          style={{background:accent}} initial={{scale:0}} animate={{scale:1}}>✓</motion.div>
      : <div className="w-5 h-5 rounded-full border-2 flex-shrink-0" style={{borderColor:'rgba(0,0,0,0.12)'}} />
    }
  </div>
);

const Section = ({ title, subtitle, active, onToggle, children }) => (
  <motion.div className="mb-2" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>
    <button onClick={onToggle} className="w-full text-left mb-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bubble text-ink leading-snug">{title}</h2>
          <p className="text-sm font-hand opacity-50 mt-1">{subtitle}</p>
        </div>
        <motion.div animate={{rotate:active?45:0}} transition={{duration:0.25}}
          className="text-2xl opacity-30 flex-shrink-0 mt-0.5">+</motion.div>
      </div>
    </button>
    <AnimatePresence>
      {active && (
        <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
          transition={{duration:0.45, ease:[0.25,0.46,0.45,0.94]}} style={{overflow:'hidden'}}>
          <div className="pb-2">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const Toggle = ({ checked, accent, onChange }) => (
  <motion.button onClick={()=>onChange(!checked)}
    className="relative flex-shrink-0 rounded-full transition-colors duration-400"
    style={{width:'50px', height:'28px', background:checked?accent:'rgba(0,0,0,0.1)'}}
    whileTap={{scale:0.93}}
  >
    <motion.div className="absolute top-[4px] w-5 h-5 bg-white rounded-full shadow-md"
      animate={{left:checked?'26px':'4px'}}
      transition={{type:'spring', stiffness:500, damping:35}} />
  </motion.button>
);

const Divider = () => (
  <div className="my-10 md:my-12 flex items-center gap-4 opacity-15">
    <div className="flex-1 h-px bg-current" />
    <span className="text-base">✦</span>
    <div className="flex-1 h-px bg-current" />
  </div>
);

const ReelPreviewCard = ({ profile, themeStyle }) => {
  const textFont = profile.textStyle==='serif'?'Georgia, serif':profile.textStyle==='tiny'?'monospace':'Caveat, cursive';
  const overlayText = profile.overlayStyle==='none'?null:profile.overlayStyle==='minimal'?'Jan 3':profile.overlayStyle==='poetic'?'Jan 3 · the light was gentle':'Jan 3  🕊️';
  const previewSize = profile.aspectRatio==='9:16' ? {w:90,h:160} : profile.aspectRatio==='1:1' ? {w:130,h:130} : {w:180,h:101};
  const trackName = profile.defaultMusicTrackId==='uploaded'
    ? profile.uploadedMusicName||'Your music'
    : BUILT_IN_TRACKS.find((t)=>t.id===profile.defaultMusicTrackId)?.label
    ?? (profile.musicVibe!=='none'?`${profile.musicVibe} · ${profile.musicEnergy}`:'Silence');

  return (
    <motion.div className="rounded-3xl overflow-hidden"
      style={{background:'rgba(255,255,255,0.6)', backdropFilter:'blur(16px)', border:`1.5px solid ${themeStyle.accent}28`, boxShadow:`0 8px 40px ${themeStyle.accent}12`}}
      initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
      <div className="px-5 pt-5 pb-3" style={{borderBottom:`1px solid ${themeStyle.accent}18`}}>
        <p className="text-[10px] font-medium tracking-widest uppercase opacity-55" style={{color:themeStyle.accent}}>
          Your reel will look like this
        </p>
      </div>
      <div className="p-5 flex items-center gap-5">
        {/* Mini reel mockup */}
        <div className="flex-shrink-0"
          style={{width:`${previewSize.w}px`, height:`${previewSize.h}px`, background:themeStyle.bg, borderRadius:'12px', border:`2px solid ${themeStyle.accent}28`, overflow:'hidden', position:'relative', display:'flex', alignItems:'flex-end'}}>
          <div className="absolute inset-0 opacity-25"
            style={{background:`linear-gradient(45deg,${themeStyle.swatch[0]},${themeStyle.swatch[2]})`}} />
          {overlayText && (
            <div className="relative z-10 w-full px-2 py-2"
              style={{background:'linear-gradient(to top,rgba(0,0,0,0.4),transparent)'}}>
              <p style={{fontFamily:textFont, fontSize:'9px', color:'rgba(255,255,255,0.9)', lineHeight:1.3}}>
                {overlayText}
              </p>
            </div>
          )}
        </div>
        {/* Details */}
        <div className="flex-1 space-y-2 min-w-0">
          {[
            ['Format',     profile.aspectRatio],
            ['Clips',      `${profile.clipLength}s each`],
            ['Transition', TRANSITIONS.find((t)=>t.id===profile.transition)?.label||profile.transition],
            ['Music',      trackName],
            ['Mood',       (profile.moodIdentity||[]).slice(0,2).join(', ')||'—'],
          ].map(([label,value])=>(
            <div key={label} className="flex items-baseline gap-2">
              <span className="text-[10px] font-medium opacity-40 w-16 flex-shrink-0" style={{color:themeStyle.accent}}>{label}</span>
              <span className="text-xs font-medium truncate">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePanel;