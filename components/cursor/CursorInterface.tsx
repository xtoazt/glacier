'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Github,
  Send,
  Plus,
  X,
  File,
  Folder,
  ChevronRight,
  ChevronDown,
  Settings,
  User
} from 'lucide-react';

interface Tab {
  id: string;
  name: string;
  type: 'file' | 'chat' | 'github';
  content?: string;
  path?: string;
  isActive?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function CursorInterface() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'chat-1', name: 'Chat', type: 'chat', isActive: true }
  ]);
  const [activeTab, setActiveTab] = useState('chat-1');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4.1-nano-2025-04-14');
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const [githubUser, setGithubUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const models = [
    { id: 'gpt-4.1-nano-2025-04-14', name: 'GPT-4.1 Nano' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    { id: 'gpt-4o', name: 'GPT-4o' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Check if user is already authenticated with GitHub
    const checkGitHubAuth = () => {
      const token = localStorage.getItem('github_token');
      const user = localStorage.getItem('github_user');
      
      if (token && user) {
        try {
          const userData = JSON.parse(user);
          setGithubUser(userData);
          setIsGitHubConnected(true);
        } catch (error) {
          console.log('Invalid stored user data');
          localStorage.removeItem('github_token');
          localStorage.removeItem('github_user');
        }
      }
    };
    
    checkGitHubAuth();
    
    // Listen for storage changes (when auth completes in popup)
    const handleStorageChange = () => {
      checkGitHubAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/llm7', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          model: selectedModel
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'An error occurred'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGitHubAuth = () => {
    if (isGitHubConnected) {
      // Disconnect
      setIsGitHubConnected(false);
      setGithubUser(null);
      localStorage.removeItem('github_token');
      localStorage.removeItem('github_user');
    } else {
      // Connect - open GitHub OAuth in popup
      const popup = window.open(
        '/api/github/auth/login',
        'github-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );
      
      // Check if popup is closed
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          // Check if auth was successful
          const token = localStorage.getItem('github_token');
          const user = localStorage.getItem('github_user');
          if (token && user) {
            try {
              const userData = JSON.parse(user);
              setGithubUser(userData);
              setIsGitHubConnected(true);
            } catch (error) {
              console.log('Invalid stored user data');
            }
          }
        }
      }, 1000);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setTabs(prev => prev.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })));
  };

  const handleTabClose = (tabId: string) => {
    if (tabs.length <= 1) return; // Don't close the last tab
    
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      if (activeTab === tabId) {
        setActiveTab(newTabs[0].id);
        newTabs[0].isActive = true;
      }
      return newTabs;
    });
  };

  const handleNewTab = () => {
    const newTab: Tab = {
      id: `chat-${Date.now()}`,
      name: 'New Chat',
      type: 'chat',
      isActive: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Tabs */}
      <div className="flex items-center bg-gray-800 border-b border-gray-700">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center px-4 py-2 border-r border-gray-700 cursor-pointer ${
              tab.isActive ? 'bg-gray-900 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
            onClick={() => handleTabChange(tab.id)}
          >
            <span className="text-sm">{tab.name}</span>
            {tabs.length > 1 && (
              <button
                className="ml-2 hover:bg-gray-600 rounded p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClose(tab.id);
                }}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <button
          className="px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700"
          onClick={handleNewTab}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <p className="text-lg font-medium">Welcome to Glacier</p>
              <p className="text-sm">Start a conversation with the AI assistant</p>
            </div>
          )}
          
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-100'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-800 text-gray-100 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500"></div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 bg-gray-800 p-4">
          <div className="flex items-center space-x-3">
            {/* Model Selector */}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-3 py-2 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>

            {/* GitHub Button */}
            <button
              onClick={handleGitHubAuth}
              className={`px-3 py-2 text-sm rounded border transition-colors ${
                isGitHubConnected
                  ? 'bg-green-600 border-green-500 text-white'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Github className="w-4 h-4" />
            </button>

            {/* Input Field */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* GitHub Status */}
          {isGitHubConnected && githubUser && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-gray-400">
              <User className="w-4 h-4" />
              <span>Connected as {githubUser.login}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
