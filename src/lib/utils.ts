import { Expense } from './types';

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function generateSampleExpenses(): Expense[] {
  const today = new Date();
  const getPastDate = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  };

  return [
    {
      id: 'demo-1',
      user_id: 'demo-user-id',
      title: 'Trader Joe’s Groceries & Fresh Produce',
      amount: 84.5,
      category: 'Groceries',
      date: getPastDate(0),
      payment_method: 'card',
      ai_suggested: true,
      ai_confidence: 0.96,
      notes: 'Weekly pantry restocking',
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      user_id: 'demo-user-id',
      title: 'Uber ride from Downtown Office',
      amount: 24.3,
      category: 'Transportation',
      date: getPastDate(1),
      payment_method: 'card',
      ai_suggested: true,
      ai_confidence: 0.98,
      notes: 'Evening commute home',
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      user_id: 'demo-user-id',
      title: 'Sweetgreen Warm Bowl & Lemonade',
      amount: 18.75,
      category: 'Food & Dining',
      date: getPastDate(2),
      payment_method: 'card',
      ai_suggested: true,
      ai_confidence: 0.97,
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-4',
      user_id: 'demo-user-id',
      title: 'Monthly Electric & Power Utility Bill',
      amount: 92.15,
      category: 'Utilities & Bills',
      date: getPastDate(4),
      payment_method: 'transfer',
      ai_suggested: true,
      ai_confidence: 0.95,
      notes: 'Summer air conditioning period',
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-5',
      user_id: 'demo-user-id',
      title: 'Netflix 4K Ultra HD Subscription',
      amount: 22.99,
      category: 'Entertainment',
      date: getPastDate(6),
      payment_method: 'card',
      ai_suggested: true,
      ai_confidence: 0.99,
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-6',
      user_id: 'demo-user-id',
      title: 'Equinox Gym & Wellness Membership',
      amount: 180.0,
      category: 'Health & Fitness',
      date: getPastDate(8),
      payment_method: 'card',
      ai_suggested: true,
      ai_confidence: 0.95,
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-7',
      user_id: 'demo-user-id',
      title: 'Chipotle Burrito Bowl with Guacamole',
      amount: 14.85,
      category: 'Food & Dining',
      date: getPastDate(9),
      payment_method: 'card',
      ai_suggested: true,
      ai_confidence: 0.96,
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-8',
      user_id: 'demo-user-id',
      title: 'Shell Gasoline Fuel Fill-up',
      amount: 48.2,
      category: 'Transportation',
      date: getPastDate(11),
      payment_method: 'card',
      ai_suggested: true,
      ai_confidence: 0.95,
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-9',
      user_id: 'demo-user-id',
      title: 'Apartment Monthly Lease Payment',
      amount: 1250.0,
      category: 'Housing & Rent',
      date: getPastDate(15),
      payment_method: 'transfer',
      ai_suggested: true,
      ai_confidence: 0.99,
      notes: 'Rent via direct ACH',
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-10',
      user_id: 'demo-user-id',
      title: 'Apple Store USB-C Braided Cable',
      amount: 32.5,
      category: 'Shopping',
      date: getPastDate(18),
      payment_method: 'card',
      ai_suggested: true,
      ai_confidence: 0.92,
      created_at: new Date().toISOString(),
    },
  ];
}
