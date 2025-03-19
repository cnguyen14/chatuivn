import React, { useState } from 'react';
import { Session } from '../../lib/supabase';
import { MessageSquare, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import Button from '../ui/Button';
import ConfirmationDialog from '../ui/ConfirmationDialog';

type SessionListProps = {
  sessions: Session[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onBatchDeleteSessions: (sessionIds: string[]) => void;
};

const SessionList: React.FC<SessionListProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onRenameSession,
  onDeleteSession,
  onBatchDeleteSessions,
}) => {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    sessionId?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleRenameClick = (sessionId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(sessionId);
    setNewTitle(currentTitle);
  };

  const handleDeleteClick = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Session',
      message: 'Are you sure you want to delete this session? This action cannot be undone.',
      onConfirm: () => {
        onDeleteSession(sessionId);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      sessionId
    });
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSessionId && newTitle.trim()) {
      onRenameSession(editingSessionId, newTitle.trim());
      setEditingSessionId(null);
    }
  };

  const handleRenameCancel = () => {
    setEditingSessionId(null);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedSessions([]);
  };

  const toggleSessionSelection = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSessions(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handleBatchDelete = () => {
    if (selectedSessions.length === 0) return;
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Selected Sessions',
      message: `Are you sure you want to delete ${selectedSessions.length} selected session(s)? This action cannot be undone.`,
      onConfirm: () => {
        onBatchDeleteSessions(selectedSessions);
        setSelectedSessions([]);
        setIsSelectionMode(false);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-lg font-semibold text-white">Sessions</h2>
        <div className="flex items-center">
          {isSelectionMode ? (
            <>
              <Button
                onClick={handleBatchDelete}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 mr-1"
                disabled={selectedSessions.length === 0}
              >
                <Trash2 size={16} className={selectedSessions.length === 0 ? "text-gray-400" : "text-red-400"} />
              </Button>
              <Button
                onClick={toggleSelectionMode}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <X size={16} />
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={toggleSelectionMode}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 mr-1"
              >
                <Check size={16} />
              </Button>
              <Button
                onClick={onNewSession}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <Plus size={16} />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ overflowY: 'auto' }}>
        {sessions.length === 0 ? (
          <div className="text-center text-gray-300 py-4">
            <p className="text-sm">No sessions yet</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {sessions.map((session) => (
              <li key={session.id}>
                {editingSessionId === session.id ? (
                  <form 
                    onSubmit={handleRenameSubmit} 
                    className={`w-full px-3 py-2 rounded-lg flex items-center ${
                      currentSessionId === session.id
                        ? 'bg-white/20 text-white'
                        : 'text-gray-200 bg-white/10'
                    }`}
                  >
                    <MessageSquare size={16} className="mr-2 flex-shrink-0" />
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="flex-grow bg-transparent border-none outline-none text-white"
                      autoFocus
                      onBlur={handleRenameCancel}
                      onKeyDown={(e) => e.key === 'Escape' && handleRenameCancel()}
                    />
                    <button type="submit" className="sr-only">Save</button>
                  </form>
                ) : (
                  <div
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center group ${
                      currentSessionId === session.id
                        ? 'bg-white/20 text-white'
                        : 'text-gray-200 hover:bg-white/10'
                    }`}
                  >
                    {isSelectionMode && (
                      <div 
                        className={`w-4 h-4 mr-2 rounded border flex items-center justify-center ${
                          selectedSessions.includes(session.id) 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-gray-400'
                        }`}
                        onClick={(e) => toggleSessionSelection(session.id, e)}
                      >
                        {selectedSessions.includes(session.id) && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => onSelectSession(session.id)}
                      className="flex items-center flex-grow overflow-hidden"
                    >
                      <MessageSquare size={16} className="mr-2 flex-shrink-0" />
                      <span className="truncate">{session.title}</span>
                    </button>
                    {!isSelectionMode && (
                      <div className="flex items-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-1 text-gray-300 hover:text-white"
                          aria-label="Rename session"
                          onClick={(e) => handleRenameClick(session.id, session.title, e)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          className="p-1 text-gray-300 hover:text-red-400 ml-1"
                          aria-label="Delete session"
                          onClick={(e) => handleDeleteClick(session.id, e)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirmDialog}
        variant="danger"
      />
    </div>
  );
};

export default SessionList;
