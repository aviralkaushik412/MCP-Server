import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js"
import { dispatchTool, getRegisteredTools } from "./tools/registry"
import dotenv from 'dotenv'
dotenv.config()

const server = new Server(
  { name: "github-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: getRegisteredTools()
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  const text = await dispatchTool(name, (args ?? {}) as Record<string, unknown>)
  return { content: [{ type: "text", text }] }
})

const transport = new StdioServerTransport()
server.connect(transport)