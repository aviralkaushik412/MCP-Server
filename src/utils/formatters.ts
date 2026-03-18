// src/utils/formatters.ts

// ─── Repo Stats ───────────────────────────────────────────────
export function formatRepoStats(data: any): string {
  const topics = data.topics?.length
    ? data.topics.map((t: string) => `\`${t}\``).join(', ')
    : '_none_'

  return `
## 📦 ${data.full_name}

${data.description ?? '_No description provided_'}

### Stats
| Metric | Value |
|--------|-------|
| ⭐ Stars | ${data.stargazers_count.toLocaleString()} |
| 🍴 Forks | ${data.forks_count.toLocaleString()} |
| 👁️ Watchers | ${data.watchers_count.toLocaleString()} |
| 🐛 Open Issues | ${data.open_issues_count.toLocaleString()} |

### Details
- 🌐 **Language:** ${data.language ?? 'Not specified'}
- 📄 **License:** ${data.license?.name ?? 'None'}
- 🔒 **Visibility:** ${data.private ? 'Private' : 'Public'}
- 📅 **Created:** ${new Date(data.created_at).toDateString()}
- 🔄 **Last Push:** ${new Date(data.pushed_at).toDateString()}
- 🏷️ **Topics:** ${topics}

### Links
- [Repository](${data.html_url})
${data.homepage ? `- [Homepage](${data.homepage})` : ''}
  `.trim()
}


// ─── Open Issues ──────────────────────────────────────────────
export function formatOpenIssues(issues: any[]): string {
  if (issues.length === 0) {
    return '✅ No open issues found for this repository.'
  }

  const issueLines = issues.map((issue: any) => {
    const labels = issue.labels?.length
      ? issue.labels.map((l: any) => `\`${l.name}\``).join(', ')
      : 'none'
    const age = Math.floor(
      (Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    return `### #${issue.number} — ${issue.title}
- 👤 Opened by: **${issue.user?.login ?? 'unknown'}** (${age} days ago)
- 🏷️ Labels: ${labels}
- 💬 Comments: ${issue.comments}
- 🔗 [View Issue](${issue.html_url})`
  }).join('\n\n')

  return `## 🐛 Open Issues (${issues.length} shown)

${issueLines}`
}


// ─── Contributors ─────────────────────────────────────────────
export function formatContributors(contributors: any[]): string {
  if (contributors.length === 0) {
    return '_No contributors found._'
  }

  const rows = contributors
    .slice(0, 10) // top 10 is enough — beyond that it's noise
    .map((c: any, i: number) => `| ${i + 1} | [@${c.login}](${c.html_url}) | ${c.contributions.toLocaleString()} |`)
    .join('\n')

  const total = contributors.reduce((sum: number, c: any) => sum + c.contributions, 0)
  const top = contributors[0]
  const topPercent = ((top.contributions / total) * 100).toFixed(1)

  return `## 👥 Top Contributors

| Rank | Contributor | Commits |
|------|-------------|---------|
${rows}

### Insights
- 🏆 Top contributor: **@${top.login}** with ${top.contributions.toLocaleString()} commits (${topPercent}% of total shown)
- 📊 Total commits across top ${Math.min(contributors.length, 10)}: **${total.toLocaleString()}**`
}


// ─── Pull Request Summary ──────────────────────────────────────
export function formatPullRequestSummary(pr: any, aiSummary: string): string {
  const additions = pr.additions ?? 0
  const deletions = pr.deletions ?? 0
  const changedFiles = pr.changed_files ?? 0

  const riskLevel = changedFiles > 20 || additions + deletions > 500
    ? '🔴 High'
    : changedFiles > 5 || additions + deletions > 100
    ? '🟡 Medium'
    : '🟢 Low'

  return `## 🔀 PR #${pr.number} — ${pr.title}

**${pr.user?.login ?? 'unknown'}** wants to merge \`${pr.head?.label}\` → \`${pr.base?.label}\`

### Status
- 📌 State: **${pr.state}**
- 💬 Comments: ${pr.comments ?? 0}
- ✅ Mergeable: ${pr.mergeable ?? 'unknown'}

### Changes
| Metric | Value |
|--------|-------|
| 📁 Files changed | ${changedFiles} |
| ✅ Additions | +${additions.toLocaleString()} |
| ❌ Deletions | -${deletions.toLocaleString()} |
| ⚠️ Risk level | ${riskLevel} |

### AI Summary
${aiSummary}

### Links
- [View PR](${pr.html_url})`
}

export function formatGoodFirstIssues(issues: any[], owner: string, repo: string): string {
  if (issues.length === 0) {
    return `## 🔍 No beginner-friendly issues found in ${owner}/${repo}\n\nThis repo may not label their issues, or there are none open right now.`
  }

  const issueLines = issues.map((issue: any) => {
    const labels = issue.labels.map((l: any) => `\`${l.name}\``).join(', ')
    const age = Math.floor(
      (Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    const difficulty = issue.comments > 5 ? '🔴 Active discussion'
      : issue.comments > 0 ? '🟡 Some discussion'
      : '🟢 Fresh — no comments yet'

    return `### #${issue.number} — ${issue.title}
- 🏷️ Labels: ${labels}
- 📅 Opened: ${age} days ago
- 💬 Comments: ${issue.comments} (${difficulty})
- 🔗 [View Issue](${issue.html_url})`
  }).join('\n\n')

  return `## 🌱 Good First Issues in ${owner}/${repo}

_${issues.length} beginner-friendly issue${issues.length > 1 ? 's' : ''} found_

${issueLines}

> 💡 Tip: Issues with 0 comments are easiest to claim — no one is working on them yet.`
}