'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Github, 
  Plus, 
  Folder, 
  File, 
  Download, 
  Upload, 
  GitBranch, 
  GitPullRequest,
  Settings,
  Key
} from 'lucide-react';
import TerminalWindow from '@/components/terminal/TerminalWindow';
import TerminalTabs from '@/components/terminal/TerminalTabs';
import TerminalPrompt from '@/components/terminal/TerminalPrompt';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { GitHubRepo, GitHubFile } from '@/lib/github-client';

interface Tab {
  id: string;
  name: string;
  type: 'file' | 'terminal' | 'github';
  content?: string;
  path?: string;
  repo?: string;
}

export default function GitHubMode() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'terminal-1', name: 'Terminal', type: 'terminal' }
  ]);
  const [activeTab, setActiveTab] = useState('terminal-1');
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [repoFiles, setRepoFiles] = useState<GitHubFile[]>([]);
  const [githubToken, setGithubToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDescription, setNewRepoDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
      setGithubToken(savedToken);
      setIsAuthenticated(true);
      loadRepositories(savedToken);
    }
  }, []);

  const loadRepositories = async (token: string) => {
    try {
      const response = await fetch('/api/github/repos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setRepos(data.repos);
      }
    } catch (error) {
      console.error('Failed to load repositories:', error);
    }
  };

  const handleAuth = () => {
    if (githubToken.trim()) {
      localStorage.setItem('github_token', githubToken);
      setIsAuthenticated(true);
      loadRepositories(githubToken);
      addTerminalOutput(`✅ Authenticated with GitHub`);
    }
  };

  const handleCreateRepo = async () => {
    if (!newRepoName.trim() || !isAuthenticated) return;

    try {
      const response = await fetch('/api/github/repos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${githubToken}`
        },
        body: JSON.stringify({
          name: newRepoName,
          description: newRepoDescription,
          private: isPrivate
        })
      });

      const data = await response.json();
      if (data.success) {
        setRepos(prev => [data.repo, ...prev]);
        setNewRepoName('');
        setNewRepoDescription('');
        addTerminalOutput(`✅ Created repository: ${data.repo.name}`);
      }
    } catch (error) {
      console.error('Failed to create repository:', error);
      addTerminalOutput(`❌ Failed to create repository`);
    }
  };

  const handleSelectRepo = async (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    try {
      const response = await fetch(`/api/github/repos/${repo.owner.login}/${repo.name}/contents`, {
        headers: {
          'Authorization': `Bearer ${githubToken}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setRepoFiles(data.contents);
        addTerminalOutput(`📁 Opened repository: ${repo.name}`);
      }
    } catch (error) {
      console.error('Failed to load repository contents:', error);
    }
  };

  const handleOpenFile = async (file: GitHubFile) => {
    if (file.type === 'file') {
      try {
        const response = await fetch(`/api/github/repos/${selectedRepo?.owner.login}/${selectedRepo?.name}/contents?path=${file.path}`, {
          headers: {
            'Authorization': `Bearer ${githubToken}`
          }
        });

        const data = await response.json();
        if (data.success && data.contents[0]) {
          const fileContent = Buffer.from(data.contents[0].content, 'base64').toString('utf-8');
          
          const newTab: Tab = {
            id: `file-${Date.now()}`,
            name: file.name,
            type: 'file',
            content: fileContent,
            path: file.path,
            repo: selectedRepo?.name
          };

          setTabs(prev => [...prev, newTab]);
          setActiveTab(newTab.id);
          addTerminalOutput(`📄 Opened file: ${file.name}`);
        }
      } catch (error) {
        console.error('Failed to open file:', error);
      }
    }
  };

  const handleCommand = (command: string) => {
    addTerminalOutput(`$ ${command}`);
    
    // Simulate command execution
    if (command.startsWith('git clone')) {
      addTerminalOutput('Cloning repository...');
    } else if (command.startsWith('npm install')) {
      addTerminalOutput('Installing dependencies...');
    } else if (command.startsWith('npm run dev')) {
      addTerminalOutput('Starting development server...');
    } else if (command === 'clear') {
      setTerminalOutput([]);
    } else {
      addTerminalOutput(`Command not found: ${command}`);
    }
  };

  const addTerminalOutput = (output: string) => {
    setTerminalOutput(prev => [...prev, output]);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleTabClose = (tabId: string) => {
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
    if (activeTab === tabId) {
      setActiveTab(tabs[0]?.id || '');
    }
  };

  const handleNewTab = () => {
    const newTab: Tab = {
      id: `terminal-${Date.now()}`,
      name: 'Terminal',
      type: 'terminal'
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
  };

  const renderActiveTabContent = () => {
    const activeTabData = tabs.find(tab => tab.id === activeTab);
    
    if (activeTabData?.type === 'terminal') {
      return (
        <div className="space-y-4">
          {terminalOutput.map((output, index) => (
            <div key={index} className="terminal-output">
              {output}
            </div>
          ))}
          <TerminalPrompt onCommand={handleCommand} />
        </div>
      );
    } else if (activeTabData?.type === 'file') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{activeTabData.name}</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="code-block">
            <pre className="text-sm overflow-x-auto">
              <code>{activeTabData.content}</code>
            </pre>
          </div>
        </div>
      );
    }

    return <div>Select a tab to view content</div>;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-100 mb-2">GitHub Integration</h2>
        <p className="text-gray-400">Manage repositories and code directly from Glacier</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GitHub Sidebar */}
        <div className="space-y-4">
          {/* Authentication */}
          {!isAuthenticated ? (
            <TerminalWindow title="GitHub Auth">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Key className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm">GitHub Personal Access Token</span>
                </div>
                <Input
                  value={githubToken}
                  onChange={setGithubToken}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  type="password"
                />
                <Button onClick={handleAuth} className="w-full">
                  Authenticate
                </Button>
                <div className="text-xs text-gray-500">
                  <p>Create a token at: github.com/settings/tokens</p>
                  <p>Required scopes: repo, user</p>
                </div>
              </div>
            </TerminalWindow>
          ) : (
            <TerminalWindow title="GitHub Actions">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Github className="w-5 h-5 text-green-400" />
                  <span className="text-sm">✅ Authenticated</span>
                </div>
                
                {/* Create New Repo */}
                <div className="space-y-2">
                  <Input
                    value={newRepoName}
                    onChange={setNewRepoName}
                    placeholder="Repository name"
                  />
                  <Input
                    value={newRepoDescription}
                    onChange={setNewRepoDescription}
                    placeholder="Description (optional)"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Private repository</span>
                  </div>
                  <Button onClick={handleCreateRepo} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Repository
                  </Button>
                </div>
              </div>
            </TerminalWindow>
          )}

          {/* Repositories List */}
          {isAuthenticated && (
            <TerminalWindow title="Repositories">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {repos.map((repo) => (
                  <div
                    key={repo.id}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedRepo?.id === repo.id ? 'bg-blue-900' : 'hover:bg-gray-800'
                    }`}
                    onClick={() => handleSelectRepo(repo)}
                  >
                    <div className="flex items-center space-x-2">
                      <Folder className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium">{repo.name}</span>
                      {repo.private && <span className="text-xs text-gray-500">🔒</span>}
                    </div>
                    {repo.description && (
                      <p className="text-xs text-gray-500 mt-1">{repo.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </TerminalWindow>
          )}

          {/* Repository Files */}
          {selectedRepo && (
            <TerminalWindow title={`${selectedRepo.name} Files`}>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {repoFiles.map((file) => (
                  <div
                    key={file.sha}
                    className="flex items-center space-x-2 p-1 rounded cursor-pointer hover:bg-gray-800"
                    onClick={() => handleOpenFile(file)}
                  >
                    {file.type === 'file' ? (
                      <File className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Folder className="w-4 h-4 text-blue-400" />
                    )}
                    <span className="text-sm">{file.name}</span>
                  </div>
                ))}
              </div>
            </TerminalWindow>
          )}
        </div>

        {/* Main Terminal Area */}
        <div className="lg:col-span-2">
          <TerminalWindow title="Glacier Terminal">
            <TerminalTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onTabClose={handleTabClose}
              onNewTab={handleNewTab}
            />
            <div className="p-4">
              {renderActiveTabContent()}
            </div>
          </TerminalWindow>
        </div>
      </div>
    </div>
  );
}
