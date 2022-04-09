<template>
  <div ref="editor" @click="watchClickATab" class="editor_bg"></div>
  <div class="flex align-item justify-between">
    <div class="flex align-item py-4">
      <el-button class="mx-2" @click="onDialogVisible" circle>
        <font-icon icon="iconaite"></font-icon>
      </el-button>
      <button class="mx-2" @click="openEmoji">选择表情</button>
      <el-upload
        class="upload-demo mx-2"
        :show-file-list="false"
        :on-change="selectImage"
        action="//"
        :auto-upload="false"
      >
        <template #trigger>
          <el-button circle>
            <font-icon icon="icontupian"> </font-icon>
          </el-button>
        </template>
      </el-upload>
    </div>

    <div>
      <el-button @click="release" plain>Plain</el-button>
    </div>
  </div>

  <el-dialog
    ref="dialogbox"
    v-model="dialogVisible"
    title="Tips"
    width="30%"
    :before-close="handleClose"
  >
    <div v-for="(userinfo, index) in AiteUserData" :key="index" @click="selectAite(userinfo)">
      <slot name="dialog" :data="userinfo"></slot>
    </div>
  </el-dialog>
</template>
<script setup lang="ts">
import Quill from "quill";
import { nextTick, onMounted, PropType, ref } from "vue";

import { ElDialog, ElButton, ElUpload } from "element-plus";
import FontIcon from "../fonticon/FontIcon.vue";

import "element-plus/es/components/dialog/style/css";
import "element-plus/es/components/button/style/css";
import "element-plus/es/components/upload/style/css";

import "../../assets/bubble.css";

type AiteUser = { uid: number } & Readonly<Record<any, any>>;

const ctxEmit = defineEmits(["editor_content", "sendAiteUid"]);

const props = defineProps({
  AiteUserData: {
    type: Array as unknown as PropType<AiteUser>,
    required: true,
  },
});

const editor = ref(null);
const dialogVisible = ref(false);
const dialogbox = ref<typeof ElDialog | null>(null);
const p_status: Array<(value: any) => void> = [];
let quill: Quill | null = null;

function watchClickATab(el: Event) {
  // console.log(el.target);
}

function release() {
  const content = editorContent();

  if (content) {
    ctxEmit("editor_content", content);
  }
}

function selectAite(userinfo: AiteUser) {
  dialogVisible.value = false;

  const _resolve = p_status[0];
  _resolve(userinfo);
}

function onDialogVisible() {
  dialogVisible.value = true;

  insertLinke();
}

async function insertLinke() {
  const p = new Promise((resolve, reject) => {
    p_status.push(resolve, reject);
  });

  const uid = await Promise.race([p]);

  if (uid) {
    ctxEmit("sendAiteUid", uid);
  }
}

function handleClose(done: () => void) {
  p_status[1](undefined);
  done();
}

function appendImage(uploadImaag: string) {
  const range = getSelection();

  if (range) {
    const index = range[0];
    const len = range[1];
    isLenSwitch(index, len, uploadImaag);
  } else {
    const start = quill?.getLength()!;
    insertImage(start, uploadImaag);
  }
}

function isLenSwitch(index: number, len: number, imgsrc: string) {
  if (len > 0) {
    deleteText(index, len);
    insertImage(index, imgsrc);
  } else {
    insertImage(index, imgsrc);
  }
}

async function openEmoji() {
  const range = getSelection();
  try {
    if (range) {
      const index = range[0];
      const len = range[1];
      const src = await selectEmoji();

      isLenSwitch(index, len, src);
    } else {
      const start = quill?.getLength()!;
      const src = await selectEmoji();

      insertImage(start, src);
    }
  } catch (err) {
    console.log(err);
  }
}

function selectEmoji(): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("src");
    }, 3000);
  });
}

async function loadEmoji() {
  try {
    const emojiJson = await fetch("https://unpkg.com/emojilib@3.0.6/dist/emoji-en-US.json", {
      cache: "default",
      mode: "cors",
      method: "Get",
      keepalive: true,
    });

    const worker = new Worker("/src/worker/fetchEmoji.js");
    const collection: any[] = [];

    worker.onmessage = function (e) {
      if (e.data === "close") {
        worker.terminate();
        // console.log(collection);
        return;
      }

      const sliceEmojis = e.data;
      collection.push(sliceEmojis);
    };

    worker.postMessage(await emojiJson.json());
  } catch (error) {
    console.log(error);
  }
}

loadEmoji();

function selectImage(evt: any) {
  const file = evt.raw as File;

  const newfile = URL.createObjectURL(file.slice(0));
  appendImage(newfile);
}

function auillOn() {
  quill?.on("text-change", (delta, olddelta, source) => {
    if (source === "user") {
      console.log(delta);
      console.log(olddelta);
    }
  });
}

onMounted(() => {
  if (editor.value) {
    quill = new Quill(editor.value, {
      theme: "bubble",
      placeholder: "发布评论......",
    });

    auillOn();

    tooltipHidden();
    quill.insertText(0, "@Hello", "link", "https://javascript:void(123)");

    const content = editorContent();
    // console.log(content);
  }
});

//工具函数
function editorContent() {
  const content = quill?.getContents();

  if (content) {
    return content;
  }
}

function getSelection() {
  const range = quill?.getSelection();

  if (!range) return null;

  const index = range.index;
  const len = range.length;

  return [index, len];
}

function deleteText(start: number, len: number) {
  return quill?.deleteText(start, len);
}

function insertImage(start: number, src: string) {
  return quill?.insertEmbed(start, "image", src);
}

async function tooltipHidden() {
  //@ts-ignore
  const tooltip = document.querySelector(".ql-tooltip")!;
  tooltip?.parentNode?.removeChild(tooltip);
}
</script>
<style scoped>
.editor_bg {
  border: 1px solid #ecf0f1;
}
.px-4 {
  padding: 0 16px;
}

.py-4 {
  padding: 16px 0;
}

.p-4 {
  padding: 16px;
}

.mx-2 {
  margin: 0 4px;
}

.flex {
  display: flex;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.align-item {
  align-items: center;
}
.infinite-list {
  height: 300px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.infinite-list .infinite-list-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  margin: 10px;
}
.infinite-list .infinite-list-item + .list-item {
  margin-top: 10px;
}
</style>
