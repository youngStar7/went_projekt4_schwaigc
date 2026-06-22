'use client';

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import Navbar from './Navbar';
import CartDrawer from './CartDrawer';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  c: string;
  image?: string | null;
}

interface State {
  items: CartItem[];
  isOpen: boolean;
  favourites: string[];
}

type Action =
  | { type: 'ADD'; item: Omit<CartItem, 'qty'> & { qty?: number } }
  | { type: 'REMOVE'; id: string }
  | { type: 'QTY'; id: string; qty: number }
  | { type: 'CLEAR' }
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'TOGGLE_FAV'; id: string }
  | { type: 'INIT_FAV'; ids: string[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD': {
      const qty = action.item.qty ?? 1;
      const ex = state.items.find(i => i.id === action.item.id);
      return {
        ...state,
        isOpen: true,
        items: ex
          ? state.items.map(i => i.id === action.item.id ? { ...i, qty: i.qty + qty } : i)
          : [...state.items, { ...action.item, qty }],
      };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter(i => i.id !== action.id) };
    case 'QTY':
      return { ...state, items: state.items.map(i => i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i) };
    case 'CLEAR':
      return { ...state, items: [] };
    case 'OPEN':
      return { ...state, isOpen: true };
    case 'CLOSE':
      return { ...state, isOpen: false };
    case 'TOGGLE_FAV': {
      const already = state.favourites.includes(action.id);
      return { ...state, favourites: already ? state.favourites.filter(id => id !== action.id) : [...state.favourites, action.id] };
    }
    case 'INIT_FAV':
      return { ...state, favourites: action.ids };
  }
}

interface CartCtx {
  items: CartItem[];
  isOpen: boolean;
  count: number;
  total: number;
  favourites: string[];
  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  open: () => void;
  close: () => void;
  toggleFavourite: (id: string) => void;
  isFavourite: (id: string) => boolean;
}

const Ctx = createContext<CartCtx | null>(null);

export function useCart(): CartCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart outside Providers');
  return c;
}

const FAV_KEY = 'noven_favourites';

export default function Providers({ children, isLoggedIn }: { children: ReactNode; isLoggedIn?: boolean }) {
  const [state, dispatch] = useReducer(reducer, { items: [], isOpen: false, favourites: [] });

  // Load favourites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAV_KEY);
      if (stored) dispatch({ type: 'INIT_FAV', ids: JSON.parse(stored) });
    } catch { /* ignore */ }
  }, []);

  // Persist favourites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(state.favourites));
    } catch { /* ignore */ }
  }, [state.favourites]);

  const ctx: CartCtx = {
    items: state.items,
    isOpen: state.isOpen,
    count: state.items.reduce((s, i) => s + i.qty, 0),
    total: state.items.reduce((s, i) => s + i.price * i.qty, 0),
    favourites: state.favourites,
    addItem: item => dispatch({ type: 'ADD', item }),
    removeItem: id => dispatch({ type: 'REMOVE', id }),
    updateQty: (id, qty) => dispatch({ type: 'QTY', id, qty }),
    clearCart: () => dispatch({ type: 'CLEAR' }),
    open: () => dispatch({ type: 'OPEN' }),
    close: () => dispatch({ type: 'CLOSE' }),
    toggleFavourite: id => dispatch({ type: 'TOGGLE_FAV', id }),
    isFavourite: id => state.favourites.includes(id),
  };

  return (
    <Ctx.Provider value={ctx}>
      <Navbar isLoggedIn={isLoggedIn} favCount={state.favourites.length} />
      {state.isOpen && <CartDrawer />}
      {children}
    </Ctx.Provider>
  );
}
