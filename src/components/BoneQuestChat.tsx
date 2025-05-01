import React, { useState, useEffect, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import RobotModel from './RobotModel';
import InteractionPanel from './InteractionPanel';

interface Message {
  content: string;
  isUser: boolean;
}

const BoneQuestChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [isWakeWordListening, setIsWakeWordListening] = useState(false);
  const [robotEmotion, setRobotEmotion] = useState<'neutral' | 'happy' | 'thinking' | 'confused'>('neutral');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRestartingRef = useRef<boolean>(false);
  
  const agentId = "E4dzndpdnjs9K0slPePm"; // Updated agent ID

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
      setIsReady(true);
      setRobotEmotion('happy');
      setTimeout(() => setRobotEmotion('neutral'), 2000);
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
        // Change emotion based on message content
        if (message.message.includes('?')) {
          setRobotEmotion('confused');
        } else if (message.message.includes('!')) {
          setRobotEmotion('happy');
        } else {
          setRobotEmotion('neutral');
        }
        
        // Add assistant message to chat
        setMessages(prev => [...prev, { content: message.message, isUser: false }]);
      } else if (source && source.includes('user') && message.message) {
        // Set thinking emotion when user speaks
        setRobotEmotion('thinking');
        
        // Add user message to chat
        setMessages(prev => [...prev, { content: message.message, isUser: true }]);
      }
    },
    onError: (error) => {
      console.error("Error in conversation:", error);
      toast.error("Error in conversation. Please try again.");
      setRobotEmotion('confused');
    }
  });

  const { status, isSpeaking } = conversation;

  const isConnected = status === 'connected';
  const isListening = isConnected && !isSpeaking;

  // Clean up speech recognition instance
  const cleanupRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.log("Recognition already stopped");
      }
      recognitionRef.current = null;
    }
  };

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

    return () => {
      cleanupRecognition();
    };
  }, []);

  const startWakeWordDetection = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    if (isRestartingRef.current) {
      return;
    }

    cleanupRecognition();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      if (transcript.includes('hey bonequest')) {
        if (!isConnected) {
          setIsWakeWordListening(false);
          cleanupRecognition();
          try {
            const conversationId = await conversation.startSession({ agentId });
            console.log("Conversation started with ID:", conversationId);
            toast.success("Connected to BoneQuest AI");
          } catch (error) {
            console.error("Error starting conversation:", error);
            toast.error("Failed to connect to BoneQuest AI");
            setTimeout(() => {
              setIsWakeWordListening(true);
              startWakeWordDetection();
            }, 1000);
          }
        }
      }
    };

    recognition.onend = () => {
      // Only restart if we're supposed to be listening and not already restarting
      if (!isConnected && !isRestartingRef.current) {
        isRestartingRef.current = true;
        setTimeout(() => {
          if (!isConnected) {
            try {
              recognitionRef.current = null;
              startWakeWordDetection();
              setIsWakeWordListening(true);
            } catch (err) {
              console.error("Error restarting recognition:", err);
            }
          }
          isRestartingRef.current = false;
        }, 300);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'aborted') {
        // Avoid showing too many toast errors for common errors
        if (event.error !== 'no-speech') {
          toast.error("Error with speech recognition. Please try again.");
        }
        
        // Give a short delay before restarting
        setTimeout(() => {
          if (!isConnected && !isRestartingRef.current) {
            startWakeWordDetection();
          }
        }, 1000);
      }
    };

    try {
      recognition.start();
      setIsWakeWordListening(true);
    } catch (error) {
      console.error('Error starting wake word detection:', error);
      setIsWakeWordListening(false);
    }
  };

  useEffect(() => {
    if (hasMicPermission && !isConnected) {
      startWakeWordDetection();
    }

    return () => {
      cleanupRecognition();
    };
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

    cleanupRecognition();

    if (isConnected) {
      console.log("Ending conversation session");
      setRobotEmotion('neutral');
      try {
        await conversation.endSession();
        toast.success("Conversation ended");
      } catch (error) {
        console.error("Error ending conversation:", error);
        toast.error("Error ending conversation");
      }
    } else {
      console.log("Starting conversation with agent:", agentId);
      setRobotEmotion('thinking');
      try {
        const conversationId = await conversation.startSession({ 
          agentId,
          // Add ElevenLabs API key configuration here if needed
        });
        console.log("Conversation started with ID:", conversationId);
        toast.success("Connected to BoneQuest AI");
      } catch (error) {
        console.error("Error starting conversation:", error);
        toast.error("Failed to connect to BoneQuest AI");
        setRobotEmotion('confused');
      }
    }
  };

  // Find speaking message (if any)
  const speakingMessageIndex = isSpeaking ? messages.findIndex(msg => !msg.isUser) : -1;

  return (
    <div className="futuristic-container relative flex flex-col md:flex-row gap-8 items-center justify-center w-full max-w-6xl mx-auto">
      <div className={`robot-visualization flex-1 w-full max-w-md transition-all duration-500 ${isSpeaking ? 'scale-105' : ''}`}>
        <div className="robot-platform relative mb-4">
          <RobotModel isSpeaking={isSpeaking} emotion={robotEmotion} />
          
          {/* Holographic platform effect */}
          <div className="hologram-base absolute bottom-0 left-1/2 transform -translate-x-1/2 w-40 h-4 rounded-full bg-cyan-500/20 blur-md"></div>
          
          {/* Pulse rings */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="absolute rounded-full border border-cyan-500/30"
                style={{
                  width: `${100 + i * 30}px`,
                  height: `${100 + i * 30}px`,
                  bottom: `-${50 + i * 15}px`,
                  left: `-${50 + i * 15}px`,
                  animation: `pulse-ring ${1.5 + i * 0.5}s cubic-bezier(0.1, 0.7, 0.3, 1) infinite`
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <div className="interaction-area flex-1 w-full max-w-xl">
        <InteractionPanel
          messages={messages}
          isConnected={isConnected}
          isSpeaking={isSpeaking}
          onMicToggle={handleMicToggle}
          hasMicPermission={hasMicPermission}
          speakingMessageIndex={speakingMessageIndex}
        />
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default BoneQuestChat;
