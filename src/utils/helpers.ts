export function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
export function fmtDate(d: Date) { return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }); }

export type Fruit = { name: string; typeId: number; weight: string; length: string };

const FRUITS: Record<number, Fruit> = {
  6:  { name: "Kacang Polong", typeId: 6,  weight: "< 1 g",  length: "0.6 cm"  },
  8:  { name: "Raspberry",     typeId: 8,  weight: "1 g",    length: "1.6 cm"  },
  12: { name: "Jeruk Nipis",   typeId: 12, weight: "14 g",   length: "5.4 cm"  },
  16: { name: "Alpukat",       typeId: 16, weight: "100 g",  length: "11.6 cm" },
  20: { name: "Pisang",        typeId: 20, weight: "300 g",  length: "16.4 cm" },
  24: { name: "Jagung",        typeId: 24, weight: "600 g",  length: "30 cm"   },
  28: { name: "Terong",        typeId: 28, weight: "1 kg",   length: "37.6 cm" },
  32: { name: "Nanas",         typeId: 32, weight: "1.7 kg", length: "42.4 cm" },
  36: { name: "Melon",         typeId: 36, weight: "2.6 kg", length: "47.4 cm" },
  40: { name: "Semangka",      typeId: 40, weight: "3.5 kg", length: "51 cm"   },
};

export function getFruit(w: number) {
  const keys = Object.keys(FRUITS).map(Number).sort((a, b) => a - b);
  let k = keys[0];
  for (const n of keys) if (w >= n) k = n;
  return FRUITS[k];
}
