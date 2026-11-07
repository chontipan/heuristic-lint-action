"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeStage2Synthesis = executeStage2Synthesis;
function executeStage2Synthesis(filesScanned, rawDefects, severityThreshold = 2) {
    // Deduplicate defects based on file + lineStart + ruleId
    const seen = new Set();
    const deduplicated = [];
    for (const d of rawDefects) {
        const key = `${d.file}:${d.lineStart}:${d.ruleId}`;
        if (!seen.has(key)) {
            seen.add(key);
            if (d.severity >= severityThreshold) {
                deduplicated.push(d);
            }
        }
    }
    const defectsBySeverity = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    const defectsByHeuristic = {};
    for (const d of deduplicated) {
        defectsBySeverity[d.severity] = (defectsBySeverity[d.severity] || 0) + 1;
        defectsByHeuristic[d.heuristic] = (defectsByHeuristic[d.heuristic] || 0) + 1;
    }
    return {
        timestamp: new Date().toISOString(),
        filesScanned,
        totalDefects: deduplicated.length,
        defectsBySeverity,
        defectsByHeuristic,
        defects: deduplicated
    };
}
