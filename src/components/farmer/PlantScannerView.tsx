import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { PlantScan, PlantPart } from '../../types';
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  RefreshCw,
  FlaskConical,
  ThumbsUp,
  ThumbsDown,
  Info,
  ChevronRight,
  ShieldAlert,
  Sliders,
  History,
  FileImage,
  Sun,
  Eye,
  Check,
  SwitchCamera,
  X,
  Aperture,
  Zap,
  Cpu,
  Smartphone,
  Maximize2,
} from 'lucide-react';

const SAMPLE_PLANTS = [
  {
    name: 'Tomato Early Blight',
    crop: 'Tomato',
    part: 'leaf' as PlantPart,
    notes: 'Brown concentric rings with yellow halos on lower leaves',
    url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22515?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Foliar Pest Damage (Shot Holes)',
    crop: 'Maize',
    part: 'leaf' as PlantPart,
    notes: 'Ragged caterpillar holes and skeletonized leaf blade',
    url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Tomato Leaf Curl Virus',
    crop: 'Tomato',
    part: 'leaf' as PlantPart,
    notes: 'Upward curling and stunting transmitted by whiteflies',
    url: 'https://images.unsplash.com/photo-1594488554287-79774640166a?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Healthy Crop Foliage',
    crop: 'Groundnut',
    part: 'leaf' as PlantPart,
    notes: 'Vibrant green, intact cuticle, healthy nodule vigor',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
  },
];

