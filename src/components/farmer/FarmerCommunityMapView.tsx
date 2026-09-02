import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  FarmerPeerProfile,
  FarmingKnowledgeNode,
  CommunityOptInSettings,
  KnowledgeNodeCategory,
  CommunityCollaborationType,
  FarmingMethodology,
  Warehouse,
} from '../../types';
import {
  Users,
  MapPin,
  Search,
  Filter,
  ShieldCheck,
  Award,
  Sparkles,
  Tractor,
  Sprout,
  Share2,
  Phone,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  Send,
  Plus,
  Compass,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Settings,
  Layers,
  Warehouse as WarehouseIcon,
  RefreshCw,
  Clock,
  BookOpen,
  HelpCircle,
  X,
  ExternalLink,
  ChevronDown,
  Navigation,
  Check,
  Flame,
} from 'lucide-react';

const CATEGORY_META: Record<
  KnowledgeNodeCategory,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  PEST_ALERT: {
    label: 'Pest Outbreak Alert',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-300',
    icon: '🐛',
  },
  BIO_RECIPE: {
    label: 'Organic Bio-Formulation',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    icon: '🌿',
  },
  EQUIPMENT_COOP: {
    label: 'Machinery & Tractor Sharing',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-300',
    icon: '🚜',
  },
  SOIL_WATER: {
    label: 'Soil & Water Conservation',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-300',
    icon: '💧',
  },
  SEED_VARIETY: {
    label: 'Indigenous Seed Exchange',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-300',
    icon: '🌱',
  },
  MARKET_AGGREGATION: {
    label: 'Joint Mandi Transport Route',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-300',
    icon: '🚛',
  },
  WEATHER_ANOMALY: {
    label: 'Micro-Climate Observation',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-300',
    icon: '⛅',
  },
};

const COLLABORATION_TYPES: CommunityCollaborationType[] = [
  'Machinery / Tractor Sharing',
  'Indigenous Seed & Sapling Exchange',
  'Crop Advisory & Mentorship',
  'Joint Transport & Mandi Aggregation',
  'Borewell / Water Sharing',
  'Bio-Input Bulk Preparation',
];

const FARMING_METHODS: FarmingMethodology[] = [
  '100% Certified Organic',
  'Natural Farming (ZBNF)',
  'Integrated Pest Management (IPM)',
  'Precision Conventional',
  'Permaculture / Agroforestry',
];

