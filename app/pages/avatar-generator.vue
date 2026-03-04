<script setup lang="ts">
import { Check, Copy, Download } from "lucide-vue-next";
import { motion, AnimatePresence } from "motion-v";
import { computed, ref } from "vue";

const text = ref("John Doe");
const bgColor = ref("#0d9488");
const textColor = ref("#ffffff");
const radius = ref(50);
const size = 200;
const copied = ref(false);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const getInitials = (input: string) => {
  const words = input.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0]?.[0]?.toUpperCase() || "";
  return `${words[0]?.[0] || ""}${words[words.length - 1]?.[0] || ""}`.toUpperCase();
};

const initials = computed(() => getInitials(text.value));
const borderRadiusPx = computed(() => (radius.value / 100) * (size / 2));

const drawCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return null;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  canvas.width = size;
  canvas.height = size;

  const r = borderRadiusPx.value;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.clip();

  ctx.fillStyle = bgColor.value;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = textColor.value;
  ctx.font = `bold ${size * 0.38}px 'Outfit', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials.value, size / 2, size / 2);

  return canvas;
};

const exportPNG = () => {
  const canvas = drawCanvas();
  if (!canvas) return;
  const link = document.createElement("a");
  link.download = `avatar-${initials.value.toLowerCase() || "avatar"}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
};

const copyToClipboard = async () => {
  const canvas = drawCanvas();
  if (!canvas) return;

  canvas.toBlob(async (blob) => {
    if (!blob) return;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 1500);
  });
};
</script>

<template>
  <div class="min-h-screen bg-background">
    <section class="relative overflow-hidden px-4 pb-10 pt-20">
      <div
        class="pointer-events-none absolute inset-0 -z-10"
        :style="{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, hsl(174 62% 92%), transparent)',
        }"
      />
      <div class="mx-auto max-w-2xl text-center">
        <motion.h1
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          class="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
        >
          Avatar <span class="text-primary">Generator</span>
        </motion.h1>
        <motion.p
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.1 }"
          class="mt-3 text-muted-foreground"
        >
          Generate initial-based avatars and export as PNG.
        </motion.p>
      </div>
    </section>

    <section class="mx-auto max-w-3xl px-4 pb-20">
      <motion.div
        :initial="{ opacity: 0, y: 24 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.15 }"
        class="rounded-2xl border border-border bg-card p-6 shadow-lg"
      >
        <div
          class="flex flex-col items-center gap-8 md:flex-row md:items-start"
        >
          <div class="flex flex-col items-center gap-4">
            <div
              class="flex items-center justify-center shadow-lg transition-all duration-300"
              :style="{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: bgColor,
                borderRadius: `${borderRadiusPx}px`,
              }"
            >
              <span
                class="select-none font-display font-bold"
                :style="{
                  color: textColor,
                  fontSize: `${size * 0.38}px`,
                }"
              >
                {{ initials }}
              </span>
            </div>

            <div class="flex gap-2">
              <button
                class="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition-opacity hover:opacity-90"
                @click="exportPNG"
              >
                <Download class="h-4 w-4" /> Export PNG
              </button>
              <button
                class="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                @click="copyToClipboard"
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    v-if="copied"
                    key="check"
                    :initial="{ scale: 0 }"
                    :animate="{ scale: 1 }"
                    :exit="{ scale: 0 }"
                    class="flex items-center gap-1"
                  >
                    <Check class="h-4 w-4" /> Copied
                  </motion.span>
                  <motion.span
                    v-else
                    key="copy"
                    :initial="{ scale: 0 }"
                    :animate="{ scale: 1 }"
                    :exit="{ scale: 0 }"
                    class="flex items-center gap-1"
                  >
                    <Copy class="h-4 w-4" /> Copy
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>

          <div class="w-full flex-1 space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-foreground">
                Text / Name
              </label>
              <input
                v-model="text"
                type="text"
                placeholder="John Doe"
                class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p class="mt-1 text-xs text-muted-foreground">
                Shows first letter(s):
                <span class="font-mono font-semibold text-primary">
                  {{ initials || "-" }}
                </span>
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-foreground">
                  Background
                </label>
                <div class="flex items-center">
                  <input
                    v-model="bgColor"
                    type="color"
                    class="h-9 w-9 min-w-9 cursor-pointer border-none rounded-md"
                  />
                  <input
                    v-model="bgColor"
                    type="text"
                    class="flex-1 w-full rounded-none rounded-r-md border border-border bg-background px-2 py-1 font-mono text-sm text-foreground"
                  />
                </div>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-foreground">
                  Text Color
                </label>
                <div class="flex items-center">
                  <input
                    v-model="textColor"
                    type="color"
                    class="h-9 w-9 min-w-9 cursor-pointer rounded border-none"
                  />
                  <input
                    v-model="textColor"
                    type="text"
                    class="flex-1 w-full border rounded-none rounded-r-md border-border bg-background px-2 py-1 font-mono text-sm text-foreground"
                  />
                </div>
              </div>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-foreground">
                Border Radius -
                <span class="font-mono text-primary">{{ radius }}%</span>
              </label>
              <input
                v-model.number="radius"
                type="range"
                min="0"
                max="100"
                class="w-full accent-primary"
              />
              <div
                class="mt-1 flex justify-between text-xs text-muted-foreground"
              >
                <span>Square</span>
                <span>Circle</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>

    <canvas ref="canvasRef" class="hidden" />
  </div>
</template>
