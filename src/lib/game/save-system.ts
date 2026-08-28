import { level1 } from './levels';

export interface GameSave {
  id: string;
  name: string;
  timestamp: number;
  score: number;
  highScore: number;
  achievements: string[];
  currentLevel: string;
  health: number;
  phasePreview?: string | undefined;
}

const STORAGE_KEY = 'monkey-long-saves';

export const saveSystem = {
  getSaves: (): GameSave[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveGame: (slotId: string, name: string, data: Partial<GameSave>) => {
    const saves = saveSystem.getSaves();
    const existingIndex = saves.findIndex(s => s.id === slotId);

    const newSave: GameSave = {
      id: slotId,
      name: name,
      timestamp: Date.now(),
      score: data.score || 0,
      highScore: data.highScore || 0,
      achievements: data.achievements || [],
      currentLevel: data.currentLevel || 'Level 1',
      health: data.health || 3,
      phasePreview: data.phasePreview,
    };

    if (existingIndex >= 0) {
      saves[existingIndex] = newSave;
    } else {
      saves.push(newSave);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
    return newSave;
  },

  autoSave: (data: Partial<GameSave>) => {
    return saveSystem.saveGame('autosave', 'Auto Save', data);
  },

  deleteSave: (slotId: string) => {
    const saves = saveSystem.getSaves().filter(s => s.id !== slotId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
  }
};
