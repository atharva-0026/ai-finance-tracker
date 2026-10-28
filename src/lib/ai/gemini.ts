import { GoogleGenAI } from '@google/genai';
import { Expense, AIInsightsResponse, AICategorizeResult } from '../types';
import { categorizeHeuristic, CATEGORY_METADATA } from './categorizer';

export async function categorizeWithAI(
  title: string,
  amount?: number,
  customApiKey?: string
): Promise<AICategorizeResult> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return categorizeHeuristic(title);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a financial categorization AI assistant. Classify the following expense into exactly ONE of these standard categories:
- Food & Dining
- Groceries
- Transportation
- Housing & Rent
- Utilities & Bills
- Entertainment
- Shopping
- Health & Fitness
- Travel
- Personal Care
- Education & Learning
- Other / Miscellaneous

Expense Description: "${title}"
${amount ? `Amount: $${amount}` : ''}

Respond ONLY in strictly valid JSON format with NO markdown wrapping:
{
  "category": "one of the exact categories above",
  "confidence": number between 0.1 and 1.0,
  "reasoning": "brief explanation"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text?.trim() || '';
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);

    const category = parsed.category || 'Other / Miscellaneous';
    const meta = CATEGORY_METADATA[category] || CATEGORY_METADATA['Other / Miscellaneous'];

    return {
      category,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
      reasoning: parsed.reasoning || 'Categorized by Gemini AI',
      suggestedIcon: meta.icon,
      suggestedColor: meta.color,
    };
  } catch (err) {
    console.warn('Gemini categorization fallback to heuristic:', err);
    return categorizeHeuristic(title);
  }
}

