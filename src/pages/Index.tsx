
import React from 'react';
import BoneQuestChat from '@/components/BoneQuestChat';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-900/20 p-4 relative overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      {/* Animated background gradients */}
      <div className="absolute top-10 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl animate-float"></div>
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full filter blur-3xl animate-float-delayed"></div>
      
      <header className="relative z-10 pt-8 pb-6 text-center">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 glow-text mb-2">
          BoneQuest AI
        </h1>
        <p className="text-cyan-100 text-lg max-w-xl">
          Experience the next generation of conversational AI with our interactive robot interface
        </p>
      </header>
      
      <main className="relative z-10 w-full max-w-6xl flex-grow flex items-center justify-center py-8">
        <BoneQuestChat />
      </main>
      
      <footer className="relative z-10 mt-6 mb-4 text-center">
        <p className="text-sm text-cyan-300/60">
          Powered by ElevenLabs Conversational AI
        </p>
        <div className="mt-2 flex items-center justify-center space-x-4">
          <div className="text-xs text-cyan-300/40 flex items-center">
            <span className="w-2 h-2 rounded-full bg-cyan-400 mr-1"></span> 
            Voice Processing
          </div>
          <div className="text-xs text-cyan-300/40 flex items-center">
            <span className="w-2 h-2 rounded-full bg-purple-400 mr-1"></span> 
            Emotion Engine
          </div>
          <div className="text-xs text-cyan-300/40 flex items-center">
            <span className="w-2 h-2 rounded-full bg-rose-400 mr-1"></span> 
            3D Visualization
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
