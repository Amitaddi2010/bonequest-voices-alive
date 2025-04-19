
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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const agentId = "P39r1B8PJCGBBZL54HdP"; // Your ElevenLabs agent ID

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
      setIsReady(true);
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
      setIsReady(false);
      // Restart wake word detection after disconnection
      if (hasMicPermission) {
        setTimeout(() => {
          startWakeWordDetection();
        }, 1000);
      }
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

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  // Start wake word detection when microphone permission is granted and not connected
  useEffect(() => {
    if (hasMicPermission && !isConnected) {
      startWakeWordDetection();
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [hasMicPermission, isConnected]);

  const startWakeWordDetection = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    // Stop any existing recognition instance
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log("Wake word detection started");
        setIsWakeWordListening(true);
      };

      recognition.onresult = async (event) => {
        console.log("Recognition result received");
        try {
          const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
          console.log("Transcript:", transcript);
          
          if (transcript.includes('hey bonequest')) {
            console.log("Wake word detected!");
            
            // Stop the recognition to avoid multiple activations
            if (recognitionRef.current) {
              recognitionRef.current.stop();
              recognitionRef.current = null;
              setIsWakeWordListening(false);
            }
            
            if (!isConnected) {
              try {
                const conversationId = await conversation.startSession({ agentId });
                console.log("Conversation started with ID:", conversationId);
                toast.success("Connected to BoneQuest AI");
              } catch (error) {
                console.error("Error starting conversation:", error);
                toast.error("Failed to connect to BoneQuest AI");
                // Restart wake word detection
                setTimeout(startWakeWordDetection, 1000);
              }
            }
          }
        } catch (error) {
          console.error("Error processing speech recognition result:", error);
        }
      };

      recognition.onend = () => {
        console.log("Wake word detection ended");
        setIsWakeWordListening(false);
        
        // Restart if we're not connected and not intentionally stopped
        if (!isConnected && recognitionRef.current) {
          console.log("Restarting wake word detection");
          setTimeout(() => {
            if (!isConnected && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.error("Error restarting recognition:", error);
                recognitionRef.current = null;
                // Try to recreate after a delay
                setTimeout(startWakeWordDetection, 1000);
              }
            }
          }, 300);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'aborted') {
          // This is often a normal part of stopping recognition, don't show error
          console.log("Recognition aborted - this is normal when stopping");
        } else {
          toast.error("Error with speech recognition. Please try again.");
        }
        
        // Clean up and try to restart if not intentionally stopped
        if (event.error !== 'aborted' && !isConnected) {
          recognitionRef.current = null;
          setTimeout(startWakeWordDetection, 1000);
        }
      };

      recognitionRef.current = recognition;
      
      recognition.start();
      console.log("Recognition started");
      
    } catch (error) {
      console.error('Error starting wake word detection:', error);
      toast.error("Failed to start voice detection");
    }
  };

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
        
        // Restart wake word detection after ending conversation
        setTimeout(startWakeWordDetection, 1000);
      } catch (error) {
        console.error("Error ending conversation:", error);
        toast.error("Error ending conversation");
      }
    } else {
      console.log("Starting conversation with agent:", agentId);
      
      // Stop wake word detection if it's running
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
        setIsWakeWordListening(false);
      }
      
      try {
        const conversationId = await conversation.startSession({ agentId });
        console.log("Conversation started with ID:", conversationId);
        toast.success("Connected to BoneQuest AI");
      } catch (error) {
        console.error("Error starting conversation:", error);
        toast.error("Failed to connect to BoneQuest AI");
        
        // Restart wake word detection after failure
        setTimeout(startWakeWordDetection, 1000);
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
