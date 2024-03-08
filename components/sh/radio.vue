<script setup>
const props = defineProps({
  uniqueId: String,
  group: String,
  label: String,
});

const id = ref(props.uniqueId);
const value = ref(null);
</script>

<template>
  <div>
    <input type="radio" :id="id" :name="group" v-model="value" />
    <label :for="id">
      <slot name="label"> {{ label }} </slot>
    </label>
  </div>
</template>

<style lang="scss" scoped></style>
