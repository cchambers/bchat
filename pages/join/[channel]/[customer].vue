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
    nameKeyword: actual.value,
  };
  const query = sb.openChannel.createOpenChannelListQuery(params);

  const channels = await query.next((channels, error) => {
    console.log("Next");
    if (error) {
      console.error(error);
      return;
    }
  });

  console.log("test", channels);
  if (!channels.length) {
    console.log("Channel does not exist.");
    await createChannel();
  } else {
    sburl.value = channels[0]._url;
  }

  if (sburl.value) navigateTo(`/chat/${sburl.value}`);
};

const createChannel = async () => {
  console.log("Attempting to create channel...");
  const params = {
    name: actual.value,
  };

  // Create a new Open Channel
  const newChannel = await sb.openChannel.createChannel(
    params,
    function (openChannel, error) {
      if (error) {
        console.error("Error creating new Open Channel:", error);
        return;
      }

      console.log("Created new Open Channel:", openChannel.url);
      sburl.value = openChannel.url;
      // navigateTo(`/chat/${openChannel.url}`);
    }
  );

  if (newChannel) sburl.value = newChannel._url;
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
