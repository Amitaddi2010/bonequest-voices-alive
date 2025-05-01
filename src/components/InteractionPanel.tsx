
import React from 'react';
import { Button } from '@/components/ui/button';
import { MicrophoneIcon, PauseIcon, BrainCircuitIcon, SettingsIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from './ChatMessage';

interface Message {
  content: string;
  isUser: boolean;
}

interface InteractionPanelProps {
  messages: Message[];
  isConnected: boolean;
  isSpeaking: boolean;
  onMicToggle: () => void;
  hasMicPermission: boolean;
  speakingMessageIndex: number;
}

const InteractionPanel: React.FC<InteractionPanelProps> = ({
  messages,
  isConnected,
  isSpeaking,
  onMicToggle,
  hasMicPermission,
  speakingMessageIndex
}) => {
  return (
    <div className="interaction-panel bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-6 w-full max-w-xl mx-auto shadow-glow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 pulse-dot' : 'bg-slate-400'}`}></div>
          <h2 className="text-cyan-300 text-lg font-semibold">
            {isConnected ? 'Connected' : 'Ready to Connect'}
          </h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" className="text-cyan-300 hover:text-cyan-100 hover:bg-cyan-900/30">
            <BrainCircuitIcon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-cyan-300 hover:text-cyan-100 hover:bg-cyan-900/30">
            <SettingsIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-64 border border-cyan-500/20 rounded-xl bg-slate-900/50 p-4 mb-4">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div key={index} className="mb-3">
              <ChatMessage 
                message={message.content} 
                isUser={message.isUser}
                isSpeaking={!message.isUser && index === speakingMessageIndex && isSpeaking}
              />
            </div>
          ))
        ) : (
          <div className="flex h-full items-center justify-center opacity-70">
            <p className="text-cyan-300/70 text-center">
              Start a conversation with BoneQuest by clicking the button below
            </p>
          </div>
        )}
      </ScrollArea>
      
      <div className="flex flex-col items-center">
        <Button 
          onClick={onMicToggle}
          disabled={!hasMicPermission && !isConnected}
          className={`rounded-full w-16 h-16 transition-all shadow-glow ${
            isConnected ? 'bg-rose-500 hover:bg-rose-600 pulse-animation' : 'bg-cyan-500 hover:bg-cyan-600'
          }`}
        >
          {isConnected ? (
            <PauseIcon className="h-8 w-8 text-white" />
          ) : (
            <MicrophoneIcon className="h-8 w-8 text-white" />
          )}
        </Button>
        
        <p className="text-cyan-300/80 text-sm mt-3">
          {isConnected ? (
            isSpeaking ? "BoneQuest is speaking..." : "BoneQuest is listening..."
          ) : (
            "Click to start conversation"
          )}
        </p>
      </div>
    </div>
  );
};

export default InteractionPanel;
