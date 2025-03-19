import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import { ChatMessage as ChatMessageType } from '../../lib/supabase';

type ChatHistoryProps = {
  messages: ChatMessageType[];
  loading?: boolean;
};

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, loading = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 h-full"
      style={{ overflowY: 'auto', height: '100%' }}
    >
      {messages.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-300">
          <p className="text-lg mb-2">No messages yet</p>
          <p className="text-sm">Start a conversation by sending a message</p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {loading && (
            <div className="flex justify-start my-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg px-4 py-2 max-w-[80%]">
                <div className="flex items-center">
                  <div className="mr-2 text-sm">AI Agent is thinking</div>
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default ChatHistory;
