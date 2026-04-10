export default function Header() {
  return (
    <header className="bg-green px-6 py-4 flex items-center justify-between border-b-2 border-gold">
      <div className="font-display text-cream text-xl font-medium tracking-wide">
        Immo<span className="text-gold-light">Prüf</span>
      </div>
      <div className="bg-gold/20 border border-gold/40 text-gold-light text-[11px] font-medium px-2.5 py-1 rounded-full uppercase tracking-widest">
        KI-gestützt
      </div>
    </header>
  )
}
