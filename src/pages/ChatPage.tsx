import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useWebhookStore } from '../store/webhookStore';
import Navbar from '../components/layout/Navbar';
import SessionList from '../components/chat/SessionList';
import ChatHistory from '../components/chat/ChatHistory';
import ChatInput from '../components/chat/ChatInput';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    messages, 
    sessions, 
    currentSession, 
    sendMessage, 
    loadUserSessions, 
    loadChatHistory, 
    createNewSession,
    updateSessionTitle,
    deleteSession,
    batchDeleteSessions,
    receiveSystemMessage
  } = useChatStore();
  
  const { testWebhook, loadWebhookSettings } = useWebhookStore();
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadUserSessions(user.id);
    loadWebhookSettings(user.id);
  }, [user, navigate, loadUserSessions, loadWebhookSettings]);

  const handleSendMessage = async (content: string) => {
    if (!user) return;
    
    if (!currentSession) {
      await createNewSession(user.id);
    }
    
    await sendMessage(content, user.id);
    
    // Send to webhook if configured
    if (currentSession) {
      try {
        // Show thinking indicator
        setIsThinking(true);
        
        const webhookResponse = await testWebhook(content, currentSession.id, user);
        
        // Hide thinking indicator
        setIsThinking(false);
        
        // Display webhook response in chat if it exists
        if (webhookResponse) {
          let responseContent = '';
          
          // Handle different response formats
          if (typeof webhookResponse === 'string') {
            responseContent = webhookResponse;
          } else if (webhookResponse.output) {
            responseContent = webhookResponse.output;
          } else if (webhookResponse.message) {
            responseContent = webhookResponse.message;
          } else if (webhookResponse.response) {
            responseContent = webhookResponse.response;
          } else if (webhookResponse.text) {
            responseContent = webhookResponse.text;
          } else if (webhookResponse.content) {
            responseContent = webhookResponse.content;
          } else {
            // If no specific field is found, stringify the entire response
            responseContent = JSON.stringify(webhookResponse, null, 2);
          }
          
          // Add the webhook response as a system message
          await receiveSystemMessage(responseContent);
        }
      } catch (error) {
        // Hide thinking indicator even if there's an error
        setIsThinking(false);
        console.error("Failed to send to webhook:", error);
        // We don't want to block the UI if webhook fails
      }
    }
  };

  const handleSelectSession = (sessionId: string) => {
    loadChatHistory(sessionId);
  };

  const handleNewSession = () => {
    if (user) {
      createNewSession(user.id);
    }
  };

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    updateSessionTitle(sessionId, newTitle);
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
  };

  const handleBatchDeleteSessions = (sessionIds: string[]) => {
    batchDeleteSessions(sessionIds);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-black/20 backdrop-blur-md p-4 flex flex-col">
          <SessionList 
            sessions={sessions} 
            currentSessionId={currentSession?.id || null} 
            onSelectSession={handleSelectSession}
            onNewSession={handleNewSession}
            onRenameSession={handleRenameSession}
            onDeleteSession={handleDeleteSession}
            onBatchDeleteSessions={handleBatchDeleteSessions}
          />
        </div>
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 flex-1 overflow-hidden flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4">
              {currentSession?.title || 'New Chat'}
            </h2>
            
            <div className="flex-1 overflow-hidden">
              <ChatHistory messages={messages} loading={isThinking} />
            </div>
          </div>
          
          <div className="p-4 border-t border-white/10">
            <ChatInput onSendMessage={handleSendMessage} disabled={isThinking} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
