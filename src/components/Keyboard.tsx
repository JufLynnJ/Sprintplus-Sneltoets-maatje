import React from 'react';
import { KeyboardLayout, ShortcutItem } from '../types';
import { playKeyClickSound } from '../utils/audio';

interface KeyboardProps {
  layout: KeyboardLayout;
  onLayoutChange: (layout: KeyboardLayout) => void;
  activeKeys: string[];
  targetKeys?: string[];
  showHints?: boolean;
  onVirtualKeyPress?: (key: string) => void;
  interactive?: boolean;
  shortcuts?: ShortcutItem[];
  selectedKeyForExplorer?: string | null;
  onSelectKeyForExplorer?: (key: string) => void;
}

interface KeyConfig {
  code: string;
  label: string;
  shiftLabel?: string;
  width?: string; // Tailwind width class
  isModifier?: boolean;
  isSpecial?: boolean;
}

export const Keyboard: React.FC<KeyboardProps> = ({
  layout,
  onLayoutChange,
  activeKeys,
  targetKeys = [],
  showHints = false,
  onVirtualKeyPress,
  interactive = true,
  shortcuts = [],
  selectedKeyForExplorer,
  onSelectKeyForExplorer,
}) => {
  // Normalize comparison helper
  const normalize = (k: string) => {
    const lower = k.toLowerCase();
    if (lower === 'control' || lower === 'ctrl') return 'ctrl';
    if (lower === 'alt') return 'alt';
    if (lower === 'shift') return 'shift';
    if (lower === 'escape' || lower === 'esc') return 'esc';
    if (lower === ' ' || lower === 'spatie' || lower === 'space') return 'space';
    if (lower === 'pageup' || lower === 'pgup') return 'pageup';
    if (lower === 'pagedown' || lower === 'pgdn') return 'pagedown';
    if (lower === 'tab') return 'tab';
    if (lower === '=' || lower === '+') return '+';
    if (lower === '-' || lower === 'min') return '-';
    return lower;
  };

  const normalizedActive = activeKeys.map(normalize);
  const normalizedTarget = targetKeys.map(normalize);

  // Check which keys have SprintPlus shortcuts
  const keyShortcutCountMap = React.useMemo(() => {
    const map = new Map<string, number>();
    shortcuts.forEach(s => {
      s.keys.forEach(k => {
        const norm = normalize(k);
        map.set(norm, (map.get(norm) || 0) + 1);
      });
    });
    return map;
  }, [shortcuts]);

  // Layout rows definition
  const getRows = (): KeyConfig[][] => {
    const isAzerty = layout === 'AZERTY';

    const rowFunction: KeyConfig[] = [
      { code: 'Escape', label: 'Esc', width: 'w-12', isSpecial: true },
      { code: 'F1', label: 'F1', width: 'w-9' },
      { code: 'F2', label: 'F2', width: 'w-9' },
      { code: 'F3', label: 'F3', width: 'w-9' },
      { code: 'F4', label: 'F4', width: 'w-9' },
      { code: 'F5', label: 'F5', width: 'w-9' },
      { code: 'F6', label: 'F6', width: 'w-9' },
      { code: 'F7', label: 'F7', width: 'w-9' },
      { code: 'F8', label: 'F8', width: 'w-9' },
      { code: 'F9', label: 'F9', width: 'w-9' },
      { code: 'F10', label: 'F10', width: 'w-9' },
      { code: 'F11', label: 'F11', width: 'w-9' },
      { code: 'F12', label: 'F12', width: 'w-9' },
      { code: 'PageUp', label: 'PgUp', width: 'w-12', isSpecial: true },
      { code: 'PageDown', label: 'PgDn', width: 'w-12', isSpecial: true },
    ];

    const rowNumbers: KeyConfig[] = isAzerty
      ? [
          { code: 'Backquote', label: '²', width: 'w-8' },
          { code: '1', label: '1', shiftLabel: '&', width: 'w-9' },
          { code: '2', label: '2', shiftLabel: 'é', width: 'w-9' },
          { code: '3', label: '3', shiftLabel: '"', width: 'w-9' },
          { code: '4', label: '4', shiftLabel: "'", width: 'w-9' },
          { code: '5', label: '5', shiftLabel: '(', width: 'w-9' },
          { code: '6', label: '6', shiftLabel: '§', width: 'w-9' },
          { code: '7', label: '7', shiftLabel: 'è', width: 'w-9' },
          { code: '8', label: '8', shiftLabel: '!', width: 'w-9' },
          { code: '9', label: '9', shiftLabel: 'ç', width: 'w-9' },
          { code: '0', label: '0', shiftLabel: 'à', width: 'w-9' },
          { code: '-', label: '-', shiftLabel: ')', width: 'w-9' },
          { code: '+', label: '+', shiftLabel: '=', width: 'w-9' },
          { code: 'Backspace', label: '⌫ Wis', width: 'w-16', isSpecial: true },
        ]
      : [
          { code: 'Backquote', label: '`', shiftLabel: '~', width: 'w-8' },
          { code: '1', label: '1', shiftLabel: '!', width: 'w-9' },
          { code: '2', label: '2', shiftLabel: '@', width: 'w-9' },
          { code: '3', label: '3', shiftLabel: '#', width: 'w-9' },
          { code: '4', label: '4', shiftLabel: '$', width: 'w-9' },
          { code: '5', label: '5', shiftLabel: '%', width: 'w-9' },
          { code: '6', label: '6', shiftLabel: '^', width: 'w-9' },
          { code: '7', label: '7', shiftLabel: '&', width: 'w-9' },
          { code: '8', label: '8', shiftLabel: '*', width: 'w-9' },
          { code: '9', label: '9', shiftLabel: '(', width: 'w-9' },
          { code: '0', label: '0', shiftLabel: ')', width: 'w-9' },
          { code: '-', label: '-', shiftLabel: '_', width: 'w-9' },
          { code: '+', label: '=', shiftLabel: '+', width: 'w-9' },
          { code: 'Backspace', label: '⌫ Wis', width: 'w-16', isSpecial: true },
        ];

    const row1: KeyConfig[] = isAzerty
      ? [
          { code: 'Tab', label: 'Tab ⇥', width: 'w-14', isModifier: true },
          { code: 'a', label: 'A' },
          { code: 'z', label: 'Z' },
          { code: 'e', label: 'E' },
          { code: 'r', label: 'R' },
          { code: 't', label: 'T' },
          { code: 'y', label: 'Y' },
          { code: 'u', label: 'U' },
          { code: 'i', label: 'I' },
          { code: 'o', label: 'O' },
          { code: 'p', label: 'P' },
          { code: '^', label: '^', shiftLabel: '¨' },
          { code: '$', label: '$', shiftLabel: '*' },
          { code: 'Enter', label: 'Enter ⏎', width: 'w-16', isSpecial: true },
        ]
      : [
          { code: 'Tab', label: 'Tab ⇥', width: 'w-14', isModifier: true },
          { code: 'q', label: 'Q' },
          { code: 'w', label: 'W' },
          { code: 'e', label: 'E' },
          { code: 'r', label: 'R' },
          { code: 't', label: 'T' },
          { code: 'y', label: 'Y' },
          { code: 'u', label: 'U' },
          { code: 'i', label: 'I' },
          { code: 'o', label: 'O' },
          { code: 'p', label: 'P' },
          { code: '[', label: '[', shiftLabel: '{' },
          { code: ']', label: ']', shiftLabel: '}' },
          { code: 'Enter', label: 'Enter ⏎', width: 'w-16', isSpecial: true },
        ];

    const row2: KeyConfig[] = isAzerty
      ? [
          { code: 'CapsLock', label: 'Caps 🔒', width: 'w-16', isSpecial: true },
          { code: 'q', label: 'Q' },
          { code: 's', label: 'S' },
          { code: 'd', label: 'D' },
          { code: 'f', label: 'F' },
          { code: 'g', label: 'G' },
          { code: 'h', label: 'H' },
          { code: 'j', label: 'J' },
          { code: 'k', label: 'K' },
          { code: 'l', label: 'L' },
          { code: 'm', label: 'M' },
          { code: 'ù', label: 'ù', shiftLabel: '%' },
          { code: 'µ', label: 'µ', shiftLabel: '£' },
        ]
      : [
          { code: 'CapsLock', label: 'Caps 🔒', width: 'w-16', isSpecial: true },
          { code: 'a', label: 'A' },
          { code: 's', label: 'S' },
          { code: 'd', label: 'D' },
          { code: 'f', label: 'F' },
          { code: 'g', label: 'G' },
          { code: 'h', label: 'H' },
          { code: 'j', label: 'J' },
          { code: 'k', label: 'K' },
          { code: 'l', label: 'L' },
          { code: ';', label: ';', shiftLabel: ':' },
          { code: "'", label: "'", shiftLabel: '"' },
        ];

    const row3: KeyConfig[] = isAzerty
      ? [
          { code: 'Shift', label: 'Shift ⇧', width: 'w-20', isModifier: true },
          { code: '<', label: '<', shiftLabel: '>' },
          { code: 'w', label: 'W' },
          { code: 'x', label: 'X' },
          { code: 'c', label: 'C' },
          { code: 'v', label: 'V' },
          { code: 'b', label: 'B' },
          { code: 'n', label: 'N' },
          { code: ',', label: ',', shiftLabel: '?' },
          { code: ';', label: ';', shiftLabel: '.' },
          { code: ':', label: ':', shiftLabel: '/' },
          { code: '=', label: '=', shiftLabel: '+' },
          { code: 'Shift', label: 'Shift ⇧', width: 'w-16', isModifier: true },
        ]
      : [
          { code: 'Shift', label: 'Shift ⇧', width: 'w-20', isModifier: true },
          { code: 'z', label: 'Z' },
          { code: 'x', label: 'X' },
          { code: 'c', label: 'C' },
          { code: 'v', label: 'V' },
          { code: 'b', label: 'B' },
          { code: 'n', label: 'N' },
          { code: 'm', label: 'M' },
          { code: ',', label: ',', shiftLabel: '<' },
          { code: '.', label: '.', shiftLabel: '>' },
          { code: '/', label: '/', shiftLabel: '?' },
          { code: 'Shift', label: 'Shift ⇧', width: 'w-24', isModifier: true },
        ];

    const row4: KeyConfig[] = [
      { code: 'Control', label: 'Ctrl', width: 'w-14', isModifier: true },
      { code: 'Meta', label: 'Win ⊞', width: 'w-10', isSpecial: true },
      { code: 'Alt', label: 'Alt', width: 'w-12', isModifier: true },
      { code: ' ', label: 'Spatie (Houd ingedrukt om te schuiven)', width: 'flex-1', isSpecial: true },
      { code: 'AltGraph', label: 'Alt Gr', width: 'w-14', isModifier: true },
      { code: 'Control', label: 'Ctrl', width: 'w-14', isModifier: true },
    ];

    return [rowFunction, rowNumbers, row1, row2, row3, row4];
  };

  const rows = getRows();

  const handleKeyClick = (keyConfig: KeyConfig) => {
    if (!interactive) return;
    playKeyClickSound();
    if (onSelectKeyForExplorer) {
      onSelectKeyForExplorer(keyConfig.code);
    }
    if (onVirtualKeyPress) {
      onVirtualKeyPress(keyConfig.code);
    }
  };

  return (
    <div className="w-full bg-slate-900 rounded-2xl p-3 sm:p-5 shadow-2xl border border-slate-700/80 select-none">
      {/* Top Header inside Keyboard Frame */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Virtueel SprintPlus Toetsenbord</span>
          <span className="hidden sm:inline text-slate-500">·</span>
          <span className="hidden sm:inline text-slate-400">
            {interactive ? 'Klik op de toetsen of druk op je echte toetsenbord' : 'Toetsenbord weergave'}
          </span>
        </div>

        {/* Layout Switcher (AZERTY / QWERTY) */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-lg border border-slate-700">
          <span className="text-[11px] text-slate-400 pl-1 font-medium">Indeling:</span>
          <button
            type="button"
            onClick={() => onLayoutChange('AZERTY')}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              layout === 'AZERTY'
                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            AZERTY (BE/FR)
          </button>
          <button
            type="button"
            onClick={() => onLayoutChange('QWERTY')}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              layout === 'QWERTY'
                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            QWERTY (NL/US)
          </button>
        </div>
      </div>

      {/* Keyboard Grid */}
      <div className="space-y-1.5 overflow-x-auto pb-1">
        {rows.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1 sm:gap-1.5 justify-center min-w-[620px]">
            {row.map((k, cIdx) => {
              const normCode = normalize(k.code);
              const isActive = normalizedActive.includes(normCode);
              const isTarget = showHints && normalizedTarget.includes(normCode);
              const isSelected = selectedKeyForExplorer && normalize(selectedKeyForExplorer) === normCode;
              const hasSprintAction = (keyShortcutCountMap.get(normCode) || 0) > 0;

              // Compute key style
              let keyBg = 'bg-slate-800 text-slate-100 hover:bg-slate-700 border-slate-900 border-b-2 sm:border-b-4 active:border-b-0 active:translate-y-0.5';
              let ringEffect = '';

              if (isActive) {
                keyBg = 'bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/40 border-amber-600 translate-y-0.5';
              } else if (isTarget) {
                keyBg = 'bg-gradient-to-b from-blue-500 to-indigo-600 text-white font-bold animate-pulse border-indigo-700 shadow-md shadow-blue-500/30';
                ringEffect = 'ring-2 ring-blue-300 ring-offset-1 ring-offset-slate-900';
              } else if (isSelected) {
                keyBg = 'bg-blue-500 text-white font-bold border-blue-700';
                ringEffect = 'ring-2 ring-amber-400';
              } else if (k.isModifier) {
                keyBg = 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 border-slate-950 border-b-2 sm:border-b-4';
              }

              const widthClass = k.width || 'w-8 sm:w-10';

              return (
                <button
                  key={`${rIdx}-${cIdx}-${k.code}`}
                  type="button"
                  onClick={() => handleKeyClick(k)}
                  className={`relative h-9 sm:h-12 ${widthClass} rounded-lg flex flex-col items-center justify-center text-xs transition-all duration-75 cursor-pointer select-none ${keyBg} ${ringEffect}`}
                  title={
                    hasSprintAction
                      ? `SprintPlus sneltoets beschikbaar voor ${k.label}`
                      : k.label
                  }
                >
                  {/* Subtle SprintPlus dot badge if key has shortcut */}
                  {hasSprintAction && !isActive && !isTarget && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-400 opacity-80" />
                  )}

                  {k.shiftLabel && (
                    <span className="text-[9px] opacity-60 leading-none">
                      {k.shiftLabel}
                    </span>
                  )}
                  <span
                    className={`font-mono text-center tracking-tight ${
                      k.label.length > 5 ? 'text-[10px] px-1 truncate w-full' : 'text-xs sm:text-sm font-semibold'
                    }`}
                  >
                    {k.label}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend / Key Status bar */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-amber-400 border border-amber-500" />
            <span>Nu ingedrukt</span>
          </div>
          {showHints && (
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-blue-500 border border-blue-400 animate-pulse" />
              <span>Gevraagde sneltoets (Hint)</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
            <span>Heeft SprintPlus functie</span>
          </div>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          {activeKeys.length > 0 ? (
            <span>
              Actief:{' '}
              <strong className="text-amber-300">
                {activeKeys.join(' + ')}
              </strong>
            </span>
          ) : (
            <span className="text-slate-500">Wacht op toetsaanslag...</span>
          )}
        </div>
      </div>
    </div>
  );
};
