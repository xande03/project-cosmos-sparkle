import { createFileRoute } from "@tanstack/react-router";
import GameContainer from "@/components/game/GameContainer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-stone-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Monkey Long Platformer</h1>
      <GameContainer />
      <div className="mt-4 text-gray-600">
        <p>Use WASD or Arrow Keys to Move and Jump!</p>
      </div>
    </div>
  );
}

