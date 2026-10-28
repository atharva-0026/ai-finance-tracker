import { NextRequest, NextResponse } from 'next/server';
import { generateAIInsights } from '@/lib/ai/gemini';
import { Expense } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { expenses, monthlyBudget, apiKey } = body as {
      expenses: Expense[];
      monthlyBudget?: number;
      apiKey?: string;
    };

    if (!Array.isArray(expenses)) {
      return NextResponse.json(
        { error: 'Expenses must be an array' },
        { status: 400 }
      );
    }

    const insights = await generateAIInsights(
      expenses,
      monthlyBudget ? Number(monthlyBudget) : 2500,
      apiKey
    );

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI insights' },
      { status: 500 }
    );
  }
}
