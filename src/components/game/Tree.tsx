import React from 'react'

interface TreeProps {
  className?: string
}

export default function Tree({ className }: TreeProps) {
  return (
    <div
      className={`tree ${className ?? ''}`}
      style={{
        left: 'var(--left, 10%)',
        transform: 'scale(var(--scale, 1))',
        height: 'var(--height, 100px)',
        bottom: 'var(--bottom, 0)',
      }}
    >
      <div className="tree-trunk" style={{ height: 'var(--height, 100px)' }} />
      <div className="tree-foliage" />
    </div>
  )
}