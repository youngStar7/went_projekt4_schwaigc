import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', textAlign: 'center', padding: '2rem' }}>
      <span style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(80px,10vw,140px)', fontWeight: 300, color: 'var(--border)', lineHeight: 1, letterSpacing: '-0.04em', userSelect: 'none' }}>
        404
      </span>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(20px,3vw,32px)', fontWeight: 400, color: 'var(--text)' }}>
        Seite nicht gefunden
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-mid)', maxWidth: 320, lineHeight: 1.8 }}>
        Die angeforderte Seite existiert nicht oder wurde verschoben.
      </p>
      <Link href="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8,
        padding: '13px 28px', background: 'var(--text)', color: 'white',
        fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        Zurück zur Startseite
      </Link>
    </div>
  );
}
