"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAllRules = runAllRules;
const h1_unhandled_async_1 = require("./h1_unhandled_async");
const h2_bilingual_parity_1 = require("./h2_bilingual_parity");
const h3_unconfirmed_mutation_1 = require("./h3_unconfirmed_mutation");
const h5_zod_dom_alignment_1 = require("./h5_zod_dom_alignment");
function runAllRules(sourceFile, filePath) {
    const allDefects = [];
    try {
        allDefects.push(...(0, h1_unhandled_async_1.checkUnhandledAsync)(sourceFile, filePath));
        allDefects.push(...(0, h2_bilingual_parity_1.checkBilingualParity)(sourceFile, filePath));
        allDefects.push(...(0, h3_unconfirmed_mutation_1.checkUnconfirmedMutation)(sourceFile, filePath));
        allDefects.push(...(0, h5_zod_dom_alignment_1.checkZodDomAlignment)(sourceFile, filePath));
    }
    catch (err) {
        console.warn(`[heuristic-lint] Warning parsing ${filePath}:`, err);
    }
    return allDefects;
}
