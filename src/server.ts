// console.log("MCP Server Started 🚀")
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { getIssues, getRepoStats } from "./services/githubService"
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js"
import { listOpenIssues } from "./tools/issues"
import { getRepoContributors } from "./tools/contributors"   
import { summarizePullRequest } from "./tools/pullRequest"
import { formatRepoStats } from "./utils/formatters"
import { dispatchTool } from "./tools/registry"
import dotenv from 'dotenv'
dotenv.config()

const server = new Server(
    {
        name: "Github-mcp-server",
        version: "1.0.0"
    },
    {
        capabilities:{
            tools:{}
        }
    }
)
// Register tools ->
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools : [
        {
            name: "get_repo_stats",
            description: "Get github repository statistics",
            inputSchema: {
                type: "object",
                properties:{
                    owner: {type: "string"},
                    repo: {type: "string"}
                },
                required: ["owner","repo"]
            }
        },
        {
            name: "get_open_issues",
            description: "Get open issues for a repository",
            inputSchema: {
                type: "object",
                properties:{
                    owner: {type: "string"},
                    repo: {type: "string"}
                },
                required: ["owner","repo"]
            }
        },
        {
            name: "get_contributors",
            description: "Get top contributors for a repository",
            inputSchema: {
                type: "object",
                properties:{
                    owner: {type: "string"},
                    repo: {type: "string"}
                },
                required: ["owner","repo"]
            }
        },
        {
            name: "summarize_pull_request",
            description: "Summarize a GitHub pull request using AI",
            inputSchema: {
                type: "object",
                properties: {
                owner: { type: "string" },
                repo: { type: "string" },
                pull_number: { type: "number" }
                },
                required: ["owner", "repo", "pull_number"]
            }
        }
    ]
}))

// work when tool is called ->
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  const text = await dispatchTool(name, (args ?? {}) as Record<string, unknown>)
  return { content: [{ type: "text", text }] }
})
// server.setRequestHandler(CallToolRequestSchema, async (request) =>{
//     if(request.params.name === "get_repo_stats"){
//         const { owner , repo } = request.params.arguments as{
//             owner: string,
//             repo: string
//         }
//         const response = await getRepoStats(owner,repo)
//         return {
//             content: [
//                 {
//                     type: "text",
//                     text: formatRepoStats(response)
//                 }
//             ]
//         }
//     }
//     if(request.params.name === "get_open_issues"){
//         const { owner , repo } = request.params.arguments as{
//             owner: string,
//             repo: string
//         }
//         const response = await listOpenIssues(owner,repo)
//         return {
//             content: [
//                 {
//                     type: "text",
//                     text: formatRepoStats(response)
//                 }
//             ]
//         }
//     }
//     if(request.params.name === "get_contributors"){
//         const { owner , repo } = request.params.arguments as{
//             owner: string,
//             repo: string
//         }
//         const response = await getRepoContributors(owner,repo)
//         return {
//             content: [
//                 {
//                     type: "text",
//                     text: formatRepoStats(response)
//                 }
//             ]
//         }
//     }
//     if (request.params.name === "summarize_pull_request") {
//         const { owner, repo, pull_number } = request.params.arguments as any
//         const result = await summarizePullRequest(owner, repo, pull_number)
//         return {
//             content: [
//                 { 
//                     type: "text", 
//                     text: formatRepoStats(result)
//                 }
//             ]
//         }
//     }
//     throw new Error("Unknown tool")
// })

const transport = new StdioServerTransport();
server.connect(transport)