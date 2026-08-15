// EVIDENCE
export interface Evidence {
  id: string;
  content: string;             // The actual excerpt / data point
  sourceUrl: string;
  sourceTitle?: string;
  publisher?: string;
  sourceType: 'primary' | 'aggregator' | 'opinion' | 'calculation' | 'user_input' | 'academic';
  retrievedAt: string;         // ISO timestamp
  publishedAt?: string;
  locator?: string;            // Page, section, heading
  contentHash: string;         // For change detection
  retrievalMethod: string;     // 'tavily_search' | 'direct_fetch' | 'user_provided'
  scores: {
    sourceQuality: number;     // Based on sourceType taxonomy
    freshness: number;         // Decay function from publishedAt/retrievedAt
    directness: number;        // LLM classifies, code scores
    corroboration: number;     // How many other sources agree
  };
  strength: number;            // Weighted composite
  supportsClaims: string[];    // Claim IDs
  attacksClaims: string[];     // Claim IDs
  qualityScore?: number;
}

// CLAIM
export interface Claim {
  id: string;
  text: string;
  category: 'market' | 'financial' | 'technical' | 'regulatory' | 'competitive' | 'operational' | 'user_need';
  status: 'supported' | 'weak' | 'contradicted' | 'unverified';
  evidence: Evidence[];
  arguments: ToulminArgument[];
  confidence: number;          // Computed, never LLM-assigned
  falsificationCondition?: string;
}

// TOULMIN ARGUMENT
export interface ToulminArgument {
  id: string;
  agentId: string;
  claimId: string;
  position: 'supports' | 'attacks';
  claim: string;
  grounds: string[];           // Evidence IDs
  warrant: string;
  backing: string;
  qualifier: 'certainly' | 'probably' | 'possibly' | 'unlikely';
  rebuttal: string;
  quality: ArgumentQuality;
  toulmin?: any; // For subagent 3 code
}

export interface ArgumentQuality {
  hasGrounds: boolean;
  hasWarrant: boolean;
  hasBacking: boolean;
  hasRebuttal: boolean;
  evidenceStrength: number;
  completeness: number;        // % of Toulmin fields populated
}

// ASSUMPTION
export interface Assumption {
  id: string;
  text: string;
  criticality: 'critical' | 'important' | 'minor';
  status: 'validated' | 'weak' | 'contradicted' | 'untested';
  confidence: number;
  relatedClaims: string[];
  relatedEvidence: string[];
  falsificationCondition: string;
  experiment?: Experiment;
}

// EXPERIMENT
export interface Experiment {
  id: string;
  hypothesis: string;
  method: string;
  successCriteria: string[];
  failureCriteria: string[];
  estimatedCost: string;
  estimatedTime: string;
  resolvesAssumptions: string[];
  ranking: {
    uncertaintyReduced: number;
    decisionImpact: number;
    feasibility: number;
    score: number;
  };
}

// AGENT
export interface Agent {
  id: string;
  persona: string;
  title: string;
  background: string;
  objectives: string[];
  tools: string[];
  constraints: AgentConstraints;
  whatWouldChangeMind: string[];
}

export interface AgentConstraints {
  maxToolCalls: number;
  maxTokens: number;
  budgetCents: number;
  minEvidenceBeforeConcluding: number;
}

// ARGUMENT GRAPH
export interface ArgumentNode {
  id: string;
  type: 'proposition' | 'claim' | 'evidence' | 'agent' | 'assumption' | 'experiment' | 'argument';
  label: string;
  data: unknown;
}

export interface ArgumentEdge {
  source: string;
  target: string;
  type: 'supports' | 'attacks' | 'questions' | 'depends_on' | 'derived_from' | 'resolves';
  strength: number;
}

export interface GraphNode extends ArgumentNode {}

// SCORING
export interface DecisionProfile {
  evidenceStrength: number;
  argumentQuality: number;
  uncertainty: number;
  corroboration: number;
  conflictPenalty: number;
  decisionReadiness: number;
  formulaVersion: string;
  weights: Record<string, number>;
}

