const ITEMS = [
  'Kostenloser Versand ab 500€',
  'Handgefertigt in Europa',
  '5 Jahre Garantie',
  'Persönliche Beratung',
];

export default function Banner() {
  return (
    <div style={{
      background: 'var(--text)', color: 'var(--white)',
      padding: '16px 48px', display: 'flex', justifyContent: 'center',
      gap: 56, fontSize: 11, letterSpacing: '0.06em', flexWrap: 'wrap',
    }}>
      {ITEMS.map(t => (
        <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, opacity: 0.7 }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {t}
        </span>
      ))}
    </div>
  );
}
