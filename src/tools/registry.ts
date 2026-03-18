// src/tools/registry.ts
import axios from "axios"
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js"
import { getRepoStats } from "../services/githubService"
import { listOpenIssues } from "./issues"
import { getRepoContributors } from "./contributors"
import { summarizePullRequest } from "./pullRequest"
import {
  formatRepoStats,
  formatOpenIssues,
  formatContributors,
  formatPullRequestSummary
} from "../utils/formatters"

// ─── Types ────────────────────────────────────────────────────

type ToolHandler = (args: Record<string, unknown>) => Promise<string>

interface ToolDefinition {
  name: string
  description: string
  inputSchema: object
  handler: ToolHandler
}

// ─── Tool definitions ─────────────────────────────────────────

const tools: ToolDefinition[] = [
  {
    name: "get_repo_stats",
    description: "Get GitHub repository statistics including stars, forks, language and more",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner or organisation" },
        repo:  { type: "string", description: "Repository name" }
      },
      required: ["owner", "repo"]
    },
    handler: async ({ owner, repo }) => {
      const data = await getRepoStats(owner as string, repo as string)
      return formatRepoStats(data)
    }
  },
  {
    name: "get_open_issues",
    description: "Get open issues for a GitHub repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner or organisation" },
        repo:  { type: "string", description: "Repository name" }
      },
      required: ["owner", "repo"]
    },
    handler: async ({ owner, repo }) => {
      const data = await listOpenIssues(owner as string, repo as string)
      return formatOpenIssues(data)
    }
  },
  {
    name: "get_contributors",
    description: "Get top contributors for a GitHub repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner or organisation" },
        repo:  { type: "string", description: "Repository name" }
      },
      required: ["owner", "repo"]
    },
    handler: async ({ owner, repo }) => {
      const data = await getRepoContributors(owner as string, repo as string)
      return formatContributors(data)
    }
  },
  {
    name: "summarize_pull_request",
    description: "Summarize a GitHub pull request using AI — includes file diffs and risk level",
    inputSchema: {
      type: "object",
      properties: {
        owner:       { type: "string", description: "Repository owner or organisation" },
        repo:        { type: "string", description: "Repository name" },
        pull_number: { type: "number", description: "Pull request number" }
      },
      required: ["owner", "repo", "pull_number"]
    },
    handler: async ({ owner, repo, pull_number }) => {
      const { pr, summary } = await summarizePullRequest(
        owner as string,
        repo as string,
        pull_number as number
      )
      return formatPullRequestSummary(pr, summary)
    }
  }
]

// ─── Registry internals ───────────────────────────────────────

const toolRegistry = new Map<string, ToolHandler>(
  tools.map(t => [t.name, t.handler])
)

// Called by server.ts → ListToolsRequestSchema
export function getRegisteredTools() {
  return tools.map(({ name, description, inputSchema }) => ({
    name,
    description,
    inputSchema
  }))
}

// Called by server.ts → CallToolRequestSchema
export async function dispatchTool(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  const handler = toolRegistry.get(name)
  if (!handler) {
    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`)
  }
  try {
    return await handler(args)
  } catch (err) {
    if (err instanceof McpError) throw err

    if (axios.isAxiosError(err) && err.response?.status === 404) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Repository or resource not found. Check the owner, repo, and number."
      )
    }

    if (axios.isAxiosError(err) && err.response?.status === 403) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "GitHub API rate limit hit or access denied. Check your GITHUB_TOKEN."
      )
    }

    throw new McpError(
      ErrorCode.InternalError,
      `Tool failed: ${err instanceof Error ? err.message : "Unknown error"}`
    )
  }
}