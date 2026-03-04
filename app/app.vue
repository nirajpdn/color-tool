<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
import "vue-sonner/style.css";
useHead({
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { key: "theme-color", name: "theme-color", content: "" },
  ],
  link: [{ rel: "icon", href: "/favicon.ico" }],
  htmlAttrs: {
    lang: "en",
  },
});
const title = "Color Kit";
const description =
  "Convert color, create gradient seamlessly, create avatar and more.";
useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: "",
  ogImage: "",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: "",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <Body class="overscroll-none antialiased bg-background text-foreground">
    <div id="app" vaul-drawer-wrapper class="relative">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <Toaster :duration="3000" position="bottom-right" />
    </div>
  </Body>
</template>
