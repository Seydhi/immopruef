import type { AnalysisOptions, OrderResult, Analysis, Package } from './types'
import * as mockApi from './mock-api'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

export async function startCheckout(
  urls: string[],
  options: AnalysisOptions,
  pkg: Package
): Promise<string> {
  if (USE_MOCKS) return mockApi.startCheckout(urls, options, pkg)
  throw new Error('Real API not implemented yet')
}

export async function pollAnalysis(sessionId: string): Promise<OrderResult> {
  if (USE_MOCKS) return mockApi.pollAnalysis(sessionId)
  throw new Error('Real API not implemented yet')
}

export async function getAnalysisByToken(token: string): Promise<Analysis | null> {
  if (USE_MOCKS) return mockApi.getAnalysisByToken(token)
  throw new Error('Real API not implemented yet')
}
