import React from 'react'
import './Birds.css'

interface BirdProps {
  className?: string
}

function Bird({ className }: BirdProps) {
  return (
    <div className={`bird ${className ?? ''}`}>
      <div className="bird-body">
        <div className="bird-head" />
        <div className="bird-beak" />
        <div className="bird-wing" />
        <div className="bird-tail" />
      </div>
    </div>
  )
}

export default function Birds() {
  return (
    <div className="birds">
      <Bird className="bird-1" />
      <Bird className="bird-2" />
      <Bird className="bird-3" />
      <Bird className="bird-4" />
      <Bird className="bird-5" />
    </div>
  )
}
