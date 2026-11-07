import * as ts from 'typescript';
import { HeuristicDefect } from '../types';
export declare function checkZodDomAlignment(sourceFile: ts.SourceFile, filePath: string): HeuristicDefect[];
