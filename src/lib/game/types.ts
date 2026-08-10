export type Vector2 = { x: number; y: number };

export interface Entity {
  id: string;
  position: Vector2;
  size: Vector2;
}

export interface Player extends Entity {
  velocity: Vector2;
  isGrounded: boolean;
}

export interface Level {
  id: number;
  width: number;
  platforms: Entity[];
  obstacles: Entity[];
  collectibles: Entity[];
  goal: Entity;
}
