import React, { useState, useEffect, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { toast } from 'sonner';
import ChatMessage from './ChatMessage';
import MicButton from './MicButton';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import HologramBot from './HologramBot';

interface Message {
  content: string;
  isUser: boolean;
}

const BoneQuestChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [isWakeWordListening, setIsWakeWordListening] = useState(false);
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
      
      // Fix for type mismatch - checking string value without direct comparison to type Role
      const source = message.source as unknown as string;
      if (source && source.includes('assistant') && message.message) {
        // Add assistant message to chat
        setMessages(prev => [...prev, { content: message.message, isUser: false }]);
      } else if (source && source.includes('user') && message.message) {
        // Add user message to chat
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

  useEffect(() => {
    const startWakeWordDetection = () => {
      if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        toast.error("Speech recognition is not supported in your browser");
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = async (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        if (transcript.includes('hey bonequest')) {
          if (!isConnected) {
            setIsWakeWordListening(false);
            recognition.stop();
            try {
              const conversationId = await conversation.startSession({ agentId });
              console.log("Conversation started with ID:", conversationId);
              toast.success("Connected to BoneQuest AI");
            } catch (error) {
              console.error("Error starting conversation:", error);
              toast.error("Failed to connect to BoneQuest AI");
              setIsWakeWordListening(true);
              recognition.start();
            }
          }
        }
      };

      recognition.onend = () => {
        if (!isConnected && !isWakeWordListening) {
          recognition.start();
          setIsWakeWordListening(true);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'aborted') {
          toast.error("Error with speech recognition. Please try again.");
        }
      };

      try {
        recognition.start();
        setIsWakeWordListening(true);
      } catch (error) {
        console.error('Error starting wake word detection:', error);
      }

      return () => {
        recognition.stop();
        setIsWakeWordListening(false);
      };
    };

    if (hasMicPermission && !isConnected) {
      startWakeWordDetection();
    }
  }, [hasMicPermission, isConnected, conversation, agentId]);

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
  const speakingMessageIndex = isSpeaking ? messages.findIndex(msg => !msg.isUser) : -1;
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
            <ScrollArea className="flex-1 h-48 rounded-md border border-primary/20 bg-black/10 p-4">
              <div className="pr-4">
                {messages.length > 0 ? (
                  messages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`message-item ${
                        !message.isUser && index === messages.length - 1 ? 'hidden' : 'block'
                      }`}
                    >
                      <ChatMessage 
                        message={message.content} 
                        isUser={message.isUser}
                        isSpeaking={!message.isUser && index === speakingMessageIndex && isSpeaking}
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-24 text-cyan-300 animate-pulse">
                    <p>Start a conversation with BoneQuest AI</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
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
