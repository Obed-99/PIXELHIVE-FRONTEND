// PixelHive brand + UI colors (dark teal/orange rebrand).
export const colors = {
  brand: '#0EA5A4',      // teal - primary actions
  brandDark: '#2DD4CF',  // light teal - text on brandTint
  brandTint: '#0D2E2D',  // dark teal tint - chips, avatars
  onBrand: '#04211F',    // text on teal buttons
  orange: '#F97316',     // payment / unlock moments
  onOrange: '#2B1000',   // text on orange buttons
  bg: '#0B0F14',
  surface: '#162028',    // card / preview background
  text: '#F5F5F5',
  textMuted: '#8A96A3',
  border: '#24303B',
  green: '#2DD4CF',
  greenTint: '#0D2E2D',
  gray: '#B7C2CC',
  grayTint: '#1E2A34',
  red: '#F87171',
};

// Simple money formatter: 1500 -> "1,500"
export function formatMoney(n: number | null | undefined): string {
  const v = Number(n ?? 0);
  return v.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Initials from a full name: "Obed Opoku Junior" -> "OO"
export function initials(name?: string | null): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
