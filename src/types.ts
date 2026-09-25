export type ShortcutCategory =
  | 'Meest gebruikt'
  | 'Algemeen'
  | 'Tekst bewerken'
  | 'Tekenen'
  | 'Navigeren'
  | 'Tools (SprintPlus 4)';

export interface ShortcutItem {
  id: string;
  keys: string[]; // e.g. ['Alt', 'l'], ['k'], ['Control', 'z']
  displayKeys: string; // e.g. 'Alt + L', 'K', 'Ctrl + Z'
  title: string; // e.g. 'Lezen vanaf cursor / stoppen'
  category: ShortcutCategory;
  description: string;
  tips: string;
  hint: string;
  iconName: string;
  scenarioQuestions: string[]; // Real-world situations for pupils
  sprintPlusVersion?: 'SprintPlus 4 & online' | 'SprintPlus 4 (enkel)';
}

export type KeyboardLayout = 'AZERTY' | 'QWERTY';

export interface UserStats {
  totalPracticed: number;
  totalCorrect: number;
  currentStreak: number;
  bestStreak: number;
  speedRunHighScore: number;
  masteredShortcutIds: string[];
}

export type AppMode = 'practice' | 'speedrun' | 'explorer' | 'quiz' | 'cheatsheet';
