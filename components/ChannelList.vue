<script setup>
const props = defineProps({
  data: Array,
  current: String,
});

const switchTo = (channel) => {
  navigateTo(`/chat/${channel}`);
};
</script>

<template>
  <div class="channel-list">
    <ul>
      <li
        v-for="channel in props.data"
        v-bind:key="channel.id"
        :class="{ active: channel._url == props.current }"
      >
        <button @click="switchTo(channel._url)">
          {{ channel._name.split(":")[0] }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
.channel-list {
  ul {
    list-style: none;
    padding: use(ss);
    display: flex;
    flex-direction: column;
  }
  li {
    order: 2;
    padding-bottom: use(ss);
  }
  button {
    width: 100%;
    border: 1px solid use(accent-primary);
    padding: use(s);
    border-radius: use(sss);
  }
  .active {
    order: 1;
    button {
      background: use(accent-primary);
      color: use(highlight-primary);
      pointer-events: none;
    }
  }
}
</style>
