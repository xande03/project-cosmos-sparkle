import { createFileRoute } from "@tanstack/react-router";

import GameContainer from "@/components/game/GameContainer";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-stone-100 p-8">
      <div className="max-w-4xl w-full flex flex-col gap-8">
        <header className="text-center">
          <h1 className="text-5xl font-black text-stone-800 tracking-tight mb-2">
            MONKEY LONG <span className="text-green-600">JUNGLE RUN</span>
          </h1>
          <p className="text-stone-500 font-medium">Help the monkey navigate challenges and collect bananas!</p>
        </header>

        <GameContainer />

        <footer className="grid grid-cols-1 md:grid-cols-3 gap-6 text-stone-600 bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-stone-800 uppercase text-sm tracking-wider">Controls</h3>
            <p className="text-sm">WASD or Arrows to move and jump. Space also jumps.</p>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-stone-800 uppercase text-sm tracking-wider">Obstacles</h3>
            <p className="text-sm">Avoid red spikes and patrolling crabs! They take health away.</p>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-stone-800 uppercase text-sm tracking-wider">Goal</h3>
            <p className="text-sm">Reach the purple zone at the end of the level to win.</p>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-stone-800 uppercase text-sm tracking-wider">Save System</h3>
            <p className="text-sm">O jogo salva automaticamente em intervalos definidos, mas você também pode salvar manualmente ou gerenciar slots.</p>
          </div>
        </footer>
      </div>
      <Toaster />
    </div>
  );
}

