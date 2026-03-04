<script setup lang="ts">
import { motion } from "motion-v";
import { Palette } from "lucide-vue-next";
</script>

<template>
  <section class="relative overflow-hidden px-4 pb-12 pt-16">
    <div
      class="pointer-events-none absolute inset-0 -z-10"
      :style="{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 0%, hsl(174 62% 92%), transparent)',
      }"
    />

    <div class="mx-auto max-w-2xl text-center">
      <motion.div
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5 }"
        class="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm"
      >
        <Palette class="h-4 w-4 text-primary" />
        Free &amp; instant color conversion
      </motion.div>

      <motion.h1
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.1 }"
        class="font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl"
      >
        Convert any color
        <br />
        <span class="text-primary">to any format</span>
      </motion.h1>

      <motion.p
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.2 }"
        class="mx-auto mt-4 max-w-md text-base text-muted-foreground"
      >
        Paste a color in HEX, RGB, HSL, OKLab or any CSS format - get it
        converted instantly.
      </motion.p>

      <motion.a
        href="#converter"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.3 }"
        class="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
      >
        Start converting
      </motion.a>
    </div>
  </section>
</template>
