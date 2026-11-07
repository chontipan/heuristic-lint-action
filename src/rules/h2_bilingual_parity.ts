import * as ts from 'typescript';
import { HeuristicDefect } from '../types';

export function checkBilingualParity(
  sourceFile: ts.SourceFile,
  filePath: string
): HeuristicDefect[] {
  const defects: HeuristicDefect[] = [];

  // Only check React view files (.tsx)
  if (!filePath.endsWith('.tsx')) return defects;

  function visit(node: ts.Node) {
    // Check JSX text containing raw hardcoded English words that should use t('key')
    if (ts.isJsxText(node)) {
      const text = node.getText(sourceFile).trim();
      const rawEnglishPattern = /^(Submit|Cancel|Save|Delete|Download|Export|Member|Total|Search|Edit|Role|Status|Checkout|Cart|Pay|Order)$/i;
      if (rawEnglishPattern.test(text)) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        defects.push({
          id: `HL-H2-${defects.length + 1}`,
          ruleId: 'H2_HARDCODED_I18N_STRING',
          heuristic: 'H2: Match Between System and Real World',
          typology: 'T3: Bilingual Consistency & Localization',
          file: filePath,
          lineStart: line + 1,
          lineEnd: line + 1,
          snippet: text,
          severity: 2,
          title: 'Hardcoded Raw English String Bypassing i18n Translation',
          description: `Literal string "${text}" is hardcoded in JSX markup rather than referencing the localization dictionary (locales/th.ts), causing language desynchronization in bilingual municipal views.`,
          remediation: `Replace literal string with translation key call: {t('common.${text.toLowerCase()}')}.`,
          playwrightAssertion: `await page.click('[data-testid="lang-switch-th"]');\nawait expect(page.locator('text="${text}"')).toHaveCount(0);`
        });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return defects;
}
