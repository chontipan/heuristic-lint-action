import { HeuristicDefect, LintReport } from '../types';

export function executeStage2Synthesis(
  filesScanned: number,
  rawDefects: HeuristicDefect[],
  severityThreshold: number = 2
): LintReport {
  // Deduplicate defects based on file + lineStart + ruleId
  const seen = new Set<string>();
  const deduplicated: HeuristicDefect[] = [];

  for (const d of rawDefects) {
    const key = `${d.file}:${d.lineStart}:${d.ruleId}`;
    if (!seen.has(key)) {
      seen.add(key);
      if (d.severity >= severityThreshold) {
        deduplicated.push(d);
      }
    }
  }

  const defectsBySeverity: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
  const defectsByHeuristic: Record<string, number> = {};

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
