<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { checkWCAG } from "~/utils/contrast.util";
import { AnimatePresence, motion } from "motion-v";
import { ArrowLeftRight, Eye } from "lucide-vue-next";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import PreviewCard from "~/components/contrast-checker/preview-card.vue";
import ComplianceCard from "~/components/contrast-checker/compliance-card.vue";
import RatioBar from "~/components/contrast-checker/ratio-bar.vue";
import ColorBlindCard from "~/components/contrast-checker/color-blind-card.vue";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
const fg = ref("#1a1a2e");
const bg = ref("#f8f9fa");

const fgHex = computed(() => getHexPreview(fg.value));
const bgHex = computed(() => getHexPreview(bg.value));
const wcag = computed(() => {
  if (!fgHex || !bgHex) return null;
  return checkWCAG(fgHex.value || "", bgHex.value || "");
});

const swap = () => {
  const currentFg = fg.value;
  fg.value = bg.value;
  bg.value = currentFg;
};
</script>
<template>
  <div class="min-h-screen bg-background">
    <div class="mx-auto max-w-5xl px-4 py-12">
      <motion.div
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        class="mb-10 text-center"
      >
        <Badge variant="secondary" class="mb-3">
          <Eye class="mr-1 h-3 w-3" /> Accessibility
        </Badge>
        <motion.h1
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          class="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
        >
          Contrast <span class="text-primary">Checker</span>
        </motion.h1>
        <p class="mt-2 text-muted-foreground">
          Validate color contrast against WCAG 2.1 standards
        </p>
      </motion.div>
      <motion.div
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.1 }"
        class="mb-8"
      >
        <Card class="overflow-hidden border-border/50 bg-card shadow-lg">
          <CardContent class="p-6">
            <div class="flex flex-col items-center gap-4 sm:flex-row">
              <div class="flex-1 w-full">
                <label
                  class="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Text Color
                </label>
                <div class="flex items-center">
                  <input
                    class="h-10 w-10 min-w-10 shrink-0 rounded-lg"
                    type="color"
                    v-model="fg"
                  />
                  <Input
                    v-model="fg"
                    class="font-mono text-sm"
                    placeholder="#1a1a2e"
                  />
                </div>
              </div>

              <Button
                size="icon"
                @click="swap"
                class="mt-5 shrink-0 rounded-full"
                aria-label="Swap colors"
              >
                <ArrowLeftRight class="h-4 w-4" />
              </Button>

              <div class="flex-1 w-full">
                <label
                  class="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Background Color
                </label>
                <div class="flex items-center">
                  <input
                    class="h-10 w-10 min-w-10 shrink-0 border-none outline-none"
                    type="color"
                    v-model="bg"
                  />
                  <Input
                    v-model="bg"
                    class="font-mono text-sm"
                    placeholder="#f8f9fa"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.div
          v-if="wcag"
          :key="`${fgHex}-${bgHex}`"
          :initial="{ opacity: 0, scale: 0.97 }"
          :animate="{ opacity: 1, scale: 1 }"
          :exit="{ opacity: 0, scale: 0.97 }"
          :transition="{ duration: 0.2 }"
          class="space-y-6"
        >
          <div class="text-center">
            <div class="inline-flex items-baseline gap-1 font-display">
              <span class="text-6xl font-extrabold text-foreground sm:text-7xl">
                {{ wcag.ratio.toFixed(2) }}
              </span>
              <span class="text-4xl"> : 1</span>
            </div>
            <RatioBar :ratio="wcag.ratio" />
          </div>

          <Tabs defaultValue="compliance" class="w-full">
            <TabsList class="mx-auto flex w-fit">
              <TabsTrigger value="compliance">WCAG Compliance</TabsTrigger>
              <TabsTrigger value="preview">Live Preview</TabsTrigger>
              <TabsTrigger value="colorblind">Color Blindness</TabsTrigger>
            </TabsList>

            <TabsContent value="compliance">
              <div class="grid gap-4 sm:grid-cols-2 mt-4">
                <ComplianceCard
                  level="AA"
                  :items="[
                    { label: 'Normal Text (≥4.5:1)', pass: wcag.aa.normalText },
                    { label: 'Large Text (≥3:1)', pass: wcag.aa.largeText },
                    { label: 'UI Components (≥3:1)', pass: wcag.aa.ui },
                  ]"
                />
                <ComplianceCard
                  level="AAA"
                  :items="[
                    { label: 'Normal Text (≥7:1)', pass: wcag.aaa.normalText },
                    { label: 'Large Text (≥4.5:1)', pass: wcag.aaa.largeText },
                  ]"
                />
              </div>
            </TabsContent>
            <TabsContent value="preview">
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <PreviewCard
                  :fgHex="fgHex!"
                  :bgHex="bgHex!"
                  :fontSize="16"
                  :label="'Normal Text (16px)'"
                />
                <PreviewCard
                  :fgHex="fgHex!"
                  :bgHex="bgHex!"
                  :fontSize="24"
                  :label="'Large Text (24px)'"
                  bold
                />
              </div>
            </TabsContent>
            <TabsContent value="colorblind">
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <ColorBlindCard
                  v-for="cb in colorBlindnessTypes"
                  :key="cb.label"
                  :type="cb"
                  :fgHex="fgHex!"
                  :bgHex="bgHex!"
                />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </AnimatePresence>

      <p
        v-if="!wcag && fgHex === null && bgHex === null"
        class="text-center text-muted-foreground"
      >
        Enter valid colors above to check contrast.
      </p>
    </div>
  </div>
</template>
