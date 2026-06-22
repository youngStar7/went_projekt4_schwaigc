'use client';

import Link from 'next/link';
import { useCart } from '@/components/Providers';
import PCard from '@/components/PCard';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/products';

export default function FavouritesPage() {
  const { favourites, toggleFavourite } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favourites.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    // Fetch favourited products from the catalogue API
    Promise.all(
      favourites.map(slug =>
        fetch(`/api/product/${slug}`)
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
      )
    ).then(results => {
      setProducts(results.filter(Boolean) as Product[]);
      setLoading(false);
    });
  }, [favourites]);

  return (
    <>
      <div style={{ paddingTop: 68, minHeight: '70vh', background: 'var(--white)' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '60px 48px 100px' }}>

          {/* Header */}
          <div style={{ marginBottom: 56 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 10 }}>
              Meine Sammlung
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 400, lineHeight: 1.1 }}>
                Favoriten
              </h1>
              {favourites.length > 0 && (
                <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
                  {favourites.length} {favourites.length === 1 ? 'Produkt' : 'Produkte'}
                </span>
              )}
            </div>
          </div>

          {/* Empty state */}
          {!loading && favourites.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '80px 40px',
              border: '1px solid var(--border)', background: 'var(--surface)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 24, color: 'var(--border-strong)' }}>♡</div>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 400, marginBottom: 12 }}>
                Noch keine Favoriten
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-mid)', marginBottom: 32, lineHeight: 1.7 }}>
                Klicken Sie auf das Herz-Symbol bei einem Produkt,<br />um es hier zu speichern.
              </p>
              <Link href="/catalogue" style={{
                display: 'inline-block', padding: '14px 32px',
                background: 'var(--text)', color: 'white',
                fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                Zur Kollektion
              </Link>
            </div>
          )}

          {/* Loading */}
          {loading && favourites.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px 24px' }}>
              {favourites.map(id => (
                <div key={id} style={{ aspectRatio: '3/4', background: 'var(--surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          )}

          {/* Products grid */}
          {!loading && products.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px 24px' }}>
              {products.map(p => <PCard key={p.id} p={p} />)}
            </div>
          )}

          {/* Back link */}
          {!loading && (
            <div style={{ marginTop: 56, textAlign: 'center' }}>
              <Link href="/catalogue" style={{
                fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'var(--text-mid)', borderBottom: '1px solid var(--border-strong)', paddingBottom: 2,
              }}>
                Weiter einkaufen
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
