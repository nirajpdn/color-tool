<script setup lang="ts">
import { computed, ref } from "vue";
import { toast } from "vue-sonner";
import { AnimatePresence, motion } from "motion-v";
import { Check, Copy, Palette, Upload, X } from "lucide-vue-next";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "~/components/ui/select";
import CodeBlock from "~/components/code-block.vue";

type ExportFormat = "hex" | "rgb" | "hsl" | "tailwind" | "css-vars";
type Category = "dominant" | "vibrant" | "muted";

interface ExtractedColor {
  hex: string;
  rgb: [number, number, number];
  category: Category;
}

const CATEGORY_ORDER = ["dominant", "vibrant", "muted"] as const;
const CATEGORY_LABELS: Record<Category, string> = {
  dominant: "Dominant",
  vibrant: "Vibrant",
  muted: "Muted",
};

const image = ref<string | null>(null);
const colors = ref<ExtractedColor[]>([]);
const exportFormat = ref<ExportFormat>("hex");
const copiedIdx = ref<number | null>(null);
const exportCopied = ref(false);
const isDragging = ref(false);
const isProcessing = ref(false);
const fileRef = ref<HTMLInputElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function colorDistance(
  a: [number, number, number],
  b: [number, number, number],
): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2,
  );
}

function getSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

function extractColorsFromCanvas(canvas: HTMLCanvasElement): ExtractedColor[] {
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const pixels: [number, number, number][] = [];
  const step = Math.max(1, Math.floor(data.length / 4 / 10000));

  for (let i = 0; i < data.length; i += 4 * step) {
    pixels.push([data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0]);
  }
  if (pixels.length === 0) return [];

  const k = 12;
  const centroids: [number, number, number][] = [];
  for (let i = 0; i < k; i++) {
    centroids.push(
      pixels[Math.floor(Math.random() * pixels.length)] ?? [0, 0, 0],
    );
  }

  for (let iter = 0; iter < 10; iter++) {
    const clusters: [number, number, number][][] = Array.from(
      { length: k },
      () => [],
    );
    for (const px of pixels) {
      let minIdx = 0;
      let minD = Infinity;
      for (let j = 0; j < k; j++) {
        const d = colorDistance(px, centroids[j] ?? [0, 0, 0]);
        if (d < minD) {
          minD = d;
          minIdx = j;
        }
      }
      clusters[minIdx]?.push(px);
    }

    for (let j = 0; j < k; j++) {
      const cluster = clusters[j];
      if (!cluster || cluster.length === 0) continue;
      const sum = cluster.reduce<[number, number, number]>(
        (acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]],
        [0, 0, 0],
      );
      centroids[j] = [
        Math.round(sum[0] / cluster.length),
        Math.round(sum[1] / cluster.length),
        Math.round(sum[2] / cluster.length),
      ];
    }
  }

  const unique: [number, number, number][] = [];
  for (const c of centroids) {
    if (!unique.some((u) => colorDistance(u, c) < 30)) unique.push(c);
  }

  const result = unique.map<ExtractedColor>((rgb) => {
    const sat = getSaturation(rgb[0], rgb[1], rgb[2]);
    const [, , l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    let category: Category = "dominant";
    if (sat > 0.5 && l > 20 && l < 80) category = "vibrant";
    else if (sat < 0.3) category = "muted";
    return { hex: rgbToHex(rgb[0], rgb[1], rgb[2]), rgb, category };
  });

  return result.slice(0, 10);
}

function formatColor(color: ExtractedColor, format: ExportFormat): string {
  const [r, g, b] = color.rgb;
  const [h, s, l] = rgbToHsl(r, g, b);
  if (format === "rgb") return `rgb(${r}, ${g}, ${b})`;
  if (format === "hsl") return `hsl(${h}, ${s}%, ${l}%)`;
  return color.hex;
}

function exportPalette(items: ExtractedColor[], format: ExportFormat): string {
  if (format === "tailwind") {
    return `// tailwind.config.ts\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${items
      .map((c, i) => `        'color-${i + 1}': '${c.hex}',`)
      .join("\n")}\n      },\n    },\n  },\n};`;
  }
  if (format === "css-vars") {
    return `// style.css\n:root {\n${items
      .map((c, i) => {
        const [h, s, l] = rgbToHsl(c.rgb[0], c.rgb[1], c.rgb[2]);
        return `  --color-${i + 1}: ${h} ${s}% ${l}%;`;
      })
      .join("\n")}\n}`;
  }
  return `// style.css\n${items.map((c) => formatColor(c, format)).join("\n")}`;
}

const displayFormat = computed<"hex" | "rgb" | "hsl">(() =>
  exportFormat.value === "tailwind" || exportFormat.value === "css-vars"
    ? "hex"
    : exportFormat.value,
);

const groupedColors = computed(() =>
  CATEGORY_ORDER.map((category) => ({
    category,
    items: colors.value
      .map((color, globalIdx) => ({ color, globalIdx }))
      .filter((entry) => entry.color.category === category),
  })).filter((group) => group.items.length > 0),
);

const exportedText = computed(() =>
  exportPalette(colors.value, exportFormat.value),
);

