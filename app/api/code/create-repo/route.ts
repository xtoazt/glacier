import { NextRequest, NextResponse } from 'next/server';
import { AICoder, CodeTask } from '@/lib/ai-coder';

export async function POST(request: NextRequest) {
  try {
    const { name, description, githubToken, template } = await request.json();

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Repository name and description are required' },
        { status: 400 }
      );
    }

    const task: CodeTask = {
      id: `create-repo-${Date.now()}`,
      type: 'create_repo',
      description: `${name}: ${description}`,
      context: template || 'Next.js application',
      requirements: [
        'Modern Next.js 14 with App Router',
        'TypeScript configuration',
        'Tailwind CSS styling',
        'Responsive design',
        'Production ready'
      ]
    };

    const aiCoder = new AICoder(githubToken);
    const result = await aiCoder.executeTask(task);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Repository creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create repository' },
      { status: 500 }
    );
  }
}
