<script setup>
import { useBus } from "@/utils/event-bus";
const { bus } = useBus();
const props = defineProps({
  data: Array,
  selected: Array,
  limit: "0",
  id: String,
  name: String,
  full: Boolean,
});

const items = ref(props.data);
const selectedItems = ref(props.selected || []);
const searchQuery = ref("");

const highlightText = (text, searchTerm) => {
  if (!searchTerm) return text;
  const re = new RegExp(searchTerm, "gi");
  return text.replace(re, (matched) => `<strong>${matched}</strong>`);
};

const limited = computed(() => {
  return selectedItems.value.length >= parseInt(props.limit);
});

const highlightedItems = computed(() => {
  if (items.value)
    return items.value
      .filter((item) =>
        item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
      .map((item) => ({
        ...item,
        highlightedName: highlightText(item.name, searchQuery.value),
      }));
});

const updateEventName = computed(() => {
  return props.name ? `update:${props.name}` : "update:selectedItems";
});

const selectItem = (item) => {
  if (selectedItems.value.some((i) => i.id === item.id)) return;
  if (selectedItems.value.length >= props.limit) return;
  delete item.highlightedName;
  selectedItems.value.push(item);
  searchQuery.value = "";
  const selectEvent = props.name
    ? `select:${props.name}`
    : "select:selectedItems";
  bus.emit(selectEvent, item);
  bus.emit(updateEventName.value, selectedItems.value);
};

const removeItem = (item) => {
  const index = selectedItems.value.indexOf(item);
  const removeEvent = props.name
    ? `remove:${props.name}`
    : "remove:selectedItems";
  bus.emit(removeEvent, item);
  if (index > -1) {
    selectedItems.value.splice(index, 1);
    bus.emit(updateEventName.value, selectedItems.value);
  }
};
</script>

<template>
  <div class="combo-box" :class="{ active: searchQuery }" :full="full">
    <div>
      <input
        :hidden="limited"
        type="text"
        v-model="searchQuery"
        @input="filterResults"
        :disabled="limited"
        :placeholder="limited ? `Max Reached` : `Search`"
      />
    </div>
    <div class="selected-items">
      <div v-for="item in selectedItems" :key="item.id" class="pill">
        <div class="name">{{ item.name }}</div>
        <button @click="removeItem(item)">x</button>
      </div>
    </div>
    <ul
      class="filtered-items"
      v-if="
        highlightedItems && highlightedItems.length && !limited && searchQuery
      "
    >
      <li
        v-for="item in highlightedItems"
        :key="item.id"
        @click="selectItem(item)"
      >
        <span v-html="item.highlightedName"></span>
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
.combo-box {
  position: relative;
  &[full] {
    width: 100%;
  }
  &.active {
    background: rgba(0, 0, 0, 0.5);
  }
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  input {
    width: 100%;
  }
  strong {
    color: use(accent-quaternary);
  }

  .filtered-items {
    background: use(lowlight-tertiary);
    flex-grow: 1;
    left: 0;
    right: 0;
    top: 100%;
    @include scroll-y;
    max-height: 20rem;
    overscroll-behavior: contain;
    z-index: 2;
  }

  .selected-items .pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: use(ss);
    white-space: pre;
    padding: use(sss) use(ss);
    border: 1px solid use(accent-tertiary);
    border-radius: 15px;
    max-width: calc(100% - use(s));
    background: use(accent-primary);
    color: use(lowlight-tertiary);
    .name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 80%;
      flex-grow: 0;
    }
    button {
      width: 2rem;
    }
  }

  .selected-items .pill button {
    margin-left: 10px;
    border: none;
    background: none;
    cursor: pointer;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    cursor: pointer;
    padding: 5px;
    border-bottom: 1px solid use(lowlight-primary);
  }

  li:hover {
    background-color: use(accent-tertiary);
  }
}
</style>
