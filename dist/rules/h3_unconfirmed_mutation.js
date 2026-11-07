"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUnconfirmedMutation = checkUnconfirmedMutation;
const ts = __importStar(require("typescript"));
function checkUnconfirmedMutation(sourceFile, filePath) {
    const defects = [];
    function visit(node) {
        // Check for delete / remove functions invoked directly in onClick without confirm modal
        if (ts.isJsxAttribute(node)) {
            const name = node.name.getText(sourceFile);
            if (name === 'onClick') {
                const text = node.getText(sourceFile);
                if ((text.includes('delete') || text.includes('remove') || text.includes('destroy')) &&
                    !text.includes('confirm') &&
                    !text.includes('Dialog') &&
                    !text.includes('Modal')) {
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
                        description: 'Click handler executes irreversible deletion or row removal without an intervening confirmation dialog or undo toast guarantee, violating user control.',
                        remediation: 'Require confirmation dialog (e.g. <AlertDialog>) or emit an optimistic notification containing an "Undo" action trigger.',
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
