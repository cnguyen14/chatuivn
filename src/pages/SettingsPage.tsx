import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/layout/Navbar';
import WebhookSettings from '../components/settings/WebhookSettings';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuthStore();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <Navbar />
      
      <div className="flex-1 container mx-auto p-4">
        <h1 className="text-2xl font-bold text-white mb-6 drop-shadow-md">Settings</h1>
        
        <div className="grid grid-cols-1 gap-6">
          <WebhookSettings />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
