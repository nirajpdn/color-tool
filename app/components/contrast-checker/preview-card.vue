<script setup lang="ts">
const props = defineProps<{
  fgHex: string;
  bgHex: string;
  fontSize: number;
  label: string;
  bold?: boolean;
}>();
const { fgHex, bgHex, fontSize, label, bold } = props;
</script>

<template>
  <Card className="overflow-hidden border-border/50">
    <div
      className="flex min-h-35 items-center justify-center p-6"
      :style="{ backgroundColor: bgHex }"
    >
      <p
        :style="{
          color: fgHex,
          fontSize: `${fontSize}px`,
          fontWeight: bold ? 700 : 400,
        }"
        className="font-display text-center"
      >
        The quick brown fox jumps over the lazy dog
      </p>
    </div>
    <div className="border-t border-border bg-card px-4 py-2">
      <span className="text-xs text-muted-foreground">{{ label }}</span>
    </div>
  </Card>
</template>
