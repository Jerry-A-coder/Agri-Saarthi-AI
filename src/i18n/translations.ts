import { LanguageCode } from '../types';

export interface LanguageMeta {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  script: string;
  region: string;
  flagEmoji: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    script: 'Latin',
    region: 'National / Global',
    flagEmoji: '🌐',
  },
  {
    code: 'ta',
    label: 'Tamil',
    nativeLabel: 'தமிழ்',
    script: 'தமிழ்',
    region: 'Tamil Nadu & Puducherry',
    flagEmoji: '🇮🇳',
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    script: 'देवनागरी',
    region: 'North & Central India',
    flagEmoji: '🇮🇳',
  },
  {
    code: 'te',
    label: 'Telugu',
    nativeLabel: 'తెలుగు',
    script: 'తెలుగు',
    region: 'Andhra Pradesh & Telangana',
    flagEmoji: '🇮🇳',
  },
  {
    code: 'kn',
    label: 'Kannada',
    nativeLabel: 'ಕನ್ನಡ',
    script: 'ಕನ್ನಡ',
    region: 'Karnataka',
    flagEmoji: '🇮🇳',
  },
  {
    code: 'mr',
    label: 'Marathi',
    nativeLabel: 'मराठी',
    script: 'देवनागरी',
    region: 'Maharashtra',
    flagEmoji: '🇮🇳',
  },
  {
    code: 'ml',
    label: 'Malayalam',
    nativeLabel: 'മലയാളം',
    script: 'മലയാളം',
    region: 'Kerala',
    flagEmoji: '🇮🇳',
  },
  {
    code: 'pa',
    label: 'Punjabi',
    nativeLabel: 'ਪੰਜਾਬੀ',
    script: 'ਗੁਰਮੁਖੀ',
    region: 'Punjab & Haryana',
    flagEmoji: '🇮🇳',
  },
  {
    code: 'gu',
    label: 'Gujarati',
    nativeLabel: 'ગુજરાતી',
    script: 'ગુજરાતી',
    region: 'Gujarat',
    flagEmoji: '🇮🇳',
  },
  {
    code: 'bn',
    label: 'Bengali',
    nativeLabel: 'বাংলা',
    script: 'বাংলা',
    region: 'West Bengal & Assam',
    flagEmoji: '🇮🇳',
  },
];

