import { PipelineNode } from '@/lib/engine/pipeline';
import { generateObject } from 'ai';
import { getModel } from '@/lib/models/providers';
import { SteelmanSchema } from '@/lib/schemas';

export const steelmanNode: PipelineNode = {
  name: 'steelman',
  stage: 'steelmanning',
  async execute(session, emit) {
    const model = getModel();

    const evidenceContext = session.evidence?.map(e => e.content).join('\n') || 'No evidence gathered.';
    
    const result = await generateObject({
      model,
      schema: SteelmanSchema,
      prompt: `Construct the strongest possible case FOR the proposition based on the gathered evidence.\n\nProposition: ${session.proposition}\nContext: ${session.context || 'None'}\n\nEvidence:\n${evidenceContext}`,
    });

    emit({
      type: 'steelman_complete',
      steelman: result.object.steelman,
      timestamp: new Date().toISOString(),
    });

    return {
      steelman: result.object.steelman,
    };
  }
};
