#!/usr/bin/env node

import * as core from '@actions/core';
import * as github from '@actions/github';
import { Command } from 'commander';
import { executeStage1Scan } from './pipeline/stage1_ast_scanner';
import { executeStage2Synthesis } from './pipeline/stage2_synthesizer';
import { executeStage3PlaywrightGen } from './pipeline/stage3_playwright_gen';
import { printConsoleReport } from './formatters/console_report';
import { formatPrComment } from './formatters/pr_comment';

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
      const { filesScanned, defects } = executeStage1Scan(targetPath);

      // Stage 2: Synthesis
      const report = executeStage2Synthesis(filesScanned, defects, severityThreshold);

      // Stage 3: Playwright Generation
      if (generatePlaywright && report.totalDefects > 0) {
        const specs = executeStage3PlaywrightGen(report.defects, outputSpecDir);
        report.generatedPlaywrightSpecs = specs;
      }

      printConsoleReport(report);

      // Post PR comment if running in PR context
      if (token && github.context.payload.pull_request) {
        const octokit = github.getOctokit(token);
        const commentBody = formatPrComment(report);
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
    } catch (error: any) {
      core.setFailed(`Action execution failed: ${error.message}`);
    }
  } else {
    // Run as CLI
    const program = new Command();
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
        const { filesScanned, defects } = executeStage1Scan(targetPath);
        const report = executeStage2Synthesis(filesScanned, defects, sevThreshold);

        if (options.playwright && report.totalDefects > 0) {
          report.generatedPlaywrightSpecs = executeStage3PlaywrightGen(report.defects, options.outputSpecs);
        }

        printConsoleReport(report);
      });

    program.parse(process.argv);
  }
}

runAction();