export const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Header & Brand
    'app.title': 'AgriSaarthi AI',
    'app.tagline': 'Agricultural Advisory & Intermediary Platform',
    'app.badge': 'AI',
    
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.howItWorks': 'How It Works',
    'nav.features': 'Features',
    'nav.contact': 'Contact & KVK',
    
    // Location
    'location.select': 'Select Farm Location',
    'location.detecting': 'Detecting...',
    'location.useGps': 'Use GPS',
    'location.current': 'Current Agricultural Hub',
    
    // Language Switcher
    'lang.switcher': 'Language',
    'lang.choose': 'Select Language (भाषा निवडा / மொழி தேர்வு)',
    'lang.searchPlaceholder': 'Search language or state...',
    'lang.quickSwitch': 'Quick Regional Switch',
    'lang.voiceAccessibility': 'Accessibility & Voice Ready',
    
    // Portals & Roles
    'role.switch': 'Switch Stakeholder Portal',
    'role.public': 'Public Website Home',
    'role.farmer': 'Farmer Portal',
    'role.farmerDesc': 'Scan plants, warehouse finder, schemes, crop rotation',
    'role.provider': 'Storage Provider Portal',
    'role.providerDesc': 'CWC/TNWC depot & booking approvals',
    'role.admin': 'Admin & Database Hub',
    'role.adminDesc': '30+ tables, system health, audit logs',
    'role.login': 'Login / Portals',
    'role.currentPortal': 'Portal',
    
    // Notifications
    'notif.title': 'Alerts & Notifications',
    'notif.empty': 'No new notifications.',
    'notif.markRead': 'Mark read',

    // Quick Stats & Actions
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.close': 'Close',
    'action.search': 'Search',
    'action.filter': 'Filter',
    'action.view': 'View',
    'action.apply': 'Apply',
  },

  ta: {
    // Header & Brand
    'app.title': 'அக்ரிசாரதி AI',
    'app.tagline': 'விவசாய ஆலோசனை மற்றும் சேமிப்புக் கிடங்கு தளம்',
    'app.badge': 'AI நுண்ணறிவு',
    
    // Navigation
    'nav.home': 'முகப்பு',
    'nav.about': 'எங்களைப் பற்றி',
    'nav.howItWorks': 'செயல்முறை',
    'nav.features': 'அம்சங்கள்',
    'nav.contact': 'தொடர்பு & கேவிகே',
    
    // Location
    'location.select': 'பண்ணை இருப்பிடத்தை தேர்வு செய்க',
    'location.detecting': 'கண்டறிகிறது...',
    'location.useGps': 'GPS பயன்படுத்துக',
    'location.current': 'தற்போதைய வேளாண் மையம்',
    
    // Language Switcher
    'lang.switcher': 'மொழி',
    'lang.choose': 'மொழியைத் தேர்வு செய்க',
    'lang.searchPlaceholder': 'மொழி அல்லது மாநிலத்தைத் தேடுக...',
    'lang.quickSwitch': 'விரைவு மொழி மாற்றி',
    'lang.voiceAccessibility': 'எளிதான அணுகல் & குரல் உதவி',
    
    // Portals & Roles
    'role.switch': 'பயனர் தளத்தை மாற்றுக',
    'role.public': 'பொது வலைத்தளம்',
    'role.farmer': 'விவசாயி தளம் (Farmer Portal)',
    'role.farmerDesc': 'பயிர் ஸ்கேன், கிடங்கு முன்பதிவு, அரசு திட்டங்கள், சுழற்சி',
    'role.provider': 'கிடங்கு உரிமையாளர் தளம் (Provider)',
    'role.providerDesc': 'CWC/TNWC கிடங்கு மேலாண்மை & ஒப்புதல்கள்',
    'role.admin': 'நிர்வாகி தளம் (Admin)',
    'role.adminDesc': 'முழுமையான கணினி மேலாண்மை மற்றும் தணிக்கை',
    'role.login': 'உள்நுழைவு / தளங்கள்',
    'role.currentPortal': 'தளம்',
    
    // Notifications
    'notif.title': 'எச்சரிக்கைகள் மற்றும் அறிவிப்புகள்',
    'notif.empty': 'புதிய அறிவிப்புகள் எதுவும் இல்லை.',
    'notif.markRead': 'படித்ததாகக் குறி',

    // Actions
    'action.save': 'சேமி',
    'action.cancel': 'ரத்து செய்',
    'action.close': 'மூடு',
    'action.search': 'தேடு',
    'action.filter': 'வடிகட்டு',
    'action.view': 'பார்வை',
    'action.apply': 'விண்ணப்பி',
  },

  hi: {
    // Header & Brand
    'app.title': 'एग्रीसारथी AI',
    'app.tagline': 'कृषि सलाह एवं भंडारण मध्यस्थता मंच',
    'app.badge': 'AI पावर्ड',
    
    // Navigation
    'nav.home': 'होम',
    'nav.about': 'हमारे बारे में',
    'nav.howItWorks': 'यह कैसे काम करता है',
    'nav.features': 'सुविधाएँ',
    'nav.contact': 'संपर्क और केवीके',
    
    // Location
    'location.select': 'खेत का स्थान चुनें',
    'location.detecting': 'खोज रहा है...',
    'location.useGps': 'GPS का उपयोग करें',
    'location.current': 'वर्तमान कृषि केंद्र',
    
    // Language Switcher
    'lang.switcher': 'भाषा',
    'lang.choose': 'भाषा चुनें (Select Language)',
    'lang.searchPlaceholder': 'भाषा या राज्य खोजें...',
    'lang.quickSwitch': 'त्वरित भाषा चयन',
    'lang.voiceAccessibility': 'सुगम्यता एवं वॉयस अनुकूल',
    
    // Portals & Roles
    'role.switch': 'हितधारक पोर्टल बदलें',
    'role.public': 'सार्वजनिक वेबसाइट',
    'role.farmer': 'किसान पोर्टल (Farmer Portal)',
    'role.farmerDesc': 'फसल रोग जांच, गोदाम खोज, सरकारी योजनाएं, फसल चक्र',
    'role.provider': 'भंडारण प्रदाता पोर्टल (Storage Provider)',
    'role.providerDesc': 'CWC/SWC डिपो एवं बुकिंग अनुमोदन',
    'role.admin': 'प्रशासक पोर्टल (Admin)',
    'role.adminDesc': 'डेटाबेस, सिस्टम स्वास्थ्य और ऑडिट लॉग्स',
    'role.login': 'लॉगिन / पोर्टल',
    'role.currentPortal': 'पोर्टल',
    
    // Notifications
    'notif.title': 'अलर्ट और सूचनाएं',
    'notif.empty': 'कोई नई सूचना नहीं है।',
    'notif.markRead': 'पढ़ा हुआ चिह्नित करें',

    // Actions
    'action.save': 'सहेजें',
    'action.cancel': 'रद्द करें',
    'action.close': 'बंद करें',
    'action.search': 'खोजें',
    'action.filter': 'फ़िल्टर',
    'action.view': 'देखें',
    'action.apply': 'लागू करें',
  },

  te: {
    // Header & Brand
    'app.title': 'అగ్రిసారథి AI',
    'app.tagline': 'వ్యవసాయ సలహా మరియు నిల్వ గిడ్డంగుల వేదిక',
    'app.badge': 'AI',
    
    // Navigation
    'nav.home': 'హోమ్',
    'nav.about': 'మా గురించి',
    'nav.howItWorks': 'ఇది ఎలా పనిచేస్తుంది',
    'nav.features': 'ఫీచర్లు',
    'nav.contact': 'సంప్రదించండి & KVK',
    
    // Location
    'location.select': 'వ్యవసాయ స్థానాన్ని ఎంచుకోండి',
    'location.detecting': 'గుర్తిస్తోంది...',
    'location.useGps': 'GPS ఉపయోగించండి',
    'location.current': 'ప్రస్తుత వ్యవసాయ కేంద్రం',
    
    // Language Switcher
    'lang.switcher': 'భాష',
    'lang.choose': 'భాషను ఎంచుకోండి',
    'lang.searchPlaceholder': 'భాష లేదా రాష్ట్రాన్ని శోధించండి...',
    'lang.quickSwitch': 'త్వరిత భాష మార్పిడి',
    'lang.voiceAccessibility': 'వాయిస్ మరియు ప్రాప్యత సదుపాయం',
    
    // Portals & Roles
    'role.switch': 'పోర్టల్ మార్చుకోండి',
    'role.public': 'ప్రజా వెబ్‌సైట్',
    'role.farmer': 'రైతు పోర్టల్ (Farmer Portal)',
    'role.farmerDesc': 'పంట వ్యాధి గుర్తింపు, గిడ్డంగుల బుకింగ్, ప్రభుత్వ పథకాలు',
    'role.provider': 'గిడ్డంగి యాజమాన్య పోర్టల్',
    'role.providerDesc': 'CWC డిపో మరియు బుకింగ్ ఆమోదాలు',
    'role.admin': 'అడ్మిన్ పోర్టల్',
    'role.adminDesc': 'సిస్టమ్ ఆరోగ్యం మరియు డేటా నిర్వహణ',
    'role.login': 'లాగిన్ / పోర్టల్స్',
    'role.currentPortal': 'పోర్టల్',
    
    // Notifications
    'notif.title': 'హెచ్చరికలు మరియు నోటిఫికేషన్లు',
    'notif.empty': 'కొత్త నోటిఫికేషన్లు లేవు.',
    'notif.markRead': 'చదివినట్లు గుర్తించు',

    // Actions
    'action.save': 'సేవ్ చేయండి',
    'action.cancel': 'రద్దు చేయండి',
    'action.close': 'మూసివేయండి',
    'action.search': 'శోధించండి',
    'action.filter': 'ఫిల్టర్',
    'action.view': 'చూడండి',
    'action.apply': 'దరఖాస్తు చేసుకోండి',
  },

  kn: {
    // Header & Brand
    'app.title': 'ಅಗ್ರಿಸಾರಥಿ AI',
    'app.tagline': 'ಕೃಷಿ ಸಲಹಾ ಮತ್ತು ಗೋದಾಮು ವೇದಿಕೆ',
    'app.badge': 'AI',
    
    // Navigation
    'nav.home': 'ಮುಖಪುಟ',
    'nav.about': 'ನಮ್ಮ ಬಗ್ಗೆ',
    'nav.howItWorks': 'ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
    'nav.features': 'ವೈಶಿಷ್ಟ್ಯಗಳು',
    'nav.contact': 'ಸಂಪರ್ಕ ಮತ್ತು ಕೆವಿಕೆ',
    
    // Location
    'location.select': 'ಜಮೀನಿನ ಸ್ಥಳ ಆಯ್ಕೆಮಾಡಿ',
    'location.detecting': 'ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ...',
    'location.useGps': 'GPS ಬಳಸಿ',
    'location.current': 'ಪ್ರಸ್ತುತ ಕೃಷಿ ಕೇಂದ್ರ',
    
    // Language Switcher
    'lang.switcher': 'ಭಾಷೆ',
    'lang.choose': 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'lang.searchPlaceholder': 'ಭಾಷೆ ಅಥವಾ ರಾಜ್ಯವನ್ನು ಹುಡುಕಿ...',
    'lang.quickSwitch': 'ತ್ವರಿತ ಭಾಷೆ ಬದಲಾವಣೆ',
    'lang.voiceAccessibility': 'ಧ್ವನಿ ಮತ್ತು ಪ್ರವೇಶಿಸುವಿಕೆ ಸಿದ್ಧ',
    
    // Portals & Roles
    'role.switch': 'ಪೋರ್ಟಲ್ ಬದಲಾಯಿಸಿ',
    'role.public': 'ಸಾರ್ವಜನಿಕ ವೆಬ್‌ಸೈಟ್',
    'role.farmer': 'ರೈತ ಪೋರ್ಟಲ್ (Farmer)',
    'role.farmerDesc': 'ಬೆಳೆ ರೋಗ ಪರೀಕ್ಷೆ, ಗೋದಾಮು ಹುಡುಕಾಟ, ಸರಕಾರಿ ಯೋಜನೆಗಳು',
    'role.provider': 'ಗೋದಾಮು ಪೂರೈಕೆದಾರರ ಪೋರ್ಟಲ್',
    'role.providerDesc': 'CWC/SWC ಗೋದಾಮು ನಿರ್ವಹಣೆ ಮತ್ತು ಬುಕಿಂಗ್ ಅನುಮೋದನೆ',
    'role.admin': 'ನಿರ್ವಾಹಕ ಪೋರ್ಟಲ್ (Admin)',
    'role.adminDesc': 'ಸಿಸ್ಟಮ್ ಆರೋಗ್ಯ ಮತ್ತು ಡೇಟಾಬೇಸ್ ಲಾಗ್‌ಗಳು',
    'role.login': 'ಲಾಗಿನ್ / ಪೋರ್ಟಲ್‌ಗಳು',
    'role.currentPortal': 'ಪೋರ್ಟಲ್',
    
    // Notifications
    'notif.title': 'ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಅಧಿಸೂಚನೆಗಳು',
    'notif.empty': 'ಯಾವುದೇ ಹೊಸ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ.',
    'notif.markRead': 'ಓದಿದೆ ಎಂದು ಗುರುತಿಸಿ',

    // Actions
    'action.save': 'ಉಳಿಸಿ',
    'action.cancel': 'ರದ್ದುಮಾಡಿ',
    'action.close': 'ಮುಚ್ಚಿ',
    'action.search': 'ಹುಡುಕಿ',
    'action.filter': 'ಫಿಲ್ಟರ್',
    'action.view': 'ವೀಕ್ಷಿಸಿ',
    'action.apply': 'ಅನ್ವಯಿಸಿ',
  },

  mr: {
    // Header & Brand
    'app.title': 'अॅग्रीसारथी AI',
    'app.tagline': 'कृषी सल्लागार आणि कोठार मध्यस्थी मंच',
    'app.badge': 'AI',
    
    // Navigation
    'nav.home': 'मुख्यपृष्ठ',
    'nav.about': 'आमच्याबद्दल',
    'nav.howItWorks': 'हे कसे कार्य करते',
    'nav.features': 'वैशिष्ट्ये',
    'nav.contact': 'संपर्क आणि केव्हीके',
    
    // Location
    'location.select': 'शेताचे स्थान निवडा',
    'location.detecting': 'शोधत आहे...',
    'location.useGps': 'GPS वापरा',
    'location.current': 'सध्याचे कृषी केंद्र',
    
    // Language Switcher
    'lang.switcher': 'भाषा',
    'lang.choose': 'भाषा निवडा',
    'lang.searchPlaceholder': 'भाषा किंवा राज्य शोधा...',
    'lang.quickSwitch': 'जलद भाषा बदल',
    'lang.voiceAccessibility': 'सुलभ वापर आणि व्हॉईस सुसंगत',
    
    // Portals & Roles
    'role.switch': 'पोर्टल बदला',
    'role.public': 'सार्वजनिक संकेतस्थळ',
    'role.farmer': 'शेतकरी पोर्टल (Farmer)',
    'role.farmerDesc': 'पीक रोग स्कॅन, गोदामांची माहिती, सरकारी योजना, पीक फेरपालट',
    'role.provider': 'गोदाम प्रदाता पोर्टल',
    'role.providerDesc': 'CWC/MSWC डेपो आणि बुकिंग मंजुरी',
    'role.admin': 'प्रशासक पोर्टल (Admin)',
    'role.adminDesc': 'सिस्टम आरोग्य, डेटाबेस आणि ऑडिट लॉग',
    'role.login': 'लॉगिन / पोर्टल',
    'role.currentPortal': 'पोर्टल',
    
    // Notifications
    'notif.title': 'सूचना आणि सूचना',
    'notif.empty': 'कोणत्याही नवीन सूचना नाहीत.',
    'notif.markRead': 'वाचले म्हणून चिन्हांकित करा',

    // Actions
    'action.save': 'जतन करा',
    'action.cancel': 'रद्द करा',
    'action.close': 'बंद करा',
    'action.search': 'शोधा',
    'action.filter': 'फिल्टर',
    'action.view': 'पहा',
    'action.apply': 'अर्ज करा',
  },

  ml: {
    // Header & Brand
    'app.title': 'അഗ്രിസാരഥി AI',
    'app.tagline': 'കാർഷിക ഉപദേശക-സംഭരണ പ്ലാറ്റ്‌ഫോം',
    'app.badge': 'AI',
    
    // Navigation
    'nav.home': 'ഹോം',
    'nav.about': 'ഞങ്ങളെക്കുറിച്ച്',
    'nav.howItWorks': 'പ്രവർത്തനരീതി',
    'nav.features': 'സവിശേഷതകൾ',
    'nav.contact': 'ബന്ധപ്പെടുക & KVK',
    
    // Location
    'location.select': 'കൃഷിയിടം തിരഞ്ഞെടുക്കുക',
    'location.detecting': 'കണ്ടെത്തുന്നു...',
    'location.useGps': 'GPS ഉപയോഗിക്കുക',
    'location.current': 'നിലവിലെ കാർഷിക കേന്ദ്രം',
    
    // Language Switcher
    'lang.switcher': 'ഭാഷ',
    'lang.choose': 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    'lang.searchPlaceholder': 'ഭാഷ അല്ലെങ്കിൽ സംസ്ഥാനം തിരയുക...',
    'lang.quickSwitch': 'വേഗത്തിലുള്ള ഭാഷാ മാറ്റം',
    'lang.voiceAccessibility': 'വോയ്‌സ് സപ്പോർട്ട് ലഭ്യമാണ്',
    
    // Portals & Roles
    'role.switch': 'പോർട്ടൽ മാറ്റുക',
    'role.public': 'പൊതു വെബ്സൈറ്റ്',
    'role.farmer': 'കർഷക പോർട്ടൽ (Farmer)',
    'role.farmerDesc': 'വിള രോഗ പരിശോധന, സംഭരണശാല ബുക്കിംഗ്, സർക്കാർ പദ്ധതികൾ',
    'role.provider': 'വെയർഹൗസ് ഓപ്പറേറ്റർ പോർട്ടൽ',
    'role.providerDesc': 'CWC ഡിപ്പോകളും ബുക്കിംഗ് അംഗീകാരങ്ങളും',
    'role.admin': 'അഡ്മിൻ പോർട്ടൽ',
    'role.adminDesc': 'സിസ്റ്റം ഹെൽത്ത് & ഡാറ്റാബേസ് മാനേജ്മെന്റ്',
    'role.login': 'ലോഗിൻ / പോർട്ടലുകൾ',
    'role.currentPortal': 'പോർട്ടൽ',
    
    // Notifications
    'notif.title': 'അറിയിപ്പുകൾ',
    'notif.empty': 'പുതിയ അറിയിപ്പുകൾ ഒന്നുമില്ല.',
    'notif.markRead': 'വായിച്ചതായി അടയാളപ്പെടുത്തുക',

    // Actions
    'action.save': 'സേവ് ചെയ്യുക',
    'action.cancel': 'റദ്ദാക്കുക',
    'action.close': 'അടയ്ക്കുക',
    'action.search': 'തിരയുക',
    'action.filter': 'ഫിൽട്ടർ',
    'action.view': 'കാണുക',
    'action.apply': 'അപേക്ഷിക്കുക',
  },

  pa: {
    // Header & Brand
    'app.title': 'ਐਗਰੀਸਾਰਥੀ AI',
    'app.tagline': 'ਖੇਤੀਬਾੜੀ ਸਲਾਹਕਾਰ ਅਤੇ ਸਟੋਰੇਜ ਪਲੇਟਫਾਰਮ',
    'app.badge': 'AI',
    
    // Navigation
    'nav.home': 'ਮੁੱਖ ਪੰਨਾ',
    'nav.about': 'ਸਾਡੇ ਬਾਰੇ',
    'nav.howItWorks': 'ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ',
    'nav.features': 'ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ',
    'nav.contact': 'ਸੰਪਰਕ ਅਤੇ ਕੇਵੀਕੇ',
    
    // Location
    'location.select': 'ਖੇਤ ਦਾ ਸਥਾਨ ਚੁਣੋ',
    'location.detecting': 'ਖੋਜ ਰਿਹਾ ਹੈ...',
    'location.useGps': 'GPS ਦੀ ਵਰਤੋਂ ਕਰੋ',
    'location.current': 'ਮੌਜੂਦਾ ਖੇਤੀਬਾੜੀ ਹੱਬ',
    
    // Language Switcher
    'lang.switcher': 'ਭਾਸ਼ਾ',
    'lang.choose': 'ਭਾਸ਼ਾ ਚੁਣੋ (Select Language)',
    'lang.searchPlaceholder': 'ਭਾਸ਼ਾ ਜਾਂ ਰਾਜ ਖੋਜੋ...',
    'lang.quickSwitch': 'ਤੇਜ਼ ਭਾਸ਼ਾ ਬਦਲੋ',
    'lang.voiceAccessibility': 'ਪਹੁੰਚਯੋਗਤਾ ਅਤੇ ਆਵਾਜ਼ ਅਨੁਕੂਲ',
    
    // Portals & Roles
    'role.switch': 'ਪੋਰਟਲ ਬਦਲੋ',
    'role.public': 'ਜਨਤਕ ਵੈੱਬਸਾਈਟ',
    'role.farmer': 'ਕਿਸਾਨ ਪੋਰਟਲ (Farmer)',
    'role.farmerDesc': 'ਫ਼ਸਲ ਰੋਗ ਜਾਂਚ, ਗੋਦਾਮ ਬੁਕਿੰਗ, ਸਰਕਾਰੀ ਸਕੀਮਾਂ',
    'role.provider': 'ਗੋਦਾਮ ਪ੍ਰਦਾਤਾ ਪੋਰਟਲ',
    'role.providerDesc': 'CWC/PSWC ਡਿਪੂ ਅਤੇ ਬੁਕਿੰਗ ਮਨਜ਼ੂਰੀ',
    'role.admin': 'ਐਡਮਿਨ ਪੋਰਟਲ',
    'role.adminDesc': 'ਸਿਸਟਮ ਸਿਹਤ ਅਤੇ ਆਡਿਟ ਲੌਗ',
    'role.login': 'ਲਾਗਇਨ / ਪੋਰਟਲ',
    'role.currentPortal': 'ਪੋਰਟਲ',
    
    // Notifications
    'notif.title': 'ਚੇਤਾਵਨੀਆਂ ਅਤੇ ਸੂਚਨਾਵਾਂ',
    'notif.empty': 'ਕੋਈ ਨਵੀਂ ਸੂਚਨਾ ਨਹੀਂ ਹੈ।',
    'notif.markRead': 'ਪੜ੍ਹਿਆ ਵਜੋਂ ਨਿਸ਼ਾਨਬੱਧ ਕਰੋ',

    // Actions
    'action.save': 'ਸੰਭਾਲੋ',
    'action.cancel': 'ਰੱਦ ਕਰੋ',
    'action.close': 'ਬੰਦ ਕਰੋ',
    'action.search': 'ਖੋਜੋ',
    'action.filter': 'ਫਿਲਟਰ',
    'action.view': 'ਦੇਖੋ',
    'action.apply': 'ਅਰਜ਼ੀ ਦਿਓ',
  },

  gu: {
    // Header & Brand
    'app.title': 'એગ્રીસારથી AI',
    'app.tagline': 'કૃષિ સલાહકાર અને સંગ્રહ મંચ',
    'app.badge': 'AI',
    
    // Navigation
    'nav.home': 'મુખ્ય પૃષ્ઠ',
    'nav.about': 'અમારા વિશે',
    'nav.howItWorks': 'તે કેવી રીતે કાર્ય કરે છે',
    'nav.features': 'સુવિધાઓ',
    'nav.contact': 'સંપર્ક અને કેવીકે',
    
    // Location
    'location.select': 'ખેતરનું સ્થાન પસંદ કરો',
    'location.detecting': 'શોધી રહ્યું છે...',
    'location.useGps': 'GPS વાપરો',
    'location.current': 'હાલનું કૃષિ કેન્દ્ર',
    
    // Language Switcher
    'lang.switcher': 'ભાષા',
    'lang.choose': 'ભાષા પસંદ કરો',
    'lang.searchPlaceholder': 'ભાષા અથવા રાજ્ય શોધો...',
    'lang.quickSwitch': 'ઝડપી ભાષા પરિવર્તન',
    'lang.voiceAccessibility': 'સરળ ઍક્સેસ અને અવાજ સહાય',
    
    // Portals & Roles
    'role.switch': 'પોર્ટલ બદલો',
    'role.public': 'જાહેર વેબસાઇટ',
    'role.farmer': 'ખેડૂત પોર્ટલ (Farmer)',
    'role.farmerDesc': 'પાક રોગ સ્કેન, ગોડાઉન બુકિંગ, સરકારી યોજનાઓ',
    'role.provider': 'ગોડાઉન પ્રદાતા પોર્ટલ',
    'role.providerDesc': 'CWC/GSWC ડેપો અને બુકિંગ મંજૂરી',
    'role.admin': 'એડમિન પોર્ટલ',
    'role.adminDesc': 'સિસ્ટમ હેલ્થ અને ડેટાબેઝ મેનેજમેન્ટ',
    'role.login': 'લૉગિન / પોર્ટલ',
    'role.currentPortal': 'પોર્ટલ',
    
    // Notifications
    'notif.title': 'ચેતવણીઓ અને સૂચનાઓ',
    'notif.empty': 'કોઈ નવી સૂચના નથી.',
    'notif.markRead': 'વાંચેલું ચિહ્નિત કરો',

    // Actions
    'action.save': 'સાચવો',
    'action.cancel': 'રદ કરો',
    'action.close': 'બંધ કરો',
    'action.search': 'શોધો',
    'action.filter': 'ફિલ્ટર',
    'action.view': 'જુઓ',
    'action.apply': 'અરજી કરો',
  },

  bn: {
    // Header & Brand
    'app.title': 'এগ্রিসারথী AI',
    'app.tagline': 'কৃষি পরামর্শ ও গুদামজাতকরণ সহায়তা প্ল্যাটফর্ম',
    'app.badge': 'AI',
    
    // Navigation
    'nav.home': 'হোম',
    'nav.about': 'আমাদের সম্পর্কে',
    'nav.howItWorks': 'কীভাবে কাজ করে',
    'nav.features': 'বৈশিষ্ট্য',
    'nav.contact': 'যোগাযোগ ও কেভিকে',
    
    // Location
    'location.select': 'খামারের অবস্থান নির্বাচন করুন',
    'location.detecting': 'শনাক্ত করা হচ্ছে...',
    'location.useGps': 'GPS ব্যবহার করুন',
    'location.current': 'বর্তমান কৃষি কেন্দ্র',
    
    // Language Switcher
    'lang.switcher': 'ভাষা',
    'lang.choose': 'ভাষা নির্বাচন করুন',
    'lang.searchPlaceholder': 'ভাষা বা রাজ্য খুঁজুন...',
    'lang.quickSwitch': 'দ্রুত ভাষা পরিবর্তন',
    'lang.voiceAccessibility': 'সহজ অ্যাক্সেস ও ভয়েস প্রস্তুত',
    
    // Portals & Roles
    'role.switch': 'পোর্টাল পরিবর্তন করুন',
    'role.public': 'পাবলিক ওয়েবসাইট',
    'role.farmer': 'কৃষক পোর্টাল (Farmer)',
    'role.farmerDesc': 'ফসলের রোগ স্ক্যান, গুদাম সন্ধান, সরকারি প্রকল্প',
    'role.provider': 'গুদাম সরবরাহকারী পোর্টাল',
    'role.providerDesc': 'CWC/SWC ডিপো এবং বুকিং অনুমোদন',
    'role.admin': 'অ্যাডমিন পোর্টাল',
    'role.adminDesc': 'সিস্টেম স্বাস্থ্য ও ডেটাবেস লগ',
    'role.login': 'লগইন / পোর্টাল',
    'role.currentPortal': 'পোর্টাল',
    
    // Notifications
    'notif.title': 'সতর্কতা এবং বিজ্ঞপ্তি',
    'notif.empty': 'কোনো নতুন বিজ্ঞপ্তি নেই।',
    'notif.markRead': 'পঠিত হিসেবে চিহ্নিত করুন',

    // Actions
    'action.save': 'সংরক্ষণ করুন',
    'action.cancel': 'বাতিল করুন',
    'action.close': 'বন্ধ করুন',
    'action.search': 'অনুসন্ধান',
    'action.filter': 'ফিল্টার',
    'action.view': 'দেখুন',
    'action.apply': 'আবেদন করুন',
  },
};

export function getTranslation(key: string, lang: LanguageCode = 'en'): string {
  if (translations[lang] && translations[lang][key]) {
    return translations[lang][key];
  }
  if (translations.en && translations.en[key]) {
    return translations.en[key];
  }
  return key;
}
