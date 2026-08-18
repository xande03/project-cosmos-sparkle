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
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
      <div className="text-center relative z-10">
        <h1 className="text-6xl font-bold text-white mb-8 animate-pulse">olá, players</h1>
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