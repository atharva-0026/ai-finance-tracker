import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSampleExpenses } from '@/lib/utils';
import { Expense } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const isDemo = request.cookies.get('ai_finance_demo')?.value === 'true';

    if (!user) {
      if (isDemo) {
        // Return demo expenses from demo storage cookie if available, or generate standard demo set
        const demoStored = request.cookies.get('ai_finance_demo_data')?.value;
        if (demoStored) {
          try {
            const parsed = JSON.parse(decodeURIComponent(demoStored));
            return NextResponse.json({ expenses: parsed, isDemo: true });
          } catch {
            // fallback
          }
        }
        return NextResponse.json({ expenses: generateSampleExpenses(), isDemo: true });
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query authenticated user's expenses (Row Level Security ensures only user's rows are returned)
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ expenses: data || [], isDemo: false });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isDemo = request.cookies.get('ai_finance_demo')?.value === 'true';

    const body = await request.json();
    const { title, amount, category, date, payment_method, notes, ai_suggested, ai_confidence } = body;

    if (!title || !amount || !category) {
      return NextResponse.json(
        { error: 'Title, amount, and category are required' },
        { status: 400 }
      );
    }

    if (!user) {
      if (isDemo) {
        // Create demo expense in demo session
        const newExpense: Expense = {
          id: 'demo-' + Date.now(),
          user_id: 'demo-user-id',
          title,
          amount: Number(amount),
          category,
          date: date || new Date().toISOString().slice(0, 10),
          payment_method: payment_method || 'card',
          notes: notes || null,
          ai_suggested: !!ai_suggested,
          ai_confidence: ai_confidence || 1.0,
          created_at: new Date().toISOString(),
        };

        const response = NextResponse.json({ expense: newExpense, isDemo: true });
        // Retrieve existing demo list and prepend
        let currentDemoExpenses = generateSampleExpenses();
        const demoStored = request.cookies.get('ai_finance_demo_data')?.value;
        if (demoStored) {
          try {
            currentDemoExpenses = JSON.parse(decodeURIComponent(demoStored));
          } catch {
            // fallback
          }
        }
        currentDemoExpenses = [newExpense, ...currentDemoExpenses];
        response.cookies.set('ai_finance_demo_data', encodeURIComponent(JSON.stringify(currentDemoExpenses)), {
          path: '/',
          maxAge: 86400 * 7,
          sameSite: 'lax',
        });
        return response;
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Insert expense into PostgreSQL with authenticated user_id
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        title,
        amount: Number(amount),
        category,
        date: date || new Date().toISOString().slice(0, 10),
        payment_method: payment_method || 'card',
        notes: notes || null,
        ai_suggested: !!ai_suggested,
        ai_confidence: ai_confidence || 1.0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ expense: data, isDemo: false });
  } catch (err) {
    console.error('Error inserting expense:', err);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isDemo = request.cookies.get('ai_finance_demo')?.value === 'true';

    if (!user) {
      if (isDemo) {
        let currentDemoExpenses = generateSampleExpenses();
        const demoStored = request.cookies.get('ai_finance_demo_data')?.value;
        if (demoStored) {
          try {
            currentDemoExpenses = JSON.parse(decodeURIComponent(demoStored));
          } catch {
            // fallback
          }
        }
        currentDemoExpenses = currentDemoExpenses.filter((e) => e.id !== id);
        const response = NextResponse.json({ success: true, isDemo: true });
        response.cookies.set('ai_finance_demo_data', encodeURIComponent(JSON.stringify(currentDemoExpenses)), {
          path: '/',
          maxAge: 86400 * 7,
          sameSite: 'lax',
        });
        return response;
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Strict RLS: delete only where user_id = auth.uid()
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, isDemo: false });
  } catch (err) {
    console.error('Error deleting expense:', err);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
