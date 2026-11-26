export const DEPTHS = ['Fair', 'Light', 'Medium', 'Tan', 'Deep', 'Rich'] as const;
export const UNDERTONES = ['Cool', 'Neutral', 'Warm', 'Olive'] as const;
export const SKIN_TYPES = ['Oily', 'Combination', 'Normal', 'Dry', 'Sensitive'] as const;
export const FINISHES = ['Matte', 'Natural', 'Dewy'] as const;
export const COVERAGES = ['Sheer', 'Medium', 'Full'] as const;
export const VALUES = ['Vegan', 'Cruelty-free', 'Fragrance-free'] as const;

export interface Filters {
  depth: string | null;
  undertone: string | null;
  skin: string | null;
  finish: string | null;
  coverage: string | null;
  values: string[];
}

export const EMPTY_FILTERS: Filters = { depth: null, undertone: null, skin: null, finish: null, coverage: null, values: [] };

export interface Product {
  code: string;
  name: string;
  brand: string | null;
  image_url: string | null;
  categories: string;
  quantity: string | null;
  ingredients: string[];
  labels: string[];
}

export interface Match {
  product: Product;
  score: number;
  reason: string;
}

export interface SavedFoundation {
  id: string;
  product_code: string;
  product_name: string;
  brand: string | null;
  image_url: string | null;
  shade_note: string | null;
  coverage: string | null;
  finish: string | null;
  rating: number | null;
  ingredients_text: string | null;
  notes: string | null;
}

export interface WearTest {
  id: string;
  product_code: string;
  product_name: string;
  hours_worn: number;
  oxidized: boolean;
  creased: boolean;
  verdict: string | null;
  tested_on: string;
}

const KEYWORDS = {
  depth: {
    Fair: ['fair', 'porcelain', 'ivory', 'pale'],
    Light: ['light', 'beige', 'ivory'],
    Medium: ['medium', 'sand', 'honey'],
    Tan: ['tan', 'golden', 'caramel'],
    Deep: ['deep', 'mocha', 'espresso'],
    Rich: ['rich', 'ebony', 'cocoa', 'deep'],
  } as Record<string, string[]>,
  undertone: {
    Cool: ['cool', 'rose', 'pink'],
    Neutral: ['neutral', 'natural'],
    Warm: ['warm', 'golden', 'yellow', 'peach'],
    Olive: ['olive', 'green'],
  } as Record<string, string[]>,
  skin: {
    Oily: ['oil-free', 'matte', 'mattifying', 'oil control', 'salicylic'],
    Combination: ['balancing', 'combination', 'oil-free', 'natural'],
    Normal: ['natural', 'satin', 'skin'],
    Dry: ['hydrating', 'hyaluronic', 'glycerin', 'squalane', 'moistur', 'dewy'],
    Sensitive: ['sensitive', 'hypoallergenic', 'fragrance-free', 'mineral'],
  } as Record<string, string[]>,
  finish: {
    Matte: ['matte', 'mattifying', 'velvet'],
    Natural: ['natural', 'satin', 'skin'],
    Dewy: ['dewy', 'radiant', 'glow', 'luminous', 'serum'],
  } as Record<string, string[]>,
  coverage: {
    Sheer: ['sheer', 'tint', 'serum', 'light', 'skin'],
    Medium: ['medium coverage', 'buildable', 'natural'],
    Full: ['full', 'high coverage', 'maximum', 'matte'],
  } as Record<string, string[]>,
};

function hit(text: string, words: string[]): boolean {
  return words.some((w) => text.includes(w));
}

export function activeFilterNames(f: Filters): string[] {
  const out: string[] = [];
  if (f.depth) out.push('depth ' + f.depth);
  if (f.undertone) out.push('undertone ' + f.undertone);
  if (f.skin) out.push('skin ' + f.skin);
  if (f.finish) out.push('finish ' + f.finish);
  if (f.coverage) out.push('coverage ' + f.coverage);
  f.values.forEach((v) => out.push(v));
  return out;
}

export function scoreProduct(p: Product, f: Filters): Match | null {
  const text = [p.name, p.brand ?? '', p.categories, p.ingredients.join(' '), p.labels.join(' ')].join(' ').toLowerCase();
  const hasFragrance = p.ingredients.some((i) => /parfum|fragrance/i.test(i));
  for (const v of f.values) {
    if (v === 'Vegan' && !p.labels.some((l) => /vegan/i.test(l))) return null;
    if (v === 'Cruelty-free' && !p.labels.some((l) => /cruelty/i.test(l))) return null;
    if (v === 'Fragrance-free' && hasFragrance) return null;
  }
  const checks: { label: string; weight: number; ok: boolean }[] = [];
  if (f.depth) checks.push({ label: 'depth ' + f.depth.toLowerCase(), weight: 10, ok: hit(text, KEYWORDS.depth[f.depth] ?? []) });
  if (f.undertone) checks.push({ label: f.undertone.toLowerCase() + ' undertone', weight: 10, ok: hit(text, KEYWORDS.undertone[f.undertone] ?? []) });
  if (f.skin) checks.push({ label: f.skin.toLowerCase() + ' skin', weight: 15, ok: hit(text, KEYWORDS.skin[f.skin] ?? []) });
  if (f.finish) checks.push({ label: f.finish.toLowerCase() + ' finish', weight: 15, ok: hit(text, KEYWORDS.finish[f.finish] ?? []) });
  if (f.coverage) checks.push({ label: f.coverage.toLowerCase() + ' coverage', weight: 15, ok: hit(text, KEYWORDS.coverage[f.coverage] ?? []) });
  if (checks.length === 0) {
    return { product: p, score: 50, reason: 'No preferences set yet. Showing the catalog in record order.' };
  }
  const total = checks.reduce((a, c) => a + c.weight, 0);
  const earned = checks.filter((c) => c.ok).reduce((a, c) => a + c.weight, 0);
  if (earned === 0) return null;
  const score = Math.round((earned / total) * 100);
  const matched = checks.filter((c) => c.ok).map((c) => c.label);
  const missed = checks.filter((c) => !c.ok).map((c) => c.label);
  let reason = 'Record mentions ' + matched.join(', ') + '.';
  if (missed.length) reason += ' No sign of ' + missed.join(', ') + '.';
  return { product: p, score, reason };
}

