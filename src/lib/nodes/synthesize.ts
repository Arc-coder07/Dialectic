import { PipelineNode } from '@/lib/engine/pipeline';
import { generateObject } from 'ai';
import { getModel } from '@/lib/models/providers';
import { SynthesisSchema } from '@/lib/schemas';

export const synthesizeNode: PipelineNode = {
  name: 'synthesize',
  stage: 'synthesizing',
  async execute(session, emit) {
    const model = getModel();

    const result = await generateObject({
      model,
      schema: SynthesisSchema,
      prompt: `Synthesize the findings of this dialectic session.\n\nProposition: ${session.proposition}\nScores: ${JSON.stringify(session.scores)}\n\nProvide a final verdict text and a ranked list of experiments to resolve remaining uncertainties.`,
    });

    emit({
      type: 'verdict',
      payload: result.object.verdict,
      timestamp: new Date().toISOString()
    });

    emit({
      type: 'experiments_generated',
      payload: result.object.experiments,
      timestamp: new Date().toISOString()
    });

    emit({
      type: 'complete',
      payload: null,
      timestamp: new Date().toISOString()
    });

    return {
      verdict: result.object.verdict,
      experiments: result.object.experiments,
    } as any;
  }
};
