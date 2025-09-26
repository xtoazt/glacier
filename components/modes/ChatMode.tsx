'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { ChatMessage } from '@/lib/types';

export default function ChatMode() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'llm7' | 'gptoss'>('llm7');
  const [selectedModel, setSelectedModel] = useState('');
  const [reasoningEffort, setReasoningEffort] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [models, setModels] = useState<{ llm7: Array<{ id: string; name: string }>; gptoss: Array<{ id: string; name: string }> }>({ llm7: [], gptoss: [] });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetch('/api/models')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setModels(data.models);
          if (data.models.llm7.length > 0) {
            setSelectedModel(data.models.llm7[0].id);
          }
        }
      })
      .catch(err => console.error('Failed to load models:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      const endpoint = selectedProvider === 'llm7' ? '/api/chat/llm7' : '/api/chat/gptoss';
      const body: any = {
        messages: [...messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        model: selectedModel
      };

      if (selectedProvider === 'gptoss') {
        body.reasoningEffort = reasoningEffort;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content,
          timestamp: new Date(),
          metadata: {
            provider: data.provider,
            model: data.model
          }
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const availableModels = selectedProvider === 'llm7' ? models.llm7 : models.gptoss;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Chat</h2>
        <p className="text-gray-600">Chat with AI assistants powered by LLM7 and GPT-OSS</p>
      </div>

      <Card className="h-[600px] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-gray-500 py-8"
            >
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Start a conversation with the AI assistant</p>
            </motion.div>
          )}
          
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-glacier-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-glacier-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  {message.metadata?.provider && (
                    <p className="text-xs opacity-70 mt-1">
                      {message.metadata.provider} • {message.metadata.model}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <p className="text-red-800 text-sm">Error: {error}</p>
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-glacier-500"></div>
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={selectedProvider}
                onChange={(value) => {
                  setSelectedProvider(value as 'llm7' | 'gptoss');
                  const newModels = value === 'llm7' ? models.llm7 : models.gptoss;
                  if (newModels.length > 0) {
                    setSelectedModel(newModels[0].id);
                  }
                }}
                options={[
                  { value: 'llm7', label: 'LLM7' },
                  { value: 'gptoss', label: 'GPT-OSS' }
                ]}
                label="Provider"
              />

              <Select
                value={selectedModel}
                onChange={setSelectedModel}
                options={availableModels.map(model => ({
                  value: model.id,
                  label: model.name
                }))}
                label="Model"
                disabled={availableModels.length === 0}
              />

              {selectedProvider === 'gptoss' && (
                <Select
                  value={reasoningEffort}
                  onChange={setReasoningEffort}
                  options={[
                    { value: 'none', label: 'No Reasoning' },
                    { value: 'low', label: 'Low Effort' },
                    { value: 'medium', label: 'Medium Effort' },
                    { value: 'high', label: 'High Effort' }
                  ]}
                  label="Reasoning Effort"
                />
              )}
            </div>

            <div className="flex space-x-4">
              <Input
                value={input}
                onChange={setInput}
                placeholder="Type your message here..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                loading={isLoading}
                className="px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
