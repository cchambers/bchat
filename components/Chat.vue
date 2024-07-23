<script setup>
const sb = inject("SendBird");

import { GroupChannelHandler } from "@sendbird/chat/groupChannel";

const user = ref(null);

const customer = ref(null);
const token = ref(null);
const md = inject("md");
const props = defineProps({
  channel: String,
});
const input = ref(null);
const statusRef = ref(null);
const status = ref(null);
const pastMessages = ref([]);
const textareaRef = ref(null);
const lastElementRef = ref(null);
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

const showChannels = ref(false);
const currentChannel = ref(null);
const loading = ref(false);
const handleInput = async () => {
  loading.value = true;
  const messageText = input.value.trim();
  const params = {
    message: messageText,
  };
  currentChannel.value.sendUserMessage(params).onSucceeded((message) => {
    pastMessages.value.unshift(formatObj(message));
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
    return `Today · ${formattedTime}`;
  }

  return new Intl.DateTimeFormat("en-US", options).format(inputDate);
};

const formatObj = (message) => {
  const obj = {
    sender: !message.sender ? "Admin" : message.sender.userId,
    message: message.message,
    timestamp: formatDate(message.createdAt),
    type: message.messageType,
    url: message.plainUrl || false,
  };

  if (message.name) obj.name = message.name;

  return obj;
};
// Example usage:
const loadPreviousMessages = async (channel) => {
  const params = {
    limit: 20,
    reverse: true,
  };
  const query = channel.createPreviousMessageListQuery(params);
  try {
    const messages = await query.load();
    pastMessages.value = messages.map((item) => {
      const obj = formatObj(item);
      return obj;
    });
  } catch (e) {
    console.log(e);
    return;
  }
};

const enterChannel = async () => {
  const channel = await sb.groupChannel.getChannel(props.channel);
  // await channel.enter();
  currentChannel.value = channel;
  loadPreviousMessages(channel);
  setupEventListeners(channel);
};

const setupEventListeners = (channel) => {
  const channelHandler = new GroupChannelHandler({
    onMessageReceived: (channel, message) => {
      const obj = formatObj(message);
      pastMessages.value.unshift(obj);
    },
  });

  sb.groupChannel.addGroupChannelHandler(
    `channel:${props.channel}`,
    channelHandler
  );
};

const userChannels = ref(null);

const fileInput = ref(null);

const onImageUploadClick = () => {
  fileInput.value.click();
};

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  // if (!file.type.startsWith("image/")) {
  //   alert("Please select an image.");
  //   return;
  // }

  loading.value = true;
  status.value = `
    <div class="flex start align-middle">
      <div class="px-12 pad-r-ss">
        <i class="material-icons">backup</i>
      </div>
      <div>uploading a file...</div>
    </div>`;
  try {
    const params = {};
    params.file = file;
    params.fileName = file.name;
    params.fileSize = file.size;

    await currentChannel.value
      .sendFileMessage(params)
      .onSucceeded((message) => {
        pastMessages.value.unshift(formatObj(message));
        status.value = "";
        loading.value = false;
      });
    // Reset file input
    event.target.value = null;

    console.log("Image uploaded successfully");
  } catch (error) {
    status.value = `<div class="state-error">There was an error uploading the file.</div>`;
    console.error("Error uploading image", error);
  } finally {
    loading.value = false;
  }
};
const isImageFilename = (filename) => {
  return /\.(jpg|jpeg|png|gif)$/i.test(filename);
};

const handleFile = (m) => {
  let message = "";
  if (isImageFilename(m.url)) {
    message += `<div class='image' style="background-image:url(${m.url})"></div>`;
  }

  message += `<div class="file flex start align-middle">
              <div class="px-12 pad-r-ss">
                <i class="material-icons">description</i>
              </div>
              ${m.name}
            </div>`;
  //<a href="${m.url}"></a>
  return message;
};

onMounted(async () => {
  if (process.client) {
    const c = window.localStorage.getItem("customer");
    if (c) customer.value = c;
    const t = window.localStorage.getItem("token");
    if (t) token.value = t;
    try {
      user.value = await sb.connect(customer.value, token.value);
      // The user is connected to Sendbird server.
    } catch (err) {
      // Handle error.
    } finally {
      enterChannel();
    }
  }
});

onUnmounted(() => {
  sb.disconnect();
});
</script>

<template>
  <div class="chat-wrapper">
    <div class="channels" :class="{ active: showChannels }" v-if="userChannels">
      <ChannelList :data="userChannels" :current="props.channel" />
      <div class="channels-button high-off">
        <button @click="showChannels = !showChannels">
          <i class="material-icons">list</i>
        </button>
      </div>
    </div>
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
          <div class="message" :data-timestamp="m.timestamp">
            <template v-if="m.type != 'file'">
              <template v-if="m.message.startsWith('»')">
                <TopicChange :data="m.message" />
              </template>
              <div v-html="md.makeHtml(m.message)" v-else></div>
            </template>
            <template v-else>
              <div v-html="handleFile(m)"></div>
            </template>
          </div>
        </div>
        <div class="last" ref="lastElementRef"></div>
      </div>
      <div
        class="status pad-x-s pad-y-s"
        ref="statusRef"
        v-if="status"
        v-html="status"
      ></div>
      <div class="input" @keydown.enter.prevent="handleInput">
        <button @click="onImageUploadClick">
          <i class="material-icons">add</i>
        </button>
        <textarea
          v-model="input"
          ref="textareaRef"
          placeholder="Write messages"
          rows="1"
          :disabled="loading"
          @keyup="autoResize"
          @keydown.enter.shift.exact.stop
        ></textarea>
        <input
          type="file"
          ref="fileInput"
          class="off"
          @change="handleImageUpload"
        />
        <button @click="handleInput"><i class="material-icons">send</i></button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.chat-wrapper {
  width: 100%;
  display: flex;

  .channels-button {
    position: absolute;
    top: 3rem;
    right: -4rem;
    button {
      padding: use(ss) use(sss);
      background: use(accent-primary);
      height: 100%;
      width: 4rem;
      flex-shrink: 0;
      border-radius: 0 use(sss) use(sss) 0;

      i {
        font-size: 2.2rem;
        color: use(highlight-primary);
      }
    }
  }
}
.channels {
  background: use(highlight-secondary);
  transition: all 200ms $decel;
  border-right: 2px solid use(accent-primary);
  @include low {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 20rem;
    pointer-events: none;
    z-index: 1;
    transform: translateZ(0) translateX(-100%);
    button {
      pointer-events: all;
    }
  }
  &.active {
    transform: translateZ(0) translateX(0);
    pointer-events: all;
  }
}
.message {
  padding: use(sss) use(ss);
  border-radius: use(sss);
  width: max-content;
  max-width: 90%;
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
    color: use(lowlight-quaternary);
    white-space: pre;
    font-size: 1rem;
  }
  a {
    color: use(highlight-primary);
    &:hover {
      color: use(accent-quaternary);
    }
  }
}
.chat-component {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  flex-grow: 2;
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

  .image {
    height: 20rem;
    width: 20rem;
    background-position: center center;
    background-size: cover;
  }
  .file {
    font-family: monospace;
  }
}
</style>
