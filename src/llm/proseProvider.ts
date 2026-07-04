import type { AssessmentResult } from '../clinical/types'
import { geminiProvider, hasGeminiKey } from './geminiProvider'
import { offlineProvider } from './offlineProvider'

export interface ProseRequest {
  result: AssessmentResult
  audience: 'patient' | 'doctor'
}

export interface ProseProvider {
  name: string
  generate(request: ProseRequest): Promise<string>
}

export function selectProvider(): ProseProvider {
  return hasGeminiKey() ? geminiProvider : offlineProvider
}

/** Generate prose, falling back to the offline provider on any LLM failure. */
export async function generateProse(request: ProseRequest): Promise<string> {
  const provider = selectProvider()
  if (provider.name === offlineProvider.name) {
    return offlineProvider.generate(request)
  }
  try {
    return await provider.generate(request)
  } catch (error) {
    console.error('LLM prose generation failed, using offline prose:', error)
    return offlineProvider.generate(request)
  }
}
