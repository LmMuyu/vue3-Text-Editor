<template>
  <div ref="editor" @keydown="keyCode" class="editor_bg container"></div>
  <div class="flex itmes-center justify-between">
    <div class="flex itmes-center py-4">
      <el-button :disabled="dialogVisible" class="mx-2" @click="onDialogVisible" circle>
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
        <span class="flex items-center justify-center" style="width: 16px; height: 16px"
          >{{ collection[page]?.emojis?.[0] }}
        </span>
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
    :before-close="
      (done) => {
        handleClose(done);
        hover.unKeyEvent();
      }
    "
    @open="() => hover.onKeyEvent()"
  >
    <div ref="wrapper" class="hidden" style="height: 250px">
      <div :class="{ height: 32 * AiteUserData.length }">
        <div
          class="py-2 flex itmes-center"
          v-for="(userinfo, index) in AiteUserData"
          :key="index"
          @click="selectAite(userinfo)"
          :style="{ backgroundColor: unref(hover.hoverIndex) === index ? hover.rgbcolor : '' }"
          @mouseenter="hover.hover(index)"
        >
          <el-avatar :size="32" />
          <span class="ml-2 flex itmes-center"> {{ userinfo.name }} </span>
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
        <el-pagination
          @current-change="pagination.curChange"
          layout="prev, pager, next"
          :total="total"
        />
      </footer>
    </section>
  </el-dialog>
</template>
<script setup lang="ts">
import Quill, { DeltaOperation } from "quill";
import { nextTick, onMounted, PropType, ref, unref } from "vue";

import { BScroll, hoverBackground } from "./methods";
import Worker from "../../assets/worker/fetchEmoji.worker.js?worker";

import { ElDialog, ElButton, ElUpload, ElPagination, ElAvatar } from "element-plus";
import FontIcon from "../fonticon/FontIcon.vue";

import "element-plus/es/components/pagination/style/css";
import "element-plus/es/components/dialog/style/css";
import "element-plus/es/components/button/style/css";
import "element-plus/es/components/upload/style/css";
import "element-plus/es/components/avatar/style/css";

import "../../assets/bubble.css";

type AiteUser = { uid: number; name: string } & Readonly<Record<any, any>>;

const ctxEmit = defineEmits(["editor_content", "sendAiteUid", "aiteuser_exist", "upLoadImage"]);

const props = defineProps({
  AiteUserData: {
    type: Array as unknown as PropType<AiteUser[]>,
    required: true,
  },
  emojis: {
    type: Array,
  },
  appendToContainer: {
    type: Boolean,
    default: true,
  },
});

const page = ref(0);
const total = ref(1);
const editor = ref(null);
const wrapper = ref(null);
const totalTextLen = ref(0);
const aiteIdSet = new Set();
let quill: Quill | null = null;
const emojiVisible = ref(false);
const dialogVisible = ref(false);
const aiteUserSet = new Set<string>();
const p_status: Array<(value: any) => void> = [];
const dialogbox = ref<typeof ElDialog | null>(null);
const hover = new hoverBackground(props.AiteUserData.length);
const collection = ref<{ emojis: string[]; page: number }[]>([]);
hover.pushEnterEvent((index: number) => selectAite(props.AiteUserData[index]));

class Pagination {
  curChange(index: number) {
    page.value = index - 1;
  }
}

const pagination = new Pagination();

function release() {
  const content = editorContent();
  const contentstr = transform(content?.ops as unknown as DeltaOperation[]);

  if (contentstr.trim() !== "") {
    ctxEmit("editor_content", contentstr);
    deleteText(0, getLength()!);
  }
}

function selectAite(userinfo: AiteUser) {
  dialogVisible.value = false;
  hover.unKeyEvent();

  const _resolve = p_status[0];
  _resolve(userinfo);

  p_status.length = 0;
  setDelayPromise();
}

function clickEmoji(ev: Event) {
  const node = ev.target as HTMLSpanElement;
  if (node.nodeName === "SPAN") {
    emojiVisible.value = false;

    const _resolve = p_status[0];
    _resolve(node.innerHTML);
    p_status.length = 0;
    setDelayPromise();
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
  if (wrapper.value && !(wrapper.value as HTMLElement).hasAttribute("BScroll")) {
    const BS = BScroll(wrapper.value);
    (wrapper.value as HTMLElement).setAttribute("BScroll", "true");
  } else if (wrapper.value && (wrapper.value as HTMLElement).hasAttribute("BScroll")) {
    console.log("Bs挂载完成");
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
  let insertPos = 0;

  if (!pos) {
    insertPos = getLength() ?? 0;
  } else {
    insertPos = pos[0];
  }

  const p = setDelayPromise();

  try {
    const aiteUserInfo = (await Promise.race([p])) as AiteUser;

    if (aiteUserInfo) {
      aiTeUser(aiteUserInfo.uid as number, insertPos!, aiteUserInfo.name);
      !aiteIdSet.has(aiteUserInfo.uid) && ctxEmit("sendAiteUid", aiteUserInfo.uid);
      aiteIdSet.add(aiteUserInfo.uid);
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

function appendImage(upLoadImage: string) {
  const range = getSelection();

  if (range && props.appendToContainer) {
    const index = range[0];
    const len = range[1];
    isLenSwitch(index, len, upLoadImage);
  } else if (props.appendToContainer) {
    const start = quill?.getLength()!;
    insertImage(start, upLoadImage);
  } else {
    ctxEmit("upLoadImage", upLoadImage);
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

    const worker = new Worker();

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
    totalStrNum(delta.ops);
    formatRemove(delta.ops);

    if (totalTextLen.value > 100) {
      totalTextLen.value = 101;
      deleteText(100, getLength()!);
      return;
    }

    if (source === "user" && isInsertNull(delta.ops)) {
      const content = editorContent()!;
      const focuspos = getSelection()!;
      const ops = content.ops;
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

function totalStrNum(deltas: DeltaOperation[]) {
  const total = totalTextLen;

  deltas.forEach((delta) => {
    for (const key in delta) {
      if (key === "delete") {
        total.value += -delta[key]!;
      } else if (key === "insert") {
        if (Object.prototype.toString.call(delta[key as "insert"]) === "[object Object]") {
          return;
        }

        total.value += delta[key]!.length;
      }
    }
  });
}

function formatRemove(ops: DeltaOperation[]) {
  const insert = ops[0]?.insert ? ops[0].insert : ops[1]?.insert ? ops[1]?.insert : undefined;

  if ((ops.length === 1 || ops.length === 2) && insert?.toString().length) {
    Promise.resolve().then(() => {
      quill?.removeFormat(0, getLength()! - 1);
    });
  }
}

function keyCode(e: KeyboardEvent) {
  const key = e.key;

  if (key === "@") {
    onDialogVisible();
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

function isInsertNull(delta: DeltaOperation[]) {
  for (let i = 0; i < delta.length; i++) {
    if ("insert" in delta[i]) {
      return delta[i].insert !== "";
    }
  }
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

.py-2 {
  padding: 4px 0;
}

.p-4 {
  padding: 16px;
}

.mx-2 {
  margin: 0 4px;
}

.ml-2 {
  margin-left: 4px;
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

.itmes-center {
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
