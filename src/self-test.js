import assert from 'node:assert/strict';
import { getEclawlutionManifest } from './index.js';
import { computeWorkflowScorecard } from './scorecard.js';
import { buildChangeProposal } from './proposal.js';

const manifest = getEclawlutionManifest();
assert.equal(manifest.name, 'eclawlution');
assert.equal(manifest.version, '0.2.0');
assert.ok(manifest.loops.selfEvolution);

const scorecard = computeWorkflowScorecard({
  name: 'daily-digest',
  usefulness: 9,
  noise: 3,
  timingFit: 8,
  userFit: 9,
  maintainability: 7,
  surpriseCost: 2
});
assert.equal(scorecard.name, 'daily-digest');
assert.ok(scorecard.overall > 0);
assert.ok(Array.isArray(scorecard.recommendations));

const proposal = buildChangeProposal({
  title: 'Move digest later',
  approvalRequired: false,
  nextActions: ['update cron schedule']
});
assert.equal(proposal.title, 'Move digest later');
assert.equal(proposal.approvalRequired, false);

console.log(JSON.stringify({ manifest, scorecard, proposal }, null, 2));
