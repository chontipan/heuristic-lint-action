import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { HeuristicDefect } from '../types';
import { runAllRules } from '../rules/ruleRegistry';

export function scanDirectory(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        scanDirectory(fullPath, fileList);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

export function executeStage1Scan(targetDir: string): { filesScanned: number; defects: HeuristicDefect[] } {
  const files = scanDirectory(targetDir);
  const allDefects: HeuristicDefect[] = [];

  for (const filePath of files) {
    const code = fs.readFileSync(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      filePath,
      code,
      ts.ScriptTarget.Latest,
      true,
      filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    const fileDefects = runAllRules(sourceFile, filePath);
    allDefects.push(...fileDefects);
  }

  return {
    filesScanned: files.length,
    defects: allDefects
  };
}
