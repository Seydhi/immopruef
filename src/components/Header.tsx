const NAV_LINKS = [
  { href: '/blog', label: 'Ratgeber' },
  { href: '/rechner', label: 'Rechner' },
  { href: '/kaufnebenkosten-index', label: 'Kaufnebenkosten' },
]

export default function Header() {
  return (
    <header className="bg-green px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-3 border-b-2 border-gold">
      <a href="/" className="flex items-center gap-2.5 sm:gap-3 font-display text-cream text-xl sm:text-2xl font-medium tracking-wide hover:opacity-90 transition-opacity shrink-0">
        <img src="/logo-white.png" alt="ImmoPrüf Logo" width="48" height="48" className="h-10 w-10 sm:h-12 sm:w-12" />
        Immo<span className="text-gold-light">Prüf</span>
      </a>
      <nav aria-label="Hauptnavigation" className="flex items-center gap-4 sm:gap-6 min-w-0">
        {NAV_LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className={`text-cream/90 hover:text-gold-light transition-colors text-[13px] sm:text-sm font-medium whitespace-nowrap ${
              l.href === '/kaufnebenkosten-index' ? 'hidden md:inline' : ''
            }`}
          >
            {l.label}
          </a>
        ))}
        <div className="hidden lg:block bg-gold/20 border border-gold/40 text-gold-light text-[11px] font-medium px-2.5 py-1 rounded-full uppercase tracking-widest">
          Ersteinschätzung
        </div>
      </nav>
    </header>
  )
}
