'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/components/Providers';
import { useRouter } from 'next/navigation';

const fmt = (n: number) =>
  new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(n);

const PAYMENT_METHODS = [
  { id: 'card', label: 'Kreditkarte', icon: '💳', desc: 'Visa, Mastercard, Amex' },
  { id: 'paypal', label: 'PayPal', icon: '🅿', desc: 'Schnell & sicher' },
  { id: 'klarna', label: 'Klarna', icon: 'K', desc: 'Jetzt kaufen, später zahlen' },
  { id: 'invoice', label: 'Rechnung', icon: '📄', desc: 'Zahlung binnen 14 Tagen' },
];

function generateOrderNumber() {
  return '#NV-2025-' + String(Math.floor(Math.random() * 9000) + 1000);
}

const inputStyle = {
  width: '100%', padding: '13px 16px',
  border: '1px solid var(--border-strong)', background: 'var(--white)',
  fontSize: 13, color: 'var(--text)', outline: 'none',
  transition: 'border-color 0.2s',
} as const;

const labelStyle = {
  fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
  color: 'var(--text-light)', display: 'block', marginBottom: 8,
};

export default function CheckoutPage() {
  const { items, total, clearCart, close } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [orderNo, setOrderNo] = useState('');
  const [payMethod, setPayMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);

  const [addr, setAddr] = useState({
    vorname: '', nachname: '', email: '', telefon: '',
    strasse: '', nr: '', plz: '', stadt: '', land: 'Österreich',
  });
  const [card, setCard] = useState({ nr: '', name: '', exp: '', cvc: '' });

  const setA = (k: keyof typeof addr) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAddr(a => ({ ...a, [k]: e.target.value }));
  const setC = (k: keyof typeof card) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCard(c => ({ ...c, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      const no = generateOrderNumber();
      setOrderNo(no);
      clearCart();
      close();
      setStep('success');
      setSubmitting(false);
    }, 1400);
  };

  const shipping = total >= 150 ? 0 : 9.9;
  const grandTotal = total + shipping;

  // ── Success Screen ────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 560, width: '100%', padding: '0 24px', textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--sage-bg)', margin: '0 auto 32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>
            ✓
          </div>
          <p style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: 12 }}>
            Bestellung erfolgreich
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 400, marginBottom: 16 }}>
            Vielen Dank,<br />{addr.vorname || 'werter Kunde'}!
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.8, marginBottom: 32 }}>
            Ihre Bestellung <strong>{orderNo}</strong> wurde erfolgreich aufgegeben.<br />
            Sie erhalten in Kürze eine Bestätigung an <strong>{addr.email || 'Ihre E-Mail'}</strong>.
          </p>

          <div style={{ background: 'var(--white)', padding: '28px 32px', marginBottom: 32, textAlign: 'left' }}>
            {[
              ['Bestellnummer', orderNo],
              ['Lieferadresse', `${addr.strasse} ${addr.nr}, ${addr.plz} ${addr.stadt}`],
              ['Zahlungsart', PAYMENT_METHODS.find(m => m.id === payMethod)?.label ?? '–'],
              ['Lieferzeit', '2–4 Wochen'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-light)' }}>{k}</span>
                <span style={{ fontSize: 13, color: 'var(--text)', textAlign: 'right', maxWidth: '60%' }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/" style={{
              padding: '13px 28px', border: '1px solid var(--border-strong)',
              fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)',
            }}>
              Zur Startseite
            </Link>
            <Link href="/catalogue" style={{
              padding: '13px 28px', background: 'var(--text)', color: 'white',
              fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              Weiter einkaufen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty Cart ────────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div style={{ paddingTop: 68, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 28, marginBottom: 16 }}>Ihr Warenkorb ist leer</p>
          <Link href="/catalogue" style={{
            display: 'inline-block', padding: '13px 32px',
            background: 'var(--text)', color: 'white',
            fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            Zur Kollektion
          </Link>
        </div>
      </div>
    );
  }

  // ── Checkout Form ─────────────────────────────────────────────────────────────
  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 48px 100px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-light)', marginBottom: 40, letterSpacing: '0.06em' }}>
          <Link href="/catalogue" style={{ color: 'var(--text-light)' }}>Kollektion</Link>
          <span>/</span>
          <span style={{ color: 'var(--text)' }}>Kasse</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>

            {/* ── Left: Form ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Kontakt */}
              <section style={{ background: 'var(--white)', padding: '32px 36px' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, marginBottom: 28 }}>
                  Kontaktinformationen
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Vorname *</label>
                    <input value={addr.vorname} onChange={setA('vorname')} required style={inputStyle} placeholder="Max" autoComplete="given-name" />
                  </div>
                  <div>
                    <label style={labelStyle}>Nachname *</label>
                    <input value={addr.nachname} onChange={setA('nachname')} required style={inputStyle} placeholder="Mustermann" autoComplete="family-name" />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>E-Mail *</label>
                    <input type="email" value={addr.email} onChange={setA('email')} required style={inputStyle} placeholder="max@beispiel.at" autoComplete="email" />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>Telefon</label>
                    <input type="tel" value={addr.telefon} onChange={setA('telefon')} style={inputStyle} placeholder="+43 123 456 789" autoComplete="tel" />
                  </div>
                </div>
              </section>

              {/* Lieferadresse */}
              <section style={{ background: 'var(--white)', padding: '32px 36px' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, marginBottom: 28 }}>
                  Lieferadresse
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Straße *</label>
                    <input value={addr.strasse} onChange={setA('strasse')} required style={inputStyle} placeholder="Musterstraße" autoComplete="street-address" />
                  </div>
                  <div style={{ width: 100 }}>
                    <label style={labelStyle}>Nr. *</label>
                    <input value={addr.nr} onChange={setA('nr')} required style={inputStyle} placeholder="12a" />
                  </div>
                  <div style={{ width: 130 }}>
                    <label style={labelStyle}>PLZ *</label>
                    <input value={addr.plz} onChange={setA('plz')} required style={inputStyle} placeholder="1010" autoComplete="postal-code" />
                  </div>
                  <div>
                    <label style={labelStyle}>Stadt *</label>
                    <input value={addr.stadt} onChange={setA('stadt')} required style={inputStyle} placeholder="Wien" autoComplete="address-level2" />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>Land</label>
                    <select value={addr.land} onChange={setA('land')} style={{ ...inputStyle, appearance: 'none' }}>
                      {['Österreich', 'Deutschland', 'Schweiz', 'Liechtenstein'].map(l => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Zahlungsart */}
              <section style={{ background: 'var(--white)', padding: '32px 36px' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, marginBottom: 28 }}>
                  Zahlungsart
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {PAYMENT_METHODS.map(m => (
                    <label
                      key={m.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '16px 20px', cursor: 'pointer',
                        border: payMethod === m.id ? '1px solid var(--text)' : '1px solid var(--border)',
                        background: payMethod === m.id ? 'var(--surface)' : 'var(--white)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <input
                        type="radio" name="payment" value={m.id}
                        checked={payMethod === m.id}
                        onChange={() => setPayMethod(m.id)}
                        style={{ accentColor: 'var(--text)', width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{m.icon}</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{m.label}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>{m.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Kreditkarten-Felder */}
                {payMethod === 'card' && (
                  <div style={{ padding: '24px', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Kartennummer</label>
                      <input
                        value={card.nr}
                        onChange={e => setCard(c => ({ ...c, nr: e.target.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim().slice(0,19) }))}
                        style={inputStyle} placeholder="0000 0000 0000 0000"
                        maxLength={19} inputMode="numeric"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Name auf der Karte</label>
                      <input value={card.name} onChange={setC('name')} style={inputStyle} placeholder="MAX MUSTERMANN" autoComplete="cc-name" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Gültig bis</label>
                        <input
                          value={card.exp}
                          onChange={e => { const v = e.target.value.replace(/\D/g,''); setCard(c => ({ ...c, exp: v.length > 2 ? `${v.slice(0,2)}/${v.slice(2,4)}` : v })); }}
                          style={inputStyle} placeholder="MM/JJ" maxLength={5} inputMode="numeric"
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>CVC</label>
                        <input value={card.cvc} onChange={setC('cvc')} style={inputStyle} placeholder="123" maxLength={4} inputMode="numeric" />
                      </div>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      🔒 Ihre Zahlungsdaten werden verschlüsselt übertragen.
                    </p>
                  </div>
                )}

                {payMethod === 'paypal' && (
                  <div style={{ padding: 24, background: '#fff8f0', border: '1px solid #f0e8d8', textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-mid)' }}>
                      Nach dem Absenden werden Sie zu PayPal weitergeleitet.
                    </p>
                  </div>
                )}

                {payMethod === 'klarna' && (
                  <div style={{ padding: 24, background: '#fff0f5', border: '1px solid #f0d8e8', textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-mid)' }}>
                      Klarna — Kaufen Sie jetzt und zahlen Sie in 30 Tagen.
                    </p>
                  </div>
                )}

                {payMethod === 'invoice' && (
                  <div style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.7 }}>
                      Die Rechnung erhalten Sie zusammen mit Ihrer Lieferung. Zahlung binnen 14 Tagen.
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* ── Right: Order Summary ── */}
            <div style={{ position: 'sticky', top: 88 }}>
              <div style={{ background: 'var(--white)', padding: '28px 28px' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 400, marginBottom: 24 }}>
                  Bestellübersicht
                </h2>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 }}>
                  {items.map(item => (
                    <div key={item.id} style={{
                      display: 'flex', gap: 12, alignItems: 'center',
                      padding: '12px 0', borderBottom: '1px solid var(--border)',
                    }}>
                      <div style={{ width: 48, height: 48, background: item.c, flexShrink: 0, overflow: 'hidden' }}>
                        {item.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>× {item.qty}</p>
                      </div>
                      <p style={{ fontSize: 12, fontWeight: 500, flexShrink: 0 }}>{fmt(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-mid)' }}>Zwischensumme</span>
                    <span style={{ fontSize: 12 }}>{fmt(total)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-mid)' }}>Versand</span>
                    <span style={{ fontSize: 12, color: shipping === 0 ? 'var(--sage)' : 'var(--text)' }}>
                      {shipping === 0 ? 'Kostenlos' : fmt(shipping)}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p style={{ fontSize: 10, color: 'var(--text-light)' }}>
                      Ab {fmt(150)} kostenloser Versand
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid var(--border)', marginBottom: 24 }}>
                  <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>Gesamt</span>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400 }}>{fmt(grandTotal)}</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%', padding: '15px 24px',
                    background: submitting ? 'var(--sage)' : 'var(--text)', color: 'white',
                    border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                    fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
                    transition: 'background 0.3s', marginBottom: 16,
                  }}
                >
                  {submitting ? 'Wird verarbeitet…' : 'Bestellung aufgeben'}
                </button>

                <p style={{ fontSize: 10, color: 'var(--text-light)', textAlign: 'center', lineHeight: 1.6 }}>
                  Mit der Bestellung stimmen Sie unseren{' '}
                  <Link href="/" style={{ color: 'var(--text)' }}>AGB</Link>{' '}zu.
                </p>

                {/* Trust */}
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['🔒 SSL-verschlüsselte Übertragung', '↩ 30 Tage kostenlose Rückgabe', '✦ Handgefertigt in Deutschland'].map(t => (
                    <p key={t} style={{ fontSize: 11, color: 'var(--text-mid)' }}>{t}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
