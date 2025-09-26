import { NextResponse } from 'next/server';
import { LLM7Client } from '@/lib/llm7-client';
import { GPTOSSClient } from '@/lib/gptoss-client';

export async function GET() {
  try {
    const [llm7Result, gptossResult] = await Promise.all([
      new LLM7Client().getModels(),
      new GPTOSSClient().getModels()
    ]);

    const models = {
      llm7: llm7Result.success ? llm7Result.models : [],
      gptoss: gptossResult.success ? gptossResult.models : []
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
