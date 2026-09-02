import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Mic,
  MicOff,
  Sparkles,
  Bot,
  Send,
  Volume2,
  RefreshCw,
  Globe,
  Radio,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { LanguageCode } from '../../types';

interface FarmerVoiceQueryBarProps {
  onAskAI: (query: string) => void;
}

const VOICE_LANGUAGES: Array<{ code: LanguageCode; speechLocale: string; label: string; native: string }> = [
  { code: 'ta', speechLocale: 'ta-IN', label: 'Tamil', native: 'தமிழ்' },
  { code: 'hi', speechLocale: 'hi-IN', label: 'Hindi', native: 'हिन्दी' },
  { code: 'en', speechLocale: 'en-IN', label: 'English (IN)', native: 'English' },
  { code: 'te', speechLocale: 'te-IN', label: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', speechLocale: 'kn-IN', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', speechLocale: 'ml-IN', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', speechLocale: 'mr-IN', label: 'Marathi', native: 'मराठी' },
  { code: 'gu', speechLocale: 'gu-IN', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', speechLocale: 'pa-IN', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'bn', speechLocale: 'bn-IN', label: 'Bengali', native: 'বাংলা' },
];

const PRESET_VOICE_QUERIES: Record<string, string[]> = {
  ta: [
    'தக்காளி இலை சுருட்டல் நோய்க்கான இயற்கை மருந்து என்ன?',
    'பொள்ளாச்சி சந்தையில் இன்றைய தக்காளி மற்றும் வெங்காய விலை என்ன?',
    'சொட்டு நீர் பாசனத்திற்கு அரசு மானியம் பெறுவது எப்படி?',
    'பூக்கும் பருவத்தில் தக்காளி பயிருக்கு எவ்வளவு தண்ணீர் பாய்ச்ச வேண்டும்?',
  ],
  hi: [
    'टमाटर के पत्ता मरोड़ रोग का जैविक उपचार क्या है?',
    'आज की पोलाची मंडी में टमाटर और प्याज का ताजा भाव क्या है?',
    'ड्रिप सिंचाई पर सरकारी सब्सिडी के लिए आवेदन कैसे करें?',
    'लाल दोमट मिट्टी में एनपीके उर्वरक का सही अनुपात क्या होना चाहिए?',
  ],
  en: [
    'What is the organic treatment for tomato leaf curl virus and thrips?',
    'What are today’s APMC Mandi modal prices for Tomato & Onion?',
    'How do I calculate cold storage ROI and pledge loans for 5 tonnes?',
    'What is the recommended NPK fertilizer split for red loamy soil?',
  ],
};

export const FarmerVoiceQueryBar: React.FC<FarmerVoiceQueryBarProps> = ({ onAskAI }) => {
  const { language, setLanguage, showToast, farmerProfile } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<string>(() => {
    const found = VOICE_LANGUAGES.find((l) => l.code === language);
    return found ? found.speechLocale : 'ta-IN';
  });
  const [isSupported, setIsSupported] = useState(true);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const audioIntervalRef = useRef<any>(null);

  // Sync with global language change if user hasn't explicitly customized speech locale
  useEffect(() => {
    const found = VOICE_LANGUAGES.find((l) => l.code === language);
    if (found) {
      setSelectedVoiceLang(found.speechLocale);
    }
  }, [language]);

  // Check Web Speech API support
  useEffect(() => {
    const hasSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setIsSupported(hasSpeech);
  }, []);

  // Simulate audio level pulse when listening
  useEffect(() => {
    if (isListening) {
      audioIntervalRef.current = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 80) + 20);
      }, 150);
    } else {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      setAudioLevel(0);
    }
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isListening]);

  const toggleListening = () => {
    if (!isSupported) {
      showToast('Voice input is not supported in this browser. Please use Chrome or Edge, or type your query.');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = selectedVoiceLang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimText('');
        const langObj = VOICE_LANGUAGES.find((l) => l.speechLocale === selectedVoiceLang);
        showToast(`🎤 Listening in ${langObj?.label || selectedVoiceLang}... Speak your question now.`);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript + ' ';
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => (prev ? `${prev.trim()} ${finalTranscript.trim()}` : finalTranscript.trim()));
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          showToast('Microphone access was denied. Please allow microphone permissions in browser settings.');
        } else if (event.error === 'no-speech') {
          // No speech detected, keep waiting
        } else {
          showToast(`Speech input notice: ${event.error || 'Check microphone'}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognition.start();
    } catch (e: any) {
      console.error('Failed to start speech recognition:', e);
      setIsListening(false);
      showToast('Could not access microphone.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
    setInterimText('');
  };

  const handleSubmit = (queryToSubmit?: string) => {
    const finalQ = queryToSubmit || (transcript + (interimText ? ' ' + interimText : '')).trim();
    if (!finalQ) {
      showToast('Please speak or type a question first.');
      return;
    }
    stopListening();
    onAskAI(finalQ);
  };

  const handleClear = () => {
    stopListening();
    setTranscript('');
    setInterimText('');
  };

  const activeLangQueries =
    PRESET_VOICE_QUERIES[language] || PRESET_VOICE_QUERIES.en;

  const currentLangObj = VOICE_LANGUAGES.find((l) => l.speechLocale === selectedVoiceLang) || VOICE_LANGUAGES[0];

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-stone-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-700/60 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white transition-all shadow-xs ${
                isListening
                  ? 'bg-rose-500 ring-4 ring-rose-400/40 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/40'
              }`}
            >
              {isListening ? <Mic className="w-6 h-6 animate-bounce" /> : <Mic className="w-6 h-6" />}
            </div>
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>Voice Kisan Assistant</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Web Speech API
                </span>
              </h2>
            </div>
            <p className="text-xs text-emerald-100/80">
              Speak naturally in your local language to get instant agronomic advice, mandi rates & storage ROI
            </p>
          </div>
        </div>

        {/* Voice Language Selector */}
        <div className="flex items-center space-x-2 bg-black/30 p-1.5 rounded-xl border border-white/10 self-stretch sm:self-auto justify-between sm:justify-start">
          <div className="flex items-center space-x-1.5 px-2 text-xs text-emerald-200">
            <Globe className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-[11px] font-semibold hidden md:inline">Speech Language:</span>
          </div>
          <select
            value={selectedVoiceLang}
            onChange={(e) => {
              const newLocale = e.target.value;
              setSelectedVoiceLang(newLocale);
              const matching = VOICE_LANGUAGES.find((l) => l.speechLocale === newLocale);
              if (matching) {
                setLanguage(matching.code);
              }
              if (isListening) {
                stopListening();
                showToast(`Speech language set to ${matching?.label || newLocale}. Tap mic to speak.`);
              }
            }}
            className="bg-stone-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-white/20 focus:outline-hidden focus:ring-1 focus:ring-emerald-400 cursor-pointer"
          >
            {VOICE_LANGUAGES.map((lang) => (
              <option key={lang.speechLocale} value={lang.speechLocale}>
                {lang.native} ({lang.label})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Interactive Mic Box & Live Transcription Area */}
      <div className="bg-stone-950/60 rounded-xl p-3 sm:p-4 border border-white/10 space-y-3">
        {/* Transcription Input / Display */}
        <div className="relative">
          <textarea
            rows={2}
            value={transcript + (interimText ? (transcript ? ' ' : '') + interimText : '')}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={
              isListening
                ? `Listening in ${currentLangObj.native}... Speak now (e.g. "தக்காளி இலை சுருட்டல் மருந்து", "Mandi price for tomato")...`
                : `Tap the microphone button or type your farm question in ${currentLangObj.native}...`
            }
            className="w-full bg-stone-900/80 text-white text-sm rounded-xl px-4 py-3 border border-stone-700/80 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-400 resize-none leading-relaxed"
          />

          {/* Audio Visualizer Waveform Bar while recording */}
          {isListening && (
            <div className="absolute right-3 bottom-3.5 flex items-center space-x-1 bg-stone-950/80 px-2 py-1 rounded-lg border border-rose-500/30">
              <span className="text-[10px] font-bold text-rose-400 mr-1 animate-pulse">REC</span>
              <div className="flex items-center space-x-0.5 h-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-rose-400 rounded-full transition-all duration-100"
                    style={{
                      height: `${Math.max(4, (audioLevel * (i + 1) * 3) % 18)}px`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          {/* Mic Button & Status */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleListening}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-xs cursor-pointer ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white ring-2 ring-rose-400/50'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 ring-1 ring-emerald-300'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Stop Listening</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Speak Your Question</span>
                </>
              )}
            </button>

            {(transcript || interimText) && (
              <button
                onClick={handleClear}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold border border-stone-700 transition-colors"
              >
                Clear
              </button>
            )}

            <span className="text-[11px] text-emerald-200/80 hidden sm:inline">
              {isListening ? (
                <span className="text-rose-300 font-semibold flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Listening actively...
                </span>
              ) : (
                <span>Language: <strong className="text-white">{currentLangObj.native}</strong></span>
              )}
            </span>
          </div>

          {/* Ask AI Assistant Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleSubmit()}
              disabled={!transcript.trim() && !interimText.trim()}
              className="px-5 py-2 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-stone-950 font-bold text-xs rounded-xl shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-stone-950" />
              <span>Ask Kisan AI Advisor</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-950" />
            </button>
          </div>
        </div>
      </div>

      {/* Preset Quick Voice Prompt Suggestions */}
      <div className="space-y-1.5">
        <div className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Quick Spoken Prompts ({currentLangObj.label}):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {activeLangQueries.map((query, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTranscript(query);
                handleSubmit(query);
              }}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-left text-xs text-white/95 border border-white/10 transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="truncate pr-2">{query}</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-300 opacity-60 group-hover:opacity-100 shrink-0 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
