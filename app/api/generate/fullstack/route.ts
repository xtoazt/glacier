import { NextRequest, NextResponse } from 'next/server';
import { AIGenerator } from '@/lib/ai-generator';
import { GenerationRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, context, requirements, style, framework } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const generationRequest: GenerationRequest = {
      id: `fullstack_${Date.now()}`,
      prompt,
      type: 'fullstack',
      context,
      requirements,
      style,
      framework,
      status: 'generating',
      createdAt: new Date()
    };

    const generator = new AIGenerator();
    const result = await generator.generateFullStack(generationRequest);

    return NextResponse.json({
      success: true,
      result,
      request: {
        ...generationRequest,
        status: 'completed'
      }
    });
  } catch (error) {
    console.error('Full-Stack Generation API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate full-stack app' },
      { status: 500 }
    );
  }
}
