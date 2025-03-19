import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

type ChatInputProps = {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
};

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Reset textarea height when message is cleared
  useEffect(() => {
    if (message === '' && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        disabled={disabled}
        className={`w-full p-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none overflow-hidden max-h-32 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
        rows={1}
      />
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className={`absolute right-3 top-1/2 -translate-y-1/2 text-white p-1 rounded-full ${
          !message.trim() || disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'
        }`}
      >
        <PaperAirplaneIcon className="h-5 w-5" />
      </button>
    </form>
  );
};

export default ChatInput;
