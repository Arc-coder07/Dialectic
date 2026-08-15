import { PipelineNode } from '@/lib/engine/pipeline';
import { Agent } from '@/lib/engine/types';
import { generateObject } from 'ai';
import { getModel } from '@/lib/models/providers';
import { AgentRecruitmentSchema } from '@/lib/schemas';
import { v4 as uuidv4 } from 'uuid';

export const recruitNode: PipelineNode = {
  name: 'recruit',
  stage: 'recruiting',
  async execute(session, emit) {
    const model = getModel();
    
    const result = await generateObject({
      model,
      schema: AgentRecruitmentSchema,
      prompt: `Recruit 3 domain-specific agents to debate the following proposition.\n\nProposition: ${session.proposition}\nContext: ${session.context || 'None'}\n\nSelect agents with expertise relevant to the domain. Each must have specific objectives and constraints.`,
    });

    const agents: Agent[] = result.object.agents.map((a: any) => ({
      id: uuidv4(),
      persona: a.persona || a.name || 'Agent',
      title: a.title || a.role || 'Expert',
      background: a.background || '',
      objectives: a.objectives || [],
      tools: a.tools || a.toolPermissions || [],
      constraints: {
        maxToolCalls: 5,
        maxTokens: 2000,
        budgetCents: 50,
        minEvidenceBeforeConcluding: 2
      },
      whatWouldChangeMind: a.whatWouldChangeMind || []
    }));

    emit({
      type: 'agent_recruited',
      agent: agents[0],
      timestamp: new Date().toISOString(),
    });

    return { agents };
  }
};
