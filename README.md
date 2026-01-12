# **EasonCode \- 陪你度过漫长岁月 (Daily Eason Lyrics)**

> "在成人的世界里，我们都需要一点陈奕迅。"

---
**GitHub**: [Gaofan1874/eason-daily-lyrics](https://github.com/Gaofan1874/eason-daily-lyrics)   
**版本**: 0.1.0  
**作者**: Gaofan & Gemini

---

**EasonCode** 是一款专为陈奕迅粉丝（兼程序员）打造的 VS Code 沉浸式插件。它不想打扰你写代码，只是想在你 Debug 到深夜、或者项目上线成功的那一刻，在状态栏轻轻对你说一句最懂你的歌词。

> 🎬 **插件演示 (希望它能陪伴你的编码时光)**

![EasonCode Demo](images/readme_assets/demo.gif)

## **✨ 核心特性 (Features)**

### **1\. 📷 歌词海报生成 (Lyric Poster) \[2.0 Updated!\]**

遇到一句戳心的歌词，想发朋友圈却不想只发文字？EasonCode 内置了 **专业级海报编辑器**，让每一句歌词都成为一张有故事的明信片。

*   **三种独家设计风格**：
    *   **经典沉浸 (Classic)**：无遮罩全屏大图，强调通透感与文字张力，配以 `E A S O N CODE DAILY` 金色落款。
    *   **文艺拍立得 (Polaroid)**：白底留白，优雅的右对齐引用排版，复古胶片感，配以 `SHOT ON EASON CODE` 落款。
    *   **电影故事 (Cinema)**：宽画幅黑边 + 字幕特效，赋予歌词电影般的叙事感，配以 `PRESENTED BY EASON CODE` 落款。
*   **全能编辑体验**：
    *   **📝 歌词编辑**：支持实时修改歌词，空格/回车即可换行。
    *   **🎛️ 排版控制**：字号、行距、文字垂直位置均可自由调节。
    *   **🖼️ 构图调整**：支持 **自定义上传背景图**，并可在预览界面自由 **拖拽移动** 和 **滚轮缩放** 图片。
*   **个性化定制**：支持一键隐藏/显示底部落款水印。

| 经典沉浸 (Classic) | 文艺拍立得 (Polaroid) | 电影故事 (Cinema) |
| :---: | :---: | :---: |
| <img src="images/readme_assets/poster-classic.png" width="100%"> | <img src="images/readme_assets/poster-polaroid.png" width="100%"> | <img src="images/readme_assets/poster-cinema.png" width="100%"> |

---

### **2\. 每日/每时歌词 (Daily Lyrics)**

插件会在 VS Code 底部状态栏轮播精选的 Eason 歌词。

*   就像他在耳边轻轻哼唱，不打扰，但一直在。
*   支持点击歌词查看出处（歌曲、专辑）。

<div align="center">
  <img src="images/readme_assets/lyrics.png" width="40%" />
</div>

### **3\. 情绪模式切换 (Mood Switch)**

程序员的情绪是波动的，我们为你准备了 **30+ 种情绪标签**。插件会自动过滤并仅显示歌词数量充足的模式。

点击状态栏歌词，选择 **“切换心情”**，精准匹配你当下的心境：

| 模式 | 图标 | 描述 | 典型场景 |
| :--- | :--- | :--- | :--- |
| **随机漫步 (Random)** | 🎲 | 全库随机播放 | 日常编码，期待未知惊喜 |
| **深夜抑郁 (Sad)** | 🌧️ | 伤感/孤独 | 深夜加班，Bug 修不完时 |
| **治愈哲理 (Healing)** | ☕ | 温暖/思考 | 架构设计，寻找灵感时 |
| **浮夸热血 (Crazy)** | 🔥 | 躁动/激情 | 项目上线前夕，冲刺时 |
| **岁月金曲 (Classic)** | 📀 | 怀旧/经典 | 午后闲暇，重温经典旋律 |

<div align="center">
  <img src="images/readme_assets/category.png" width="60%" />
</div>

### **4\. 低打扰设计 (Zen Mode)**

*   **极简主义**：歌词只在状态栏显示，绝无弹窗干扰。
*   **按需交互**：只有在你需要的时候（点击状态栏），才会展开更多选项。

## **🚀 使用方法 (Usage)**

1.  **安装插件**：在 VS Code 扩展市场搜索 `EasonCode` 并安装。
2.  **自动播放**：安装后，状态栏右下角会自动出现歌词。
3.  **交互菜单**：**点击状态栏歌词**，唤出功能菜单：
    *   `$(arrow-right)` **切歌**：不喜欢这句？手动换下一句。
    *   `$(file-media)` **生成歌词海报**：打开海报编辑器，分享此刻心情。
    *   `$(heart)` **切换心情**：选择你当前的情绪模式。
    *   `$(link)` **查看歌曲信息**：跳转音乐平台收听原曲。
4.  **命令调用**：使用 `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`) 输入 `Eason` 查找所有命令。

## **⚙️ 设置 (Settings)**

你可以在 VS Code 设置中自定义插件行为：

*   `eason.updateInterval`: 歌词自动轮播的间隔时间（默认 300秒）。
*   `eason.lyricColor`: 状态栏歌词颜色（默认 `#FFD700` 金色）。
*   `eason.defaultMood`: 启动时的默认心情模式（默认 `random`）。

## **📝 版权声明**

本插件仅作粉丝交流与学习使用，歌词版权归词作者及发行公司所有。请支持正版音乐。

**Enjoy Coding with Eason!** 🎤
