'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from './Providers';

const NAV = [
  { label: 'Kollektion', href: '/catalogue' },
  { label: 'Neuheiten', href: '/catalogue?tag=neu' },
  { label: 'Über uns', href: '/' },
];

interface NavbarProps {
  isLoggedIn?: boolean;
  favCount?: number;
}

export default function Navbar({ isLoggedIn = false, favCount = 0 }: NavbarProps) {
  const pathname = usePathname();
  const { count, open } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const userHref = isLoggedIn ? '/dashboard' : '/login';
  const isUserActive = pathname === '/dashboard' || pathname === '/login';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(16px)',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.3s',
    }}>
      <div style={{
        maxWidth: 1360, margin: '0 auto', padding: '0 48px',
        height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{
          fontFamily: 'var(--serif)', fontSize: 20, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'var(--text)', fontWeight: 400,
        }}>
          Noven
        </Link>

        {/* Center links */}
        <div style={{ display: 'flex', gap: 40 }}>
          {NAV.map(({ label, href }) => (
            <Link key={label} href={href} style={{
              fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: pathname.startsWith(href.split('?')[0]) && href !== '/'
                ? 'var(--text)' : 'var(--text-light)',
              fontFamily: 'var(--sans)', transition: 'color 0.2s', fontWeight: 400,
            }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Search */}
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'flex', padding: 0 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <circle cx={11} cy={11} r={8} /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Favourites */}
          <Link href="/favourites" style={{
            color: pathname === '/favourites' ? '#c07070' : 'var(--text-light)',
            display: 'flex', position: 'relative',
          }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill={pathname === '/favourites' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {favCount > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -7,
                background: '#c07070', color: 'white', borderRadius: '50%',
                width: 15, height: 15, fontSize: 8, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontWeight: 500,
              }}>
                {favCount}
              </span>
            )}
          </Link>

          {/* User */}
          <Link href={userHref} style={{
            color: isUserActive ? 'var(--sage)' : 'var(--text-light)',
            display: 'flex', position: 'relative',
          }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} />
            </svg>
            {isLoggedIn && (
              <span style={{
                position: 'absolute', top: -3, right: -4,
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--sage)', border: '1.5px solid white',
              }} />
            )}
          </Link>

          {/* Cart */}
          <button onClick={open} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text)', display: 'flex', position: 'relative', padding: 0,
          }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1={3} y1={6} x2={21} y2={6} />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {count > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -7,
                background: 'var(--sage)', color: 'white', borderRadius: '50%',
                width: 15, height: 15, fontSize: 8, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontWeight: 500,
              }}>
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
