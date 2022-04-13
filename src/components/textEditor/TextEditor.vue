<template>
  <div ref="editor" class="editor_bg container"></div>
  <div class="flex align-item justify-between">
    <div class="flex align-item py-4">
      <el-button class="mx-2" @click="onDialogVisible" circle>
        <font-icon icon="iconaite"></font-icon>
      </el-button>
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
      <el-button circle class="mx-2" @click="openEmoji">
        <span>{{ collection[page]?.emojis?.[0] }} </span>
      </el-button>
    </div>

    <div>
      <span style="font-size: 12px" class="mx-2"> {{ totalTextLen + "/" + 100 }}</span>
      <el-button @click="release" plain>发布</el-button>
    </div>
  </div>

  <el-dialog
    ref="dialogbox"
    v-model="dialogVisible"
    title="关注用户"
    width="30%"
    :before-close="handleClose"
  >
    <div ref="wrapper" class="hidden" style="height: 250px">
      <div class="continer">
        <div v-for="(userinfo, index) in AiteUserData" :key="index" @click="selectAite(userinfo)">
          <slot name="dialog" :data="userinfo"></slot>
        </div>
      </div>
    </div>
  </el-dialog>
  <el-dialog v-model="emojiVisible" title="表情" :before-close="handleClose">
    <section class="w-full h-full">
      <main class="grid" @click="clickEmoji">
        <span v-for="(emoji, index) in collection[page].emojis" :key="index">
          {{ emoji }}
        </span>
      </main>
      <footer>
        <el-pagination :page-size="10" layout="prev, pager, next" :total="total" />
      </footer>
    </section>
  </el-dialog>
</template>
<script setup lang="ts">
import Quill, { DeltaOperation } from "quill";
import { nextTick, onMounted, PropType, ref } from "vue";

import { BScroll } from "./methods";

import { ElDialog, ElButton, ElUpload, ElPagination } from "element-plus";
import FontIcon from "../fonticon/FontIcon.vue";

import "element-plus/es/components/pagination/style/css";
import "element-plus/es/components/dialog/style/css";
import "element-plus/es/components/button/style/css";
import "element-plus/es/components/upload/style/css";

import "../../assets/bubble.css";

type AiteUser = { uid: number; name: string } & Readonly<Record<any, any>>;

const ctxEmit = defineEmits(["editor_content", "sendAiteUid", "aiteuser_exist"]);

const props = defineProps({
  AiteUserData: {
    type: Array as unknown as PropType<AiteUser>,
    required: true,
  },
  emojis: {
    type: Array,
  },
});

let quill: Quill | null = null;
const editor = ref(null);
const dialogVisible = ref(false);
const dialogbox = ref<typeof ElDialog | null>(null);
const p_status: Array<(value: any) => void> = [];
const aiteUserSet = new Set<string>();
const wrapper = ref(null);
const emojiVisible = ref(false);
const collection = ref<{ emojis: string[]; page: number }[]>([]);
const page = ref(0);
const total = ref(1);
const totalTextLen = ref(0);

function release() {
  const content = editorContent();
  const contentstr = transform(content?.ops as unknown as DeltaOperation[]);

  if (contentstr.trim() !== "") {
    console.log("content");
    ctxEmit("editor_content", contentstr);
    deleteText(0, getLength()!);
  }
}

function selectAite(userinfo: AiteUser) {
  dialogVisible.value = false;

  const _resolve = p_status[0];
  _resolve(userinfo);
}

function clickEmoji(ev: Event) {
  const node = ev.target as HTMLSpanElement;
  if (node.nodeName === "SPAN") {
    emojiVisible.value = false;

    const _resolve = p_status[0];
    _resolve(node.innerHTML);
  }
}

async function onDialogVisible() {
  dialogVisible.value = true;
  insertLinke();

  await nextTick();
  modifyPadding();
  registered();
}

function registered() {
  if (wrapper.value) {
    console.log(wrapper.value);
    const BS = BScroll(wrapper.value);
  } else {
    console.error("无法获取dom");
  }
}

function modifyPadding() {
  (document.querySelector(".el-dialog__body")! as HTMLElement).style.cssText = `
    padding:16px
  `;
}

