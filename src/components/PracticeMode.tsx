import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShortcutItem, ShortcutCategory, KeyboardLayout } from '../types';
import { SHORTCUT_CATEGORIES } from '../data/shortcuts';
import { Keyboard } from './Keyboard';
import { playSuccessSound, playErrorSound, speakDutchText } from '../utils/audio';
import { 
  HelpCircle, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Volume2, 
  ArrowRight,
  GraduationCap,
  Layers,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PracticeModeProps {
  shortcuts: ShortcutItem[];
  keyboardLayout: KeyboardLayout;
  onLayoutChange: (layout: KeyboardLayout) => void;
  activePhysicalKeys: string[];
  ttsEnabled: boolean;
  soundEnabled: boolean;
  onUpdateStats: (correct: boolean, shortcutId: string) => void;
  masteredIds: string[];
  initialShortcutId?: string | null;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({
  shortcuts,
  keyboardLayout,
  onLayoutChange,
  activePhysicalKeys,
  ttsEnabled,
  soundEnabled,
  onUpdateStats,
  masteredIds,
  initialShortcutId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ShortcutCategory | 'Alles'>('Alles');
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState<boolean>(true);
  const [currentIdx, setCurrentIdx] = useState<number>(() => {
    if (initialShortcutId) {
      const idx = shortcuts.findIndex((s) => s.id === initialShortcutId);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });

  useEffect(() => {
    if (initialShortcutId) {
      const idx = shortcuts.findIndex((s) => s.id === initialShortcutId);
      if (idx >= 0) {
        setSelectedCategory('Alles');
        setCurrentIdx(idx);
        setFeedback('idle');
        setFeedbackMessage('');
      }
    }
  }, [initialShortcutId, shortcuts]);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [inputMode, setInputMode] = useState<'keyboard' | 'choice'>('keyboard');
  const [localStreak, setLocalStreak] = useState<number>(0);
  const [virtualPressedKeys, setVirtualPressedKeys] = useState<string[]>([]);

  // Filtered pool
  const pool = useMemo(() => {
    if (selectedCategory === 'Alles') return shortcuts;
    return shortcuts.filter((s) => s.category === selectedCategory);
  }, [shortcuts, selectedCategory]);

  const currentShortcut = pool[currentIdx] || pool[0];

  // Random question phrasing from current shortcut scenarios
  const currentQuestionText = useMemo(() => {
    if (!currentShortcut) return '';
    const qList = currentShortcut.scenarioQuestions;
    return qList[0] || `Welke sneltoets hoort bij "${currentShortcut.title}"?`;
  }, [currentShortcut]);

  // Read aloud automatically if TTS is on
  useEffect(() => {
    if (ttsEnabled && currentShortcut) {
      speakDutchText(`${currentShortcut.title}. ${currentQuestionText}`);
    }
  }, [currentShortcut, ttsEnabled, currentQuestionText]);

  // Reset state when moving to new question
  const nextQuestion = useCallback(() => {
    setFeedback('idle');
    setFeedbackMessage('');
    setShowHint(false);
    setVirtualPressedKeys([]);
    setCurrentIdx((prev) => (prev + 1) % pool.length);
  }, [pool.length]);

  const prevQuestion = useCallback(() => {
    setFeedback('idle');
    setFeedbackMessage('');
    setShowHint(false);
    setVirtualPressedKeys([]);
    setCurrentIdx((prev) => (prev - 1 + pool.length) % pool.length);
  }, [pool.length]);

  const randomQuestion = useCallback(() => {
    setFeedback('idle');
    setFeedbackMessage('');
    setShowHint(false);
    setVirtualPressedKeys([]);
    const rand = Math.floor(Math.random() * pool.length);
    setCurrentIdx(rand);
  }, [pool.length]);

  // Check key combination match
  const checkAnswer = useCallback(
    (inputKeys: string[]) => {
      if (!currentShortcut || feedback === 'correct') return;

      const norm = (k: string) => {
        const l = k.toLowerCase();
        if (l === 'control' || l === 'ctrl') return 'ctrl';
        if (l === 'alt') return 'alt';
        if (l === 'shift') return 'shift';
        if (l === 'escape' || l === 'esc') return 'esc';
        if (l === ' ' || l === 'spatie' || l === 'space') return 'space';
        if (l === 'pageup') return 'pageup';
        if (l === 'pagedown') return 'pagedown';
        if (l === 'tab') return 'tab';
        if (l === '=' || l === '+') return '+';
        if (l === '-' || l === 'min') return '-';
        return l;
      };

      const targetNorm = currentShortcut.keys.map(norm).sort();
      const inputNorm = inputKeys.map(norm).sort();

      const isMatch =
        targetNorm.length === inputNorm.length &&
        targetNorm.every((val, idx) => val === inputNorm[idx]);

      if (isMatch) {
        if (soundEnabled) playSuccessSound();
        setFeedback('correct');
        const praises = [
          'Fantastisch gedaan! 🌟',
          'Helemaal juist! 🎯',
          'Knap gewerkt! 👏',
          'SprintPlus Meester! 🚀',
          'Super snel! ⚡',
        ];
        const randomPraise = praises[Math.floor(Math.random() * praises.length)];
        setFeedbackMessage(randomPraise);
        setLocalStreak((prev) => {
          const next = prev + 1;
          if (next % 5 === 0) {
            confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
          }
          return next;
        });
        onUpdateStats(true, currentShortcut.id);

        if (ttsEnabled) {
          speakDutchText(`${randomPraise} De sneltoets is inderdaad ${currentShortcut.displayKeys}`);
        }

        // Auto advance after short pause
        setTimeout(() => {
          nextQuestion();
        }, 1400);
      } else {
        // Only mark incorrect if a non-modifier key was pressed and it didn't match
        const hasLetterOrActionKey = inputKeys.some(
          (k) => !['Control', 'Alt', 'Shift', 'Meta'].includes(k)
        );

        if (hasLetterOrActionKey) {
          if (soundEnabled) playErrorSound();
          setFeedback('incorrect');
          setFeedbackMessage(`Nog niet helemaal! De juiste sneltoets is ${currentShortcut.displayKeys}`);
          setLocalStreak(0);
          onUpdateStats(false, currentShortcut.id);
        }
      }
    },
    [currentShortcut, feedback, soundEnabled, ttsEnabled, onUpdateStats, nextQuestion]
  );

  // Monitor physical keys
  useEffect(() => {
    if (activePhysicalKeys.length > 0 && inputMode === 'keyboard') {
      checkAnswer(activePhysicalKeys);
    }
  }, [activePhysicalKeys, checkAnswer, inputMode]);

  // Virtual key press handler (accumulate modifiers + letter)
  const handleVirtualKeyPress = (key: string) => {
    const isModifier = ['Control', 'Alt', 'Shift'].includes(key);

    if (isModifier) {
      setVirtualPressedKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    } else {
      const fullCombo = [...virtualPressedKeys, key];
      checkAnswer(fullCombo);
      // Reset virtual keys after single action
      setVirtualPressedKeys([]);
    }
  };

  // Multiple Choice Options (current + 3 distractors)
  const choiceOptions = useMemo(() => {
    if (!currentShortcut) return [];
    const others = shortcuts.filter((s) => s.id !== currentShortcut.id);
    const shuffled = [...others].sort(() => 0.5 - Math.random());
    const distractors = shuffled.slice(0, 3);
    const combined = [currentShortcut, ...distractors];
    return combined.sort(() => 0.5 - Math.random());
  }, [currentShortcut, shortcuts]);

  const isMastered = currentShortcut && masteredIds.includes(currentShortcut.id);

  return (
    <div className="space-y-6">
      {/* Category Filter Pills & Mode Toggle */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Categorie:
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('Alles');
              setCurrentIdx(0);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedCategory === 'Alles'
                ? 'bg-[#202A76] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Alles ({shortcuts.length})
          </button>
          {SHORTCUT_CATEGORIES.map((cat) => {
            const count = shortcuts.filter((s) => s.category === cat).length;
            const isSel = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentIdx(0);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isSel
                    ? 'bg-[#202A76] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Input Style Toggle & Keyboard Display Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setInputMode('keyboard')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                inputMode === 'keyboard'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              ⌨️ Eigen Toetsenbord
            </button>
            <button
              type="button"
              onClick={() => setInputMode('choice')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                inputMode === 'choice'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              🔘 Meerkeuze
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showVirtualKeyboard
                ? 'bg-slate-100 text-slate-700 border-slate-300'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {showVirtualKeyboard ? 'Verberg schermtoetsenbord' : 'Toon hulptoetsenbord'}
          </button>
        </div>
      </div>

      {/* Main Flashcard / Practice Stage */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 relative overflow-hidden">
        {/* Top Progress & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200/80">
              {currentShortcut?.category}
            </span>
            {currentShortcut?.sprintPlusVersion && (
              <span className="text-xs text-slate-500 font-medium">
                {currentShortcut.sprintPlusVersion}
              </span>
            )}
            {isMastered && (
              <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Beheerst
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
              <Flame className="w-3.5 h-3.5" />
              Reeks: {localStreak}
            </div>
            <span className="font-semibold text-slate-700">
              {currentIdx + 1} / {pool.length}
            </span>
          </div>
        </div>

        {/* Question Header & Scenario */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider font-extrabold text-blue-600 mb-1">
                SprintPlus Opdracht
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {currentShortcut?.title}
              </h2>
            </div>

            {/* Read Aloud Button */}
            <button
              type="button"
              onClick={() => {
                if (currentShortcut) {
                  speakDutchText(`${currentShortcut.title}. ${currentQuestionText}`);
                }
              }}
              title="Lees deze vraag voor"
              className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>

          {/* Scenario Situation */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 text-base sm:text-lg font-medium leading-relaxed">
            <p>"{currentQuestionText}"</p>
          </div>

          {/* Explanation / Tip */}
          <p className="text-xs sm:text-sm text-slate-500">
            💡 <strong>SprintPlus tip:</strong> {currentShortcut?.tips}
          </p>
        </div>

        {/* Input Interactive Area */}
        {inputMode === 'keyboard' ? (
          <div className="space-y-4">
            {/* Live Key Detection Prompt Box */}
            <div
              className={`p-5 rounded-2xl border-2 text-center transition-all ${
                feedback === 'correct'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                  : feedback === 'incorrect'
                  ? 'bg-rose-50 border-rose-400 text-rose-900'
                  : 'bg-indigo-50/60 border-indigo-200 text-indigo-950'
              }`}
            >
              {feedback === 'correct' ? (
                <div className="flex items-center justify-center gap-2 text-lg sm:text-xl font-extrabold">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <span>{feedbackMessage}</span>
                  <span className="font-mono bg-white px-2.5 py-0.5 rounded-lg border border-emerald-300 text-emerald-800 ml-2">
                    {currentShortcut?.displayKeys}
                  </span>
                </div>
              ) : feedback === 'incorrect' ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2 text-lg font-bold text-rose-700">
                    <XCircle className="w-5 h-5" />
                    <span>{feedbackMessage}</span>
                  </div>
                  <p className="text-xs text-rose-600">
                    Kijk op het toetsenbord hieronder welke toetsen oplichten!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-bold text-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Druk nu op je EIGEN fysieke toetsenbord:</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 min-h-10">
                    {virtualPressedKeys.length > 0 || activePhysicalKeys.length > 0 ? (
                      <div className="flex items-center gap-1.5 animate-fadeIn">
                        {[...new Set([...virtualPressedKeys, ...activePhysicalKeys])].map((k) => (
                          <span
                            key={k}
                            className="px-3.5 py-1.5 bg-amber-400 text-slate-950 font-black rounded-xl shadow-md font-mono text-base uppercase border border-amber-500"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-slate-600 text-xs font-semibold">
                          Typ de toets of combinatie op je laptop/computer (bv. <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded font-mono font-bold text-xs">{currentShortcut?.displayKeys}</kbd>)
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          (Klik eerst even in dit venster als je toetsenbord niet meteen reageert)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Hint toggle & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  showHint
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>{showHint ? 'Verberg hint' : 'Toon hint'}</span>
              </button>

              {showHint && currentShortcut && (
                <div className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 animate-fadeIn">
                  💡 Hint: {currentShortcut.hint}
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={prevQuestion}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  Vorige
                </button>
                <button
                  type="button"
                  onClick={randomQuestion}
                  title="Willekeurige sneltoets"
                  className="p-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextQuestion}
                  className="flex items-center gap-1 px-4 py-2 text-xs font-bold rounded-xl bg-[#202A76] hover:bg-[#1a2360] text-white transition-all shadow-xs cursor-pointer"
                >
                  <span>Volgende</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Multiple Choice Selection Mode */
          <div className="space-y-4">
            <div className="text-sm font-bold text-slate-700 mb-2">
              Kies de juiste sneltoets:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {choiceOptions.map((option) => {
                const isSelected = feedback !== 'idle';
                const isCorrectOption = option.id === currentShortcut?.id;

                let btnStyle = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';
                if (isSelected) {
                  if (isCorrectOption) {
                    btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold ring-2 ring-emerald-500';
                  } else {
                    btnStyle = 'bg-slate-50 opacity-40 border-slate-200 text-slate-500';
                  }
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={feedback === 'correct'}
                    onClick={() => checkAnswer(option.keys)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                  >
                    <div>
                      <div className="font-mono text-lg font-black tracking-tight text-blue-900">
                        {option.displayKeys}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {option.title}
                      </div>
                    </div>
                    {isSelected && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={nextQuestion}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#202A76] hover:bg-[#1a2360] text-white transition-all cursor-pointer"
              >
                <span>Volgende vraag</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Virtual Keyboard for visual support and direct clicks */}
      {showVirtualKeyboard && (
        <div className="pt-2 animate-fadeIn">
          <Keyboard
            layout={keyboardLayout}
            onLayoutChange={onLayoutChange}
            activeKeys={[...new Set([...virtualPressedKeys, ...activePhysicalKeys])]}
            targetKeys={currentShortcut ? currentShortcut.keys : []}
            showHints={showHint || feedback === 'incorrect'}
            onVirtualKeyPress={handleVirtualKeyPress}
            interactive={true}
            shortcuts={shortcuts}
          />
        </div>
      )}

      {/* Pupil Mastery & Learning stats footer */}
      <div className="bg-blue-50/80 rounded-2xl p-4 border border-blue-200/60 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-900">
        <div className="flex items-center gap-2 font-semibold">
          <GraduationCap className="w-4 h-4 text-blue-700" />
          <span>Jouw Voortgang:</span>
          <span className="font-mono font-bold text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">
            {masteredIds.length} / {shortcuts.length} sneltoetsen onder de knie
          </span>
        </div>
        <div className="text-blue-700">
          Tip: Hoe vaker je foutloos antwoordt, hoe sneller je alle badges verzamelt!
        </div>
      </div>
    </div>
  );
};
