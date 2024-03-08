<template>
  <img v-if="isIntersecting" :src="src" :alt="alt" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  src: String,
  alt: String,
});

let isIntersecting = ref(false);
let observer;
let imgRef = ref(null);

onMounted(() => {
  let options = {
    root: null,
    rootMargin: "0px",
    threshold: 0,
  };

  observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        isIntersecting.value = true;
        observer.unobserve(entry.target);
      }
    });
  }, options);

  if (imgRef.value) {
    observer.observe(imgRef.value);
  }
});

onUnmounted(() => {
  observer.disconnect();
});
</script>
