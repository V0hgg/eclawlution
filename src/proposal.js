const VALID_RISK_CLASSES = new Set(['safe-local', 'medium-risk', 'approval-required']);
const VALID_APPROVAL_BOUNDARIES = new Set(['auto-implementable', 'maintainer-review', 'explicit-human-approval']);
const VALID_PROPOSAL_STATUSES = new Set(['draft', 'proposed', 'approved', 'implemented', 'rejected', 'superseded']);

const RISK_CLASS_ORDER = {
  'safe-local': 0,
  'medium-risk': 1,
  'approval-required': 2
};

const APPROVAL_BOUNDARY_ORDER = {
  'auto-implementable': 0,
  'maintainer-review': 1,
  'explicit-human-approval': 2
};

function normalizeText(value, fallback = '') {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeText(item))
      .filter(Boolean);
  }

  const single = normalizeText(value);
  return single ? [single] : [];
}

function normalizeRiskClass(value) {
  const normalized = normalizeText(value).toLowerCase();
  return VALID_RISK_CLASSES.has(normalized) ? normalized : 'safe-local';
}

function normalizeApprovalBoundary(value) {
  const normalized = normalizeText(value).toLowerCase();
  return VALID_APPROVAL_BOUNDARIES.has(normalized) ? normalized : '';
}

function normalizeProposalStatus(value) {
  const normalized = normalizeText(value).toLowerCase();
  return VALID_PROPOSAL_STATUSES.has(normalized) ? normalized : 'draft';
}

function maxRiskClass(...values) {
  return values.reduce((highest, value) => {
    const normalized = normalizeRiskClass(value);
    return RISK_CLASS_ORDER[normalized] > RISK_CLASS_ORDER[highest] ? normalized : highest;
  }, 'safe-local');
}

function inferApprovalBoundary(riskClass) {
  if (riskClass === 'approval-required') return 'explicit-human-approval';
  if (riskClass === 'medium-risk') return 'maintainer-review';
  return 'auto-implementable';
}

function clampApprovalBoundary(requestedBoundary, riskClass) {
  const minimumBoundary = inferApprovalBoundary(riskClass);
  const normalizedRequestedBoundary = normalizeApprovalBoundary(requestedBoundary);

  if (!normalizedRequestedBoundary) {
    return minimumBoundary;
  }

  return APPROVAL_BOUNDARY_ORDER[normalizedRequestedBoundary] >= APPROVAL_BOUNDARY_ORDER[minimumBoundary]
    ? normalizedRequestedBoundary
    : minimumBoundary;
}

function defaultRollbackPlan(scope) {
  const scopeLabel = scope.length > 0 ? scope.join(', ') : 'the proposed change';
  return [
    `revert ${scopeLabel} to the last known-good state`,
    're-run the affected local checks after reverting'
  ];
}

export function buildChangeProposal(input) {
  const source = input && typeof input === 'object' ? input : {};
  const securityPosture = source.securityPosture && typeof source.securityPosture === 'object'
    ? source.securityPosture
    : {};
  const title = normalizeText(source.title, 'Untitled proposal');
  const summary = normalizeText(source.summary);
  const scope = normalizeList(source.scope);
  const rationale = normalizeList(source.rationale);
  const risks = normalizeList(source.risks);
  const validationChecks = normalizeList(source.validationChecks);
  const nextActions = normalizeList(source.nextActions);
  const requestedApproval = Boolean(source.approvalRequired);
  const riskyFlagsPresent = Boolean(
    source.touchesSecrets
    || source.restartsLiveSystems
    || source.destructive
    || source.externalEffects
  );

  const riskClass = maxRiskClass(
    source.riskClass,
    requestedApproval ? 'approval-required' : 'safe-local',
    riskyFlagsPresent ? 'approval-required' : 'safe-local',
    securityPosture.riskClass
  );

  const rollbackPlan = normalizeList(source.rollbackPlan);

  return {
    title,
    summary,
    humanSummary: normalizeText(source.humanSummary, summary || title),
    status: normalizeProposalStatus(source.status),
    scope,
    rationale,
    risks,
    riskClass,
    approvalRequired: riskClass === 'approval-required',
    approvalBoundary: clampApprovalBoundary(source.approvalBoundary, riskClass),
    rollbackPlan: rollbackPlan.length > 0 ? rollbackPlan : defaultRollbackPlan(scope),
    validationChecks,
    nextActions
  };
}
