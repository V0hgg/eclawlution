export function buildChangeProposal(input) {
  return {
    title: input.title ?? 'Untitled proposal',
    summary: input.summary ?? '',
    scope: input.scope ?? [],
    rationale: input.rationale ?? [],
    risks: input.risks ?? [],
    approvalRequired: Boolean(input.approvalRequired),
    nextActions: input.nextActions ?? []
  };
}
