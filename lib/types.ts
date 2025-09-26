export interface Project {
  id: string;
  name: string;
  description: string;
  type: 'ui' | 'component' | 'fullstack' | 'backend';
  createdAt: Date;
  updatedAt: Date;
  files: ProjectFile[];
  status: 'draft' | 'generating' | 'ready' | 'error';
}

export interface ProjectFile {
  id: string;
  name: string;
  content: string;
  language: string;
  type: 'component' | 'page' | 'api' | 'config' | 'style';
  path: string;
}

export interface GenerationRequest {
  id: string;
  prompt: string;
  type: 'ui' | 'component' | 'fullstack' | 'backend';
  context?: string;
  requirements?: string[];
  style?: 'modern' | 'minimal' | 'corporate' | 'creative';
  framework?: 'react' | 'vue' | 'svelte' | 'vanilla';
  status: 'pending' | 'generating' | 'completed' | 'error';
  result?: GenerationResult;
  createdAt: Date;
}

export interface GenerationResult {
  id: string;
  files: ProjectFile[];
  preview?: string;
  description: string;
  instructions: string[];
  dependencies: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'code' | 'ui' | 'component';
  metadata?: {
    provider?: string;
    model?: string;
    files?: string[];
    projectId?: string;
  };
}

export interface AIConfig {
  provider: 'llm7' | 'gptoss' | 'openai';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature: number;
  maxTokens: number;
}

export interface UIComponent {
  id: string;
  name: string;
  description: string;
  code: string;
  preview: string;
  category: 'layout' | 'form' | 'navigation' | 'display' | 'feedback';
  tags: string[];
  framework: 'react' | 'vue' | 'svelte' | 'vanilla';
}

export interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  category: 'utility' | 'hook' | 'component' | 'api' | 'config';
  tags: string[];
  usage: string;
}
