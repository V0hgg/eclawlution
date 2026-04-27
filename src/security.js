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

const SECRET_ACCESS_VERB_PATTERNS = [
  /\b(?:reveal|show|expose|print|dump|export|steal|list|read|display|return|copy|leak)\b/i
];

const SECRET_TARGET_PATTERNS = [
  /api[_ -]?keys?/i,
  /tokens?/i,
  /secrets?/i,
  /passwords?/i,
  /credentials?/i,
  /ssh(?:\s+private)?\s+keys?/i,
  /private keys?/i,
  /environment variables?/i,
  /env(?:ironment)?(?: vars?)?/i
];

const TEXT_SURFACE_FIELDS = [
  'prompt',
  'title',
  'summary',
  'humanSummary'
];

const TEXT_SURFACE_LIST_FIELDS = [
  'scope',
  'rationale',
  'risks',
  'validationChecks',
  'nextActions',
  'notes'
];

function normalizeSurfaceText(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function buildSurfaceLabel(field, index) {
  return Number.isInteger(index) ? `${field}[${index}]` : field;
}

function collectPromptInjectionTextSurfaces(source) {
  const surfaces = [];

  for (const field of TEXT_SURFACE_FIELDS) {
    const value = normalizeSurfaceText(source[field]);
    if (!value) continue;

    surfaces.push({
      field,
      label: buildSurfaceLabel(field),
      value
    });
  }

  for (const field of TEXT_SURFACE_LIST_FIELDS) {
    const value = source[field];

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const normalized = normalizeSurfaceText(item);
        if (!normalized) return;

        surfaces.push({
          field,
          index,
          label: buildSurfaceLabel(field, index),
          value: normalized
        });
      });

      continue;
    }

    const normalized = normalizeSurfaceText(value);
    if (!normalized) continue;

    surfaces.push({
      field,
      label: buildSurfaceLabel(field),
      value: normalized
    });
  }

  return surfaces;
}

function scanPromptInjectionSurfaces(input) {
  const surfaces = collectPromptInjectionTextSurfaces(input);
  const findings = new Set();
  const matchedSignals = new Map();
  const flaggedSurfaces = [];
  let asksForSecrets = false;

  for (const surface of surfaces) {
    const scan = scanPromptInjection(surface.value);

    scan.findings.forEach((finding) => findings.add(finding));
    scan.matchedSignals.forEach((signal) => {
      if (!matchedSignals.has(signal.id)) {
        matchedSignals.set(signal.id, signal);
      }
    });

    asksForSecrets ||= scan.asksForSecrets;

    if (!scan.flagged) continue;

    flaggedSurfaces.push({
      field: surface.field,
      index: surface.index,
      label: surface.label,
      findings: scan.findings,
      matchedSignals: scan.matchedSignals,
      asksForSecrets: scan.asksForSecrets
    });
  }

  return {
    flagged: flaggedSurfaces.length > 0,
    riskScore: Math.min(10, findings.size * 2 + (asksForSecrets ? 2 : 0)),
    findings: [...findings],
    matchedSignals: [...matchedSignals.values()],
    asksForSecrets,
    surfacesScanned: surfaces.map(({ field, index, label }) => ({ field, index, label })),
    flaggedSurfaces
  };
}

function requestsSensitiveMaterial(text) {
  return SECRET_ACCESS_VERB_PATTERNS.some((pattern) => pattern.test(text))
    && SECRET_TARGET_PATTERNS.some((pattern) => pattern.test(text));
}

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

function summarizePromptInjection(injection, highSeverityInjection) {
  if (highSeverityInjection) {
    return 'Change request text matched suspicious instruction patterns, including high-severity injection or sensitive-material access signals.';
  }

  if (injection.findings.length > 0) {
    return 'Change request text matched suspicious instruction-override or mode-escalation patterns.';
  }

  if (injection.asksForSecrets) {
    return 'Change request text asks to reveal, list, or otherwise expose sensitive material.';
  }

  return 'Change request text matched suspicious prompt-injection signals.';
}

function buildHighSeverityPromptInjectionEvidence(injection) {
  return {
    matchedSignals: injection.matchedSignals.filter(({ id }) => APPROVAL_REQUIRED_SIGNAL_IDS.has(id)),
    asksForSecrets: injection.asksForSecrets,
    flaggedSurfaces: injection.flaggedSurfaces.filter(({ asksForSecrets, matchedSignals: surfaceSignals }) => (
      asksForSecrets || surfaceSignals.some(({ id }) => APPROVAL_REQUIRED_SIGNAL_IDS.has(id))
    ))
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
      'prompt-or-text-surface',
      summarizePromptInjection(injection, highSeverityInjection),
      {
        findings: injection.findings,
        matchedSignals: injection.matchedSignals,
        asksForSecrets: injection.asksForSecrets,
        riskScore: injection.riskScore,
        flaggedSurfaces: injection.flaggedSurfaces,
        surfacesScanned: injection.surfacesScanned
      }
    ));
  }

  if (highSeverityInjection) {
    details.push(buildBlockerDetail(
      'high-severity-prompt-injection-risk',
      'high',
      'prompt-or-text-surface',
      injection.asksForSecrets
        ? 'Change request text asked to reveal or expose sensitive material and should not auto-apply.'
        : 'Change request text matched high-severity injection signals that should not auto-apply.',
      buildHighSeverityPromptInjectionEvidence(injection)
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
  const asksForSecrets = requestsSensitiveMaterial(value);
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
  const injection = scanPromptInjectionSurfaces(source);
  const touchesSecrets = Boolean(source.touchesSecrets);
  const restartsLiveSystems = Boolean(source.restartsLiveSystems);
  const destructive = Boolean(source.destructive);
  const externalEffects = Boolean(source.externalEffects);
  const highSeverityInjection = injection.asksForSecrets
    || injection.findings.some((id) => APPROVAL_REQUIRED_SIGNAL_IDS.has(id));

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
