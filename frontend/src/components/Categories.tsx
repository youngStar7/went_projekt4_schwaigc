import Link from 'next/link';
import { CATEGORIES } from '@/lib/products';

export default function Categories() {
  return (
    <section style={{ padding: '0 0 100px', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '80px 48px 0' }}>
        <div style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 8 }}>
            Sortiment
          </p>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 400 }}>
            Kategorien
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}>
          {CATEGORIES.map((cat, i) => (
            <Link key={cat.name} href={`/catalogue?cat=${encodeURIComponent(cat.name)}`}
              style={{
                position: 'relative', overflow: 'hidden',
                aspectRatio: i < 2 ? '4/3' : '16/9',
                display: 'block',
                gridColumn: i < 2 ? 'span 1' : 'span 1',
              }}
            >
              {/* Color background */}
              <div style={{
                position: 'absolute', inset: 0, background: cat.color,
                transition: 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
              }} className="cat-bg" />

              {/* Overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(26,26,24,0.6) 0%, transparent 60%)',
              }} />

              {/* Content */}
              <div style={{
                position: 'absolute', bottom: 24, left: 24, right: 24,
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
              }}>
                <div>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, color: 'white', letterSpacing: '0.02em' }}>
                    {cat.name}
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                    {cat.count} Produkte
                  </p>
                </div>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5} style={{ opacity: 0.7 }}>
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
