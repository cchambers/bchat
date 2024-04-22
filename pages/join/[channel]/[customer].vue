<script setup>
const route = useRoute();
const { channel, customer } = route.params;

const actual = ref(`${channel}:${customer}`);
const sburl = ref(null);
const sb = inject("SendBird");
const user = ref(null);
if (process.client) {
  window.localStorage.setItem("customer", customer);
}

const joinChannel = async () => {
  console.log("joinChannel()");

  const params = {
    channelNameContainsFilter: actual.value,
  };
  const query = sb.openChannel.createPublicGroupChannelListQuery(params);

  const channels = await query.next((channels, error) => {
    console.log("Next");
    if (error) {
      console.error(error);
      return;
    }
  });

  if (!channels.length) {
    console.log("Channel does not exist.");
    alert("Channel not found.");
  } else {
    sburl.value = channels[0]._url;
  }

  if (sburl.value) navigateTo(`/chat/${sburl.value}`);
};

onMounted(async () => {
  try {
    user.value = await sb.connect(customer);
    // The user is connected to Sendbird server.
    console.log("User connected");

    joinChannel();
  } catch (err) {
    // Handle error.
    console.log(err);
  }
});
// check if channel exists
</script>
<template>
  <div>
    <div>{{ actual }}</div>
    <div>{{ sburl }}</div>
  </div>
</template>
