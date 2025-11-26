# GitHub 仓库设置指南

本文档提供完整的 GitHub 仓库设置建议，用于优化仓库的可见性和专业性。

## 📝 仓库基本信息

### 仓库描述 (Description)

**建议描述**：
```
专业的 Adobe Illustrator CEP 扩展工具箱，集成 60+ 实用工具，覆盖对齐、布局、测量、专色管理等印刷设计全流程。开箱即用，支持快捷键。
```

**英文版本**：
```
Professional Adobe Illustrator CEP extension toolkit with 60+ utilities covering alignment, layout, measurement, spot color management and more for print design workflow. Ready to use with keyboard shortcuts.
```

### 网站 (Website)

如果有文档网站或演示页面，填写：
```
https://github.com/hanshaoUi/com.hope.toolbox
```

## 🏷️ Topics（主题标签）

在 GitHub 仓库页面点击 **⚙️ Settings** → **Topics**，添加以下标签：

### 核心标签
```
adobe-illustrator
illustrator
cep-extension
adobe-cep
cep
jsx
extendscript
```

### 功能标签
```
design-tools
print-design
spot-color
pantone
automation
productivity
workflow
```

### 技术标签
```
javascript
html
css
```

### 语言/平台标签
```
windows
macos
chinese
```

**推荐使用的 Topics（最多 20 个）**：
```
adobe-illustrator, illustrator, cep-extension, adobe-cep, jsx, extendscript, design-tools, print-design, spot-color, pantone, automation, productivity, workflow, javascript, windows, macos, chinese
```

## ⚙️ 仓库设置 (Settings)

### General（常规设置）

1. **Features（功能）**
   - ✅ Issues - 启用（用于问题追踪）
   - ✅ Projects - 启用（项目管理）
   - ❌ Wiki - 禁用（使用 docs/ 文件夹）
   - ❌ Discussions - 禁用（内部工具）

2. **Pull Requests（拉取请求）**
   - ✅ Allow squash merging - 启用
   - ✅ Allow merge commits - 启用
   - ❌ Allow rebase merging - 禁用

3. **Archives（归档）**
   - ✅ Include Git LFS objects in archives - 启用

### Branches（分支设置）

**默认分支**：`main`

**分支保护规则**（可选，如果团队协作）：
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging

### Pages（GitHub Pages）

如果需要文档网站：
- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/docs`

## 📊 About（关于）部分

在仓库首页右侧的 "About" 区域点击 **⚙️**，设置：

1. **Description（描述）**
   ```
   专业的 Adobe Illustrator CEP 扩展工具箱，集成 60+ 实用工具，覆盖对齐、布局、测量、专色管理等印刷设计全流程。
   ```

2. **Website（网站）**
   ```
   https://github.com/hanshaoUi/com.hope.toolbox
   ```

3. **Topics（主题）**
   - 添加上面推荐的 Topics

4. **Releases（发布）**
   - ✅ 显示发布版本

5. **Packages（包）**
   - ❌ 不显示（不适用）

6. **Used by（被使用）**
   - ✅ 显示依赖者

## 🏆 徽章说明

README.md 中已包含以下徽章：

```markdown
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/hanshaoUi/com.hope.toolbox)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-lightgrey.svg)](https://github.com/hanshaoUi/com.hope.toolbox)
[![Illustrator](https://img.shields.io/badge/Illustrator-CC%202013%2B-FF9A00.svg)](https://www.adobe.com/products/illustrator.html)
[![License](https://img.shields.io/badge/license-Internal-green.svg)](https://github.com/hanshaoUi/com.hope.toolbox)
```

### 可选的额外徽章

如果需要，可以添加：

**Star 数量**：
```markdown
[![GitHub stars](https://img.shields.io/github/stars/hanshaoUi/com.hope.toolbox?style=social)](https://github.com/hanshaoUi/com.hope.toolbox/stargazers)
```

**Fork 数量**：
```markdown
[![GitHub forks](https://img.shields.io/github/forks/hanshaoUi/com.hope.toolbox?style=social)](https://github.com/hanshaoUi/com.hope.toolbox/network/members)
```

**最后提交**：
```markdown
[![GitHub last commit](https://img.shields.io/github/last-commit/hanshaoUi/com.hope.toolbox)](https://github.com/hanshaoUi/com.hope.toolbox/commits/main)
```

**代码大小**：
```markdown
[![GitHub repo size](https://img.shields.io/github/repo-size/hanshaoUi/com.hope.toolbox)](https://github.com/hanshaoUi/com.hope.toolbox)
```

## 📋 GitHub 设置检查清单

完成以下设置后，你的仓库将更加专业：

- [ ] 设置仓库描述（Description）
- [ ] 添加主题标签（Topics）- 至少 10 个
- [ ] 启用 Issues 功能
- [ ] README.md 包含徽章
- [ ] LICENSE 文件已创建
- [ ] .gitignore 文件已配置
- [ ] 设置默认分支为 `main`
- [ ] README.md 格式优化（表情符号、章节标题）
- [ ] 添加 CONTRIBUTING.md（如果需要）
- [ ] 项目结构清晰（docs/、assets/、js/）

## 🎯 SEO 优化建议

为了让仓库更容易被搜索到：

1. **在 README 中使用关键词**：
   - Adobe Illustrator
   - CEP Extension
   - Print Design
   - Spot Color
   - PANTONE
   - 印刷设计
   - 专色管理

2. **文件名规范**：
   - 使用英文文件名
   - 使用连字符分隔单词
   - 避免特殊字符

3. **代码注释**：
   - 在关键文件中添加中英文注释
   - 使用 JSDoc 格式

## 📸 建议添加的内容（可选）

### 截图

在 `docs/` 或 `assets/` 目录添加截图：
- 面板界面截图
- 工具使用演示
- 效果对比图

在 README.md 中引用：
```markdown
## 📸 界面预览

![主界面](docs/images/main-panel.png)
![专色工具](docs/images/spot-color-tool.png)
```

### 演示视频

如果有视频演示：
```markdown
## 🎥 视频演示

[查看完整演示视频](https://example.com/demo-video)
```

### Changelog

创建 `CHANGELOG.md` 记录版本变更：
```markdown
# 更新日志

## [1.1.0] - 2025-01-25
### 新增
- 等比缩放到指定尺寸工具
- 专色处理套件

### 优化
- 专色查找支持 CMYK 模式智能匹配
```

---

**完成设置后，你的 GitHub 仓库将更加专业和易于发现！**
