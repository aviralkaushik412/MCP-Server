// src/tools/pullRequest.ts
import { getGithubClient } from "../services/githubService"
import { summarizeText } from "../services/aiService"

export async function summarizePullRequest(
  owner: string,
  repo: string,
  pull_number: number
) {
  const github = getGithubClient()

  // Fetch PR metadata (title, description, additions, deletions, changed_files)
  const { data: pr } = await github.get(
    `/repos/${owner}/${repo}/pulls/${pull_number}`
  )

  // Fetch the actual file diffs — this is what makes the summary meaningful
  const { data: files } = await github.get(
    `/repos/${owner}/${repo}/pulls/${pull_number}/files`
  )

  // Build a richer prompt for Groq
  // Limit patch to 200 chars per file — diffs can be huge, we don't want to blow the context window
  const fileChanges = files
    .slice(0, 10) // max 10 files
    .map((f: any) => `- ${f.filename} (+${f.additions} -${f.deletions})${f.patch ? `\n  Diff: ${f.patch.slice(0, 200)}` : ''}`)
    .join('\n')

  const prompt = `
Summarize this pull request for a developer:

Title: ${pr.title}
Description: ${pr.body ?? 'No description provided'}

Files changed (${pr.changed_files}):
${fileChanges}

In 3-4 sentences: what does this PR do, what files does it touch, and are there any obvious concerns?
  `.trim()

  // const summary = await summarizeText(prompt)

  // Return both pr (for formatPullRequestSummary) and summary (for AI text)
  const summary = await summarizeText(prompt) ?? "AI summary unavailable."
  return { pr, summary }
}