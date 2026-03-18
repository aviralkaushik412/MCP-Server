import Groq from "groq-sdk"
import dotenv from "dotenv"
import Anthropic from "@anthropic-ai/sdk"
dotenv.config()

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || ""
})
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
export async function summarizeText(text: string): Promise<string | null> {

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Summarize this pull request in simple terms:\n\n${text}`
      }
    ],
    model: "llama-3.1-8b-instant",
    max_tokens: 1024
  })

  return response.choices[0]?.message.content || "AI summary unavailable."
}