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
    </div>
  )
}
