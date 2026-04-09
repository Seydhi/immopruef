import type { AnalysisOptions, OrderResult, Analysis, Package } from './types'
import { MOCK_ANALYSIS_RESULT } from './mock-data'

function randomId(): string {
  return Math.random().toString(36).substring(2, 14)
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function startCheckout(
  urls: string[],
  _options: AnalysisOptions,
  _pkg: Package
): Promise<string> {
  await delay(500)
  const fakeSessionId = 'cs_mock_' + randomId()
  sessionStorage.setItem('mock_urls', JSON.stringify(urls))
  sessionStorage.setItem('mock_options', JSON.stringify(_options))
  return `${window.location.origin}?session_id=${fakeSessionId}`
}

export async function pollAnalysis(_sessionId: string): Promise<OrderResult> {
  await delay(3000)
  const urls: string[] = JSON.parse(sessionStorage.getItem('mock_urls') || '[]')
  const options: AnalysisOptions = JSON.parse(
    sessionStorage.getItem('mock_options') || '{"makleranschreiben":true,"verhandlungstipps":true,"risiken":true}'
  )

  const analyses: Analysis[] = urls.map((url) => ({
    id: randomId(),
    token: 'tok_' + randomId(),
    url,
    options,
    status: 'completed' as const,
    result: { ...MOCK_ANALYSIS_RESULT },
    created_at: new Date().toISOString(),
  }))

  return { order_status: 'completed', analyses }
}

export async function getAnalysisByToken(token: string): Promise<Analysis | null> {
  await delay(300)
  return {
    id: randomId(),
    token,
    url: 'https://www.immobilienscout24.de/expose/12345678',
    options: { makleranschreiben: true, verhandlungstipps: true, risiken: true },
    status: 'completed',
    result: { ...MOCK_ANALYSIS_RESULT },
    created_at: new Date().toISOString(),
  }
}
