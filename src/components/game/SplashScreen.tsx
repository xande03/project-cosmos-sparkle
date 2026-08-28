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
      className={`fixed inset-0 z-[70] flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 transition-opacity duration-700 ${
        stage === 'fading' ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="px-4 text-center">
        <img
          src="/uploads/mario.png"
          alt="Cosmos Sparkle"
          className="mx-auto mb-6 max-h-48 w-auto rounded-2xl object-contain drop-shadow-2xl md:max-h-64"
        />
        <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">Cosmos Sparkle</h1>
        <p className="text-xl text-white opacity-80">Carregando sua aventura...</p>
      </div>
    </div>
  );
};

export default SplashScreen;
