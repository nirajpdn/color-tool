<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "#imports";
import { motion, AnimatePresence } from "motion-v";
import { Palette, Menu, X } from "lucide-vue-next";

const navLinks = [
  { to: "/", label: "Color Converter" },
  { to: "/gradient-generator", label: "Gradient Generator" },
  { to: "/avatar-generator", label: "Avatar Generator" },
  { to: "/contrast-checker", label: "Contrast Checker" },
];

const mobileOpen = ref(false);
const route = useRoute();

const isActive = (to: string) => route.path === to;
</script>

<template>
  <nav
    class="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg"
  >
    <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
      <NuxtLink
        to="/"
        class="flex items-center gap-2 font-display text-lg font-bold text-foreground"
      >
        <Palette class="h-5 w-5 text-primary" />
        ColorTool
      </NuxtLink>

      <div class="hidden items-center gap-1 md:flex">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
          :class="
            isActive(link.to)
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          "
        >
          <motion.span
            v-if="isActive(link.to)"
            layout-id="nav-pill"
            class="absolute inset-0 rounded-full bg-primary"
            :transition="{ type: 'spring', stiffness: 380, damping: 30 }"
          />
          <span class="relative z-10">{{ link.label }}</span>
        </NuxtLink>
      </div>

      <button
        class="flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
        aria-label="Toggle menu"
        @click="mobileOpen = !mobileOpen"
      >
        <X v-if="mobileOpen" class="h-5 w-5" />
        <Menu v-else class="h-5 w-5" />
      </button>
    </div>

    <AnimatePresence>
      <motion.div
        v-if="mobileOpen"
        class="overflow-hidden border-t border-border md:hidden"
        :initial="{ height: 0, opacity: 0 }"
        :animate="{ height: 'auto', opacity: 1 }"
        :exit="{ height: 0, opacity: 0 }"
        :transition="{ duration: 0.2 }"
      >
        <div class="flex flex-col gap-1 px-4 py-3">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            :class="
              isActive(link.to)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            "
            @click="mobileOpen = false"
          >
            {{ link.label }}
          </NuxtLink>
        </div>
      </motion.div>
    </AnimatePresence>
  </nav>
</template>
