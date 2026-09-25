import React, { useState, useMemo } from 'react';
import { ShortcutItem, KeyboardLayout } from '../types';
import { Keyboard } from './Keyboard';
import { speakDutchText } from '../utils/audio';
import { Search, Volume2, Sparkles, CheckCircle2, Info } from 'lucide-react';

interface ExplorerModeProps {
  shortcuts: ShortcutItem[];
  keyboardLayout: KeyboardLayout;
  onLayoutChange: (layout: KeyboardLayout) => void;
  activePhysicalKeys: string[];
  ttsEnabled: boolean;
  onSelectPracticeShortcut?: (shortcutId: string) => void;
}

export const ExplorerMode: React.FC<ExplorerModeProps> = ({
  shortcuts,
  keyboardLayout,
  onLayoutChange,
  activePhysicalKeys,
  ttsEnabled,
}) => {
  const [selectedKey, setSelectedKey] = useState<string>('t');

  // When physical key is pressed, automatically select it in the explorer
  React.useEffect(() => {
    if (activePhysicalKeys.length > 0) {
      const nonMod = activePhysicalKeys.find(
        (k) => !['Control', 'Alt', 'Shift', 'Meta'].includes(k)
      );
      if (nonMod) {
        setSelectedKey(nonMod.toLowerCase());
      } else if (activePhysicalKeys[0]) {
        setSelectedKey(activePhysicalKeys[0].toLowerCase());
      }
    }
  }, [activePhysicalKeys]);

  // Find all shortcuts that contain this key
  const matchingShortcuts = useMemo(() => {
    const norm = (k: string) => {
      const l = k.toLowerCase();
      if (l === 'control' || l === 'ctrl') return 'ctrl';
      if (l === 'alt') return 'alt';
      if (l === 'shift') return 'shift';
      if (l === 'escape' || l === 'esc') return 'esc';
      if (l === ' ' || l === 'space' || l === 'spatie') return 'space';
      if (l === 'pageup') return 'pageup';
      if (l === 'pagedown') return 'pagedown';
      if (l === 'tab') return 'tab';
      return l;
    };

    const targetKeyNorm = norm(selectedKey);

    return shortcuts.filter((s) => {
      return s.keys.some((k) => norm(k) === targetKeyNorm);
    });
  }, [shortcuts, selectedKey]);

  return (
    <div className="space-y-6">
      {/* Explorer intro banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs uppercase tracking-wider font-extrabold text-blue-600 mb-0.5">
              Interactieve Toetsenbord Verkenner
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Druk of klik op een willekeurige toets
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Ontdek welke handige SprintPlus acties er gekoppeld zijn aan elke toets op je toetsenbord!
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-600">Geselecteerde toets:</span>
            <span className="font-mono text-base font-black px-2.5 py-0.5 rounded bg-blue-600 text-white uppercase">
              {selectedKey.length === 1 ? selectedKey.toUpperCase() : selectedKey}
            </span>
          </div>
        </div>

        {/* Keyboard Component */}
        <Keyboard
          layout={keyboardLayout}
          onLayoutChange={onLayoutChange}
          activeKeys={activePhysicalKeys}
          selectedKeyForExplorer={selectedKey}
          onSelectKeyForExplorer={(k) => setSelectedKey(k.toLowerCase())}
          interactive={true}
          shortcuts={shortcuts}
        />
      </div>

      {/* Matching Shortcuts Detail Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>SprintPlus acties voor toets:</span>
            <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 uppercase font-black">
              {selectedKey.length === 1 ? selectedKey.toUpperCase() : selectedKey}
            </span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {matchingShortcuts.length} gevonden
          </span>
        </div>

        {matchingShortcuts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchingShortcuts.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-blue-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    <h4 className="text-lg font-extrabold text-slate-900">
                      {item.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-black px-2.5 py-1 bg-amber-400 text-slate-950 rounded-lg shadow-xs">
                      {item.displayKeys}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        speakDutchText(`${item.title}. Sneltoets is ${item.displayKeys}. ${item.description}`)
                      }
                      title="Beluister uitleg"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>{item.tips}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 space-y-2">
            <p className="text-base font-semibold text-slate-700">
              Geen directe SprintPlus sneltoets gekoppeld aan de toets "{selectedKey.toUpperCase()}".
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Probeer eens letters zoals <strong>K</strong> (Kaderlezen), <strong>C</strong> (Klik en lees), <strong>T</strong> (Typen), <strong>M</strong> (Markeren), <strong>H</strong> (Handje), of combineer met <strong>Ctrl</strong> of <strong>Alt</strong>!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
