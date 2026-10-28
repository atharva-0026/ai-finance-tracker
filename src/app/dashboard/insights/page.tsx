'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Expense } from '@/lib/types';
import { AIInsightsPanel } from '@/components/insights/AIInsightsPanel';
import { ExpenseBreakdownChart } from '@/components/dashboard/ExpenseBreakdownChart';
import { Card } from '@/components/ui/Card';
import { Sparkles, Brain, Cpu, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function InsightsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState(2500);
  const [userApiKey, setUserApiKey] = useState<string | undefined>(undefined);

  const loadExpenses = useCallback(async () => {
    try {
      const res = await fetch('/api/expenses');
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses || []);
      }
    } catch (err) {
      console.error('Failed to load expenses', err);
    }
  }, []);

  useEffect(() => {
    loadExpenses();

    const savedBudget = localStorage.getItem('aurafinance_budget');
    if (savedBudget) {
      setMonthlyBudget(Number(savedBudget));
    }

    const savedKey = localStorage.getItem('aurafinance_gemini_key');
    if (savedKey) {
      setUserApiKey(savedKey);
    }
  }, [loadExpenses]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            AI Financial Intelligence
            <span className="badge badge-ai" style={{ fontSize: '0.8rem' }}>
              <Sparkles size={13} />
              Neural Engine
            </span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Deep behavioral pattern analysis, spending velocity projections, and automated categorization
          </p>
        </div>

        <div>
          <Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="sm">
              Configure Gemini API Key
            </Button>
          </Link>
        </div>
      </div>

      {/* Deep AI Insights Panel */}
      <AIInsightsPanel
        expenses={expenses}
        monthlyBudget={monthlyBudget}
        userApiKey={userApiKey}
      />

      {/* Secondary Visual Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        <ExpenseBreakdownChart expenses={expenses} />

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
              <Brain size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>How Aura AI Analyzes Your Data</h3>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                Multi-model intelligence pipeline
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Zap size={18} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#f8fafc' }}>Real-time Sub-millisecond Categorization:</strong>{' '}
                Pre-trained NLP keyword classifiers instantly tag merchants, subscriptions, and transactions as you type.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Cpu size={18} color="#06b6d4" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#f8fafc' }}>Google Gemini 2.5 Flash:</strong>{' '}
                Performs multi-variable trajectory modeling to project month-end cash flow and isolate single-transaction anomalies.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Sparkles size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#f8fafc' }}>Actionable Savings Engine:</strong>{' '}
                Calculates real-dollar savings for discretionary habits (e.g., dining out ratio, paused digital streaming).
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