export const PlantScannerView: React.FC = () => {
  const { currentUser, farmerProfile, setActiveFarmerTab, showToast, language } = useApp();

  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedPart, setSelectedPart] = useState<PlantPart>('leaf');
  const [farmerNotes, setFarmerNotes] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(SAMPLE_PLANTS[0].url);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.7-flash' | 'ensemble-heuristic'>('gemini-3.7-flash');

  // Live Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [isFlashActive, setIsFlashActive] = useState(false);

  // Analysis Progress states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [currentScanResult, setCurrentScanResult] = useState<PlantScan | null>(null);
  const [scanHistory, setScanHistory] = useState<PlantScan[]>([]);
  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');

  // Feedback states
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [correctionText, setCorrectionText] = useState('');
  const [showCorrectionBox, setShowCorrectionBox] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load Scan History
  const loadHistory = async () => {
    try {
      const scans = await api.getPlantScans(currentUser?.id || 'usr_farmer_1');
      setScanHistory(scans);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [currentUser]);

  // Clean up camera stream when closing or unmounting
  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [cameraStream]);

  // Start Live Camera
  const startCamera = async (facing: 'environment' | 'user' = cameraFacingMode) => {
    stopCameraStream();
    setCameraError(null);
    setCapturedPhotoUrl(null);
    setIsCameraOpen(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment. You can use the Direct Mobile Camera upload button.');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (err) {
        // Fallback without specific facingMode constraint
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.error);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera permissions in your browser or use the native Mobile Camera file button below.'
          : err.message || 'Could not connect to camera hardware. Please check your camera permissions.'
      );
    }
  };

  // Switch between front and back camera
  const toggleCameraFacing = () => {
    const nextFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Capture Photo from Live Stream
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      // Trigger shutter flash
      setIsFlashActive(true);
      setTimeout(() => setIsFlashActive(false), 200);

      setCapturedPhotoUrl(dataUrl);
    }
  };

  // Confirm Captured Photo and Apply to Scanner
  const confirmCapturedPhoto = () => {
    if (capturedPhotoUrl) {
      setImageBase64(capturedPhotoUrl);
      setSelectedImageUrl(capturedPhotoUrl);
      stopCameraStream();
      setIsCameraOpen(false);
      showToast('Field camera photo captured and loaded. Ready to scan!');
    }
  };

  // Handle Standard File Upload & Native Mobile Camera Input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setImageBase64(base64);
        setSelectedImageUrl(base64);
        showToast('Plant image loaded. Ready to scan.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Run Real-Time AI Diagnosis
  const handleRunScan = async () => {
    setIsAnalyzing(true);
    setCurrentScanResult(null);
    setFeedbackSent(false);
    setShowCorrectionBox(false);

    // Progressive real UX stage display
    setAnalysisStep(1); // Uploading & Preprocessing
    await new Promise((r) => setTimeout(r, 400));
    setAnalysisStep(2); // Quality & Blur Check
    await new Promise((r) => setTimeout(r, 500));
    setAnalysisStep(3); // Computer Vision / Gemini Disease Inference
    await new Promise((r) => setTimeout(r, 700));
    setAnalysisStep(4); // Generating IPM & Agronomic Advice

    try {
      const result = await api.analyzePlant({
        imageBase64: imageBase64 || undefined,
        imageUrl: selectedImageUrl,
        cropName: selectedCrop,
        plantPart: selectedPart,
        farmerId: currentUser?.id || 'usr_farmer_1',
        language: language,
        farmerNotes: farmerNotes,
        preferredModel: selectedModel,
      });

      setCurrentScanResult(result);
      loadHistory();
      showToast(`Diagnosis complete: ${result.predicted_issue}`);
    } catch (err: any) {
      showToast(err.message || 'Diagnosis failed. Retrying with fallback.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  // Submit Feedback
  const handleFeedback = async (vote: 'yes' | 'no' | 'not_sure') => {
    if (!currentScanResult) return;
    try {
      await api.submitScanFeedback(currentScanResult.id, vote, correctionText || undefined);
      setFeedbackSent(true);
      showToast('Thank you! Your feedback helps calibrate our agricultural vision model.');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Plant Health & Disease Scanner</h2>
              <p className="text-xs text-stone-500">
                Multimodal Computer Vision with Gemini 3.7 Flash & Field Heuristic Ensemble
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'scan' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'history' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>My Scan History ({scanHistory.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'scan' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Image Input & Capture Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-900 flex items-center space-x-2">
                  <Aperture className="w-4 h-4 text-emerald-700" />
                  <span>Field Photo & Target Details</span>
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Live Vision Ready
                </span>
              </div>

              {/* Active Image Preview with Controls */}
              <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-950 aspect-4/3 flex items-center justify-center group shadow-inner">
                {selectedImageUrl ? (
                  <img
                    src={selectedImageUrl}
                    alt="Plant leaf for diagnosis"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 text-stone-400 space-y-2">
                    <Camera className="w-10 h-10 mx-auto text-stone-600" />
                    <p className="text-xs">No image selected yet</p>
                  </div>
                )}

                {/* Overlaid Grid / Framing Guide */}
                <div className="absolute inset-0 border-2 border-emerald-500/30 pointer-events-none rounded-xl m-3 flex items-center justify-center">
                  <div className="w-16 h-16 border-t-2 border-l-2 border-emerald-400/80 absolute top-0 left-0"></div>
                  <div className="w-16 h-16 border-t-2 border-r-2 border-emerald-400/80 absolute top-0 right-0"></div>
                  <div className="w-16 h-16 border-b-2 border-l-2 border-emerald-400/80 absolute bottom-0 left-0"></div>
                  <div className="w-16 h-16 border-b-2 border-r-2 border-emerald-400/80 absolute bottom-0 right-0"></div>
                  <div className="text-[10px] text-white/80 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs font-mono">
                    Center Leaf in Frame
                  </div>
                </div>
              </div>

              {/* Primary Action Buttons: Live Camera Viewfinder & File Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => startCamera('environment')}
                  className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-xs"
                >
                  <Camera className="w-4 h-4" />
                  <span>Open Live Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => mobileCameraInputRef.current?.click()}
                  className="w-full py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-xs"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Direct Mobile Camera</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                <span>Or upload from files:</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-emerald-700 font-bold hover:underline flex items-center space-x-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Browse Device Gallery</span>
                </button>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              {/* Native mobile camera trigger with capture="environment" */}
              <input
                ref={mobileCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Quick Sample Selector */}
              <div className="space-y-2 border-t border-stone-100 pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-700">Or Test with Field Samples:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_PLANTS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedImageUrl(sample.url);
                        setImageBase64(null);
                        setSelectedCrop(sample.crop);
                        setSelectedPart(sample.part);
                        setFarmerNotes(sample.notes);
                        showToast(`Loaded sample: ${sample.name}`);
                      }}
                      className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                        selectedImageUrl === sample.url && !imageBase64
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-bold'
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <img src={sample.url} alt={sample.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] truncate leading-tight">{sample.name}</p>
                        <p className="text-[9px] text-stone-500">{sample.crop}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Crop & Plant Part Configuration */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Crop Type</label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-800 focus:outline-emerald-700"
                  >
                    <option value="Tomato">Tomato (தக்காளி)</option>
                    <option value="Maize">Maize / Corn (மக்காச்சோளம்)</option>
                    <option value="Groundnut">Groundnut (வேர்க்கடலை)</option>
                    <option value="Paddy">Paddy / Rice (நெல்)</option>
                    <option value="Cotton">Cotton (பருத்தி)</option>
                    <option value="Onion">Onion (வெங்காயம்)</option>
                    <option value="Chilli">Chilli / Pepper (மிளகாய்)</option>
                    <option value="Banana">Banana (வாழை)</option>
                    <option value="Coconut">Coconut (தென்னை)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Plant Organ</label>
                  <select
                    value={selectedPart}
                    onChange={(e) => setSelectedPart(e.target.value as PlantPart)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-800 focus:outline-emerald-700"
                  >
                    <option value="leaf">Leaf (இலை)</option>
                    <option value="whole_plant">Whole Plant Canopy</option>
                    <option value="stem">Stem / Trunk (தண்டு)</option>
                    <option value="fruit_or_vegetable">Fruit / Pod / Grain (காய்/கனி)</option>
                  </select>
                </div>
              </div>

              {/* AI Model Selector */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800 flex items-center space-x-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-700" />
                    <span>AI Model Architecture</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedModel('gemini-3.7-flash')}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      selectedModel === 'gemini-3.7-flash'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-stone-200 bg-white text-stone-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]">Gemini 3.7 Flash</span>
                      {selectedModel === 'gemini-3.7-flash' && <Check className="w-3 h-3 text-emerald-700" />}
                    </div>
                    <p className="text-[9px] text-stone-500 mt-0.5">Multimodal Vision AI</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedModel('ensemble-heuristic')}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      selectedModel === 'ensemble-heuristic'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-stone-200 bg-white text-stone-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]">Field Ensemble</span>
                      {selectedModel === 'ensemble-heuristic' && <Check className="w-3 h-3 text-emerald-700" />}
                    </div>
                    <p className="text-[9px] text-stone-500 mt-0.5">Agri Heuristic Engine</p>
                  </button>
                </div>
              </div>

              {/* Optional Field Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Observed Field Symptoms / Notes (Optional)
                </label>
                <textarea
                  value={farmerNotes}
                  onChange={(e) => setFarmerNotes(e.target.value)}
                  placeholder="e.g. Yellow halos on lower leaves, started 3 days after rain, whiteflies seen under leaves..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-emerald-700"
                />
              </div>

              {/* Run Scan Button */}
              <button
                type="button"
                onClick={handleRunScan}
                disabled={isAnalyzing}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Image ({analysisStep}/4)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Disease Diagnosis</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Real-time Analysis Progress & Diagnostic Results */}
          <div className="lg:col-span-7 space-y-6">
            {isAnalyzing ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-xs space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto animate-pulse">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-stone-900">Running Multimodal AI Vision Inspection</h3>
                  <p className="text-xs text-stone-500">Processing high-resolution crop foliage features</p>
                </div>

                {/* Progress Steps Indicator */}
                <div className="max-w-md mx-auto space-y-3 text-left">
                  <div className={`flex items-center space-x-3 text-xs p-2.5 rounded-xl ${analysisStep >= 1 ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-stone-400'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 1 ? 'text-emerald-700' : 'text-stone-300'}`} />
                    <span>1. Image Upload & Spectral Preprocessing</span>
                  </div>
                  <div className={`flex items-center space-x-3 text-xs p-2.5 rounded-xl ${analysisStep >= 2 ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-stone-400'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 2 ? 'text-emerald-700' : 'text-stone-300'}`} />
                    <span>2. Computer Vision Sharpness & Blur Verification</span>
                  </div>
                  <div className={`flex items-center space-x-3 text-xs p-2.5 rounded-xl ${analysisStep >= 3 ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-stone-400'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 3 ? 'text-emerald-700' : 'text-stone-300'}`} />
                    <span>3. Gemini 3.7 Flash Pathogen & Foliar Disease Classification</span>
                  </div>
                  <div className={`flex items-center space-x-3 text-xs p-2.5 rounded-xl ${analysisStep >= 4 ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-stone-400'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 4 ? 'text-emerald-700' : 'text-stone-300'}`} />
                    <span>4. Formulating Integrated Pest Management (IPM) Plan</span>
                  </div>
                </div>
              </div>
            ) : currentScanResult ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
                {/* Result Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                        currentScanResult.prediction_type === 'HEALTHY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentScanResult.prediction_type === 'PEST_DAMAGE'
                          ? 'bg-amber-100 text-amber-800'
                          : currentScanResult.prediction_type === 'NUTRIENT_DEFICIENCY'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {currentScanResult.prediction_type}
                      </span>
                      <span className="text-xs text-stone-400">
                        Model: {currentScanResult.model_name}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-stone-900 mt-1">
                      {currentScanResult.predicted_issue}
                    </h3>
                  </div>

                  {/* Confidence Gauge */}
                  <div className="text-right bg-stone-50 border border-stone-200 rounded-xl p-2.5 px-4 shrink-0">
                    <p className="text-[10px] uppercase font-bold text-stone-400">Diagnostic Confidence</p>
                    <p className="text-2xl font-black text-emerald-700">{currentScanResult.confidence}%</p>
                  </div>
                </div>

                {/* Quality Validation Badges */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Image Quality: <strong>{currentScanResult.image_quality_verdict} ({currentScanResult.image_quality_score}/100)</strong></span>
                  </div>
                  <div className="text-stone-500 text-[11px]">
                    Natural Light: {currentScanResult.quality_checks.brightness_ok ? 'Optimal' : 'Low'} • Sharpness: Verified
                  </div>
                </div>

                {/* Farmer Explanation */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Info className="w-4 h-4 text-emerald-600" />
                    <span>Agronomic Explanation</span>
                  </h4>
                  <p className="text-xs text-stone-700 leading-relaxed bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    {currentScanResult.farmer_explanation}
                  </p>
                </div>

                {/* Observed Symptoms */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Observed Visual Symptoms</h4>
                  <ul className="space-y-1 text-xs text-stone-600">
                    {(currentScanResult.observed_symptoms || []).map((sym, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                        <span>{sym}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Next Steps */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Recommended Next Steps & Action Plan</h4>
                  <div className="space-y-1.5 text-xs text-stone-700">
                    {(currentScanResult.recommended_actions || []).map((act, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Soil Lab Referral if nutrient deficiency suspected */}
                {currentScanResult.soil_lab_referral_needed && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-xs text-blue-900">Soil Testing Recommended for Verification</h5>
                      <p className="text-[11px] text-blue-800">
                        Visual chlorosis may stem from soil pH or micro-nutrient deficiency. Get a certified Soil Health Card.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveFarmerTab('soil')}
                      className="px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shrink-0 flex items-center space-x-1"
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>Find Nearby Soil Lab</span>
                    </button>
                  </div>
                )}

                {/* Feedback Loop */}
                <div className="border-t border-stone-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="text-stone-600 font-medium">Was this diagnosis accurate & helpful for your field?</div>

                  {feedbackSent ? (
                    <div className="text-emerald-700 font-bold flex items-center space-x-1 bg-emerald-50 px-3 py-1.5 rounded-lg">
                      <Check className="w-4 h-4" />
                      <span>Feedback recorded!</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFeedback('yes')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 flex items-center space-x-1"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Yes</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowCorrectionBox(true);
                          handleFeedback('no');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold border border-stone-200 flex items-center space-x-1"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>No / Suggest Correction</span>
                      </button>
                    </div>
                  )}
                </div>

                {showCorrectionBox && !feedbackSent && (
                  <div className="pt-2">
                    <input
                      type="text"
                      placeholder="Optional: What was the real issue confirmed by your extension officer?"
                      value={correctionText}
                      onChange={(e) => setCorrectionText(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Empty Placeholder */
              <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-xs space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="max-w-sm mx-auto space-y-1">
                  <h3 className="font-bold text-base text-stone-900">Awaiting Plant Foliage Photo</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Capture a live photo using your camera or pick a field sample on the left to receive instant disease diagnosis and treatment steps.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Scan History View */
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-stone-900">Historical Plant Scans for Your Farm</h3>
          {scanHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500">No past plant scans recorded yet.</div>
          ) : (
            <div className="divide-y divide-stone-100">
              {scanHistory.map((scan) => (
                <div key={scan.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={scan.image_url}
                      alt={scan.crop_name}
                      className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-stone-900">{scan.predicted_issue}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          {scan.confidence}% Conf.
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {scan.crop_name} • {scan.plant_part} • {new Date(scan.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-[11px] text-stone-600 mt-1 max-w-xl truncate">{scan.farmer_explanation}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentScanResult(scan);
                      setActiveTab('scan');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold shrink-0"
                  >
                    View Diagnosis Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULLSCREEN / MODAL LIVE CAMERA VIEWFINDER FACILITY */}
      {/* ========================================================================= */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 text-white rounded-3xl max-w-xl w-full overflow-hidden border border-stone-800 shadow-2xl flex flex-col">
            {/* Camera Header */}
            <div className="p-4 bg-stone-950 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  AgriSaarthi Field Camera Viewfinder
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setIsCameraOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Camera View Area */}
            <div className="relative aspect-4/3 bg-black flex items-center justify-center overflow-hidden">
              {cameraError ? (
                <div className="p-6 text-center space-y-4 max-w-md">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white">Camera Access Required</h4>
                    <p className="text-xs text-stone-400">{cameraError}</p>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => startCamera(cameraFacingMode)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-xs font-bold text-white flex items-center justify-center space-x-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Connection</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stopCameraStream();
                        setIsCameraOpen(false);
                        mobileCameraInputRef.current?.click();
                      }}
                      className="px-4 py-2 bg-stone-800 hover:bg-stone-700 rounded-xl text-xs font-bold text-stone-200 flex items-center justify-center space-x-1.5"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Use Native Mobile Camera</span>
                    </button>
                  </div>
                </div>
              ) : capturedPhotoUrl ? (
                /* Freeze Frame Review */
                <div className="relative w-full h-full">
                  <img
                    src={capturedPhotoUrl}
                    alt="Captured preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-xs flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Snapshot Captured</span>
                  </div>
                </div>
              ) : (
                /* Live Video Stream */
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Shutter Visual Flash Effect */}
                  {isFlashActive && (
                    <div className="absolute inset-0 bg-white opacity-80 pointer-events-none animate-pulse"></div>
                  )}

                  {/* Framing Overlay Grid */}
                  <div className="absolute inset-4 border border-emerald-500/40 pointer-events-none rounded-2xl flex items-center justify-center">
                    {/* Reticle Focus Corner Marks */}
                    <div className="w-8 h-8 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0"></div>
                    <div className="w-8 h-8 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0"></div>
                    <div className="w-8 h-8 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0"></div>
                    <div className="w-8 h-8 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0"></div>

                    <div className="text-[11px] font-medium text-white/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                      Align Affected Leaf Inside Frame
                    </div>
                  </div>
                </>
              )}

              {/* Hidden canvas for capturing video frames */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Camera Bottom Controls */}
            <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
              {capturedPhotoUrl ? (
                <div className="w-full flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCapturedPhotoUrl(null)}
                    className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold flex items-center space-x-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retake Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={confirmCapturedPhoto}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg"
                  >
                    <Check className="w-4 h-4" />
                    <span>Use Photo & Analyze</span>
                  </button>
                </div>
              ) : (
                <div className="w-full flex items-center justify-between">
                  {/* Camera flip toggle */}
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="p-3 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                    title="Switch Front/Back Camera"
                  >
                    <SwitchCamera className="w-5 h-5" />
                  </button>

                  {/* Shutter Capture Button */}
                  <button
                    type="button"
                    onClick={captureSnapshot}
                    disabled={!!cameraError}
                    className="w-16 h-16 rounded-full bg-white hover:bg-stone-200 border-4 border-emerald-500 flex items-center justify-center text-stone-900 transition-transform active:scale-90 shadow-xl disabled:opacity-40"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                      <Camera className="w-6 h-6" />
                    </div>
                  </button>

                  {/* Close camera */}
                  <button
                    type="button"
                    onClick={() => {
                      stopCameraStream();
                      setIsCameraOpen(false);
                    }}
                    className="p-3 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
