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
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Check if this is a coding request
      const isCodingRequest = checkIfCodingRequest(currentInput);
      
      if (isCodingRequest && isGitHubConnected) {
        await handleCodingRequest(currentInput, userMessage);
      } else {
        await handleChatRequest(currentInput, userMessage);
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

  const checkIfCodingRequest = (input: string): boolean => {
    const codingKeywords = [
      'create', 'build', 'make', 'generate', 'code', 'component', 'app', 'website',
      'fix', 'bug', 'error', 'refactor', 'add feature', 'implement', 'write code'
    ];
    return codingKeywords.some(keyword => input.toLowerCase().includes(keyword));
  };

  const handleCodingRequest = async (input: string, userMessage: Message) => {
    const githubToken = localStorage.getItem('github_token');
    
    // Determine the type of coding task
    let taskType = 'create_component';
    if (input.toLowerCase().includes('app') || input.toLowerCase().includes('website')) {
      taskType = 'create_app';
    } else if (input.toLowerCase().includes('fix') || input.toLowerCase().includes('bug')) {
      taskType = 'fix_bug';
    } else if (input.toLowerCase().includes('add') || input.toLowerCase().includes('feature')) {
      taskType = 'add_feature';
    } else if (input.toLowerCase().includes('refactor')) {
      taskType = 'refactor';
    }

    const task = {
      id: `task-${Date.now()}`,
      type: taskType,
      description: input,
      context: 'User requested via Glacier AI chat',
      requirements: [
        'Modern React with TypeScript',
        'Tailwind CSS styling',
        'Production ready code',
        'Clean and maintainable'
      ]
    };

    const response = await fetch('/api/code/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task,
        githubToken
      }),
    });

    const result = await response.json();

    if (result.success) {
      let responseContent = `✅ **Task completed successfully!**\n\n`;
      
      if (result.files && result.files.length > 0) {
        responseContent += `**Files created:**\n`;
        result.files.forEach((file: any) => {
          responseContent += `- \`${file.path}\` (${file.language})\n`;
        });
        responseContent += `\n`;
      }

      if (result.repository) {
        responseContent += `**Repository:** [${result.repository.owner}/${result.repository.name}](${result.repository.url})\n`;
        if (result.pullRequest) {
          responseContent += `**Pull Request:** [#${result.pullRequest.number}](${result.pullRequest.url})\n`;
        }
      }

      responseContent += `\n**Description:** ${result.files?.[0]?.description || 'Code generated successfully'}`;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } else {
      throw new Error(result.error || 'Failed to execute coding task');
    }
  };

  const handleChatRequest = async (input: string, userMessage: Message) => {
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

  const handleQuickCreateRepo = async () => {
    const repoName = prompt('Enter repository name:');
    if (!repoName) return;

    const description = prompt('Enter repository description:') || `Repository created by Glacier AI: ${repoName}`;
    
    setIsLoading(true);
    
    try {
      const githubToken = localStorage.getItem('github_token');
      const response = await fetch('/api/code/create-repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: repoName,
          description,
          githubToken,
          template: 'Next.js application'
        }),
      });

      const result = await response.json();

      if (result.success) {
        const successMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ **Repository created successfully!**\n\n**Repository:** [${result.repository.owner}/${result.repository.name}](${result.repository.url})\n\n**Files created:**\n${result.files.map((f: any) => `- \`${f.path}\``).join('\n')}\n\nYou can now start coding in this repository!`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
      } else {
        throw new Error(result.error || 'Failed to create repository');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ **Failed to create repository:** ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
              <p className="text-sm mb-4">Your AI coding assistant with real GitHub integration</p>
              
              <div className="max-w-md mx-auto text-left space-y-2">
                <p className="text-xs text-gray-400">Try these commands:</p>
                <div className="bg-gray-800 rounded p-3 space-y-1">
                  <p className="text-xs"><span className="text-blue-400">•</span> "Create a React component for a login form"</p>
                  <p className="text-xs"><span className="text-blue-400">•</span> "Build a Next.js todo app"</p>
                  <p className="text-xs"><span className="text-blue-400">•</span> "Fix the bug in my authentication"</p>
                  <p className="text-xs"><span className="text-blue-400">•</span> "Add a dark mode feature"</p>
                </div>
                {!isGitHubConnected && (
                  <p className="text-xs text-yellow-400 mt-2">
                    💡 Connect GitHub to create real repositories and files!
                  </p>
                )}
              </div>
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
              title={isGitHubConnected ? 'Disconnect GitHub' : 'Connect GitHub'}
            >
              <Github className="w-4 h-4" />
            </button>

            {/* Quick Create Repo Button */}
            {isGitHubConnected && (
              <button
                onClick={handleQuickCreateRepo}
                className="px-3 py-2 text-sm rounded border transition-colors bg-blue-600 border-blue-500 text-white hover:bg-blue-700"
                title="Create new repository"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}

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
