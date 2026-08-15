import React from 'react';
import { Session, Claim, Assumption, Agent, Evidence, ToulminArgument, SessionStatus } from '@/lib/engine/types';

interface SessionViewProps {
  session: Session;
  loading: boolean;
  error: string | null;
  onStop: () => void;
}

const statusMessages: Record<SessionStatus, string> = {
  idle: 'Initializing engine...',
  decomposing: 'Deconstructing proposition into claims and assumptions...',
  researching: 'Deploying search agents to gather evidence...',
  steelmanning: 'Constructing strongest possible counter-case...',
  recruiting: 'Recruiting domain-specific expert agents...',
  critiquing: 'Agents are performing formal Toulmin critique...',
  cross_examining: 'Agents are cross-examining each other...',
  awaiting_defense: 'Awaiting user defense (paused)...',
  scoring: 'Computing epistemic scores deterministically...',
  synthesizing: 'Synthesizing final verdict and experiments...',
  complete: 'Analysis complete.',
  error: 'Engine encountered a critical error.'
};

export default function SessionView({ session, loading, error, onStop }: SessionViewProps) {
  return (
    <div className="min-h-screen bg-black text-foreground font-sans">
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold tracking-tight">Dialectic</h1>
          <div className="h-4 w-px bg-white/20"></div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            {loading && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
            )}
            <span>{statusMessages[session.status] || session.status}</span>
          </div>
        </div>
        <button
          onClick={onStop}
          className="text-sm px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors"
        >
          {loading ? 'Stop Analysis' : 'Close'}
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: The Proposition & Claims */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">Proposition</h2>
            <p className="text-2xl font-medium leading-relaxed">
              {session.proposition}
            </p>
          </section>

          {session.steelman && (
            <section className="space-y-4 p-6 bg-white/5 border border-white/10 rounded-lg">
              <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground flex items-center space-x-2">
                <span>Steelman Construct</span>
              </h2>
              <p className="text-lg leading-relaxed text-white/90">
                {session.steelman}
              </p>
            </section>
          )}

          <section className="space-y-4">
            <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">Deconstructed Claims</h2>
            {session.claims.length === 0 ? (
              <div className="h-24 border border-dashed border-white/10 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                Awaiting claims extraction...
              </div>
            ) : (
              <div className="grid gap-4">
                {session.claims.map((claim) => (
                  <ClaimCard key={claim.id} claim={claim} evidence={session.evidence} arguments={session.arguments} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Agents, Scores, Verdict */}
        <div className="space-y-8">
          
          {session.scores && (
            <section className="space-y-4">
              <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">Decision Profile</h2>
              <div className="p-6 bg-white/5 border border-white/10 rounded-lg space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-muted-foreground text-sm">Readiness Score</span>
                  <span className="text-4xl font-light">
                    {(session.scores.decisionReadiness * 100).toFixed(0)}<span className="text-xl text-white/50">%</span>
                  </span>
                </div>
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <ScoreBar label="Evidence Strength" value={session.scores.evidenceStrength} />
                  <ScoreBar label="Argument Quality" value={session.scores.argumentQuality} />
                  <ScoreBar label="Corroboration" value={session.scores.corroboration} />
                  <ScoreBar label="Uncertainty" value={session.scores.uncertainty} invert />
                  <ScoreBar label="Conflict Penalty" value={session.scores.conflictPenalty} invert />
                </div>
              </div>
            </section>
          )}

          <section className="space-y-4">
            <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">Agents</h2>
            {session.agents.length === 0 ? (
              <div className="h-24 border border-dashed border-white/10 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                Recruiting agents...
              </div>
            ) : (
              <div className="space-y-3">
                {session.agents.map((agent) => (
                  <div key={agent.id} className="p-4 border border-white/10 rounded-lg bg-black">
                    <h3 className="font-medium text-white">{agent.title}</h3>
                    <p className="text-sm text-muted-foreground">{agent.persona}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {session.verdict && (
            <section className="space-y-4">
              <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">Final Verdict</h2>
              <div className="p-6 bg-accent text-accent-foreground rounded-lg">
                <p className="leading-relaxed whitespace-pre-wrap">{session.verdict}</p>
              </div>
            </section>
          )}

        </div>

      </main>
    </div>
  );
}

function ClaimCard({ claim, evidence, arguments: args }: { claim: Claim, evidence: Evidence[], arguments: ToulminArgument[] }) {
  const claimEvidence = evidence.filter(e => e.supportsClaims.includes(claim.id) || e.attacksClaims.includes(claim.id));
  const claimArgs = args.filter(a => a.claimId === claim.id);

  const statusColors = {
    supported: 'text-constructive border-constructive/20 bg-constructive/10',
    contradicted: 'text-destructive border-destructive/20 bg-destructive/10',
    weak: 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10',
    unverified: 'text-muted-foreground border-white/10 bg-white/5'
  };

  return (
    <div className="p-5 border border-white/10 rounded-lg bg-black space-y-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-white/90 font-medium leading-relaxed">{claim.text}</p>
        <span className={`px-2 py-1 text-xs font-medium uppercase tracking-wider rounded border whitespace-nowrap ${statusColors[claim.status]}`}>
          {claim.status}
        </span>
      </div>
      
      {(claimEvidence.length > 0 || claimArgs.length > 0) && (
        <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Evidence ({claimEvidence.length})</span>
            <div className="space-y-2">
              {claimEvidence.slice(0, 3).map(e => (
                <a key={e.id} href={e.sourceUrl} target="_blank" rel="noreferrer" className="block text-sm text-blue-400 hover:underline truncate">
                  {e.sourceTitle || e.sourceUrl}
                </a>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Arguments ({claimArgs.length})</span>
            <div className="space-y-2">
              {claimArgs.slice(0, 3).map(a => (
                <div key={a.id} className="text-sm text-white/70 truncate">
                  <span className={a.position === 'supports' ? 'text-constructive' : 'text-destructive'}>
                    {a.position === 'supports' ? '↑' : '↓'}
                  </span>{' '}
                  {a.claim}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, value, invert = false }: { label: string, value: number, invert?: boolean }) {
  // value is 0-1
  const pct = Math.max(0, Math.min(100, value * 100));
  
  let color = 'bg-accent';
  if (invert) {
    color = pct > 50 ? 'bg-destructive' : 'bg-accent';
  } else {
    color = pct < 50 ? 'bg-yellow-500' : 'bg-constructive';
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}
