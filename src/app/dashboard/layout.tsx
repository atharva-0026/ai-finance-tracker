'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Navbar } from '@/components/navigation/Navbar';
import { LogExpenseModal } from '@/components/expenses/LogExpenseModal';
import { Expense } from '@/lib/types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [userApiKey, setUserApiKey] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Check if demo cookie is set
    const isDemoCookie = document.cookie.includes('ai_finance_demo=true');
    setIsDemo(isDemoCookie);

    // Retrieve locally saved Gemini API key if present
    const savedKey = localStorage.getItem('aurafinance_gemini_key');
    if (savedKey) {
      setUserApiKey(savedKey);
    }
  }, []);

  const handleExpenseCreated = (newExpense: Expense) => {
    // Dispatch custom event to notify child pages to re-fetch/update local state
    window.dispatchEvent(new CustomEvent('expenseAdded', { detail: newExpense }));
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar for desktop */}
      <Sidebar onOpenLogModal={() => setIsLogModalOpen(true)} isDemo={isDemo} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Navbar */}
        <Navbar onOpenLogModal={() => setIsLogModalOpen(true)} isDemo={isDemo} />

        {/* Main Content Area */}
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* Global Log Expense Modal */}
      <LogExpenseModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onExpenseCreated={handleExpenseCreated}
        userApiKey={userApiKey}
      />
    </div>
  );
}
