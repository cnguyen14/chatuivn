import React, { useState, useEffect } from 'react';
import { useWebhookStore } from '../../store/webhookStore';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import Input from '../ui/Input';
import Button from '../ui/Button';
import GlassMorphism from '../ui/GlassMorphism';
import { Plus, Trash2, Send } from 'lucide-react';

const WebhookSettings: React.FC = () => {
  const { user } = useAuthStore();
  const { currentSession } = useChatStore();
  const { 
    webhookUrl, 
    webhookVariables, 
    loading, 
    error, 
    saveWebhookSettings, 
    loadWebhookSettings,
    updateWebhookUrl,
    addVariable,
    updateVariable,
    removeVariable,
    testWebhook
  } = useWebhookStore();
  
  const [customVariables, setCustomVariables] = useState<{ key: string; value: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (user) {
      loadWebhookSettings(user.id);
    }
  }, [user, loadWebhookSettings]);
  
  useEffect(() => {
    // Convert object to array of key-value pairs
    const variablesArray = Object.entries(webhookVariables || {}).map(
      ([key, value]) => ({ key, value: value as string })
    );
    
    setCustomVariables(variablesArray.length > 0 ? variablesArray : [{ key: '', value: '' }]);
  }, [webhookVariables]);
  
  // Countdown effect
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const id = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(id);
    } else if (countdown === 0) {
      // Timeout reached
      setIsTesting(false);
      setCountdown(null);
      setTestResult({
        success: false,
        message: "Webhook test timed out after 10 seconds. The webhook might be taking too long to respond."
      });
    }
  }, [countdown]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);
  
  const handleAddVariable = () => {
    setCustomVariables([...customVariables, { key: '', value: '' }]);
  };
  
  const handleRemoveVariable = (index: number) => {
    const newVariables = [...customVariables];
    newVariables.splice(index, 1);
    setCustomVariables(newVariables.length > 0 ? newVariables : [{ key: '', value: '' }]);
  };
  
  const handleVariableChange = (index: number, field: 'key' | 'value', value: string) => {
    const newVariables = [...customVariables];
    newVariables[index][field] = value;
    setCustomVariables(newVariables);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSaving(true);
    
    // Update webhook URL in store
    updateWebhookUrl(webhookUrl);
    
    // Update variables in store
    const updatedVariables: Record<string, string> = {};
    customVariables.forEach(variable => {
      if (variable.key.trim()) {
        updatedVariables[variable.key.trim()] = variable.value;
      }
    });
    
    // Clear existing variables
    Object.keys(webhookVariables).forEach(key => {
      removeVariable(key);
    });
    
    // Add new variables
    Object.entries(updatedVariables).forEach(([key, value]) => {
      updateVariable(key, value);
    });
    
    // Save to database
    await saveWebhookSettings(user.id);
    setIsSaving(false);
    setTestResult({success: true, message: "Settings saved successfully!"});
    
    // Clear test result after 3 seconds
    setTimeout(() => {
      setTestResult(null);
    }, 3000);
  };
  
  const handleTestWebhook = async () => {
    if (!user || !webhookUrl) return;
    
    setIsTesting(true);
    setTestResult(null);
    setCountdown(10); // Start 10 second countdown
    
    try {
      // First save the current settings
      updateWebhookUrl(webhookUrl);
      
      const updatedVariables: Record<string, string> = {};
      customVariables.forEach(variable => {
        if (variable.key.trim()) {
          updatedVariables[variable.key.trim()] = variable.value;
        }
      });
      
      // Clear existing variables
      Object.keys(webhookVariables).forEach(key => {
        removeVariable(key);
      });
      
      // Add new variables
      Object.entries(updatedVariables).forEach(([key, value]) => {
        updateVariable(key, value);
      });
      
      // Save to database
      await saveWebhookSettings(user.id);
      
      // Create a promise that will reject after 10 seconds
      const timeoutPromise = new Promise((_, reject) => {
        const id = setTimeout(() => {
          reject(new Error("Webhook test timed out after 10 seconds"));
        }, 10000);
        setTimeoutId(id);
      });
      
      // Test the webhook with just a PING message
      const sessionId = currentSession?.id || 'test-session';
      const webhookPromise = testWebhook('PING', sessionId, user);
      
      // Race the webhook call against the timeout
      const result = await Promise.race([webhookPromise, timeoutPromise]);
      
      // Clear the timeout if webhook responded
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      
      setTestResult({
        success: true,
        message: "Webhook test successful! Check your webhook endpoint for the received PING."
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: `Webhook test failed: ${error.message}`
      });
    } finally {
      setIsTesting(false);
      setCountdown(null);
      
      // Clear the timeout if it exists
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    }
  };
  
  return (
    <GlassMorphism className="p-6" intensity="heavy">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Webhook Settings</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-800 font-medium">
          {error}
        </div>
      )}
      
      {testResult && (
        <div className={`mb-4 p-3 ${testResult.success ? 'bg-green-500/20 border border-green-500/50 text-green-800' : 'bg-red-500/20 border border-red-500/50 text-red-800'} rounded-lg font-medium`}>
          {testResult.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-900 mb-2">
            Webhook URL <span className="text-red-600">*</span>
          </label>
          <input
            id="webhookUrl"
            type="url"
            placeholder="https://your-n8n-webhook-url.com"
            value={webhookUrl}
            onChange={(e) => updateWebhookUrl(e.target.value)}
            required
            className="w-full px-3 py-2 bg-white/80 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Custom Variables
          </label>
          
          <div className="space-y-3">
            {customVariables.map((variable, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Variable name"
                    value={variable.key}
                    onChange={(e) => handleVariableChange(index, 'key', e.target.value)}
                    className="w-full px-3 py-2 bg-white/80 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Value"
                    value={variable.value}
                    onChange={(e) => handleVariableChange(index, 'value', e.target.value)}
                    className="w-full px-3 py-2 bg-white/80 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveVariable(index)}
                  className="p-2 text-gray-700 hover:text-red-600 bg-white/80 rounded-lg"
                  disabled={customVariables.length === 1}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={handleAddVariable}
            className="mt-3 flex items-center text-sm text-indigo-700 hover:text-indigo-900 font-medium"
          >
            <Plus size={16} className="mr-1" /> Add Variable
          </button>
        </div>
        
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Button
            type="submit"
            variant="gradient"
            isLoading={isSaving || loading}
            className="font-medium"
          >
            Save Settings
          </Button>
          
          <div className="flex-1 sm:flex-none">
            <div className="p-3 bg-gray-100 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Test Webhook</h3>
              <Button
                type="button"
                onClick={handleTestWebhook}
                variant="primary"
                isLoading={isTesting}
                disabled={!webhookUrl || isTesting}
                leftIcon={<Send size={16} />}
                className="w-full"
              >
                {isTesting ? `Testing (${countdown}s)` : 'Send Test Ping'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </GlassMorphism>
  );
};

export default WebhookSettings;
