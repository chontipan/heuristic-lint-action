import * as ts from 'typescript';
import { HeuristicDefect } from '../types';
export declare function checkBilingualParity(sourceFile: ts.SourceFile, filePath: string): HeuristicDefect[];
