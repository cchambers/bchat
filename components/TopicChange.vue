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
  <div class="tc back-highlight-primary pad-ss" v-if="content">
    <a :href="content.url" target="_new">
      <div
        class="image"
        :style="`background-image: url(${content.image})`"
      ></div>
      <div class="title wt-bold px-20">{{ content.title }}</div></a
    >
  </div>
</template>

<style lang="scss">
.tc {
  border-radius: use(sss);
  a .title {
    color: use(lowlight-primary);
  }
  a:hover .title {
    color: use(accent-primary);
  }
}
</style>
