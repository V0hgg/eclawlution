const VALID_RISK_CLASSES = new Set(['safe-local', 'medium-risk', 'approval-required']);

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

function inferApprovalBoundary(riskClass) {
  if (riskClass === 'approval-required') return 'explicit-human-approval';
  if (riskClass === 'medium-risk') return 'maintainer-review';
  return 'auto-implementable';
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
  const title = normalizeText(source.title, 'Untitled proposal');
  const summary = normalizeText(source.summary);
  const scope = normalizeList(source.scope);
  const rationale = normalizeList(source.rationale);
  const risks = normalizeList(source.risks);
  const validationChecks = normalizeList(source.validationChecks);
  const nextActions = normalizeList(source.nextActions);
  const requestedApproval = Boolean(source.approvalRequired);

  let riskClass = normalizeRiskClass(source.riskClass);
  if (requestedApproval && riskClass !== 'approval-required') {
    riskClass = 'approval-required';
  }

  const rollbackPlan = normalizeList(source.rollbackPlan);

  return {
    title,
    summary,
    humanSummary: normalizeText(source.humanSummary, summary || title),
    scope,
    rationale,
    risks,
    riskClass,
    approvalRequired: riskClass === 'approval-required',
    approvalBoundary: normalizeText(source.approvalBoundary, inferApprovalBoundary(riskClass)),
    rollbackPlan: rollbackPlan.length > 0 ? rollbackPlan : defaultRollbackPlan(scope),
    validationChecks,
    nextActions
  };
}
