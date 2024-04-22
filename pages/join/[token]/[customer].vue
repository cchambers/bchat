<script setup>
const route = useRoute();
const { token, customer } = route.params;

const actual = ref(`${customer}`);
const sburl = ref(null);
const sb = inject("SendBird");
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

  console.log("TEST", channels);
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
      navigateTo(`/chat/${sburl.value}`);
    }
  } catch (err) {
    // Handle error.
    console.log(err);
  }
});
// check if channel exists
</script>
<template>
  <div>
    <div>token: {{ token }}</div>
    <div>channel name: {{ customer }}</div>
    <div>sendbird channel url: {{ sburl }}</div>
  </div>
</template>
