import * as ts from 'typescript';
import { HeuristicDefect } from '../types';
export declare function checkUnconfirmedMutation(sourceFile: ts.SourceFile, filePath: string): HeuristicDefect[];
