<script setup lang="ts">
import { computed, ref } from "vue";
import { motion, AnimatePresence } from "motion-v";
import { Copy, Check, Plus, Trash2, RotateCw } from "lucide-vue-next";

interface GradientStop {
  id: string;
  color: string;
  position: number;
}

const GRADIENT_TYPES = ["linear", "radial", "conic"] as const;
type GradientType = (typeof GRADIENT_TYPES)[number];

const randomId = () => Math.random().toString(36).slice(2, 8);
const randColor = () =>
  `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;

const stops = ref<GradientStop[]>([
  { id: randomId(), color: "#0d9488", position: 0 },
  { id: randomId(), color: "#6366f1", position: 100 },
]);
const type = ref<GradientType>("linear");
const angle = ref(135);
const copied = ref(false);

const cssValue = computed(() => {
  const sortedStops = [...stops.value].sort((a, b) => a.position - b.position);
  const stopsStr = sortedStops
    .map((s) => `${s.color} ${s.position}%`)
    .join(", ");

  if (type.value === "linear") {
    return `linear-gradient(${angle.value}deg, ${stopsStr})`;
  }
  if (type.value === "radial") {
    return `radial-gradient(circle, ${stopsStr})`;
  }
  return `conic-gradient(from ${angle.value}deg, ${stopsStr})`;
});

const addStop = () => {
  stops.value.push({ id: randomId(), color: "#facc15", position: 50 });
};

const removeStop = (id: string) => {
  if (stops.value.length <= 2) return;
  stops.value = stops.value.filter((s) => s.id !== id);
};

const randomize = () => {
  stops.value = [
    { id: randomId(), color: randColor(), position: 0 },
    { id: randomId(), color: randColor(), position: 100 },
  ];
  angle.value = Math.floor(Math.random() * 360);
};

const handleCopy = async () => {
  await navigator.clipboard.writeText(`background: ${cssValue.value};`);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1500);
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
          Gradient <span class="text-primary">Generator</span>
        </motion.h1>
        <motion.p
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.1 }"
          class="mt-3 text-muted-foreground"
        >
          Create beautiful CSS gradients visually.
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
          class="mb-6 h-48 w-full rounded-xl border border-border shadow-inner"
          :style="{ background: cssValue }"
        />

        <div class="mb-5 flex flex-wrap items-center gap-3">
          <div class="flex gap-1 rounded-lg border border-border p-1">
            <button
              v-for="t in GRADIENT_TYPES"
              :key="t"
              class="rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors"
              :class="
                type === t
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="type = t"
            >
              {{ t }}
            </button>
          </div>

          <div
            v-if="type === 'linear' || type === 'conic'"
            class="flex items-center gap-2"
          >
            <label class="text-sm text-muted-foreground">Angle</label>
            <input
              v-model.number="angle"
              type="range"
              min="0"
              max="360"
              class="w-28 accent-primary"
            />
            <span class="w-10 font-mono text-xs text-muted-foreground"
              >{{ angle }}°</span
            >
          </div>

          <button
            class="ml-auto flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            @click="randomize"
          >
            <RotateCw class="h-3.5 w-3.5" /> Random
          </button>
        </div>

        <div class="mb-5 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-foreground">Color Stops</span>
            <button
              class="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-muted"
              @click="addStop"
            >
              <Plus class="h-3.5 w-3.5" /> Add
            </button>
          </div>

          <div
            v-for="stop in stops"
            :key="stop.id"
            class="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-3 py-2"
          >
            <input
              v-model="stop.color"
              type="color"
              class="h-8 w-8 cursor-pointer rounded border-none bg-transparent p-0"
            />
            <input
              v-model="stop.color"
              type="text"
              class="w-24 rounded-md border border-border bg-background px-2 py-1 font-mono text-sm text-foreground"
            />
            <input
              v-model.number="stop.position"
              type="range"
              min="0"
              max="100"
              class="flex-1 accent-primary"
            />
            <span class="w-10 font-mono text-xs text-muted-foreground"
              >{{ stop.position }}%</span
            >
            <button
              :disabled="stops.length <= 2"
              class="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-30"
              @click="removeStop(stop.id)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div class="rounded-lg border border-border bg-muted/50 p-3">
          <div class="mb-1 flex items-center justify-between">
            <span class="text-xs font-medium text-muted-foreground">CSS</span>
            <button
              class="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-muted"
              @click="handleCopy"
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
                  <Check class="h-3.5 w-3.5" /> Copied
                </motion.span>
                <motion.span
                  v-else
                  key="copy"
                  :initial="{ scale: 0 }"
                  :animate="{ scale: 1 }"
                  :exit="{ scale: 0 }"
                  class="flex items-center gap-1"
                >
                  <Copy class="h-3.5 w-3.5" /> Copy
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
          <code class="block break-all font-mono text-sm text-foreground">
            background: {{ cssValue }};
          </code>
        </div>
      </motion.div>
    </section>
  </div>
</template>
