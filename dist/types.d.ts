export type NielsenHeuristic = 'H1: Visibility of System Status' | 'H2: Match Between System and Real World' | 'H3: User Control and Freedom' | 'H4: Consistency and Standards' | 'H5: Error Prevention' | 'H6: Recognition Rather Than Recall' | 'H7: Flexibility and Efficiency of Use' | 'H8: Aesthetic and Minimalist Design' | 'H9: Help Users Recognize, Diagnose, and Recover from Errors' | 'H10: Help and Documentation';
export type DefectTypology = 'T1: Asynchronous State & Error Feedback' | 'T2: Navigation & Workflow Continuance' | 'T3: Bilingual Consistency & Localization' | 'T4: Layout Hierarchy & Responsive Overflow' | 'T5: Data Mutation & Irreversible Action' | 'T6: Form Input Affordance & Validation Timing' | 'T7: Contextual Documentation & Helper Guidance';
export interface HeuristicDefect {
    id: string;
    ruleId: string;
    heuristic: NielsenHeuristic;
    typology: DefectTypology;
    file: string;
    lineStart: number;
    lineEnd: number;
    snippet: string;
    severity: 0 | 1 | 2 | 3 | 4;
    title: string;
    description: string;
    remediation: string;
    playwrightAssertion?: string;
}
export interface RuleResult {
    ruleId: string;
    passed: boolean;
    defects: HeuristicDefect[];
}
export interface LintReport {
    timestamp: string;
    filesScanned: number;
    totalDefects: number;
    defectsBySeverity: Record<number, number>;
    defectsByHeuristic: Record<string, number>;
    defects: HeuristicDefect[];
    generatedPlaywrightSpecs?: string[];
}
