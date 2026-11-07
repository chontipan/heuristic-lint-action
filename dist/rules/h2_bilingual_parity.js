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
exports.checkBilingualParity = checkBilingualParity;
const ts = __importStar(require("typescript"));
function checkBilingualParity(sourceFile, filePath) {
    const defects = [];
    // Only check React view files (.tsx)
    if (!filePath.endsWith('.tsx'))
        return defects;
    function visit(node) {
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
