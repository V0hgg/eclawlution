export const ECLAWLUTION_VERSION = '0.2.0';

export const loops = {
  conversationDigest: {
    id: 'conversation-digest',
    description: 'Digest daily conversation transcripts and refine style + durable memory.',
    outputs: ['daily-memory', 'durable-memory', 'style-profile']
  },
  selfEvolution: {
    id: 'self-evolution',
    description: 'Research, evaluate, implement, and reflect on assistant + workflow improvements.',
    outputs: ['evolution-report', 'workflow-changes', 'recommendations']
  },
  workflowTuning: {
    id: 'workflow-tuning',
    description: 'Tune jobs, schedules, prompts, and reporting cadence to fit the user better.',
    outputs: ['scorecard', 'job-tuning', 'schedule-proposals']
  }
};

export const boundaries = {
  broadAuthority: [
    'memory-rules',
    'style-fit-files',
    'cron-schedules',
    'workflow-prompts',
    'report-cadence',
    'local-operating-docs'
  ],
  approvalRequired: [
    'risky-restarts',
    'destructive-edits',
    'new-secrets-or-auth',
    'external-side-effects'
  ]
};

export const scorecardDimensions = [
  'usefulness',
  'noise',
  'timingFit',
  'userFit',
  'maintainability',
  'surpriseCost'
];

export function getEclawlutionManifest() {
  return {
    name: 'eclawlution',
    version: ECLAWLUTION_VERSION,
    phase: 'phase-2-scaffold',
    loops,
    boundaries,
    scorecardDimensions
  };
}
