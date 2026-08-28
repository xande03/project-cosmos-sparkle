import React, { useEffect, useState } from 'react';

const SPLASH_DURATION = 3000;
const FADE_DURATION = 700;

const SplashScreen = () => {
  const [stage, setStage] = useState<'visible' | 'fading' | 'hidden'>('visible');

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setStage('fading'), SPLASH_DURATION);
    const hideTimer = window.setTimeout(
      () => setStage('hidden'),
      SPLASH_DURATION + FADE_DURATION,
    );
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (stage === 'hidden') return null;

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center transition-opacity duration-700 bg-cover bg-center ${
        stage === 'fading' ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundImage: "url('/uploads/mario.png')" }}
    >
      {/* Overlay escuro para garantir legibilidade do texto */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 px-4 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white drop-shadow-lg md:text-6xl">
          Cosmos Sparkle
        </h1>
        <p className="text-xl text-white opacity-90 drop-shadow-md">
          Carregando sua aventura...
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
