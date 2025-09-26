import { NextResponse } from 'next/server';
import { LLM7Client } from '@/lib/llm7-client';

export async function GET() {
  try {
    const llm7Result = await new LLM7Client().getModels();

    const models = {
      llm7: llm7Result.success ? llm7Result.models : []
    };

    return NextResponse.json({
      success: true,
      models
    });
  } catch (error) {
    console.error('Models API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
