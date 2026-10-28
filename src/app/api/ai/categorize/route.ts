import { NextRequest, NextResponse } from 'next/server';
import { categorizeWithAI } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, amount, apiKey } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const result = await categorizeWithAI(title, amount ? Number(amount) : undefined, apiKey);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error categorizing expense:', error);
    return NextResponse.json(
      { error: 'Failed to categorize expense' },
      { status: 500 }
    );
  }
}
