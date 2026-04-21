export const ECLAWLUTION_VERSION = '0.1.0';

export const loops = {
  conversationDigest: {
    id: 'conversation-digest',
    description: 'Digest daily conversation transcripts and refine style + durable memory.'
  },
  selfEvolution: {
    id: 'self-evolution',
    description: 'Research, evaluate, implement, and reflect on assistant + workflow improvements.'
  },
  workflowTuning: {
    id: 'workflow-tuning',
    description: 'Tune jobs, schedules, prompts, and reporting cadence to fit the user better.'
  }
};

export function getEclawlutionManifest() {
  return {
    name: 'eclawlution',
    version: ECLAWLUTION_VERSION,
    phase: 'workflow-package',
    loops
  };
}

if (process.argv.includes('--self-test')) {
  console.log(JSON.stringify(getEclawlutionManifest(), null, 2));
}
