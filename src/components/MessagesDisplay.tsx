
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from './ChatMessage';

interface Message {
  content: string;
  isUser: boolean;
}

interface MessagesDisplayProps {
  messages: Message[];
  isSpeaking: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const MessagesDisplay: React.FC<MessagesDisplayProps> = ({ messages, isSpeaking, messagesEndRef }) => {
  const speakingMessageIndex = isSpeaking ? messages.findIndex(msg => !msg.isUser) : -1;

  return (
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
  );
};

export default MessagesDisplay;
