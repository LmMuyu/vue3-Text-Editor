import BscrollCore from "@better-scroll/core";
import MouseWheel from "@better-scroll/mouse-wheel";
import { Ref, ref } from "vue";

export function BScroll(continer: string | HTMLElement) {
  BscrollCore.use(MouseWheel);

  return new BscrollCore(continer, {
    click: true,
    mouseWheel: true,
    bounce: false,
  });
}

class Container {
  static of(left: any, right: any) {
    return new Either(left, right);
  }
}

export class Either<T, K> extends Container {
  left: K;
  right: T;
  constructor(left: K, right: T) {
    super();
    this.left = left;
    this.right = right;
  }

  map(f: Function) {
    return this.right ? Either.of(this.left, f(this.right)) : Either.of(f(this.left), this.right);
  }
}

class otherKeyboardEvent {
  protected enterEventFn: Function | undefined;

  constructor() {
    this.enterEventFn = undefined;
  }

  public pushEnterEvent(backcall: Function) {
    this.enterEventFn = backcall;
  }
}

export class hoverBackground extends otherKeyboardEvent {
  hoverIndex: Ref<number>;
  rgbcolor: string;
  private total: number;
  private keymouseBackcall: (ev: KeyboardEvent) => void;
  constructor(total: number) {
    super();
    this.total = total;
    this.hoverIndex = ref(0);
    this.rgbcolor = "#FAFAFA";
    this.keymouseBackcall = () => {};
  }

  hover(index: number) {
    if (index === this.hoverIndex.value) return;
    this.hoverIndex.value = index;
  }

  onKeyEvent() {
    const that = this;
    this.keymouseBackcall = this.keyEventBackCall.bind(this);
    window.addEventListener("keydown", that.keymouseBackcall, false);
  }

  unKeyEvent() {
    const that = this;
    window.removeEventListener("keydown", that.keymouseBackcall, false);
  }

  private keyEventBackCall(ev: KeyboardEvent) {
    if (ev.key === "ArrowDown") {
      if (this.hoverIndex.value < this.total - 1) {
        this.hoverIndex.value += 1;
        return;
      }

      return;
    } else if (ev.key === "ArrowUp") {
      if (this.hoverIndex.value > 0) {
        this.hoverIndex.value -= 1;
        return;
      }

      return;
    }

    this.otherRunFn(ev.key);
    return;
  }

  private otherRunFn(key: string) {
    if (key === "Enter") {
      this.enterEventFn && this.enterEventFn(this.hoverIndex.value);
    }
  }
}
