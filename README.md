#### **Props**

```
type AiteUser = { uid: number; name: string } & Readonly<Record<any, any>>;
```

| propsName         | 描述说明                     | 默认 | 必填 | 类型       |
| ----------------- | ---------------------------- | ---- | ---- | ---------- |
| AiteUserData      | 要@用户的数据                | []   | 是   | AiteUser[] |
| emojis            | 表情数据                     | []   | 否   | Array      |
| appendToContainer | 是否上传图片后插入到书写框中 | true | 否   | Boolean    |

#### **事件**

| 事件名 | 描述说明 | 值 |
| --- | --- | --- |
| editor_content | 点击发布后返回写入内容 | content:string |
| sendAiteUid | 返回@用户 uid | uid:number |
| aiteuser_exist | 用户已被@过 | exist:Boolean |
| upLoadImage | 返回上传的图片。props.appendToContainer 为 false 时触发 filesrc:string |
