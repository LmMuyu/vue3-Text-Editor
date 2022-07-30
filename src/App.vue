<template>
  <TextEditor :appendToContainer="false" @upLoadImage="upImageSrc" :AiteUserData="lists">
  </TextEditor>
</template>
<script setup lang="ts">
import { ref } from "vue";
// import TexteEditor from "./components/textEditor/TextEditor.vue";
// import TexteEditor from "../dist/index.js";
// import "../dist/css/style_index.css";

type AiteUser = { uid: number; name: string } & Readonly<Record<any, any>>;

const lists = ref<AiteUser[]>(
  new Array(50).fill(1).map((v, i) => ({
    uid: i,
    name: "kkkk_" + i,
  }))
);

function upImageSrc(src: string) {
  console.log(src);
}
</script>
<style scoped lang="scss"></style>
