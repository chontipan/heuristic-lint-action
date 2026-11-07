import * as ts from 'typescript';
import { HeuristicDefect } from '../types';

export function checkUnhandledAsync(
  sourceFile: ts.SourceFile,
  filePath: string
): HeuristicDefect[] {
  const defects: HeuristicDefect[] = [];

  function visit(node: ts.Node) {
    // Check for Promise calls without .catch or try/catch in event handlers
    if (ts.isCallExpression(node)) {
      const text = node.getText(sourceFile);
      // Pattern: exportReport() / generateExcel() / downloadData() called without catch
      if (
        (text.includes('export') || text.includes('download') || text.includes('mutate')) &&
        !text.includes('.catch')
      ) {
        // Check if enclosed in try-catch
        let parent: ts.Node | undefined = node.parent;
        let enclosedInTry = false;
        while (parent) {
          if (ts.isTryStatement(parent)) {
            enclosedInTry = true;
            break;
          }
          parent = parent.parent;
        }

        if (!enclosedInTry && (text.includes('await') || text.includes('.then('))) {
          const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          const lineEnd = sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line;
          defects.push({
            id: `HL-H1-${defects.length + 1}`,
            ruleId: 'H1_UNHANDLED_ASYNC_STATE',
            heuristic: 'H1: Visibility of System Status',
            typology: 'T1: Asynchronous State & Error Feedback',
            file: filePath,
            lineStart: line + 1,
            lineEnd: lineEnd + 1,
            snippet: node.getText(sourceFile).slice(0, 120),
            severity: 3,
            title: 'Silent Asynchronous Operation Without Loading/Error Feedback',
            description:
              'Asynchronous operation is executed without user-visible error handling (.catch or try/catch), risking silent failure and leaving users stranded without feedback.',
            remediation:
              'Wrap async call in try-catch and display user-facing Toast notification upon failure with error recovery action.',
            playwrightAssertion: `await page.route('**/api/**', route => route.abort());\nawait page.click('button:has-text("Export")');\nawait expect(page.locator('.toast-error')).toBeVisible();`
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return defects;
}
