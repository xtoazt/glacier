'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, 
  Palette, 
  Layers, 
  MessageSquare, 
  Sparkles,
  Github,
  Zap,
  Globe,
  Terminal
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ChatMode from '@/components/modes/ChatMode';
import UIMode from '@/components/modes/UIMode';
import ComponentMode from '@/components/modes/ComponentMode';
import FullStackMode from '@/components/modes/FullStackMode';
import GitHubMode from '@/components/modes/GitHubMode';

type Mode = 'chat' | 'ui' | 'component' | 'fullstack' | 'github';

export default function Home() {
  const [activeMode, setActiveMode] = useState<Mode>('chat');

  const modes = [
    {
      id: 'chat' as Mode,
      name: 'AI Chat',
      description: 'Chat with AI assistants',
      icon: MessageSquare,
      color: 'bg-blue-500'
    },
    {
      id: 'ui' as Mode,
      name: 'UI Generator',
      description: 'Generate UI mockups and designs',
      icon: Palette,
      color: 'bg-purple-500'
    },
    {
      id: 'component' as Mode,
      name: 'Component Builder',
      description: 'Create reusable components',
      icon: Layers,
      color: 'bg-green-500'
    },
    {
      id: 'fullstack' as Mode,
      name: 'Full-Stack Apps',
      description: 'Build complete applications',
      icon: Code,
      color: 'bg-orange-500'
    },
    {
      id: 'github' as Mode,
      name: 'GitHub Terminal',
      description: 'Manage repos and code',
      icon: Github,
      color: 'bg-gray-600'
    }
  ];

  const renderActiveMode = () => {
    switch (activeMode) {
      case 'chat':
        return <ChatMode />;
      case 'ui':
        return <UIMode />;
      case 'component':
        return <ComponentMode />;
      case 'fullstack':
        return <FullStackMode />;
      case 'github':
        return <GitHubMode />;
      default:
        return <ChatMode />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Glacier</h1>
              <span className="text-sm text-gray-400">AI Coding Terminal</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open('https://github.com', '_blank')}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mode Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            
            return (
              <motion.div
                key={mode.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={`cursor-pointer transition-all duration-200 p-4 rounded-lg border ${
                    isActive 
                      ? 'border-purple-500 bg-gray-800' 
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                  onClick={() => setActiveMode(mode.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${mode.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{mode.name}</h3>
                      <p className="text-sm text-gray-400">{mode.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Active Mode Content */}
        <motion.div
          key={activeMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderActiveMode()}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">Powered by LLM7 & GPT-OSS</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Inspired by Warp, SuperDesign, Bolt.new, Chef, and v0.app
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
