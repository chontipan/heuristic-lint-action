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
exports.checkUnhandledAsync = checkUnhandledAsync;
const ts = __importStar(require("typescript"));
function checkUnhandledAsync(sourceFile, filePath) {
    const defects = [];
    function visit(node) {
        // Check for Promise calls without .catch or try/catch in event handlers
        if (ts.isCallExpression(node)) {
            const text = node.getText(sourceFile);
            // Pattern: exportReport() / generateExcel() / downloadData() called without catch
            if ((text.includes('export') || text.includes('download') || text.includes('mutate')) &&
                !text.includes('.catch')) {
                // Check if enclosed in try-catch
                let parent = node.parent;
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
                        description: 'Asynchronous operation is executed without user-visible error handling (.catch or try/catch), risking silent failure and leaving users stranded without feedback.',
                        remediation: 'Wrap async call in try-catch and display user-facing Toast notification upon failure with error recovery action.',
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