export function rankProducts(list: Product[], f: Filters): Match[] {
  return list
    .map((p) => scoreProduct(p, f))
    .filter((m): m is Match => m !== null)
    .sort((a, b) => b.score - a.score);
}

export const CATALOG: Product[] = [
  {
    code: '3614272049529',
    name: 'Skin Veil Serum Foundation, radiant light coverage',
    brand: 'Maison Alba',
    image_url: null,
    categories: 'Beauty, Makeup, Face, Foundations, Serum foundations',
    quantity: '30 ml',
    ingredients: ['Aqua', 'Glycerin', 'Squalane', 'Sodium Hyaluronate', 'Cyclopentasiloxane', 'Titanium Dioxide', 'Iron Oxides', 'Tocopherol', 'Phenoxyethanol'],
    labels: ['Cruelty-free', 'Fragrance-free'],
  },
  {
    code: '8809512340011',
    name: 'Velvet Matte Oil-Free Foundation, full coverage, warm beige',
    brand: 'Orrin & Pale',
    image_url: null,
    categories: 'Beauty, Makeup, Face, Foundations, Liquid foundations',
    quantity: '35 ml',
    ingredients: ['Aqua', 'Dimethicone', 'Talc', 'Kaolin', 'Salicylic Acid', 'Iron Oxides', 'Parfum', 'Phenoxyethanol'],
    labels: ['Cruelty-free'],
  },
  {
    code: '5060123456782',
    name: 'Mineral Veil Tinted Foundation, sensitive skin, neutral medium',
    brand: 'Terra Folk',
    image_url: null,
    categories: 'Beauty, Makeup, Face, Foundations, Mineral foundations',
    quantity: '28 g',
    ingredients: ['Mica', 'Zinc Oxide', 'Titanium Dioxide', 'Iron Oxides', 'Jojoba Esters', 'Tocopherol'],
    labels: ['Vegan', 'Cruelty-free', 'Fragrance-free', 'Organic'],
  },
  {
    code: '4005900112233',
    name: 'Glow Drops Dewy Foundation, hydrating, golden tan',
    brand: 'Solenne',
    image_url: null,
    categories: 'Beauty, Makeup, Face, Foundations, Liquid foundations',
    quantity: '30 ml',
    ingredients: ['Aqua', 'Glycerin', 'Butylene Glycol', 'Squalane', 'Mica', 'Iron Oxides', 'Parfum', 'Sodium Hyaluronate'],
    labels: ['Vegan'],
  },
  {
    code: '3600551987654',
    name: 'Natural Satin Skin Foundation, buildable medium coverage, olive deep',
    brand: 'Kessler Atelier',
    image_url: null,
    categories: 'Beauty, Makeup, Face, Foundations, Liquid foundations',
    quantity: '30 ml',
    ingredients: ['Aqua', 'Isododecane', 'Glycerin', 'Titanium Dioxide', 'Iron Oxides', 'Tocopherol', 'Phenoxyethanol'],
    labels: ['Cruelty-free', 'Fragrance-free'],
  },
  {
    code: '7350012345678',
    name: 'Balancing Oil Control Foundation, combination skin, cool porcelain',
    brand: 'Nordlys',
    image_url: null,
    categories: 'Beauty, Makeup, Face, Foundations, Liquid foundations',
    quantity: '32 ml',
    ingredients: ['Aqua', 'Niacinamide', 'Dimethicone', 'Silica', 'Zinc PCA', 'Iron Oxides', 'Parfum'],
    labels: ['Vegan', 'Cruelty-free'],
  },
  {
    code: '6291041500213',
    name: 'Luminous Cream Foundation, rich cocoa, warm undertone, full coverage',
    brand: 'Amara House',
    image_url: null,
    categories: 'Beauty, Makeup, Face, Foundations, Cream foundations',
    quantity: '40 g',
    ingredients: ['Caprylic/Capric Triglyceride', 'Shea Butter', 'Squalane', 'Iron Oxides', 'Titanium Dioxide', 'Tocopherol'],
    labels: ['Vegan', 'Cruelty-free', 'Fragrance-free'],
  },
  {
    code: '4260009876541',
    name: 'Skin Tint SPF, sheer natural finish, light neutral',
    brand: 'Wiesel Naturals',
    image_url: null,
    categories: 'Beauty, Makeup, Face, Foundations, Tinted moisturizers',
    quantity: '30 ml',
    ingredients: ['Aqua', 'Zinc Oxide', 'Glycerin', 'Aloe Barbadensis Leaf Juice', 'Iron Oxides', 'Tocopherol'],
    labels: ['Vegan', 'Organic', 'Fragrance-free'],
  },
];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
