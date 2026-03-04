<script setup lang="ts">
import { computed } from "vue";
import { motion } from "motion-v";

const props = defineProps<{
  ratio: number;
}>();

const percent = computed(() => Math.min((props.ratio / 21) * 100, 100));

const barColorClass = computed(() => {
  if (props.ratio >= 7) return "bg-green-500";
  if (props.ratio >= 4.5) return "bg-yellow-500";
  if (props.ratio >= 3) return "bg-orange-500";
  return "bg-destructive";
});
</script>

<template>
  <div class="mx-auto mt-3 h-2 w-48 overflow-hidden rounded-full bg-secondary">
    <motion.div
      class="h-full rounded-full"
      :class="barColorClass"
      :initial="{ width: 0 }"
      :animate="{ width: `${percent}%` }"
      :transition="{ duration: 0.5, ease: 'easeOut' }"
    />
  </div>
</template>