export function generateStatisticalInsights(
  expenses: Expense[],
  monthlyBudget: number = 2500
): AIInsightsResponse {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = Math.max(1, now.getDate());

  // Filter current month expenses
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
  const currentSpend = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Projected spend
  const dailyPace = currentSpend / currentDay;
  const projectedSpend = Math.round(dailyPace * daysInMonth);

  // Group by category
  const categoryMap: Record<string, number> = {};
  for (const exp of monthExpenses) {
    categoryMap[exp.category] = (categoryMap[exp.category] || 0) + Number(exp.amount);
  }

  const topDrivers = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => ({
      category: cat,
      amount: Math.round(amt * 100) / 100,
      percentage: currentSpend > 0 ? Math.round((amt / currentSpend) * 100) : 0,
      color: CATEGORY_METADATA[cat]?.color || '#6366f1',
    }));

  // Velocity status
  let paceStatus: 'under' | 'on_track' | 'over' = 'on_track';
  let velocityMessage = 'Your spending velocity is aligned with your targets.';

  if (projectedSpend > monthlyBudget * 1.1) {
    paceStatus = 'over';
    velocityMessage = `Warning: At this daily velocity ($${dailyPace.toFixed(1)}/day), you are projected to exceed your $${monthlyBudget} budget by $${Math.round(projectedSpend - monthlyBudget)}.`;
  } else if (projectedSpend < monthlyBudget * 0.85) {
    paceStatus = 'under';
    velocityMessage = `Great work: You are tracking $${Math.round(monthlyBudget - projectedSpend)} under your monthly limit!`;
  }

  // Detect Anomalies
  const anomalies: AIInsightsResponse['anomalies'] = [];
  if (categoryMap['Food & Dining'] && categoryMap['Food & Dining'] > currentSpend * 0.35 && currentSpend > 200) {
    anomalies.push({
      title: 'High Dining Out Ratio',
      amount: categoryMap['Food & Dining'],
      reason: 'Dining and takeout represents over 35% of total monthly spend.',
      severity: 'medium',
    });
  }

  // Check single large transactions
  const largeExpenses = monthExpenses.filter((e) => Number(e.amount) > 250);
  for (const exp of largeExpenses.slice(0, 2)) {
    anomalies.push({
      title: `Large Charge: ${exp.title}`,
      amount: Number(exp.amount),
      reason: `Significant single-item outlay on ${exp.date}`,
      severity: 'high',
    });
  }

  // Actionable recommendations
  const recommendations: AIInsightsResponse['recommendations'] = [];
  if (categoryMap['Food & Dining'] && categoryMap['Food & Dining'] > 150) {
    recommendations.push({
      id: 'rec-dining',
      title: 'Optimize Food & Dining',
      impact: 'high',
      action: 'Preparing meals at home 2 extra nights a week can save approximately 25% on your monthly food budget.',
      potentialSavings: Math.round(categoryMap['Food & Dining'] * 0.25),
    });
  }

  if (categoryMap['Entertainment'] && categoryMap['Entertainment'] > 80) {
    recommendations.push({
      id: 'rec-subs',
      title: 'Audit Digital Subscriptions',
      impact: 'medium',
      action: 'Review recurring entertainment services and pause any streaming plans you haven’t watched in 14 days.',
      potentialSavings: 35,
    });
  }

  if (categoryMap['Shopping'] && categoryMap['Shopping'] > 120) {
    recommendations.push({
      id: 'rec-shopping',
      title: 'Implement the 48-Hour Wishlist Rule',
      impact: 'medium',
      action: 'Wait 48 hours before discretionary non-essential purchases to curb impulsive buying.',
      potentialSavings: Math.round(categoryMap['Shopping'] * 0.2),
    });
  }

  // Default recommendation if fewer than 2
  if (recommendations.length < 2) {
    recommendations.push({
      id: 'rec-emergency',
      title: 'Automated 10% Savings Buffer',
      impact: 'high',
      action: 'Schedule an automatic deposit into high-yield savings immediately after payday.',
      potentialSavings: Math.round(monthlyBudget * 0.1),
    });
  }

  return {
    executiveSummary: `You have spent $${currentSpend.toFixed(2)} across ${monthExpenses.length} transactions this month. Your primary spend driver is ${topDrivers[0]?.category || 'General'} ($${topDrivers[0]?.amount || 0}).`,
    monthlyVelocity: {
      currentSpend: Math.round(currentSpend * 100) / 100,
      projectedSpend,
      budgetLimit: monthlyBudget,
      paceStatus,
      velocityMessage,
    },
    topDrivers,
    anomalies,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateAIInsights(
  expenses: Expense[],
  monthlyBudget: number = 2500,
  customApiKey?: string
): Promise<AIInsightsResponse> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || expenses.length === 0) {
    return generateStatisticalInsights(expenses, monthlyBudget);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const summaryData = expenses.slice(0, 40).map((e) => ({
      title: e.title,
      category: e.category,
      amount: e.amount,
      date: e.date,
    }));

    const prompt = `You are a certified financial planning AI. Analyze the user's spending data and monthly budget of $${monthlyBudget}.
User's Recent Transactions (JSON):
${JSON.stringify(summaryData, null, 2)}

Provide structured, actionable financial analysis strictly in JSON format (no markdown fences):
{
  "executiveSummary": "Concise 2-sentence executive summary of cash flow velocity and habits",
  "monthlyVelocity": {
    "currentSpend": number,
    "projectedSpend": number,
    "budgetLimit": ${monthlyBudget},
    "paceStatus": "under" | "on_track" | "over",
    "velocityMessage": "encouraging or cautionary note regarding budget pacing"
  },
  "topDrivers": [
    { "category": "Category Name", "amount": number, "percentage": number, "color": "#hex" }
  ],
  "anomalies": [
    { "title": "Anomaly Name", "amount": number, "reason": "why this is unusual or concerning", "severity": "low" | "medium" | "high" }
  ],
  "recommendations": [
    { "id": "rec-1", "title": "Specific Strategy", "impact": "low" | "medium" | "high", "action": "clear action step", "potentialSavings": number }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text?.trim() || '';
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      ...parsed,
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('Gemini insights generation fallback:', err);
    return generateStatisticalInsights(expenses, monthlyBudget);
  }
}
