import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="w-2 h-2 rounded-full bg-primary typing-dot" />
      <div className="w-2 h-2 rounded-full bg-primary typing-dot" />
      <div className="w-2 h-2 rounded-full bg-primary typing-dot" />
    </div>
  );
};

export default TypingIndicator;
