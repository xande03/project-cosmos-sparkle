import { createFileRoute } from '@tanstack/react-router'
import { SplashScreen } from '@/components/game/SplashScreen'

export const Route = createFileRoute('/')({
  component: SplashScreen,
})