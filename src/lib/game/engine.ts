import { Game } from './Game';
import { Clouds } from '../components/game/Clouds';
import { Ground } from '../components/game/Ground';
import { Tree } from '../components/game/Tree';
import { assets } from './assets';

export class GameEngine {
  private game: Game;
  private clouds: Clouds;
  private ground: Ground;
  private trees: Tree[] = [];
  private assetLoader: any;

  constructor(game: Game) {
    this.game = game;
    this.clouds = new Clouds(game);
    this.ground = new Ground(game);
    this.assetLoader = new assets.AssetLoader();
    this.initializeGame();
  }

  private initializeGame() {
    // Load assets
    this.assetLoader.loadAssets().then(() => {
      this.createTrees();
      this.game.start();
    });
  }

  private createTrees() {
    // Create trees in the grassy area
    const treePositions = [
      { x: 100, y: 300 },
      { x: 250, y: 320 },
      { x: 400, y: 310 },
      { x: 550, y: 330 },
      { x: 700, y: 315 },
    ];

    treePositions.forEach(pos => {
      const tree = new Tree(this.game, pos.x, pos.y);
      this.trees.push(tree);
    });
  }

  public update() {
    this.clouds.update();
    this.trees.forEach(tree => tree.update());
  }

  public render() {
    this.clouds.render();
    this.ground.render();
    this.trees.forEach(tree => tree.render());
  }
}
