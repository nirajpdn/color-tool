<script setup lang="ts">
import { Palette } from "lucide-vue-next";
</script>
<template>
  <footer class="border-t border-border/50 py-12 px-6">
    <div
      class="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4"
    >
      <div>
        <div class="flex items-center gap-2">
          <Palette class="w-5 h-5 text-primary" />
          <span class="font-semibold text-sm">ColorTool</span>
        </div>
        <p class="text-foreground/80 text-sm mt-2">
          Color conversion across HEX/RGB/HSL/OKLCH, gradient generator, avatar
          generator, and accessibility contrast checker.
        </p>
      </div>
      <p class="text-xs text-muted-foreground">
        &copy; {{ new Date().getFullYear() }} ColorTool.
      </p>
    </div>
  </footer>
</template>
