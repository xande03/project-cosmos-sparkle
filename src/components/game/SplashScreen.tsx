import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/maqui1.png')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
      
      <div className="text-center relative z-10">
        <h1 className="text-6xl font-bold text-white mb-8 animate-pulse">bora jogar</h1>
        <p className="text-xl text-white mb-8">Olá, players</p>
        <Card className="bg-black bg-opacity-30 backdrop-blur-sm border-white border-opacity-20 max-w-md mx-auto">
          <CardContent className="p-6">
            <p className="text-white text-lg mb-4 italic">"Porque onde estiver o vosso tesouro, aí estará também o vosso coração." - Mateus 6:21</p>
          </CardContent>
        </Card>
        <div className="mb-6">
          <img src="/images/super-mario-bross.png" alt="Super Mario Bross" className="h-48 mx-auto" />
        </div>
        <Button 
          className="bg-lime-500 hover:bg-lime-600 text-black text-lg px-8 py-4 rounded-xl font-bold"
          onClick={() => setIsVisible(false)}
        >
          Começar a Jogar
        </Button>
      </div>
    </div>
  );
}