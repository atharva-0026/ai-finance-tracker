export interface Category {
  id: string;
  user_id?: string | null;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  created_at?: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  title: string;
  category: string;
  category_id?: string | null;
  date: string; // YYYY-MM-DD
  payment_method: 'card' | 'cash' | 'transfer' | 'other';
  notes?: string | null;
  ai_suggested: boolean;
  ai_confidence: number;
  created_at?: string;
  updated_at?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  month: string; // YYYY-MM
  monthly_limit: number;
  category?: string | null;
  created_at?: string;
}

export interface AICategorizeResult {
  category: string;
  confidence: number;
  reasoning: string;
  suggestedIcon: string;
  suggestedColor: string;
}

export interface AIInsightRecommendation {
  id: string;
  title: string;
  impact: 'low' | 'medium' | 'high';
  action: string;
  potentialSavings: number;
}

export interface AIAnomaly {
  title: string;
  amount: number;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AIInsightsResponse {
  executiveSummary: string;
  monthlyVelocity: {
    currentSpend: number;
    projectedSpend: number;
    budgetLimit: number;
    paceStatus: 'under' | 'on_track' | 'over';
    velocityMessage: string;
  };
  topDrivers: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  anomalies: AIAnomaly[];
  recommendations: AIInsightRecommendation[];
  generatedAt: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  isDemo?: boolean;
}
