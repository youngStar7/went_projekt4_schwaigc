'use client';

import { useRef } from 'react';
import PCard from './PCard';
import type { Product } from '@/lib/products';

export default function Bestsellers({ products }: { products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => ref.current?.scrollBy({ left: d * 320, behavior: 'smooth' });

  if (products.length === 0) return null;

  return (
    <section style={{ padding: '100px 0 80px', background: 'var(--white)' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '0 48px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 8 }}>
              Beliebt
            </p>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,3vw,40px)', fontWeight: 400 }}>
              Bestseller <span style={{ color: 'var(--text-light)', fontStyle: 'italic', fontWeight: 300 }}>/ Unsere beliebtesten Stücke</span>
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => scroll(-1)} style={{
              width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border-strong)',
              background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-mid)',
            }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button onClick={() => scroll(1)} style={{
              width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border-strong)',
              background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-mid)',
            }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>

        {/* Scroll container */}
        <div ref={ref} style={{ display: 'flex', gap: 24, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 8 }}>
          {products.map(p => (
            <div key={p.id} style={{ flex: '0 0 280px' }}>
              <PCard p={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
