<template>
  <TexteEditor :AiteUserData="lists">
    <template #dialog="{ data }">
      {{ data.uid }}
    </template>
  </TexteEditor>
</template>
<script setup lang="ts">
import { ref } from "vue";
import TexteEditor from "./components/textEditor/TextEditor.vue";

const lists = ref(
  [1, 2, 5, 46, 89, 8, 9, 4].map((v) => ({
    uid: v,
  }))
);
</script>
<style scoped lang="scss"></style>
