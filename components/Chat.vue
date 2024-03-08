<script setup>
import { useBus } from "@/utils/event-bus";
import SendbirdChat from "@sendbird/chat";
import { OpenChannelModule } from "@sendbird/chat/openChannel";
const sb = inject("SendBird");

const user = ref(null);

try {
  user.value = await sb.connect("DEV01");
  // The user is connected to Sendbird server.
} catch (err) {
  // Handle error.
}
const customer = ref(null);
const md = inject("md");
const props = defineProps({
  channel: String,
});
const input = ref(null);
const pastMessages = ref(history);
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

const handleInput = async () => {
  const messageText = input.value.trim();
  currentChannel.value.sendUserMessage(messageText, (message, error) => {
    if (error) {
      console.error(error);
      return;
    }

    pastMessages.unshift(message);
    input.value = "";
  });
};

const loadMessage = (data) => {
  pastMessages.value.unshift(data);
};

const loadPreviousMessages = (channel) => {
  const messageListQuery = channel.createPreviousMessageListQuery();

  messageListQuery.limit = 20; // Number of messages to retrieve
  messageListQuery.reverse = false; // Set to true if you want the latest message first

  messageListQuery.load((messages, error) => {
    if (error) {
      console.error(error);
      return;
    }

    pastMessages.value = [...messages];
  });
};

const enterChannel = async () => {
  const channel = await sb.OpenChannel.getChannel(props.channel);
  await channel.enter();
  currentChannel.value = channel;
  loadPreviousMessages(channel);
  setupEventListeners(channel);
};

const setupEventListeners = (channel) => {
  const ChannelHandler = new sb.ChannelHandler();

  ChannelHandler.onMessageReceived = (channel, message) => {
    pastMessages.unshift(message);
  };

  sb.addChannelHandler(`channel:${chatroom}`, ChannelHandler);
};

onMounted(() => {
  enterChannel();
  if (process.client) {
    const c = window.localStorage.getItem("customer");
    if (c) customer.value = c;
  }
});
</script>

<template>
  <div class="chat-component">
    <div class="output">
      <div
        v-for="m in pastMessages"
        v-bind:key="m.id"
        :class="{ customer: m.customer, moderator: m.owner }"
      >
        <!-- <div class="message" v-if="m.type == 'embed'">
          <ChatEmbed :data="m.message" />
        </div> -->
        <div class="message">{{ m._sender.userId }}: {{ m.message }};</div>
      </div>
    </div>
    <div class="input" @keydown.enter.prevent="handleInput">
      <textarea
        v-model="input"
        ref="textareaRef"
        rows="1"
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
    padding: use(ss);
    .message {
      padding: use(sss) use(ss);
      border-radius: use(sss);
      width: max-content;
      max-width: 60%;
      margin-bottom: use(s);
    }
    .customer {
      .message {
        margin-left: auto;
        background: use(accent-tertiary);
        color: use(highlight-primary);
      }
    }
    .moderator {
      .message {
        margin-right: auto;
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
