// PixelHive brand + UI colors (the "honey hive" palette from the mockup).
export const colors = {
  brand: '#BA7517',      // honey amber - primary actions
  brandDark: '#854F0B',
  brandTint: '#FAEEDA',
  bg: '#FFFFFF',
  surface: '#F7F5EF',    // light card / preview background
  text: '#1A1A17',
  textMuted: '#6B6A63',
  border: '#E5E2D9',
  green: '#27500A',
  greenTint: '#EAF3DE',
  gray: '#444441',
  grayTint: '#F1EFE8',
  red: '#A32D2D',
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
