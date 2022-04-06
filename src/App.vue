<template>
  <TexteEditor :user-lists="lists" />
</template>
<script setup lang="ts">
import { ref } from "vue";
import TexteEditor from "./components/textEditor/TextEditor.vue";

const lists = ref(
  [1, 2, 5, 46, 89, 8, 9, 4].map((v) => ({
    name: v,
  }))
);
</script>
<style scoped lang="scss"></style>
