"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printConsoleReport = printConsoleReport;
function printConsoleReport(report) {
    console.log('\n======================================================');
    console.log('🛡️  HEURISTIC LINT ACTION: SHIFT-LEFT AUDIT REPORT');
    console.log('======================================================');
    console.log(`Timestamp:     ${report.timestamp}`);
    console.log(`Files Scanned: ${report.filesScanned}`);
    console.log(`Total Defects: ${report.totalDefects}`);
    console.log('------------------------------------------------------');
    if (report.totalDefects === 0) {
        console.log('✅ PASS: No heuristic violations detected.');
        console.log('======================================================\n');
        return;
    }
    for (const d of report.defects) {
        const sevLabel = `[SEV ${d.severity}]`;
        console.log(`\n${sevLabel} ${d.id}: ${d.title}`);
        console.log(`  File:      ${d.file}:${d.lineStart}`);
        console.log(`  Heuristic: ${d.heuristic}`);
        console.log(`  Issue:     ${d.description}`);
        console.log(`  Fix:       ${d.remediation}`);
    }
    if (report.generatedPlaywrightSpecs && report.generatedPlaywrightSpecs.length > 0) {
        console.log('\n------------------------------------------------------');
        console.log(`🎭 Generated Playwright Test Specs:`);
        for (const spec of report.generatedPlaywrightSpecs) {
            console.log(`  - ${spec}`);
        }
    }
    console.log('======================================================\n');
}
