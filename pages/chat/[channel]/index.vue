<script setup>
const route = useRoute();
const { channel } = route.params;
import { useBus } from "@/utils/event-bus";
const { bus } = useBus();
definePageMeta({
  layout: "applet",
});
</script>

<template>
  <div class="flex" full>
    <Chat :channel="channel" />
  </div>
</template>
