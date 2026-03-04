<script lang="ts" setup>
import { Check, X } from "lucide-vue-next";
import { Card, CardContent } from "~/components/ui/card";
const props = defineProps<{
  level: string;
  items: {
    label: string;
    pass: boolean;
  }[];
}>();
const { level, items } = props;
const allPass = items.every((i) => i.pass);
</script>

<template>
  <div>
    <Card class="border-border/50">
      <CardContent class="p-4">
        <div class="mb-3 flex items-center justify-between">
          <span class="font-display text-lg font-bold text-foreground">
            {{ level }}
          </span>
          <Badge :variant="allPass ? 'default' : 'destructive'" class="text-xs">
            {{ allPass ? "Pass" : "Fail" }}
          </Badge>
        </div>
        <div class="space-y-2">
          <div
            v-for="item in items"
            :key="item.label"
            class="flex items-center justify-between text-sm"
          >
            <span class="text-muted-foreground">{{ item.label }}</span>
            <Check v-if="item.pass" class="h-4 w-4 text-green-500" />
            <X v-else class="h-4 w-4 text-destructive" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
