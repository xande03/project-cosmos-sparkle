import React from 'react'
import MonkeyCharacter from './MonkeyCharacter'

interface PlayerProps {
  className?: string
}

export default function Player({ className }: PlayerProps) {
  return (
    <div className={className}>
      <MonkeyCharacter />
    </div>
  )
}
