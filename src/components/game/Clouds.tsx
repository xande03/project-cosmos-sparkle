import React from 'react'
import './Clouds.css'

interface CloudProps {
  className?: string
}

function Cloud({ className }: CloudProps) {
  return (
    <div className={`cloud ${className ?? ''}`}>
      <div className="cloud-body">
        <span className="cloud-puff puff-1" />
        <span className="cloud-puff puff-2" />
        <span className="cloud-puff puff-3" />
        <span className="cloud-base" />
      </div>
    </div>
  )
}

interface BirdProps {
  className?: string
}

function Bird({ className }: BirdProps) {
  return (
    <div className={`bird ${className ?? ''}`}>
      <div className="bird-body" />
      <div className="bird-wing bird-wing-left" />
      <div className="bird-wing bird-wing-right" />
    </div>
  )
}

interface TreeProps {
  className?: string
}

function Tree({ className }: TreeProps) {
  return (
    <div className={`tree ${className ?? ''}`}>
      <div className="tree-trunk" />
      <div className="tree-foliage" />
    </div>
  )
}

export default function Clouds() {
  return (
    <div className="clouds">
      <div className="cloud-sun" />
      <Cloud className="cloud-1" />
      <Cloud className="cloud-2" />
      <Cloud className="cloud-3" />
      <Cloud className="cloud-4" />
      <Cloud className="cloud-5" />
      <Cloud className="cloud-6" />
      
      {/* Birds */}
      <Bird className="bird-1" />
      <Bird className="bird-2" />
      <Bird className="bird-3" />
      
      {/* Trees */}
      <Tree className="tree-1" />
      <Tree className="tree-2" />
      <Tree className="tree-3" />
    </div>
  )
}