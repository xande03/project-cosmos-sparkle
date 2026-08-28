import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black">
        <img 
          src="/images/logo-npontes.png" 
          alt="N.PONTES" 
          className="w-full h-full object-contain p-12"
        />
      </div>
      
      <div className="text-center relative z-10">
        <h1 className="text-6xl font-bold text-white mb-8 animate-pulse">olá, jogadores</h1>
        <p className="text-xl text-white mb-8">Olá, players</p>
        <Button 
          className="bg-yellow-500 hover:bg-yellow-600 text-black text-lg px-8 py-4 rounded-xl font-bold"
          onClick={() => setIsVisible(false)}
        >
          Começar a Jogar
        </Button>
      </div>
    </div>
  );
}