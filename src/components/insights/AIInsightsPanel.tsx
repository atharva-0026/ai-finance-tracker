'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Expense, AIInsightsResponse } from '@/lib/types';
import { Sparkles, AlertTriangle, TrendingUp, Lightbulb, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AIInsightsPanelProps {
  expenses: Expense[];
  monthlyBudget: number;
  userApiKey?: string;
  onOpenSettings?: () => void;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  expenses,
  monthlyBudget,
  userApiKey,
  onOpenSettings,
}) => {
  const [insights, setInsights] = useState<AIInsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenses,
          monthlyBudget,
          apiKey: userApiKey,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to compute AI insights');
      }

      const data: AIInsightsResponse = await res.json();
      setInsights(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching insights');
    } finally {
      setIsLoading(false);
    }
  }, [expenses, monthlyBudget, userApiKey]);

  useEffect(() => {
    if (expenses.length > 0) {
      fetchInsights();
    }
  }, [expenses.length, monthlyBudget, userApiKey, fetchInsights]);

  if (!insights && isLoading) {
    return (
      <Card glow>
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Sparkles size={32} className="animate-spin text-primary" style={{ color: '#818cf8', margin: '0 auto 1rem auto' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Analyzing Financial Trajectory...</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Gemini AI is examining spending velocity, recurring patterns, and anomalies.
          </p>
        </div>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card glow>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AI Financial Intelligence</h3>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                Log transactions to unlock real-time spending insights and smart recommendations.
              </p>
            </div>
          </div>
          <Button variant="glow" onClick={fetchInsights} disabled={expenses.length === 0}>
            Analyze Now
          </Button>
        </div>
      </Card>
    );
  }

  const { monthlyVelocity, executiveSummary, anomalies, recommendations } = insights;

  return (
    <Card glow style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c084fc',
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>AI Financial Intelligence</h3>
              <span className="badge badge-ai">Gemini 2.5 Flash</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              Automated behavioral insights, spending velocity, and tailored savings strategies
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}
            >
              API Key Config
            </button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchInsights}
            isLoading={isLoading}
            leftIcon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', color: '#fda4af', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Executive Summary Card */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.9375rem',
          lineHeight: '1.5',
          color: '#e2e8f0',
        }}
      >
        <span style={{ color: '#818cf8', fontWeight: 600, marginRight: '6px' }}>✨ Executive Brief:</span>
        {executiveSummary}
      </div>

      {/* 2-Column: Velocity Pace & Anomalies */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {/* Spending Velocity */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '12px',
            background: 'rgba(16, 22, 34, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              Spending Velocity Pace
            </span>
            <span
              className={`badge ${
                monthlyVelocity.paceStatus === 'under'
                  ? 'badge-success'
                  : monthlyVelocity.paceStatus === 'over'
                  ? 'badge-danger'
                  : 'badge-warning'
              }`}
            >
              {monthlyVelocity.paceStatus === 'under'
                ? 'Under Budget'
                : monthlyVelocity.paceStatus === 'over'
                ? 'Pacing Over'
                : 'Balanced'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
            <div className="finance-amount" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
              {formatCurrency(monthlyVelocity.projectedSpend)}
            </div>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              projected month-end (budget: {formatCurrency(monthlyVelocity.budgetLimit)})
            </span>
          </div>

          <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.4' }}>
            {monthlyVelocity.velocityMessage}
          </p>
        </div>

        {/* Anomalies Detected */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '12px',
            background: 'rgba(16, 22, 34, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              Pattern & Anomaly Detection
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {anomalies.length} flag{anomalies.length === 1 ? '' : 's'}
            </span>
          </div>

          {anomalies.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.875rem' }}>
              <CheckCircle2 size={18} />
              <span>No abnormal spending spikes or unexpected charges detected!</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {anomalies.map((anom, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                  }}
                >
                  <AlertTriangle size={16} color="#fbbf24" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fef08a' }}>
                      {anom.title} ({formatCurrency(anom.amount)})
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{anom.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Lightbulb size={18} color="#eab308" />
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
            Actionable Financial Recommendations
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              style={{
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f1f5f9' }}>{rec.title}</span>
                  <span className="badge badge-success">
                    Save ~{formatCurrency(rec.potentialSavings)}/mo
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: '1.4' }}>
                  {rec.action}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#818cf8', marginTop: '0.25rem' }}>
                <ShieldCheck size={14} />
                <span>Impact: {rec.impact.toUpperCase()} priority</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
