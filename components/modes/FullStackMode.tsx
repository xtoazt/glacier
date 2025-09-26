'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Wand2, Copy, Download, Server, Database, Globe } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { GenerationResult } from '@/lib/types';

export default function FullStackMode() {
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [style, setStyle] = useState('modern');
  const [framework, setFramework] = useState('react');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/generate/fullstack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          context,
          style,
          framework
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate full-stack app');
      }

      if (data.success) {
        setResult(data.result);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadAllFiles = () => {
    if (!result) return;
    
    result.files.forEach((file, index) => {
      setTimeout(() => {
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
      }, index * 100);
    });
  };

  const styleOptions = [
    { value: 'modern', label: 'Modern' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'creative', label: 'Creative' }
  ];

  const frameworkOptions = [
    { value: 'react', label: 'React + Next.js' },
    { value: 'vue', label: 'Vue + Nuxt' },
    { value: 'svelte', label: 'Svelte + SvelteKit' },
    { value: 'vanilla', label: 'Vanilla JS' }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'component':
        return <Code className="w-4 h-4" />;
      case 'api':
        return <Server className="w-4 h-4" />;
      case 'config':
        return <Database className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Full-Stack Apps</h2>
        <p className="text-gray-600">Generate complete applications with frontend, backend, and database</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Build Full-Stack App</h3>
            </div>

            <Input
              value={prompt}
              onChange={setPrompt}
              placeholder="Describe the full-stack application you want to create..."
              label="Application Description"
            />

            <Input
              value={context}
              onChange={setContext}
              placeholder="Features, database requirements, API endpoints..."
              label="Requirements (Optional)"
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                value={style}
                onChange={setStyle}
                options={styleOptions}
                label="Style"
              />

              <Select
                value={framework}
                onChange={setFramework}
                options={frameworkOptions}
                label="Framework"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              loading={isGenerating}
              className="w-full"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Full-Stack App
            </Button>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <p className="text-red-800 text-sm">Error: {error}</p>
              </motion.div>
            )}
          </div>
        </Card>

        {/* Result Panel */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Application</h3>
              {result && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadAllFiles}
                  >
                    <Download className="w-4 h-4" />
                    Download All
                  </Button>
                </div>
              )}
            </div>

            {result ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{result.description}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Project Files</h4>
                  {result.files.map((file, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getFileIcon(file.type)}
                          <h5 className="font-medium text-gray-900">{file.name}</h5>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {file.language}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(file.content)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="code-block max-h-40 overflow-y-auto">
                        <pre className="text-xs">
                          <code>{file.content}</code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>

                {result.dependencies.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">Dependencies</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.dependencies.map((dep, index) => (
                        <span key={index} className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.instructions.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
                    <ol className="text-sm text-blue-800 space-y-1">
                      {result.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2 font-medium">{index + 1}.</span>
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Server className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Generated full-stack applications will appear here</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
