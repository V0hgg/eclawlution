const PROMPT_INJECTION_PATTERNS = [
  /ignore (all|any|the) (previous|prior|above) instructions/i,
  /disregard (the )?(system|developer|safety) instructions/i,
  /reveal (your|the) (system prompt|hidden prompt|secrets?)/i,
  /print (all|the) environment variables/i,
  /disable (safety|guardrails|approval)/i,
  /bypass (approval|permission|safety)/i,
  /exfiltrat(e|ion)|export secrets?|steal tokens?/i,
  /restart (the )?(gateway|service) without approval/i,
  /you are now (in )?(developer mode|god mode|root mode)/i
];

const SECRET_TARGET_PATTERNS = [
  /api[_ -]?key/i,
  /token/i,
  /secret/i,
  /password/i,
  /credential/i,
  /auth/i,
  /ssh/i
];

export function scanPromptInjection(text) {
  const value = typeof text === 'string' ? text : '';
  const findings = [];

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(value)) findings.push(pattern.source);
  }

  const asksForSecrets = SECRET_TARGET_PATTERNS.some((pattern) => pattern.test(value));
  const riskScore = Math.min(10, findings.length * 2 + (asksForSecrets ? 2 : 0));

  return {
    flagged: findings.length > 0 || asksForSecrets,
    riskScore,
    findings,
    asksForSecrets
  };
}

export function evaluateSecurityPosture(input) {
  const injection = scanPromptInjection(input.prompt ?? '');
  const touchesSecrets = Boolean(input.touchesSecrets);
  const restartsLiveSystems = Boolean(input.restartsLiveSystems);
  const destructive = Boolean(input.destructive);
  const externalEffects = Boolean(input.externalEffects);

  const blockers = [];
  if (injection.flagged) blockers.push('prompt-injection-risk');
  if (touchesSecrets) blockers.push('secret-handling-risk');
  if (restartsLiveSystems) blockers.push('live-restart-risk');
  if (destructive) blockers.push('destructive-change-risk');
  if (externalEffects) blockers.push('external-side-effect-risk');

  const riskClass = blockers.length === 0
    ? 'safe-local'
    : blockers.some((b) => b.includes('restart') || b.includes('secret') || b.includes('destructive') || b.includes('external'))
      ? 'approval-required'
      : 'medium-risk';

  return {
    blockers,
    riskClass,
    approvalRequired: riskClass === 'approval-required',
    promptInjection: injection
  };
}
