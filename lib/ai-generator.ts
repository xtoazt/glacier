import { GenerationRequest, GenerationResult, ProjectFile, UIComponent } from './types';
import { LLM7Client } from './llm7-client';

export class AIGenerator {
  private llm7Client: LLM7Client;

  constructor() {
    this.llm7Client = new LLM7Client();
  }

  async generateUI(request: GenerationRequest): Promise<GenerationResult> {
    const prompt = this.buildUIPrompt(request);
    
    try {
      const response = await this.llm7Client.chat([
        { role: 'system', content: 'You are an expert UI/UX designer and React developer. Generate modern, accessible, and beautiful UI components.' },
        { role: 'user', content: prompt }
      ]);

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate UI');
      }

      return this.parseUIResponse(response.content || '', request);
    } catch (error) {
      console.error('UI Generation Error:', error);
      throw error;
    }
  }

  async generateComponent(request: GenerationRequest): Promise<GenerationResult> {
    const prompt = this.buildComponentPrompt(request);
    
    try {
      const response = await this.llm7Client.chat([
        { role: 'system', content: 'You are an expert React developer. Generate clean, reusable, and well-documented components.' },
        { role: 'user', content: prompt }
      ]);

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate component');
      }

      return this.parseComponentResponse(response.content || '', request);
    } catch (error) {
      console.error('Component Generation Error:', error);
      throw error;
    }
  }

  async generateFullStack(request: GenerationRequest): Promise<GenerationResult> {
    const prompt = this.buildFullStackPrompt(request);
    
    try {
      const response = await this.llm7Client.chat([
        { role: 'system', content: 'You are a full-stack developer expert. Generate complete applications with frontend, backend, and database integration.' },
        { role: 'user', content: prompt }
      ]);

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate full-stack app');
      }

      return this.parseFullStackResponse(response.content || '', request);
    } catch (error) {
      console.error('Full-Stack Generation Error:', error);
      throw error;
    }
  }

  private buildUIPrompt(request: GenerationRequest): string {
    return `
Generate a modern ${request.framework || 'React'} UI component based on this prompt:

"${request.prompt}"

Requirements:
${request.requirements?.map(req => `- ${req}`).join('\n') || '- Modern design\n- Responsive layout\n- Accessible components'}

Style: ${request.style || 'modern'}
Framework: ${request.framework || 'React'}

Please provide:
1. Complete component code with TypeScript
2. Tailwind CSS styling
3. Props interface
4. Usage example
5. Brief description

Format the response as JSON with this structure:
{
  "description": "Brief description of the component",
  "files": [
    {
      "name": "ComponentName.tsx",
      "content": "// Complete component code here",
      "language": "tsx",
      "type": "component",
      "path": "components/ComponentName.tsx"
    }
  ],
  "instructions": ["Step 1", "Step 2"],
  "dependencies": ["react", "tailwindcss"]
}
    `.trim();
  }

  private buildComponentPrompt(request: GenerationRequest): string {
    return `
Generate a reusable ${request.framework || 'React'} component based on this prompt:

"${request.prompt}"

Context: ${request.context || 'General purpose component'}

Please provide:
1. Complete component with TypeScript
2. Props interface with JSDoc comments
3. Example usage
4. Styling (Tailwind CSS)

Format as JSON with the same structure as UI generation.
    `.trim();
  }

  private buildFullStackPrompt(request: GenerationRequest): string {
    return `
Generate a complete full-stack application based on this prompt:

"${request.prompt}"

Requirements:
${request.requirements?.map(req => `- ${req}`).join('\n') || '- Modern UI\n- REST API\n- Database integration'}

Please provide:
1. Frontend components (React/Next.js)
2. Backend API routes
3. Database schema
4. Configuration files
5. README with setup instructions

Format as JSON with multiple files in the files array.
    `.trim();
  }

  private parseUIResponse(content: string, request: GenerationRequest): GenerationResult {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(content);
      return {
        id: `ui_${Date.now()}`,
        files: parsed.files || [],
        description: parsed.description || 'Generated UI component',
        instructions: parsed.instructions || ['Review the generated code', 'Customize as needed'],
        dependencies: parsed.dependencies || ['react', 'tailwindcss']
      };
    } catch (error) {
      // Fallback: create a basic component from text response
      return this.createFallbackComponent(content, request);
    }
  }

  private parseComponentResponse(content: string, request: GenerationRequest): GenerationResult {
    return this.parseUIResponse(content, request); // Same parsing logic
  }

  private parseFullStackResponse(content: string, request: GenerationRequest): GenerationResult {
    try {
      const parsed = JSON.parse(content);
      return {
        id: `fullstack_${Date.now()}`,
        files: parsed.files || [],
        description: parsed.description || 'Generated full-stack application',
        instructions: parsed.instructions || ['Install dependencies', 'Run the application'],
        dependencies: parsed.dependencies || ['react', 'next', 'typescript']
      };
    } catch (error) {
      return this.createFallbackComponent(content, request);
    }
  }

  private createFallbackComponent(content: string, request: GenerationRequest): GenerationResult {
    const componentName = this.extractComponentName(request.prompt);
    
    return {
      id: `fallback_${Date.now()}`,
      files: [{
        id: `file_${Date.now()}`,
        name: `${componentName}.tsx`,
        content: this.wrapInComponent(content, componentName),
        language: 'tsx',
        type: 'component',
        path: `components/${componentName}.tsx`
      }],
      description: `Generated ${request.type} component`,
      instructions: ['Review the generated code', 'Customize styling and functionality'],
      dependencies: ['react', 'tailwindcss']
    };
  }

  private extractComponentName(prompt: string): string {
    // Simple extraction logic - can be improved
    const words = prompt.split(' ').filter(word => word.length > 3);
    return words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : 'GeneratedComponent';
  }

  private wrapInComponent(content: string, componentName: string): string {
    return `
import React from 'react';

interface ${componentName}Props {
  // Add your props here
}

const ${componentName}: React.FC<${componentName}Props> = () => {
  return (
    <div className="p-4">
      {/* Generated content */}
      <div className="text-gray-800">
        ${content.replace(/\n/g, '\n        ')}
      </div>
    </div>
  );
};

export default ${componentName};
    `.trim();
  }
}