// EPISTEMIC AUDIT
export interface EpistemicAudit {
  totalClaims: number;
  evidenceBacked: number;
  partiallySorted: number;
  unverified: number;
  argumentsWithMissingWarrants: number;
  claimsWithConflictingEvidence: number;
  staleEvidence: number;
  highImpactUnknowns: number;
  reportReliability: 'high' | 'moderate' | 'low' | 'insufficient';
  caveats: string[];
}

// STRUCTURED DEFENSE
export interface StructuredDefense {
  claimsChallenged: string[];
  evidenceProvided: string;
  newInformation: string;
  assumptionsCorrected: string;
}

// EXECUTION TRACE
export interface ExecutionTrace {
  events: TraceEvent[];
  totalDuration: number;
  totalTokens: number;
  totalCost: number;
  totalLlmCalls: number;
  totalToolCalls: number;
}

export interface TraceEvent {
  timestamp: string;
  type: 'stage_start' | 'stage_complete' | 'stage_failed' | 'llm_call' | 'tool_call' | 'evidence_found' | 'claim_created' | 'argument_created' | 'conflict_detected' | 'score_computed' | 'retry';
  stage: string;
  detail: unknown;
  duration?: number;
  tokens?: number;
  cost?: number;
}

// SESSION
export type SessionStatus =
  | 'idle'
  | 'decomposing'
  | 'researching'
  | 'steelmanning'
  | 'recruiting'
  | 'critiquing'
  | 'cross_examining'
  | 'awaiting_defense'
  | 'scoring'
  | 'synthesizing'
  | 'complete'
  | 'error';

export interface Session {
  id: string;
  proposition: string;
  context?: string;
  mode: string;
  status: SessionStatus;
  agents: Agent[];
  steelman: string;
  claims: Claim[];
  assumptions: Assumption[];
  arguments: ToulminArgument[];
  evidence: Evidence[];
  experiments: Experiment[];
  graph: { nodes: ArgumentNode[]; edges: ArgumentEdge[] };
  scores: DecisionProfile | null;
  audit: EpistemicAudit | null;
  userDefense?: StructuredDefense;
  trace: ExecutionTrace;
  verdict: string;
  createdAt: string;
  updatedAt: string;
}

// SSE EVENTS
export type SessionEvent =
  | { type: 'stage_start'; stage: string; timestamp?: string }
  | { type: 'stage_complete'; stage: string; data?: unknown; timestamp?: string }
  | { type: 'claims_extracted'; claims: Claim[]; timestamp?: string }
  | { type: 'assumptions_extracted'; assumptions: Assumption[]; timestamp?: string }
  | { type: 'evidence_found'; evidence: Evidence; timestamp?: string }
  | { type: 'agent_recruited'; agent: Agent; timestamp?: string }
  | { type: 'argument_created'; argument: ToulminArgument; timestamp?: string }
  | { type: 'conflict_detected'; claimId: string; details: string; timestamp?: string }
  | { type: 'steelman_complete'; steelman: string; timestamp?: string }
  | { type: 'defense_requested'; timestamp?: string }
  | { type: 'score_computed'; scores?: DecisionProfile; timestamp?: string; payload?: any }
  | { type: 'audit_complete'; audit?: EpistemicAudit; timestamp?: string; payload?: any }
  | { type: 'experiments_generated'; experiments?: Experiment[]; timestamp?: string; payload?: any }
  | { type: 'graph_update'; nodes?: ArgumentNode[]; edges?: ArgumentEdge[]; timestamp?: string; payload?: any }
  | { type: 'verdict'; verdict?: string; timestamp?: string; payload?: any }
  | { type: 'trace_update'; trace: ExecutionTrace; timestamp?: string }
  | { type: 'error'; stage: string; message: string; retryable: boolean; timestamp?: string }
  | { type: 'complete'; timestamp?: string; payload?: any };

// ANALYSIS MODE
export interface AnalysisMode {
  id: string;
  name: string;
  description: string;
  agentTemplates: AgentTemplate[];
  toolPermissions: Record<string, string[]>;
  scoringWeights: Record<string, number>;
}

export interface AgentTemplate {
  persona: string;
  title: string;
  background: string;
  objectives: string[];
  tools: string[];
  constraints: AgentConstraints;
}
