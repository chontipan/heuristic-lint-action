import { HeuristicDefect } from '../types';
export declare function scanDirectory(dir: string, fileList?: string[]): string[];
export declare function executeStage1Scan(targetDir: string): {
    filesScanned: number;
    defects: HeuristicDefect[];
};
