#!/usr/bin/env node
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
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const commander_1 = require("commander");
const stage1_ast_scanner_1 = require("./pipeline/stage1_ast_scanner");
const stage2_synthesizer_1 = require("./pipeline/stage2_synthesizer");
const stage3_playwright_gen_1 = require("./pipeline/stage3_playwright_gen");
const console_report_1 = require("./formatters/console_report");
const pr_comment_1 = require("./formatters/pr_comment");
async function runAction() {
    const isGitHubAction = !!process.env.GITHUB_ACTIONS;
    if (isGitHubAction) {
        try {
            const targetPath = core.getInput('target-path') || 'src';
            const severityThreshold = parseInt(core.getInput('severity-threshold') || '2', 10);
            const generatePlaywright = core.getInput('generate-playwright') === 'true';
            const outputSpecDir = core.getInput('output-spec-dir') || 'e2e/heuristic-generated';
            const token = core.getInput('github-token');
            core.info(`[heuristic-lint-action] Scanning path: ${targetPath}`);
            // Stage 1: AST Scan
            const { filesScanned, defects } = (0, stage1_ast_scanner_1.executeStage1Scan)(targetPath);
            // Stage 2: Synthesis
            const report = (0, stage2_synthesizer_1.executeStage2Synthesis)(filesScanned, defects, severityThreshold);
            // Stage 3: Playwright Generation
            if (generatePlaywright && report.totalDefects > 0) {
                const specs = (0, stage3_playwright_gen_1.executeStage3PlaywrightGen)(report.defects, outputSpecDir);
                report.generatedPlaywrightSpecs = specs;
            }
            (0, console_report_1.printConsoleReport)(report);
            // Post PR comment if running in PR context
            if (token && github.context.payload.pull_request) {
                const octokit = github.getOctokit(token);
                const commentBody = (0, pr_comment_1.formatPrComment)(report);
                const { owner, repo } = github.context.repo;
                const issue_number = github.context.payload.pull_request.number;
                await octokit.rest.issues.createComment({
                    owner,
                    repo,
                    issue_number,
                    body: commentBody
                });
                core.info(`[heuristic-lint-action] Successfully posted review comment to PR #${issue_number}`);
            }
            if (report.defectsBySeverity[4] > 0 || report.defectsBySeverity[3] > 0) {
                core.setFailed(`Heuristic lint failed with ${report.totalDefects} actionable usability defects.`);
            }
        }
        catch (error) {
            core.setFailed(`Action execution failed: ${error.message}`);
        }
    }
    else {
        // Run as CLI
        const program = new commander_1.Command();
        program
            .name('heuristic-lint')
            .description('CLI tool for Shift-Left Usability Heuristic Static Linting and Playwright Test Generation')
            .version('1.0.0')
            .option('-p, --path <path>', 'Target directory to analyze', './src')
            .option('-s, --severity <level>', 'Minimum severity threshold (0-4)', '2')
            .option('--playwright', 'Generate Playwright specs for detected defects', true)
            .option('--output-specs <dir>', 'Output directory for generated specs', './e2e/heuristic-generated')
            .action((options) => {
            const targetPath = options.path;
            const sevThreshold = parseInt(options.severity, 10);
            console.log(`Analyzing codebase at: ${targetPath}...`);
            const { filesScanned, defects } = (0, stage1_ast_scanner_1.executeStage1Scan)(targetPath);
            const report = (0, stage2_synthesizer_1.executeStage2Synthesis)(filesScanned, defects, sevThreshold);
            if (options.playwright && report.totalDefects > 0) {
                report.generatedPlaywrightSpecs = (0, stage3_playwright_gen_1.executeStage3PlaywrightGen)(report.defects, options.outputSpecs);
            }
            (0, console_report_1.printConsoleReport)(report);
        });
        program.parse(process.argv);
    }
}
runAction();
