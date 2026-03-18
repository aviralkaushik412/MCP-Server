import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

const github = axios.create({
    baseURL: "https://api.github.com",
    headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
    }
})
export function getGithubClient() {
  return github
}

export async function getRepoStats(owner: string, repo: string) {
    const response = await github.get(`/repos/${owner}/${repo}`)
    return response.data
}
export async function getIssues(owner: string, repo: string) {
    const response = await github.get(`/repos/${owner}/${repo}/issues`)
    return response.data
}
export async function getContributors(owner: string, repo: string) {
    const response = await github.get(`/repos/${owner}/${repo}/contributors`)
    return response.data
}
