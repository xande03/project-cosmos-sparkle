import { Level } from './types';

export const level1: Level = {
  id: 1,
  width: 2000,
  platforms: [
    { id: 'floor', position: { x: 0, y: 550 }, size: { x: 2000, y: 50 } },
    { id: 'p1', position: { x: 300, y: 400 }, size: { x: 200, y: 20 } },
    { id: 'p2', position: { x: 600, y: 300 }, size: { x: 200, y: 20 } },
  ],
  obstacles: [
    { id: 'o1', position: { x: 500, y: 500 }, size: { x: 50, y: 50 } },
  ],
  collectibles: [
    { id: 'c1', position: { x: 350, y: 350 }, size: { x: 30, y: 30 } },
  ],
  goal: { id: 'goal', position: { x: 1900, y: 500 }, size: { x: 50, y: 50 } },
};
