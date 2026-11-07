import * as ts from 'typescript';
import { HeuristicDefect } from '../types';
export declare function runAllRules(sourceFile: ts.SourceFile, filePath: string): HeuristicDefect[];
