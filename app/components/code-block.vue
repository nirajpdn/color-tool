<script setup lang="ts">
import { ref } from "vue";
import { Copy, Check } from "lucide-vue-next";
import { AnimatePresence, motion } from "motion-v";
import { Button } from "./ui/button";
const props = defineProps<{
  code: string;
  lang?: string;
  title?: string | null;
}>();

const copied = ref(false);

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.code || "");
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch (error) {
    console.error("Failed to copy code:", error);
  }
}
</script>

<template>
  <div class="group relative overflow-hidden rounded-xl border border-border">
    <div class="m-0 overflow-x-auto p-0">
      <div
        v-if="props.title"
        class="rounded-t-xl border-b border-border bg-muted/50 p-3 text-xs font-medium text-foreground"
      >
        {{ props.title }}
      </div>

      <Button
        variant="outline"
        @click="handleCopy"
        :class="[
          'absolute size-8 hover:text-primary text-primary cursor-pointer right-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity rounded-md border border-border shadow-none inline-flex items-center justify-center',
          props.title ? 'top-13' : 'top-3',
        ]"
        aria-label="Copy code"
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
            <Check class="h-3.5 w-3.5" />
          </motion.span>
          <motion.span
            v-else
            key="copy"
            :initial="{ scale: 0 }"
            :animate="{ scale: 1 }"
            :exit="{ scale: 0 }"
            class="flex items-center gap-1"
          >
            <Copy class="h-3.5 w-3.5" />
          </motion.span>
        </AnimatePresence>
      </Button>
      <div class="p-3 [&_pre_>_code.shiki]:text-sm">
        <Shiki :lang="props.lang || 'ts'" :code="props.code" />
      </div>
    </div>
  </div>
</template>
