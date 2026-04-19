export default function Header() {
  return (
    <header className="bg-green px-6 py-5 flex items-center justify-between border-b-2 border-gold">
      <a href="/" className="flex items-center gap-3 font-display text-cream text-2xl font-medium tracking-wide hover:opacity-90 transition-opacity">
        <img src="/logo-white.png" alt="ImmoPrüf Logo" width="48" height="48" className="h-12 w-12" />
        Immo<span className="text-gold-light">Prüf</span>
      </a>
      <div className="bg-gold/20 border border-gold/40 text-gold-light text-[11px] font-medium px-2.5 py-1 rounded-full uppercase tracking-widest">
        Ersteinschätzung
      </div>
    </header>
  )
}
