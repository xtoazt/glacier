import { NextRequest, NextResponse } from 'next/server';
import { GitHubClient } from '@/lib/github-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'GitHub token required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '';

    const githubClient = new GitHubClient(token);
    const contents = await githubClient.getRepositoryContents(params.owner, params.repo, path);

    return NextResponse.json({
      success: true,
      contents
    });
  } catch (error) {
    console.error('GitHub contents API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch repository contents' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'GitHub token required' },
        { status: 401 }
      );
    }

    const { path, content, message, sha } = await request.json();

    if (!path || !content || !message) {
      return NextResponse.json(
        { error: 'Path, content, and message are required' },
        { status: 400 }
      );
    }

    const githubClient = new GitHubClient(token);
    await githubClient.createOrUpdateFile(params.owner, params.repo, path, content, message, sha);

    return NextResponse.json({
      success: true,
      message: 'File created/updated successfully'
    });
  } catch (error) {
    console.error('GitHub create/update file API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create/update file' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'GitHub token required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const message = searchParams.get('message');

    if (!path || !message) {
      return NextResponse.json(
        { error: 'Path and message are required' },
        { status: 400 }
      );
    }

    const githubClient = new GitHubClient(token);
    await githubClient.deleteFile(params.owner, params.repo, path, message);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('GitHub delete file API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete file' },
      { status: 500 }
    );
  }
}
