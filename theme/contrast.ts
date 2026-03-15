/**
 * Normalize hex to 6-digit form and parse to RGB.
 * Handles 3- and 6-digit hex with or without leading #.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace(/^#/, "");
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    return { r, g, b };
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
    return { r, g, b };
  }
  return null;
}

/**
 * Relative luminance (0–1). Used to decide if a background is "dark".
 * Formula: (0.299*R + 0.587*G + 0.114*B) / 255
 */
function relativeLuminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

const DARK_THRESHOLD = 0.4;
const LIGHT_TEXT = "#ffffff";
const DARK_TEXT = "#111827";

/**
 * Returns true if the given hex color is dark (low luminance).
 * Use to choose text color: white on dark, dark on light.
 */
export function isColorDark(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const luminance = relativeLuminance(rgb.r, rgb.g, rgb.b);
  return luminance < DARK_THRESHOLD;
}

/**
 * Returns a contrasting text color for the given background hex:
 * white (#ffffff) when background is dark, dark (#111827) when light.
 */
export function getContrastTextColor(hex: string): string {
  return isColorDark(hex) ? LIGHT_TEXT : DARK_TEXT;
}
