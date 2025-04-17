
import React from 'react';
import BoneQuestChat from '@/components/BoneQuestChat';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-hologram p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-cyan-300 glow-text mb-2">
          BoneQuest Voices Alive
        </h1>
        <p className="text-cyan-100">
          Have a conversation with the BoneQuest AI companion
        </p>
      </header>
      
      <main className="w-full max-w-4xl">
        <BoneQuestChat />
      </main>
      
      <footer className="mt-12 text-center text-sm text-cyan-300/60">
        <p>Powered by ElevenLabs Conversational AI</p>
      </footer>
    </div>
  );
};

export default Index;
