
import React from 'react';
import BoneQuestChat from '@/components/BoneQuestChat';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-primary/5 p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground mb-2">
          BoneQuest Voices Alive
        </h1>
        <p className="text-muted-foreground">
          Have a conversation with the BoneQuest AI companion
        </p>
      </header>
      
      <main className="w-full max-w-4xl">
        <BoneQuestChat />
      </main>
      
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>Powered by ElevenLabs Conversational AI</p>
      </footer>
    </div>
  );
};

export default Index;
