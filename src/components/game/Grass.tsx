import React from 'react'

interface GrassProps {
  className?: string
}

export default function Grass({ className }: GrassProps) {
  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '12vh',
        pointerEvents: 'none',
        zIndex: 4,
        background: 'linear-gradient(180deg, rgba(46, 139, 87, 0) 0%, #2e8b57 40%, #226b43 100%)',
      }}
    />
  )
}
