import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useGameLoop } from '@/hooks/useGameLoop';
import { level1 } from '@/lib/game/levels';

const GRAVITY = 1500;
const JUMP_FORCE = -700;
const MOVE_SPEED = 300;
const FRICTION = 0.8;

export default function GameContainer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState({ x: 100, y: 400, vx: 0, vy: 0, width: 40, height: 40, isGrounded: false });
  const [cameraX, setCameraX] = useState(0);
  const [score, setScore] = useState(0);
  const [collectibles, setCollectibles] = useState(level1.collectibles.map(c => ({ ...c, active: true })));
  const keys = useRef<{ [key: string]: boolean }>({});

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

  const update = useCallback((deltaTime: number) => {
    setPlayer(prev => {
      let newVx = prev.vx;
      let newVy = prev.vy + GRAVITY * deltaTime;

      if (keys.current['ArrowLeft'] || keys.current['KeyA']) newVx = -MOVE_SPEED;
      else if (keys.current['ArrowRight'] || keys.current['KeyD']) newVx = MOVE_SPEED;
      else newVx *= FRICTION;

      if ((keys.current['ArrowUp'] || keys.current['KeyW'] || keys.current['Space']) && prev.isGrounded) {
        newVy = JUMP_FORCE;
      }

      let newX = prev.x + newVx * deltaTime;
      let newY = prev.y + newVy * deltaTime;
      let isGrounded = false;

      // Basic Collision with platforms
      level1.platforms.forEach(p => {
        if (
          newX < p.position.x + p.size.x &&
          newX + prev.width > p.position.x &&
          newY < p.position.y + p.size.y &&
          newY + prev.height > p.position.y
        ) {
          // Collision from top
          if (prev.y + prev.height <= p.position.y) {
            newY = p.position.y - prev.height;
            newVy = 0;
            isGrounded = true;
          } 
          // Collision from bottom
          else if (prev.y >= p.position.y + p.size.y) {
            newY = p.position.y + p.size.y;
            newVy = 0;
          }
          // Horizontal collisions
          else if (prev.x + prev.width <= p.position.x) {
            newX = p.position.x - prev.width;
            newVx = 0;
          } else if (prev.x >= p.position.x + p.size.x) {
            newX = p.position.x + p.size.x;
            newVx = 0;
          }
        }
      });

      // Death by falling
      if (newY > 700) {
        newX = 100;
        newY = 400;
        newVx = 0;
        newVy = 0;
      }

      return { ...prev, x: newX, y: newY, vx: newVx, vy: newVy, isGrounded };
    });

    // Camera follow
    setCameraX(prev => {
      const target = player.x - 400;
      return prev + (target - prev) * 0.1;
    });

    // Collectibles
    setCollectibles(prev => prev.map(c => {
      if (c.active && 
          player.x < c.position.x + c.size.x &&
          player.x + player.width > c.position.x &&
          player.y < c.position.y + c.size.y &&
          player.y + player.height > c.position.y) {
        setScore(s => s + 100);
        return { ...c, active: false };
      }
      return c;
    }));

  }, [player.x, player.y, player.width, player.height]);

  useGameLoop((deltaTime) => {
    update(deltaTime);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-cameraX, 0);

    // Draw background elements (Modern Vector feel)
    ctx.fillStyle = '#BAE6FD'; // Light sky
    ctx.fillRect(cameraX, 0, canvas.width, canvas.height);

    // Draw Platforms
    ctx.fillStyle = '#65A30D'; // Grass green
    level1.platforms.forEach(p => {
      ctx.beginPath();
      ctx.roundRect(p.position.x, p.position.y, p.size.x, p.size.y, 8);
      ctx.fill();
    });

    // Draw Obstacles
    ctx.fillStyle = '#EF4444'; // Red danger
    level1.obstacles.forEach(o => {
      ctx.fillRect(o.position.x, o.position.y, o.size.x, o.size.y);
    });

    // Draw Collectibles (Bananas for the monkey!)
    ctx.fillStyle = '#FACC15'; // Yellow
    collectibles.forEach(c => {
      if (c.active) {
        ctx.beginPath();
        ctx.arc(c.position.x + 15, c.position.y + 15, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw Goal
    ctx.fillStyle = '#8B5CF6'; // Purple goal
    ctx.fillRect(level1.goal.position.x, level1.goal.position.y, level1.goal.size.x, level1.goal.size.y);

    // Draw Player (Monkey Long)
    // Simple modern vector monkey representation
    ctx.fillStyle = '#78350F'; // Dark brown body
    ctx.beginPath();
    ctx.roundRect(player.x, player.y, player.width, player.height, 10);
    ctx.fill();
    // Face
    ctx.fillStyle = '#FDE68A';
    ctx.beginPath();
    ctx.arc(player.x + player.width/2, player.y + 15, 12, 0, Math.PI * 2);
    ctx.fill();
    // Ears
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.arc(player.x, player.y + 15, 6, 0, Math.PI * 2);
    ctx.arc(player.x + player.width, player.y + 15, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  return (
    <div className="relative" ref={containerRef}>
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg font-bold shadow-sm">
        Score: {score}
      </div>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        className="rounded-xl shadow-2xl border-4 border-stone-800"
      />
    </div>
  );
}
