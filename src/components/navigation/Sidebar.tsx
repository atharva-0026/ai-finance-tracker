'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ReceiptText, Sparkles, Settings, LogOut, Plus, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { createClient } from '@/lib/supabase/client';

interface SidebarProps {
  onOpenLogModal: () => void;
  isDemo?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenLogModal, isDemo }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    if (isDemo) {
      await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });
      router.push('/');
      router.refresh();
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'All Expenses', href: '/dashboard/expenses', icon: ReceiptText },
    { label: 'AI Insights', href: '/dashboard/insights', icon: Sparkles },
    { label: 'Settings & API', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)',
            }}
          >
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              AuraFinance<span style={{ color: '#818cf8' }}>.AI</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} color="#10b981" />
              <span>{isDemo ? 'Guest Demo Mode' : 'Supabase RLS Active'}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Action Button */}
      <div>
        <Button
          variant="glow"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={onOpenLogModal}
          leftIcon={<Plus size={18} />}
        >
          Log Expense
        </Button>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1 }}>
        <ul className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer / Account Actions */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', padding: '0 0.5rem' }}>
          {isDemo ? (
            <span style={{ color: '#fbbf24' }}>● Running in Guest Demo</span>
          ) : (
            <span style={{ color: '#34d399' }}>● Multi-tenant RLS Isolated</span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="nav-item"
          style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
        >
          <LogOut size={16} />
          <span>{isDemo ? 'Exit Demo Mode' : 'Sign Out'}</span>
        </button>
      </div>
    </aside>
  );
};
