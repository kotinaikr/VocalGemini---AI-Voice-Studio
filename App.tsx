
import React, { useState, useRef, useEffect } from 'react';
import { VOICES, SAMPLE_TEXT_SINGLE, SAMPLE_TEXT_MULTI, INDIAN_LANGUAGES, MIRROR_PROMPTS } from './constants';
import { VoiceName, AppMode, SpeakerConfig } from './types';
import { generateSingleSpeakerSpeech, generateMultiSpeakerSpeech, mirrorVoice } from './services/geminiService';
import { decodeBase64, decodeAudioData, blobToBase64 } from './services/audioUtils';
import { VoiceCard } from './components/VoiceCard';
import { VoiceRecorder } from './components/VoiceRecorder';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.SINGLE);
  const [text, setText] = useState(SAMPLE_TEXT_SINGLE);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.Kore);
  const [selectedLanguage, setSelectedLanguage] = useState(INDIAN_LANGUAGES[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const [multiSpeakers, setMultiSpeakers] = useState<SpeakerConfig[]>([
    { speakerName: 'Narrator', voice: VoiceName.Charon },
    { speakerName: 'Aria', voice: VoiceName.Zephyr },
    { speakerName: 'Leo', voice: VoiceName.Puck },
  ]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleModeSwitch = (newMode: AppMode) => {
    setMode(newMode);
    if (newMode === AppMode.SINGLE) setText(SAMPLE_TEXT_SINGLE);
    else if (newMode === AppMode.MULTI) setText(SAMPLE_TEXT_MULTI);
    else setText(MIRROR_PROMPTS[selectedLanguage] || MIRROR_PROMPTS['english']);
    setAudioUrl(null);
    setError(null);
  };

  const handleLanguageChange = (langId: string) => {
    setSelectedLanguage(langId);
    if (mode === AppMode.MIRROR) {
      setText(MIRROR_PROMPTS[langId] || MIRROR_PROMPTS['english']);
    }
  };

  const handleSynthesize = async () => {
    if (mode === AppMode.MIRROR && !recordedBlob) {
      setError("Please record a voice sample first to clone your identity.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      let base64Audio: string;
      if (mode === AppMode.SINGLE) {
        base64Audio = await generateSingleSpeakerSpeech(text, selectedVoice);
      } else if (mode === AppMode.MULTI) {
        base64Audio = await generateMultiSpeakerSpeech(text, multiSpeakers);
      } else {
        const sampleB64 = await blobToBase64(recordedBlob!);
        const langName = INDIAN_LANGUAGES.find(l => l.id === selectedLanguage)?.name || 'English';
        base64Audio = await mirrorVoice(text, sampleB64, recordedBlob!.type, langName);
      }

      const audioBytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current);
      
      playAudioBuffer(audioBuffer);
      setAudioUrl('generated'); 
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during synthesis.');
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudioBuffer = (buffer: AudioBuffer) => {
    if (!audioContextRef.current) return;
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
    }
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.start(0);
    audioSourceRef.current = source;
  };

  const addSpeaker = () => {
    setMultiSpeakers([...multiSpeakers, { speakerName: 'New Person', voice: VoiceName.Fenrir }]);
  };

  const removeSpeaker = (index: number) => {
    setMultiSpeakers(multiSpeakers.filter((_, i) => i !== index));
  };

  const updateSpeaker = (index: number, updates: Partial<SpeakerConfig>) => {
    const next = [...multiSpeakers];
    next[index] = { ...next[index], ...updates };
    setMultiSpeakers(next);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800 py-6 px-8 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-600 to-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">VocalGemini <span className="text-orange-500">Bharat</span></h1>
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Regional Voice Synthesis Studio</p>
            </div>
          </div>

          <nav className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            {[
              { id: AppMode.SINGLE, label: 'Single' },
              { id: AppMode.MULTI, label: 'Multi' },
              { id: AppMode.MIRROR, label: 'Regional Mirror' }
            ].map(nav => (
              <button
                key={nav.id}
                onClick={() => handleModeSwitch(nav.id)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  mode === nav.id ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {nav.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-1 shadow-2xl">
            <div className="bg-[#121212] rounded-xl overflow-hidden flex flex-col min-h-[400px]">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Script Editor</span>
                <span className="flex items-center gap-2 text-[10px] text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  MULTILINGUAL ACTIVE
                </span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text in your regional language script (Kannada, Devanagari, etc.)..."
                className="flex-1 bg-transparent p-6 text-zinc-200 resize-none focus:outline-none text-xl leading-relaxed placeholder:text-zinc-700"
              />
              <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 flex items-center justify-between">
                <div className="text-xs text-zinc-500">
                  {text.length} characters • UTF-8 Support
                </div>
                <button
                  onClick={handleSynthesize}
                  disabled={isGenerating || !text.trim()}
                  className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all ${
                    isGenerating || !text.trim()
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20 active:scale-95'
                  }`}
                >
                  {isGenerating ? 'Synthesizing Identity...' : 'Generate Voice'}
                </button>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
              <div className="text-sm">
                <p className="font-bold">Studio Error</p>
                <p className="opacity-80">{error}</p>
              </div>
            </div>
          )}

          {audioUrl && !isGenerating && (
            <div className="p-6 bg-orange-600/5 border border-orange-500/10 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center animate-pulse">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-zinc-100">Natural Output Ready</h3>
                  <p className="text-sm text-zinc-500">Regional phonetics applied with identity preservation.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          {mode === AppMode.MIRROR && (
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-bold mb-1">Identity Config</h2>
                <p className="text-sm text-zinc-500">Record your voice in any language, then choose your output language.</p>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Target Language</label>
                <select 
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                >
                  {INDIAN_LANGUAGES.map(lang => (
                    <option key={lang.id} value={lang.id}>{lang.name} ({lang.nativeName})</option>
                  ))}
                </select>
              </div>

              <VoiceRecorder 
                onRecorded={(blob) => setRecordedBlob(blob)} 
                isProcessing={isGenerating} 
              />

              <div className="p-4 bg-orange-600/5 border border-orange-500/10 rounded-xl">
                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2 italic">Bharat Tech</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  The model performs <strong>Zero-Shot Cross-Lingual Cloning</strong>. You can record in English and output in Kannada or Lambani while sounding exactly like yourself.
                </p>
              </div>
            </section>
          )}

          {mode !== AppMode.MIRROR && (
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
              <h2 className="text-lg font-bold">Standard TTS</h2>
              <div className="grid grid-cols-1 gap-3">
                {VOICES.slice(0, 3).map((v) => (
                  <VoiceCard
                    key={v.id}
                    voice={v}
                    selected={selectedVoice === v.id}
                    onClick={() => setSelectedVoice(v.id)}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-bold text-zinc-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Regional Accuracy
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">Identity Preservation</span>
                <span className="text-orange-400 font-bold">98%</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full w-[98%]" />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">Regional Nuance (Dravidian)</span>
                <span className="text-orange-400 font-bold">95%</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full w-[95%]" />
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="py-8 px-8 border-t border-zinc-900 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-zinc-600 text-sm">
          <p>© 2024 VocalGemini Bharat. Specialized for Indian Languages & Dialects.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
