export interface Objektdaten {
  merkmal: string
  wert: string
}

export interface Standortanalyse {
  kategorie: string
  bewertung: string
  details: string
}

export interface Marktdaten {
  kennzahl: string
  wert: string
  einschaetzung: 'gut' | 'mittel' | 'schlecht'
}

export interface Scores {
  gesamtbewertung: number
  lage: number
  preis_leistung: number
  zustand: number
}

export interface AnalysisOptions {
  makleranschreiben: boolean
  verhandlungstipps: boolean
  risiken: boolean
}

export interface AnalysisResult {
  objektdaten: Objektdaten[]
  standortanalyse: Standortanalyse[]
  marktdaten: Marktdaten[]
  scores: Scores
  risiken: string[]
  verhandlungstipps: string[]
  makleranschreiben: string
  zusammenfassung: string
}

export interface Analysis {
  id: string
  token: string
  url: string
  options: AnalysisOptions
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result: AnalysisResult | null
  created_at: string
}

export interface OrderResult {
  order_status: 'pending' | 'paid' | 'processing' | 'completed' | 'failed'
  analyses: Analysis[]
}

export type Package = 'single' | 'double' | 'triple'

export const PACKAGE_CONFIG: Record<Package, { urls: number; price: string; priceNum: number; perUnit: string; saving: string | null }> = {
  single: { urls: 1, price: '19,00 \u20ac', priceNum: 19, perUnit: '19,00 \u20ac', saving: null },
  double: { urls: 2, price: '29,00 \u20ac', priceNum: 29, perUnit: '14,50 \u20ac', saving: '24%' },
  triple: { urls: 3, price: '34,00 \u20ac', priceNum: 34, perUnit: '11,33 \u20ac', saving: '40%' },
}
