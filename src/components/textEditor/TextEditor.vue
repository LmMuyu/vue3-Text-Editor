<template>
  <div ref="editor">:::</div>

  <button @click="appendImage">插入图片</button>
  <button @click="openEmoji">选择图片</button>
  <button @click="dialogVisible = true">@</button>

  <el-dialog v-model="dialogVisible" title="Tips" width="30%" :before-close="handleClose">
    <el-table :data="userLists" style="width: 100%" height="200">
      <el-table-column prop="name" />
    </el-table>
  </el-dialog>
</template>
<script setup lang="ts">
import Quill from "quill";
import { nextTick, onMounted, ref } from "vue";
import { ElDialog, ElTable, ElTableColumn } from "element-plus";

import "element-plus/es/components/dialog/style/css";
import "element-plus/es/components/table/style/css";
import "element-plus/es/components/table-column/style/css";

const props = defineProps({
  userLists: {
    type: Array,
    required: true,
  },
});

const editor = ref(null);
const dialogVisible = ref(false);
let quill: Quill | null = null;
const src = "https://t12.baidu.com/it/u=2944858655,3260611328&fm=58";

console.log(props.userLists);

function handleClose(done: () => void) {
  done();
}

function deleteText(start: number, len: number) {
  return quill?.deleteText(start, len);
}

function insertImage(start: number, src: string) {
  return quill?.insertEmbed(start, "image", src);
}

function getSelection() {
  const range = quill?.getSelection();

  if (!range) return null;

  const index = range.index;
  const len = range.length;

  return [index, len];
}

function appendImage() {
  const range = getSelection();

  if (range) {
    const index = range[0];
    const len = range[1];

    isLenSwitch(index, len, src);
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
      resolve(src);
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

    const worker = new Worker("../../worker/fetchEmoji.js");
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

onMounted(() => {
  if (editor.value) {
    quill = new Quill(editor.value, {
      theme: "snow",
    });
  }

  nextTick(() => {
    console.log( document.querySelector(".el-table_1_column_1"));
    
    //@ts-ignore
    document.querySelector(".el-table_1_column_1")!.style.textCss = `
    display:none
    `;
  });
});
</script>
<style scoped>
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
