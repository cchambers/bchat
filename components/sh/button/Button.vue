<template>
  <button
    ref="button"
    :class="{ active: isActive }"
    :type="type"
    v-on:keyup.enter="tapHandler"
    :close-trigger="closeTrigger"
    :print-trigger="printTrigger"
    :value="value"
    :variant="variant"
    :name="name"
    :id="uniqueId"
    :form="form"
    :formaction="formaction"
    :formmethod="formmethod"
    :formtarget="formtarget"
    :disabled="disabled"
    v-bind:role="ariaRole"
    v-bind:aria-selected="isActive"
    v-bind:aria-controls="ariaControls"
    class="sh-button"
  >
    <div v-if="icon" class="button-icon">
      <i class="material-icons">{{ active ? activeIcon : icon }}</i>
    </div>
    <slot name="before-text"></slot>
    <div class="actual-text">
      <span>
        <slot></slot>
      </span>
    </div>
    <div class="active-text" v-if="isActive">
      <span>{{ activeText }}</span>
    </div>
    <slot name="after-text"></slot>
  </button>
</template>

<script>
import { useBus } from "@/utils/event-bus";
// import ComponentPrototype from "@/utils/component-prototype";

export default {
  // mixins: [ComponentPrototype],
  name: "Button",
  props: {
    ajax: String,
    ajaxSuccess: String,
    variant: {
      type: String,
      default: "default",
    },
    activeText: String,
    activeIcon: String,
    beforeIcon: String,
    icon: String,
    group: String,
    closeTrigger: Boolean,
    printTrigger: Boolean,
    toggle: String,
    clickEvent: String,
    active: Boolean,
    link: String,
    size: String,
    target: String,
    ariaControls: String,
    value: String,
    name: String,
    iconButton: Boolean,
    type: {
      type: String,
      default: "button",
    },
    form: String,
    formaction: String,
    formmethod: String,
    formtarget: String,
    disabled: Boolean,
    autofocus: Boolean,
    uniqueId: String,
  },

  setup() {
    const { bus } = useBus();
    return {
      bus,
    };
  },

  data() {
    return {
      isActive: false,
      emitData: null,
      isRole: false,
      once: false,
      ariaRole: "",
      isDisabled: false,
    };
  },

  created() {
    if (this.link) this.ariaRole = "link";
    if (this.disabled) this.isDisabled = true;
  },

  mounted() {
    if (this.active) this.isActive = true;
    if (this.ariaRole) this.isRole = this.ariaRole;

    this.$refs.button.addEventListener("click", this.tapHandler);
    if (this.uniqueId) {
      this.bus.on(`${this.uniqueId}-button-toggle`, this.doToggle);
    }
    const innerButton = this.$refs.button.querySelector("button");
    if (innerButton) {
      const actualText = innerButton.querySelector(".actual-text");
      this.$refs.button.innerHTML = actualText.outerHTML;
    }
  },
  watch: {
    active(val) {
      this.isActive = val;
    },
  },

  methods: {
    // events() {
    //   const self = this;
    //   if (self.group) {
    //     self.bus.on("group-toggle", (data) => {
    //       if (data.group === self.group) self.groupHandler(data);
    //     });
    //   }

    //   self.bus.on("button-toggle", (data) => {
    //     if (data.which === this.uniqueId) this.doToggle();
    //   });
    // },

    groupHandler(data) {
      if (data.el === this) return;
      this.isActive = false;
    },

    tapHandler(e) {
      if (this.disabled) return;
      // this.ripple(e);
      if (this.ajax) {
        this.isDisabled = true;
        this.sendRequest();
      }
      if (this.toggle && !this.ajax) this.doToggle();
      if (this.clickEvent) {
        if (e) e.preventDefault();
        this.bus.emit(this.clickEvent, {
          el: this,
          value: this.$refs.button.value,
        });
      }
      if (this.group) {
        this.bus.emit("group-toggle", {
          el: this,
          group: this.group,
        });
      }
    },

    sendRequest() {
      const url = this.ajax;
      fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
      })
        .then((response) => response.json())
        .then((data) => {
          if (this.ajaxSuccess) {
            this.bus.emit(this.ajaxSuccess, data);
          } else if (this.toggle) this.doToggle();
          this.isDisabled = false;
        })
        .catch((error) => {
          this.log(error, 1);
          this.isDisabled = false;
        });
    },

    ripple(e) {
      const ripple = document.createElement("div");
      ripple.classList.add("ripple");
      const rect = e.target.getBoundingClientRect();
      const x = rect.width / 2;
      const y = rect.height / 2;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      this.$el.prepend(ripple);
      setTimeout(() => {
        ripple.remove();
      }, 1400);
    },

    doToggle() {
      if (this.toggle === "once" && !this.once) {
        this.once = true;
      } else {
        return;
      }
      if (this.group && this.isActive) return;
      this.isActive = !this.isActive;
    },
  },
};
</script>

<style lang="scss" src="./style/host.scss"></style>
<style lang="scss" src="./style/default.scss"></style>
<style lang="scss" src="./style/variants.scss"></style>
