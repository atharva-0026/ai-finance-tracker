'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { CATEGORY_METADATA } from '@/lib/ai/categorizer';
import { CategoryIcon } from '../ui/CategoryIcon';

interface ExpenseBreakdownChartProps {
  expenses: Expense[];
}

export const ExpenseBreakdownChart: React.FC<ExpenseBreakdownChartProps> = ({ expenses }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Group current month or all expenses by category
  const categoryTotals: Record<string, number> = {};
  let totalAmount = 0;

  for (const exp of expenses) {
    const amt = Number(exp.amount);
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + amt;
    totalAmount += amt;
  }

  const items = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: totalAmount > 0 ? (amt / totalAmount) * 100 : 0,
      color: CATEGORY_METADATA[cat]?.color || '#6366f1',
    }));

  if (items.length === 0) {
    return (
      <Card>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Spending Distribution</h3>
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
          No expense records found. Log your first expense to view distribution charts.
        </div>
      </Card>
    );
  }

  // SVG Donut Calculations
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>Category Distribution</h3>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            Where your money is allocated across {items.length} categories
          </p>
        </div>
        <div className="finance-amount" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#818cf8' }}>
          {formatCurrency(totalAmount)}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(180px, 220px) 1fr',
          gap: '2rem',
          alignItems: 'center',
        }}
      >
        {/* SVG Donut Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth={strokeWidth}
            />
            {items.map((item, index) => {
              const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += item.percentage;

              const isHovered = hoveredCategory === item.category;

              return (
                <circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    transition: 'all 200ms ease',
                    cursor: 'pointer',
                    opacity: hoveredCategory && !isHovered ? 0.4 : 1,
                  }}
                  onMouseEnter={() => setHoveredCategory(item.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              );
            })}
          </svg>

          {/* Donut Center Display */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {hoveredCategory || 'Total Spend'}
            </div>
            <div className="finance-amount" style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              {hoveredCategory
                ? formatCurrency(categoryTotals[hoveredCategory] || 0)
                : formatCurrency(totalAmount)}
            </div>
          </div>
        </div>

        {/* Detailed Horizontal Breakdown Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.slice(0, 5).map((item) => (
            <div
              key={item.category}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                background: hoveredCategory === item.category ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={() => setHoveredCategory(item.category)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CategoryIcon category={item.category} size={14} showBackground={false} />
                  <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{item.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="finance-amount" style={{ fontWeight: 600, color: '#f8fafc' }}>
                    {formatCurrency(item.amount)}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem', width: '38px', textAlign: 'right' }}>
                    {item.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Progress Line */}
              <div className="progress-container" style={{ height: '5px' }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
