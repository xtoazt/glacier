import { NextRequest, NextResponse } from 'next/server';
import { AICoder, CodeTask } from '@/lib/ai-coder';

export async function POST(request: NextRequest) {
  try {
    const { task, githubToken } = await request.json();

    if (!task || !task.type || !task.description) {
      return NextResponse.json(
        { error: 'Invalid task: type and description are required' },
        { status: 400 }
      );
    }

    const aiCoder = new AICoder(githubToken);
    const result = await aiCoder.executeTask(task as CodeTask);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Code execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute code task' },
      { status: 500 }
    );
  }
}
