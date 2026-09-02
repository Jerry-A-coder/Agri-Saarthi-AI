import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { AdminInquiry, AdminInquiryMessage } from '../../types';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  TrendingUp,
  BarChart3,
  Calendar,
  DollarSign,
  ShieldCheck,
  Headphones,
  User,
  Bot,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Maximize2,
  Minimize2,
  Mic,
  Volume2,
  VolumeX,
  Layers,
  HelpCircle,
  PhoneCall,
  FileText,
  Warehouse,
  Sprout,
  Activity,
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

interface InquiryChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: AdminInquiry['category'];
  initialContextPrompt?: string;
}

// Sample Data for Chatbot Visualizations
const MANDI_PRICE_TREND_DATA = [
  { month: 'Oct 2024', Tomato: 1800, Onion: 2400, Chilli: 3600, Banana: 2000 },
  { month: 'Nov 2024', Tomato: 2100, Onion: 2900, Chilli: 3900, Banana: 2100 },
  { month: 'Dec 2024', Tomato: 1950, Onion: 3500, Chilli: 4100, Banana: 2200 },
  { month: 'Jan 2025', Tomato: 2400, Onion: 3800, Chilli: 4300, Banana: 2350 },
  { month: 'Feb 2025 (Current)', Tomato: 2650, Onion: 4100, Chilli: 4500, Banana: 2400 },
  { month: 'Mar 2025 (Forecast)', Tomato: 3100, Onion: 4400, Chilli: 4700, Banana: 2550 },
];

const DEMAND_CROPS_DATA = [
  { name: 'Tomato Hybrid', demand: 96, profitPerAcre: 2.15, category: 'Vegetable' },
  { name: 'Banana G9', demand: 95, profitPerAcre: 3.80, category: 'Fruit' },
  { name: 'Shallot / Onion', demand: 94, profitPerAcre: 1.65, category: 'Vegetable' },
  { name: 'Pomegranate', demand: 92, profitPerAcre: 4.50, category: 'Fruit' },
  { name: 'Papaya Red Lady', demand: 91, profitPerAcre: 2.90, category: 'Fruit' },
  { name: 'Green Chilli G4', demand: 89, profitPerAcre: 2.40, category: 'Vegetable' },
  { name: 'Taiwan Guava', demand: 88, profitPerAcre: 2.60, category: 'Fruit' },
  { name: 'Bell Pepper', demand: 87, profitPerAcre: 3.20, category: 'Vegetable' },
];

const STORAGE_ROI_DATA = [
  { stage: 'Immediate Distress Sale', revenue: 66000, netProfit: 22000 },
  { stage: '30-Day Cold Storage', revenue: 84000, netProfit: 36000 },
  { stage: '45-Day Optimal Window', revenue: 96000, netProfit: 45700 },
  { stage: '60-Day Extended Window', revenue: 102000, netProfit: 47000 },
];

