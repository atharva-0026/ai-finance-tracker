'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { TrendingUp, Wallet, Calendar, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Expense } from '@/lib/types';
import { CategoryIcon } from '../ui/CategoryIcon';

interface StatCardsProps {
  expenses: Expense[];
  monthlyBudget: number;
}

export const StatCards: React.FC<StatCardsProps> = ({ expenses, monthlyBudget }) => {
  const [dateInfo, setDateInfo] = useState<{
    currentMonth: string;
    currentDay: number;
    daysInMonth: number;
  }>({
    currentMonth: '',
    currentDay: 1,
    daysInMonth: 30,
  });

  useEffect(() => {
    const now = new Date();
    setDateInfo({
      currentMonth: now.toISOString().slice(0, 7),
      currentDay: Math.max(1, now.getDate()),
      daysInMonth: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
    });
  }, []);

  const { currentMonth, currentDay, daysInMonth } = dateInfo;

  // Current month expenses (or all if currentMonth not yet initialized)
  const monthExpenses = currentMonth
    ? expenses.filter((e) => e.date.startsWith(currentMonth))
    : expenses;
  const totalSpent = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Remaining budget
  const remainingBudget = Math.max(0, monthlyBudget - totalSpent);
  const budgetPercentage = Math.min(100, Math.round((totalSpent / monthlyBudget) * 100));

  // Daily average
  const dailyAverage = totalSpent / currentDay;

  // Top category
  const categoryTotals: Record<string, number> = {};
  for (const exp of monthExpenses) {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
  }
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCategoryName = sortedCategories[0]?.[0] || 'None';
  const topCategoryAmount = sortedCategories[0]?.[1] || 0;

  return (
    <div className="stat-grid">
      {/* Total Monthly Spend */}
      <Card className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Total Spent This Month</span>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Wallet size={19} />
          </div>
        </div>
        <div className="stat-value finance-amount">{formatCurrency(totalSpent)}</div>
        <div className="stat-footer">
          <span style={{ color: budgetPercentage > 90 ? '#fb7185' : '#34d399', display: 'flex', alignItems: 'center' }}>
            {budgetPercentage > 90 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {budgetPercentage}% of budget used
          </span>
          <span>• {monthExpenses.length} transactions</span>
        </div>
      </Card>

      {/* Remaining Budget */}
      <Card className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Budget Remaining</span>
          <div
            className="stat-icon-wrapper"
            style={{
              background: remainingBudget > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              color: remainingBudget > 0 ? '#34d399' : '#fb7185',
              borderColor: remainingBudget > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)',
            }}
          >
            <TrendingUp size={19} />
          </div>
        </div>
        <div className="stat-value finance-amount">{formatCurrency(remainingBudget)}</div>
        <div className="stat-footer">
          <span>Limit: {formatCurrency(monthlyBudget)} / mo</span>
          <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>
            {daysInMonth - currentDay} days left
          </span>
        </div>
      </Card>

      {/* Daily Average Spend */}
      <Card className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Daily Average Spend</span>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
            <Calendar size={19} />
          </div>
        </div>
        <div className="stat-value finance-amount">{formatCurrency(dailyAverage)}</div>
        <div className="stat-footer">
          <span>Pace: {formatCurrency(dailyAverage * daysInMonth)} projected</span>
        </div>
      </Card>

      {/* Top Expense Category */}
      <Card className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Top Expense Category</span>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <PieChart size={19} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
          {topCategoryName !== 'None' && <CategoryIcon category={topCategoryName} size={20} />}
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#f8fafc' }}>{topCategoryName}</div>
            <div className="finance-amount" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {formatCurrency(topCategoryAmount)}
            </div>
          </div>
        </div>
        <div className="stat-footer" style={{ marginTop: 'auto' }}>
          <span>
            {totalSpent > 0 ? `${Math.round((topCategoryAmount / totalSpent) * 100)}% of monthly total` : 'No expenses logged'}
          </span>
        </div>
      </Card>
    </div>
  );
};
