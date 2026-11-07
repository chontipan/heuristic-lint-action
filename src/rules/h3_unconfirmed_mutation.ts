import * as ts from 'typescript';
import { HeuristicDefect } from '../types';

export function checkUnconfirmedMutation(
  sourceFile: ts.SourceFile,
  filePath: string
): HeuristicDefect[] {
  const defects: HeuristicDefect[] = [];

  function visit(node: ts.Node) {
    // Check for delete / remove functions invoked directly in onClick without confirm modal
    if (ts.isJsxAttribute(node)) {
      const name = node.name.getText(sourceFile);
      if (name === 'onClick') {
        const text = node.getText(sourceFile);
        if (
          (text.includes('delete') || text.includes('remove') || text.includes('destroy')) &&
          !text.includes('confirm') &&
          !text.includes('Dialog') &&
          !text.includes('Modal')
        ) {
          const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          defects.push({
            id: `HL-H3-${defects.length + 1}`,
            ruleId: 'H3_UNCONFIRMED_DESTRUCTIVE_ACTION',
            heuristic: 'H3: User Control and Freedom',
            typology: 'T5: Data Mutation & Irreversible Action',
            file: filePath,
            lineStart: line + 1,
            lineEnd: line + 1,
            snippet: text.slice(0, 100),
            severity: 3,
            title: 'Destructive Action Lacks Confirmation Dialog or Undo Mechanism',
            description:
              'Click handler executes irreversible deletion or row removal without an intervening confirmation dialog or undo toast guarantee, violating user control.',
            remediation:
              'Require confirmation dialog (e.g. <AlertDialog>) or emit an optimistic notification containing an "Undo" action trigger.',
            playwrightAssertion: `await page.click('button[aria-label="Delete"]');\nawait expect(page.locator('role=dialog')).toBeVisible();`
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return defects;
}
