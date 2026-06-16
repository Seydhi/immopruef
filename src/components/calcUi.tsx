// Gemeinsame UI-Bausteine für die Rechner-Seiten (Modulebene → kein Remount/Fokusverlust).

export function Field({
  label, value, onChange, suffix, min = 0, max, step = 1, sub,
}: {
  label: string; value: number; onChange: (n: number) => void; suffix: string
  min?: number; max?: number; step?: number; sub?: string
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-ink-mid mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
          className="w-full border border-ink/20 rounded-lg pl-3.5 pr-9 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green transition-colors tabular-nums"
        />
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-light text-sm">{suffix}</span>
      </div>
      {sub && <p className="text-[11px] text-ink-light mt-1">{sub}</p>}
    </div>
  )
}

export function Row({ label, sub, value, strong = false }: { label: string; sub?: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2.5 ${strong ? '' : 'border-b border-ink/8'}`}>
      <div>
        <div className={`text-sm ${strong ? 'font-semibold text-ink' : 'text-ink-mid'}`}>{label}</div>
        {sub && <div className="text-[11px] text-ink-light">{sub}</div>}
      </div>
      <div className={`text-right tabular-nums ${strong ? 'font-display text-lg font-semibold text-green' : 'text-sm font-medium text-ink'}`}>
        {value}
      </div>
    </div>
  )
}
