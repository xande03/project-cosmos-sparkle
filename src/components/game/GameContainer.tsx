import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useGameLoop } from '@/hooks/useGameLoop';
import { level1 } from '@/lib/game/levels';
import { Heart, Trophy, RefreshCw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SaveManager from './save-management/SaveManager';
import { GameSave, saveSystem } from '@/lib/game/save-system';
import { toast } from 'sonner';

const GRAVITY = 1200;
const JUMP_FORCE = -550;
const MOVE_SPEED = 250;
const FRICTION = 0.8;
const MAX_HEALTH = 3;
const STORAGE_KEY_ACHIEVEMENTS = 'monkey-long-achievements';
const STORAGE_KEY_HIGHSCORE = 'monkey-long-highscore';
const STORAGE_KEY_AUTOSAVE_INTERVAL = 'monkey-long-autosave-interval';
const LOGICAL_WIDTH = 900;
const LOGICAL_HEIGHT = 600;

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

  // Resize canvas to fill the window
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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
        if (newY > LOGICAL_HEIGHT + 100) {
          newHealth -= 1;
          newX = 100;
          newY = 300;
          newVx = 0;
          newVy = 0;
          newInvulnerable = 2.0;
          if (newHealth <= 0) {
            setGameState('gameover');
            if (score > highScore) {
              setHighScore(score);
              localStorage.setItem(STORAGE_KEY_HIGHSCORE, score.toString());
            }
          } else {
            toast.error('Você caiu! -1 vida', { duration: 2000 });
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

    // Scale to fill the entire screen
    const scaleX = canvas.width / LOGICAL_WIDTH;
    const scaleY = canvas.height / LOGICAL_HEIGHT;
    ctx.scale(scaleX, scaleY);

    ctx.translate(-cameraX, 0);

    // Sky gradient
    const sky = ctx.createLinearGradient(cameraX, 0, cameraX, LOGICAL_HEIGHT);
    sky.addColorStop(0, '#7ec8e3');
    sky.addColorStop(1, '#c9e8f5');
    ctx.fillStyle = sky;
    ctx.fillRect(cameraX, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // Trees (background decoration)
    level1.trees?.forEach((t) => {
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(
        t.position.x + t.size.x / 2 - 6,
        t.position.y + t.size.y * 0.4,
        12,
        t.size.y * 0.6,
      );
      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.arc(t.position.x + t.size.x / 2, t.position.y + t.size.y * 0.3, t.size.x / 1.6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Birds
    ctx.fillStyle = '#37474f';
    level1.birds?.forEach((b) => {
      const bx = b.position.x + ((Date.now() / 1000) * (b.speed ?? 2) * 40) % (level1.width + 200) - 100;
      const by = b.position.y + Math.sin(Date.now() / 300 + b.position.x) * 10;
      ctx.beginPath();
      ctx.ellipse(bx, by, b.size.x / 2, b.size.y / 3, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Platforms
    level1.platforms.forEach((p) => {
      ctx.fillStyle = '#6d4c41';
      ctx.fillRect(p.position.x, p.position.y, p.size.x, p.size.y);
      ctx.fillStyle = '#43a047';
      ctx.fillRect(p.position.x, p.position.y, p.size.x, Math.min(8, p.size.y));
    });

    // Obstacles (spikes)
    level1.obstacles.forEach((o) => {
      ctx.fillStyle = '#c62828';
      const spikes = 3;
      const w = o.size.x / spikes;
      for (let i = 0; i < spikes; i++) {
        ctx.beginPath();
        ctx.moveTo(o.position.x + i * w, o.position.y + o.size.y);
        ctx.lineTo(o.position.x + i * w + w / 2, o.position.y);
        ctx.lineTo(o.position.x + (i + 1) * w, o.position.y + o.size.y);
        ctx.closePath();
        ctx.fill();
      }
    });

    // Enemies
    enemies.forEach((e) => {
      ctx.fillStyle = '#7b1fa2';
      ctx.fillRect(e.position.x, e.position.y, e.size.x, e.size.y);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(e.position.x + 8, e.position.y + 10, 8, 8);
      ctx.fillRect(e.position.x + e.size.x - 16, e.position.y + 10, 8, 8);
      ctx.fillStyle = '#000000';
      ctx.fillRect(e.position.x + 10, e.position.y + 12, 4, 4);
      ctx.fillRect(e.position.x + e.size.x - 14, e.position.y + 12, 4, 4);
    });

    // Collectibles (bananas)
    collectibles.forEach((c) => {
      if (!c.active) return;
      ctx.fillStyle = '#fdd835';
      ctx.beginPath();
      ctx.arc(
        c.position.x + c.size.x / 2,
        c.position.y + c.size.y / 2,
        c.size.x / 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle = '#f9a825';
      ctx.lineWidth = 3;
      ctx.stroke();
    });

    // Goal flag
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(level1.goal.position.x + 5, level1.goal.position.y, 6, level1.goal.size.y);
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.moveTo(level1.goal.position.x + 11, level1.goal.position.y);
    ctx.lineTo(level1.goal.position.x + level1.goal.size.x, level1.goal.position.y + 18);
    ctx.lineTo(level1.goal.position.x + 11, level1.goal.position.y + 36);
    ctx.closePath();
    ctx.fill();

    // Player (monkey) — blinks while invulnerable
    const blink = player.invulnerable > 0 && Math.floor(Date.now() / 100) % 2 === 0;
    if (!blink) {
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(player.x, player.y, player.width, player.height);
      ctx.fillStyle = '#d7ccc8';
      ctx.fillRect(player.x + 6, player.y + 12, player.width - 12, player.height - 20);
      ctx.fillStyle = '#000000';
      ctx.fillRect(player.x + 10, player.y + 8, 5, 5);
      ctx.fillRect(player.x + player.width - 15, player.y + 8, 5, 5);
    }

    ctx.restore();
  });

  return (
    <div ref={containerRef} className="relative w-screen h-screen overflow-hidden bg-stone-900">
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="flex items-center gap-1 bg-stone-900/70 rounded-full px-4 py-2">
            {Array.from({ length: MAX_HEALTH }).map((_, i) => (
              <Heart
                key={i}
                className={`w-5 h-5 ${i < player.health ? 'text-red-500 fill-red-500' : 'text-stone-600'}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 bg-stone-900/70 rounded-full px-4 py-2 text-white font-bold">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>{score}</span>
            <span className="text-stone-400 text-sm">| Best: {highScore}</span>
          </div>
          {achievements.length > 0 && (
            <div className="flex flex-wrap gap-1 max-w-xs">
              {achievements.map((a) => (
                <Badge key={a} className="bg-yellow-500 text-stone-900 font-bold">
                  {a}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 pointer-events-auto">
          <Button
            variant="outline"
            size="sm"
            className="bg-stone-900/70 text-white border-stone-700 gap-2"
            onClick={performAutoSave}
          >
            <Save className="w-4 h-4" /> Salvar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-stone-900/70 text-white border-stone-700"
            onClick={() => setShowSaveManager(true)}
          >
            Saves
          </Button>
        </div>
      </div>

      {/* Game Over */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-3xl p-10 text-center shadow-2xl">
            <h2 className="text-4xl font-black text-red-600 uppercase italic mb-2">Game Over</h2>
            <p className="text-stone-600 font-bold mb-1">Pontuação: {score}</p>
            <p className="text-stone-400 text-sm mb-6">Recorde: {highScore}</p>
            <Button onClick={resetGame} className="bg-stone-800 gap-2 rounded-xl">
              <RefreshCw className="w-4 h-4" /> Reiniciar
            </Button>
          </div>
        </div>
      )}

      {/* Victory */}
      {gameState === 'victory' && (
        <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-3xl p-10 text-center shadow-2xl">
            <h2 className="text-4xl font-black text-green-600 uppercase italic mb-2">Vitória!</h2>
            <p className="text-stone-600 font-bold mb-1">Pontuação: {score}</p>
            <p className="text-stone-400 text-sm mb-6">Recorde: {highScore}</p>
            <Button onClick={resetGame} className="bg-green-600 hover:bg-green-700 gap-2 rounded-xl">
              <RefreshCw className="w-4 h-4" /> Jogar Novamente
            </Button>
          </div>
        </div>
      )}

      {/* Save Manager */}
      {showSaveManager && (
        <SaveManager
          onLoad={loadGame}
          onClose={() => setShowSaveManager(false)}
          currentGameState={{
            score,
            highScore,
            achievements,
            health: player.health,
            currentLevel: 'Level 1',
          }}
          phasePreview={canvasRef.current?.toDataURL('image/jpeg', 0.5)}
          autoSaveInterval={autoSaveInterval}
          onAutoSaveIntervalChange={handleAutoSaveIntervalChange}
        />
      )}
    </div>
  );
}