import * as ts from 'typescript';
import { HeuristicDefect } from '../types';

export function checkZodDomAlignment(
  sourceFile: ts.SourceFile,
  filePath: string
): HeuristicDefect[] {
  const defects: HeuristicDefect[] = [];

  // Check JSX elements with type="number" lacking min attribute
  if (!filePath.endsWith('.tsx')) return defects;

  function visit(node: ts.Node) {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const tagName = node.tagName.getText(sourceFile);
      if (tagName === 'input' || tagName === 'Input') {
        let isNumberType = false;
        let hasMinAttr = false;

        for (const attr of node.attributes.properties) {
          if (ts.isJsxAttribute(attr)) {
            const attrName = attr.name.getText(sourceFile);
            const attrVal = attr.initializer?.getText(sourceFile) || '';
            if (attrName === 'type' && attrVal.includes('number')) {
              isNumberType = true;
            }
            if (attrName === 'min') {
              hasMinAttr = true;
            }
          }
        }

        if (isNumberType && !hasMinAttr) {
          const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          defects.push({
            id: `HL-H5-${defects.length + 1}`,
            ruleId: 'H5_SCHEMA_DOM_ALIGNMENT_GAP',
            heuristic: 'H5: Error Prevention',
            typology: 'T6: Form Input Affordance & Validation Timing',
            file: filePath,
            lineStart: line + 1,
            lineEnd: line + 1,
            snippet: node.getText(sourceFile).slice(0, 100),
            severity: 3,
            title: 'Numeric Input Missing HTML min Attribute (Zod Disconnect)',
            description:
              'Numeric input field omits HTML attribute min={0}. While backend Zod DTO schemas prevent negative database writes, the client-side DOM affordance permits negative character entry (-), failing shift-left error prevention.',
            remediation:
              'Explicitly add HTML affordance min={0} and onKeyDown={(e) => e.key === "-" && e.preventDefault()} to align DOM affordances directly with backend Zod validation.',
            playwrightAssertion: `const input = page.locator('input[type="number"]');\nawait input.fill('-50');\nawait expect(input).not.toHaveValue('-50');`
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return defects;
}
