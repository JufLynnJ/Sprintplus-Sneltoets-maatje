import React from 'react';
import { AppMode } from '../types';
import { Volume2, VolumeX, Eye, BookOpen, Trophy, Zap, Keyboard as KeyboardIcon, Target } from 'lucide-react';

interface HeaderProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  ttsEnabled: boolean;
  onToggleTts: () => void;
  dyslexiaFont: boolean;
  onToggleDyslexiaFont: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  streak: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  soundEnabled,
  onToggleSound,
  ttsEnabled,
  onToggleTts,
  dyslexiaFont,
  onToggleDyslexiaFont,
  highContrast,
  onToggleHighContrast,
  streak,
}) => {
  const navItems: { id: AppMode; label: string; icon: React.ReactNode }[] = [
    { id: 'practice', label: 'Oefenen', icon: <Target className="w-4 h-4" /> },
    { id: 'speedrun', label: 'Speed Run', icon: <Zap className="w-4 h-4" /> },
    { id: 'explorer', label: 'Verkenner', icon: <KeyboardIcon className="w-4 h-4" /> },
    { id: 'quiz', label: 'Toets & Diploma', icon: <Trophy className="w-4 h-4" /> },
    { id: 'cheatsheet', label: 'Spiekbrief', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <header className={`w-full border-b transition-colors ${
      highContrast 
        ? 'bg-black border-yellow-400 text-yellow-300' 
        : 'bg-[#1e276b] border-[#151c50] text-white shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div 
          onClick={() => onSelectMode('practice')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          {/* Authentic SprintPlus Speech Bubble Emblem */}
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm relative overflow-hidden group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
              <circle cx="20" cy="20" r="18" fill="#202A76" />
              <path
                d="M13 14H27C28.1 14 29 14.9 29 16V24C29 25.1 28.1 26 27 26H18L13 29V16C13 14.9 13.9 14 15 14Z"
                fill="white"
              />
            </svg>
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold tracking-tight text-lg text-white">Sprint<span className="text-sky-300 font-semibold">Plus</span></span>
              <span className="text-xs font-semibold px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded uppercase tracking-wide">
                Buddy
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links (single line, functional) */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-white/10 rounded-xl backdrop-blur-xs">
          {navItems.map((item) => {
            const isActive = currentMode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectMode(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#1e276b] shadow-sm font-bold scale-[1.02]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Accessibility Controls */}
        <div className="flex items-center gap-2">
          {/* Active streak counter if streak > 0 */}
          {streak > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm animate-bounce">
              <span>🔥</span>
              <span>{streak}</span>
            </div>
          )}

          {/* Read Aloud TTS button */}
          <button
            type="button"
            onClick={onToggleTts}
            title={ttsEnabled ? 'Voorlezen uit' : 'Voorlezen aan (Spraak)'}
            className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              ttsEnabled
                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                : 'bg-white/10 text-white/90 hover:bg-white/20'
            }`}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-70" />}
            <span className="hidden xl:inline">Voorlezen</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Geluidseffecten aan' : 'Geluidseffecten gedempt'}
            className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-white/15 text-white hover:bg-white/25'
                : 'bg-white/5 text-white/40 hover:bg-white/15'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Dyslexia-friendly Font Toggle */}
          <button
            type="button"
            onClick={onToggleDyslexiaFont}
            title={dyslexiaFont ? 'Standaard lettertype' : 'Dyslexie-vriendelijk lettertype'}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              dyslexiaFont
                ? 'bg-amber-400 text-slate-950'
                : 'bg-white/10 text-white/90 hover:bg-white/20'
            }`}
          >
            Aa
          </button>

          {/* High Contrast Toggle */}
          <button
            type="button"
            onClick={onToggleHighContrast}
            title={highContrast ? 'Normaal contrast' : 'Hoog contrast'}
            className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              highContrast
                ? 'bg-yellow-400 text-black ring-2 ring-white'
                : 'bg-white/10 text-white/90 hover:bg-white/20'
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden flex items-center justify-around px-2 py-1.5 bg-[#171f54] border-t border-white/10 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = currentMode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectMode(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white text-[#1e276b] font-bold shadow-xs'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
