
import React, { useState, useEffect, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { toast } from 'sonner';
import ChatMessage from './ChatMessage';
import MicButton from './MicButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Message {
  content: string;
  isUser: boolean;
}

const BoneQuestChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const agentId = "P39r1B8PJCGBBZL54HdP"; // Your ElevenLabs agent ID

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
      setIsReady(true);
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
      setIsReady(false);
    },
    onMessage: (message) => {
      console.log("Received message:", message);
      
      if (message.role === 'assistant' && message.content) {
        // Add assistant message to chat
        setMessages(prev => [...prev, { content: message.content, isUser: false }]);
      } else if (message.role === 'user' && message.content) {
        // Add user message to chat
        setMessages(prev => [...prev, { content: message.content, isUser: true }]);
      }
    },
    onError: (error) => {
      console.error("Error in conversation:", error);
      toast.error("Error in conversation. Please try again.");
    }
  });

  const { status, isSpeaking } = conversation;

  const isConnected = status === 'connected';
  const isListening = isConnected && !isSpeaking;

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Check for microphone permission
    const checkMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setHasMicPermission(true);
      } catch (err) {
        console.error("Microphone permission denied:", err);
        setHasMicPermission(false);
        toast.error("Microphone permission is required for voice chat");
      }
    };
    
    checkMicPermission();
  }, []);

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
      } catch (error) {
        console.error("Error ending conversation:", error);
        toast.error("Error ending conversation");
      }
    } else {
      console.log("Starting conversation with agent:", agentId);
      try {
        const conversationId = await conversation.startSession({ agentId });
        console.log("Conversation started with ID:", conversationId);
        toast.success("Connected to BoneQuest AI");
      } catch (error) {
        console.error("Error starting conversation:", error);
        toast.error("Failed to connect to BoneQuest AI");
      }
    }
  };

  // Find speaking message (if any)
  const speakingMessageIndex = isSpeaking ? messages.findLastIndex(msg => !msg.isUser) : -1;

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg border-2 border-primary/20">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-2xl font-bold text-center">BoneQuest AI</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto mb-4 px-2">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Start a conversation with BoneQuest AI</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <ChatMessage 
                  key={index} 
                  message={message.content} 
                  isUser={message.isUser}
                  isSpeaking={!message.isUser && index === speakingMessageIndex && isSpeaking}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="flex items-center justify-center mt-4">
            <MicButton 
              isListening={isConnected} 
              onClick={handleMicToggle}
              disabled={!hasMicPermission && !isConnected}
            />
          </div>
          
          <div className="text-center mt-4 text-sm text-muted-foreground">
            {isConnected ? (
              isSpeaking ? "BoneQuest is speaking..." : "BoneQuest is listening..."
            ) : (
              "Click the microphone to start"
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BoneQuestChat;
