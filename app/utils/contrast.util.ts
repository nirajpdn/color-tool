import { parse, converter } from "culori";

/** Convert sRGB component to linear */
function sRGBtoLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Relative luminance per WCAG 2.1 */
export function relativeLuminance(color: string): number | null {
  const parsed = parse(color.trim());
  if (!parsed) return null;
  const rgb = converter("rgb")(parsed);
  if (!rgb) return null;
  const r = sRGBtoLinear(rgb.r ?? 0);
  const g = sRGBtoLinear(rgb.g ?? 0);
  const b = sRGBtoLinear(rgb.b ?? 0);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colors */
export function contrastRatio(color1: string, color2: string): number | null {
  const l1 = relativeLuminance(color1);
  const l2 = relativeLuminance(color2);
  if (l1 === null || l2 === null) return null;
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface WCAGResult {
  ratio: number;
  aa: { normalText: boolean; largeText: boolean; ui: boolean };
  aaa: { normalText: boolean; largeText: boolean };
}

export function checkWCAG(color1: string, color2: string): WCAGResult | null {
  const ratio = contrastRatio(color1, color2);
  if (ratio === null) return null;
  return {
    ratio,
    aa: {
      normalText: ratio >= 4.5,
      largeText: ratio >= 3,
      ui: ratio >= 3,
    },
    aaa: {
      normalText: ratio >= 7,
      largeText: ratio >= 4.5,
    },
  };
}

/** Color blindness simulation matrices (Brettel/Viénot approximations) */
type Matrix = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

const cbMatrices: Record<string, Matrix> = {
  protanopia: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  tritanopia: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
  achromatopsia: [
    0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114,
  ],
};

export type ColorBlindnessType = keyof typeof cbMatrices;

export const colorBlindnessTypes: {
  value: ColorBlindnessType;
  label: string;
  description: string;
}[] = [
  { value: "protanopia", label: "Protanopia", description: "No red cones" },
  {
    value: "deuteranopia",
    label: "Deuteranopia",
    description: "No green cones",
  },
  { value: "tritanopia", label: "Tritanopia", description: "No blue cones" },
  {
    value: "achromatopsia",
    label: "Achromatopsia",
    description: "Total color blindness",
  },
];

export function simulateColorBlindness(
  color: string,
  type: ColorBlindnessType,
): string | null {
  const parsed = parse(color.trim());
  if (!parsed) return null;
  const rgb = converter("rgb")(parsed);
  if (!rgb) return null;

  const r = (rgb.r ?? 0) * 255;
  const g = (rgb.g ?? 0) * 255;
  const b = (rgb.b ?? 0) * 255;

  const m = cbMatrices[type];
  if (!m) return null;

  const nr = Math.round(
    Math.min(255, Math.max(0, m[0] * r + m[1] * g + m[2] * b)),
  );
  const ng = Math.round(
    Math.min(255, Math.max(0, m[3] * r + m[4] * g + m[5] * b)),
  );
  const nb = Math.round(
    Math.min(255, Math.max(0, m[6] * r + m[7] * g + m[8] * b)),
  );

  return `rgb(${nr}, ${ng}, ${nb})`;
}
