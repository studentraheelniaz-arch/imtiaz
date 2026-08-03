export default function Footer() {
  return (
    <footer className="mt-24 bg-road-950 text-paper/80">
      <div className="road-strip" />
      <div className="mx-auto max-w-6xl px-5 py-10 text-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-lg font-bold text-white">Imtiaz Tayara</p>
            <p className="mt-1 max-w-xs text-paper/60">Gambat ⇄ Karachi, every day. Book online, pay by JazzCash or UPaisa, and travel with confidence.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-paper/70">
            <div>
              <p className="mb-2 font-display font-semibold text-white">Route</p>
              <p>Gambat → Karachi</p>
              <p>Karachi → Gambat</p>
            </div>
            <div>
              <p className="mb-2 font-display font-semibold text-white">Support</p>
              <p>+92 300 000 0000</p>
              <p>help@imtiaztayara.pk</p>
            </div>
          </div>
        </div>
        <p className="mt-8 border-t border-white/10 pt-6 text-xs text-paper/40">© {new Date().getFullYear()} Imtiaz Tayara. All fares in PKR.</p>
      </div>
    </footer>
  );
}
