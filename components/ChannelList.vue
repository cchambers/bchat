<script setup>
const props = defineProps({
  data: Array,
});

const switchTo = (channel) => {
  navigateTo(`/chat/${channel}`);
};
</script>

<template>
  <div class="channel-list">
    <ul>
      <li v-for="channel in props.data" v-bind:key="channel.id">
        <button @click="switchTo(channel._url)">
          Switch to {{ channel._name }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
.channel-list {
  ul {
    list-style: none;
    padding: use(s);
  }
  button {
    width: 100%;
    border: 1px solid use(accent-primary);
  }
}
</style>