export const FarmerCommunityMapView: React.FC = () => {
  const { currentLocation, currentUser, farmerProfile, showToast } = useApp();

  // Active Map Layer toggles
  const [activeLayers, setActiveLayers] = useState<{
    peers: boolean;
    knowledgeNodes: boolean;
    warehouses: boolean;
  }>({
    peers: true,
    knowledgeNodes: true,
    warehouses: true,
  });

  // Main data states
  const [peers, setPeers] = useState<FarmerPeerProfile[]>([]);
  const [knowledgeNodes, setKnowledgeNodes] = useState<FarmingKnowledgeNode[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [optInSettings, setOptInSettings] = useState<CommunityOptInSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedMethod, setSelectedMethod] = useState('All');
  const [selectedCollab, setSelectedCollab] = useState('All');
  const [selectedNodeCategory, setSelectedNodeCategory] = useState<string>('ALL');
  const [radiusKm, setRadiusKm] = useState(50);
  const [viewTab, setViewTab] = useState<'map' | 'peers-list' | 'nodes-feed'>('map');

  // Selected item on map or list
  const [selectedPeer, setSelectedPeer] = useState<FarmerPeerProfile | null>(null);
  const [selectedNode, setSelectedNode] = useState<FarmingKnowledgeNode | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  // Modals
  const [isOptInModalOpen, setIsOptInModalOpen] = useState(false);
  const [isNewNodeModalOpen, setIsNewNodeModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageTargetPeer, setMessageTargetPeer] = useState<FarmerPeerProfile | null>(null);

  // Opt-in form state
  const [optInForm, setOptInForm] = useState<CommunityOptInSettings>({
    opted_in: true,
    display_name: farmerProfile?.farmer_name || 'Murugan Palaniswamy',
    display_mode: 'FULL_NAME',
    share_phone: true,
    phone: currentUser?.phone || '+91 98421 87654',
    primary_crops: farmerProfile?.primary_crops || ['Tomato', 'Small Onion', 'Banana'],
    farming_method: '100% Certified Organic',
    land_area_acres: farmerProfile?.total_land_acres || 6.5,
    specialties: ['Drip Irrigation', 'Desi Cow Panchagavya', 'Pest Bio-Control'],
    available_for: [
      'Machinery / Tractor Sharing',
      'Indigenous Seed & Sapling Exchange',
      'Crop Advisory & Mentorship',
    ],
    equipment_available: ['Rotavator Implement', 'Battery Sprayer (x2)'],
    bio: 'Certified organic grower in Pollachi basin. Open to seed exchange and collaborative tractor sharing.',
    village: farmerProfile?.village || 'Pollachi Rural',
    taluk: farmerProfile?.taluk || 'Pollachi',
    district: farmerProfile?.district || 'Coimbatore',
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
  });

  // Message Form State
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messageInquiryType, setMessageInquiryType] = useState<CommunityCollaborationType | 'General Discussion'>('Machinery / Tractor Sharing');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // New Node Form State
  const [newNodeCategory, setNewNodeCategory] = useState<KnowledgeNodeCategory>('PEST_ALERT');
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [newNodeContent, setNewNodeContent] = useState('');
  const [newNodeTip, setNewNodeTip] = useState('');
  const [newNodeUrgency, setNewNodeUrgency] = useState<'HIGH_ALERT' | 'SEASONAL_TIP' | 'BEST_PRACTICE'>('HIGH_ALERT');
  const [newNodeCrops, setNewNodeCrops] = useState('Tomato, Chilli, Onion');
  const [newNodeTags, setNewNodeTags] = useState('Pest Alert, Local Observation');
  const [isCreatingNode, setIsCreatingNode] = useState(false);

  // Fetch all map layer data
  const loadCommunityData = async () => {
    setLoading(true);
    try {
      const [peerList, nodeList, whList, optIn] = await Promise.all([
        api.getNearbyPeers({
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
          radius: radiusKm,
          crop: selectedCrop === 'All' ? undefined : selectedCrop,
          method: selectedMethod === 'All' ? undefined : selectedMethod,
          collaboration: selectedCollab === 'All' ? undefined : selectedCollab,
          search: searchQuery || undefined,
        }),
        api.getKnowledgeNodes({
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
          radius: radiusKm + 20,
          category: selectedNodeCategory === 'ALL' ? undefined : selectedNodeCategory,
          crop: selectedCrop === 'All' ? undefined : selectedCrop,
          search: searchQuery || undefined,
        }),
        api.getWarehouses({
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
          radius: radiusKm,
        }),
        api.getCommunityOptInSettings(currentUser?.id || 'usr_farmer_1'),
      ]);

      setPeers(peerList);
      setKnowledgeNodes(nodeList);
      setWarehouses(whList);
      if (optIn) {
        setOptInSettings(optIn);
        setOptInForm(optIn);
      }
    } catch (err) {
      console.error('Error loading community data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunityData();
  }, [currentLocation, radiusKm, selectedCrop, selectedMethod, selectedCollab, selectedNodeCategory]);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCommunityData();
  };

  // Upvote Knowledge Node
  const handleUpvote = async (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.upvoteKnowledgeNode(nodeId, currentUser?.id || 'usr_farmer_1');
      if (res.success) {
        setKnowledgeNodes((prev) =>
          prev.map((n) => (n.id === nodeId ? { ...n, upvotes: res.upvotes, has_upvoted: res.has_upvoted } : n))
        );
        if (selectedNode?.id === nodeId) {
          setSelectedNode((prev) => (prev ? { ...prev, upvotes: res.upvotes, has_upvoted: res.has_upvoted } : null));
        }
        showToast(res.has_upvoted ? 'Upvoted knowledge node!' : 'Removed upvote');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Opt-in Settings
  const handleSaveOptIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateCommunityOptInSettings(currentUser?.id || 'usr_farmer_1', optInForm);
      setOptInSettings(updated);
      setIsOptInModalOpen(false);
      showToast(updated.opted_in ? 'Community profile updated and visible on map!' : 'Opted out of community map layer');
      loadCommunityData();
    } catch (err) {
      console.error(err);
      showToast('Failed to update community opt-in settings');
    }
  };

  // Submit Peer Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageTargetPeer) return;
    setIsSendingMessage(true);
    try {
      await api.sendPeerMessage({
        from_farmer_id: currentUser?.id || 'usr_farmer_1',
        from_farmer_name: farmerProfile?.farmer_name || 'Murugan Palaniswamy',
        to_peer_id: messageTargetPeer.user_id,
        to_peer_name: messageTargetPeer.name,
        subject: messageSubject,
        message: messageBody,
        inquiry_type: messageInquiryType,
        contact_phone: optInSettings?.share_phone ? optInSettings.phone : undefined,
      });

      showToast(`Message sent to ${messageTargetPeer.name}! They will receive an in-app notification.`);
      setIsMessageModalOpen(false);
      setMessageSubject('');
      setMessageBody('');
    } catch (err) {
      console.error(err);
      showToast('Failed to send message.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Create Knowledge Node
  const handleCreateKnowledgeNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeTitle || !newNodeContent) {
      showToast('Please provide a title and detailed observation.');
      return;
    }
    setIsCreatingNode(true);
    try {
      const cropsArr = newNodeCrops.split(',').map((c) => c.trim()).filter(Boolean);
      const tagsArr = newNodeTags.split(',').map((t) => t.trim()).filter(Boolean);

      const created = await api.createKnowledgeNode({
        author_id: currentUser?.id || 'usr_farmer_1',
        author_name: farmerProfile?.farmer_name || 'Murugan Palaniswamy',
        author_village: farmerProfile?.village || 'Pollachi Rural',
        author_avatar: '👨‍🌾',
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        category: newNodeCategory,
        title: newNodeTitle,
        content: newNodeContent,
        actionable_tip: newNodeTip,
        urgency_level: newNodeUrgency,
        crops_relevant: cropsArr,
        tags: tagsArr,
      });

      setKnowledgeNodes([created, ...knowledgeNodes]);
      setIsNewNodeModalOpen(false);
      setNewNodeTitle('');
      setNewNodeContent('');
      setNewNodeTip('');
      showToast('Observation published to community knowledge map!');
    } catch (err) {
      console.error(err);
      showToast('Failed to publish knowledge node.');
    } finally {
      setIsCreatingNode(false);
    }
  };

  // Map coordinate bounds for simulation canvas
  const centerLat = currentLocation.latitude || 10.6586;
  const centerLng = currentLocation.longitude || 77.0089;
  const latDelta = 0.45; // ~50km viewport
  const lngDelta = 0.45;

  const projectToMap = (lat: number, lng: number) => {
    const xPercent = Math.max(5, Math.min(95, ((lng - (centerLng - lngDelta / 2)) / lngDelta) * 100));
    const yPercent = Math.max(5, Math.min(95, (1 - (lat - (centerLat - latDelta / 2)) / latDelta) * 100));
    return { left: `${xPercent}%`, top: `${yPercent}%` };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Community Overview & Opt-In Status */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 rounded-2xl p-6 text-white shadow-md border border-emerald-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>Farmer Community & Knowledge Map Layer</span>
                  <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 shadow-xs">
                    Live Peer GIS
                  </span>
                </h1>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Connect with verified nearby farmers in {currentLocation.district} to share equipment, exchange heirloom seeds, pool mandi transport, and view crowdsourced local pest alerts.
                </p>
              </div>
            </div>
          </div>

          {/* Opt-in Status pill and Action Button */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-700/60 flex items-center space-x-3 text-xs">
              <div className={`w-3 h-3 rounded-full ${optInSettings?.opted_in ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'}`} />
              <div>
                <p className="text-[10px] text-emerald-300 uppercase font-bold">Your Visibility</p>
                <p className="font-extrabold text-white text-xs">
                  {optInSettings?.opted_in ? 'Opted-In (Visible to Peers)' : 'Private (Opted-Out)'}
                </p>
              </div>
            </div>

            <button
              id="opt-in-settings-btn"
              onClick={() => setIsOptInModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold text-xs shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-emerald-700" />
              <span>{optInSettings?.opted_in ? 'Manage Privacy & Opt-in' : 'Join Community Map'}</span>
            </button>

            <button
              id="create-knowledge-node-btn"
              onClick={() => setIsNewNodeModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold text-xs shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post Local Observation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Layer Switcher & Filter Toolbar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-4">
        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">Map Active Layers:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Peer Profiles Layer Toggle */}
            <button
              onClick={() => setActiveLayers({ ...activeLayers, peers: !activeLayers.peers })}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeLayers.peers
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              <span>👨‍🌾</span>
              <span>Nearby Peer Profiles ({peers.length})</span>
              {activeLayers.peers && <Check className="w-3.5 h-3.5" />}
            </button>

            {/* Knowledge Nodes Layer Toggle */}
            <button
              onClick={() => setActiveLayers({ ...activeLayers, knowledgeNodes: !activeLayers.knowledgeNodes })}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeLayers.knowledgeNodes
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              <span>💡</span>
              <span>Farming Knowledge Nodes ({knowledgeNodes.length})</span>
              {activeLayers.knowledgeNodes && <Check className="w-3.5 h-3.5" />}
            </button>

            {/* Warehouses Layer Toggle */}
            <button
              onClick={() => setActiveLayers({ ...activeLayers, warehouses: !activeLayers.warehouses })}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeLayers.warehouses
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              <span>🏢</span>
              <span>Cold Storage & Depots ({warehouses.length})</span>
              {activeLayers.warehouses && <Check className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-bold text-stone-600">
            <button
              onClick={() => setViewTab('map')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewTab === 'map' ? 'bg-white text-emerald-900 shadow-xs' : 'hover:text-stone-900'
              }`}
            >
              🗺️ GIS Map
            </button>
            <button
              onClick={() => setViewTab('peers-list')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewTab === 'peers-list' ? 'bg-white text-emerald-900 shadow-xs' : 'hover:text-stone-900'
              }`}
            >
              👥 Peers ({peers.length})
            </button>
            <button
              onClick={() => setViewTab('nodes-feed')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewTab === 'nodes-feed' ? 'bg-white text-emerald-900 shadow-xs' : 'hover:text-stone-900'
              }`}
            >
              💡 Knowledge Feed ({knowledgeNodes.length})
            </button>
          </div>
        </div>

        {/* Search & Dynamic Filter Controls */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search peer, village, recipe, tractor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Crop Filter */}
          <div>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Commodities</option>
              <option value="Tomato">Tomato</option>
              <option value="Onion">Small Onion / Shallots</option>
              <option value="Banana">Banana</option>
              <option value="Coconut">Coconut</option>
              <option value="Chilli">Green Chilli</option>
              <option value="Maize">Maize / Corn</option>
              <option value="Turmeric">Turmeric</option>
              <option value="Groundnut">Groundnut</option>
            </select>
          </div>

          {/* Farming Methodology Filter */}
          <div>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Farming Methods</option>
              {FARMING_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Collaboration Type Filter */}
          <div>
            <select
              value={selectedCollab}
              onChange={(e) => setSelectedCollab(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Sharing & Exchange</option>
              {COLLABORATION_TYPES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Search Radius */}
          <div>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value={15}>Radius: 15 km (Local Block)</option>
              <option value={30}>Radius: 30 km (Taluk Cluster)</option>
              <option value={50}>Radius: 50 km (District Hub)</option>
              <option value={100}>Radius: 100 km (Regional)</option>
            </select>
          </div>
        </form>
      </div>

      {/* Main View Area: Interactive Map vs Lists */}
      {viewTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive GIS Map Canvas (Left 8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-600 px-1">
                <div className="flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-emerald-700 animate-spin" style={{ animationDuration: '10s' }} />
                  <span className="font-bold text-stone-900">
                    GIS Radar centered at {currentLocation.village}, {currentLocation.district} ({currentLocation.latitude.toFixed(3)}°N, {currentLocation.longitude.toFixed(3)}°E)
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                  Range: {radiusKm} km radius
                </span>
              </div>

              {/* Map Canvas with Topographic Grid and Projected Markers */}
              <div className="relative rounded-2xl overflow-hidden aspect-16/10 sm:aspect-16/9 bg-stone-950 border border-stone-800 shadow-inner select-none">
                {/* Distance concentric range rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[30%] h-[30%] rounded-full border border-emerald-500/20 border-dashed" />
                  <div className="w-[60%] h-[60%] rounded-full border border-emerald-500/15 border-dashed" />
                  <div className="w-[90%] h-[90%] rounded-full border border-emerald-500/10 border-dashed" />
                  <span className="absolute top-[16%] right-[22%] text-[9px] font-mono text-emerald-400/40">~25 KM</span>
                  <span className="absolute top-[6%] right-[8%] text-[9px] font-mono text-emerald-400/30">~50 KM</span>
                </div>

                {/* Radar Grid Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>

                {/* Top Left Floating Legend */}
                <div className="absolute top-3 left-3 z-10 bg-stone-900/90 backdrop-blur-xs border border-stone-700/80 rounded-xl p-2.5 text-[10px] text-white space-y-1.5 shadow-lg">
                  <p className="font-bold text-emerald-400 uppercase tracking-wider text-[9px]">Map Layers Legend</p>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-400/40" />
                    <span>Your Farm (Location)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/40" />
                    <span>Farmer Peers (Opted-in)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/40" />
                    <span>Local Knowledge Nodes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 ring-2 ring-blue-400/40" />
                    <span>Warehouses & Depots</span>
                  </div>
                </div>

                {/* Center / User's Own Farm Marker */}
                <div
                  style={projectToMap(centerLat, centerLng)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center cursor-pointer group"
                  onClick={() => setIsOptInModalOpen(true)}
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-cyan-500 text-stone-950 font-black text-xs flex items-center justify-center shadow-lg ring-4 ring-cyan-400/40 animate-pulse">
                      📍
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-stone-950" />
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded-md bg-stone-900/90 text-cyan-300 text-[10px] font-extrabold border border-cyan-500/40 whitespace-nowrap shadow-md">
                    Your Farm (Pollachi)
                  </span>
                </div>

                {/* Farmer Peer Markers */}
                {activeLayers.peers &&
                  peers.map((p) => {
                    const pos = projectToMap(p.latitude, p.longitude);
                    const isSelected = selectedPeer?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        style={pos}
                        onClick={() => {
                          setSelectedPeer(p);
                          setSelectedNode(null);
                          setSelectedWarehouse(null);
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center cursor-pointer transition-transform hover:scale-125 group ${
                          isSelected ? 'scale-125 z-40' : ''
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md transition-all ${
                            isSelected
                              ? 'bg-emerald-400 text-stone-950 ring-4 ring-white shadow-emerald-500/50'
                              : 'bg-emerald-600 text-white ring-2 ring-emerald-300/60'
                          }`}
                        >
                          {p.avatar || '👨‍🌾'}
                        </div>
                        <span
                          className={`mt-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold whitespace-nowrap border transition-all ${
                            isSelected
                              ? 'bg-emerald-400 text-stone-950 border-white shadow-lg'
                              : 'bg-stone-900/85 text-emerald-200 border-emerald-600/40 group-hover:bg-emerald-950'
                          }`}
                        >
                          {p.name.split(' ')[0]} ({p.distance_km}km)
                        </span>
                      </div>
                    );
                  })}

                {/* Knowledge Node Markers */}
                {activeLayers.knowledgeNodes &&
                  knowledgeNodes.map((kn) => {
                    const pos = projectToMap(kn.latitude, kn.longitude);
                    const isSelected = selectedNode?.id === kn.id;
                    const meta = CATEGORY_META[kn.category] || CATEGORY_META.PEST_ALERT;
                    const isUrgent = kn.urgency_level === 'HIGH_ALERT';

                    return (
                      <div
                        key={kn.id}
                        style={pos}
                        onClick={() => {
                          setSelectedNode(kn);
                          setSelectedPeer(null);
                          setSelectedWarehouse(null);
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center cursor-pointer transition-transform hover:scale-125 group ${
                          isSelected ? 'scale-125 z-40' : ''
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md transition-all ${
                            isUrgent
                              ? 'bg-rose-600 text-white ring-4 ring-rose-400/60 animate-bounce'
                              : isSelected
                              ? 'bg-amber-400 text-stone-950 ring-4 ring-white'
                              : 'bg-amber-500 text-stone-950 ring-2 ring-amber-300/60'
                          }`}
                        >
                          {meta.icon}
                        </div>
                        <span
                          className={`mt-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold whitespace-nowrap border transition-all ${
                            isUrgent
                              ? 'bg-rose-950 text-rose-200 border-rose-500 shadow-md font-black'
                              : isSelected
                              ? 'bg-amber-400 text-stone-950 border-white'
                              : 'bg-stone-900/85 text-amber-200 border-amber-600/40'
                          }`}
                        >
                          {isUrgent ? '⚠️ ' : ''}
                          {kn.title.substring(0, 16)}...
                        </span>
                      </div>
                    );
                  })}

                {/* Warehouse Markers */}
                {activeLayers.warehouses &&
                  warehouses.map((wh) => {
                    const pos = projectToMap(wh.latitude, wh.longitude);
                    const isSelected = selectedWarehouse?.id === wh.id;
                    return (
                      <div
                        key={wh.id}
                        style={pos}
                        onClick={() => {
                          setSelectedWarehouse(wh);
                          setSelectedPeer(null);
                          setSelectedNode(null);
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center cursor-pointer transition-transform hover:scale-125 group ${
                          isSelected ? 'scale-125 z-40' : ''
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shadow-md ${
                            isSelected
                              ? 'bg-blue-400 text-stone-950 ring-4 ring-white'
                              : 'bg-blue-600 text-white ring-2 ring-blue-300/50'
                          }`}
                        >
                          <WarehouseIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="mt-1 px-1.5 py-0.5 rounded-md bg-stone-900/80 text-blue-200 text-[8px] font-bold border border-blue-600/30 whitespace-nowrap">
                          {wh.name.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* Bottom Quick-Action Layer Stats Bar */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-xs">
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/80 text-center">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase">Peers in {radiusKm}km</p>
                  <p className="text-base font-extrabold text-emerald-950 mt-0.5">{peers.length} Verified Kisans</p>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-center">
                  <p className="text-[10px] font-bold text-amber-800 uppercase">Knowledge Nodes</p>
                  <p className="text-base font-extrabold text-amber-950 mt-0.5">{knowledgeNodes.length} Shared Tips</p>
                </div>
                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200/80 text-center">
                  <p className="text-[10px] font-bold text-blue-800 uppercase">Nearby Depots</p>
                  <p className="text-base font-extrabold text-blue-950 mt-0.5">{warehouses.length} Storage Hubs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Selected Node / Peer Details Card */}
          <div className="lg:col-span-4 space-y-4">
            {/* If Peer Selected */}
            {selectedPeer ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4 sticky top-20 animate-in fade-in">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-2xl flex items-center justify-center border border-emerald-300">
                      {selectedPeer.avatar || '👨‍🌾'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="font-bold text-base text-stone-900">{selectedPeer.name}</h3>
                        {selectedPeer.verified_kisan && (
                          <ShieldCheck className="w-4 h-4 text-emerald-600" title="State Verified Kisan" />
                        )}
                      </div>
                      <p className="text-xs text-stone-500 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>
                          {selectedPeer.village}, {selectedPeer.taluk} ({selectedPeer.distance_km} km)
                        </span>
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedPeer(null)} className="text-stone-400 hover:text-stone-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Farming Methodology & Land Area */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="text-stone-400 text-[10px] uppercase font-bold">Farming Style</p>
                    <p className="font-bold text-emerald-800 mt-0.5 text-xs">{selectedPeer.farming_method}</p>
                  </div>
                  <div className="p-2 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="text-stone-400 text-[10px] uppercase font-bold">Land & Experience</p>
                    <p className="font-bold text-stone-900 mt-0.5 text-xs">
                      {selectedPeer.land_area_acres} Acres • {selectedPeer.experience_years} yrs exp
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-stone-600 bg-stone-50/70 p-3 rounded-xl border border-stone-200/80 leading-relaxed italic">
                  "{selectedPeer.bio}"
                </p>

                {/* Primary Crops Cultivated */}
                <div className="space-y-1.5 text-xs">
                  <p className="text-[10px] uppercase font-bold text-stone-400">Primary Crops</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPeer.primary_crops.map((crop, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Available for Collaboration Tags */}
                <div className="space-y-1.5 text-xs">
                  <p className="text-[10px] uppercase font-bold text-stone-400">Open to Peer Collaboration</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPeer.available_for.map((collab, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-medium text-[10px] flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        <span>{collab}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Shared Equipment */}
                {selectedPeer.equipment_available && selectedPeer.equipment_available.length > 0 && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                    <p className="text-[10px] font-bold text-amber-900 uppercase flex items-center space-x-1">
                      <Tractor className="w-3.5 h-3.5 text-amber-700" />
                      <span>Farm Machinery Available for Share:</span>
                    </p>
                    <ul className="list-disc list-inside text-[11px] text-amber-950 font-medium space-y-0.5">
                      {selectedPeer.equipment_available.map((eq, i) => (
                        <li key={i}>{eq}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contact & Message CTA */}
                <div className="pt-2 border-t border-stone-100 flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setMessageTargetPeer(selectedPeer);
                      setMessageSubject(`Inquiry regarding ${selectedPeer.primary_crops[0]} & Collaboration`);
                      setIsMessageModalOpen(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send In-App Inquiry</span>
                  </button>

                  {selectedPeer.allow_direct_call && selectedPeer.phone_masked && (
                    <a
                      href={`tel:${selectedPeer.phone_masked}`}
                      className="px-3 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs border border-stone-300 transition-colors flex items-center space-x-1"
                      title="Direct Kisan Helpline"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{selectedPeer.phone_masked}</span>
                    </a>
                  )}
                </div>
              </div>
            ) : selectedNode ? (
              /* If Knowledge Node Selected */
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4 sticky top-20 animate-in fade-in">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">
                      {CATEGORY_META[selectedNode.category]?.icon || '💡'}
                    </span>
                    <div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${CATEGORY_META[selectedNode.category]?.bg} ${CATEGORY_META[selectedNode.category]?.text} ${CATEGORY_META[selectedNode.category]?.border}`}>
                        {CATEGORY_META[selectedNode.category]?.label}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="text-stone-400 hover:text-stone-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-stone-900 leading-snug">
                    {selectedNode.title}
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-1 flex items-center space-x-1.5">
                    <span>By <strong>{selectedNode.author_name}</strong></span>
                    <span>•</span>
                    <span>{selectedNode.author_village}</span>
                    <span>•</span>
                    <span>{selectedNode.distance_km} km away</span>
                  </p>
                </div>

                {/* Agronomist Badge Note */}
                {selectedNode.verified_by_agronomist && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-300 text-xs flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-emerald-950 text-[11px]">Agronomist Verified Wisdom</p>
                      <p className="text-[10px] text-emerald-800 mt-0.5 leading-normal">
                        {selectedNode.agronomist_badge_note || 'Endorsed by regional agricultural extension officers.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="text-xs text-stone-700 leading-relaxed space-y-2 bg-stone-50 p-3.5 rounded-xl border border-stone-200/80">
                  <p>{selectedNode.content}</p>
                </div>

                {/* Actionable Tip */}
                {selectedNode.actionable_tip && (
                  <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/90 text-xs space-y-1">
                    <p className="text-[10px] font-bold text-amber-900 uppercase flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Actionable Field Protocol:</span>
                    </p>
                    <p className="text-xs font-semibold text-stone-900 leading-relaxed">
                      {selectedNode.actionable_tip}
                    </p>
                  </div>
                )}

                {/* Relevant Crops & Tags */}
                <div className="space-y-1 text-xs">
                  <p className="text-[10px] uppercase font-bold text-stone-400">Relevant Crops</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.crops_relevant.map((crop, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium text-[10px]">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Upvote & Discuss Buttons */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={(e) => handleUpvote(selectedNode.id, e)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                      selectedNode.has_upvoted
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Upvote ({selectedNode.upvotes})</span>
                  </button>

                  <span className="text-[11px] text-stone-400">
                    Posted {new Date(selectedNode.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ) : selectedWarehouse ? (
              /* If Warehouse Selected */
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4 sticky top-20 animate-in fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      {selectedWarehouse.operator_type} Cold Chain
                    </span>
                    <h3 className="font-bold text-sm text-stone-900 mt-1">{selectedWarehouse.name}</h3>
                    <p className="text-xs text-stone-500">{selectedWarehouse.taluk}, {selectedWarehouse.district}</p>
                  </div>
                  <button onClick={() => setSelectedWarehouse(null)} className="text-stone-400 hover:text-stone-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="text-stone-400 text-[10px] uppercase font-bold">Capacity MT</p>
                    <p className="font-bold text-stone-900 mt-0.5">
                      {(selectedWarehouse.available_capacity_kg / 1000).toFixed(1)} / {(selectedWarehouse.total_capacity_kg / 1000).toFixed(0)} MT
                    </p>
                  </div>
                  <div className="p-2 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="text-stone-400 text-[10px] uppercase font-bold">Rent Rate</p>
                    <p className="font-bold text-emerald-800 mt-0.5">
                      ₹{selectedWarehouse.rate_inr} /kg/day
                    </p>
                  </div>
                </div>

                <p className="text-xs text-stone-600">
                  Suitable for: {selectedWarehouse.suitable_crops?.join(', ')}
                </p>
              </div>
            ) : (
              /* Default state when nothing is clicked */
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs text-center space-y-3 sticky top-20">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                  <Navigation className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-900">Explore Community Radar</h4>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    Click any farmer marker (👨‍🌾), shared advice node (💡), or cold storage hub (🏢) on the map to inspect peer details, initiate tractor sharing, or read bio-formulation recipes.
                  </p>
                </div>
                <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
                  <button
                    onClick={() => setIsOptInModalOpen(true)}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Adjust My Community Privacy
                  </button>
                  <button
                    onClick={() => setIsNewNodeModalOpen(true)}
                    className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Share Pest Alert / Advice
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Mode: Peer Directory List */}
      {viewTab === 'peers-list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {peers.map((peer) => (
            <div
              key={peer.id}
              onClick={() => {
                setSelectedPeer(peer);
                setViewTab('map');
              }}
              className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-xl flex items-center justify-center border border-emerald-300">
                      {peer.avatar || '👨‍🌾'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <h4 className="font-bold text-sm text-stone-900">{peer.name}</h4>
                        {peer.verified_kisan && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                      </div>
                      <p className="text-[11px] text-stone-500">
                        {peer.village}, {peer.taluk}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {peer.distance_km} km away
                  </span>
                </div>

                <p className="text-xs text-stone-600 mt-2 line-clamp-2 italic">
                  "{peer.bio}"
                </p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {peer.primary_crops.map((c, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-[10px] font-semibold text-emerald-800">
                  {peer.farming_method}
                </span>
                <span className="text-emerald-700 font-bold flex items-center space-x-1">
                  <span>View on Map</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Mode: Knowledge Feed */}
      {viewTab === 'nodes-feed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {knowledgeNodes.map((node) => {
            const meta = CATEGORY_META[node.category] || CATEGORY_META.PEST_ALERT;
            const isUrgent = node.urgency_level === 'HIGH_ALERT';

            return (
              <div
                key={node.id}
                onClick={() => {
                  setSelectedNode(node);
                  setViewTab('map');
                }}
                className={`bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 ${
                  isUrgent ? 'border-rose-300 ring-1 ring-rose-200' : 'border-stone-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{meta.icon}</span>
                    <div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${meta.bg} ${meta.text} ${meta.border}`}>
                        {meta.label}
                      </span>
                      {isUrgent && (
                        <span className="ml-1.5 text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-600 text-white">
                          CRITICAL ALERT
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {node.distance_km} km away
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-stone-900 leading-snug">{node.title}</h4>
                  <p className="text-xs text-stone-600 mt-1 line-clamp-3 leading-relaxed">
                    {node.content}
                  </p>
                </div>

                {node.actionable_tip && (
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] font-medium text-stone-900">
                    <span className="font-bold text-amber-900">Tip:</span> {node.actionable_tip}
                  </div>
                )}

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-500 font-medium">
                    By <strong>{node.author_name}</strong> ({node.author_village})
                  </span>

                  <button
                    onClick={(e) => handleUpvote(node.id, e)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center space-x-1 ${
                      node.has_upvoted ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{node.upvotes}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: COMMUNITY OPT-IN & PRIVACY SETTINGS */}
      {/* ===================================================================== */}
      {isOptInModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-stone-900">Community Map Opt-In Settings</h3>
                <p className="text-xs text-stone-500">Configure your peer visibility and shared equipment on the GIS map</p>
              </div>
              <button onClick={() => setIsOptInModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOptIn} className="space-y-4 text-xs">
              {/* Opt-In Master Switch */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-emerald-950 text-sm">Opt-In to Community Map Layer</p>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Allow fellow verified farmers in your district to discover your farm for machinery sharing & advice.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={optInForm.opted_in}
                  onChange={(e) => setOptInForm({ ...optInForm, opted_in: e.target.checked })}
                  className="w-5 h-5 text-emerald-600 rounded-md focus:ring-emerald-500"
                />
              </div>

              {optInForm.opted_in && (
                <div className="space-y-3 animate-in fade-in">
                  {/* Display Name & Privacy Mode */}
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Display Name Mode</label>
                    <select
                      value={optInForm.display_mode}
                      onChange={(e) => setOptInForm({ ...optInForm, display_mode: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    >
                      <option value="FULL_NAME">Show Full Name ({farmerProfile?.farmer_name || 'Murugan Palaniswamy'})</option>
                      <option value="FIRST_NAME_INITIAL">First Name with Initial (Murugan P.)</option>
                      <option value="ANONYMOUS_KISAN">Anonymous Kisan ID (Kisan #TN-882)</option>
                    </select>
                  </div>

                  {/* Phone Sharing Switch */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-stone-900">Direct Phone Helpline Visibility</p>
                      <p className="text-[10px] text-stone-500">Allow verified peers to view your phone number for immediate calls</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={optInForm.share_phone}
                      onChange={(e) => setOptInForm({ ...optInForm, share_phone: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                    />
                  </div>

                  {/* Farming Methodology */}
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Primary Farming Methodology</label>
                    <select
                      value={optInForm.farming_method}
                      onChange={(e) => setOptInForm({ ...optInForm, farming_method: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    >
                      {FARMING_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Collaboration Preferences */}
                  <div className="space-y-1.5">
                    <label className="block text-stone-700 font-bold">Open for Collaboration in:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {COLLABORATION_TYPES.map((type) => {
                        const isChecked = optInForm.available_for.includes(type);
                        return (
                          <label
                            key={type}
                            className={`p-2 rounded-lg border text-[11px] font-medium flex items-center space-x-2 cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                                : 'bg-stone-50 border-stone-200 text-stone-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setOptInForm({ ...optInForm, available_for: [...optInForm.available_for, type] });
                                } else {
                                  setOptInForm({
                                    ...optInForm,
                                    available_for: optInForm.available_for.filter((t) => t !== type),
                                  });
                                }
                              }}
                              className="w-3.5 h-3.5 text-emerald-600 rounded-md"
                            />
                            <span>{type}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Shared Machinery / Equipment */}
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Available Farm Equipment to Share (comma-separated)</label>
                    <input
                      type="text"
                      value={optInForm.equipment_available.join(', ')}
                      onChange={(e) =>
                        setOptInForm({
                          ...optInForm,
                          equipment_available: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      placeholder="e.g. John Deere 50HP Tractor, Power Weeder 7HP, 16L Battery Sprayer"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>

                  {/* Bio statement */}
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Short Farm Bio & Specialization</label>
                    <textarea
                      rows={2}
                      value={optInForm.bio}
                      onChange={(e) => setOptInForm({ ...optInForm, bio: e.target.value })}
                      placeholder="e.g. 18 years in organic vegetable farming. Happy to exchange indigenous seed varieties."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOptInModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold shadow-sm transition-colors cursor-pointer"
                >
                  Save & Update Map Presence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: SEND IN-APP PEER MESSAGE / COLLABORATION INQUIRY */}
      {/* ===================================================================== */}
      {isMessageModalOpen && messageTargetPeer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-stone-900">Send Inquiry to Peer</h3>
                <p className="text-xs text-stone-500">Recipient: <strong>{messageTargetPeer.name}</strong> ({messageTargetPeer.village})</p>
              </div>
              <button onClick={() => setIsMessageModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Collaboration Purpose</label>
                <select
                  value={messageInquiryType}
                  onChange={(e) => setMessageInquiryType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                >
                  {COLLABORATION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                  <option value="General Discussion">General Discussion & Advisory</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="e.g. Inquiring about Tractor availability this Saturday"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Message Details</label>
                <textarea
                  rows={4}
                  required
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Describe your requirement, land location, expected acreage, or crop specifics..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 leading-relaxed"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-500">
                Peer will receive an instant notification in their dashboard and can reply or call you back directly.
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsMessageModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingMessage}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingMessage ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: POST LOCAL OBSERVATION / KNOWLEDGE NODE */}
      {/* ===================================================================== */}
      {isNewNodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-stone-900">Post Local Farming Knowledge Node</h3>
                <p className="text-xs text-stone-500">Share field-tested pest alerts, bio-recipes, or transport pooling with nearby farmers</p>
              </div>
              <button onClick={() => setIsNewNodeModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateKnowledgeNode} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Observation Category</label>
                <select
                  value={newNodeCategory}
                  onChange={(e) => setNewNodeCategory(e.target.value as KnowledgeNodeCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold"
                >
                  {Object.entries(CATEGORY_META).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.icon} {val.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Urgency Level</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewNodeUrgency('HIGH_ALERT')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      newNodeUrgency === 'HIGH_ALERT'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    🚨 High Alert
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewNodeUrgency('SEASONAL_TIP')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      newNodeUrgency === 'SEASONAL_TIP'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    🌱 Seasonal Tip
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewNodeUrgency('BEST_PRACTICE')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      newNodeUrgency === 'BEST_PRACTICE'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    ✨ Best Practice
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Observation Heading</label>
                <input
                  type="text"
                  required
                  value={newNodeTitle}
                  onChange={(e) => setNewNodeTitle(e.target.value)}
                  placeholder="e.g. Yellow Leaf Curl Swarm noticed in Tomato fields around Kinathukadavu"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Detailed Observation & Field Conditions</label>
                <textarea
                  rows={3}
                  required
                  value={newNodeContent}
                  onChange={(e) => setNewNodeContent(e.target.value)}
                  placeholder="Describe what you observed on your plot, pest vectors, weather triggers, or pooling proposal..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Recommended Action / Recipe / Tip</label>
                <input
                  type="text"
                  value={newNodeTip}
                  onChange={(e) => setNewNodeTip(e.target.value)}
                  placeholder="e.g. Foliar spray Neem 10,000 ppm (3ml/L) before 8 AM + install 25 yellow sticky sheets/acre"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Relevant Crops</label>
                  <input
                    type="text"
                    value={newNodeCrops}
                    onChange={(e) => setNewNodeCrops(e.target.value)}
                    placeholder="Tomato, Chilli, Brinjal"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={newNodeTags}
                    onChange={(e) => setNewNodeTags(e.target.value)}
                    placeholder="Pest Alert, Organic"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewNodeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingNode}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold shadow-sm transition-colors cursor-pointer"
                >
                  {isCreatingNode ? 'Publishing...' : 'Publish to Community Map'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
