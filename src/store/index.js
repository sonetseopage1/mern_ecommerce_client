import { configureStore, createSlice } from '@reduxjs/toolkit';

const safe = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const auth = createSlice({
  name: 'auth',
  initialState: { user: null, ready: false },
  reducers: {
    setUser: (s, a) => { s.user = a.payload; s.ready = true; },
    logout: (s) => { s.user = null; s.ready = true; try { localStorage.removeItem('token'); } catch {} },
  },
});

const cart = createSlice({
  name: 'cart',
  initialState: { items: [], coupon: null, hydrated: false },
  reducers: {
    hydrateCart: (s) => { s.items = safe.get('cart', []); s.coupon = safe.get('coupon', null); s.hydrated = true; },
    addItem: (s, { payload }) => {
      const ex = s.items.find((i) => i.key === payload.key);
      if (ex) ex.qty = Math.min(ex.qty + payload.qty, payload.stock);
      else s.items.push(payload);
      s.coupon = null; safe.set('cart', s.items); safe.set('coupon', null);
    },
    setQty: (s, { payload: { key, qty } }) => {
      const it = s.items.find((i) => i.key === key);
      if (it) it.qty = Math.max(1, Math.min(qty, it.stock));
      s.coupon = null; safe.set('cart', s.items); safe.set('coupon', null);
    },
    removeItem: (s, { payload }) => { s.items = s.items.filter((i) => i.key !== payload); s.coupon = null; safe.set('cart', s.items); safe.set('coupon', null); },
    setCoupon: (s, { payload }) => { s.coupon = payload; safe.set('coupon', payload); },
    clearCart: (s) => { s.items = []; s.coupon = null; safe.set('cart', []); safe.set('coupon', null); },
  },
});

const ui = createSlice({
  name: 'ui',
  initialState: { lang: 'bn' },
  reducers: {
    setLang: (s, { payload }) => { s.lang = payload; try { localStorage.setItem('lang', payload); document.cookie = `lang=${payload};path=/;max-age=31536000`; } catch {} },
  },
});

export const { setUser, logout } = auth.actions;
export const { hydrateCart, addItem, setQty, removeItem, setCoupon, clearCart } = cart.actions;
export const { setLang } = ui.actions;

export const makeStore = () => configureStore({ reducer: { auth: auth.reducer, cart: cart.reducer, ui: ui.reducer } });

// `shipping` is the charge for the chosen delivery area (null until the customer picks one at checkout)
export const cartTotals = (items, coupon, shipping = null) => {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  const shippingKnown = typeof shipping === 'number';
  const ship = shippingKnown ? shipping : 0;
  return { subtotal, discount, payable: subtotal - discount, shipping: ship, shippingKnown, total: subtotal - discount + ship, count: items.reduce((s, i) => s + i.qty, 0) };
};
