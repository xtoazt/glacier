import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  default_branch: string;
  created_at: string;
  updated_at: string;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  };
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

export class GitHubClient {
  private octokit: Octokit;
  private isAppAuth: boolean = false;

  constructor(accessToken?: string) {
    // Check if we have GitHub App credentials
    if (process.env.GITHUB_APP_ID && process.env.GITHUB_PRIVATE_KEY && !accessToken) {
      this.isAppAuth = true;
      this.octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId: process.env.GITHUB_APP_ID,
          privateKey: process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
      });
    } else {
      this.octokit = new Octokit({
        auth: accessToken || process.env.GITHUB_TOKEN,
      });
    }
  }

  async createRepository(name: string, description?: string, isPrivate: boolean = false): Promise<GitHubRepo> {
    try {
      const response = await this.octokit.rest.repos.createForAuthenticatedUser({
        name,
        description,
        private: isPrivate,
        auto_init: true,
      });

      return response.data as GitHubRepo;
    } catch (error) {
      console.error('GitHub API Error:', error);
      throw new Error('Failed to create repository');
    }
  }

  async getRepositories(): Promise<GitHubRepo[]> {
    try {
      const response = await this.octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
      });

      return response.data as GitHubRepo[];
    } catch (error) {
      console.error('GitHub API Error:', error);
      throw new Error('Failed to fetch repositories');
    }
  }

  async getRepositoryContents(owner: string, repo: string, path: string = ''): Promise<GitHubFile[]> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      if (Array.isArray(response.data)) {
        return response.data as GitHubFile[];
      } else {
        return [response.data as GitHubFile];
      }
    } catch (error) {
      console.error('GitHub API Error:', error);
      throw new Error('Failed to fetch repository contents');
    }
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<string> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      if ('content' in response.data && response.data.encoding === 'base64') {
        return Buffer.from(response.data.content, 'base64').toString('utf-8');
      }

      throw new Error('Invalid file content');
    } catch (error) {
      console.error('GitHub API Error:', error);
      throw new Error('Failed to fetch file content');
    }
  }


  async deleteFile(owner: string, repo: string, path: string, message: string): Promise<void> {
    try {
      // First get the file to get its SHA
      const file = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      if ('sha' in file.data) {
        await this.octokit.rest.repos.deleteFile({
          owner,
          repo,
          path,
          message,
          sha: file.data.sha,
        });
      }
    } catch (error) {
      console.error('GitHub API Error:', error);
      throw new Error('Failed to delete file');
    }
  }

  async createBranch(owner: string, repo: string, branch: string, fromBranch: string = 'main'): Promise<void> {
    try {
      // Get the SHA of the base branch
      const baseRef = await this.octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${fromBranch}`,
      });

      // Create the new branch
      await this.octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branch}`,
        sha: baseRef.data.object.sha,
      });
    } catch (error) {
      console.error('GitHub API Error:', error);
      throw new Error('Failed to create branch');
    }
  }

  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    head: string,
    base: string,
    body?: string
  ): Promise<any> {
    try {
      const response = await this.octokit.rest.pulls.create({
        owner,
        repo,
        title,
        head,
        base,
        body,
      });

      return response.data;
    } catch (error) {
      console.error('GitHub API Error:', error);
      throw new Error('Failed to create pull request');
    }
  }

  // Enhanced file operations for real coding
  async createMultipleFiles(
    owner: string,
    repo: string,
    files: Array<{ path: string; content: string; message?: string }>,
    branch: string = 'main'
  ): Promise<void> {
    try {
      // Create a new branch for the changes
      const branchName = `glacier-${Date.now()}`;
      await this.createBranch(owner, repo, branchName, branch);

      // Create/update each file
      for (const file of files) {
        await this.createOrUpdateFile(
          owner,
          repo,
          file.path,
          file.content,
          file.message || `Add ${file.path}`,
          undefined,
          branchName
        );
      }

      // Create a pull request
      await this.createPullRequest(
        owner,
        repo,
        `AI Generated: ${files.length} files`,
        branchName,
        branch,
        `This PR was generated by Glacier AI and includes ${files.length} files:\n\n${files.map(f => `- ${f.path}`).join('\n')}`
      );
    } catch (error) {
      console.error('GitHub API Error:', error);
      throw new Error('Failed to create multiple files');
    }
  }

  async createOrUpdateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string,
    branch?: string
  ): Promise<void> {
    try {
      const fileContent = Buffer.from(content, 'utf-8').toString('base64');

      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: fileContent,
        sha,
        branch,
      });
    } catch (error) {
      console.error('GitHub API Error:', error);
      throw new Error('Failed to create or update file');
    }
  }

  async getRepositoryStructure(owner: string, repo: string, path: string = ''): Promise<any> {
    try {
      const contents = await this.getRepositoryContents(owner, repo, path);
      const structure: any = {};

      for (const item of contents) {
        if (item.type === 'dir') {
          structure[item.name] = await this.getRepositoryStructure(owner, repo, item.path);
        } else {
          structure[item.name] = {
            type: 'file',
            size: item.size,
            url: item.html_url
          };
        }
      }

      return structure;
    } catch (error) {
      console.error('GitHub API Error:', error);
      throw new Error('Failed to get repository structure');
    }
  }

  async searchRepositories(query: string, user?: string): Promise<GitHubRepo[]> {
    try {
      const searchQuery = user ? `${query} user:${user}` : query;
      const response = await this.octokit.rest.search.repos({
        q: searchQuery,
        sort: 'updated',
        per_page: 10,
      });

      return response.data.items as GitHubRepo[];
    } catch (error) {
      console.error('GitHub API Error:', error);
      throw new Error('Failed to search repositories');
    }
  }
}
