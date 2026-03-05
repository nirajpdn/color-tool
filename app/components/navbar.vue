<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "#imports";
import { motion } from "motion-v";
import { Palette, Menu, MoreHorizontal } from "lucide-vue-next";
import { navLinks } from "~/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "./ui/sheet";
import SheetHeader from "./ui/sheet/SheetHeader.vue";
import { cn } from "~/lib/utils";

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
          v-for="link in navLinks.slice(0, 3)"
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
          <span class="relative z-10 whitespace-nowrap">{{ link.label }}</span>
        </NuxtLink>
        <DropdownMenu>
          <DropdownMenuTrigger :as-child="true">
            <Button
              variant="ghost"
              class="cursor-pointer rounded-md border border-border text-muted-foreground transition-colors hover:bg-none hover:text-black"
              aria-label="More links"
            >
              More <MoreHorizontal class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              v-for="link in navLinks.slice(3)"
              :key="link.label"
              :class="
                cn(
                  'transition-colors',
                  isActive(link.to)
                    ? 'text-primary hover:text-primary hover:bg-none'
                    : 'hover:text-primary hover:bg-none',
                )
              "
            >
              <NuxtLink
                :to="link.to"
                :class="cn('block rounded-md px-3 text-sm')"
              >
                {{ link.label }}
              </NuxtLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Sheet v-model:open="mobileOpen">
        <SheetTrigger :as-child="true">
          <button
            class="flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
            aria-label="Toggle menu"
          >
            <Menu class="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" class="md:hidden gap-0">
          <SheetHeader>
            <NuxtLink
              to="/"
              class="flex items-center gap-2 font-display text-lg font-bold text-foreground"
            >
              <Palette class="h-5 w-5 text-primary" />
              ColorTool
            </NuxtLink>
          </SheetHeader>
          <nav class="flex flex-col gap-1">
            <SheetClose
              v-for="link in navLinks"
              :key="`mobile-${link.to}`"
              :as-child="true"
            >
              <NuxtLink
                :to="link.to"
                class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                :class="isActive(link.to) ? 'text-white' : 'hover:text-white'"
              >
                {{ link.label }}
              </NuxtLink>
            </SheetClose>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  </nav>
</template>
