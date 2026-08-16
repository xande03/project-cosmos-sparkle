import React, { useState, useEffect } from 'react';
import { saveSystem, GameSave } from '@/lib/game/save-system';
import { Button } from '@/components/ui/button';
import { Save, Trash2, Play, Plus, X } from 'lucide-react';
import { format } from 'date-fns';

interface SaveManagerProps {
  onLoad: (save: GameSave) => void;
  onClose: () => void;
  currentGameState: Partial<GameSave>;
  autoSaveInterval: number;
  onAutoSaveIntervalChange: (interval: number) => void;
}

export default function SaveManager({ 
  onLoad, 
  onClose, 
  currentGameState,
  autoSaveInterval,
  onAutoSaveIntervalChange
}: SaveManagerProps) {
  const [saves, setSaves] = useState<GameSave[]>([]);
  const slots = ['slot-1', 'slot-2', 'slot-3'];

  useEffect(() => {
    setSaves(saveSystem.getSaves());
  }, []);

  const handleSave = (slotId: string) => {
    const name = `Jungle Run ${saves.length + 1}`;
    const newSave = saveSystem.saveGame(slotId, name, currentGameState);
    setSaves(saveSystem.getSaves());
  };

  const handleDelete = (e: React.MouseEvent, slotId: string) => {
    e.stopPropagation();
    saveSystem.deleteSave(slotId);
    setSaves(saveSystem.getSaves());
  };

  return (
    <div className="fixed inset-0 bg-stone-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-stone-100 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-2xl font-black text-stone-800 uppercase italic">Manage Saves</h2>
            <p className="text-stone-500 text-sm">Pick a slot to load or save your progress</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="p-8 flex flex-col gap-8 overflow-y-auto">
          {/* Auto Save Settings */}
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
            <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider mb-4">Auto Save Interval</h3>
            <div className="flex gap-2">
              {[15, 30, 60].map((seconds) => {
                const value = seconds * 1000;
                const isActive = autoSaveInterval === value;
                return (
                  <Button
                    key={seconds}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 rounded-xl font-bold ${isActive ? 'bg-stone-800 text-white' : 'bg-white text-stone-600'}`}
                    onClick={() => onAutoSaveIntervalChange(value)}
                  >
                    {seconds}s
                  </Button>
                );
              })}
            </div>
            <p className="text-[10px] text-stone-400 mt-2 font-medium">O jogo será salvo automaticamente no slot "Auto Save" a cada intervalo selecionado.</p>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">Save Slots</h3>
            {slots.map((slotId) => {
              const save = saves.find(s => s.id === slotId);
              
              return (
                <div 
                  key={slotId}
                  className={`group relative p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between
                    ${save 
                      ? 'bg-white border-stone-200 hover:border-green-500 hover:shadow-lg' 
                      : 'bg-stone-50 border-dashed border-stone-300 hover:border-stone-400'}`}
                  onClick={() => save && onLoad(save)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center 
                      ${save ? 'bg-green-100 text-green-600' : 'bg-stone-200 text-stone-400'}`}>
                      {save ? <Play className="w-6 h-6 fill-current" /> : <Plus className="w-6 h-6" />}
                    </div>
                    
                    <div>
                      {save ? (
                        <>
                          <h3 className="font-bold text-stone-800">{save.name}</h3>
                          <div className="flex gap-3 text-xs text-stone-500 font-medium">
                            <span>Score: {save.score}</span>
                            <span>•</span>
                            <span>{format(save.timestamp, 'MMM d, HH:mm')}</span>
                          </div>
                        </>
                      ) : (
                        <span className="font-bold text-stone-400 uppercase tracking-wider italic text-sm">Empty Slot</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800 text-white hover:bg-stone-900 border-none rounded-lg gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave(slotId);
                      }}
                    >
                      <Save className="w-4 h-4" /> Save
                    </Button>
                    
                    {save && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        onClick={(e) => handleDelete(e, slotId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 bg-white border-t border-stone-200 flex justify-center">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
            Monkey Long Saves System v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
