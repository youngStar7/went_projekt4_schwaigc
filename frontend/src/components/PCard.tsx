'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './Providers';
import type { Product } from '@/lib/products';

const fmt = (n: number) =>
  new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(n);

export default function PCard({ p }: { p: Product }) {
  const { addItem } = useCart();
  const [liked, setLiked] = useState(false);
  const [hov, setHov] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id: p.id, name: p.name, price: p.price, c: p.c, image: p.image });
    setAdding(true);
    setTimeout(() => setAdding(false), 1200);
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ cursor: 'pointer' }}
    >
      <Link href={`/catalogue/${p.id}`} style={{ display: 'block' }}>
        {/* Image */}
        <div style={{ position: 'relative', marginBottom: 16, overflow: 'hidden', aspectRatio: '3/4' }}>
          <div style={{
            width: '100%', height: '100%', background: p.c,
            transform: hov ? 'scale(1.03)' : 'scale(1)',
            transition: 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)',
            overflow: 'hidden',
          }}>
            {p.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>

          {/* Tag badge */}
          {p.tag && (
            <span style={{
              position: 'absolute', top: 12, left: 12,
              background: 'var(--text)', color: 'white',
              fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '4px 8px',
            }}>
              {p.tag}
            </span>
          )}

          {/* Like button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(l => !l); }}
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: liked ? '#c07070' : 'var(--text-mid)',
              transition: 'all 0.2s',
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Add to cart overlay */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'rgba(26,26,24,0.85)', padding: '14px 20px',
            transform: hov ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
            display: 'flex', justifyContent: 'center',
          }}>
            <button
              onClick={handleAdd}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: adding ? 'var(--sage-light)' : 'white',
                fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                transition: 'color 0.2s',
              }}
            >
              {adding ? '✓ Hinzugefügt' : 'In den Warenkorb'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{p.name}</p>
            <p style={{ fontSize: 13, color: 'var(--text-mid)' }}>{fmt(p.price)}</p>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-light)', letterSpacing: '0.04em' }}>{p.cat}</p>
        </div>
      </Link>
    </div>
  );
}
