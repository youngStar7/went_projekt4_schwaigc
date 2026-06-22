'use client';

import { createContext, useContext, useReducer, type ReactNode } from 'react';
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
}

type Action =
  | { type: 'ADD'; item: Omit<CartItem, 'qty'> & { qty?: number } }
  | { type: 'REMOVE'; id: string }
  | { type: 'QTY'; id: string; qty: number }
  | { type: 'OPEN' }
  | { type: 'CLOSE' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD': {
      const qty = action.item.qty ?? 1;
      const ex = state.items.find(i => i.id === action.item.id);
      return {
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
    case 'OPEN':
      return { ...state, isOpen: true };
    case 'CLOSE':
      return { ...state, isOpen: false };
  }
}

interface CartCtx {
  items: CartItem[];
  isOpen: boolean;
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  open: () => void;
  close: () => void;
}

const Ctx = createContext<CartCtx | null>(null);

export function useCart(): CartCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart outside Providers');
  return c;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], isOpen: false });

  const ctx: CartCtx = {
    items: state.items,
    isOpen: state.isOpen,
    count: state.items.reduce((s, i) => s + i.qty, 0),
    total: state.items.reduce((s, i) => s + i.price * i.qty, 0),
    addItem: item => dispatch({ type: 'ADD', item }),
    removeItem: id => dispatch({ type: 'REMOVE', id }),
    updateQty: (id, qty) => dispatch({ type: 'QTY', id, qty }),
    open: () => dispatch({ type: 'OPEN' }),
    close: () => dispatch({ type: 'CLOSE' }),
  };

  return (
    <Ctx.Provider value={ctx}>
      <Navbar />
      {state.isOpen && <CartDrawer />}
      {children}
    </Ctx.Provider>
  );
}
