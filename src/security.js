const PROMPT_INJECTION_SIGNALS = [
  {
    id: 'instruction-override',
    description: 'tries to override higher-priority instructions',
    pattern: /ignore (?:(?:all|any|the)\s+)?(?:previous|prior|above)\s+instructions?/i
  },
  {
    id: 'policy-override',
    description: 'tries to override system, developer, or safety instructions',
    pattern: /(?:disregard|ignore|override) (?:the )?(?:system|developer|safety) instructions?/i
  },
  {
    id: 'prompt-reveal',
    description: 'tries to reveal system prompts or hidden instructions',
    pattern: /reveal (?:(?:your|the)\s+)?(?:system prompt|hidden prompt|secrets?)/i
  },
  {
    id: 'guardrail-disable',
    description: 'tries to disable safety guardrails or approval',
    pattern: /disable (?:safety|guardrails|approval)/i
  },
  {
    id: 'approval-bypass',
    description: 'tries to bypass approval or permission checks',
    pattern: /bypass (?:approval|permission|safety)/i
  },
  {
    id: 'environment-dump',
    description: 'tries to dump environment variables or secret material',
    pattern: /print (?:(?:all|the)\s+)?(?:environment variables|env(?:ironment)?(?: vars?)?|api keys?|tokens?|secrets?)/i
  },
  {
    id: 'secret-exfiltration',
    description: 'tries to exfiltrate secrets or tokens',
    pattern: /(?:exfiltrat(?:e|ion)|export|dump|steal) (?:secrets?|tokens?|credentials?|api keys?)/i
  },
  {
    id: 'restart-without-approval',
    description: 'tries to restart live systems without approval',
    pattern: /restart (?:the )?(?:gateway|service) without approval/i
  },
  {
    id: 'mode-escalation',
    description: 'tries to escalate authority or runtime mode',
    pattern: /you are now (?:in )?(?:developer mode|god mode|root mode)/i
  }
];

const APPROVAL_REQUIRED_SIGNAL_IDS = new Set([
  'guardrail-disable',
  'approval-bypass',
  'environment-dump',
  'secret-exfiltration',
  'restart-without-approval'
]);

const SECRET_TARGET_PATTERNS = [
  /api[_ -]?key/i,
  /token/i,
  /secret/i,
  /password/i,
  /credential/i,
  /auth/i,
  /ssh/i,
  /private key/i,
  /environment variables?/i,
  /env(?:ironment)?(?: vars?)?/i
];

function inferApprovalBoundary(riskClass) {
  if (riskClass === 'approval-required') return 'explicit-human-approval';
  if (riskClass === 'medium-risk') return 'maintainer-review';
  return 'auto-implementable';
}

export function scanPromptInjection(text) {
  const value = typeof text === 'string' ? text : '';
  const matchedSignals = PROMPT_INJECTION_SIGNALS
    .filter(({ pattern }) => pattern.test(value))
    .map(({ id, description }) => ({ id, description }));

  const findings = matchedSignals.map(({ id }) => id);
  const asksForSecrets = SECRET_TARGET_PATTERNS.some((pattern) => pattern.test(value));
  const riskScore = Math.min(10, findings.length * 2 + (asksForSecrets ? 2 : 0));

  return {
    flagged: findings.length > 0 || asksForSecrets,
    riskScore,
    findings,
    matchedSignals,
    asksForSecrets
  };
}

export function evaluateSecurityPosture(input) {
  const injection = scanPromptInjection(input.prompt ?? '');
  const touchesSecrets = Boolean(input.touchesSecrets);
  const restartsLiveSystems = Boolean(input.restartsLiveSystems);
  const destructive = Boolean(input.destructive);
  const externalEffects = Boolean(input.externalEffects);
  const highSeverityInjection = injection.findings.some((id) => APPROVAL_REQUIRED_SIGNAL_IDS.has(id));

  const blockers = [];
  if (injection.flagged) blockers.push('prompt-injection-risk');
  if (highSeverityInjection) blockers.push('high-severity-prompt-injection-risk');
  if (touchesSecrets) blockers.push('secret-handling-risk');
  if (restartsLiveSystems) blockers.push('live-restart-risk');
  if (destructive) blockers.push('destructive-change-risk');
  if (externalEffects) blockers.push('external-side-effect-risk');

  const riskClass = blockers.length === 0
    ? 'safe-local'
    : (highSeverityInjection || touchesSecrets || restartsLiveSystems || destructive || externalEffects)
      ? 'approval-required'
      : 'medium-risk';

  return {
    blockers,
    riskClass,
    approvalRequired: riskClass === 'approval-required',
    approvalBoundary: inferApprovalBoundary(riskClass),
    promptInjection: injection
  };
}
