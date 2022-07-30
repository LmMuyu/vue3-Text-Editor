import BscrollCore from "@better-scroll/core";
import MouseWheel from "@better-scroll/mouse-wheel";
import Quill from "quill";

export function BScroll(continer: string | HTMLElement) {
  BscrollCore.use(MouseWheel);

  return new BscrollCore(continer, {
    click: true,
    mouseWheel: true,
    bounce: false,
  });
}

function quillPlugin() {
  const isline = Quill.import("")
}
