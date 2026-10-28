'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Expense } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CategoryIcon } from '../ui/CategoryIcon';
import { Search, Trash2, Sparkles, Filter } from 'lucide-react';
import { CATEGORY_METADATA } from '@/lib/ai/categorizer';

interface RecentExpensesProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  limit?: number;
}

export const RecentExpenses: React.FC<RecentExpensesProps> = ({
  expenses,
  onDeleteExpense,
  limit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter expenses
  const filtered = expenses.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const displayedExpenses = limit ? filtered.slice(0, limit) : filtered;

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    setDeletingId(id);
    try {
      await onDeleteExpense(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>Recent Transactions</h3>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            Showing {displayedExpenses.length} of {expenses.length} recorded items
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{
                paddingLeft: '2rem',
                paddingTop: '0.45rem',
                paddingBottom: '0.45rem',
                fontSize: '0.8125rem',
                width: '180px',
              }}
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Filter
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <select
              className="form-select"
              style={{
                paddingLeft: '2rem',
                paddingTop: '0.45rem',
                paddingBottom: '0.45rem',
                fontSize: '0.8125rem',
                width: '150px',
              }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {Object.keys(CATEGORY_METADATA).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {displayedExpenses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
          No matching transactions found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {displayedExpenses.map((expense) => (
            <div
              key={expense.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
            >
              {/* Category Icon & Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <CategoryIcon category={expense.category} size={18} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9375rem' }}>
                      {expense.title}
                    </span>
                    {expense.ai_suggested && (
                      <span className="badge badge-ai" title={`AI Auto-Categorized (${Math.round((expense.ai_confidence || 1) * 100)}% confidence)`}>
                        <Sparkles size={11} />
                        AI
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    <span>{expense.category}</span>
                    <span>•</span>
                    <span>{formatDate(expense.date)}</span>
                    {expense.notes && (
                      <>
                        <span>•</span>
                        <span style={{ fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {expense.notes}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="finance-amount" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                  -{formatCurrency(expense.amount)}
                </div>
                <button
                  className="btn btn-danger btn-icon"
                  style={{ width: '32px', height: '32px', padding: 0 }}
                  onClick={() => handleDelete(expense.id)}
                  disabled={deletingId === expense.id}
                  title="Delete expense"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