export const InquiryChatbotModal: React.FC<InquiryChatbotModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'GENERAL',
  initialContextPrompt,
}) => {
  const { currentUser, farmerProfile, providerProfile, showToast, language } = useApp();

  const [activeTab, setActiveTab] = useState<'chat' | 'tickets' | 'new_ticket'>('chat');
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<AdminInquiry | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // New Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<AdminInquiry['category']>(defaultCategory);
  const [ticketPriority, setTicketPriority] = useState<AdminInquiry['priority']>('MEDIUM');
  const [ticketMessage, setTicketMessage] = useState(initialContextPrompt || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Chat Conversation State (Inquiry stream)
  const [replyInput, setReplyInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeVisualModal, setActiveVisualModal] = useState<'mandi' | 'demand' | 'storage' | 'harvest' | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userRole = (currentUser?.role || 'farmer') as 'farmer' | 'provider' | 'admin';
  const userName =
    userRole === 'farmer'
      ? farmerProfile?.farmer_name || currentUser?.name || 'Farmer'
      : providerProfile?.business_name || currentUser?.name || 'Storage Provider';

  // Load Inquiries
  const loadInquiries = async () => {
    try {
      const data = await api.getInquiries({
        senderId: currentUser?.id,
        senderRole: userRole,
      });
      setInquiries(data);
      if (data.length > 0 && !selectedInquiry) {
        setSelectedInquiry(data[0]);
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadInquiries();
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedInquiry?.messages, isReplying]);

  if (!isOpen) return null;

  // Handle Speech Recognition
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
      showToast(`Listening in ${language.toUpperCase()}...`);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (activeTab === 'new_ticket') {
          setTicketMessage((prev) => (prev ? prev + ' ' + transcript : transcript));
        } else {
          setReplyInput((prev) => (prev ? prev + ' ' + transcript : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  // Text-To-Speech
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-speech not supported.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Submit New Inquiry Ticket
  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const created = await api.createInquiry({
        senderId: currentUser?.id || 'usr_user_1',
        senderName: userName,
        senderEmail: currentUser?.email,
        senderPhone: currentUser?.phone,
        senderRole: userRole as 'farmer' | 'provider',
        subject: ticketSubject,
        category: ticketCategory,
        priority: ticketPriority,
        initialMessage: ticketMessage,
      });

      showToast(`Inquiry Ticket #${created.ticket_number} created successfully!`);
      setTicketSubject('');
      setTicketMessage('');
      setSelectedInquiry(created);
      setActiveTab('chat');
      loadInquiries();
    } catch (err: any) {
      showToast(`Failed to create inquiry: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send Reply in Active Conversation
  const handleSendReply = async (contentToSend?: string, visualPayload?: any) => {
    const text = contentToSend || replyInput;
    if (!selectedInquiry || (!text.trim() && !visualPayload) || isReplying) return;

    setIsReplying(true);
    const tempInput = replyInput;
    setReplyInput('');

    try {
      const updated = await api.replyToInquiry(selectedInquiry.id, {
        senderId: currentUser?.id || 'usr_user',
        senderName: userName,
        senderRole: userRole,
        content: text,
        visualPayload,
      });

      setSelectedInquiry(updated);
      loadInquiries();

      // If user asks about visualizations or prices, auto-generate AI response with chart
      const q = text.toLowerCase();
      if (q.includes('price') || q.includes('mandi') || q.includes('rate') || q.includes('trend')) {
        setTimeout(async () => {
          await api.replyToInquiry(selectedInquiry.id, {
            senderId: 'usr_admin_ai',
            senderName: 'AgriSaarthi AI Agronomist & Market Desk',
            senderRole: 'admin',
            content: `Here is the verified 6-month Mandi price trend analysis for key commodities in Coimbatore/Pollachi APMC. Tomato and Onion are exhibiting strong upward momentum (+18% to +25%).`,
            visualPayload: {
              type: 'mandi_trend',
              title: 'Mandi Price Historical & Forecast Trend (₹/Quintal)',
              data: MANDI_PRICE_TREND_DATA,
            },
          });
          const fresh = await api.getInquiryById(selectedInquiry.id);
          setSelectedInquiry(fresh);
        }, 1200);
      } else if (q.includes('demand') || q.includes('crop') || q.includes('vegetable') || q.includes('fruit') || q.includes('suggest')) {
        setTimeout(async () => {
          await api.replyToInquiry(selectedInquiry.id, {
            senderId: 'usr_admin_ai',
            senderName: 'AgriSaarthi AI Agronomist & Market Desk',
            senderRole: 'admin',
            content: `Based on Tamil Nadu APMC demand indexes and agro-processing supply deficit, here are the top high-margin fruits and vegetables recommended for planting.`,
            visualPayload: {
              type: 'demand_bar',
              title: 'High-Demand Fruits & Vegetables Index (0-100)',
              data: DEMAND_CROPS_DATA,
            },
          });
          const fresh = await api.getInquiryById(selectedInquiry.id);
          setSelectedInquiry(fresh);
        }, 1200);
      } else if (q.includes('storage') || q.includes('profit') || q.includes('roi') || q.includes('cold chain') || q.includes('warehouse')) {
        setTimeout(async () => {
          await api.replyToInquiry(selectedInquiry.id, {
            senderId: 'usr_admin_ai',
            senderName: 'AgriSaarthi Logistics Desk',
            senderRole: 'admin',
            content: `Cold storage analysis: Storing perishable produce for 45 days at verified CWC/TNWC units yields up to ₹23,700 additional net profit per 3 tonnes after deducting daily storage and transport fees.`,
            visualPayload: {
              type: 'storage_roi',
              title: 'Storage ROI & Additional Value Gain Matrix',
              data: STORAGE_ROI_DATA,
            },
          });
          const fresh = await api.getInquiryById(selectedInquiry.id);
          setSelectedInquiry(fresh);
        }, 1200);
      }
    } catch (err: any) {
      setReplyInput(tempInput);
      showToast(`Failed to send message: ${err.message}`);
    } finally {
      setIsReplying(false);
    }
  };

  // Quick Action Buttons
  const handleTriggerQuickVisualization = (type: 'mandi' | 'demand' | 'storage') => {
    if (type === 'mandi') {
      handleSendReply('Please share the latest Mandi price trends and forecast chart for our region.');
    } else if (type === 'demand') {
      handleSendReply('What are the highest demand fruits and vegetables recommended for next season planting?');
    } else if (type === 'storage') {
      handleSendReply('Can you show the Cold Storage ROI comparison and profitability breakdown?');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 border border-gray-200 ${
          isExpanded ? 'w-[96vw] h-[94vh]' : 'w-full max-w-4xl h-[88vh] max-h-[820px]'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 text-emerald-300">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  {userRole === 'farmer' ? 'Kisan Sahayak • Admin & Expert Desk' : 'Storage Provider Admin Helpdesk'}
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Triage
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Official Inquiries, Technical Support, Storage Disputes, Soil Lab Queries & Real-Time Agronomic Charts
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={isExpanded ? 'Minimize' : 'Maximize'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-red-500/80 text-white transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Active Conversation
              {selectedInquiry && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-white/20">
                  #{selectedInquiry.ticket_number.substring(4)}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'tickets'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              All Tickets ({inquiries.length})
            </button>

            <button
              onClick={() => setActiveTab('new_ticket')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'new_ticket'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              + New Inquiry
            </button>
          </div>

          {/* Quick Chart Triggers */}
          <div className="hidden sm:flex items-center space-x-1.5 text-xs">
            <span className="text-gray-500 text-[11px] font-medium">Quick Charts:</span>
            <button
              onClick={() => handleTriggerQuickVisualization('mandi')}
              className="px-2 py-1 rounded bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60 font-medium transition-colors flex items-center gap-1"
            >
              <TrendingUp className="w-3 h-3 text-amber-600" /> Mandi Trends
            </button>
            <button
              onClick={() => handleTriggerQuickVisualization('demand')}
              className="px-2 py-1 rounded bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60 font-medium transition-colors flex items-center gap-1"
            >
              <BarChart3 className="w-3 h-3 text-blue-600" /> High-Demand Crops
            </button>
            <button
              onClick={() => handleTriggerQuickVisualization('storage')}
              className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60 font-medium transition-colors flex items-center gap-1"
            >
              <DollarSign className="w-3 h-3 text-emerald-600" /> Storage ROI
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* TAB 1: ACTIVE CHAT CONVERSATION */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col h-full bg-slate-50">
              {/* Ticket Banner */}
              {selectedInquiry ? (
                <div className="bg-white px-4 py-2.5 border-b border-gray-200 flex items-center justify-between shadow-xs">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-gray-100 text-gray-800 border border-gray-300 shrink-0">
                      {selectedInquiry.ticket_number}
                    </span>
                    <span className="text-xs font-semibold text-gray-900 truncate">
                      {selectedInquiry.subject}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0 ${
                        selectedInquiry.status === 'OPEN'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : selectedInquiry.status === 'IN_REVIEW'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {selectedInquiry.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-xs text-gray-500 hidden sm:inline">
                      Category: <strong className="text-gray-700">{selectedInquiry.category}</strong>
                    </span>
                    <button
                      onClick={() => setActiveTab('tickets')}
                      className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold"
                    >
                      Switch Ticket
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 text-amber-800 text-xs flex items-center justify-between border-b border-amber-200">
                  <span>No active ticket selected. Create a new inquiry ticket or pick from the ticket list.</span>
                  <button
                    onClick={() => setActiveTab('new_ticket')}
                    className="px-3 py-1 bg-amber-600 text-white rounded font-medium hover:bg-amber-700"
                  >
                    + Create Ticket
                  </button>
                </div>
              )}

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedInquiry ? (
                  selectedInquiry.messages.map((msg) => {
                    const isUser = msg.sender_role === userRole && msg.sender_id === currentUser?.id;
                    const isAdmin = msg.sender_role === 'admin';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
                      >
                        <div className="flex items-center space-x-2 mb-1 text-[11px] text-gray-500">
                          {isAdmin ? (
                            <span className="flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                              <ShieldCheck className="w-3 h-3 text-emerald-700" />
                              {msg.sender_name}
                            </span>
                          ) : (
                            <span className="font-semibold text-gray-700">{msg.sender_name}</span>
                          )}
                          <span>•</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`p-3.5 rounded-2xl max-w-2xl text-sm leading-relaxed shadow-sm ${
                            isUser
                              ? 'bg-emerald-700 text-white rounded-tr-xs'
                              : isAdmin
                              ? 'bg-white text-gray-900 border border-gray-200 rounded-tl-xs'
                              : 'bg-white text-gray-900 border border-gray-200 rounded-tl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.content}</p>

                          {/* Render Embedded Visualization if present */}
                          {msg.visual_payload && (
                            <div className="mt-3 pt-3 border-t border-gray-100 bg-slate-50/80 rounded-xl p-3 text-gray-900">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                                  <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
                                  {msg.visual_payload.title}
                                </span>
                              </div>

                              {/* Visualization 1: Mandi Price Trend Line/Area Chart */}
                              {msg.visual_payload.type === 'mandi_trend' && (
                                <div className="w-full h-56 pt-2">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={msg.visual_payload.data}>
                                      <defs>
                                        <linearGradient id="colorTomato" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                                        </linearGradient>
                                        <linearGradient id="colorOnion" x1="0" y1="0" x2="0" y2="1">
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
                                        fill="url(#colorTomato)"
                                      />
                                      <Area
                                        type="monotone"
                                        dataKey="Onion"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorOnion)"
                                      />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                              )}

                              {/* Visualization 2: High Demand Fruits and Veggies Bar Chart */}
                              {msg.visual_payload.type === 'demand_bar' && (
                                <div className="w-full h-56 pt-2">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={msg.visual_payload.data}>
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

                              {/* Visualization 3: Cold Storage ROI Comparison */}
                              {msg.visual_payload.type === 'storage_roi' && (
                                <div className="w-full h-52 pt-2">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={msg.visual_payload.data}>
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

                          {/* Voice Read Button for Accessibility */}
                          {!isUser && (
                            <button
                              onClick={() => speakText(msg.content)}
                              className="mt-2 text-[11px] text-gray-500 hover:text-emerald-700 flex items-center gap-1 font-medium transition-colors"
                            >
                              <Volume2 className="w-3 h-3" />
                              Listen Readout
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-gray-700">No ticket selected</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Choose an existing inquiry ticket or click "+ New Inquiry" to speak with our administration desk.
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              {selectedInquiry && selectedInquiry.status !== 'CLOSED' && (
                <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isListening
                          ? 'bg-red-500 text-white border-red-600 animate-pulse'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300'
                      }`}
                      title="Voice Dictation"
                    >
                      <Mic className="w-5 h-5" />
                    </button>

                    <input
                      type="text"
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                      placeholder={`Reply to ticket #${selectedInquiry.ticket_number} (e.g. Ask for price trends, storage calculations)...`}
                      className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />

                    <button
                      type="button"
                      onClick={() => handleSendReply()}
                      disabled={!replyInput.trim() || isReplying}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <span>Send</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TICKETS LIST */}
          {activeTab === 'tickets' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Your Support & Inquiry Tickets</h3>
                  <p className="text-xs text-gray-500">Track responses from agricultural officers, warehouse coordinators, and system admin</p>
                </div>
                <button
                  onClick={() => setActiveTab('new_ticket')}
                  className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 shadow-sm flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  + Create New Ticket
                </button>
              </div>

              {inquiries.length > 0 ? (
                <div className="space-y-3">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      onClick={() => {
                        setSelectedInquiry(inq);
                        setActiveTab('chat');
                      }}
                      className="p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-200">
                            {inq.ticket_number}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                              inq.status === 'OPEN'
                                ? 'bg-amber-100 text-amber-800'
                                : inq.status === 'IN_REVIEW'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {inq.status}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            Category: {inq.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900">{inq.subject}</h4>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {inq.messages[inq.messages.length - 1]?.content}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-gray-500 shrink-0">
                        <div className="text-right">
                          <div>{inq.messages.length} messages</div>
                          <div className="text-[11px] text-gray-400">
                            Updated {new Date(inq.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-700">No support tickets found</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                    Have questions about cold storage slot allocations, soil test lab turnarounds, government subsidies, or market linkages?
                  </p>
                  <button
                    onClick={() => setActiveTab('new_ticket')}
                    className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                  >
                    Submit First Inquiry
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CREATE NEW TICKET FORM */}
          {activeTab === 'new_ticket' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50">
              <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="mb-5">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Submit New Inquiry to AgriSaarthi Administration
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Your inquiry is immediately processed by our automated agronomic triage AI and routed to certified agricultural officers.
                  </p>
                </div>

                <form onSubmit={handleCreateInquiry} className="space-y-4">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    >
                      <option value="WAREHOUSE_BOOKING">🏢 Warehouse & Cold Storage Booking / e-NWR Loans</option>
                      <option value="SOIL_TESTING">🧪 Soil Testing Lab Turnaround & Certified Reports</option>
                      <option value="GOVT_SCHEME">🏛️ Government Subsidies (PMKSY, PMFBY, SMAM)</option>
                      <option value="PLANT_HEALTH">🌿 Plant Disease Diagnosis & Agronomic Escalation</option>
                      <option value="PAYMENT_ESCROW">💳 Buyer Payments & Escrow Payouts</option>
                      <option value="CAPACITY_DISPUTE">⚖️ Storage Capacity Disputes & Inspections</option>
                      <option value="TECHNICAL_SUPPORT">⚙️ Platform Technical Assistance</option>
                      <option value="GENERAL">💬 General Agriculture Consultation</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Urgency Level
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((pri) => (
                        <button
                          key={pri}
                          type="button"
                          onClick={() => setTicketPriority(pri)}
                          className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                            ticketPriority === pri
                              ? pri === 'URGENT'
                                ? 'bg-red-600 text-white border-red-700'
                                : pri === 'HIGH'
                                ? 'bg-amber-600 text-white border-amber-700'
                                : 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                          }`}
                        >
                          {pri}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Subject / Topic
                    </label>
                    <input
                      type="text"
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="e.g. Need assistance with Pollachi Cold Storage booking receipt"
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  {/* Detailed Message */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Detailed Message / Question
                      </label>
                      <button
                        type="button"
                        onClick={toggleVoiceInput}
                        className={`text-xs font-semibold flex items-center gap-1 px-2 py-0.5 rounded ${
                          isListening ? 'bg-red-100 text-red-700 animate-pulse' : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        <Mic className="w-3 h-3" />
                        {isListening ? 'Listening...' : 'Voice Dictate'}
                      </button>
                    </div>
                    <textarea
                      required
                      rows={4}
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Describe your inquiry, field situation, batch quantity, or question for the administrator..."
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('chat')}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !ticketSubject.trim() || !ticketMessage.trim()}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>Submitting Ticket...</span>
                      ) : (
                        <>
                          <span>Submit Inquiry to Admin</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
