<script setup>
import { useBus } from "@/utils/event-bus";
const { bus } = useBus();

import Showdown from "showdown";
const md = new Showdown.Converter();
provide("md", md);

import SendbirdChat from "@sendbird/chat";

import {
  GroupChannelModule,
  GroupChannelHandler,
} from "@sendbird/chat/groupChannel";
const sb = SendbirdChat.init({
  appId: "E567A9C9-721F-46E9-AE1B-5EA2296DB460",
  modules: [new GroupChannelModule()],
});

provide("SendBird", sb);

// import nuxtStorage from "nuxt-storage";
// provide("storage", nuxtStorage);

const route = useRoute();
watch(route, async (value) => {
  await refreshNuxtData();
});

onMounted(() => {
  window.addEventListener("keydown", handleFirstTab);
  window.addEventListener("mousedown", handleMouseDown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleFirstTab);
  window.removeEventListener("mousedown", handleMouseDown);
});

const userIsTabbing = ref(false);

function handleFirstTab(e) {
  if (e.keyCode === 9) {
    // the "I am a keyboard user" key
    userIsTabbing.value = true;
    document.body.classList.add("user-is-tabbing");
    window.removeEventListener("keydown", handleFirstTab);
    window.addEventListener("mousedown", handleMouseDown);
  }
}

function handleMouseDown() {
  userIsTabbing.value = false;
  document.body.classList.remove("user-is-tabbing");
  window.removeEventListener("mousedown", handleMouseDown);
  window.addEventListener("keydown", handleFirstTab);
}

useHead({
  titleTemplate: (title) => {
    return title ? `${title} - BILDIT Chat` : "BILDIT Chat v0.01";
  },
});
</script>
<template>
  <main ref="mainRef">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </main>
</template>
