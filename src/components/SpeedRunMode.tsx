import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShortcutItem, KeyboardLayout } from '../types';
import { Keyboard } from './Keyboard';
import { playSuccessSound, playErrorSound, playFanfareSound } from '../utils/audio';
import { Zap, Play, RotateCcw, Trophy, Flame, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SpeedRunModeProps {
  shortcuts: ShortcutItem[];
  keyboardLayout: KeyboardLayout;
  onLayoutChange: (layout: KeyboardLayout) => void;
  activePhysicalKeys: string[];
  soundEnabled: boolean;
  highScore: number;
  onSaveHighScore: (score: number) => void;
}

export const SpeedRunMode: React.FC<SpeedRunModeProps> = ({
  shortcuts,
  keyboardLayout,
  onLayoutChange,
  activePhysicalKeys,
  soundEnabled,
  highScore,
  onSaveHighScore,
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);
  const [shuffledList, setShuffledList] = useState<ShortcutItem[]>([]);
  const [virtualPressedKeys, setVirtualPressedKeys] = useState<string[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startSpeedRun = () => {
    const shuffled = [...shortcuts].sort(() => 0.5 - Math.random());
    setShuffledList(shuffled);
    setCurrentIdx(0);
    setScore(0);
    setCombo(0);
    setTimeLeft(60);
    setIsGameOver(false);
    setIsNewHigh(false);
    setIsRunning(true);
    setVirtualPressedKeys([]);
  };

  const currentShortcut = shuffledList[currentIdx];

  const handleGameOver = useCallback(() => {
    setIsRunning(false);
    setIsGameOver(true);
    if (timerRef.current) clearInterval(timerRef.current);

    if (score > highScore) {
      setIsNewHigh(true);
      onSaveHighScore(score);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      if (soundEnabled) playFanfareSound();
    }
  }, [score, highScore, onSaveHighScore, soundEnabled]);

  // Countdown timer
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, handleGameOver]);

  const advanceNext = useCallback(() => {
    setVirtualPressedKeys([]);
    setCurrentIdx((prev) => (prev + 1) % shuffledList.length);
  }, [shuffledList.length]);

  const checkAnswer = useCallback(
    (inputKeys: string[]) => {
      if (!isRunning || !currentShortcut) return;

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
        const multiplier = Math.min(Math.floor(combo / 3) + 1, 4);
        const pointsEarned = 10 * multiplier;
        setScore((prev) => prev + pointsEarned);
        setCombo((prev) => prev + 1);
        advanceNext();
      } else {
        const hasLetter = inputKeys.some(
          (k) => !['Control', 'Alt', 'Shift', 'Meta'].includes(k)
        );
        if (hasLetter) {
          if (soundEnabled) playErrorSound();
          setCombo(0);
        }
      }
    },
    [isRunning, currentShortcut, soundEnabled, combo, advanceNext]
  );

  useEffect(() => {
    if (activePhysicalKeys.length > 0 && isRunning) {
      checkAnswer(activePhysicalKeys);
    }
  }, [activePhysicalKeys, isRunning, checkAnswer]);

  const handleVirtualKeyPress = (key: string) => {
    if (!isRunning) return;
    const isModifier = ['Control', 'Alt', 'Shift'].includes(key);

    if (isModifier) {
      setVirtualPressedKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    } else {
      const fullCombo = [...virtualPressedKeys, key];
      checkAnswer(fullCombo);
      setVirtualPressedKeys([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="bg-gradient-to-r from-[#171f54] to-[#243387] rounded-3xl p-6 text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-extrabold tracking-tight">
              SprintPlus Speed Run (60 Seconden)
            </h2>
          </div>
          <p className="text-xs text-blue-200">
            Hoeveel sneltoetsen herken je binnen één minuut? Test je reflexen!
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-xs">
            <div className="text-[10px] uppercase font-bold text-amber-300">Hoogste Score</div>
            <div className="text-xl font-mono font-black">{highScore}</div>
          </div>
        </div>
      </div>

      {!isRunning && !isGameOver ? (
        /* Start Screen */
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-sm border border-slate-200 space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <Zap className="w-10 h-10" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-2xl font-black text-slate-900">Klaar voor de Sprint?</h3>
            <p className="text-sm text-slate-600">
              Je krijgt 60 seconden om zoveel mogelijk sneltoetsen foutloos in te typen.
              Voor elke goede combinatie verdien je punten en combo-multipliers!
            </p>
          </div>
          <button
            type="button"
            onClick={startSpeedRun}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-base rounded-2xl shadow-md hover:shadow-lg transition-all scale-100 hover:scale-105 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>START SPEED RUN</span>
          </button>
        </div>
      ) : isGameOver ? (
        /* Game Over Scorecard */
        <div className="bg-white rounded-3xl p-8 sm:p-10 text-center shadow-sm border border-slate-200 space-y-6 animate-fadeIn">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Trophy className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Tijd is om!
            </div>
            <h3 className="text-3xl font-black text-slate-900">
              Eindscore: <span className="text-blue-600 font-mono">{score}</span>
            </h3>
            {isNewHigh && (
              <div className="inline-block px-4 py-1.5 bg-amber-100 text-amber-900 font-extrabold text-sm rounded-full animate-bounce">
                🎉 NIEUWE HOOGSTE SCORE! 🎉
              </div>
            )}
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Knap geprobeerd! Hoe vaker je speelt, hoe sneller je vingers automatisch naar de juiste toetsen gaan.
            </p>
          </div>
          <button
            type="button"
            onClick={startSpeedRun}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#202A76] hover:bg-[#18215d] text-white font-bold text-sm rounded-2xl shadow-sm transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Opnieuw Proberen</span>
          </button>
        </div>
      ) : (
        /* Active Run Screen */
        <div className="space-y-6">
          {/* HUD Bar */}
          <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Tijd</div>
              <div
                className={`text-2xl sm:text-3xl font-mono font-black ${
                  timeLeft <= 10 ? 'text-rose-600 animate-pulse' : 'text-slate-900'
                }`}
              >
                {timeLeft}s
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Score</div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-blue-600">
                {score}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Combo
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-amber-500">
                x{Math.min(Math.floor(combo / 3) + 1, 4)} ({combo})
              </div>
            </div>
          </div>

          {/* Active Flash Prompt */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 text-center shadow-sm border-2 border-blue-500 space-y-4">
            <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
              {currentShortcut?.category}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {currentShortcut?.title}
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              "{currentShortcut?.scenarioQuestions[0]}"
            </p>

            <div className="pt-2 text-xs font-semibold text-slate-400 font-mono">
              Toets aanslag vereist
            </div>
          </div>

          {/* Virtual Keyboard */}
          <Keyboard
            layout={keyboardLayout}
            onLayoutChange={onLayoutChange}
            activeKeys={[...new Set([...virtualPressedKeys, ...activePhysicalKeys])]}
            targetKeys={currentShortcut ? currentShortcut.keys : []}
            showHints={false}
            onVirtualKeyPress={handleVirtualKeyPress}
            interactive={true}
            shortcuts={shortcuts}
          />
        </div>
      )}
    </div>
  );
};
