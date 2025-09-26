'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Wand2, Copy, Download, Eye } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { GenerationResult } from '@/lib/types';

export default function UIMode() {
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
      const response = await fetch('/api/generate/ui', {
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
        throw new Error(data.error || 'Failed to generate UI');
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

  const styleOptions = [
    { value: 'modern', label: 'Modern' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'creative', label: 'Creative' }
  ];

  const frameworkOptions = [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte' },
    { value: 'vanilla', label: 'Vanilla JS' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">UI Generator</h2>
        <p className="text-gray-600">Generate beautiful UI mockups and designs from natural language</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Generate UI</h3>
            </div>

            <Input
              value={prompt}
              onChange={setPrompt}
              placeholder="Describe the UI you want to create..."
              label="UI Description"
            />

            <Input
              value={context}
              onChange={setContext}
              placeholder="Additional context or requirements..."
              label="Context (Optional)"
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
              Generate UI
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
              <h3 className="text-lg font-semibold">Generated UI</h3>
              {result && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.files[0]?.content || '')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const blob = new Blob([result.files[0]?.content || ''], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = result.files[0]?.name || 'ui-component.tsx';
                      a.click();
                    }}
                  >
                    <Download className="w-4 h-4" />
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

                {result.files.map((file, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{file.name}</h4>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {file.language}
                      </span>
                    </div>
                    <div className="code-block">
                      <pre className="text-sm overflow-x-auto">
                        <code>{file.content}</code>
                      </pre>
                    </div>
                  </div>
                ))}

                {result.instructions.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {result.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {instruction}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Generated UI components will appear here</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
