<template>
  <div
    ref="el"
    class="sh-carousel"
    :id="carouselId"
    :variant="variant"
    @mouseenter="mousePause(true, true)"
    @mouseleave="mousePause(false, true)"
    @swipe="swipeHandler"
    @click="pause"
    aria-roledescription="carousel"
  >
    <div ref="spacer" class="carousel-spacer"></div>
    <div ref="slides" class="slides">
      <slot></slot>
    </div>
    <div v-if="!hideControls" class="controls">
      <button
        :aria-controls="carouselId"
        v-if="!hideArrows"
        class="arrow next"
        @click="nextHandler"
      >
        <i class="material-icons">arrow_forward</i>
      </button>
      <button
        :aria-controls="carouselId"
        v-if="!hideArrows"
        class="arrow previous"
        @click="previousHandler"
      >
        <i class="material-icons">arrow_back</i>
      </button>
      <div class="play">
        <button
          :aria-controls="carouselId"
          class="button"
          :aria-label="playLabel"
          :disabled="isFocused"
          @click="play"
        >
          {{ mode }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from "vue";
import { useBus } from "@/utils/event-bus";
const { bus } = useBus();

const props = defineProps({
  startAt: {
    // 'Which position in the slide array should the modal begin on',
    type: Number,
    default: 0,
  },
  perNext: {
    // 'How many items the carousel will cycle through on interaction',
    type: Number,
    default: 1,
  },
  hideControls: {
    // 'Hide all controls',
    type: Boolean,
    default: false,
  },
  hideArrows: {
    // 'Hide the next/previous arrow controls',
    type: Boolean,
    default: false,
  },
  hideDots: {
    // 'Hide the dot controls',
    type: Boolean,
    default: false,
  },
  autoplay: {
    // 'Begin automatically cycling',
    type: String,
    default: null,
  },
  uniqueId: String,
  resolution: {
    // 'Size of carousel',
    type: String,
    default: null,
  },
  variant: String,
  vertical: {
    type: Boolean,
  },
});

let el = ref(null);
let slides = ref(null);
let list = ref([]);
let active = ref(null);
let previousArrow = ref("arrow-left");
let nextArrow = ref("arrow-right");
let paused = ref(false);
let playing = ref(false);
let playLabel = ref("");
let playTimer = ref({});
let userTriggered = ref(false);
let carouselId = ref(null);
let changeDelay = ref(0);

// Computed values and watchers

const mode = computed(() => (!playing.value ? "▐▐" : "▶"));

const delayTimer = computed(() => {
  const autoplay = parseInt(props.autoplay);
  let delay = autoplay || 5000;
  if (delay < 2000) delay = 2000;
  return delay;
});

const isFocused = computed(() => {
  let focused = false;
  // if (document.querySelector('.sh-carousel')) {
  //   focused = document.querySelector('.sh-carousel').contains(document.activeElement);
  // }
  return focused;
});

watch(active, (val) => {
  // Active value change logic here...
});

watch(paused, (val) => {
  playLabel.value = val
    ? "Start automatic slide show"
    : "Stop automatic slide show";
});

onMounted(async () => {
  setArrowIcon();
  // setUUID();
  carouselId.value = props.uniqueId ? props.uniqueId : `carousel-${uuid}`;
  await getSlides();
  // adaExtra();
  active.value = props.startAt;
  if (!props.resolution) setTimeout(autoSize);
  if (props.autoplay) play();
});

// Methods

const setArrowIcon = () => {
  if (props.vertical) {
    previousArrow.value = "arrow-up";
    nextArrow.value = "arrow-down";
  }
};

const events = () => {
  autoSize();
};

const adaExtra = () => {
  const slides = slides.value.querySelectorAll("li");
  slides.forEach((slide, index) => {
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", `${index} of ${slides.value.length}`);
  });
};

const mousePause = (bool = true) => {
  if (playing.value) {
    paused.value = bool;
    if (bool) {
      clearTimeout(playTimer.value);
    } else if (autoplay.value && !buttonPaused.value) play();
  }
};

const pause = () => {
  clearTimeout(playTimer.value);
  paused.value = true;
};

const play = () => {
  playing.value = true;
  playTimer.value = setTimeout(() => {
    if (!paused.value && !focused.value) {
      userTriggered.value = false;
      next();
    }
    play();
  }, delayTimer.value);
};

const stop = () => {
  playing.value = false;
};

const focus = () => {
  const activeSlide = el.querySelector(".active");
  if (activeSlide) activeSlide.focus();
  if (variant.value === "secondary") {
    if (vertical.value) {
      const dist = props.hideArrows
        ? activeSlide.offsetTop
        : activeSlide.offsetTop - 60;
      list.value.scrollTop = dist;
    } else {
      const dist = props.hideArrows
        ? activeSlide.offsetLeft
        : activeSlide.offsetLeft - 60;
      list.value.scrollLeft = dist;
    }
  }
};

const nextHandler = () => {
  userTriggered.value = true;
  next();
};

const next = () => {
  const len = slides.value.length;
  let which = active.value + props.perNext;
  if (which >= len) which -= len;
  activate(which);
};

const previousHandler = () => {
  userTriggered.value = true;
  previous();
};

const previous = () => {
  let which = active.value - props.perNext;
  const len = slides.value.length;
  if (which < 0) which += len;
  activate(which);
};

const activate = (which) => {
  // bus.emit("carousel-slide-changing", {
  //   id: this.carouselId,
  //   active: this.active,
  //   changeDelay: this.changeDelay,
  // });
  setTimeout(() => {
    active.value = which;
    bus.emit("carousel-slide-changed", {
      id: carouselId.value,
      active: active.value,
    });
  }, changeDelay.value);
};

const swipeHandler = (e) => {
  let dir = "next";
  if (e.direction > 2) dir = "previous";
  this[dir]();
};

const autoSize = () => {
  if (slides.value) {
    slides.value.classList.add("config");
    let maxHeight = 0;
    const slides = this.$el.querySelectorAll(".slides li");
    slides.forEach((slide) => {
      const ht = slide.offsetHeight;
      if (ht > maxHeight) maxHeight = ht;
    });
    slides.value.classList.remove("config");
    const heightStr = `${maxHeight}px`;
    spacer.value.style.height = heightStr;
  }
};

const getSlides = () => {
  const arr = slides.value.children;
  list.value = arr[0].cloneNode(true);
  slides.value.prepend(list.value);
  slides.value = [...list.value.children];
};

const setChangeDelay = (time) => {
  changeDelay.value = time;
};
</script>

<style lang="scss" src="./style/host.scss"></style>
<style lang="scss" src="./style/default.scss"></style>
<style lang="scss" src="./style/primary.scss"></style>
