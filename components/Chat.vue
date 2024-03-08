<script setup>
import { useBus } from "@/utils/event-bus";
import SendbirdChat from "@sendbird/chat";
import {
  OpenChannelModule,
  OpenChannelHandler,
} from "@sendbird/chat/openChannel";
const sb = inject("SendBird");

const user = ref(null);

const customer = ref(null);
const md = inject("md");
const props = defineProps({
  channel: String,
});
const input = ref(null);
const pastMessages = ref([]);
const textareaRef = ref(null);
const autoResize = (e) => {
  if (textareaRef.value) {
    nextTick(() => {
      // const borderHeight = textarea .value.offsetHeight - textarea .value.clientHeight;
      textareaRef.value.style.height = "auto";
      textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
    });
  }
};

const currentChannel = ref(null);
const loading = ref(false);
const handleInput = async () => {
  loading.value = true;
  const messageText = input.value.trim();
  // console.log("HANDLING", messageText);

  const params = {
    message: messageText,
  };
  currentChannel.value.sendUserMessage(params).onSucceeded((message) => {
    console.log(message);
    pastMessages.value.unshift({
      message: message.message,
      sender: message.sender.userId,
    });
    input.value = "";
    loading.value = false;
  });
};

const loadPreviousMessages = async (channel) => {
  const params = {
    limit: 20,
    reverse: true,
  };
  const query = channel.createPreviousMessageListQuery(params);
  try {
    console.log("LOADING PREVIOUS...");
    const messages = await query.load();
    console.log(Object.keys(messages[0].message));
    pastMessages.value = messages.map((item) => {
      const obj = {
        sender: item.sender.userId,
        message: item.message,
      };
      return obj;
    });
    // console.log("M", messages);
    console.log("P", pastMessages);
  } catch (e) {
    // Handle error
  }
  console.log(pastMessages.value);
};

const enterChannel = async () => {
  const channel = await sb.openChannel.getChannel(props.channel);
  await channel.enter();
  currentChannel.value = channel;
  // console.log("CURRENT", currentChannel.value);
  loadPreviousMessages(channel);
  setupEventListeners(channel);
};

const setupEventListeners = (channel) => {
  const channelHandler = new OpenChannelHandler({
    onMessageReceived: (channel, message) => {
      pastMessages.value.unshift(message);
    },
  });

  sb.openChannel.addOpenChannelHandler(
    `channel:${props.channel}`,
    channelHandler
  );
};

onMounted(async () => {
  if (process.client) {
    const c = window.localStorage.getItem("customer");
    if (c) customer.value = c;
    try {
      user.value = await sb.connect(customer.value);
      // The user is connected to Sendbird server.
    } catch (err) {
      // Handle error.
    }
    enterChannel();
  }
});
</script>

<template>
  <div class="chat-component">
    <div class="output">
      <div
        v-for="m in pastMessages"
        v-bind:key="m"
        :class="{
          customer: m.sender == customer,
          moderator: !(m.sender == customer),
        }"
      >
        <div class="message" v-if="m.type == 'embed'">
          <ChatEmbed :data="m.message" />
        </div>
        <div class="message">{{ m.message }}</div>
      </div>
    </div>
    <div class="input" @keydown.enter.prevent="handleInput">
      <textarea
        v-model="input"
        ref="textareaRef"
        rows="1"
        :disabled="loading"
        @keyup="autoResize"
        @keydown.enter.shift.exact.stop
      ></textarea>
    </div>
  </div>
</template>

<style lang="scss">
.chat-component {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  .controls {
    position: fixed;
    top: 6rem;
    right: use(ss);
    button {
      height: 5rem;
      width: 5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      border-radius: 50%;
    }
  }
  .output {
    height: 100%;
    flex-shrink: 1;
    padding: 0 use(ss);
    > div:first-child {
      .message {
        margin-bottom: 0;
      }
    }
    .message {
      padding: use(sss) use(ss);
      border-radius: use(sss);
      width: max-content;
      max-width: 60%;
      margin-bottom: use(ss);
    }
    .customer {
      .message {
        margin-right: auto;
        background: use(accent-tertiary);
        color: use(highlight-primary);
      }
    }
    .moderator {
      .message {
        margin-left: auto;
        background: use(highlight-tertiary);
        color: use(highlight-primary);
      }
    }
  }
  .input {
    padding: use(ss);
    textarea {
      min-width: 100%;
      resize: none;
      max-height: 30vh;
    }
  }
}
</style>
