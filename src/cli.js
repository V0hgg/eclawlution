#!/usr/bin/env node
import fs from 'node:fs';
import { getEclawlutionManifest } from './index.js';
import { computeWorkflowScorecard } from './scorecard.js';
import { buildChangeProposal } from './proposal.js';
import { evaluateSecurityPosture } from './security.js';

const [, , command, file] = process.argv;

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

switch (command) {
  case 'manifest':
    console.log(JSON.stringify(getEclawlutionManifest(), null, 2));
    break;
  case 'scorecard':
    if (!file) throw new Error('Missing JSON file for scorecard');
    console.log(JSON.stringify(computeWorkflowScorecard(readJson(file)), null, 2));
    break;
  case 'proposal':
    if (!file) throw new Error('Missing JSON file for proposal');
    console.log(JSON.stringify(buildChangeProposal(readJson(file)), null, 2));
    break;
  case 'security':
    if (!file) throw new Error('Missing JSON file for security evaluation');
    console.log(JSON.stringify(evaluateSecurityPosture(readJson(file)), null, 2));
    break;
  default:
    console.log('Usage: eclawlution <manifest|scorecard|proposal|security> [json-file]');
}
