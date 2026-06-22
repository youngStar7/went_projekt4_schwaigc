'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/components/Providers';
import PCard from '@/components/PCard';
import type { Product } from '@/lib/products';

const fmt = (n: number) =>
  new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(n);

export default function ProductDetailClient({ product: p, related }: { product: Product; related: Product[] }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [selColor, setSelColor] = useState(0);
  const [added, setAdded] = useState(false);

  const colors = p.clrs ?? [p.c];

  const handleAdd = () => {
    addItem({ id: p.id, name: p.name, price: p.price, c: colors[selColor], image: p.image, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{ maxWidth: 1360, margin: '0 auto', padding: '60px 48px 100px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: 'var(--text-light)', marginBottom: 48, letterSpacing: '0.06em' }}>
        <Link href="/">Startseite</Link>
        <span>/</span>
        <Link href="/catalogue">Kollektion</Link>
        <span>/</span>
        <span style={{ color: 'var(--text)' }}>{p.name}</span>
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, marginBottom: 100 }}>
        {/* Image */}
        <div>
          <div style={{ aspectRatio: '4/5', background: colors[selColor], transition: 'background 0.4s', overflow: 'hidden' }}>
            {p.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
        </div>

        {/* Info */}
        <div style={{ paddingTop: 20 }}>
          {p.tag && (
            <span style={{
              display: 'inline-block', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
              background: 'var(--text)', color: 'white', padding: '4px 10px', marginBottom: 20,
            }}>
              {p.tag}
            </span>
          )}

          <p style={{ fontSize: 11, color: 'var(--text-light)', letterSpacing: '0.06em', marginBottom: 8 }}>{p.cat}</p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 400, marginBottom: 8 }}>{p.name}</h1>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, color: 'var(--text)', marginBottom: 32 }}>
            {fmt(p.price)}
          </p>

          {p.desc && (
            <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.8, marginBottom: 40, maxWidth: 420 }}>{p.desc}</p>
          )}

          {/* Colors */}
          {colors.length > 1 && (
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-mid)', marginBottom: 12 }}>
                Farbe
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {colors.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setSelColor(i)}
                    style={{
                      width: 28, height: 28, borderRadius: '50%', background: c,
                      border: i === selColor ? '2px solid var(--text)' : '2px solid transparent',
                      outline: i === selColor ? '1px solid var(--text)' : 'none',
                      outlineOffset: 2, cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Specs */}
          {(p.dims || p.mat) && (
            <div style={{ padding: '24px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 32, display: 'flex', gap: 40 }}>
              {p.dims && (
                <div>
                  <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 6 }}>Maße</p>
                  <p style={{ fontSize: 13, color: 'var(--text)' }}>{p.dims}</p>
                </div>
              )}
              {p.mat && (
                <div>
                  <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 6 }}>Material</p>
                  <p style={{ fontSize: 13, color: 'var(--text)' }}>{p.mat}</p>
                </div>
              )}
            </div>
          )}

          {/* Qty + Add to cart */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', border: '1px solid var(--border-strong)' }}>
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{ padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mid)', fontSize: 16 }}
              >−</button>
              <span style={{ padding: '12px 16px', fontSize: 13, minWidth: 40, textAlign: 'center' }}>{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                style={{ padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mid)', fontSize: 16 }}
              >+</button>
            </div>

            <button
              onClick={handleAdd}
              style={{
                flex: 1, padding: '14px 28px',
                background: added ? 'var(--sage)' : 'var(--text)', color: 'white',
                border: 'none', cursor: 'pointer',
                fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                transition: 'background 0.3s',
              }}
            >
              {added ? '✓ Hinzugefügt' : 'In den Warenkorb'}
            </button>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, marginBottom: 36 }}>
            Aus der gleichen Kategorie
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px 32px' }}>
            {related.map(r => <PCard key={r.id} p={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}
