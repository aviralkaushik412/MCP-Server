import { getGithubClient } from "../services/githubService"

export async function findGoodFirstIssues(owner: string, repo: string) {
  const github = getGithubClient()

  const { data: issues } = await github.get(
    `/repos/${owner}/${repo}/issues`,
    {
      params: {
        state: "open",
        labels: "good first issue",
        per_page: 10,
        sort: "created",
        direction: "desc"
      }
    }
  )

  // Fallback to "help wanted" if no good first issues found
  if (issues.length === 0) {
    const { data: fallback } = await github.get(
      `/repos/${owner}/${repo}/issues`,
      {
        params: {
          state: "open",
          labels: "help wanted",
          per_page: 10,
        }
      }
    )
    return fallback
  }

  return issues
}