'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface BudgetProgressProps {
  currentSpend: number;
  monthlyLimit: number;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({ currentSpend, monthlyLimit }) => {
  const [daysRemaining, setDaysRemaining] = useState(15);

  useEffect(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = Math.max(1, now.getDate());
    setDaysRemaining(daysInMonth - currentDay);
  }, []);

  const percent = monthlyLimit > 0 ? Math.min(100, Math.round((currentSpend / monthlyLimit) * 100)) : 0;
  const isOver = currentSpend > monthlyLimit;
  const remaining = Math.max(0, monthlyLimit - currentSpend);

  let barColor = '#10b981'; // emerald
  if (percent > 90) barColor = '#f43f5e'; // rose
  else if (percent > 75) barColor = '#f59e0b'; // amber

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>Monthly Budget Pacing</h3>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            {daysRemaining} days remaining in current billing cycle
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="finance-amount" style={{ fontSize: '1.1rem', fontWeight: 700, color: isOver ? '#fb7185' : '#f8fafc' }}>
            {formatCurrency(currentSpend)}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}> / {formatCurrency(monthlyLimit)}</span>
        </div>
      </div>

      <div className="progress-container" style={{ height: '10px', marginBottom: '0.75rem' }}>
        <div
          className="progress-bar"
          style={{
            width: `${percent}%`,
            backgroundColor: barColor,
            boxShadow: `0 0 12px ${barColor}80`,
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isOver ? '#fb7185' : '#34d399' }}>
          {isOver ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
          <span>
            {isOver
              ? `Exceeded budget by ${formatCurrency(currentSpend - monthlyLimit)}`
              : `${formatCurrency(remaining)} remaining in budget`}
          </span>
        </div>
        <span style={{ color: '#94a3b8' }}>
          Allowed daily run-rate: {formatCurrency(remaining / Math.max(1, daysRemaining))}/day
        </span>
      </div>
    </Card>
  );
};
