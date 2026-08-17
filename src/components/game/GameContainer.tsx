import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useGameLoop } from '@/hooks/useGameLoop';
import { level1 } from '@/lib/game/levels';
import { Heart, Trophy, RefreshCw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SaveManager from './save-management/SaveManager';
import { GameSave, saveSystem } from '@/lib/game/save-system';
import { toast } from 'sonner';


const GRAVITY = 1500;
const JUMP_FORCE = -700;
const MOVE_SPEED = 300;
const FRICTION = 0.8;
const MAX_HEALTH = 3;
const STORAGE_KEY_ACHIEVEMENTS = 'monkey-long-achievements';
const STORAGE_KEY_HIGHSCORE = 'monkey-long-highscore';
const STORAGE_KEY_AUTOSAVE_INTERVAL = 'monkey-long-autosave-interval';

export default function GameContainer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [gameState, setGameState] = useState<'playing' | 'gameover' | 'victory'>('playing');
  const [player, setPlayer] = useState({ x: 100, y: 400, vx: 0, vy: 0, width: 40, height: 40, isGrounded: false, health: MAX_HEALTH, invulnerable: 0 });
  const [cameraX, setCameraX] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [collectibles, setCollectibles] = useState(level1.collectibles.map(c => ({ ...c, active: true })));
  const [enemies, setEnemies] = useState(level1.enemies.map(e => ({ ...e })));
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showSaveManager, setShowSaveManager] = useState(false);

  const [lastAutoSaveTime, setLastAutoSaveTime] = useState(Date.now());
  const [autoSaveInterval, setAutoSaveInterval] = useState(60000); // Default 60 seconds

  const keys = useRef<{ [key: string]: boolean }>({});

  // Load saved data on mount
  useEffect(() => {
    const savedAchievements = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
    const savedHighScore = localStorage.getItem(STORAGE_KEY_HIGHSCORE);
    const savedAutoSaveInterval = localStorage.getItem(STORAGE_KEY_AUTOSAVE_INTERVAL);
    
    if (savedAchievements) {
      try {
        setAchievements(JSON.parse(savedAchievements));
      } catch (e) {
        console.error("Failed to parse saved achievements", e);
      }
    }
    
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10) || 0);
    }

    if (savedAutoSaveInterval) {
      setAutoSaveInterval(parseInt(savedAutoSaveInterval, 10) || 60000);
    }
  }, []);

  const resetGame = () => {
    setPlayer({ x: 100, y: 400, vx: 0, vy: 0, width: 40, height: 40, isGrounded: false, health: MAX_HEALTH, invulnerable: 0 });
    setScore(0);
    setCollectibles(level1.collectibles.map(c => ({ ...c, active: true })));
    setEnemies(level1.enemies.map(e => ({ ...e })));
    setGameState('playing');
    setCameraX(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keys.current[e.code] = true;
    const handleKeyUp = (e: KeyboardEvent) => keys.current[e.code] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const addAchievement = (text: string) => {
    setAchievements(prev => {
      if (!prev.includes(text)) {
        const next = [...prev, text];
        localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(next));
        toast.success(`Conquista: ${text}`);
        return next;
      }
      return prev;
    });
  };

  const performAutoSave = useCallback(() => {
    saveSystem.autoSave({
      score,
      highScore,
      achievements,
      health: player.health,
      currentLevel: 'Level 1'
    });
    setLastAutoSaveTime(Date.now());
    toast.info(`Jogo salvo automaticamente (${autoSaveInterval / 1000}s)`, { duration: 2000 });
  }, [score, highScore, achievements, player.health, autoSaveInterval]);

  const handleAutoSaveIntervalChange = (interval: number) => {
    setAutoSaveInterval(interval);
    localStorage.setItem(STORAGE_KEY_AUTOSAVE_INTERVAL, interval.toString());
    toast.success(`Intervalo de auto save alterado para ${interval / 1000}s`);
  };

  // Periodic AutoSave
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const timer = setInterval(() => {
      performAutoSave();
    }, autoSaveInterval);

    return () => clearInterval(timer);
  }, [gameState, performAutoSave, autoSaveInterval]);

  const loadGame = (save: GameSave) => {
    setPlayer({ 
      x: 100, 
      y: 400, 
      vx: 0, 
      vy: 0, 
      width: 40, 
      height: 40, 
      isGrounded: false, 
      health: save.health, 
      invulnerable: 0 
    });
    setScore(save.score);
    setHighScore(save.highScore);
    setAchievements(save.achievements);
    setCollectibles(level1.collectibles.map(c => ({ ...c, active: true }))); // Simplified
    setEnemies(level1.enemies.map(e => ({ ...e })));
    setGameState('playing');
    setCameraX(0);
    setShowSaveManager(false);
  };


  const update = useCallback((deltaTime: number) => {
    if (gameState !== 'playing') return;

    setPlayer(prev => {
      let newVx = prev.vx;
      let newVy = prev.vy + GRAVITY * deltaTime;
      let newInvulnerable = Math.max(0, prev.invulnerable - deltaTime);

      if (keys.current['ArrowLeft'] || keys.current['KeyA']) newVx = -MOVE_SPEED;
      else if (keys.current['ArrowRight'] || keys.current['KeyD']) newVx = MOVE_SPEED;
      else newVx *= FRICTION;

      if ((keys.current['ArrowUp'] || keys.current['KeyW'] || keys.current['Space']) && prev.isGrounded) {
        newVy = JUMP_FORCE;
      }

      let newX = prev.x + newVx * deltaTime;
      let newY = prev.y + newVy * deltaTime;
      let isGrounded = false;
      let newHealth = prev.health;

      // Platform Collisions
      level1.platforms.forEach(p => {
        if (
          newX < p.position.x + p.size.x &&
          newX + prev.width > p.position.x &&
          newY < p.position.y + p.size.y &&
          newY + prev.height > p.position.y
        ) {
          if (prev.y + prev.height <= p.position.y) {
            newY = p.position.y - prev.height;
            newVy = 0;
            isGrounded = true;
          } else if (prev.y >= p.position.y + p.size.y) {
            newY = p.position.y + p.size.y;
            newVy = 0;
          } else if (prev.x + prev.width <= p.position.x) {
            newX = p.position.x - prev.width;
            newVx = 0;
          } else if (prev.x >= p.position.x + p.size.x) {
            newX = p.position.x + p.size.x;
            newVx = 0;
          }
        }
      });

      // Obstacle & Enemy Collisions
      if (newInvulnerable === 0) {
        let hit = false;
        
        // Static Obstacles
        level1.obstacles.forEach(o => {
          if (newX < o.position.x + o.size.x && newX + prev.width > o.position.x && newY < o.position.y + o.size.y && newY + prev.height > o.position.y) {
            hit = true;
          }
        });

        // Dynamic Enemies
        enemies.forEach(e => {
          if (newX < e.position.x + e.size.x && newX + prev.width > e.position.x && newY < e.position.y + e.size.y && newY + prev.height > e.position.y) {
            hit = true;
          }
        });

        if (hit) {
          newHealth -= 1;
          newInvulnerable = 1.5; // 1.5 seconds of invulnerability
          if (newHealth <= 0) {
            setGameState('gameover');
          }
        }
      }

      // Goal Collision
      if (newX < level1.goal.position.x + level1.goal.size.x && newX + prev.width > level1.goal.position.x && newY < level1.goal.position.y + level1.goal.size.y && newY + prev.height > level1.goal.position.y) {
        setGameState('victory');
        addAchievement("Jungle Explorer");
        
        // Save high score
        setScore(currentScore => {
          setHighScore(prevHigh => {
            const nextHigh = Math.max(prevHigh, currentScore);
            localStorage.setItem(STORAGE_KEY_HIGHSCORE, nextHigh.toString());
            
            // Completion AutoSave
            saveSystem.autoSave({
              score: currentScore,
              highScore: nextHigh,
              achievements: [...achievements, "Jungle Explorer"],
              health: prev.health,
              currentLevel: 'Level 1 (Complete)'
            });
            toast.success("Progresso salvo ao completar a fase!");
            
            return nextHigh;
          });
          return currentScore;
        });
      }

      // Death by falling
      if (newY > 700) {
        newHealth -= 1;
        newX = 100;
        newY = 400;
        newVx = 0;
        newVy = 0;
        if (newHealth <= 0) setGameState('gameover');
      }

      return { ...prev, x: newX, y: newY, vx: newVx, vy: newVy, isGrounded, health: newHealth, invulnerable: newInvulnerable };
    });

    // Update Enemies
    setEnemies(prev => prev.map(e => {
      if (e.type === 'patrol' && e.startPos && e.range && e.speed) {
        const offset = Math.sin(Date.now() / 1000 * (e.speed / 100)) * (e.range / 2);
        return { ...e, position: { ...e.position, x: e.startPos.x + offset } };
      }
      return e;
    }));

    // Camera follow
    setCameraX(prev => {
      const target = player.x - 400;
      return prev + (target - prev) * 0.1;
    });

    // Collectibles
    setCollectibles(prev => {
      let collectedAny = false;
      const next = prev.map(c => {
        if (c.active && 
            player.x < c.position.x + c.size.x &&
            player.x + player.width > c.position.x &&
            player.y < c.position.y + c.size.y &&
            player.y + player.height > c.position.y) {
          setScore(s => s + 100);
          collectedAny = true;
          return { ...c, active: false };
        }
        return c;
      });
      
      const allCollected = next.every(c => !c.active);
      if (allCollected) addAchievement("Banana King");
      
      return next;
    });

  }, [player, gameState, enemies, achievements]);

  useGameLoop((deltaTime) => {
    update(deltaTime);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-cameraX, 0);

    // Sky
    ctx.fillStyle = '#BAE6FD';
    ctx.fillRect(cameraX, 0, canvas.width, canvas.height);

    // Platforms
    ctx.fillStyle = '#65A30D';
    level1.platforms.forEach(p => {
      ctx.beginPath();
      ctx.roundRect(p.position.x, p.position.y, p.size.x, p.size.y, 8);
      ctx.fill();
    });

    // Obstacles (Spikes)
    ctx.fillStyle = '#EF4444';
    level1.obstacles.forEach(o => {
      ctx.beginPath();
      ctx.moveTo(o.position.x, o.position.y + o.size.y);
      ctx.lineTo(o.position.x + o.size.x / 2, o.position.y);
      ctx.lineTo(o.position.x + o.size.x, o.position.y + o.size.y);
      ctx.fill();
    });

    // Enemies (Crabs/Monsters)
    ctx.fillStyle = '#991B1B';
    enemies.forEach(e => {
      ctx.beginPath();
      ctx.roundRect(e.position.x, e.position.y, e.size.x, e.size.y, 4);
      ctx.fill();
      // Eyes
      ctx.fillStyle = 'white';
      ctx.fillRect(e.position.x + 5, e.position.y + 5, 5, 5);
      ctx.fillRect(e.position.x + e.size.x - 10, e.position.y + 5, 5, 5);
      ctx.fillStyle = '#991B1B';
    });

    // Collectibles
    ctx.fillStyle = '#FACC15';
    collectibles.forEach(c => {
      if (c.active) {
        ctx.beginPath();
        ctx.arc(c.position.x + 15, c.position.y + 15, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Goal
    ctx.fillStyle = '#8B5CF6';
    ctx.fillRect(level1.goal.position.x, level1.goal.position.y, level1.goal.size.x, level1.goal.size.y);

    // Player
    if (player.invulnerable <= 0 || Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.roundRect(player.x, player.y, player.width, player.height, 10);
      ctx.fill();
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.arc(player.x + player.width/2, player.y + 15, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(player.x, player.y + 15, 6, 0, Math.PI * 2);
      ctx.arc(player.x + player.width, player.y + 15, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });

  return (
    <div className="relative flex flex-col items-center gap-4" ref={containerRef}>
      {/* HUD */}
      <div className="w-full flex justify-between items-center bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-stone-200">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {[...Array(MAX_HEALTH)].map((_, i) => (
              <Heart key={i} className={`w-6 h-6 ${i < player.health ? 'fill-red-500 text-red-500' : 'text-stone-300'}`} />
            ))}
          </div>
          <div className="h-8 w-px bg-stone-200" />
          <div className="flex flex-col">
            <div className="text-xl font-bold text-stone-700 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              {score.toLocaleString()}
            </div>
            {highScore > 0 && (
              <div className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">
                Best: {highScore.toLocaleString()}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          {achievements.map((a, i) => (
            <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium border border-purple-200">
              {a}
            </span>
          ))}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSaveManager(true)}
            className="ml-2 bg-stone-100 border-stone-200 hover:bg-stone-200 rounded-lg gap-2 font-bold"
          >
            <Save className="w-4 h-4" /> Saves
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => performAutoSave()}
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg gap-2 font-bold"
          >
            <Save className="w-4 h-4" /> Save Now
          </Button>
        </div>
      </div>

      {showSaveManager && (
        <SaveManager 
          onLoad={loadGame}
          onClose={() => setShowSaveManager(false)}
          currentGameState={{
            score,
            highScore,
            achievements,
            health: player.health
          }}
          autoSaveInterval={autoSaveInterval}
          onAutoSaveIntervalChange={handleAutoSaveIntervalChange}
        />
      )}


      <div className="relative overflow-hidden rounded-2xl shadow-2xl border-8 border-stone-800 bg-stone-900">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={600} 
          className="block"
        />

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8">
            <h2 className="text-6xl font-black mb-2 text-red-500 italic uppercase">Game Over</h2>
            <p className="text-xl text-stone-300 mb-8 font-medium">Try again, Monkey Long!</p>
            <div className="bg-white/10 p-6 rounded-2xl mb-8 w-64 text-center">
              <div className="text-stone-400 text-sm uppercase tracking-widest mb-1">Final Score</div>
              <div className="text-4xl font-bold">{score}</div>
              {score > highScore && <div className="text-yellow-400 text-xs mt-2 font-bold animate-pulse italic">NEW BEST!</div>}
            </div>
            <Button onClick={resetGame} size="lg" className="bg-red-600 hover:bg-red-700 text-white gap-2 text-lg px-8 py-6 rounded-xl">
              <RefreshCw className="w-6 h-6" /> Restart
            </Button>
          </div>
        )}

        {/* Victory Screen */}
        {gameState === 'victory' && (
          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8">
            <h2 className="text-6xl font-black mb-2 text-yellow-400 italic uppercase">Victory!</h2>
            <p className="text-xl text-stone-300 mb-8 font-medium">You reached the golden jungle!</p>
            <div className="bg-white/10 p-6 rounded-2xl mb-8 w-64 text-center">
              <div className="text-stone-400 text-sm uppercase tracking-widest mb-1">Final Score</div>
              <div className="text-4xl font-bold">{score}</div>
            </div>
            <Button onClick={resetGame} size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black gap-2 text-lg px-8 py-6 rounded-xl font-bold">
              <RefreshCw className="w-6 h-6" /> Play Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}