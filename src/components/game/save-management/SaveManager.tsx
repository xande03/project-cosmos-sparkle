import React, { useState, useEffect } from 'react';
import { saveSystem, GameSave } from '@/lib/game/save-system';
import { Button } from '@/components/ui/button';
import { Save, Trash2, Play, X, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface SaveManagerProps {
  onLoad: (save: GameSave) => void;
  onClose: () => void;
  currentGameState: Partial<GameSave>;
  phasePreview?: string | undefined;
  autoSaveInterval: number;
  onAutoSaveIntervalChange: (interval: number) => void;
}

export default function SaveManager({
  onLoad,
  onClose,
  currentGameState,
  phasePreview,
  autoSaveInterval,
  onAutoSaveIntervalChange
}: SaveManagerProps) {
  const [saves, setSaves] = useState<GameSave[]>([]);
  const [confirmingSlot, setConfirmingSlot] = useState<{ id: string, type: 'save' | 'delete' } | null>(null);
  const slots = ['slot-1', 'slot-2', 'slot-3'];

  useEffect(() => {
    setSaves(saveSystem.getSaves());
  }, []);

  const handleSave = (slotId: string) => {
    const existingSave = saves.find(s => s.id === slotId);
    if (existingSave) {
      setConfirmingSlot({ id: slotId, type: 'save' });
    } else {
      executeSave(slotId);
    }
  };

  const executeSave = (slotId: string) => {
    const name = `Jungle Run ${saves.length + 1}`;
    saveSystem.saveGame(slotId, name, {
      ...currentGameState,
      phasePreview,
    });
    setSaves(saveSystem.getSaves());
    setConfirmingSlot(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, slotId: string) => {
    e.stopPropagation();
    setConfirmingSlot({ id: slotId, type: 'delete' });
  };

  const executeDelete = (slotId: string) => {
    saveSystem.deleteSave(slotId);
    setSaves(saveSystem.getSaves());
    setConfirmingSlot(null);
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
              const isConfirming = confirmingSlot?.id === slotId;
              
              return (
                <div 
                  key={slotId}
                  className={`group relative p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between
                    ${save 
                      ? 'bg-white border-stone-200 hover:border-green-500 hover:shadow-lg' 
                      : 'bg-stone-50 border-dashed border-stone-300 hover:border-stone-400'}`}
                  onClick={() => !isConfirming && save && onLoad(save)}
                >
                  {isConfirming ? (
                    <div className="flex-1 flex items-center justify-between animate-in fade-in slide-in-from-left-2 duration-200">
                      <div className="flex flex-col">
                        <span className="font-bold text-stone-800 text-sm">
                          {confirmingSlot.type === 'save' ? 'Overwrite this slot?' : 'Delete this save?'}
                        </span>
                        <span className="text-stone-500 text-[10px] uppercase font-bold tracking-tighter">This action cannot be undone</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="rounded-lg h-8 text-xs font-bold"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmingSlot(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          className={`rounded-lg h-8 text-xs font-bold ${confirmingSlot.type === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmingSlot.type === 'save' ? executeSave(slotId) : executeDelete(slotId);
                          }}
                        >
                          Confirm
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 flex items-center justify-center flex-shrink-0">
                          {save?.phasePreview ? (
                            <img 
                              src={save.phasePreview} 
                              alt="Phase preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Play className={`w-5 h-5 ${save ? 'text-green-500' : 'text-stone-400'}`} />
                          )}
                        </div>
                        
                        <div>
                          {save ? (
                            <>
                              <h3 className="font-bold text-stone-800">{save.name}</h3>
                              <div className="flex gap-3 text-xs text-stone-500 font-medium">
                                <span>Score: {save.score}</span>
                                <span>•</span>
                                <span>{save.currentLevel}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-stone-400 font-medium mt-1">
                                <Clock className="w-3 h-3" />
                                <span>{format(save.timestamp, 'MMM d, yyyy • HH:mm')}</span>
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
                            onClick={(e) => handleDeleteClick(e, slotId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </>
                  )}
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
