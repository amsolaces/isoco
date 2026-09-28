import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#060606] px-4 py-12 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        {/* Editorial Top Grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12 pb-12 border-b border-white/[0.06]">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-white">DRIPEGO</p>
            <p className="text-[11px] leading-5 text-white/40 max-w-xs">
              Engineered form. Uncompromising presence. Not built to blend in.
            </p>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/25 pt-2">
              Est. 2026 • Drop 001
            </p>
          </div>

          {/* Shop Column */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Shop</p>
            <ul className="space-y-2 text-[11px] uppercase tracking-wider text-white/55">
              <li>
                <Link href="/men" className="transition hover:text-white">Men</Link>
              </li>
              <li>
                <Link href="/women" className="transition hover:text-white">Women</Link>
              </li>
              <li>
                <Link href="/products" className="transition hover:text-white">All Pieces</Link>
              </li>
              <li>
                <Link href="/products/statement-tee" className="transition hover:text-white">Drop 001</Link>
              </li>
            </ul>
          </div>

          {/* Client Care Column */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Client Care</p>
            <ul className="space-y-2 text-[11px] uppercase tracking-wider text-white/55">
              <li>
                <Link href="/auth" className="transition hover:text-white">Account</Link>
              </li>
              <li>
                <Link href="/#contact" className="transition hover:text-white">Concierge</Link>
              </li>
              <li>
                <Link href="/shipping" className="transition hover:text-white">Shipping</Link>
              </li>
              <li>
                <Link href="/shipping" className="transition hover:text-white">Returns &amp; Exchanges</Link>
              </li>
            </ul>
          </div>

          {/* Legal & Social Column */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Legal &amp; Social</p>
            <ul className="space-y-2 text-[11px] uppercase tracking-wider text-white/55">
              <li>
                <Link href="/privacy" className="transition hover:text-white">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="transition hover:text-white">Terms of Service</Link>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/shopdripego/"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-white"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@dripego.com"
                  className="transition hover:text-white"
                >
                  hello@dripego.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[10px] tracking-[0.2em] text-white/25 uppercase">
            © 2026 DRIPEGO. ALL RIGHTS RESERVED.
          </p>
          <p className="text-[10px] font-bold tracking-[0.35em] text-white/30 uppercase">
            PRESENCE OVER APPROVAL.
          </p>
        </div>
      </div>
    </footer>
  );
}
