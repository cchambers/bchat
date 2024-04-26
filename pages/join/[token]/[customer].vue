<script setup>
const route = useRoute();
const { token, customer } = route.params;

const actual = ref(`${customer}`);
const sburl = ref(null);
const sb = inject("SendBird");
const conn = inject("conn");

const user = ref(null);
if (process.client) {
  window.localStorage.setItem("customer", customer);
  window.localStorage.setItem("token", token);
}

const findGroupChannel = async () => {
  const params = {
    includeEmpty: true,
    channelNameContainsFilter: customer,
  };
  console.log(Object.keys(sb));
  const query = sb.groupChannel.createMyGroupChannelListQuery(params);

  const channels = await query.next();

  if (channels.length) {
    sburl.value = channels[0]._url;
  }
};

onMounted(async () => {
  try {
    user.value = await sb.connect(customer, token);
    // The user is connected to Sendbird server.
    console.log("User connected");

    await findGroupChannel();
    if (sburl.value) {
      setTimeout(() => {
        navigateTo(`/chat/${sburl.value}`);
      }, 1500);
    }
  } catch (err) {
    // Handle error.
    console.log(err);
  }
});

// onUnmounted(() => {
//   sb.disconnect();
// });
// check if channel exists
</script>
<template>
  <div>
    <div>token: {{ token }}</div>
    <div>channel name: {{ customer }}</div>
    <div class="flex start align-middle">
      sendbird channel url:
      <template v-if="sburl">
        {{ sburl }}
      </template>
      <div class="loading" v-else></div>
    </div>
  </div>
</template>
<style lang="scss">
.loading {
  width: 10rem;
  height: use(s);
  background-image: linear-gradient(
    135deg,
    rgba(0, 212, 255, 0) 40%,
    rgba(2, 2, 2, 0.2) 50%,
    rgba(0, 212, 255, 0) 60%
  );
  background-size: 300%;
  background-position-x: center;
  animation: loading 500ms linear infinite;
  border: 1px solid use(lowlight-primary);
}

@keyframes loading {
  0% {
    background-position-x: 100%;
  }
  100% {
    background-position-x: 0%;
  }
}
</style>
