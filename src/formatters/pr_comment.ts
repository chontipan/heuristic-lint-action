import { LintReport } from '../types';

export function formatPrComment(report: LintReport): string {
  const sevEmojis: Record<number, string> = {
    4: '🚨 **Catastrophic**',
    3: '⚠️ **Major**',
    2: '⚡ **Medium**',
    1: '🔍 **Minor**',
    0: '💡 **Cosmetic**'
  };

  let md = `## 🛡️ Heuristic Lint Action: Usability Review Summary\n\n`;
  md += `> **Shift-Left Usability Triangulation Audit** | Scanned **${report.filesScanned}** files | Found **${report.totalDefects}** defects\n\n`;

  if (report.totalDefects === 0) {
    md += `✅ **All Nielsen Heuristic checks passed!** No high-severity usability defects or DOM-schema disconnects detected.\n`;
    return md;
  }

  md += `### 📊 Defect Distribution by Nielsen Heuristic\n\n`;
  md += `| Heuristic Principle | Defect Count |\n`;
  md += `| :--- | :---: |\n`;
  for (const [heuristic, count] of Object.entries(report.defectsByHeuristic)) {
    md += `| ${heuristic} | **${count}** |\n`;
  }
  md += `\n`;

  md += `### 🔍 Flagged Usability Issues & Remediations\n\n`;
  for (const d of report.defects) {
    md += `#### [${d.id}] ${d.title} (${sevEmojis[d.severity]})\n`;
    md += `- **File:** \`${d.file}#L${d.lineStart}-L${d.lineEnd}\`\n`;
    md += `- **Heuristic:** ${d.heuristic}\n`;
    md += `- **Issue:** ${d.description}\n`;
    md += `- **Code Snippet:**\n\`\`\`tsx\n${d.snippet}\n\`\`\`\n`;
    md += `- **💡 Recommended Remediation:** ${d.remediation}\n\n`;
  }

  if (report.generatedPlaywrightSpecs && report.generatedPlaywrightSpecs.length > 0) {
    md += `### 🎭 Generated Playwright E2E Affordance Specs (Stage 3)\n`;
    md += `Generated **${report.generatedPlaywrightSpecs.length}** live DOM assertion specs to guard against runtime regression:\n`;
    for (const spec of report.generatedPlaywrightSpecs) {
      md += `- \`${spec}\`\n`;
    }
  }

  md += `\n---\n*Automated review by [heuristic-lint-action](https://github.com/chontipan/heuristic-lint-action)*\n`;
  return md;
}
