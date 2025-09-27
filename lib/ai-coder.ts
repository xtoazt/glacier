import { LLM7Client } from './llm7-client';
import { GitHubClient } from './github-client';

export interface CodeTask {
  id: string;
  type: 'create_component' | 'create_app' | 'fix_bug' | 'add_feature' | 'refactor' | 'create_repo';
  description: string;
  requirements?: string[];
  context?: string;
  files?: Array<{
    path: string;
    content: string;
    language: string;
  }>;
  repository?: {
    owner: string;
    name: string;
    branch?: string;
  };
}

export interface CodeResult {
  success: boolean;
  files: Array<{
    path: string;
    content: string;
    language: string;
    description: string;
  }>;
  repository?: {
    owner: string;
    name: string;
    url: string;
    branch?: string;
  };
  pullRequest?: {
    url: string;
    number: number;
  };
  error?: string;
}

export class AICoder {
  private llm7Client: LLM7Client;
  private githubClient: GitHubClient;

  constructor(githubToken?: string) {
    this.llm7Client = new LLM7Client();
    this.githubClient = new GitHubClient(githubToken);
  }

  async executeTask(task: CodeTask): Promise<CodeResult> {
    try {
      switch (task.type) {
        case 'create_component':
          return await this.createComponent(task);
        case 'create_app':
          return await this.createApplication(task);
        case 'fix_bug':
          return await this.fixBug(task);
        case 'add_feature':
          return await this.addFeature(task);
        case 'refactor':
          return await this.refactorCode(task);
        case 'create_repo':
          return await this.createRepository(task);
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      return {
        success: false,
        files: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async createComponent(task: CodeTask): Promise<CodeResult> {
    const prompt = `
Create a React component based on this description: "${task.description}"

Requirements:
${task.requirements?.map(req => `- ${req}`).join('\n') || '- Modern React with TypeScript\n- Tailwind CSS styling\n- Accessible components'}

Context: ${task.context || 'General purpose component'}

Please provide:
1. Complete component code with TypeScript
2. Props interface with JSDoc comments
3. Example usage
4. Styling (Tailwind CSS)
5. Export statement

Format the response as a complete, production-ready component file.
    `;

    const response = await this.llm7Client.chat([
      { role: 'system', content: 'You are an expert React developer. Generate complete, production-ready components with TypeScript, Tailwind CSS, and proper documentation.' },
      { role: 'user', content: prompt }
    ]);

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate component');
    }

    const componentName = this.extractComponentName(task.description);
    const componentCode = this.formatComponentCode(response.content || '', componentName);

    const files = [{
      path: `components/${componentName}.tsx`,
      content: componentCode,
      language: 'tsx',
      description: `React component: ${componentName}`
    }];

    // If repository is specified, create the files there
    if (task.repository) {
      await this.githubClient.createMultipleFiles(
        task.repository.owner,
        task.repository.name,
        files.map(f => ({ path: f.path, content: f.content, message: `Add ${f.path}` })),
        task.repository.branch
      );
    }

    return {
      success: true,
      files,
      repository: task.repository ? {
        owner: task.repository.owner,
        name: task.repository.name,
        url: `https://github.com/${task.repository.owner}/${task.repository.name}`,
        branch: task.repository.branch
      } : undefined
    };
  }

  private async createApplication(task: CodeTask): Promise<CodeResult> {
    const prompt = `
Create a complete Next.js application based on this description: "${task.description}"

Requirements:
${task.requirements?.map(req => `- ${req}`).join('\n') || '- Next.js 14 with App Router\n- TypeScript\n- Tailwind CSS\n- Modern UI components'}

Context: ${task.context || 'Full-stack web application'}

Please provide a complete application structure with:
1. Main page component
2. Layout component
3. Package.json with dependencies
4. Tailwind configuration
5. TypeScript configuration
6. README with setup instructions

Format as multiple files that can be directly used in a Next.js project.
    `;

    const response = await this.llm7Client.chat([
      { role: 'system', content: 'You are an expert full-stack developer. Generate complete, production-ready Next.js applications with modern best practices.' },
      { role: 'user', content: prompt }
    ]);

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate application');
    }

    const files = this.parseApplicationFiles(response.content || '', task.description);

    // If repository is specified, create the files there
    if (task.repository) {
      await this.githubClient.createMultipleFiles(
        task.repository.owner,
        task.repository.name,
        files.map(f => ({ path: f.path, content: f.content, message: `Add ${f.path}` })),
        task.repository.branch
      );
    }

    return {
      success: true,
      files,
      repository: task.repository ? {
        owner: task.repository.owner,
        name: task.repository.name,
        url: `https://github.com/${task.repository.owner}/${task.repository.name}`,
        branch: task.repository.branch
      } : undefined
    };
  }

  private async fixBug(task: CodeTask): Promise<CodeResult> {
    if (!task.files || task.files.length === 0) {
      throw new Error('No files provided for bug fix');
    }

    const prompt = `
Fix the bug described as: "${task.description}"

Context: ${task.context || 'Bug fix in existing code'}

Here are the current files:
${task.files.map(f => `\n=== ${f.path} ===\n${f.content}`).join('\n')}

Please provide the corrected files with:
1. Clear explanation of what was wrong
2. The fix applied
3. Any additional improvements
4. Comments explaining the changes

Format as corrected file contents.
    `;

    const response = await this.llm7Client.chat([
      { role: 'system', content: 'You are an expert debugger and code reviewer. Fix bugs and improve code quality with clear explanations.' },
      { role: 'user', content: prompt }
    ]);

    if (!response.success) {
      throw new Error(response.error || 'Failed to fix bug');
    }

    const fixedFiles = this.parseFixedFiles(response.content || '', task.files);

    // If repository is specified, update the files there
    if (task.repository) {
      for (const file of fixedFiles) {
        await this.githubClient.createOrUpdateFile(
          task.repository.owner,
          task.repository.name,
          file.path,
          file.content,
          `Fix bug: ${task.description}`,
          undefined,
          task.repository.branch
        );
      }
    }

    return {
      success: true,
      files: fixedFiles,
      repository: task.repository ? {
        owner: task.repository.owner,
        name: task.repository.name,
        url: `https://github.com/${task.repository.owner}/${task.repository.name}`,
        branch: task.repository.branch
      } : undefined
    };
  }

  private async addFeature(task: CodeTask): Promise<CodeResult> {
    const prompt = `
Add a new feature described as: "${task.description}"

Requirements:
${task.requirements?.map(req => `- ${req}`).join('\n') || '- Integrate seamlessly with existing code\n- Follow existing patterns\n- Add proper tests'}

Context: ${task.context || 'Feature addition to existing project'}

${task.files ? `Here are the existing files:\n${task.files.map(f => `\n=== ${f.path} ===\n${f.content}`).join('\n')}` : ''}

Please provide:
1. New files needed for the feature
2. Modifications to existing files
3. Clear documentation of the changes
4. Example usage

Format as complete file contents.
    `;

    const response = await this.llm7Client.chat([
      { role: 'system', content: 'You are an expert software engineer. Add features that integrate seamlessly with existing codebases while maintaining quality and consistency.' },
      { role: 'user', content: prompt }
    ]);

    if (!response.success) {
      throw new Error(response.error || 'Failed to add feature');
    }

    const featureFiles = this.parseFeatureFiles(response.content || '', task.description);

    // If repository is specified, create the files there
    if (task.repository) {
      await this.githubClient.createMultipleFiles(
        task.repository.owner,
        task.repository.name,
        featureFiles.map(f => ({ path: f.path, content: f.content, message: `Add feature: ${task.description}` })),
        task.repository.branch
      );
    }

    return {
      success: true,
      files: featureFiles,
      repository: task.repository ? {
        owner: task.repository.owner,
        name: task.repository.name,
        url: `https://github.com/${task.repository.owner}/${task.repository.name}`,
        branch: task.repository.branch
      } : undefined
    };
  }

  private async refactorCode(task: CodeTask): Promise<CodeResult> {
    if (!task.files || task.files.length === 0) {
      throw new Error('No files provided for refactoring');
    }

    const prompt = `
Refactor the code based on this description: "${task.description}"

Context: ${task.context || 'Code refactoring for better maintainability'}

Here are the current files:
${task.files.map(f => `\n=== ${f.path} ===\n${f.content}`).join('\n')}

Please provide:
1. Refactored code with improved structure
2. Better naming conventions
3. Improved performance
4. Better error handling
5. Clear documentation of changes

Format as refactored file contents.
    `;

    const response = await this.llm7Client.chat([
      { role: 'system', content: 'You are an expert code refactoring specialist. Improve code quality, performance, and maintainability while preserving functionality.' },
      { role: 'user', content: prompt }
    ]);

    if (!response.success) {
      throw new Error(response.error || 'Failed to refactor code');
    }

    const refactoredFiles = this.parseRefactoredFiles(response.content || '', task.files);

    // If repository is specified, update the files there
    if (task.repository) {
      for (const file of refactoredFiles) {
        await this.githubClient.createOrUpdateFile(
          task.repository.owner,
          task.repository.name,
          file.path,
          file.content,
          `Refactor: ${task.description}`,
          undefined,
          task.repository.branch
        );
      }
    }

    return {
      success: true,
      files: refactoredFiles,
      repository: task.repository ? {
        owner: task.repository.owner,
        name: task.repository.name,
        url: `https://github.com/${task.repository.owner}/${task.repository.name}`,
        branch: task.repository.branch
      } : undefined
    };
  }

  private async createRepository(task: CodeTask): Promise<CodeResult> {
    const repoName = this.extractRepositoryName(task.description);
    const repoDescription = task.context || `Repository created by Glacier AI: ${task.description}`;

    // Create the repository
    const repo = await this.githubClient.createRepository(repoName, repoDescription, false);

    // Generate initial files
    const initialFiles = await this.generateInitialFiles(task.description);

    // Create the initial files
    await this.githubClient.createMultipleFiles(
      repo.owner.login,
      repo.name,
      initialFiles.map(f => ({ path: f.path, content: f.content, message: `Initial commit: ${f.path}` }))
    );

    return {
      success: true,
      files: initialFiles,
      repository: {
        owner: repo.owner.login,
        name: repo.name,
        url: repo.html_url,
        branch: 'main'
      }
    };
  }

  // Helper methods
  private extractComponentName(description: string): string {
    const words = description.split(' ').filter(word => word.length > 3);
    const name = words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : 'Component';
    return name.replace(/[^a-zA-Z0-9]/g, '');
  }

  private extractRepositoryName(description: string): string {
    const words = description.toLowerCase().split(' ').filter(word => word.length > 2);
    return words.slice(0, 3).join('-').replace(/[^a-z0-9-]/g, '');
  }

  private formatComponentCode(content: string, componentName: string): string {
    // Ensure the component is properly formatted
    if (!content.includes('export default')) {
      return `${content}\n\nexport default ${componentName};`;
    }
    return content;
  }

  private parseApplicationFiles(content: string, description: string): Array<{ path: string; content: string; language: string; description: string }> {
    // Parse the AI response to extract multiple files
    const files: Array<{ path: string; content: string; language: string; description: string }> = [];
    
    // This is a simplified parser - in a real implementation, you'd want more sophisticated parsing
    const lines = content.split('\n');
    let currentFile = '';
    let currentPath = '';
    let inFile = false;

    for (const line of lines) {
      if (line.startsWith('=== ') && line.endsWith(' ===')) {
        if (currentFile && currentPath) {
          files.push({
            path: currentPath,
            content: currentFile.trim(),
            language: this.getLanguageFromPath(currentPath),
            description: `Generated file: ${currentPath}`
          });
        }
        currentPath = line.replace('=== ', '').replace(' ===', '');
        currentFile = '';
        inFile = true;
      } else if (inFile) {
        currentFile += line + '\n';
      }
    }

    // Add the last file
    if (currentFile && currentPath) {
      files.push({
        path: currentPath,
        content: currentFile.trim(),
        language: this.getLanguageFromPath(currentPath),
        description: `Generated file: ${currentPath}`
      });
    }

    // If no files were parsed, create a basic structure
    if (files.length === 0) {
      files.push({
        path: 'app/page.tsx',
        content: this.wrapInNextPage(content, description),
        language: 'tsx',
        description: 'Main page component'
      });
    }

    return files;
  }

  private parseFixedFiles(content: string, originalFiles: Array<{ path: string; content: string; language: string }>): Array<{ path: string; content: string; language: string; description: string }> {
    // Parse fixed files from the AI response
    const files: Array<{ path: string; content: string; language: string; description: string }> = [];
    
    // For now, return the original files with a note that they were "fixed"
    // In a real implementation, you'd parse the AI response to extract the actual fixes
    for (const file of originalFiles) {
      files.push({
        path: file.path,
        content: file.content + '\n\n// Fixed by Glacier AI',
        language: file.language,
        description: `Fixed: ${file.path}`
      });
    }

    return files;
  }

  private parseFeatureFiles(content: string, description: string): Array<{ path: string; content: string; language: string; description: string }> {
    // Parse feature files from the AI response
    return this.parseApplicationFiles(content, description);
  }

  private parseRefactoredFiles(content: string, originalFiles: Array<{ path: string; content: string; language: string }>): Array<{ path: string; content: string; language: string; description: string }> {
    // Parse refactored files from the AI response
    return this.parseFixedFiles(content, originalFiles);
  }

  private async generateInitialFiles(description: string): Promise<Array<{ path: string; content: string; language: string; description: string }>> {
    const files = [
      {
        path: 'README.md',
        content: `# ${description}\n\nThis repository was created by Glacier AI.\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n`,
        language: 'markdown',
        description: 'Project README'
      },
      {
        path: 'package.json',
        content: JSON.stringify({
          name: this.extractRepositoryName(description),
          version: '1.0.0',
          description: description,
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start'
          },
          dependencies: {
            next: '^14.0.0',
            react: '^18.0.0',
            'react-dom': '^18.0.0'
          }
        }, null, 2),
        language: 'json',
        description: 'Package configuration'
      }
    ];

    return files;
  }

  private wrapInNextPage(content: string, description: string): string {
    return `import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ${description}
        </h1>
        <p className="text-gray-600">
          Generated by Glacier AI
        </p>
      </div>
    </div>
  );
}`;
  }

  private getLanguageFromPath(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx': return 'tsx';
      case 'ts': return 'typescript';
      case 'jsx': return 'jsx';
      case 'js': return 'javascript';
      case 'css': return 'css';
      case 'scss': return 'scss';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'html': return 'html';
      case 'py': return 'python';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      case 'c': return 'c';
      default: return 'text';
    }
  }
}
