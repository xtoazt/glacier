import { NextRequest, NextResponse } from 'next/server';
import { GitHubClient } from '@/lib/github-client';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'GitHub token required' },
        { status: 401 }
      );
    }

    const githubClient = new GitHubClient(token);
    const repos = await githubClient.getRepositories();

    return NextResponse.json({
      success: true,
      repos
    });
  } catch (error) {
    console.error('GitHub repos API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'GitHub token required' },
        { status: 401 }
      );
    }

    const { name, description, private: isPrivate } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Repository name is required' },
        { status: 400 }
      );
    }

    const githubClient = new GitHubClient(token);
    const repo = await githubClient.createRepository(name, description, isPrivate);

    return NextResponse.json({
      success: true,
      repo
    });
  } catch (error) {
    console.error('GitHub create repo API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create repository' },
      { status: 500 }
    );
  }
}
