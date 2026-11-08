# 🛡️ Heuristic Lint Action (`heuristic-lint-action`)

> **Shift-Left Usability Heuristic Static Linter & Playwright E2E Generator for CI/CD Pipelines**  
> Operationalizing the **Three-Stage Triangulation Architecture** from the research paper:  
> *"White-Box LLM Agents Versus Human Evaluators: Shift-Left Usability Heuristic Evaluation on a Bilingual E-Government Platform"*

[![CI](https://github.com/chontipan/heuristic-lint-action/actions/workflows/ci.yml/badge.svg)](https://github.com/chontipan/heuristic-lint-action/actions/workflows/ci.yml)
[![GitHub Action](https://img.shields.io/badge/GitHub%20Action-v1.0-blue.svg)](https://github.com/chontipan/heuristic-lint-action)
[![Nielsen Heuristics](https://img.shields.io/badge/Heuristics-Nielsen%2010-orange.svg)](https://www.nngroup.com/articles/ten-usability-heuristics/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E%20Synthesis-green.svg)](https://playwright.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Overview

Traditional heuristic evaluation is conducted manually at the end of the software development lifecycle, leading to costly late-stage rework. While Large Language Models (LLMs) can inspect source code upstream during pull requests, they naturally inspect static syntax contracts (e.g., Zod schemas and locale dictionaries) rather than runtime browser affordances.

`heuristic-lint-action` operationalizes our **Three-Stage Triangulation Pipeline**:
1. **Stage 1 (AST Semantic Sweep):** Statically analyzes TypeScript and React component ASTs for structural violations of Nielsen's heuristics (missing error boundaries, silent async failures, unconfirmed destructive actions, and schema-to-DOM mismatches).
2. **Stage 2 (Defect Synthesis & Deduplication):** Deduplicates findings, assigns calibrated severity ratings (0–4 scale), and posts actionable inline PR review comments.
3. **Stage 3 (Automated Playwright Generation):** Automatically generates Playwright E2E assertion specs that execute against the deployed staging environment to verify whether runtime DOM affordances align with backend validation schemas.

---

## 🏗️ Architecture

```
                 [ Pull Request / Push Event ]
                               │
                               ▼
   ┌──────────────────────────────────────────────────────────┐
   │  Stage 1: AST Semantic Static Sweep                      │
   │  - H1: Unhandled async mutations & export omissions      │
   │  - H2: Hardcoded strings bypassing i18n dictionaries     │
   │  - H3: Unconfirmed row deletions & irreversible actions  │
   │  - H5: Zod .min(0) schema vs. DOM <input> alignment      │
   └───────────────────────────┬──────────────────────────────┘
                               │
                               ▼
   ┌──────────────────────────────────────────────────────────┐
   │  Stage 2: Heuristic Defect Synthesizer                   │
   │  - Deduplicates findings across files and component ASTs │
   │  - Assigns severity scores (0: Cosmetic to 4: Disaster)  │
   │  - Posts formatted PR markdown review comments           │
   └───────────────────────────┬──────────────────────────────┘
                               │
                               ▼
   ┌──────────────────────────────────────────────────────────┐
   │  Stage 3: Automated Playwright Affordance Generation     │
   │  - Generates *.spec.ts test suites for live DOM testing  │
   │  - Tests negative number input, error toasts, and dialogs│
   └──────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Using in GitHub Actions

Add the following step to your `.github/workflows/usability.yml`:

```yaml
name: Usability Heuristic Review

on: [pull_request]

jobs:
  heuristic-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: chontipan/heuristic-lint-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          target-path: 'src'
          severity-threshold: '2'
          generate-playwright: 'true'
          output-spec-dir: 'e2e/heuristic-generated'
```

### 2. Local CLI Usage

You can also run the tool locally via npx or npm:

```bash
# Clone and build locally
git clone https://github.com/chontipan/heuristic-lint-action.git
cd heuristic-lint-action
npm install
npm run build

# Run scan on your project
node dist/index.js --path=/path/to/your/react-project/src --severity=2 --playwright
```

---

## 📋 Implemented Heuristic Rules

| Rule ID | Nielsen Heuristic | Target Failure Mechanism |
| :--- | :--- | :--- |
| `H1_UNHANDLED_ASYNC_STATE` | **H1: Visibility of System Status** | Async promises / data export calls lacking user-facing error handling or loading indicators (Defect U01, U02) |
| `H2_HARDCODED_I18N_STRING` | **H2: Match System & Real World** | Hardcoded raw English strings in JSX bypassing bilingual dictionaries (`locales/th.ts`) (Defect U04, U05, U15) |
| `H3_UNCONFIRMED_DESTRUCTIVE_ACTION` | **H3: User Control & Freedom** | Direct row deletion or mutation handlers without confirmation modals or undo actions (Defect U06, U17) |
| `H5_SCHEMA_DOM_ALIGNMENT_GAP` | **H5: Error Prevention** | Number inputs missing HTML `min={0}` attribute while backend Zod DTO schema requires non-negative values (Defect U27, U28) |

---

## 📄 License

MIT License © 2026 Chontipan et al., School of Information and Communication Technology, University of Phayao.
