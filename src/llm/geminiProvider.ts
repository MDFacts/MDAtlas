import { z } from 'zod'
import type { ProseProvider, ProseRequest } from './proseProvider'

const GEMINI_MODEL = 'gemini-2.5-flash'
const TIMEOUT_MS = 8000

const responseSchema = z.object({
  candidates: z
    .array(
      z.object({
        content: z.object({
          parts: z.array(z.object({ text: z.string() })),
        }),
      }),
    )
    .min(1),
})

export function hasGeminiKey(): boolean {
  return typeof import.meta.env.VITE_GEMINI_API_KEY === 'string' &&
    import.meta.env.VITE_GEMINI_API_KEY.length > 0
}

function buildPrompt(request: ProseRequest): string {
  const audienceInstruction =
    request.audience === 'patient'
      ? 'Write a warm, plain-language explanation (under 180 words) of the possible explanations below for the person experiencing the symptoms. Never present anything as a definitive diagnosis. End by reinforcing the recommended care level.'
      : 'Write a concise clinical hand-off paragraph (under 120 words) summarizing the structured symptom data below for a physician. Neutral, factual tone.'
  return `${audienceInstruction}\n\nStructured assessment data (JSON):\n${JSON.stringify(request.result, null, 2)}`
}

export const geminiProvider: ProseProvider = {
  name: 'gemini-2.5-flash',
  async generate(request: ProseRequest): Promise<string> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({
            contents: [{ parts: [{ text: buildPrompt(request) }] }],
          }),
          signal: controller.signal,
        },
      )
      if (!response.ok) {
        throw new Error(`Gemini request failed with status ${response.status}`)
      }
      const parsed = responseSchema.parse(await response.json())
      return parsed.candidates[0].content.parts.map((part) => part.text).join('')
    } finally {
      clearTimeout(timer)
    }
  },
}
