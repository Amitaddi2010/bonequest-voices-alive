
import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MicButtonProps {
  isListening: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const MicButton: React.FC<MicButtonProps> = ({ isListening, onClick, disabled = false }) => {
  return (
    <Button
      onClick={onClick}
      className={`rounded-full w-16 h-16 flex items-center justify-center ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'} ${isListening ? 'pulse-animation' : ''}`}
      disabled={disabled}
      aria-label={isListening ? 'Stop listening' : 'Start listening'}
    >
      {isListening ? (
        <MicOff className="h-8 w-8 text-white" />
      ) : (
        <Mic className="h-8 w-8 text-white" />
      )}
    </Button>
  );
};

export default MicButton;