const processImage = (file: File) => {
  if (!file.type.startsWith("image/")) return;
  if (image.value) URL.revokeObjectURL(image.value);

  image.value = URL.createObjectURL(file);
  isProcessing.value = true;
  colors.value = [];

  const img = new Image();
  img.onload = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const scale = Math.min(1, 260 / Math.max(img.width, img.height));
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    colors.value = extractColorsFromCanvas(canvas);
    isProcessing.value = false;
  };
  img.onerror = () => {
    isProcessing.value = false;
    toast.error("Failed to process image");
  };
  img.src = image.value;
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) processImage(file);
};

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) processImage(file);
};

const copyColor = (idx: number) => {
  const color = colors.value[idx];
  if (!color) return;
  navigator.clipboard.writeText(formatColor(color, displayFormat.value));
  copiedIdx.value = idx;
  setTimeout(() => {
    copiedIdx.value = null;
  }, 1500);
  toast.success("Color copied");
};

const copyExport = () => {
  navigator.clipboard.writeText(exportedText.value);
  exportCopied.value = true;
  setTimeout(() => {
    exportCopied.value = false;
  }, 1500);
  toast.success("Palette copied");
};

const clearImage = () => {
  if (image.value) URL.revokeObjectURL(image.value);
  image.value = null;
  colors.value = [];
  isProcessing.value = false;
  if (fileRef.value) fileRef.value.value = "";
};
</script>

<template>
  <div class="min-h-screen bg-background">
    <canvas ref="canvasRef" class="hidden" />
    <div
      class="border-b border-border bg-linear-to-b from-[hsl(var(--hero-gradient-start))] to-background px-4 pt-16 pb-10"
    >
      <div class="mx-auto max-w-3xl text-center">
        <motion.div
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          class="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground"
        >
          <Palette class="h-4 w-4 text-primary" />
          Image Palette Extractor
        </motion.div>
        <motion.h1
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          class="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
        >
          Extract Colors <span class="text-primary">from Images</span>
        </motion.h1>
        <motion.p
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.1 }"
          class="mt-3 text-muted-foreground"
        >
          Upload an image to extract dominant, vibrant & muted colors. Export as
          HEX, RGB, HSL, Tailwind config or CSS variables.
        </motion.p>
      </div>
    </div>
    <div class="mx-auto max-w-4xl px-4 py-10">
      <motion.div
        v-if="!image"
        :class="[
          'cursor-pointer rounded-2xl border-2 border-dashed p-16 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/50',
        ]"
        @click="fileRef?.click()"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop="handleDrop"
      >
        <Upload class="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <p class="font-display text-lg font-semibold text-foreground">
          Drop an image here or click to upload
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          PNG, JPG, WEBP supported
        </p>
        <input
          ref="fileRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileChange"
        />
      </motion.div>

      <div v-else class="space-y-8">
        <Card class="overflow-hidden">
          <div class="relative">
            <img
              :src="image"
              alt="Uploaded"
              class="max-h-80 w-full object-contain bg-muted"
            />
            <Button
              variant="secondary"
              size="icon"
              class="absolute right-3 top-3 rounded-full shadow-md"
              @click="clearImage"
            >
              <X class="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <div v-if="isProcessing" class="py-8 text-center text-muted-foreground">
          Extracting colors...
        </div>

        <template v-else-if="colors.length">
          <div v-for="group in groupedColors" :key="group.category">
            <h3
              class="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {{ CATEGORY_LABELS[group.category] }} Tones
            </h3>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              <motion.div
                v-for="(entry, i) in group.items"
                :key="`${entry.color.hex}-${entry.globalIdx}`"
                :initial="{ opacity: 0, y: 10 }"
                :animate="{ opacity: 1, y: 0 }"
                :transition="{ delay: i * 0.04 }"
              >
                <Card
                  class="group cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
                  @click="copyColor(entry.globalIdx)"
                >
                  <div
                    class="h-20 w-full"
                    :style="{ backgroundColor: entry.color.hex }"
                  />
                  <CardContent class="flex items-center justify-between p-3">
                    <span class="font-mono text-xs text-foreground">
                      {{ formatColor(entry.color, displayFormat) }}
                    </span>
                    <AnimatePresence mode="wait">
                      <motion.div
                        v-if="copiedIdx === entry.globalIdx"
                        key="check"
                        :initial="{ scale: 0 }"
                        :animate="{ scale: 1 }"
                        :exit="{ scale: 0 }"
                      >
                        <Check class="h-3.5 w-3.5 text-primary" />
                      </motion.div>
                      <motion.div
                        v-else
                        key="copy"
                        :initial="{ scale: 0 }"
                        :animate="{ scale: 1 }"
                        :exit="{ scale: 0 }"
                      >
                        <Copy class="h-3.5 w-3.5 text-muted-foreground" />
                      </motion.div>
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
          <Card>
            <CardContent class="p-5">
              <div class="mb-4 flex items-center justify-between gap-2">
                <h3 class="font-display text-sm font-semibold text-foreground">
                  Export Palette
                </h3>
                <div class="flex items-center gap-2">
                  <Select
                    v-model="exportFormat"
                    class="rounded-md border bg-background px-2 py-1 text-sm"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Export format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hex">HEX</SelectItem>
                      <SelectItem value="rgb">RGB</SelectItem>
                      <SelectItem value="hsl">HSL</SelectItem>
                      <SelectItem value="tailwind">Tailwind Config</SelectItem>
                      <SelectItem value="css-vars">CSS Variables</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <CodeBlock :code="exportedText" />
              </div>
            </CardContent>
          </Card>
        </template>
      </div>
    </div>
  </div>
</template>
