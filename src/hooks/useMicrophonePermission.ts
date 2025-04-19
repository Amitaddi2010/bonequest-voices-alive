
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useMicrophonePermission = () => {
  const [hasMicPermission, setHasMicPermission] = useState(false);

  useEffect(() => {
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

  return { hasMicPermission, setHasMicPermission };
};
