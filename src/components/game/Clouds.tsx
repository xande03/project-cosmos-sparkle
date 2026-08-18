import React from 'react'

interface CloudProps {
  className?: string
  style?: React.CSSProperties
}

const Cloud: React.FC<CloudProps> = ({ className, style }) => (
  <div
    className={`absolute ${className}`}
    style={style}
  >
    <svg
      width="120"
      height="60"
      viewBox="0 0 120 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 40C20 40 20 25 35 25C35 15 50 15 60 20C70 10 85 10 90 20C105 20 105 35 90 40C85 45 70 45 60 40C50 45 35 45 20 40Z"
        fill="white"
        fillOpacity="0.8"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
      />
    </svg>
  </div>
)

const Clouds: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Cloud 1 - Large, slow */}
      <Cloud
        className="top-10 left-0 animate-cloud-move-1"
        style={{
          animationDuration: '30s',
          opacity: 0.9,
        }}
      />
      
      {/* Cloud 2 - Medium, medium speed */}
      <Cloud
        className="top-20 left-20 animate-cloud-move-2"
        style={{
          animationDuration: '25s',
          opacity: 0.7,
        }}
      />
      
      {/* Cloud 3 - Small, fast */}
      <Cloud
        className="top-5 left-40 animate-cloud-move-3"
        style={{
          animationDuration: '20s',
          opacity: 0.8,
        }}
      />
      
      {/* Cloud 4 - Medium, slow */}
      <Cloud
        className="top-30 left-60 animate-cloud-move-4"
        style={{
          animationDuration: '35s',
          opacity: 0.6,
        }}
      />
      
      {/* Cloud 5 - Large, medium speed */}
      <Cloud
        className="top-15 left-80 animate-cloud-move-5"
        style={{
          animationDuration: '28s',
          opacity: 0.85,
        }}
      />
    </div>
  )
}

export default Clouds