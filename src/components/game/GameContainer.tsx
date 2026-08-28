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

    // Scale to fill the entire screen
    const scaleX = canvas.width / LOGICAL_WIDTH;
    const scaleY = canvas.height / LOGICAL_HEIGHT;
    ctx.scale(scaleX, scaleY);

    ctx.translate(-cameraX, 0);

    // Draw background
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // Draw ground
    ctx.fillStyle = '#8B4513'; // Brown
    ctx.fillRect(0, 550, LOGICAL_WIDTH, 50);

    // Draw trees
    level1.trees?.forEach((tree) => {
      // Tree trunk
      ctx.fillStyle = '#654321'; // Dark brown
      ctx.fillRect(tree.position.x, tree.position.y, tree.size.x, tree.size.y);
      
      // Tree leaves (canopy)
      ctx.fillStyle = '#228B22'; // Forest green
      ctx.beginPath();
      ctx.arc(
        tree.position.x + tree.size.x / 2,
        tree.position.y - 20,
        30,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Draw birds
    level1.birds?.forEach((bird) => {
      ctx.fillStyle = '#000000'; // Black
      ctx.beginPath();
      ctx.arc(
        bird.position.x,
        bird.position.y,
        bird.size.x / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Draw wings
      ctx.beginPath();
      ctx.moveTo(bird.position.x - bird.size.x / 2, bird.position.y);
      ctx.lineTo(bird.position.x - bird.size.x, bird.position.y - 10);
      ctx.lineTo(bird.position.x - bird.size.x, bird.position.y + 10);
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(bird.position.x + bird.size.x / 2, bird.position.y);
      ctx.lineTo(bird.position.x + bird.size.x, bird.position.y - 10);
      ctx.lineTo(bird.position.x + bird.size.x, bird.position.y + 10);
      ctx.fill();
    });

    // Draw platforms
    level1.platforms.forEach((p) => {
      ctx.fillStyle = '#8B4513'; // Brown
      ctx.fillRect(p.position.x, p.position.y, p.size.x, p.size.y);
    });

    // Draw obstacles
    level1.obstacles.forEach((o) => {
      ctx.fillStyle = '#FF0000'; // Red
      ctx.fillRect(o.position.x, o.position.y, o.size.x, o.size.y);
    });

    // Draw enemies
    enemies.forEach((e) => {
      ctx.fillStyle = '#FF4500'; // Orange red
      ctx.fillRect(e.position.x, e.position.y, e.size.x, e.size.y);
    });

    // Draw collectibles
    collectibles.forEach((c) => {
      if (c.active) {
        ctx.fillStyle = '#FFFF00'; // Yellow
        ctx.beginPath();
        ctx.arc(
          c.position.x + c.size.x / 2,
          c.position.y + c.size.y / 2,
          c.size.x / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });

    // Draw goal
    ctx.fillStyle = '#00FF00'; // Green
    ctx.fillRect(level1.goal.position.x, level1.goal.position.y, level1.goal.size.x, level1.goal.size.y);

    // Draw player
    if (player.invulnerable % 0.2 < 0.1) {
      ctx.fillStyle = '#FFD700'; // Gold
      ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    // Draw health indicators
    for (let i = 0; i < MAX_HEALTH; i++) {
      ctx.fillStyle = i < player.health ? '#FF0000' : '#888888'; // Red or gray
      ctx.beginPath();
      ctx.arc(30 + i * 30, 30, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw score
    ctx.fillStyle = '#000000'; // Black
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 30, 70);

    ctx.restore();
  });

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-background">
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* HUD */}
      <div className="absolute top-4 left-4 flex items-center gap-3">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Heart className="h-4 w-4" /> {player.health}/{MAX_HEALTH}
        </Badge>
        <Badge variant="secondary">Score: {score}</Badge>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Trophy className="h-4 w-4" /> Best: {highScore}
        </Badge>
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={performAutoSave}>
          <Save className="h-4 w-4 mr-1" /> Salvar
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setShowSaveManager(true)}>
          Saves
        </Button>
        <Button size="sm" variant="secondary" onClick={resetGame}>
          <RefreshCw className="h-4 w-4 mr-1" /> Reiniciar
        </Button>
      </div>

      {achievements.length > 0 && (
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 max-w-md">
          {achievements.map((a) => (
            <Badge key={a} variant="outline" className="flex items-center gap-1">
              <Trophy className="h-3 w-3" /> {a}
            </Badge>
          ))}
        </div>
      )}

      {gameState !== 'playing' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">
          <h2 className="text-4xl font-bold">
            {gameState === 'victory' ? 'Vitória!' : 'Game Over'}
          </h2>
          <p className="text-lg text-muted-foreground">Pontuação: {score}</p>
          <p className="text-sm text-muted-foreground">Recorde: {highScore}</p>
          <Button onClick={resetGame}>
            <RefreshCw className="h-4 w-4 mr-2" /> Jogar novamente
          </Button>
        </div>
      )}

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
