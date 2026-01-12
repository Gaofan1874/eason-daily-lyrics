# Change Log

All notable changes to the "eason-daily-lyrics" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.1.0] - 2026-01-12

### ✨ Major Features
- **海报编辑器 2.0 (Poster Editor 2.0)**:
  - **全新 UI 设计**：采用左右双栏布局，深度适配 VS Code 原生风格，操作更流畅。
  - **📝 交互式歌词编辑**：
    - 直接在编辑器中修改歌词内容。
    - 支持**空格换行**和手动回车换行，轻松掌控排版。
  - **🎛️ 专业排版控制**：
    - **字号调节**：滑动条无级调节文字大小。
    - **行高调节**：自定义行间距，适应不同长度的歌词。
    - **垂直偏移**：上下移动文字区域，完美避开背景图的主体部分。
  - **🎨 智能主题系统**：
    - 切换风格（经典/拍立得/电影感）时，自动应用该风格的最佳默认参数。
    - **独立重置功能**：支持分别重置“图片构图”和“排版参数”，操作更灵活。

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