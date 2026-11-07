const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { executeStage1Scan } = require('../dist/pipeline/stage1_ast_scanner');
const { executeStage2Synthesis } = require('../dist/pipeline/stage2_synthesizer');
const { executeStage3PlaywrightGen } = require('../dist/pipeline/stage3_playwright_gen');

test('Stage 1: AST Scanner correctly flags heuristic violations in test fixtures', (t) => {
  const fixtureDir = path.join(__dirname, '../test-fixtures');
  const { filesScanned, defects } = executeStage1Scan(fixtureDir);

  assert.strictEqual(filesScanned >= 1, true, 'Should scan at least 1 file');
  assert.strictEqual(defects.length >= 3, true, 'Should detect at least 3 candidate defects');

  // Check H2 Bilingual
  const h2Defect = defects.find(d => d.ruleId === 'H2_HARDCODED_I18N_STRING');
  assert.ok(h2Defect, 'Should detect H2 hardcoded i18n string');
  assert.strictEqual(h2Defect.heuristic, 'H2: Match Between System and Real World');

  // Check H5 Zod-DOM alignment
  const h5Defect = defects.find(d => d.ruleId === 'H5_SCHEMA_DOM_ALIGNMENT_GAP');
  assert.ok(h5Defect, 'Should detect H5 schema-DOM alignment gap');
  assert.strictEqual(h5Defect.severity, 3, 'H5 schema disconnect should have severity 3');
});

test('Stage 2: Synthesizer deduplicates and aggregates defects by severity', (t) => {
  const fixtureDir = path.join(__dirname, '../test-fixtures');
  const { filesScanned, defects } = executeStage1Scan(fixtureDir);
  const report = executeStage2Synthesis(filesScanned, defects, 2);

  assert.strictEqual(report.totalDefects, 3);
  assert.strictEqual(report.defectsBySeverity[3], 1, 'Should have 1 major defect');
  assert.strictEqual(report.defectsBySeverity[2], 2, 'Should have 2 medium defects');
});

test('Stage 3: Playwright Generator produces executable E2E affordance specs', (t) => {
  const fixtureDir = path.join(__dirname, '../test-fixtures');
  const outputDir = path.join(__dirname, '../e2e/test-output');
  const { filesScanned, defects } = executeStage1Scan(fixtureDir);
  const report = executeStage2Synthesis(filesScanned, defects, 2);

  const generatedSpecs = executeStage3PlaywrightGen(report.defects, outputDir);
  assert.strictEqual(generatedSpecs.length >= 2, true, 'Should generate at least 2 Playwright specs');
  assert.ok(generatedSpecs.some(s => s.includes('heuristic_h5_schema_dom_alignment_gap.spec.ts')));
});
