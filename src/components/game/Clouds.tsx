import React from 'react'

export default function Clouds() {
  return (
    <div className="fixed top-0 left-0 w-full h-1/3 pointer-events-none z-10">
      <div className="absolute top-10 left-20 w-32 h-16 bg-white rounded-full opacity-80 animate-pulse" />
      <div className="absolute top-20 right-40 w-40 h-20 bg-white rounded-full opacity-70 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-5 left-1/2 w-36 h-18 bg-white rounded-full opacity-75 animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-30 left-1/3 w-28 h-14 bg-white rounded-full opacity-85 animate-pulse" style={{ animationDelay: '0.5s' }} />
    </div>
  )
}