
import React from 'react';

interface HologramBotProps {
  isSpeaking: boolean;
}

const HologramBot: React.FC<HologramBotProps> = ({ isSpeaking }) => {
  return (
    <div className="hologram-bot-container">
      <div className="hologram-bot">
        <div className="head">
          <div className="face">
            <div className="eyes">
              <div className="eye left"></div>
              <div className="eye right"></div>
            </div>
            <div className={`mouth ${isSpeaking ? 'speaking' : ''}`}></div>
          </div>
        </div>
        <div className="bot-platform">
          <div className="platform-inner">
            <span className="platform-logo">B</span>
          </div>
          <div className="platform-glow"></div>
        </div>
        <div className="hologram-rays">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="ray" style={{ animationDelay: `${i * 0.2}s` }}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HologramBot;
