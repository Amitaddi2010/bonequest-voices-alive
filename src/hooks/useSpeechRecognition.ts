
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface UseSpeechRecognitionProps {
  onWakeWordDetected: () => void;
  isConnected: boolean;
}

export const useSpeechRecognition = ({ onWakeWordDetected, isConnected }: UseSpeechRecognitionProps) => {
  const [isWakeWordListening, setIsWakeWordListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRestartingRef = useRef(false);

  const startWakeWordDetection = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log("Error stopping recognition:", e);
      }
      recognitionRef.current = null;
    }

    try {
      isRestartingRef.current = true;
      setTimeout(() => {
        isRestartingRef.current = false;
      }, 500);
      
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
            
            if (recognitionRef.current) {
              recognitionRef.current.stop();
              recognitionRef.current = null;
              setIsWakeWordListening(false);
            }
            
            if (!isConnected) {
              onWakeWordDetected();
            }
          }
        } catch (error) {
          console.error("Error processing speech recognition result:", error);
        }
      };

      recognition.onend = () => {
        console.log("Wake word detection ended");
        setIsWakeWordListening(false);
        
        if (!isConnected && !isRestartingRef.current) {
          console.log("Restarting wake word detection");
          setTimeout(() => {
            startWakeWordDetection();
          }, 300);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'aborted' || event.error === 'network') {
          console.log("Recognition aborted - this is normal when stopping");
        } else if (!isRestartingRef.current) {
          toast.error("Error with speech recognition. Please try again.");
        }
        
        if (event.error !== 'aborted' && !isConnected && !isRestartingRef.current) {
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
      isRestartingRef.current = false;
    }
  };

  const stopWakeWordDetection = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  return {
    isWakeWordListening,
    startWakeWordDetection,
    stopWakeWordDetection
  };
};
