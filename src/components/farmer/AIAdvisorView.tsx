import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  User,
  FlaskConical,
  Sprout,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  BarChart3,
  DollarSign,
  Calendar,
  Layers,
  HelpCircle,
  PhoneCall,
  ExternalLink,
  Cpu,
  Zap,
  BookOpen,
  Leaf,
  Trash2,
  Copy,
  Check,
  MessageSquareQuote,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { InquiryChatbotModal } from '../common/InquiryChatbotModal';
import {
  ChatbotRoleId,
  ChatTaskTier,
  MultiTurnChatMessage,
  ChatTurnHistoryItem,
} from '../../types';

interface RoleMeta {
  id: ChatbotRoleId;
  name: string;
  badge: string;
  tagline: string;
  defaultTier: ChatTaskTier;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  defaultSuggestions: string[];
}

const ROLES: RoleMeta[] = [
  {
    id: 'kisan_copilot',
    name: 'Kisan Copilot',
    badge: 'General Farm Guidance',
    tagline: 'Empathetic, practical field tasks, weather & daily agronomy',
    defaultTier: 'GENERAL',
    icon: <Bot className="w-4 h-4" />,
    color: 'emerald',
    gradient: 'from-emerald-700 to-teal-800',
    defaultSuggestions: [
      'What is the ideal sowing time and seed rate for Shallot Onion this season?',
      'How much irrigation water should I give my Tomato crop during flowering?',
      'Suggest organic preventive measures against sucking pests like thrips',
    ],
  },
  {
    id: 'agronomist_pro',
    name: 'Lead Agronomist (Pro)',
    badge: 'Complex Modeling',
    tagline: 'Deep soil biochemistry, NPK fertigation & pathogen disruption',
    defaultTier: 'COMPLEX',
    icon: <FlaskConical className="w-4 h-4" />,
    color: 'indigo',
    gradient: 'from-indigo-800 to-purple-900',
    defaultSuggestions: [
      'Calculate precision N-P-K fertilizer split for Tomato in Red Loamy soil (pH 6.8)',
      'How do I remediate early blossom end rot caused by calcium mobility issues?',
      'Design an Integrated Pest Management (IPM) schedule for Fall Armyworm',
    ],
  },
  {
    id: 'speed_dispatcher',
    name: 'Mandi Dispatcher',
    badge: 'Fast Logistics',
    tagline: 'Instant APMC rates, warehouse capacity & pledge loan estimations',
    defaultTier: 'FAST',
    icon: <Zap className="w-4 h-4" />,
    color: 'amber',
    gradient: 'from-amber-700 to-orange-800',
    defaultSuggestions: [
      'What is today\'s APMC Mandi Modal Price for Tomato and Shallot Onion?',
      'How do I calculate cold storage ROI and e-NWR pledge loan value for 5 tonnes?',
      'Show Mandi Price Trends and forecast chart for this season',
    ],
  },
  {
    id: 'scheme_specialist',
    name: 'Scheme Specialist',
    badge: 'Govt Welfare',
    tagline: 'PM-KISAN, PMFBY insurance, PMKSY drip subsidy & SMAM grants',
    defaultTier: 'GENERAL',
    icon: <BookOpen className="w-4 h-4" />,
    color: 'blue',
    gradient: 'from-blue-800 to-sky-900',
    defaultSuggestions: [
      'How do I claim PMFBY crop insurance compensation for unseasonal rain loss?',
      'What documents are required to get 100% PMKSY subsidy for Drip Irrigation?',
      'Explain eligibility and subsidy percentage under SMAM for power tillers',
    ],
  },
  {
    id: 'organic_master',
    name: 'Vedic Krishi Master',
    badge: 'Zero-Chemical',
    tagline: 'Jeevamrutham recipes, bio-agents & natural predator cycles',
    defaultTier: 'GENERAL',
    icon: <Leaf className="w-4 h-4" />,
    color: 'teal',
    gradient: 'from-teal-800 to-emerald-900',
    defaultSuggestions: [
      'Give me the exact recipe and application method for making Jeevamrutham',
      'How do I prepare 5% Neem Seed Kernel Extract (NSKE) for fruit borer?',
      'How to apply Trichoderma viride and Pseudomonas for root rot prevention?',
    ],
  },
];

