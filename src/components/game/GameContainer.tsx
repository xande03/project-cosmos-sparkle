import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useGameLoop } from '@/hooks/useGameLoop';
import { level1 } from '@/lib/game/levels';
import { Heart, Trophy, RefreshCw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;

export default function GameContainer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [gameState, setGameState] = useState<'playing' | 'gameover' | 'victory'>('playing');
  const [player, setPlayer] = useState({
    x: 100,
    y: 400,
    vx: 0,
    vy: 0,
    width: 40,
    height: 40,
    isGrounded: false,
    health: MAX_HEALTH,
    invulnerable: 0,
  });
  const [cameraX, setCameraX] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [collectibles, setCollectibles] = useState(
    level1.collectibles.map((c) => ({ ...c, active: true })),
  );
  const [enemies, setEnemies] = useState(level1.enemies.map((e) => ({ ...e })));
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showSaveManager, setShowSaveManager] = useState(false);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState(Date.now());
  const [autoSaveInterval, setAutoSaveInterval] = useState(60000);

  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
    }

    const savedAchievements = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
    const savedHighScore = localStorage.getItem(STORAGE_KEY_HIGHSCORE);
    const savedAutoSaveInterval = localStorage.getItem(STORAGE_KEY_AUTOSAVE_INTERVAL);

    if (savedAchievements) {
      try {
        setAchievements(JSON.parse(savedAchievements));
      } catch (e) {
        console.error('Failed to parse saved achievements', e);
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
    setPlayer({
      x: 100,
      y: 400,
      vx: 0,
      vy: 0,
      width: 40,
      height: 40,
      isGrounded: false,
      health: MAX_HEALTH,
      invulnerable: 0,
    });
    setScore(0);
    setCollectibles(level1.collectibles.map((c) => ({ ...c, active: true })));
    setEnemies(level1.enemies.map((e) => ({ ...e })));
    setGameState('playing');
    setCameraX(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const addAchievement = (text: string) => {
    setAchievements((prev) => {
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
    const canvas = canvasRef.current;
    const phasePreview = canvas ? canvas.toDataURL('image/jpeg', 0.5) : undefined;

    saveSystem.autoSave({
      score,
      highScore,
      achievements,
      health: player.health,
      currentLevel: 'Level 1',
      phasePreview,
    });
    setLastAutoSaveTime(Date.now());
    toast.info(`Jogo salvo automaticamente (${autoSaveInterval / 1000}s)`, { duration: 2000 });
  }, [score, highScore, achievements, player.health, autoSaveInterval]);

  const handleAutoSaveIntervalChange = (interval: number) => {
    setAutoSaveInterval(interval);
    localStorage.setItem(STORAGE_KEY_AUTOSAVE_INTERVAL, interval.toString());
    toast.success(`Intervalo de auto save alterado para ${interval / 1000}s`);
  };

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
      invulnerable: 0,
    });
    setScore(save.score);
    setHighScore(save.highScore);
    setAchievements(save.achievements);
    setCollectibles(level1.collectibles.map((c) => ({ ...c, active: true })));
    setEnemies(level1.enemies.map((e) => ({ ...e })));
    setGameState('playing');
    setCameraX(0);
    setShowSaveManager(false);
  };

  const update = useCallback(
    (deltaTime: number) => {
      if (gameState !== 'playing') return;

      setPlayer((prev) => {
        let newVx = prev.vx;
        let newVy = prev.vy + GRAVITY * deltaTime;
        let newInvulnerable = Math.max(0, prev.invulnerable - deltaTime);

        if (keys.current['ArrowLeft'] || keys.current['KeyA']) newVx = -MOVE_SPEED;
        else if (keys.current['ArrowRight'] || keys.current['KeyD']) newVx = MOVE_SPEED;
        else newVx *= FRICTION;

        if (
          (keys.current['ArrowUp'] || keys.current['KeyW'] || keys.current['Space']) &&
          prev.isGrounded
        ) {
          newVy = JUMP_FORCE;
        }

        let newX = prev.x + newVx * deltaTime;
        let newY = prev.y + newVy * deltaTime;
        let isGrounded = false;
        let newHealth = prev.health;

        // Platform Collisions
        level1.platforms.forEach((p) => {
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
          level1.obstacles.forEach((o) => {
            if (
              newX < o.position.x + o.size.x &&
              newX + prev.width > o.position.x &&
              newY < o.position.y + o.size.y &&
              newY + prev.height > o.position.y
            ) {
              hit = true;
            }
          });

          // Dynamic Enemies
          enemies.forEach((e) => {
            if (
              newX < e.position.x + e.size.x &&
              newX + prev.width > e.position.x &&
              newY < e.position.y + e.size.y &&
              newY + prev.height > e.position.y
            ) {
              hit = true;
            }
          });

          if (hit) {
            newHealth -= 1;
            newInvulnerable = 1.5;
            if (newHealth <= 0) {
              setGameState('gameover');
            }
          }
        }

        // Goal Collision
        if (
          newX < level1.goal.position.x + level1.goal.size.x &&
          newX + prev.width > level1.goal.position.x &&
          newY < level1.goal.position.y + level1.goal.size.y &&
          newY + prev.height > level1.goal.position.y
        ) {
          setGameState('victory');
          addAchievement('Jungle Explorer');

          setScore((currentScore) => {
            setHighScore((prevHigh) => {
              const nextHigh = Math.max(prevHigh, currentScore);
              localStorage.setItem(STORAGE_KEY_HIGHSCORE, nextHigh.toString());

              saveSystem.autoSave({
                score: currentScore,
                highScore: nextHigh,
                achievements: [...achievements, 'Jungle Explorer'],
                health: prev.health,
                currentLevel: 'Level 1 (Complete)',
                phasePreview: canvasRef.current?.toDataURL('image/jpeg', 0.5),
              });
              toast.success('Progresso salvo ao completar a fase!');

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
          if (newHealth <= 0) {
            setGameState('gameover');
          }
        }

        return { ...prev, x: newX, y: newY, vx: newVx, vy: newVy, isGrounded, health: newHealth, invulnerable: newInvulnerable };
      });

      // Update Enemies
      setEnemies((prev) =>
        prev.map((e) => {
          if (e.type === 'patrol' && e.startPos && e.range && e.speed) {
            const offset = Math.sin(Date.now() / 1000 * (e.speed / 100)) * (e.range / 2);
            return { ...e, position: { ...e.position, x: e.startPos.x + offset } };
          }
          return e;
        }),
      );

      // Camera follow
      setCameraX((prev) => {
        const target = player.x - 400;
        return prev + (target - prev) * 0.1;
      });

      // Collectibles
      setCollectibles((prev) => {
        let collectedAny = false;
        const next = prev.map((c) => {
          if (
            c.active &&
            player.x < c.position.x + c.size.x &&
            player.x + player.width > c.position.x &&
            player.y < c.position.y + c.size.y &&
            player.y + player.height > c.position.y
          ) {
            setScore((s) => s + 100);
            collectedAny = true;
            return { ...c, active: false };
          }
          return c;
        });

        const allCollected = next.every((c) => !c.active);
        if (allCollected) addAchievement('Banana King');

        return next;
      });
    },
    [player, gameState, enemies, achievements],
  );

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
    level1.platforms.forEach((p) => {
      ctx.beginPath();
      ctx.roundRect(p.position.x, p.position.y, p.size.x, p.size.y, 8);
      ctx.fill();
    });

    // Obstacles (Spikes)
    ctx.fillStyle = '#EF4444';
    level1.obstacles.forEach((o) => {
      ctx.beginPath();
      ctx.moveTo(o.position.x, o.position.y + o.size.y);
      ctx.lineTo(o.position.x + o.size.x / 2, o.position.y);
      ctx.lineTo(o.position.x + o.size.x, o.position.y + o.size.y);
      ctx.fill();
    });

    // Enemies (Crabs/Monsters)
    ctx.fillStyle = '#991B1B';
    enemies.forEach((e) => {
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
    collectibles.forEach((c) => {
      if (c.active) {
        ctx.beginPath();
        ctx.arc(c.position.x + 15, c.position.y + 15, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Goal
    ctx.fillStyle = '#8B5CF6';
    ctx.fillRect(level1.goal.position.x, level1.goal.position.y, level1.goal.size.x, level1.goal.size.y);

    // Player — Monkey (Donkey Kong style)
    if (player.invulnerable <= 0 || Math.floor(Date.now() / 100) % 2 === 0) {
      const cx = player.x + player.width / 2;

      // Tail (curled behind)
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(player.x + 8, player.y + 24);
      ctx.quadraticCurveTo(player.x - 8, player.y + 20, player.x - 3, player.y + 10);
      ctx.stroke();

      // Legs
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.roundRect(player.x + 8, player.y + 30, 10, 9, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(player.x + 22, player.y + 30, 10, 9, 3);
      ctx.fill();

      // Feet
      ctx.fillStyle = '#44403C';
      ctx.beginPath();
      ctx.roundRect(player.x + 5, player.y + 36, 13, 4, 2);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(player.x + 22, player.y + 36, 13, 4, 2);
      ctx.fill();

      // Body
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.roundRect(player.x + 6, player.y + 14, 28, 20, 5);
      ctx.fill();

      // Belly
      ctx.fillStyle = '#A16207';
      ctx.beginPath();
      ctx.roundRect(player.x + 12, player.y + 20, 16, 10, 3);
      ctx.fill();

      // Arms
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.roundRect(player.x - 4, player.y + 18, 8, 6, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(player.x + 36, player.y + 18, 8, 6, 3);
      ctx.fill();

      // Head
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(cx, player.y + 6, 14, 0, Math.PI * 2);
      ctx.fill();

      // Ears
      ctx.fillStyle = '#A16207';
      ctx.beginPath();
      ctx.arc(cx - 12, player.y + 4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 12, player.y + 4, 5, 0, Math.PI * 2);
      ctx.fill();

      // Face
      ctx.fillStyle = '#A16207';
      ctx.beginPath();
      ctx.arc(cx, player.y + 8, 9, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(cx - 4, player.y + 5, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 4, player.y + 5, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1C1917';
      ctx.beginPath();
      ctx.arc(cx - 4, player.y + 5, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 4, player.y + 5, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Nose
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.ellipse(cx, player.y + 9, 2, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mouth
      ctx.strokeStyle = '#1C1917';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, player.y + 12, 3, 0, Math.PI);
      ctx.stroke();

      // Red tie (cosmetic)
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.moveTo(cx - 2, player.y + 16);
      ctx.lineTo(cx + 2, player.y + 16);
      ctx.lineTo(cx, player.y + 22);
      ctx.fill();
    }

    ctx.restore();
  });

  return (
    <div ref={containerRef} className="relative flex flex-col items-center justify-center min-h-screen bg-gray-900">
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          {Array.from({ length: player.health }, (_, i) => (
            <Heart key={i} className="w-6 h-6 text-red-500 fill-red-500" />
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            Score: {score}
          </Badge>
          <Badge variant="outline" className="text-lg px-3 py-1 text-yellow-400 border-yellow-400">
            <Trophy className="w-4 h-4 mr-1" />
            {highScore}
          </Badge>
          <div className="flex gap-2 pointer-events-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSaveManager(true)}
              title="Gerenciar saves"
              className="text-white hover:text-white"
            >
              <Save className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetGame}
              title="Reiniciar jogo"
              className="text-white hover:text-white"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative border-2 border-gray-700 rounded-lg overflow-hidden shadow-2xl">
        <canvas ref={canvasRef} className="block" />
      </div>

      {/* Game Over */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-red-500">Game Over</h2>
            <p className="text-xl text-white">Pontuação: {score}</p>
            <Button onClick={resetGame} variant="default" className="text-lg px-6 py-2">
              Tentar Novamente
            </Button>
          </div>
        </div>
      )}

      {/* Victory */}
      {gameState === 'victory' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-yellow-400">Você Venceu!</h2>
            <p className="text-xl text-white">Pontuação: {score}</p>
            <p className="text-lg text-green-400">Conquista: Jungle Explorer</p>
            <Button onClick={resetGame} variant="default" className="text-lg px-6 py-2">
              Jogar Novamente
            </Button>
          </div>
        </div>
      )}

      {/* Save Manager Modal */}
      {showSaveManager && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <SaveManager
              onLoad={loadGame}
              onClose={() => setShowSaveManager(false)}
              autoSaveInterval={autoSaveInterval}
              onAutoSaveIntervalChange={handleAutoSaveIntervalChange}
            />
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div className="mt-3 text-gray-400 text-sm">
        Use as setas do teclado ou WASD para mover e pular. Espaço também pula.
      </div>
    </div>
  );
}
