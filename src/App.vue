<template>
  <TexteEditor :AiteUserData="lists">
    <template #dialog="{ data }">
      {{ data.uid }}
    </template>
  </TexteEditor>
</template>
<script setup lang="ts">
import { ref } from "vue";
// import TexteEditor from "./components/textEditor/TextEditor.vue";
import TexteEditor from "../dist/index.js";
import "../dist/css/index.css";

const lists = ref(
  new Array(50).fill(1).map((v) => ({
    uid: v,
    name: "kkkk_" + v,
  }))
);
</script>
<style scoped lang="scss"></style>
