import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { MessageSquare, Settings, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { signOut } = useAuthStore();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center text-white font-bold text-xl">
            <MessageSquare className="mr-2" size={24} />
            <span>n8n Chat</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-1">
          <Link
            to="/"
            className={`px-3 py-2 rounded-lg text-sm ${
              isActive('/') 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-200 hover:bg-white/10'
            }`}
          >
            Chat
          </Link>
          
          <Link
            to="/settings"
            className={`px-3 py-2 rounded-lg text-sm ${
              isActive('/settings') 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-200 hover:bg-white/10'
            }`}
          >
            <span className="flex items-center">
              <Settings size={16} className="mr-1" />
              Settings
            </span>
          </Link>
          
          <button
            onClick={() => signOut()}
            className="px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-white/10"
          >
            <span className="flex items-center">
              <LogOut size={16} className="mr-1" />
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
