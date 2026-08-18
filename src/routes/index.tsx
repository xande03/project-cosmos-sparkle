import { createFileRoute } from '@tanstack/react-router'
import GameContainer from '@/components/game/GameContainer'
import SplashScreen from '@/components/game/SplashScreen'
import DateTimeBadge from '@/components/game/DateTimeBadge'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Monkey Long — Jogo de Plataforma com Fases e Conquistas' },
      {
        name: 'description',
        content:
          'Jogue Monkey Long: plataforma com múltiplas fases, obstáculos, inimigos, conquistas e sistema de saves com autosave.',
      },
      { property: 'og:title', content: 'Monkey Long — Jogo de Plataforma' },
      {
        property: 'og:description',
        content:
          'Múltiplas fases, desafios, conquistas e salvamento automático de progresso.',
      },
    ],
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <h1 className="sr-only">Monkey Long — Jogo de Plataforma</h1>
      <SplashScreen />
      <GameContainer />
      <DateTimeBadge />
    </main>
  )
}