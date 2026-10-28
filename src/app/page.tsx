'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  Lock,
  ArrowRight,
  PieChart,
  CheckCircle2,
  DollarSign,
  PlayCircle,
} from 'lucide-react';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

export default function LandingPage() {
  const router = useRouter();
  const [isDemoLaunching, setIsDemoLaunching] = useState(false);

  // Interactive Live Demo categorizer on the hero page!
  const [demoInput, setDemoInput] = useState('Uber ride to airport');
  const [demoCategory, setDemoCategory] = useState({
    name: 'Transportation',
    confidence: 96,
    icon: 'Car',
    color: '#06b6d4',
  });
  const [isClassifying, setIsClassifying] = useState(false);

  const handleTestCategorize = async (text: string) => {
    setDemoInput(text);
    setIsClassifying(true);
    try {
      const res = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setDemoCategory({
          name: data.category,
          confidence: Math.round(data.confidence * 100),
          icon: data.suggestedIcon,
          color: data.suggestedColor,
        });
      }
    } catch {
      // fallback
    } finally {
      setIsClassifying(false);
    }
  };

  const handleStartDemo = async () => {
    setIsDemoLaunching(true);
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } finally {
      setIsDemoLaunching(false);
    }
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 2.5rem',
          maxWidth: '1350px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Sparkles size={22} color="#fff" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            AuraFinance<span style={{ color: '#818cf8' }}>.AI</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="sm">
              Sign In
            </Button>
          </Link>
          <Button
            variant="glow"
            size="sm"
            onClick={handleStartDemo}
            isLoading={isDemoLaunching}
            leftIcon={<PlayCircle size={15} />}
          >
            Try Demo
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '4rem 2rem 5rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.75rem',
        }}
      >
        <div
          className="badge badge-ai"
          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'inline-flex' }}
        >
          <Sparkles size={15} />
          Powered by Gemini AI & PostgreSQL Row Level Security
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.25rem)',
            fontWeight: 800,
            lineHeight: '1.1',
            letterSpacing: '-0.03em',
            maxWidth: '950px',
            color: '#ffffff',
          }}
        >
          The Intelligent Finance Tracker That{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #38bdf8 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Understands Your Money
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#94a3b8',
            maxWidth: '680px',
            lineHeight: '1.6',
          }}
        >
          Log daily expenses in seconds with real-time AI auto-categorization. Discover deep spending
          velocity patterns, anomaly alerts, and actionable recommendations with ironclad multi-tenant data privacy.
        </p>

        {/* CTA Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
          <Button
            variant="glow"
            size="lg"
            onClick={handleStartDemo}
            isLoading={isDemoLaunching}
            rightIcon={<ArrowRight size={18} />}
          >
            Explore Live Demo Instantly
          </Button>
          <Link href="/signup" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="lg" leftIcon={<ShieldCheck size={18} color="#10b981" />}>
              Create Private Account
            </Button>
          </Link>
        </div>

        {/* Live Interactive AI Playground Widget */}
        <div style={{ width: '100%', maxWidth: '680px', marginTop: '2.5rem' }}>
          <Card glow style={{ textAlign: 'left', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="#818cf8" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                  Live AI Auto-Categorization Playground
                </span>
              </div>
              <span className="badge badge-success">Try Typing Anything</span>
            </div>

            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '1rem', padding: '0.85rem 1.25rem' }}
                value={demoInput}
                onChange={(e) => handleTestCategorize(e.target.value)}
                placeholder="Type any merchant or expense (e.g. Netflix, Trader Joes, Shell Gas)..."
              />
              {isClassifying && (
                <span
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.8rem',
                    color: '#818cf8',
                  }}
                >
                  Classifying...
                </span>
              )}
            </div>

            {/* Quick Sample Prompts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
              {['Starbucks latte $6', 'Whole Foods organic chicken', 'Delta Airlines ticket to London', 'Netflix 4K subscription'].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  className="chip-btn"
                  onClick={() => handleTestCategorize(sample)}
                >
                  {sample}
                </button>
              ))}
            </div>

            {/* Classification Result Display */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <CategoryIcon category={demoCategory.name} size={22} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                    Predicted Category
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                    {demoCategory.name}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                  Confidence
                </div>
                <div className="finance-amount" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }}>
                  {demoCategory.confidence}%
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section
        style={{
          padding: '3rem 2rem 5rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <Card>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', marginBottom: '1rem' }}>
              <Zap size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Sub-Millisecond Categorization
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.5' }}>
              Dual AI architecture combines instant offline NLP rule matching with Google Gemini 2.5 Flash for complete coverage without latency.
            </p>
          </Card>

          <Card>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', marginBottom: '1rem' }}>
              <Lock size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              PostgreSQL Row Level Security
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.5' }}>
              Your financial records are strictly protected at the database engine level via Supabase RLS. No other user can ever query or inspect your data.
            </p>
          </Card>

          <Card>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', marginBottom: '1rem' }}>
              <TrendingUp size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Spending Velocity Tracking
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.5' }}>
              Monitor daily pace against monthly limits, receive automated anomaly alerts for dining spikes, and view month-end forecast projections.
            </p>
          </Card>

          <Card>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', marginBottom: '1rem' }}>
              <PieChart size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Actionable Savings Engine
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.5' }}>
              Turn raw financial data into specific recommendations: audit unused streaming plans, apply the 48-hour wishlist rule, and build cash buffers.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '2rem',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.8125rem',
        }}
      >
        <p>AuraFinance AI • Built with Next.js, Supabase Row Level Security & Google Gemini</p>
      </footer>
    </div>
  );
}
