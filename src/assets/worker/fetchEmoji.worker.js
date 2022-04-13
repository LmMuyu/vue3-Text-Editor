self.onmessage = function (e) {
  const emoji = e.data;

  class emojiSlice {
    constructor(page, emojis) {
      this.page = page;
      this.emojis = emojis;
    }
  }

  let count = 0;
  let page = 1;
  let emojiObj = new emojiSlice(page, []);

  for (const key in emoji) {
    if (count >= 50) {
      count = 0;
      page += 1;
      self.postMessage(emojiObj);
      emojiObj = new emojiSlice(page, []);
    }

    count += 1;
    emojiObj.emojis.push(key);
  }

  self.postMessage(emojiObj);
  emojiObj = null;

  self.close()
  self.postMessage("close")
}