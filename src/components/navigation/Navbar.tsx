'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Plus, Menu } from 'lucide-react';
import { Button } from '../ui/Button';

interface NavbarProps {
  onOpenLogModal: () => void;
  isDemo?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLogModal, isDemo }) => {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        background: 'rgba(12, 16, 23, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={16} color="#fff" />
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
            AuraFinance<span style={{ color: '#818cf8' }}>.AI</span>
          </span>
        </Link>

        {isDemo && (
          <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>
            Demo Preview Mode
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {isDemo && (
          <Link href="/signup" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="sm">
              Create Free Account
            </Button>
          </Link>
        )}
        <Button variant="primary" size="sm" onClick={onOpenLogModal} leftIcon={<Plus size={15} />}>
          Log Expense
        </Button>
      </div>
    </header>
  );
};
