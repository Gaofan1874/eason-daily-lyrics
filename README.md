# **EasonCode \- 陪你度过漫长岁月 (Daily Eason Lyrics)**

"在成人的世界里，我们都需要一点陈奕迅。"

**EasonCode** 是一款专为陈奕迅粉丝（兼程序员）打造的 VS Code 插件。它不想打扰你写代码，只是想在你 Debug 到深夜、或者项目上线成功的那一刻，在状态栏轻轻对你说一句最懂你的歌词。

## **✨ 核心特性 (Features)**

### **1\. 每日/每时歌词 (Daily Lyrics)**

插件会在 VS Code 底部状态栏轮播精选的 Eason 歌词。

* 就像他在耳边轻轻哼唱。  
* 支持点击歌词查看出处（歌曲、专辑）。

### **2\. 情绪模式切换 (Mood Switch)**

我们知道程序员的情绪是波动的，所以提供了多种模式匹配你的工作状态：

| 模式                   | 图标 | 描述                     | 典型歌词                    |
| :--------------------- | :--- | :----------------------- | :-------------------------- |
| **随机漫步 (Random)**  | 🎲    | 一切随缘，遇上哪首是哪首 | (全库随机)                  |
| **深夜抑郁 (Sad)**     | 🌧️    | 适合深夜加班、修 Bug     | "闭起双眼你最挂念谁..."     |
| **治愈哲理 (Healing)** | ☕    | 适合思考架构、重构代码   | "劳力是无止境，活着多好..." |
| **浮夸热血 (Crazy)**   | 🔥    | 适合冲刺上线、打鸡血     | "那年十八，母校舞会..."     |

### **3\. 低打扰设计 (Zen Mode)**

* 歌词只在状态栏显示，不会弹窗干扰编码。  
* 只有在你需要的时候（点击状态栏），才会展开更多选项。

## **🚀 使用方法 (Usage)**

1. **安装插件**：在 VS Code 扩展市场搜索 EasonCode 并安装。  
2. **自动播放**：安装后，状态栏右下角会自动出现歌词。  
3. **交互菜单**：**点击状态栏歌词**，可以弹出菜单：  
   * 切歌 (Next Lyric)：手动切换下一句。  
   * 切换心情 (Change Mood)：选择你当前的心情模式。  
   * 查看歌曲信息 (Open Link)：跳转到网易云音乐等平台收听。  
4. **命令调用**：使用快捷键 Ctrl+Shift+P (Mac: Cmd+Shift+P) 输入 Eason 查找所有命令。

## **⚙️ 设置 (Settings)**

你可以在 VS Code 的设置 (Ctrl+,) 中自定义插件行为：

* **eason.updateInterval**:  
  * 描述：歌词自动轮播的间隔时间（单位：秒）。  
  * 默认值：300 (5分钟)。  
* **eason.defaultMood**:  
  * 描述：每次启动 VS Code 时的默认心情模式。  
  * 可选值：random, sad, healing, crazy。  
  * 默认值：random。

## **🛠️ 开发与调试 (Development)**

如果你想自己修改源码：

1. 克隆仓库:  
   git clone \[https://github.com/yourname/eason-daily-lyrics.git\](https://github.com/yourname/eason-daily-lyrics.git)

2. 安装依赖:  
   npm install

3. 编译 TypeScript:  
   npm run compile

4. 调试:  
   按 F5 启动 VS Code 调试窗口。

## **🤝 贡献 (Contributing)**

如果你有特别喜欢的 Eason 歌词想加入，欢迎提交 PR 或在 Issue 中留言！  
这是属于我们粉丝的共同记忆。  
**歌词数据格式 (lyrics.json):**

{  
  "id": 101,  
  "content": "若你喜欢怪人，其实我很美",  
  "song": "打回原形",  
  "album": "Third Encounter",  
  "tags": \["sad", "healing"\],  
  "link": "\[https://music.163.com/\](https://music.163.com/)..."  
}

## **📝 版权声明**

本插件仅作粉丝交流与学习使用，歌词版权归词作者及发行公司所有。请支持正版音乐。

**Enjoy Coding with Eason\!** 🎤