import * as ts from 'typescript';
import { HeuristicDefect } from '../types';
import { checkUnhandledAsync } from './h1_unhandled_async';
import { checkBilingualParity } from './h2_bilingual_parity';
import { checkUnconfirmedMutation } from './h3_unconfirmed_mutation';
import { checkZodDomAlignment } from './h5_zod_dom_alignment';

export function runAllRules(sourceFile: ts.SourceFile, filePath: string): HeuristicDefect[] {
  const allDefects: HeuristicDefect[] = [];

  try {
    allDefects.push(...checkUnhandledAsync(sourceFile, filePath));
    allDefects.push(...checkBilingualParity(sourceFile, filePath));
    allDefects.push(...checkUnconfirmedMutation(sourceFile, filePath));
    allDefects.push(...checkZodDomAlignment(sourceFile, filePath));
  } catch (err) {
    console.warn(`[heuristic-lint] Warning parsing ${filePath}:`, err);
  }

  return allDefects;
}
