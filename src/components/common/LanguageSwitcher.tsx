import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SUPPORTED_LANGUAGES, LanguageMeta } from '../../i18n/translations';
import { LanguageCode } from '../../types';
import {
  Globe,
  Check,
  ChevronDown,
  Search,
  Volume2,
  Sparkles,
  X,
} from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'header' | 'compact' | 'modal';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { language, setLanguage, t, showToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Keyboard escape handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelectLanguage = (langCode: LanguageCode, meta: LanguageMeta) => {
    setLanguage(langCode);
    setIsOpen(false);

    // Contextual welcoming message in selected language
    const greetings: Record<LanguageCode, string> = {
      en: 'Language set to English',
      ta: 'மொழி தமிழுக்கு மாற்றப்பட்டது (Tamil active)',
      hi: 'भाषा हिन्दी में बदली गई (Hindi active)',
      te: 'భాష తెలుగులోకి మార్చబడింది (Telugu active)',
      kn: 'ಭಾಷೆ ಕನ್ನಡಕ್ಕೆ ಬದಲಾಗಿದೆ (Kannada active)',
      mr: 'भाषा मराठीत बदलली आहे (Marathi active)',
      ml: 'ഭാഷ മലയാളത്തിലേക്ക് മാറ്റി (Malayalam active)',
      pa: 'ਭਾਸ਼ਾ ਪੰਜਾਬੀ ਵਿੱਚ ਬਦਲੀ ਗਈ (Punjabi active)',
      gu: 'ભાષા ગુજરાતીમાં બદલાઈ (Gujarati active)',
      bn: 'ভাষা বাংলায় পরিবর্তিত হয়েছে (Bengali active)',
    };

    showToast(greetings[langCode] || `Language set to ${meta.label}`);
  };

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((l) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      l.label.toLowerCase().includes(q) ||
      l.nativeLabel.toLowerCase().includes(q) ||
      l.region.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q)
    );
  });

  return (
    <div
      ref={dropdownRef}
      id="language-switcher-container"
      className={`relative inline-block text-left ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        id="language-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current language: ${currentLangMeta.nativeLabel}. Click to switch language.`}
        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100/90 hover:bg-stone-200/90 text-stone-800 text-xs font-semibold transition-all border border-stone-200 shadow-2xs hover:border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
      >
        <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black shrink-0">
          <Globe className="w-3.5 h-3.5" />
        </div>
        
        <span className="font-extrabold text-stone-900 tracking-tight">
          {currentLangMeta.nativeLabel}
        </span>
        
        <span className="hidden md:inline text-[10px] uppercase font-bold text-stone-400">
          ({currentLangMeta.code})
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-700' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="language-switcher-dropdown"
          role="listbox"
          aria-label="Supported regional Indian languages"
          className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in zoom-in-95"
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-emerald-700" />
              <div>
                <h4 className="text-xs font-extrabold text-stone-900 leading-none">
                  {t('lang.switcher')} / Regional Languages
                </h4>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Choose your preferred local dialect
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Switch Pills */}
          <div className="p-2 border-b border-stone-100 bg-stone-50/60 rounded-xl my-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5 px-1">
              {t('lang.quickSwitch')}
            </span>
            <div className="flex flex-wrap gap-1">
              {['en', 'ta', 'hi', 'te', 'kn', 'mr'].map((code) => {
                const item = SUPPORTED_LANGUAGES.find((l) => l.code === code);
                if (!item) return null;
                const isSelected = language === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleSelectLanguage(item.code, item)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {item.nativeLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Filter */}
          <div className="relative px-1 my-1.5">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-2.5" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('lang.searchPlaceholder')}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium placeholder:text-stone-400"
            />
          </div>

          {/* Languages List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-stone-50 py-1">
            {filteredLanguages.length === 0 ? (
              <div className="p-4 text-center text-xs text-stone-400">
                No matching language found.
              </div>
            ) : (
              filteredLanguages.map((item) => {
                const isSelected = language === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    id={`lang-opt-${item.code}`}
                    onClick={() => handleSelectLanguage(item.code, item)}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between rounded-xl transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-950 font-bold'
                        : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-base leading-none">{item.flagEmoji}</span>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-extrabold text-stone-900 text-[13px]">
                            {item.nativeLabel}
                          </span>
                          <span className="text-[11px] text-stone-500 font-medium">
                            ({item.label})
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400 block">
                          {item.region}
                        </span>
                      </div>
                    </div>

                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-3 h-3" />
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-stone-400 uppercase">
                        {item.code}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Accessibility Badge */}
          <div className="px-3 py-1.5 mt-1 border-t border-stone-100 bg-emerald-50/50 rounded-b-xl flex items-center justify-between text-[10px] text-emerald-800 font-semibold">
            <div className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>{t('lang.voiceAccessibility')}</span>
            </div>
            <span className="text-emerald-700 font-bold">10 Dialects</span>
          </div>
        </div>
      )}
    </div>
  );
};
