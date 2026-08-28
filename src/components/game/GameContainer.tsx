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
const DESIGN_WIDTH = 900;
const DESIGN_HEIGHT = 600;
const STORAGE_KEY_ACHIEVEMENTS = 'monkey-long-achievements';
const STORAGE_KEY_HIGHSCORE = 'monkey-long-highscore';
const STORAGE_KEY_AUTOSAVE_INTERVAL = 'monkey-long-autosave-interval';

export default function GameContainer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playAreaRef = useRef<HTMLDivElement>(null);

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
  const [canvasScaleX, setCanvasScaleX] = useState(1);
  const [canvasScaleY, setCanvasScaleY] = useState(1);

  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = DESIGN_WIDTH;
      canvas.height = DESIGN_HEIGHT;
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

  // Redimensiona o canvas para cobrir 100% da área da tela, esticando o mundo
  // 900x600 para preencher toda a viewport sem barras pretas nas laterais.
  useEffect(() => {
    const playArea = playAreaRef.current;
    const canvas = canvasRef.current;
    if (!playArea || !canvas) return;

    const resize = () => {
      const rect = playArea.getBoundingClientRect();
      const availableWidth = Math.max(rect.width, 320);
      const availableHeight = Math.max(rect.height, 240);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const pixelWidth = Math.round(availableWidth * dpr);
      const pixelHeight = Math.round(availableHeight * dpr);

      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      setCanvasScaleX(pixelWidth / DESIGN_WIDTH);
      setCanvasScaleY(pixelHeight / DESIGN_HEIGHT);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(playArea);
    window.addEventListener('resize', resize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resize);
    };
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
          if (newHealth <= 0) setGameState('gameover');
        }

        // Keep in bounds
        if (newX < 0) newX = 0;
        if (newX > level1.width - prev.width) newX = level1.width - prev.width;

        return {
          ...prev,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          isGrounded,
          health: newHealth,
          invulnerable: newInvulnerable,
        };
      });

      // Enemy patrol movement
      setEnemies((prev) =>
        prev.map((e) => {
          if (e.type !== 'patrol' || !e.startPos || !e.speed || !e.range) return e;
          const dir = (e as any).dir ?? 1;
          let nx = e.position.x + dir * e.speed * deltaTime;
          let newDir = dir;
          if (nx > e.startPos.x + e.range) {
            nx = e.startPos.x + e.range;
            newDir = -1;
          } else if (nx < e.startPos.x) {
            nx = e.startPos.x;
            newDir = 1;
          }
          return { ...e, position: { ...e.position, x: nx }, dir: newDir } as typeof e;
        }),
      );

      // Collectibles
      setCollectibles((prev) => {
        let gained = 0;
        const next = prev.map((c) => {
          if (!c.active) return c;
          if (
            player.x < c.position.x + c.size.x &&
            player.x + player.width > c.position.x &&
            player.y < c.position.y + c.size.y &&
            player.y + player.height > c.position.y
          ) {
            gained += 100;
            return { ...c, active: false };
          }
          return c;
        });
        if (gained > 0) {
          setScore((s) => {
            const total = s + gained;
            if (next.every((c) => !c.active)) addAchievement('Banana King');
            return total;
          });
        }
        return next;
      });

      // Camera
      setCameraX(() => {
        const target = player.x - DESIGN_WIDTH / 2 + player.width / 2;
        return Math.max(0, Math.min(target, level1.width - DESIGN_WIDTH));
      });
    },
    [gameState, enemies, player.x, player.y, player.width, player.height],
  );

  useGameLoop(update);

  // Renderiza o mundo do jogo em tela cheia
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, '#7fd7f5');
    sky.addColorStop(1, '#d9f6c8');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(canvasScaleX, canvasScaleY);
    ctx.translate(-cameraX, 0);

    // Platforms
    level1.platforms.forEach((p) => {
      ctx.fillStyle = '#6b4423';
      ctx.fillRect(p.position.x, p.position.y, p.size.x, p.size.y);
      ctx.fillStyle = '#3fa34d';
      ctx.fillRect(p.position.x, p.position.y, p.size.x, 8);
    });

    // Obstacles
    level1.obstacles.forEach((o) => {
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.moveTo(o.position.x, o.position.y + o.size.y);
      ctx.lineTo(o.position.x + o.size.x / 2, o.position.y);
      ctx.lineTo(o.position.x + o.size.x, o.position.y + o.size.y);
      ctx.closePath();
      ctx.fill();
    });

    // Enemies
    enemies.forEach((e) => {
      ctx.fillStyle = '#8e44ad';
      ctx.fillRect(e.position.x, e.position.y, e.size.x, e.size.y);
      ctx.fillStyle = '#fff';
      ctx.fillRect(e.position.x + 8, e.position.y + 10, 6, 6);
      ctx.fillRect(e.position.x + 24, e.position.y + 10, 6, 6);
    });

    // Collectibles
    collectibles.forEach((c) => {
      if (!c.active) return;
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(c.position.x + c.size.x / 2, c.position.y + c.size.y / 2, c.size.x / 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Goal
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(level1.goal.position.x, level1.goal.position.y, level1.goal.size.x, level1.goal.size.y);

    // Player - Monkey character (Donkey Kong style)
    if (player.invulnerable === 0 || Math.floor(player.invulnerable * 10) % 2 === 0) {
      const px = player.x;
      const py = player.y;
      const w = player.width;
      const h = player.height;

      // --- Body (brown) ---
      ctx.fillStyle = '#6B3A2A';
      ctx.beginPath();
      ctx.roundRect(px + 2, py + 12, w - 4, h - 18, 4);
      ctx.fill();

      // --- Belly (lighter) ---
      ctx.fillStyle = '#A67B5B';
      ctx.beginPath();
      ctx.roundRect(px + 6, py + 16, w - 12, h - 24, 3);
      ctx.fill();

      // --- Head (circle) ---
      const headRadius = 12;
      const headCenterX = px + w / 2;
      const headCenterY = py + 10;
      ctx.fillStyle = '#6B3A2A';
      ctx.beginPath();
      ctx.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
      ctx.fill();

      // --- Ears ---
      ctx.fillStyle = '#5A2D1A';
      ctx.beginPath();
      ctx.arc(headCenterX - headRadius + 2, headCenterY - 2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(headCenterX + headRadius - 2, headCenterY - 2, 5, 0, Math.PI * 2);
      ctx.fill();

      // --- Face (lighter) ---
      ctx.fillStyle = '#D4A574';
      ctx.beginPath();
      ctx.arc(headCenterX, headCenterY + 1, 8, 0, Math.PI * 2);
      ctx.fill();

      // --- Eyes ---
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(headCenterX - 3, headCenterY - 2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(headCenterX + 3, headCenterY - 2, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(headCenterX - 2, headCenterY - 1, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(headCenterX + 4, headCenterY - 1, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // --- Mouth (smile) ---
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(headCenterX, headCenterY + 4, 4, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // --- Tie (Donkey Kong style) ---
      ctx.fillStyle = '#D32F2F';
      ctx.beginPath();
      ctx.moveTo(px + w / 2 - 3, py + 12);
      ctx.lineTo(px + w / 2 + 3, py + 12);
      ctx.lineTo(px + w / 2 + 2, py + 20);
      ctx.lineTo(px + w / 2, py + 18);
      ctx.lineTo(px + w / 2 - 2, py + 20);
      ctx.closePath();
      ctx.fill();

      // --- Arms ---
      ctx.strokeStyle = '#6B3A2A';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px + 2, py + 16);
      ctx.lineTo(px - 4, py + 24);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + w - 2, py + 16);
      ctx.lineTo(px + w + 4, py + 24);
      ctx.stroke();

      // --- Hands (fists) ---
      ctx.fillStyle = '#5A2D1A';
      ctx.beginPath();
      ctx.arc(px - 4, py + 24, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px + w + 4, py + 24, 3, 0, Math.PI * 2);
      ctx.fill();

      // --- Legs ---
      ctx.fillStyle = '#6B3A2A';
      ctx.fillRect(px + 4, py + h - 10, 6, 10);
      ctx.fillRect(px + w - 10, py + h - 10, 6, 10);

      // --- Feet ---
      ctx.fillStyle = '#5A2D1A';
      ctx.fillRect(px + 2, py + h - 4, 10, 4);
      ctx.fillRect(px + w - 12, py + h - 4, 10, 4);

      // --- Tail (curved) ---
      ctx.strokeStyle = '#6B3A2A';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(px + w - 2, py + 14);
      ctx.quadraticCurveTo(px + w + 12, py - 4, px + w + 6, py - 10);
      ctx.stroke();
    }

    ctx.restore();
  }, [player, enemies, collectibles, cameraX, canvasScaleX, canvasScaleY]);

  const handleManualSave = () => {
    performAutoSave();
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-100"
    >
      {/* Área do jogo em tela cheia — cobre toda a janela */}
      <div ref={playAreaRef} className="absolute inset-0">
        <canvas ref={canvasRef} className="block h-full w-full" />

        {gameState !== 'playing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/85 text-center">
            <h2 className="text-3xl font-bold">
              {gameState === 'victory' ? 'Vitória!' : 'Game Over'}
            </h2>
            <p className="text-muted-foreground">Pontuação final: {score}</p>
            {score >= highScore && score > 0 && <Badge>Novo recorde!</Badge>}
            <Button onClick={resetGame}>
              <RefreshCw className="mr-2 h-4 w-4" /> Jogar novamente
            </Button>
          </div>
        )}
      </div>

      {/* HUD flutuante sobre o jogo */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-center gap-3 bg-gradient-to-b from-black/40 via-black/20 to-transparent px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_HEALTH }).map((_, i) => (
            <Heart
              key={i}
              className={
                i < player.health ? 'h-5 w-5 fill-destructive text-destructive' : 'h-5 w-5 text-muted-foreground'
              }
            />
          ))}
        </div>
        <Badge variant="secondary">Pontos: {score}</Badge>
        <Badge variant="outline">
          <Trophy className="mr-1 h-3 w-3" /> Recorde: {highScore}
        </Badge>
        <div className="pointer-events-auto ml-auto flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={handleManualSave}>
            <Save className="mr-1 h-4 w-4" /> Salvar agora
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowSaveManager(true)}>
            Saves
          </Button>
          <Button size="sm" variant="outline" onClick={resetGame}>
            <RefreshCw className="mr-1 h-4 w-4" /> Reiniciar
          </Button>
        </div>
      </div>

      {/* Conquistas flutuantes na parte inferior */}
      {achievements.length > 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-wrap gap-2 bg-gradient-to-t from-black/30 to-transparent px-3 pb-2 sm:px-4 sm:pb-3">
          {achievements.map((a) => (
            <Badge key={a} variant="secondary">
              <Trophy className="mr-1 h-3 w-3" /> {a}
            </Badge>
          ))}
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
