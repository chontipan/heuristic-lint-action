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
exports.checkZodDomAlignment = checkZodDomAlignment;
const ts = __importStar(require("typescript"));
function checkZodDomAlignment(sourceFile, filePath) {
    const defects = [];
    // Check JSX elements with type="number" lacking min attribute
    if (!filePath.endsWith('.tsx'))
        return defects;
    function visit(node) {
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
                        description: 'Numeric input field omits HTML attribute min={0}. While backend Zod DTO schemas prevent negative database writes, the client-side DOM affordance permits negative character entry (-), failing shift-left error prevention.',
                        remediation: 'Explicitly add HTML affordance min={0} and onKeyDown={(e) => e.key === "-" && e.preventDefault()} to align DOM affordances directly with backend Zod validation.',
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
