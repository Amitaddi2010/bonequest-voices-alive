
import React from 'react';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  isSpeaking?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, isSpeaking = false }) => {
  return (
    <div className={`chat-bubble ${isUser ? 'user-bubble' : 'agent-bubble'} ${!isUser && isSpeaking ? 'speaking' : ''}`}>
      {isSpeaking ? (
        <div className="flex items-center">
          <span className="mr-2 text-white">{message}</span>
          <div className="wave-animation">
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
          </div>
        </div>
      ) : (
        <p className="text-white">{message}</p>
      )}
    </div>
  );
};

export default ChatMessage;
