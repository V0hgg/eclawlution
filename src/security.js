const PROMPT_INJECTION_SIGNALS = [
  {
    id: 'instruction-override',
    description: 'tries to override higher-priority instructions',
    severity: 'medium',
    pattern: /ignore (?:(?:all|any|the)\s+)?(?:previous|prior|above)\s+instructions?/i
  },
  {
    id: 'policy-override',
    description: 'tries to override system, developer, or safety instructions',
    severity: 'medium',
    pattern: /(?:disregard|ignore|override) (?:the )?(?:system|developer|safety) instructions?/i
  },
  {
    id: 'prompt-reveal',
    description: 'tries to reveal system prompts or hidden instructions',
    severity: 'medium',
    pattern: /reveal (?:(?:your|the)\s+)?(?:system prompt|hidden prompt|secrets?)/i
  },
  {
    id: 'guardrail-disable',
    description: 'tries to disable safety guardrails or approval',
    severity: 'high',
    pattern: /disable (?:safety|guardrails|approval)/i
  },
  {
    id: 'approval-bypass',
    description: 'tries to bypass approval or permission checks',
    severity: 'high',
    pattern: /bypass (?:approval|permission|safety)/i
  },
  {
    id: 'environment-dump',
    description: 'tries to dump environment variables or secret material',
    severity: 'high',
    pattern: /print (?:(?:all|the)\s+)?(?:environment variables|env(?:ironment)?(?: vars?)?|api keys?|tokens?|secrets?)/i
  },
  {
    id: 'secret-reveal-request',
    description: 'tries to reveal or expose secret material directly',
    severity: 'high',
    pattern: /(?:reveal|show|expose) (?:(?:the|your|all)\s+)?(?:api keys?|tokens?|secrets?|credentials?|passwords?|private keys?)/i
  },
  {
    id: 'secret-exfiltration',
    description: 'tries to exfiltrate secrets or tokens',
    severity: 'high',
    pattern: /(?:exfiltrat(?:e|ion)|export|dump|steal) (?:secrets?|tokens?|credentials?|api keys?)/i
  },
  {
    id: 'restart-without-approval',
    description: 'tries to restart live systems without approval',
    severity: 'high',
    pattern: /restart (?:the )?(?:gateway|service) without approval/i
  },
  {
    id: 'mode-escalation',
    description: 'tries to escalate authority or runtime mode',
    severity: 'medium',
    pattern: /you are now (?:in )?(?:developer mode|god mode|root mode)/i
  }
];

const APPROVAL_REQUIRED_SIGNAL_IDS = new Set(
  PROMPT_INJECTION_SIGNALS
    .filter(({ severity }) => severity === 'high')
    .map(({ id }) => id)
);

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

function inferHandlingRecommendation(riskClass) {
  if (riskClass === 'approval-required') return 'block-and-require-explicit-human-approval';
  if (riskClass === 'medium-risk') return 'route-to-maintainer-review-or-proposal';
  return 'auto-implement-if-local-checks-pass';
}

function buildBlockerDetail(id, severity, source, summary, evidence = {}) {
  return {
    id,
    severity,
    source,
    summary,
    evidence
  };
}

function buildBlockerDetails({
  injection,
  highSeverityInjection,
  touchesSecrets,
  restartsLiveSystems,
  destructive,
  externalEffects
}) {
  const details = [];

  if (injection.flagged) {
    details.push(buildBlockerDetail(
      'prompt-injection-risk',
      highSeverityInjection ? 'high' : 'medium',
      'prompt',
      highSeverityInjection
        ? 'Prompt matched suspicious instruction patterns, including high-severity injection signals.'
        : 'Prompt matched suspicious instruction-override or mode-escalation patterns.',
      {
        findings: injection.findings,
        matchedSignals: injection.matchedSignals,
        asksForSecrets: injection.asksForSecrets,
        riskScore: injection.riskScore
      }
    ));
  }

  if (highSeverityInjection) {
    details.push(buildBlockerDetail(
      'high-severity-prompt-injection-risk',
      'high',
      'prompt',
      'Prompt matched high-severity injection signals that should not auto-apply.',
      {
        matchedSignals: injection.matchedSignals.filter(({ id }) => APPROVAL_REQUIRED_SIGNAL_IDS.has(id))
      }
    ));
  }

  if (touchesSecrets) {
    details.push(buildBlockerDetail(
      'secret-handling-risk',
      'high',
      'touchesSecrets',
      'Change request touches secrets, credentials, auth material, or similarly sensitive inputs.',
      { touchesSecrets }
    ));
  }

  if (restartsLiveSystems) {
    details.push(buildBlockerDetail(
      'live-restart-risk',
      'high',
      'restartsLiveSystems',
      'Change request would restart live systems and should stay approval-gated.',
      { restartsLiveSystems }
    ));
  }

  if (destructive) {
    details.push(buildBlockerDetail(
      'destructive-change-risk',
      'high',
      'destructive',
      'Change request is destructive and should not auto-apply.',
      { destructive }
    ));
  }

  if (externalEffects) {
    details.push(buildBlockerDetail(
      'external-side-effect-risk',
      'high',
      'externalEffects',
      'Change request would cause external side effects and should stay approval-gated.',
      { externalEffects }
    ));
  }

  return details;
}

export function scanPromptInjection(text) {
  const value = typeof text === 'string' ? text : '';
  const matchedSignals = PROMPT_INJECTION_SIGNALS
    .filter(({ pattern }) => pattern.test(value))
    .map(({ id, description, severity }) => ({ id, description, severity }));

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
  const source = input && typeof input === 'object' ? input : {};
  const injection = scanPromptInjection(source.prompt ?? '');
  const touchesSecrets = Boolean(source.touchesSecrets);
  const restartsLiveSystems = Boolean(source.restartsLiveSystems);
  const destructive = Boolean(source.destructive);
  const externalEffects = Boolean(source.externalEffects);
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
    blockerDetails: buildBlockerDetails({
      injection,
      highSeverityInjection,
      touchesSecrets,
      restartsLiveSystems,
      destructive,
      externalEffects
    }),
    riskClass,
    approvalRequired: riskClass === 'approval-required',
    approvalBoundary: inferApprovalBoundary(riskClass),
    handlingRecommendation: inferHandlingRecommendation(riskClass),
    promptInjection: injection
  };
}
