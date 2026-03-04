<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { motion, AnimatePresence } from "motion-v";
import { Check, Copy, ArrowRight } from "lucide-vue-next";
import {
  isValidColor,
  detectFormat,
  convertColor,
  getDefaultOutputFormat,
  getHexPreview,
  OUTPUT_FORMATS,
  type ColorFormat,
} from "@/utils/color.util";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "../ui/input";

const inputValue = ref("#2db8a2");
const outputFormat = ref<ColorFormat>("rgb");
const copied = ref(false);

const valid = computed(() => isValidColor(inputValue.value));
const detectedFormat = computed(() =>
  valid.value ? detectFormat(inputValue.value) : null,
);
const hexPreview = computed(() =>
  valid.value ? getHexPreview(inputValue.value) : null,
);
const outputValue = computed(() =>
  valid.value ? convertColor(inputValue.value, outputFormat.value) : null,
);

watch(detectedFormat, (format) => {
  if (format) {
    outputFormat.value = getDefaultOutputFormat(format);
  }
});

const handleCopy = async () => {
  if (!outputValue.value || !navigator?.clipboard) return;
  await navigator.clipboard.writeText(outputValue.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 1500);
};
</script>

<template>
  <section id="converter" class="relative px-4 pb-20">
    <div class="mx-auto max-w-2xl">
      <motion.div
        :initial="{ opacity: 0, y: 30 }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :viewport="{ once: true }"
        :transition="{ duration: 0.5 }"
        class="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8"
      >
        <div class="mb-6 flex items-center gap-4">
          <motion.div
            class="h-14 w-14 rounded-xl border border-border shadow-sm"
            :style="{ backgroundColor: hexPreview ?? 'transparent' }"
            :animate="{ scale: valid ? 1 : 0.9, opacity: valid ? 1 : 0.3 }"
            :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
          />
          <div>
            <h3 class="text-lg font-semibold text-foreground">Color Preview</h3>
            <span
              v-if="valid && detectedFormat"
              class="inline-block rounded-md bg-secondary px-2 py-0.5 font-mono text-xs uppercase tracking-wider text-muted-foreground"
            >
              {{ detectedFormat }} detected
            </span>
            <span
              v-else-if="inputValue.trim()"
              class="text-sm text-destructive"
            >
              Invalid color
            </span>
            <span v-else class="text-sm text-muted-foreground">
              Enter a color value
            </span>
          </div>
        </div>

        <div class="mb-6">
          <label class="mb-2 block text-sm font-medium text-muted-foreground">
            Input Color
          </label>
          <Input
            v-model="inputValue"
            type="text"
            placeholder="#ff5733, rgb(255, 87, 51), hsl(14, 100%, 60%)..."
            class="w-full border border-border bg-background px-4 py-3 font-mono text-sm text-foreground outline-none ring-ring transition-shadow placeholder:text-muted-foreground/50 focus:ring-2"
            :spellcheck="false"
          />
        </div>

        <div class="mb-6 flex items-center justify-center">
          <motion.div
            :animate="{ y: valid ? [0, -4, 0] : 0 }"
            :transition="{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }"
          >
            <ArrowRight class="h-5 w-5 rotate-90 text-primary" />
          </motion.div>
        </div>

        <div class="mb-4">
          <label class="mb-2 block text-sm font-medium text-muted-foreground">
            Output Format
          </label>
          <Select v-model="outputFormat">
            <SelectTrigger class="w-full font-mono text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="f in OUTPUT_FORMATS"
                :key="f.value"
                :value="f.value"
                class="font-mono text-sm"
              >
                {{ f.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="relative">
          <label class="mb-2 block text-sm font-medium text-muted-foreground">
            Result
          </label>
          <div
            class="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3"
          >
            <span class="flex-1 select-all font-mono text-sm text-foreground">
              {{ outputValue ?? "—" }}
            </span>
            <motion.button
              :disabled="!outputValue"
              class="relative flex h-8 w-8 rounded-md shrink-0 items-center justify-center bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-30"
              :while-tap="{ scale: 0.9 }"
              :while-hover="{ scale: 1.05 }"
              @click="handleCopy"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  v-if="copied"
                  key="check"
                  :initial="{ scale: 0, rotate: -90 }"
                  :animate="{ scale: 1, rotate: 0 }"
                  :exit="{ scale: 0, rotate: 90 }"
                  :transition="{ duration: 0.2 }"
                >
                  <Check class="h-4 w-4" />
                </motion.span>
                <motion.span
                  v-else
                  key="copy"
                  :initial="{ scale: 0, rotate: 90 }"
                  :animate="{ scale: 1, rotate: 0 }"
                  :exit="{ scale: 0, rotate: -90 }"
                  :transition="{ duration: 0.2 }"
                >
                  <Copy class="h-4 w-4" />
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
</template>
