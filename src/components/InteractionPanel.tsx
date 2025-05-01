
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Pause, BrainCircuit, Settings } from 'lucide-react';
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
    <div className="interaction-panel bg-gradient-to-br from-[#0F1C2E]/90 to-[#182436]/90 backdrop-blur-lg border border-[#FF3864]/20 rounded-2xl p-6 w-full max-w-xl mx-auto shadow-glow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-[#FF3864] pulse-dot' : 'bg-slate-400'}`}></div>
          <h2 className="text-[#FF3864] text-lg font-semibold">
            {isConnected ? 'Connected' : 'Ready to Connect'}
          </h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" className="text-[#7A04EB] hover:text-[#9942F5] hover:bg-[#7A04EB]/20">
            <BrainCircuit className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-[#7A04EB] hover:text-[#9942F5] hover:bg-[#7A04EB]/20">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-64 border border-[#FF3864]/20 rounded-xl bg-[#0F1C2E]/50 p-4 mb-4">
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
            <p className="text-[#FF3864]/70 text-center">
              Start a conversation with BoneQuest by clicking the button below
            </p>
          </div>
        )}
      </ScrollArea>
      
      <div className="flex flex-col items-center">
        <Button 
          onClick={onMicToggle}
          disabled={!hasMicPermission && !isConnected}
          className={`rounded-full w-16 h-16 transition-all ${
            isConnected ? 'bg-[#FF3864] hover:bg-[#FF5A7E] pulse-animation' : 'bg-[#7A04EB] hover:bg-[#9942F5]'
          }`}
        >
          {isConnected ? (
            <Pause className="h-8 w-8 text-white" />
          ) : (
            <Mic className="h-8 w-8 text-white" />
          )}
        </Button>
        
        <p className="text-[#FF3864]/80 text-sm mt-3">
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
