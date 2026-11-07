// Mirrors server/utils/helpers.js so UI and checkout totals agree.
export function isFlashLive(p) {
  const f = p?.flashDeal;
  if (!f?.active) return false;
  const now = Date.now();
  return (!f.startsAt || now >= +new Date(f.startsAt)) && (!f.endsAt || now <= +new Date(f.endsAt));
}

export function priceOf(p, v) {
  const base = v ? v.price : p.price;
  const oldBase = v ? v.oldPrice : p.oldPrice;
  const flash = isFlashLive(p);
  const price = flash ? Math.round(base * (1 - p.flashDeal.discountPercent / 100)) : base;
  // when flash is live the "old" price is the regular selling price unless a higher MRP exists
  const old = flash ? Math.max(oldBase || 0, base) : oldBase;
  const hasOld = old && old > price;
  return { price, old: hasOld ? old : null, off: hasOld ? Math.round(((old - price) / old) * 100) : 0, flash };
}

// Range shown on cards for products with variants
export function priceRange(p) {
  if (!p.variants?.length) return { ...priceOf(p), min: priceOf(p).price, max: priceOf(p).price };
  const all = p.variants.map((v) => priceOf(p, v));
  const best = all.reduce((a, b) => (b.price < a.price ? b : a));
  return { ...best, min: best.price, max: Math.max(...all.map((x) => x.price)) };
}

export const stockOf = (p) => (p.variants?.length ? p.variants.reduce((s, v) => s + v.stock, 0) : p.stock);

export const L = (obj, lang) => (obj ? obj[lang] || obj.en || '' : '');

export function money(n, lang = 'en') {
  const v = Number(n || 0).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US');
  return `৳${v}`;
}

export function buildTree(flat) {
  const map = new Map(flat.map((c) => [c._id, { ...c, children: [] }]));
  const roots = [];
  map.forEach((c) => {
    if (c.parent && map.has(c.parent)) map.get(c.parent).children.push(c);
    else roots.push(c);
  });
  const sort = (a) => { a.sort((x, y) => x.order - y.order); a.forEach((c) => sort(c.children)); };
  sort(roots);
  return roots;
}

export function flattenTree(tree, depth = 0, out = []) {
  tree.forEach((c) => { out.push({ ...c, depth }); flattenTree(c.children, depth + 1, out); });
  return out;
}

export const statusColor = { pending: 'bg-amber-100 text-amber-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-indigo-100 text-indigo-700', delivered: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-600' };

// ---- variants: any number of option groups (Color, RAM, Storage, Size ...) ----------------------
export const attrsOf = (v) => (v?.attributes?.length ? v.attributes : [v?.color && { name: 'Color', value: v.color }, v?.size && { name: 'Size', value: v.size }].filter(Boolean));
export const attrOf = (v, name) => attrsOf(v).find((a) => a.name === name)?.value;
export const variantText = (v) => attrsOf(v).map((a) => a.value).join(' / ');

export function getOptionGroups(p) {
  if (p?.optionGroups?.length) return p.optionGroups;
  const vs = p?.variants || [];
  if (!vs.length) return [];
  const map = new Map();
  vs.forEach((v) => attrsOf(v).forEach((a) => {
    if (!map.has(a.name)) map.set(a.name, { name: a.name, type: a.name === 'Color' ? 'color' : 'text', values: new Map() });
    const g = map.get(a.name);
    if (!g.values.has(a.value)) g.values.set(a.value, a.name === 'Color' ? v.colorHex : undefined);
  }));
  return [...map.values()].map((g) => ({ ...g, values: [...g.values].map(([label, hex]) => ({ label, hex })) }));
}
