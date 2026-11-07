import * as ts from 'typescript';
import { HeuristicDefect } from '../types';
export declare function checkUnhandledAsync(sourceFile: ts.SourceFile, filePath: string): HeuristicDefect[];
