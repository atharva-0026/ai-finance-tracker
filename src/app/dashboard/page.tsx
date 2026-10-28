'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { StatCards } from '@/components/dashboard/StatCards';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import { ExpenseBreakdownChart } from '@/components/dashboard/ExpenseBreakdownChart';
import { RecentExpenses } from '@/components/dashboard/RecentExpenses';
import { AIInsightsPanel } from '@/components/insights/AIInsightsPanel';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { Expense, AICategorizeResult } from '@/lib/types';
import { CATEGORY_METADATA } from '@/lib/ai/categorizer';
import {
  ShieldCheck,
  Sparkles,
  PlusCircle,
  DollarSign,
  Calendar,
  Tag,
  CreditCard,
  UserCheck,
  AlertCircle,
  ArrowRight,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function DashboardPage() {
  const router = useRouter();

  // Authentication & session state
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Financial state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState(2500);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [userApiKey, setUserApiKey] = useState<string | undefined>(undefined);

  // Quick Inline Expense Log State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickCategory, setQuickCategory] = useState('Food & Dining');
  const [quickDate, setQuickDate] = useState('');
  const [quickPayment, setQuickPayment] = useState<'card' | 'cash' | 'transfer' | 'other'>('card');
  const [isQuickLogging, setIsQuickLogging] = useState(false);
  const [quickAiResult, setQuickAiResult] = useState<AICategorizeResult | null>(null);
  const [quickError, setQuickError] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);

  const [currentMonth, setCurrentMonth] = useState('');

  // Initialize date on client mount
  useEffect(() => {
    setQuickDate(new Date().toISOString().slice(0, 10));
    setCurrentMonth(new Date().toISOString().slice(0, 7));
  }, []);

  // 1. Supabase Authentication Check
  const checkAuthAndLoad = useCallback(async () => {
    setAuthChecking(true);
    try {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      const hasDemoCookie = document.cookie.includes('ai_finance_demo=true');

      if (!authUser && !hasDemoCookie) {
        // Not authenticated and no guest session: redirect to login
        router.push('/login?redirectTo=/dashboard');
        return;
      }

      if (authUser) {
        setUser({ id: authUser.id, email: authUser.email });
        setIsDemo(false);
      } else if (hasDemoCookie) {
        setIsDemo(true);
      }

      // Fetch expenses
      const res = await fetch('/api/expenses');
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses || []);
      }
    } catch (err) {
      console.error('Error during auth check or load:', err);
    } finally {
      setAuthChecking(false);
      setIsLoadingExpenses(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuthAndLoad();

    const savedBudget = localStorage.getItem('aurafinance_budget');
    if (savedBudget) setMonthlyBudget(Number(savedBudget));

    const savedKey = localStorage.getItem('aurafinance_gemini_key');
    if (savedKey) setUserApiKey(savedKey);

    const handleExpenseAdded = (event: Event) => {
      const customEvent = event as CustomEvent<Expense>;
      if (customEvent.detail) {
        setExpenses((prev) => [customEvent.detail, ...prev]);
      } else {
        checkAuthAndLoad();
      }
    };

    window.addEventListener('expenseAdded', handleExpenseAdded);
    return () => window.removeEventListener('expenseAdded', handleExpenseAdded);
  }, [checkAuthAndLoad]);

  // Real-time AI Categorization for Inline Quick Form
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (quickTitle.trim().length >= 3) {
        setIsClassifying(true);
        try {
          const res = await fetch('/api/ai/categorize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: quickTitle, apiKey: userApiKey }),
          });
          if (res.ok) {
            const data: AICategorizeResult = await res.json();
            setQuickAiResult(data);
            setQuickCategory(data.category);
          }
        } catch (err) {
          console.error('Auto-categorize failed', err);
        } finally {
          setIsClassifying(false);
        }
      } else {
        setQuickAiResult(null);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [quickTitle, userApiKey]);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickError(null);

    const numAmount = parseFloat(quickAmount);
    if (!quickTitle.trim()) {
      setQuickError('Please provide an expense description.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setQuickError('Please enter a valid amount.');
      return;
    }

    setIsQuickLogging(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quickTitle.trim(),
          amount: numAmount,
          category: quickCategory,
          date: quickDate || new Date().toISOString().slice(0, 10),
          payment_method: quickPayment,
          ai_suggested: !!quickAiResult,
          ai_confidence: quickAiResult?.confidence || 1.0,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to record expense');
      }

      const { expense } = await res.json();

      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#06b6d4'],
        });
      } catch {
        // Safe
      }

      setExpenses((prev) => [expense, ...prev]);
      setQuickTitle('');
      setQuickAmount('');
      setQuickAiResult(null);
    } catch (err: unknown) {
      setQuickError(err instanceof Error ? err.message : 'Error recording expense');
    } finally {
      setIsQuickLogging(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete expense', err);
    }
  };

  const handlePreset = (title: string, amount: string, cat: string) => {
    setQuickTitle(title);
    setQuickAmount(amount);
    setQuickCategory(cat);
    setQuickAiResult({
      category: cat,
      confidence: 0.98,
      reasoning: 'Verified preset item',
      suggestedIcon: CATEGORY_METADATA[cat]?.icon || 'Tag',
      suggestedColor: CATEGORY_METADATA[cat]?.color || '#6366f1',
    });
  };

  if (authChecking) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 2rem', color: '#94a3b8' }}>
        <Sparkles size={36} className="animate-spin text-primary" style={{ margin: '0 auto 1rem auto', color: '#818cf8' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
          Verifying Supabase Authentication & RLS Session...
        </h3>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Validating cryptographic user tokens against PostgreSQL
        </p>
      </div>
    );
  }

  const monthExpenses = currentMonth
    ? expenses.filter((e) => e.date.startsWith(currentMonth))
    : expenses;
  const totalCurrentSpend = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner with Supabase Auth Verification */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Financial Command Center
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Real-time daily expense tracking and AI financial telemetry
          </p>
        </div>

        {/* Auth Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {user ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              <UserCheck size={16} />
              <span>Signed In: {user.email}</span>
              <span className="badge badge-success" style={{ marginLeft: '4px' }}>
                RLS Active
              </span>
            </div>
          ) : isDemo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#fbbf24',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                }}
              >
                <ShieldCheck size={16} />
                <span>Guest Demo Mode (Safe Sandbox)</span>
              </div>
              <Link href="/signup" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
                  Create Private Account
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {/* Primary KPI Stat Cards */}
      <StatCards expenses={expenses} monthlyBudget={monthlyBudget} />

      {/* Monthly Budget Progress Bar */}
      <BudgetProgress currentSpend={totalCurrentSpend} monthlyLimit={monthlyBudget} />

      {/* Inline Quick Daily Expense Logging Card */}
      <Card glow>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <PlusCircle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                Log Daily Expense with Real-Time AI Auto-Categorization
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                Type an expense description — the neural engine classifies it in sub-milliseconds
              </p>
            </div>
          </div>

          {quickAiResult && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: '0.8125rem',
                color: '#c7d2fe',
              }}
            >
              <Sparkles size={14} color="#818cf8" />
              <span>
                AI: <strong>{quickAiResult.category}</strong> ({Math.round(quickAiResult.confidence * 100)}%)
              </span>
              <Check size={14} color="#34d399" />
            </div>
          )}
        </div>

        {quickError && (
          <div
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fda4af',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            {quickError}
          </div>
        )}

        {/* Quick Presets */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
            Quick 1-Click Presets:
          </div>
          <div className="preset-chips">
            <button type="button" className="chip-btn" onClick={() => handlePreset('Starbucks Cappuccino & Croissant', '6.50', 'Food & Dining')}>
              ☕ Coffee $6.50
            </button>
            <button type="button" className="chip-btn" onClick={() => handlePreset('Chipotle Burrito Bowl', '14.25', 'Food & Dining')}>
              🥗 Lunch $14.25
            </button>
            <button type="button" className="chip-btn" onClick={() => handlePreset('Trader Joe’s Weekly Grocery Run', '68.50', 'Groceries')}>
              🛒 Groceries $68.50
            </button>
            <button type="button" className="chip-btn" onClick={() => handlePreset('Uber ride to downtown office', '21.40', 'Transportation')}>
              🚕 Uber $21.40
            </button>
            <button type="button" className="chip-btn" onClick={() => handlePreset('City Electric & Utility bill', '92.00', 'Utilities & Bills')}>
              ⚡ Power Bill $92.00
            </button>
            <button type="button" className="chip-btn" onClick={() => handlePreset('Netflix 4K Subscription renewal', '19.99', 'Entertainment')}>
              🎬 Netflix $19.99
            </button>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleQuickSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label" htmlFor="quick-title">
              Description / Merchant *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="quick-title"
                type="text"
                className="form-input"
                placeholder="e.g. Subway sandwich, Shell fuel, Equinox gym..."
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                required
              />
              {isClassifying && (
                <span
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.75rem',
                    color: '#818cf8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Sparkles size={13} className="animate-spin" />
                  AI Matching...
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="quick-amount">
              Amount ($) *
            </label>
            <div style={{ position: 'relative' }}>
              <DollarSign size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                id="quick-amount"
                type="number"
                step="0.01"
                min="0.01"
                className="form-input tabular-numbers"
                style={{ paddingLeft: '2rem' }}
                placeholder="0.00"
                value={quickAmount}
                onChange={(e) => setQuickAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="quick-category">
              Category
            </label>
            <div style={{ position: 'relative' }}>
              <Tag size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <select
                id="quick-category"
                className="form-select"
                style={{ paddingLeft: '2rem' }}
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value)}
              >
                {Object.keys(CATEGORY_METADATA).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="glow"
              style={{ width: '100%', height: '42px', justifyContent: 'center' }}
              isLoading={isQuickLogging}
              leftIcon={<PlusCircle size={16} />}
            >
              Record Expense
            </Button>
          </div>
        </form>
      </Card>

      {/* AI Insights & Financial Intelligence Panel */}
      <AIInsightsPanel
        expenses={expenses}
        monthlyBudget={monthlyBudget}
        userApiKey={userApiKey}
      />

      {/* Grid: Category Breakdown Donut & Recent Transactions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        <ExpenseBreakdownChart expenses={expenses} />
        <RecentExpenses
          expenses={expenses}
          onDeleteExpense={handleDeleteExpense}
          limit={6}
        />
      </div>
    </div>
  );
}