async function insertLinke() {
  const pos = getSelection();
  let insertPos = null;

  if (!pos) {
    insertPos = getLength();
  } else {
    insertPos = pos[0];
  }

  const p = setDelayPromise();

  try {
    const aiteUserInfo = (await Promise.race([p])) as AiteUser;

    if (aiteUserInfo) {
      aiTeUser(aiteUserInfo.uid as number, insertPos!, aiteUserInfo.name);
      ctxEmit("sendAiteUid", aiteUserInfo.uid);
    }
  } catch (error) {
    console.log(error);
  } finally {
    p_status.length = 0;
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
  emojiVisible.value = true;

  const P = setDelayPromise();
  const emoji = (await Promise.race([P])) as string;

  try {
    if (range) {
      const index = range[0];
      insertText(index, emoji);
    } else {
      const index = getLength()!;
      insertText(index, emoji);
    }
  } catch (err) {
    console.log(err);
  } finally {
    p_status.length = 0;
  }
}

async function loadEmoji() {
  try {
    const emojiJson = await fetch("https://unpkg.com/emojilib@3.0.6/dist/emoji-en-US.json", {
      cache: "default",
      mode: "cors",
      method: "Get",
      keepalive: true,
    });

    const worker = new Worker(
      new URL("../../assets/worker/fetchEmoji.worker.js", import.meta.url),
      {
        type: "module",
      }
    );

    worker.onmessage = function (e) {
      if (e.data === "close") {
        worker.terminate();
        total.value = collection.value[collection.value.length - 1].page;
        return;
      }

      const sliceEmojis = e.data;
      // console.log(sliceEmojis);

      collection.value.push(sliceEmojis);
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

//quill事件绑定
function quillOn() {
  quill?.on("text-change", (delta, olddelta, source) => {
    Promise.resolve().then(totalStrNum.bind(null, delta.ops));

    if (totalTextLen.value + 1 > 100) {
      deleteText(101, getLength()!);
      return;
    }

    if (source === "user") {
      const content = editorContent()!;
      const ops = content.ops;
      const focuspos = getSelection()!;
      let currentIndex = 0;
      let aitesetLen = aiteUserSet.size;

      for (let i = 0; i < ops.length && aitesetLen > 0; i++) {
        const op = ops[i];

        if (op?.attributes?.link) {
          const aiteop = op.insert as string;
          const len = aiteop.length;

          if (aiteUserSet.has(aiteop)) {
            currentIndex += len;
          } else {
            deleteText(currentIndex, len);
            quill?.insertText(currentIndex, aiteop);
            currentIndex += len;
            aitesetLen -= 1;

            setTimeout(() => {
              quill?.setSelection(focuspos[0], 0);
            }, 0);

            const oldop = olddelta.ops[i];
            const oldaiteuser = oldop.insert;
            aiteUserSet.delete(oldaiteuser as string);
          }
        } else {
          currentIndex += op.insert!.toString().length;
        }
      }
    }
  });
}

function totalStrNum(delta: DeltaOperation[]) {
  const insertText = delta.filter((v) => "insert" in v)[0]?.insert;
  const deleteLen = delta.filter((v) => "delete" in v)[0]?.delete;

  if (insertText && insertText !== "") {
    console.log(insertText);

    totalTextLen.value += delta.reduce((pre, next) => (pre += next.insert.length), 0) - 1;
  } else if (deleteLen && deleteLen > 0) {
    totalTextLen.value -= deleteLen;
  }
}

onMounted(() => {
  if (editor.value) {
    quill = new Quill(editor.value, {
      theme: "bubble",
      placeholder: "发布评论......",
    });

    quillOn();
    tooltipHidden();
  }
});

/***
 * 工具函数
 *
 */

function aiTeUser(uid: number, insertPos: number, name: string) {
  const aitename = "@" + name;
  if (aiteUserSet.has(aitename)) {
    return ctxEmit("aiteuser_exist", true);
  }

  aiteUserSet.add(aitename);
  quill?.insertText(insertPos, aitename, "link", `https://javascript(${uid})`);
}

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

function getLength() {
  return quill?.getLength();
}

function insertText(start: number, text: string) {
  quill?.insertText(start, text);
}

function transform(deltas: DeltaOperation[]) {
  return deltas
    .map((delta) => {
      if (delta && delta.attributes?.link) {
        return `<a herf="${delta.attributes?.link}">${delta.insert}</a>`;
      } else {
        return delta.insert;
      }
    })
    .join(" ");
}

const setDelayPromise = () => new Promise((resolve, reject) => p_status.push(resolve, reject));
</script>

<style scoped>
.container {
  max-height: 80px;
  overflow-y: auto;
}
.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}

.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-gap: 8px 8px;
}

.hidden {
  overflow: hidden;
}
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
