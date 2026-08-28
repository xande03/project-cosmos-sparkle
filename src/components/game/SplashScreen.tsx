import React from 'react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 z-50">
      <div className="text-center">
        {/* A imagem será adicionada quando o usuário fornecer */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Cosmos Sparkle</h1>
        <p className="text-xl text-white opacity-80">Carregando sua aventura...</p>
      </div>
    </div>
  );
};

export default SplashScreen;