const MODEL_TIERS: Array<{
  tier: ChatTaskTier;
  model: 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';
  label: string;
  desc: string;
  badgeColor: string;
}> = [
  {
    tier: 'COMPLEX',
    model: 'gemini-3.1-pro-preview',
    label: 'Gemini 3.1 Pro (Preview)',
    desc: 'Deep reasoning, mathematical calculations & multi-variable modeling',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  {
    tier: 'GENERAL',
    model: 'gemini-3.5-flash',
    label: 'Gemini 3.5 Flash',
    desc: 'Balanced agronomic advice, quick explanations & practical steps',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    tier: 'FAST',
    model: 'gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash-Lite',
    desc: 'Ultra-low latency, instant mandi rates & concise quick answers',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
];

interface AIAdvisorViewProps {
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

export const AIAdvisorView: React.FC<AIAdvisorViewProps> = ({ initialQuery, onClearInitialQuery }) => {
  const { currentUser, farmerProfile, language, showToast } = useApp();

  const [activeRole, setActiveRole] = useState<ChatbotRoleId>('kisan_copilot');
  const [activeTier, setActiveTier] = useState<ChatTaskTier>('GENERAL');
  const [preferredModel, setPreferredModel] = useState<'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');

  const [messages, setMessages] = useState<MultiTurnChatMessage[]>([
    {
      id: 'm_welcome',
      sender: 'ai',
      role: 'model',
      text: `Vanakkam ${farmerProfile?.farmer_name || 'Kisan Mitra'}! I am your AgriSaarthi AI Agronomic Advisor.\n\nI have active context on your **6.5-acre farm** in **Pollachi**, with **Red Sandy Loam** soil, primary crops (**Tomato, Groundnut, Onion**), and regional micro-climate data.\n\nFeel free to choose a specialized persona above (e.g. Lead Agronomist, Mandi Dispatcher, Govt Schemes) or ask any question below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash',
      roleId: 'kisan_copilot',
      suggestedFollowUps: [
        '📈 Show Mandi Price Trends and forecast chart for Tomato',
        '🥦 Which fruits & vegetables are currently highest in market demand?',
        '💰 Cold Storage ROI: How much extra profit can I earn storing produce?',
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasHandledInitialQuery = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle incoming initial voice/text query
  useEffect(() => {
    if (initialQuery && initialQuery.trim() && !hasHandledInitialQuery.current) {
      hasHandledInitialQuery.current = true;
      handleSendMessage(initialQuery);
      if (onClearInitialQuery) {
        onClearInitialQuery();
      }
    }
  }, [initialQuery]);

  // When role changes, automatically align recommended task tier and model
  const handleRoleSelect = (roleId: ChatbotRoleId) => {
    setActiveRole(roleId);
    const roleMeta = ROLES.find((r) => r.id === roleId);
    if (roleMeta) {
      setActiveTier(roleMeta.defaultTier);
      const tierObj = MODEL_TIERS.find((t) => t.tier === roleMeta.defaultTier);
      if (tierObj) setPreferredModel(tierObj.model);
    }
  };

  const handleTierSelect = (tier: ChatTaskTier) => {
    setActiveTier(tier);
    const tierObj = MODEL_TIERS.find((t) => t.tier === tier);
    if (tierObj) setPreferredModel(tierObj.model);
  };

  // Speech Recognition (Web Speech API)
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;

    if (!isListening) {
      recognition.start();
      setIsListening(true);
      showToast(`Listening in ${language.toUpperCase()}... Speak now.`);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  // Text-To-Speech (Web Speech Synthesis)
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-speech is not supported.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const plainText = text.replace(/[*#`_-]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    const currentRoleMeta = ROLES.find((r) => r.id === activeRole) || ROLES[0];
    setMessages([
      {
        id: `m_new_${Date.now()}`,
        sender: 'ai',
        role: 'model',
        text: `Chat cleared. New session started with **${currentRoleMeta.name}**.\n\nHow can I assist your farm today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: preferredModel,
        roleId: activeRole,
        suggestedFollowUps: currentRoleMeta.defaultSuggestions,
      },
    ]);
    showToast('New conversation started');
  };

  // Send Message with Multi-Turn History
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMsg: MultiTurnChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    // Build multi-turn history payload
    const historyPayload: ChatTurnHistoryItem[] = messages.slice(-8).map((m) => ({
      role: m.role || (m.sender === 'user' ? 'user' : 'model'),
      text: m.text,
    }));

    try {
      const response = await api.sendMultiTurnAIChat({
        message: query,
        history: historyPayload,
        roleId: activeRole,
        taskTier: activeTier,
        preferredModel,
        language,
        farmerContext: {
          name: farmerProfile?.farmer_name || currentUser?.name,
          village: farmerProfile?.village,
          district: 'Coimbatore',
          state: 'Tamil Nadu',
          crops: farmerProfile?.primary_crops || ['Tomato', 'Groundnut', 'Onion'],
          soilType: farmerProfile?.soil_type || 'Red Sandy Loam',
          landAreaAcres: farmerProfile?.land_area_acres || 6.5,
        },
      });

      const aiMsg: MultiTurnChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        role: 'model',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: response.modelUsed,
        roleId: response.roleId,
        suggestedFollowUps: response.suggestedFollowUps,
        visualPayload: response.visualPayload,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      showToast('Failed to reach AI advisor. Using agronomic fallback.');
      const fallbackMsg: MultiTurnChatMessage = {
        id: `ai_err_${Date.now()}`,
        sender: 'ai',
        role: 'model',
        text: `Vanakkam! For storing crops in Pollachi, certified CWC & TNWC cold storages offer scientific protection and e-NWR warehouse loans. For plant diseases, use the Plant Scanner to upload leaf photos for immediate organic IPM recipes.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'Agronomic Engine',
        roleId: activeRole,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentRoleMeta = ROLES.find((r) => r.id === activeRole) || ROLES[0];

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[800px]">
      {/* 1. Advisor Header with Multi-Persona Badge */}
      <div className={`p-4 bg-gradient-to-r ${currentRoleMeta.gradient} text-white flex items-center justify-between border-b border-white/10 transition-all duration-300`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center font-bold shadow-xs border border-white/20">
            {currentRoleMeta.icon}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-white">{currentRoleMeta.name}</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/20 text-white border border-white/25">
                {preferredModel}
              </span>
            </div>
            <p className="text-[11px] text-white/80 mt-0.5">
              {currentRoleMeta.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowConfigDrawer(!showConfigDrawer)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors shadow-xs ${
              showConfigDrawer
                ? 'bg-white text-stone-900 border-white'
                : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
            }`}
            title="Configure Model & Persona"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Model & Role</span>
          </button>

          <button
            onClick={handleClearChat}
            className="p-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-xs font-semibold border border-white/20 transition-colors shadow-xs"
            title="Start New Conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsInquiryModalOpen(true)}
            className="px-2.5 py-1.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1 border border-amber-300/30 transition-colors shadow-xs"
            title="Submit inquiry to Admin"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden md:inline">Admin Help</span>
          </button>

          <div className="text-right text-xs bg-black/25 px-2.5 py-1 rounded-lg border border-white/15">
            <span className="text-[10px] text-white/70">Lang: </span>
            <span className="font-bold text-white uppercase">{language}</span>
          </div>
        </div>
      </div>

      {/* 2. Collapsible Persona & Model Selector Tray */}
      {showConfigDrawer && (
        <div className="p-3 bg-stone-50 border-b border-stone-200 space-y-3 animate-in fade-in duration-200">
          {/* Persona Selection */}
          <div>
            <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1.5">
              Select Specialist Role Persona:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {ROLES.map((r) => {
                const isSelected = activeRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleRoleSelect(r.id)}
                    className={`p-2 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white/80 border-stone-200 hover:bg-white text-stone-700'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1">
                      <span className={isSelected ? 'text-emerald-700' : 'text-stone-500'}>{r.icon}</span>
                      <span className="font-bold truncate text-[11px]">{r.name}</span>
                    </div>
                    <span className="text-[10px] text-stone-500 leading-tight line-clamp-2">{r.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model & Task Tier Selection */}
          <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-stone-500" />
                Model Tier:
              </span>
              <div className="flex items-center space-x-1.5">
                {MODEL_TIERS.map((tierObj) => {
                  const isSelected = preferredModel === tierObj.model;
                  return (
                    <button
                      key={tierObj.model}
                      onClick={() => {
                        setPreferredModel(tierObj.model);
                        setActiveTier(tierObj.tier);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {tierObj.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-[11px] text-stone-500 italic">
              Multi-turn conversation history is automatically maintained across turns.
            </div>
          </div>
        </div>
      )}

      {/* 3. Visual Insights Quick Action Toolbar */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
            Visual Insights:
          </span>
          <button
            onClick={() => handleSendMessage('Show me the latest Mandi Price Trends and forecast chart for Tomato and Onion')}
            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white hover:bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs transition-all flex items-center gap-1 shrink-0"
          >
            <TrendingUp className="w-3 h-3 text-amber-600" />
            Mandi Price Trends
          </button>
          <button
            onClick={() => handleSendMessage('Suggest high-demand fruits and vegetables for planting with market profit margins')}
            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white hover:bg-blue-50 text-blue-800 border border-blue-200/80 shadow-2xs transition-all flex items-center gap-1 shrink-0"
          >
            <BarChart3 className="w-3 h-3 text-blue-600" />
            High-Demand Crops
          </button>
          <button
            onClick={() => handleSendMessage('Calculate Cold Storage ROI and extra net profit for storing 3 tonnes of produce')}
            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs transition-all flex items-center gap-1 shrink-0"
          >
            <DollarSign className="w-3 h-3 text-emerald-600" />
            Storage ROI Matrix
          </button>
        </div>

        <div className="text-[11px] text-stone-500 shrink-0 hidden sm:block">
          Active Role: <span className="font-bold text-stone-800">{currentRoleMeta.name}</span>
        </div>
      </div>

      {/* 4. Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-2.5 max-w-3xl ${
              m.role === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                m.role === 'user'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-emerald-800 shadow-2xs'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div
              className={`p-4 rounded-2xl text-xs leading-relaxed space-y-2.5 ${
                m.role === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-xs shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-800 shadow-2xs rounded-tl-xs'
              }`}
            >
              {/* Role & Model Tag on AI messages */}
              {m.role === 'model' && (
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-stone-100 text-[10px] text-stone-500">
                  <div className="flex items-center space-x-1.5 font-semibold text-emerald-900">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>{ROLES.find((r) => r.id === m.roleId)?.name || 'AgriSaarthi Advisor'}</span>
                  </div>
                  {m.modelUsed && (
                    <span className="px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded-md font-mono text-[9px] border border-stone-200">
                      {m.modelUsed}
                    </span>
                  )}
                </div>
              )}

              {/* Formatted Text */}
              <div className="whitespace-pre-wrap space-y-1.5">
                {m.text.split('\n\n').map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              {/* Render Visualization Chart if Present */}
              {m.visualPayload && (
                <div className="mt-3 pt-3 border-t border-gray-100 bg-slate-50/80 rounded-xl p-3 text-gray-900 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
                      {m.visualPayload.title}
                    </span>
                  </div>
                  {m.visualPayload.description && (
                    <p className="text-[11px] text-gray-500 mb-2">{m.visualPayload.description}</p>
                  )}

                  {/* Mandi Price Trend Chart */}
                  {m.visualPayload.type === 'mandi_trend' && (
                    <div className="w-full h-56 pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={m.visualPayload.data}>
                          <defs>
                            <linearGradient id="colorTomatoChat" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="colorOnionChat" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit="₹" />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, fontSize: 12 }}
                            formatter={(val: any) => [`₹${val}/Q`, 'Modal Price']}
                          />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Area
                            type="monotone"
                            dataKey="Tomato"
                            stroke="#ef4444"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorTomatoChat)"
                          />
                          <Area
                            type="monotone"
                            dataKey="Onion"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorOnionChat)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* High-Demand Produce Bar Chart */}
                  {m.visualPayload.type === 'demand_bar' && (
                    <div className="w-full h-56 pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={m.visualPayload.data}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" height={40} />
                          <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, fontSize: 12 }}
                            formatter={(val: any, name: any) => [
                              name === 'demand' ? `${val} / 100 Index` : `₹${val} Lakh/Acre`,
                              name === 'demand' ? 'Demand Index' : 'Est. Profit',
                            ]}
                          />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="demand" name="Demand Index (0-100)" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Cold Storage ROI Chart */}
                  {m.visualPayload.type === 'storage_roi' && (
                    <div className="w-full h-52 pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={m.visualPayload.data}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="stage" tick={{ fontSize: 9, fill: '#64748b' }} />
                          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit="₹" />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, fontSize: 12 }}
                            formatter={(val: any) => [`₹${val.toLocaleString()}`, 'Value']}
                          />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="revenue" name="Gross Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="netProfit" name="Net In-Hand Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}

              {/* Follow-up Suggestion Chips */}
              {m.role === 'model' && m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                <div className="pt-2 mt-2 border-t border-stone-100 space-y-1.5">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                    <MessageSquareQuote className="w-3 h-3 text-emerald-600" />
                    Suggested Next Questions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {m.suggestedFollowUps.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(suggestion)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 transition-colors text-left font-medium"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Actions Bar */}
              <div className="flex items-center justify-between text-[10px] opacity-70 pt-1.5 border-t border-current/10">
                <span>{m.timestamp}</span>
                {m.role === 'model' && (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleCopyText(m.id, m.text)}
                      className="hover:opacity-100 flex items-center space-x-1 font-semibold transition-opacity"
                      title="Copy response"
                    >
                      {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => speakText(m.text)}
                      className="hover:opacity-100 flex items-center space-x-1 font-semibold transition-opacity"
                      title="Listen to readout"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2.5 text-xs text-stone-600 p-3 bg-white border border-stone-200 rounded-2xl w-fit shadow-2xs">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Consulting {preferredModel} & agronomic knowledge base...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 5. Role Suggested Prompt Chips */}
      <div className="px-4 py-2 bg-white border-t border-stone-100 flex items-center space-x-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider shrink-0">
          {currentRoleMeta.name} Prompts:
        </span>
        {currentRoleMeta.defaultSuggestions.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] px-3 py-1 rounded-full bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 text-stone-700 border border-stone-200 whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* 6. Input Form */}
      <div className="p-4 bg-white border-t border-stone-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-2.5 rounded-xl border transition-colors ${
              isListening
                ? 'bg-red-500 text-white border-red-600 animate-pulse'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border-stone-300'
            }`}
            title="Voice input in your language"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            placeholder={`Ask ${currentRoleMeta.name} or type in Tamil / Hindi / English (e.g. Mandi Price trends, cold storage ROI)...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />

          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 7. Inquiry Chatbot Modal */}
      <InquiryChatbotModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        defaultCategory="GENERAL"
      />
    </div>
  );
};
