<script lang="ts" setup>
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { simulateColorBlindness, checkWCAG } from "~/utils/contrast.util";
const props = defineProps<{
  type: { value: ColorBlindnessType; label: string; description: string };
  fgHex: string;
  bgHex: string;
}>();
const { type, fgHex, bgHex } = props;
const simFg = simulateColorBlindness(fgHex, type.value) ?? fgHex;
const simBg = simulateColorBlindness(bgHex, type.value) ?? bgHex;
const result = checkWCAG(simFg, simBg);
</script>
<template>
  <Card className="overflow-hidden border-border/50 rounded-lg shadow-xs">
    <div
      className="flex min-h-25 items-center justify-center p-5"
      :style="{ backgroundColor: simBg }"
    >
      <p
        :style="{ color: simFg }"
        className="font-display text-lg font-semibold"
      >
        Sample Text
      </p>
    </div>
    <div
      className="flex items-center justify-between border-t border-border bg-card px-4 py-2.5"
    >
      <div>
        <p className="font-medium text-foreground">{{ type.label }}</p>
        <p className="text-sm text-muted-foreground">{{ type.description }}</p>
      </div>

      <Badge
        v-if="!!result"
        :variant="result.ratio >= 4.5 ? 'default' : 'destructive'"
        className="text-sm"
      >
        {{ result.ratio.toFixed(1) }} : 1
      </Badge>
    </div>
  </Card>
</template>
