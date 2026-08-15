'use client';

import { useState } from 'react';
import { useSession } from '@/hooks/use-session';
import SessionView from '@/components/dialectic/SessionView';

export default function Home() {
  const { session, loading, error, startSession, stopSession } = useSession();
  const [proposition, setProposition] = useState('');

  if (session) {
    return (
      <SessionView 
        session={session} 
        loading={loading} 
        error={error} 
        onStop={stopSession} 
      />
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Dialectic</h1>
          <p className="text-muted-foreground text-lg">
            Submit a proposition. Our agents will deconstruct it, research it, debate it, and score it using formal argumentation logic.
          </p>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (proposition.trim()) startSession(proposition);
          }}
          className="space-y-4"
        >
          <textarea
            value={proposition}
            onChange={(e) => setProposition(e.target.value)}
            placeholder="Enter a proposition (e.g. 'Apple should acquire Disney to solidify its services revenue')"
            className="w-full min-h-[150px] p-4 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            disabled={loading}
          />
          
          {error && (
            <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !proposition.trim()}
              className="px-6 py-2 bg-accent text-accent-foreground rounded-md font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {loading ? 'Starting...' : 'Analyze Proposition'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
