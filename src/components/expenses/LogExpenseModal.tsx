'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Sparkles, PlusCircle, Check, DollarSign, Calendar, Tag, CreditCard } from 'lucide-react';
import { CATEGORY_METADATA } from '@/lib/ai/categorizer';
import { Expense, AICategorizeResult } from '@/lib/types';
import confetti from 'canvas-confetti';

interface LogExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseCreated: (expense: Expense) => void;
  userApiKey?: string;
}

const PRESETS = [
  { label: '☕ Morning Coffee', title: 'Starbucks Coffee & Croissant', amount: 6.25, category: 'Food & Dining' },
  { label: '🥗 Healthy Lunch', title: 'Sweetgreen Salad Bowl', amount: 16.50, category: 'Food & Dining' },
  { label: '🛒 Supermarket', title: 'Whole Foods Groceries', amount: 72.40, category: 'Groceries' },
  { label: '🚕 Uber Transit', title: 'Uber ride across town', amount: 21.80, category: 'Transportation' },
  { label: '⚡ Utility Bill', title: 'Electric power utility', amount: 95.00, category: 'Utilities & Bills' },
  { label: '🎬 Netflix', title: 'Netflix subscription renewal', amount: 19.99, category: 'Entertainment' },
];

export const LogExpenseModal: React.FC<LogExpenseModalProps> = ({
  isOpen,
  onClose,
  onExpenseCreated,
  userApiKey,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'transfer' | 'other'>('card');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen && !date) {
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [isOpen, date]);

  // AI state
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [aiResult, setAiResult] = useState<AICategorizeResult | null>(null);
  const [aiApplied, setAiApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced AI classification as user types title
  const categorizeTitle = useCallback(
    async (text: string) => {
      if (!text || text.trim().length < 3) {
        setAiResult(null);
        return;
      }

      setIsCategorizing(true);
      try {
        const res = await fetch('/api/ai/categorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: text,
            amount: amount ? Number(amount) : undefined,
            apiKey: userApiKey,
          }),
        });

        if (res.ok) {
          const data: AICategorizeResult = await res.json();
          setAiResult(data);
          setCategory(data.category);
          setAiApplied(true);
        }
      } catch (err) {
        console.error('Categorize request failed', err);
      } finally {
        setIsCategorizing(false);
      }
    },
    [amount, userApiKey]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (title.trim().length >= 3 && !aiApplied) {
        categorizeTitle(title);
      }
    }, 380);

    return () => clearTimeout(timer);
  }, [title, categorizeTitle, aiApplied]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setAiApplied(false);
  };

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setTitle(preset.title);
    setAmount(preset.amount.toString());
    setCategory(preset.category);
    setAiResult({
      category: preset.category,
      confidence: 0.98,
      reasoning: 'Verified preset item',
      suggestedIcon: CATEGORY_METADATA[preset.category]?.icon || 'Tag',
      suggestedColor: CATEGORY_METADATA[preset.category]?.color || '#6366f1',
    });
    setAiApplied(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (!title.trim()) {
      setError('Please provide an expense description.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than $0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          amount: numAmount,
          category,
          date,
          payment_method: paymentMethod,
          notes: notes.trim() || null,
          ai_suggested: !!aiResult,
          ai_confidence: aiResult?.confidence || 1.0,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to record expense');
      }

      const { expense } = await res.json();

      // Confetti celebration
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#06b6d4'],
        });
      } catch {
        // Safe fallback
      }

      onExpenseCreated(expense);
      // Reset form
      setTitle('');
      setAmount('');
      setNotes('');
      setAiResult(null);
      setAiApplied(false);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Daily Expense"
      icon={<PlusCircle size={22} className="text-primary" style={{ color: '#818cf8' }} />}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fda4af',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Quick Presets */}
        <div>
          <label className="form-label" style={{ marginBottom: '0.4rem', display: 'block' }}>
            Quick Presets
          </label>
          <div className="preset-chips">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="chip-btn"
                onClick={() => handleApplyPreset(p)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title / Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="expense-title">
            Expense Description / Merchant *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="expense-title"
              type="text"
              className="form-input"
              placeholder="e.g. Chipotle burrito, Uber ride, Electric bill"
              value={title}
              onChange={handleTitleChange}
              required
              autoFocus
            />
            {isCategorizing && (
              <span
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.75rem',
                  color: '#a5b4fc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Sparkles size={14} className="animate-spin" />
                AI Analyzing...
              </span>
            )}
          </div>

          {/* AI Categorization Badge Banner */}
          {aiResult && (
            <div
              style={{
                marginTop: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                fontSize: '0.8125rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="#818cf8" />
                <span>
                  AI Categorized: <strong style={{ color: '#c7d2fe' }}>{aiResult.category}</strong>{' '}
                  <span style={{ color: '#94a3b8' }}>
                    ({Math.round(aiResult.confidence * 100)}% confidence)
                  </span>
                </span>
              </div>
              <Check size={14} color="#34d399" />
            </div>
          )}
        </div>

        {/* Amount & Date in 2 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="expense-amount">
              Amount ($) *
            </label>
            <div style={{ position: 'relative' }}>
              <DollarSign
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <input
                id="expense-amount"
                type="number"
                step="0.01"
                min="0.01"
                className="form-input tabular-numbers"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="expense-date">
              Date *
            </label>
            <div style={{ position: 'relative' }}>
              <Calendar
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <input
                id="expense-date"
                type="date"
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Category & Payment Method in 2 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="expense-category">
              Category
            </label>
            <div style={{ position: 'relative' }}>
              <Tag
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <select
                id="expense-category"
                className="form-select"
                style={{ paddingLeft: '2.25rem' }}
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setAiApplied(true);
                }}
              >
                {Object.keys(CATEGORY_METADATA).map((catName) => (
                  <option key={catName} value={catName}>
                    {catName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="expense-payment">
              Payment Method
            </label>
            <div style={{ position: 'relative' }}>
              <CreditCard
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <select
                id="expense-payment"
                className="form-select"
                style={{ paddingLeft: '2.25rem' }}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'cash' | 'transfer' | 'other')}
              >
                <option value="card">Credit / Debit Card</option>
                <option value="cash">Cash</option>
                <option value="transfer">Bank Transfer / ACH</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes (Optional) */}
        <div className="form-group">
          <label className="form-label" htmlFor="expense-notes">
            Notes / Tags (Optional)
          </label>
          <input
            id="expense-notes"
            type="text"
            className="form-input"
            placeholder="e.g. Work dinner reimbursement, receipt saved"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Record Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
};
