import React, { useRef, useState } from 'react';
import { useGameLoop } from '@/hooks/useGameLoop';
import { level1 } from '@/lib/game/levels';

export default function GameContainer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player] = useState({ x: 50, y: 500, vx: 0, vy: 0 });

  useGameLoop((deltaTime) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Game Logic Update
    player.x += player.vx * deltaTime;
    player.y += player.vy * deltaTime;

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Level
    ctx.fillStyle = '#4B5563';
    level1.platforms.forEach(p => ctx.fillRect(p.position.x, p.position.y, p.size.x, p.size.y));

    // Draw Player (The Monkey!)
    ctx.fillStyle = '#D97706';
    ctx.fillRect(player.x, player.y, 40, 40);
  });

  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={600} 
      className="border-2 border-black bg-sky-200"
    />
  );
}
