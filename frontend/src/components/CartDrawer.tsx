'use client';

import { useEffect } from 'react';
import { useCart } from './Providers';

export default function CartDrawer() {
  const { items, total, close, removeItem, updateQty } = useCart();

  useEffect(() => {
    document.body.classList.add('noscroll');
    return () => document.body.classList.remove('noscroll');
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(n);

  return (
    <>
      {/* Backdrop */}
      <div onClick={close} style={{
        position: 'fixed', inset: 0, background: 'rgba(26,26,24,0.35)',
        zIndex: 200, backdropFilter: 'blur(4px)',
      }} />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
        background: 'var(--white)', zIndex: 201, display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.08)',
      }}>
        {/* Header */}
        <div style={{
          padding: '32px 36px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 400 }}>Warenkorb</h2>
            <span style={{ fontSize: 11, color: 'var(--text-light)', letterSpacing: '0.06em' }}>
              {items.length} {items.length === 1 ? 'Artikel' : 'Artikel'}
            </span>
          </div>
          <button onClick={close} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mid)', padding: 4 }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {items.length === 0 ? (
            <div style={{ padding: '60px 36px', textAlign: 'center', color: 'var(--text-light)' }}>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 20, marginBottom: 8 }}>Ihr Warenkorb ist leer</p>
              <p style={{ fontSize: 13 }}>Fügen Sie Produkte hinzu, um fortzufahren.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} style={{
                display: 'flex', gap: 16, padding: '20px 36px',
                borderBottom: '1px solid var(--border)',
              }}>
                {/* Image / color placeholder */}
                <div style={{
                  width: 72, height: 72, borderRadius: 4, flexShrink: 0,
                  background: item.c, overflow: 'hidden',
                }}>
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{item.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 12 }}>{fmt(item.price)}</p>

                  {/* Qty controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 2 }}>
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        style={{ padding: '4px 10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mid)', fontSize: 14 }}
                      >−</button>
                      <span style={{ padding: '4px 8px', fontSize: 12, minWidth: 24, textAlign: 'center' }}>{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        style={{ padding: '4px 10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mid)', fontSize: 14 }}
                      >+</button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', fontSize: 11, letterSpacing: '0.04em' }}
                    >
                      Entfernen
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: 13, fontWeight: 500, flexShrink: 0 }}>{fmt(item.price * item.qty)}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '24px 36px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>Gesamt</span>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>{fmt(total)}</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 20 }}>Versand & Steuern werden beim Checkout berechnet</p>
            <button style={{
              width: '100%', padding: '14px 24px',
              background: 'var(--text)', color: 'white',
              border: 'none', cursor: 'pointer',
              fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
              transition: 'background 0.2s',
            }}>
              Zur Kasse
            </button>
          </div>
        )}
      </div>
    </>
  );
}
