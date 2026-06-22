import Link from 'next/link';

const COLS = [
  {
    title: 'Kollektion',
    links: [
      { label: 'Stühle', href: '/catalogue?cat=Stühle' },
      { label: 'Tische', href: '/catalogue?cat=Tische' },
      { label: 'Sofas', href: '/catalogue?cat=Sofas' },
      { label: 'Schränke', href: '/catalogue?cat=Schränke' },
      { label: 'Betten', href: '/catalogue?cat=Betten' },
    ],
  },
  {
    title: 'Service',
    links: [
      { label: 'Versand & Lieferung', href: '/' },
      { label: 'Rückgabe', href: '/' },
      { label: 'Pflegehinweise', href: '/' },
      { label: 'Kontakt', href: '/' },
      { label: 'FAQ', href: '/' },
    ],
  },
  {
    title: 'Über uns',
    links: [
      { label: 'Geschichte', href: '/' },
      { label: 'Handwerk', href: '/' },
      { label: 'Nachhaltigkeit', href: '/' },
      { label: 'Karriere', href: '/' },
      { label: 'Presse', href: '/' },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{ background: 'var(--text)', color: 'var(--white)', padding: '56px 48px 36px' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 40, marginBottom: 56,
        }}>
          {/* Brand */}
          <div>
            <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 400 }}>
              Noven
            </Link>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginTop: 20, maxWidth: 240 }}>
              Designmöbel mit individueller Ästhetik, Handwerkskunst und zeitlosem Design für moderne Wohnräume.
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 28 }}>
              {['IG', 'PI', 'FB'].map(s => (
                <button key={s} style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.2)', background: 'none',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
                  fontSize: 10, letterSpacing: '0.06em',
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {COLS.map(col => (
            <div key={col.title}>
              <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>
                {col.title}
              </p>
              <ul style={{ listStyle: 'none' }}>
                {col.links.map(link => (
                  <li key={link.label} style={{ marginBottom: 12 }}>
                    <Link href={link.href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s' }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 28,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 11, color: 'rgba(255,255,255,0.3)',
        }}>
          <span>© 2025 Noven GmbH. Alle Rechte vorbehalten.</span>
          <div style={{ display: 'flex', gap: 32 }}>
            {['Datenschutz', 'AGB', 'Impressum'].map(t => (
              <Link key={t} href="/" style={{ color: 'rgba(255,255,255,0.3)' }}>{t}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
