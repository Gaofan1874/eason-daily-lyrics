# Change Log

All notable changes to the "eason-daily-lyrics" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.3] - 2026-01-10

### ✨ Added
- **歌词海报生成器 (Poster Generator)**:
  - 支持将当前歌词生成精美海报，一键保存分享。
  - **三种设计风格**：
    - 🏞️ **经典沉浸 (Classic)**：无遮罩全屏大图，强调通透感与文字张力。
    - 📸 **文艺拍立得 (Polaroid)**：白底留白，优雅的右对齐引用排版，复古胶片感。
    - 🎬 **电影故事 (Cinema)**：宽画幅黑边 + 字幕特效，赋予歌词电影般的叙事感。
  - **交互式编辑**：支持拖拽 (Pan) 和滚轮缩放 (Zoom) 背景图片，支持一键重置构图。
  - **自定义背景**：支持上传本地图片作为海报背景。
  - **落款定制**：每种风格拥有专属的落款设计 (PRESENTED BY / SHOT ON / DAILY)，并支持一键隐藏。

### 🚀 Improved
- 优化了海报中文字的阴影渲染，确保在复杂背景下的可读性。
- 调整了菜单布局，新增“生成歌词海报”快捷入口。
- 优化了代码结构，将 Webview 资源分离至 `media` 目录。

## [0.0.2]

- Initial release