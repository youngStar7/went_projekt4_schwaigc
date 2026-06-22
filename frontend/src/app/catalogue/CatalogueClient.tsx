'use client';

import { useState } from 'react';
import PCard from '@/components/PCard';
import type { Product } from '@/lib/products';

const CATS = ['Alle', 'Stühle', 'Tische', 'Sofas', 'Schränke', 'Betten', 'Regale'];

export default function CatalogueClient({ products, initialCat }: { products: Product[]; initialCat: string }) {
  const [cat, setCat] = useState(initialCat);

  const filtered = cat === 'Alle' ? products : products.filter(p => p.cat === cat);

  return (
    <div style={{ maxWidth: 1360, margin: '0 auto', padding: '60px 48px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 56 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 12 }}>
          Noven Shop
        </p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px,4vw,56px)', fontWeight: 300, letterSpacing: '-0.02em' }}>
          Unsere Kollektion
        </h1>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 48, borderBottom: '1px solid var(--border)' }}>
        {CATS.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '12px 24px', fontSize: 11, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: cat === c ? 'var(--text)' : 'var(--text-light)',
              borderBottom: `2px solid ${cat === c ? 'var(--text)' : 'transparent'}`,
              marginBottom: -1, transition: 'all 0.2s',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Product count */}
      <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 32 }}>
        {filtered.length} {filtered.length === 1 ? 'Produkt' : 'Produkte'}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-light)' }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 24, marginBottom: 12 }}>Keine Produkte gefunden</p>
          <p style={{ fontSize: 13 }}>Produkte werden im Sulu-Admin angelegt und veröffentlicht.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '48px 32px',
        }}>
          {filtered.map(p => <PCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
