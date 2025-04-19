
import React, { useState, useRef, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import HologramBot from './HologramBot';
import MicButton from './MicButton';
import MessagesDisplay from './MessagesDisplay';
import { useMicrophonePermission } from '@/hooks/useMicrophonePermission';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface Message {
  content: string;
  isUser: boolean;
}

const BoneQuestChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isReady, setIsReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const agentId = "P39r1B8PJCGBBZL54HdP";

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
      setIsReady(true);
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
      setIsReady(false);
      if (hasMicPermission) {
        setTimeout(() => {
          startWakeWordDetection();
        }, 1000);
      }
    },
    onMessage: (message) => {
      console.log("Received message:", message);
      const source = message.source as unknown as string;
      if (source && source.includes('assistant') && message.message) {
        setMessages(prev => [...prev, { content: message.message, isUser: false }]);
      } else if (source && source.includes('user') && message.message) {
        setMessages(prev => [...prev, { content: message.message, isUser: true }]);
      }
    },
    onError: (error) => {
      console.error("Error in conversation:", error);
      toast.error("Error in conversation. Please try again.");
    }
  });

  const { status, isSpeaking } = conversation;
  const isConnected = status === 'connected';

  const { hasMicPermission, setHasMicPermission } = useMicrophonePermission();
  const { isWakeWordListening, startWakeWordDetection, stopWakeWordDetection } = useSpeechRecognition({
    onWakeWordDetected: async () => {
      try {
        const conversationId = await conversation.startSession({ agentId });
        console.log("Conversation started with ID:", conversationId);
        toast.success("Connected to BoneQuest AI");
      } catch (error) {
        console.error("Error starting conversation:", error);
        toast.error("Failed to connect to BoneQuest AI");
        setTimeout(startWakeWordDetection, 1000);
      }
    },
    isConnected
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      stopWakeWordDetection();
    };
  }, []);

  useEffect(() => {
    if (hasMicPermission && !isConnected) {
      startWakeWordDetection();
    }
  }, [hasMicPermission, isConnected]);

  const handleMicToggle = async () => {
    if (!hasMicPermission) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setHasMicPermission(true);
      } catch (err) {
        toast.error("Please allow microphone access to use voice chat");
        return;
      }
    }

    if (isConnected) {
      console.log("Ending conversation session");
      try {
        await conversation.endSession();
        toast.success("Conversation ended");
        setTimeout(startWakeWordDetection, 1000);
      } catch (error) {
        console.error("Error ending conversation:", error);
        toast.error("Error ending conversation");
      }
    }
  };

  const lastBotMessage = messages.filter(msg => !msg.isUser).pop()?.content || '';

  return (
    <div className="hologram-container flex flex-col items-center justify-center">
      <div className="hologram-platform relative">
        <HologramBot isSpeaking={isSpeaking} />
        {messages.length > 0 && (
          <div className="message-display animate-fade-in">
            <ChatMessage 
              message={lastBotMessage}
              isUser={false}
              isSpeaking={isSpeaking}
            />
          </div>
        )}
      </div>
      
      <Card className="control-panel w-full max-w-lg mx-auto mt-8 bg-opacity-20 backdrop-blur-sm border-primary/30 animate-fade-in">
        <CardContent className="p-6">
          <div className="flex flex-col">
            <MessagesDisplay 
              messages={messages}
              isSpeaking={isSpeaking}
              messagesEndRef={messagesEndRef}
            />
            
            <div className="flex items-center justify-center mt-4">
              <MicButton 
                isListening={isConnected} 
                onClick={handleMicToggle}
                disabled={!hasMicPermission && !isConnected}
              />
            </div>
            
            <div className="text-center mt-4 text-sm text-cyan-300">
              {isConnected ? (
                isSpeaking ? "BoneQuest is speaking..." : "BoneQuest is listening..."
              ) : isWakeWordListening ? (
                "Say 'Hey BoneQuest' to start"
              ) : (
                "Click the microphone to start"
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BoneQuestChat;
