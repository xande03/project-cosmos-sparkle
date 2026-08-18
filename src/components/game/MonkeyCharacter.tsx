"use client";

import React from "react";

interface MonkeyCharacterProps {
  position?: { x: number; y: number };
  size?: "small" | "medium" | "large";
  emotion?: "happy" | "curious" | "sleepy" | "excited";
  isJumping?: boolean;
}

const MonkeyCharacter: React.FC<MonkeyCharacterProps> = ({
  position = { x: 0, y: 0 },
  size = "medium",
  emotion = "happy",
  isJumping = false,
}) => {
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32",
  };

  const emotionClasses = {
    happy: "🐵",
    curious: "🐒",
    sleepy: "🦍",
    excited: "🕺",
  };

  return (
    <div
      className={`absolute transition-all duration-300 ${sizeClasses[size]} ${
        isJumping ? "animate-bounce" : ""
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: isJumping ? "scale(1.1)" : "scale(1)",
      }}
    >
      {/* Corpo do macaco */}
      <div className="relative">
        {/* Cabeça */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-amber-600 rounded-full border-2 border-amber-700">
          {/* Face */}
          <div className="absolute top-2 left-2 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full"></div>
          
          {/* Boca - varia com a emoção */}
          {emotion === "happy" && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-black rounded-full"></div>
          )}
          {emotion === "curious" && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-black rounded-full"></div>
          )}
          {emotion === "sleepy" && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-black rounded-full"></div>
          )}
          {emotion === "excited" && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-black rounded-b-full"></div>
          )}
        </div>

        {/* Corpo */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-amber-600 rounded-2xl border-2 border-amber-700">
          
          {/* Braços */}
          <div className="absolute top-6 -left-4 w-4 h-12 bg-amber-600 rounded-full border-2 border-amber-700 transform rotate-12"></div>
          <div className="absolute top-6 -right-4 w-4 h-12 bg-amber-600 rounded-full border-2 border-amber-700 transform -rotate-12"></div>
          
          {/* Pernas */}
          <div className="absolute bottom-0 -left-3 w-4 h-8 bg-amber-600 rounded-full border-2 border-amber-700"></div>
          <div className="absolute bottom-0 -right-3 w-4 h-8 bg-amber-600 rounded-full border-2 border-amber-700"></div>
          
          {/* Barriga */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-amber-400 rounded-full border-2 border-amber-500"></div>
          
          {/* Rabo */}
          <div className="absolute top-10 -right-2 w-3 h-12 bg-amber-600 rounded-full border-2 border-amber-700 transform rotate-45"></div>
        </div>
        
        {/* Detalhes extras para emoção feliz */}
        {emotion === "happy" && (
          <>
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-2xl">😄</div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xl">🍌</div>
          </>
        )}
        
        {/* Detalhes extras para emoção curiosa */}
        {emotion === "curious" && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-2xl">🤔</div>
        )}
        
        {/* Detalhes extras para emoção sonolenta */}
        {emotion === "sleepy" && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-2xl">😴</div>
        )}
        
        {/* Detalhes extras para emoção animada */}
        {emotion === "excited" && (
          <>
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-2xl">🎉</div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xl">⚡</div>
          </>
        )}
      </div>
    </div>
  );
};

export default MonkeyCharacter;