import { parse, formatHex, formatRgb, formatHsl, converter } from "culori";

export type ColorFormat =
  | "hex"
  | "rgb"
  | "rgba"
  | "hsl"
  | "hsla"
  | "hwb"
  | "lab"
  | "lch"
  | "oklab"
  | "oklch";

export function detectFormat(input: string): ColorFormat | null {
  const trimmed = input.trim().toLowerCase();
  if (/^#([0-9a-f]{3,8})$/i.test(trimmed)) return "hex";
  if (/^rgba?\s*\(/.test(trimmed)) {
    return trimmed.startsWith("rgba") ? "rgba" : "rgb";
  }
  if (/^hsla?\s*\(/.test(trimmed)) {
    return trimmed.startsWith("hsla") ? "hsla" : "hsl";
  }
  if (/^hwb\s*\(/.test(trimmed)) return "hwb";
  if (/^lab\s*\(/.test(trimmed)) return "lab";
  if (/^lch\s*\(/.test(trimmed)) return "lch";
  if (/^oklab\s*\(/.test(trimmed)) return "oklab";
  if (/^oklch\s*\(/.test(trimmed)) return "oklch";
  // Try named colors
  const parsed = parse(trimmed);
  if (parsed) return "hex";
  return null;
}

export function isValidColor(input: string): boolean {
  if (!input.trim()) return false;
  const parsed = parse(input.trim());
  return parsed !== undefined;
}

export function getHexPreview(input: string): string | null {
  const parsed = parse(input.trim());
  if (!parsed) return null;
  return formatHex(parsed) ?? null;
}

function roundTo(n: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

export function convertColor(
  input: string,
  targetFormat: ColorFormat,
): string | null {
  const parsed = parse(input.trim());
  if (!parsed) return null;

  switch (targetFormat) {
    case "hex":
      return formatHex(parsed) ?? null;

    case "rgb": {
      const s = formatRgb(parsed);
      return s ?? null;
    }

    case "rgba": {
      const rgb = converter("rgb")(parsed);
      if (!rgb) return null;
      const r = Math.round((rgb.r ?? 0) * 255);
      const g = Math.round((rgb.g ?? 0) * 255);
      const b = Math.round((rgb.b ?? 0) * 255);
      const a = roundTo(rgb.alpha ?? 1, 2);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    case "hsl": {
      return formatHsl(parsed) ?? null;
    }

    case "hsla": {
      const hsl = converter("hsl")(parsed);
      if (!hsl) return null;
      const h = roundTo(hsl.h ?? 0, 1);
      const s = roundTo((hsl.s ?? 0) * 100, 1);
      const l = roundTo((hsl.l ?? 0) * 100, 1);
      const a = roundTo(hsl.alpha ?? 1, 2);
      return `hsla(${h}, ${s}%, ${l}%, ${a})`;
    }

    case "hwb": {
      const hwb = converter("hwb")(parsed);
      if (!hwb) return null;
      const h = roundTo(hwb.h ?? 0, 1);
      const w = roundTo((hwb.w ?? 0) * 100, 1);
      const b = roundTo((hwb.b ?? 0) * 100, 1);
      return `hwb(${h} ${w}% ${b}%)`;
    }

    case "lab": {
      const lab = converter("lab")(parsed);
      if (!lab) return null;
      const l = roundTo(lab.l ?? 0, 2);
      const a = roundTo(lab.a ?? 0, 2);
      const b = roundTo(lab.b ?? 0, 2);
      return `lab(${l}% ${a} ${b})`;
    }

    case "lch": {
      const lch = converter("lch")(parsed);
      if (!lch) return null;
      const l = roundTo(lch.l ?? 0, 2);
      const c = roundTo(lch.c ?? 0, 2);
      const h = roundTo(lch.h ?? 0, 2);
      return `lch(${l}% ${c} ${h})`;
    }

    case "oklab": {
      const oklab = converter("oklab")(parsed);
      if (!oklab) return null;
      const l = roundTo(oklab.l ?? 0, 4);
      const a = roundTo(oklab.a ?? 0, 4);
      const b = roundTo(oklab.b ?? 0, 4);
      return `oklab(${l} ${a} ${b})`;
    }

    case "oklch": {
      const oklch = converter("oklch")(parsed);
      if (!oklch) return null;
      const l = roundTo(oklch.l ?? 0, 4);
      const c = roundTo(oklch.c ?? 0, 4);
      const h = roundTo(oklch.h ?? 0, 2);
      return `oklch(${l} ${c} ${h})`;
    }

    default:
      return null;
  }
}

export function getDefaultOutputFormat(
  inputFormat: ColorFormat | null,
): ColorFormat {
  if (inputFormat === "hex") return "rgb";
  return "hex";
}

export const OUTPUT_FORMATS: { value: ColorFormat; label: string }[] = [
  { value: "hex", label: "HEX" },
  { value: "rgb", label: "RGB" },
  { value: "rgba", label: "RGBA" },
  { value: "hsl", label: "HSL" },
  { value: "hsla", label: "HSLA" },
  { value: "hwb", label: "HWB" },
  { value: "lab", label: "LAB" },
  { value: "lch", label: "LCH" },
  { value: "oklab", label: "OKLab" },
  { value: "oklch", label: "OKLCh" },
];
