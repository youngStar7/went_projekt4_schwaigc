'use client';

import Link from 'next/link';
import { useState } from 'react';

const SLIDES = [
  {
    eyebrow: 'Designmöbel für Zuhause',
    h1a: 'Gestalten Sie',
    h1b: 'Ihren Komfort',
    desc: 'Noven — Möbel mit individueller Ästhetik, Handwerkskunst und zeitlosem Design für moderne Wohnräume.',
    rightBg: 'var(--sage-bg)',
    leftC: '#a09888',
    rightC: '#908878',
    label: 'Wohnzimmer',
  },
  {
    eyebrow: 'Neue Kollektion 2025',
    h1a: 'Zeitlose',
    h1b: 'Eleganz',
    desc: 'Jedes Stück handgefertigt in Europa. Natürliche Materialien, außergewöhnliche Qualität.',
    rightBg: '#ede9e4',
    leftC: '#c0a888',
    rightC: '#a08060',
    label: 'Schlafzimmer',
  },
];

const ROOMS = ['01', '02', '03', '04', '05'];
const ROOM_LABELS = ['Wohnzimmer', 'Schlafzimmer', 'Esszimmer', 'Büro', 'Terrasse'];

export default function Hero() {
  const [slide, setSlide] = useState(0);
  const s = SLIDES[slide];

  return (
    <div style={{ height: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
      {/* Left side */}
      <div style={{
        background: 'var(--white)', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '120px 72px 80px', position: 'relative',
      }}>
        {/* Large ghost number */}
        <span style={{
          position: 'absolute', top: 100, left: 56,
          fontFamily: 'var(--serif)', fontSize: 'clamp(80px,8vw,120px)',
          color: 'var(--border)', fontWeight: 300, lineHeight: 1,
          userSelect: 'none', letterSpacing: '-0.04em', zIndex: 0,
        }}>
          0{slide + 1}
        </span>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'var(--text-light)', marginBottom: 20,
          }}>
            {s.eyebrow}
          </div>

          <h1 style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(44px,5vw,72px)',
            fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.025em',
            marginBottom: 28, color: 'var(--text)',
          }}>
            {s.h1a}<br />
            <em style={{ fontWeight: 300 }}>{s.h1b}</em>
          </h1>

          <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.8, maxWidth: 300, marginBottom: 48 }}>
            {s.desc}
          </p>

          {/* Slide controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 60 }}>
            <button
              onClick={() => setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length)}
              style={{
                width: 42, height: 42, borderRadius: '50%', border: '1px solid var(--border-strong)',
                background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--text-mid)', transition: 'all 0.2s',
              }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => setSlide(s => (s + 1) % SLIDES.length)}
              style={{
                width: 42, height: 42, borderRadius: '50%', background: 'var(--sage)',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', transition: 'all 0.2s',
              }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5}>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
            <span style={{ fontSize: 11, color: 'var(--text-light)', letterSpacing: '0.06em', marginLeft: 4 }}>
              {String(slide + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
            </span>
          </div>

          <Link href="/catalogue" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 28px', background: 'var(--text)', color: 'white',
            fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
            fontFamily: 'var(--sans)', transition: 'background 0.2s',
          }}>
            Katalog ansehen
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>

        {/* Decorative image bottom-right */}
        <div style={{
          position: 'absolute', bottom: 0, right: 0, width: '45%', height: '55%',
          opacity: 0.6, background: s.leftC,
        }} />
      </div>

      {/* Right side */}
      <div style={{
        background: s.rightBg, display: 'flex', alignItems: 'flex-end',
        justifyContent: 'center', padding: '80px 48px', position: 'relative', overflow: 'hidden',
        transition: 'background 0.5s',
      }}>
        {/* Room list */}
        <div style={{ position: 'absolute', top: 32, right: 36, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ROOMS.map((n, i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontSize: 11, fontWeight: i === slide ? 500 : 300, letterSpacing: '0.05em',
                color: i === slide ? 'var(--sage)' : 'var(--text-light)',
              }}>
                {n}
              </span>
              {i === slide && (
                <span style={{ fontSize: 10, color: 'var(--sage)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {ROOM_LABELS[i]}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Product image placeholder */}
        <div style={{ width: '70%', maxWidth: 340, aspectRatio: '3/4', background: s.rightC, position: 'relative', zIndex: 1 }} />

        {/* Bottom label */}
        <div style={{
          position: 'absolute', bottom: 36, left: 36,
          fontSize: 11, color: 'var(--text-light)', letterSpacing: '0.06em',
        }}>
          Neue Kollektion 2025
        </div>
      </div>
    </div>
  );
}
