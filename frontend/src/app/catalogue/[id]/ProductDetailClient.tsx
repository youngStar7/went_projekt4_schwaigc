'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/components/Providers';
import PCard from '@/components/PCard';
import type { Product } from '@/lib/products';

const fmt = (n: number) =>
  new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(n);

const TRUST = [
  { icon: '↩', label: 'Kostenlose Rückgabe', sub: '30 Tage' },
  { icon: '✦', label: 'Handgefertigt', sub: 'In Deutschland' },
  { icon: '⏱', label: 'Lieferung', sub: '2–4 Wochen' },
];

export default function ProductDetailClient({
  product: p,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [selColor, setSelColor] = useState(0);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'shipping'>('details');

  const colors = p.clrs ?? [p.c];

  const handleAdd = () => {
    addItem({ id: p.id, name: p.name, price: p.price, c: colors[selColor], image: p.image, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div style={{ background: 'var(--white)' }}>
      {/* Breadcrumb */}
      <div style={{
        maxWidth: 1360, margin: '0 auto', padding: '28px 48px 0',
        display: 'flex', gap: 8, alignItems: 'center',
        fontSize: 11, color: 'var(--text-light)', letterSpacing: '0.06em',
      }}>
        <Link href="/" style={{ color: 'var(--text-light)', transition: 'color 0.2s' }}>Startseite</Link>
        <span style={{ color: 'var(--border-strong)' }}>/</span>
        <Link href="/catalogue" style={{ color: 'var(--text-light)', transition: 'color 0.2s' }}>Kollektion</Link>
        <span style={{ color: 'var(--border-strong)' }}>/</span>
        <Link href={`/catalogue?cat=${encodeURIComponent(p.cat)}`} style={{ color: 'var(--text-light)' }}>{p.cat}</Link>
        <span style={{ color: 'var(--border-strong)' }}>/</span>
        <span style={{ color: 'var(--text)' }}>{p.name}</span>
      </div>

      {/* Main Grid */}
      <div style={{
        maxWidth: 1360, margin: '0 auto', padding: '40px 48px 80px',
        display: 'grid', gridTemplateColumns: '1fr 480px', gap: 80, alignItems: 'start',
      }}>
        {/* ── Image Section ── */}
        <div>
          {/* Primary image */}
          <div style={{
            aspectRatio: '4/5', background: colors[selColor],
            overflow: 'hidden', position: 'relative',
            transition: 'background 0.5s ease',
          }}>
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image}
                alt={p.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--serif)', fontSize: 64, fontWeight: 300,
                  color: 'rgba(255,255,255,0.4)', letterSpacing: '-0.02em',
                  userSelect: 'none',
                }}>
                  {p.name.split(' ')[0]}
                </div>
              </div>
            )}

            {/* Tag badge */}
            {p.tag && (
              <div style={{
                position: 'absolute', top: 24, left: 24,
                background: p.tag === 'Neu' ? 'var(--sage)' : 'var(--text)',
                color: 'white', fontSize: 9, letterSpacing: '0.14em',
                textTransform: 'uppercase', padding: '5px 12px',
              }}>
                {p.tag}
              </div>
            )}
          </div>

          {/* Color thumbnail strip */}
          {colors.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              {colors.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelColor(i)}
                  style={{
                    width: 64, height: 64, background: c, border: 'none',
                    cursor: 'pointer', flexShrink: 0,
                    outline: i === selColor ? '2px solid var(--text)' : '2px solid transparent',
                    outlineOffset: 2, transition: 'outline 0.2s',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Info Panel ── */}
        <div style={{ position: 'sticky', top: 88 }}>
          <p style={{ fontSize: 11, color: 'var(--text-light)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            {p.cat}
          </p>
          <h1 style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(28px,3vw,42px)',
            fontWeight: 400, lineHeight: 1.1, marginBottom: 16,
          }}>
            {p.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 28 }}>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 400 }}>
              {fmt(p.price)}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-light)' }}>inkl. MwSt.</p>
          </div>

          {p.desc && (
            <p style={{
              fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.85,
              marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid var(--border)',
            }}>
              {p.desc}
            </p>
          )}

          {/* Color selector */}
          {colors.length > 1 && (
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-mid)', marginBottom: 12 }}>
                Farbe
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {colors.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setSelColor(i)}
                    style={{
                      width: 32, height: 32, borderRadius: '50%', background: c,
                      border: i === selColor ? '2px solid var(--text)' : '2px solid transparent',
                      outline: i === selColor ? '1px solid var(--text)' : 'none',
                      outlineOffset: 2, cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Qty + CTA */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{
              display: 'flex', border: '1px solid var(--border-strong)',
              flexShrink: 0,
            }}>
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{
                  padding: '0 18px', height: 52, background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--text-mid)', fontSize: 18, lineHeight: 1,
                }}
              >−</button>
              <span style={{
                width: 44, height: 52, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 13,
              }}>
                {qty}
              </span>
              <button
                onClick={() => setQty(q => q + 1)}
                style={{
                  padding: '0 18px', height: 52, background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--text-mid)', fontSize: 18, lineHeight: 1,
                }}
              >+</button>
            </div>

            <button
              onClick={handleAdd}
              style={{
                flex: 1, height: 52,
                background: added ? 'var(--sage)' : 'var(--text)', color: 'white',
                border: 'none', cursor: 'pointer',
                fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
                transition: 'background 0.35s',
              }}
            >
              {added ? '✓ Im Warenkorb' : 'In den Warenkorb'}
            </button>
          </div>

          <button style={{
            width: '100%', height: 52,
            background: 'none', color: 'var(--text)',
            border: '1px solid var(--border-strong)', cursor: 'pointer',
            fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
            transition: 'all 0.2s', marginBottom: 36,
          }}>
            ♡  Auf Wunschliste
          </button>

          {/* Trust signals */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12, paddingTop: 28, borderTop: '1px solid var(--border)',
            marginBottom: 32,
          }}>
            {TRUST.map(t => (
              <div key={t.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, marginBottom: 6, color: 'var(--sage)' }}>{t.icon}</div>
                <p style={{ fontSize: 11, fontWeight: 500, marginBottom: 2 }}>{t.label}</p>
                <p style={{ fontSize: 10, color: 'var(--text-light)' }}>{t.sub}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 0 }}>
              {(['details', 'specs', 'shipping'] as const).map(tab => {
                const labels = { details: 'Details', specs: 'Maße & Material', shipping: 'Lieferung' };
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1, padding: '14px 8px',
                      background: 'none', border: 'none',
                      borderBottom: isActive ? '2px solid var(--text)' : '2px solid transparent',
                      cursor: 'pointer', fontSize: 10, letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: isActive ? 'var(--text)' : 'var(--text-light)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            <div style={{ padding: '24px 0', fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.85 }}>
              {activeTab === 'details' && (
                p.details
                  ? <div dangerouslySetInnerHTML={{ __html: p.details }} />
                  : <p>{p.desc || 'Keine weiteren Details verfügbar.'}</p>
              )}

              {activeTab === 'specs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {p.dims && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-light)' }}>Maße</span>
                      <span style={{ fontWeight: 400 }}>{p.dims}</span>
                    </div>
                  )}
                  {p.mat && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-light)' }}>Material</span>
                      <span style={{ fontWeight: 400 }}>{p.mat}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-light)' }}>Kategorie</span>
                    <span>{p.cat}</span>
                  </div>
                  {!p.dims && !p.mat && <p>Keine Spezifikationen verfügbar.</p>}
                </div>
              )}

              {activeTab === 'shipping' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    ['Lieferzeit', '2–4 Wochen nach Bestelleingang'],
                    ['Versandkosten', 'Kostenlos ab 150 €'],
                    ['Rückgabe', '30 Tage kostenlose Rückgabe'],
                    ['Montage', 'Auf Wunsch gegen Aufpreis'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: 16 }}>
                      <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-light)', minWidth: 100, paddingTop: 2 }}>{k}</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div style={{ background: 'var(--surface)', padding: '80px 48px' }}>
          <div style={{ maxWidth: 1360, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 40 }}>
              <div>
                <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 8 }}>
                  Aus der gleichen Kategorie
                </p>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px,2.5vw,32px)', fontWeight: 400 }}>
                  Das könnte Ihnen gefallen
                </h2>
              </div>
              <Link href={`/catalogue?cat=${encodeURIComponent(p.cat)}`} style={{
                fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'var(--text-mid)', textDecoration: 'none',
                borderBottom: '1px solid var(--border-strong)', paddingBottom: 2,
              }}>
                Alle {p.cat} →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px 32px' }}>
              {related.map(r => <PCard key={r.id} p={r} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
