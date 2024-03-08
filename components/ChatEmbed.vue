<script setup>
const props = defineProps({
  data: Object,
});

const test = JSON.parse(props.data);

const content = ref(test);
</script>

<template>
  <div class="chat-embed">
    <div class="image" :style="`background-image: url(${content.image})`"></div>
    <div class="details">
      <h4>{{ content.offer }}</h4>
      <p>{{ content.details }}</p>
    </div>
  </div>
</template>

<style lang="scss">
.chat-embed {
  .image {
    width: 20rem;
    height: 20rem;
    background: use(highlight-secondary);
    color: use(lowlight-tertiary);
    background-size: cover;
    background-position: center center;
  }
}
</style>
