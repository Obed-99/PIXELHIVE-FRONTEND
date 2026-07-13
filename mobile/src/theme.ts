import { useSyncExternalStore } from 'react';

// PixelHive brand colors — dark theme (default) and light theme.
export const darkColors = {
  brand: '#0EA5A4',      // teal - primary actions
  brandDark: '#2DD4CF',  // text on brandTint
  brandTint: '#0D2E2D',
  onBrand: '#04211F',    // text on teal buttons
  orange: '#F97316',     // payment / unlock moments
  onOrange: '#2B1000',
  bg: '#0B0F14',
  surface: '#162028',
  text: '#F5F5F5',
  textMuted: '#8A96A3',
  border: '#24303B',
  green: '#2DD4CF',
  greenTint: '#0D2E2D',
  gray: '#B7C2CC',
  grayTint: '#1E2A34',
  red: '#F87171',
};

export const lightColors: Palette = {
  brand: '#0EA5A4',
  brandDark: '#0B7A78',
  brandTint: '#CCF3F1',
  onBrand: '#04211F',
  orange: '#F97316',
  onOrange: '#2B1000',
  bg: '#F7FAFC',
  surface: '#FFFFFF',
  text: '#0B0F14',
  textMuted: '#5B6975',
  border: '#E2E8F0',
  green: '#0B7A78',
  greenTint: '#D9F5F3',
  gray: '#5B6975',
  grayTint: '#EDF1F5',
  red: '#B91C1C',
};

export type Palette = typeof darkColors;

// Tiny theme store: screens subscribe via useTheme() and re-render on toggle.
let mode: 'dark' | 'light' = 'dark';
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function toggleThemeMode() {
  mode = mode === 'dark' ? 'light' : 'dark';
  listeners.forEach((l) => l());
}

export function useThemeMode(): 'dark' | 'light' {
  return useSyncExternalStore(subscribe, () => mode, () => mode);
}

export function useTheme(): Palette {
  return useThemeMode() === 'dark' ? darkColors : lightColors;
}

// Static fallback (dark) — prefer useTheme() inside components.
export const colors = darkColors;

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
