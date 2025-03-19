import React from 'react';
import { Message } from '../../lib/supabase';

type ChatMessageProps = {
  message: Message;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  // Format content for system messages
  const formatContent = (content: string) => {
    if (!isUser) {
      // Try to parse as JSON first
      try {
        if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
          const jsonObj = JSON.parse(content);
          
          // Check if this is a JSON response that should be displayed as plain text
          // (e.g., it has an output field that we want to show directly)
          if (jsonObj.output !== undefined) {
            return jsonObj.output;
          } else if (jsonObj.message !== undefined) {
            return jsonObj.message;
          } else if (jsonObj.text !== undefined) {
            return jsonObj.text;
          } else if (jsonObj.content !== undefined) {
            return jsonObj.content;
          } else if (jsonObj.response !== undefined) {
            return jsonObj.response;
          }
          
          // If no specific output field is found, format as JSON
          return (
            <pre className="whitespace-pre-wrap overflow-x-auto text-xs">
              {JSON.stringify(jsonObj, null, 2)}
            </pre>
          );
        }
      } catch (e) {
        // If parsing fails, just return the original content
      }
    }
    
    // For user messages or non-JSON system messages, return as is
    return content;
  };
  
  return (
    <div className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {isUser ? (
        <div className="max-w-[80%] group">
          <div className="rounded-2xl px-4 py-2 bg-gradient-to-r from-indigo-400 to-purple-500 text-white shadow-lg">
            <div className="text-sm">{formatContent(message.content)}</div>
            <div className="text-xs mt-1 text-indigo-100 opacity-80">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-[80%] group">
          <div className="rounded-2xl px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white shadow-lg">
            <div className="text-sm">{formatContent(message.content)}</div>
            <div className="text-xs mt-1 text-gray-400">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
