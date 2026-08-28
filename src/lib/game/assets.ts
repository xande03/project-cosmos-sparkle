import { Tree } from '../components/game/Tree';
import { Grass } from '../components/game/Grass';
import { Clouds } from '../components/game/Clouds';
import { Player } from '../components/game/Player';

export const GameAssets = {
  Tree: {
    component: Tree,
    props: {
      position: { x: 100, y: 300 },
      size: { width: 80, height: 120 },
    },
  },
  Grass: {
    component: Grass,
    props: {
      position: { x: 0, y: 400 },
      size: { width: 800, height: 200 },
    },
  },
  Cloud: {
    component: Clouds,
    props: {
      position: { x: 200, y: 50 },
      size: { width: 100, height: 60 },
    },
  },
  Player: {
    component: Player,
    props: {
      position: { x: 400, y: 350 },
      size: { width: 50, height: 100 },
    },
  },
};
