/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AppMode, KeyboardLayout, ShortcutItem, UserStats } from './types';
import { SPRINTPLUS_SHORTCUTS } from './data/shortcuts';
import { Header } from './components/Header';
import { PracticeMode } from './components/PracticeMode';
import { SpeedRunMode } from './components/SpeedRunMode';
import { ExplorerMode } from './components/ExplorerMode';
import { QuizMode } from './components/QuizMode';
import { CheatsheetMode } from './components/CheatsheetMode';

const STATS_STORAGE_KEY = 'sprintplus_buddy_stats';
const PREFS_STORAGE_KEY = 'sprintplus_buddy_prefs';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('practice');
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>('AZERTY');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(false);
  const [dyslexiaFont, setDyslexiaFont] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [targetPracticeShortcutId, setTargetPracticeShortcutId] = useState<string | null>(null);

  // Active physical pressed keys tracked in real time
  const [activePhysicalKeys, setActivePhysicalKeys] = useState<string[]>([]);

  // Persistent stats
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return {
      totalPracticed: 0,
      totalCorrect: 0,
      currentStreak: 0,
      bestStreak: 0,
      speedRunHighScore: 0,
      masteredShortcutIds: [],
    };
  });

  // Load preferences
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem(PREFS_STORAGE_KEY);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.layout) setKeyboardLayout(prefs.layout);
        if (prefs.sound !== undefined) setSoundEnabled(prefs.sound);
        if (prefs.tts !== undefined) setTtsEnabled(prefs.tts);
        if (prefs.dyslexia !== undefined) setDyslexiaFont(prefs.dyslexia);
        if (prefs.highContrast !== undefined) setHighContrast(prefs.highContrast);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Save preferences
  useEffect(() => {
    try {
      localStorage.setItem(
        PREFS_STORAGE_KEY,
        JSON.stringify({
          layout: keyboardLayout,
          sound: soundEnabled,
          tts: ttsEnabled,
          dyslexia: dyslexiaFont,
          highContrast,
        })
      );
    } catch {
      // Ignore
    }
  }, [keyboardLayout, soundEnabled, ttsEnabled, dyslexiaFont, highContrast]);

  // Save stats
  useEffect(() => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // Ignore
    }
  }, [stats]);

  // Global physical keyboard capture with browser shortcut safety
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If student is typing in a text input (e.g. name field), do not intercept
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      // Intercept browser default shortcuts that clash with SprintPlus training
      const isSprintShortcut =
        (e.ctrlKey && ['p', 'f', 'z', 'y', 'c', 'v', 'b', 'd', 'g', 'h', 'k', '-', '+', '='].includes(e.key.toLowerCase())) ||
        (e.altKey && e.key.toLowerCase() === 'l') ||
        ['Tab', ' '].includes(e.key) ||
        (e.shiftKey && ['d', 'm'].includes(e.key.toLowerCase()));

      if (isSprintShortcut && (currentMode === 'practice' || currentMode === 'speedrun' || currentMode === 'explorer')) {
        e.preventDefault();
      }

      // Robust key normalization across browser event differences
      let key = e.key;
      if (e.code === 'Space') key = ' ';
      else if (e.key === 'Control') key = 'Control';
      else if (e.key === 'Alt') key = 'Alt';
      else if (e.key === 'Shift') key = 'Shift';
      else if (e.key.length === 1) key = e.key.toLowerCase();

      setActivePhysicalKeys((prev) => {
        if (!prev.includes(key)) {
          return [...prev, key];
        }
        return prev;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      let key = e.key;
      if (e.code === 'Space') key = ' ';
      else if (e.key === 'Control') key = 'Control';
      else if (e.key === 'Alt') key = 'Alt';
      else if (e.key === 'Shift') key = 'Shift';
      else if (e.key.length === 1) key = e.key.toLowerCase();

      setActivePhysicalKeys((prev) => prev.filter((k) => k !== key));
    };

    // If window blurs, clear active keys
    const handleBlur = () => {
      setActivePhysicalKeys([]);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleBlur);
    };
  }, [currentMode]);

  // Update stats helper
  const handleUpdateStats = useCallback((correct: boolean, shortcutId: string) => {
    setStats((prev) => {
      const newStreak = correct ? prev.currentStreak + 1 : 0;
      const bestStreak = Math.max(prev.bestStreak, newStreak);
      const newMastered =
        correct && !prev.masteredShortcutIds.includes(shortcutId)
          ? [...prev.masteredShortcutIds, shortcutId]
          : prev.masteredShortcutIds;

      return {
        ...prev,
        totalPracticed: prev.totalPracticed + 1,
        totalCorrect: correct ? prev.totalCorrect + 1 : prev.totalCorrect,
        currentStreak: newStreak,
        bestStreak,
        masteredShortcutIds: newMastered,
      };
    });
  }, []);

  const handleSaveHighScore = (newScore: number) => {
    setStats((prev) => ({
      ...prev,
      speedRunHighScore: Math.max(prev.speedRunHighScore, newScore),
    }));
  };

  const handlePracticeSpecific = (shortcutIdOrItem: string | ShortcutItem) => {
    const id = typeof shortcutIdOrItem === 'string' ? shortcutIdOrItem : shortcutIdOrItem.id;
    setTargetPracticeShortcutId(id);
    setCurrentMode('practice');
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        highContrast
          ? 'bg-black text-yellow-300'
          : 'bg-[#f4f7fd] text-slate-800'
      } ${dyslexiaFont ? 'font-[Lexend,sans-serif]' : 'font-[Plus_Jakarta_Sans,sans-serif]'}`}
    >
      {/* SprintPlus Brand Header */}
      <Header
        currentMode={currentMode}
        onSelectMode={(mode) => {
          setCurrentMode(mode);
          if (mode !== 'practice') setTargetPracticeShortcutId(null);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        ttsEnabled={ttsEnabled}
        onToggleTts={() => setTtsEnabled(!ttsEnabled)}
        dyslexiaFont={dyslexiaFont}
        onToggleDyslexiaFont={() => setDyslexiaFont(!dyslexiaFont)}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        streak={stats.currentStreak}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentMode === 'practice' && (
          <PracticeMode
            shortcuts={SPRINTPLUS_SHORTCUTS}
            keyboardLayout={keyboardLayout}
            onLayoutChange={setKeyboardLayout}
            activePhysicalKeys={activePhysicalKeys}
            ttsEnabled={ttsEnabled}
            soundEnabled={soundEnabled}
            onUpdateStats={handleUpdateStats}
            masteredIds={stats.masteredShortcutIds}
            initialShortcutId={targetPracticeShortcutId}
          />
        )}

        {currentMode === 'speedrun' && (
          <SpeedRunMode
            shortcuts={SPRINTPLUS_SHORTCUTS}
            keyboardLayout={keyboardLayout}
            onLayoutChange={setKeyboardLayout}
            activePhysicalKeys={activePhysicalKeys}
            soundEnabled={soundEnabled}
            highScore={stats.speedRunHighScore}
            onSaveHighScore={handleSaveHighScore}
          />
        )}

        {currentMode === 'explorer' && (
          <ExplorerMode
            shortcuts={SPRINTPLUS_SHORTCUTS}
            keyboardLayout={keyboardLayout}
            onLayoutChange={setKeyboardLayout}
            activePhysicalKeys={activePhysicalKeys}
            ttsEnabled={ttsEnabled}
            onSelectPracticeShortcut={handlePracticeSpecific}
          />
        )}

        {currentMode === 'quiz' && (
          <QuizMode
            shortcuts={SPRINTPLUS_SHORTCUTS}
            soundEnabled={soundEnabled}
            ttsEnabled={ttsEnabled}
          />
        )}

        {currentMode === 'cheatsheet' && (
          <CheatsheetMode
            shortcuts={SPRINTPLUS_SHORTCUTS}
            onPracticeShortcut={(s) => handlePracticeSpecific(s.id)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#202A76]">SprintPlus Shortcut Buddy</span>
            <span>·</span>
            <span>Gemaakt voor leerlingen & onderwijs</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>SprintPlus 4 & SprintPlus.online</span>
            <span>·</span>
            <a
              href="https://www.sprintplus.be"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-700 transition-colors"
            >
              sprintplus.be
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
