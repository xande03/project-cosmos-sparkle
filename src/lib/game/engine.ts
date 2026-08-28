import { GameContainer } from '../../components/game/GameContainer';
import { Clouds } from '../../components/game/Clouds';
import { Birds } from '../../components/game/Birds';
import { Trees } from '../../components/game/Trees';
import { useGameState } from './hooks/useGameState';
import { useKeyPress } from './hooks/useKeyPress';
import { useGameLoop } from './hooks/useGameLoop';
import { useLevel } from './hooks/useLevel';
import { levels } from './levels';

export const GameEngine = () => {
  const { gameState, updateGameState } = useGameState();
  const { currentLevel, levelComplete, nextLevel } = useLevel(levels);
  
  useKeyPress();
  useGameLoop(updateGameState);
  
  return (
    <div className="game-engine">
      <GameContainer>
        <Clouds />
        <Birds />
        <Trees />
        {/* Outros componentes do jogo */}
      </GameContainer>
    </div>
  );
};
