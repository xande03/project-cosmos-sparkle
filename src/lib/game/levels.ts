import { Level } from './types';

export const level1: Level = {
  id: 1,
  width: 3000,
  platforms: [
    { id: 'floor1', position: { x: 0, y: 550 }, size: { x: 800, y: 50 } },
    { id: 'floor2', position: { x: 950, y: 550 }, size: { x: 1000, y: 50 } },
    { id: 'floor3', position: { x: 2100, y: 550 }, size: { x: 900, y: 50 } },
    
    // Level 1: Intro platforms
    { id: 'p1', position: { x: 300, y: 420 }, size: { x: 150, y: 20 } },
    { id: 'p2', position: { x: 550, y: 320 }, size: { x: 150, y: 20 } },
    
    // Level 2: The Gap
    { id: 'p3', position: { x: 1000, y: 400 }, size: { x: 200, y: 20 } },
    { id: 'p4', position: { x: 1300, y: 300 }, size: { x: 100, y: 20 } },
    { id: 'p5', position: { x: 1500, y: 450 }, size: { x: 200, y: 20 } },
    
    // Level 3: Higher climb
    { id: 'p6', position: { x: 2200, y: 420 }, size: { x: 120, y: 20 } },
    { id: 'p7', position: { x: 2400, y: 300 }, size: { x: 120, y: 20 } },
    { id: 'p8', position: { x: 2650, y: 200 }, size: { x: 150, y: 20 } },
  ],
  obstacles: [
    { id: 'o1', position: { x: 500, y: 520 }, size: { x: 30, y: 30 } },
    { id: 'o2', position: { x: 1100, y: 520 }, size: { x: 30, y: 30 } },
    { id: 'o3', position: { x: 1600, y: 520 }, size: { x: 40, y: 30 } },
    { id: 'o4', position: { x: 2300, y: 520 }, size: { x: 30, y: 30 } },
  ],
  enemies: [
    { id: 'e1', type: 'patrol', position: { x: 400, y: 510 }, size: { x: 40, y: 40 }, range: 200, speed: 100, startPos: { x: 400, y: 510 } },
    { id: 'e2', type: 'patrol', position: { x: 1200, y: 510 }, size: { x: 40, y: 40 }, range: 300, speed: 150, startPos: { x: 1200, y: 510 } },
    { id: 'e3', type: 'patrol', position: { x: 2500, y: 510 }, size: { x: 40, y: 40 }, range: 250, speed: 120, startPos: { x: 2500, y: 510 } },
  ],
  collectibles: [
    { id: 'c1', position: { x: 375, y: 380 }, size: { x: 30, y: 30 } },
    { id: 'c2', position: { x: 625, y: 280 }, size: { x: 30, y: 30 } },
    { id: 'c3', position: { x: 1350, y: 260 }, size: { x: 30, y: 30 } },
    { id: 'c4', position: { x: 2725, y: 160 }, size: { x: 30, y: 30 } },
    { id: 'c5', position: { x: 1900, y: 500 }, size: { x: 30, y: 30 } },
  ],
  goal: { id: 'goal', position: { x: 2850, y: 470 }, size: { x: 80, y: 80 } },
  trees: [
    { id: 't1', position: { x: 100, y: 500 }, size: { x: 60, y: 100 } },
    { id: 't2', position: { x: 700, y: 500 }, size: { x: 70, y: 120 } },
    { id: 't3', position: { x: 1200, y: 500 }, size: { x: 80, y: 130 } },
    { id: 't4', position: { x: 1800, y: 500 }, size: { x: 65, y: 110 } },
    { id: 't5', position: { x: 2300, y: 500 }, size: { x: 75, y: 125 } },
    { id: 't6', position: { x: 2800, y: 500 }, size: { x: 85, y: 140 } },
  ],
  birds: [
    { id: 'b1', position: { x: 200, y: 150 }, size: { x: 30, y: 20 }, speed: 2 },
    { id: 'b2', position: { x: 600, y: 100 }, size: { x: 30, y: 20 }, speed: 3 },
    { id: 'b3', position: { x: 1000, y: 200 }, size: { x: 30, y: 20 }, speed: 2.5 },
    { id: 'b4', position: { x: 1500, y: 120 }, size: { x: 30, y: 20 }, speed: 3.5 },
    { id: 'b5', position: { x: 2200, y: 180 }, size: { x: 30, y: 20 }, speed: 2.8 },
    { id: 'b6', position: { x: 2700, y: 90 }, size: { x: 30, y: 20 }, speed: 3.2 },
  ],
};