'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Expense } from '@/lib/types';
import { RecentExpenses } from '@/components/dashboard/RecentExpenses';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, PlusCircle, ArrowUpDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadExpenses = useCallback(async () => {
    try {
      const res = await fetch('/api/expenses');
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses || []);
      }
    } catch (err) {
      console.error('Failed to load expenses', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();

    const handleExpenseAdded = (event: Event) => {
      const customEvent = event as CustomEvent<Expense>;
      if (customEvent.detail) {
        setExpenses((prev) => [customEvent.detail, ...prev]);
      } else {
        loadExpenses();
      }
    };

    window.addEventListener('expenseAdded', handleExpenseAdded);
    return () => window.removeEventListener('expenseAdded', handleExpenseAdded);
  }, [loadExpenses]);

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

  const exportCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['Date', 'Title', 'Category', 'Amount', 'Payment Method', 'AI Categorized', 'Notes'];
    const rows = expenses.map((e) => [
      e.date,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      e.amount,
      e.payment_method,
      e.ai_suggested ? 'Yes' : 'No',
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial-expenses-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalAllTime = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            All Transactions
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Comprehensive ledger of all logged expenses with multi-tenant row level protection
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="secondary" size="sm" onClick={exportCSV} leftIcon={<Download size={15} />}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Aggregate Header Banner */}
      <Card style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Recorded Expenditures
          </span>
          <div className="finance-amount" style={{ fontSize: '1.85rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.2rem' }}>
            {formatCurrency(totalAllTime)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 600 }}>
            {expenses.length} Records in Secure Ledger
          </span>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
            Protected by PostgreSQL Row Level Security
          </div>
        </div>
      </Card>

      {/* Full Transaction Table */}
      <RecentExpenses expenses={expenses} onDeleteExpense={handleDeleteExpense} />
    </div>
  );
}
