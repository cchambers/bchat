<script setup>
const props = defineProps({
  data: String,
});
const content = ref(null);
onMounted(() => {
  const str = props.data.split("»")[1];
  content.value = JSON.parse(str);
});
</script>

<template>
  <div class="tc" v-if="content">
    <div class="image" :style="`background-image: url(${content.image})`"></div>
    <div class="title wt-bold px-20">
      <a :href="content.url" target="_new">{{ content.title }}</a>
    </div>
  </div>
</template>
