import { NextRequest, NextResponse } from 'next/server';
import { GPTOSSClient } from '@/lib/gptoss-client';

export async function POST(request: NextRequest) {
  try {
    const { messages, model, reasoningEffort } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const client = new GPTOSSClient();
    const result = await client.chat(messages, model, reasoningEffort);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('GPT-OSS API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
