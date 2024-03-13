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
      textareaRef.value.style.height = `${
        textareaRef.value.scrollHeight - 5
      }px`;
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

const formatDate = (d) => {
  if (!d) return "";
  const inputDate = new Date(d);
  const testDate = new Date(d);
  const today = new Date();

  // Clone today's date and reset time for comparison
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  // Options for formatting the time part
  const timeOptions = {
    hour: "numeric",
    minute: "2-digit",
    // timeZoneName: "short",
  };

  // Adding day name to the default options
  const options = {
    weekday: "long", // This will add the day name
    // year: "numeric",
    month: "long",
    day: "numeric",
    ...timeOptions,
  };

  // Formatting just the time part for use with "Today"
  const formattedTime = new Intl.DateTimeFormat("en-US", timeOptions).format(
    inputDate
  );

  // Check if the input date is "today"
  if (testDate.setHours(0, 0, 0, 0) === todayStart.getTime()) {
    return `Today - ${formattedTime}`;
  }

  return new Intl.DateTimeFormat("en-US", options).format(inputDate);
};

// Example usage:
console.log(formatDate(new Date())); // Should print something like "Today - [timestamp]"

const loadPreviousMessages = async (channel) => {
  const params = {
    limit: 20,
    reverse: true,
  };
  const query = channel.createPreviousMessageListQuery(params);
  try {
    console.log("LOADING PREVIOUS...");
    const messages = await query.load();
    pastMessages.value = messages.map((item) => {
      const obj = {
        sender: item.sender.userId,
        message: item.message,
        timestamp: formatDate(item.createdAt),
      };
      return obj;
    });
  } catch (e) {
    console.log(e);
    return;
  }
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
        <div
          class="message"
          v-if="m.type == 'embed'"
          :data-timestamp="m.timestamp"
        >
          <ChatEmbed :data="m.message" />
        </div>
        <div class="message" :data-timestamp="m.timestamp">{{ m.message }}</div>
      </div>
    </div>
    <div class="input" @keydown.enter.prevent="handleInput">
      <button><i class="material-icons">add</i></button>
      <textarea
        v-model="input"
        ref="textareaRef"
        placeholder="Write messages"
        rows="1"
        :disabled="loading"
        @keyup="autoResize"
        @keydown.enter.shift.exact.stop
      ></textarea>
      <button><i class="material-icons">send</i></button>
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
    padding: 0 use(ss) use(s) use(ss);
    @include scroll-y;
    overflow-x: hidden;
    // > div:first-child {
    //   .message {
    //     margin-bottom: 0;
    //   }
    // }
    .message {
      padding: use(sss) use(ss);
      border-radius: use(sss);
      width: max-content;
      max-width: 60%;
      margin-bottom: use(base);
      position: relative;
      &:after {
        content: "";
        position: absolute;
        bottom: 0;
        width: 0px;
        height: 0px;
        border-style: solid;
        transform: rotate(0deg);
      }
      &:before {
        content: attr(data-timestamp);
        position: absolute;
        bottom: -1.4rem;
        display: block;
        width: max-content;
        color: gray;
        white-space: pre;
        font-size: 1rem;
      }
    }
    .customer {
      .message {
        margin-right: auto;
        background: use(highlight-quaternary);
        color: use(highlight-primary);
        margin-left: use(ss);
        &:after {
          border-width: 0 0 11px 11px;
          border-color: transparent transparent use(highlight-quaternary)
            transparent;
          left: -8px;
        }
        &:before {
          left: 0;
        }
      }
    }
    .moderator {
      .message {
        margin-left: auto;
        background: use(accent-primary);
        color: use(highlight-primary);
        margin-right: use(ss);
        &:after {
          right: -8px;
          border-width: 11px 0 0 11px;
          border-color: transparent transparent transparent use(accent-primary);
        }
        &:before {
          right: 0;
        }
      }
    }
  }
  .input {
    display: flex;
    padding: use(ss);
    // padding-bottom: use(base);
    @include box-shadow(3);
    textarea {
      border: 0;
      border-top: 1px solid use(highlight-tertiary);
      background: use(highlight-secondary);
      width: 100%;
      resize: none;
      max-height: 30vh;
      flex-shrink: 1;
      flex-grow: 1;
      margin: 0 use(sss);
      box-shadow: none !important;
      outline: none;
      border: none;
      border-radius: use(sss);
      font-family: sans-serif;
    }
    button {
      height: 100%;
      width: 4rem;
      flex-shrink: 0;
      border-radius: use(sss);
      i {
        font-size: 2.2rem;
        color: use(accent-primary);
      }
    }
  }
}
</style>
