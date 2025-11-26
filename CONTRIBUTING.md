# 开发指南

本文档为 HOPE 工具箱的开发者提供规范和最佳实践。

## 📁 项目结构

```
com.hope.toolbox/
├── .debug                      # CEP 调试配置
├── .gitignore                  # Git 忽略规则
├── CSXS/
│   └── manifest.xml           # CEP 扩展清单（ExtensionId: com.hope.toolbox.panel）
├── assets/
│   └── userSettings.json      # 工具配置文件（动态加载）
├── css/
│   └── styles.css             # 样式表（深色主题，已优化性能）
├── js/
│   ├── CSInterface.js         # CEP 接口库（Adobe 官方）
│   ├── Vulcan.js              # Adobe 辅助库
│   ├── main.js                # 主逻辑（含日志系统 Logger）
│   └── scripts/               # JSX 脚本文件夹
│       ├── _template.js       # 脚本模板（新脚本请参考此文件）
│       └── *.js               # 各种工具脚本
├── index.html                 # 面板入口
├── README.md                  # 用户文档
└── CONTRIBUTING.md            # 本文档
```

## 🛠️ 开发环境设置

### 1. 启用 CEP 调试模式

参考 README.md 的安装步骤。

### 2. 打开开发者工具

1. 在 Illustrator 中打开面板
2. 右键点击面板 → **检查元素**
3. 打开 Console 标签页查看日志

### 3. 日志系统

面板内置了日志系统（`Logger`），可以在 `main.js` 中使用：

```javascript
Logger.debug("调试信息", data);
Logger.info("普通信息", data);
Logger.warn("警告信息", data);
Logger.error("错误信息", data);
```

日志会：
- 输出到浏览器控制台
- 保存到 `localStorage.debugLogs`（最多 100 条）

查看本地日志：
```javascript
JSON.parse(localStorage.getItem('debugLogs'))
```

## 📝 添加新脚本

### 步骤 1：创建脚本文件

1. 复制 `js/scripts/_template.js` 为新文件名（如 `myTool.js`）
2. 按照模板填写脚本信息和逻辑
3. 确保文件编码为 **UTF-8**

### 步骤 2：更新配置文件

编辑 `assets/userSettings.json`，添加新工具：

```json
{
    "name": "我的工具",
    "file": "myTool.js",
    "description": "工具描述",
    "shortcut": "M"
}
```

配置说明：
- `name`：工具名称（显示在按钮上）
- `file`：脚本文件名（相对于 `js/scripts/`）
- `description`：工具描述（鼠标悬停时显示）
- `shortcut`：快捷键（单个字母，留空则无快捷键）

### 步骤 3：测试

1. 保存配置文件（面板会在 5 秒内自动刷新）
2. 点击新工具按钮测试
3. 查看控制台日志排查错误

## ✅ 代码规范

### JSX 脚本规范

1. **必须包含 `@target illustrator`**
   ```javascript
   //@target illustrator
   ```

2. **使用 try-catch 包裹主逻辑**
   ```javascript
   try {
       // 主逻辑
   } catch (e) {
       alert("错误：" + e.message);
   }
   ```

3. **检查文档和选择**
   ```javascript
   if (app.documents.length === 0) {
       alert("请先打开一个文档。");
       return;
   }

   if (app.activeDocument.selection.length === 0) {
       alert("请先选择对象。");
       return;
   }
   ```

4. **使用清晰的变量名**
   - 好：`var doc = app.activeDocument;`
   - 差：`var d = app.activeDocument;`

5. **添加注释**
   - 关键逻辑必须有注释
   - 复杂算法添加详细说明

### JavaScript（main.js）规范

1. **使用 Logger 记录日志**
   ```javascript
   Logger.info("执行操作", { param: value });
   ```

2. **避免阻塞主线程**
   - 大量计算使用 setTimeout 分片
   - 避免同步 XHR 请求

3. **事件监听器及时清理**
   ```javascript
   element.addEventListener('click', handler);
   // 不再需要时：
   element.removeEventListener('click', handler);
   ```

### CSS 规范

1. **使用 BEM 命名法**（建议）
   ```css
   .tool-btn {}
   .tool-btn__name {}
   .tool-btn--active {}
   ```

2. **避免深层嵌套**（最多 3 层）

3. **性能优化**
   - 优先使用 `transform` 和 `opacity` 做动画
   - 避免触发重排的属性（width、height、top 等）
   - 使用 `will-change` 提示浏览器优化

## 🐛 调试技巧

### 1. 脚本执行失败

检查错误信息：
- 浏览器控制台
- Illustrator 的 ExtendScript Toolkit（如果有）

常见错误：
- **路径错误**：检查 `userSettings.json` 中的 `file` 字段
- **编码问题**：确保文件是 UTF-8 编码
- **语法错误**：检查是否有重复代码块

### 2. 面板无响应

1. 重新加载面板（关闭再打开）
2. 检查 `main.js` 是否有 JavaScript 错误
3. 查看 Console 日志

### 3. 配置不生效

- 检查 JSON 格式是否正确（使用 JSONLint 验证）
- 等待 5 秒自动刷新，或手动重新加载面板

## 🚀 性能优化建议

### JSX 脚本

1. **批量操作**
   ```javascript
   // 好：批量处理
   var items = doc.selection;
   for (var i = 0; i < items.length; i++) {
       processItem(items[i]);
   }

   // 差：逐个处理并频繁刷新
   for (var i = 0; i < items.length; i++) {
       processItem(items[i]);
       redraw(); // 避免频繁重绘
   }
   ```

2. **缓存计算结果**
   ```javascript
   var bounds = item.geometricBounds; // 缓存
   var width = bounds[2] - bounds[0];
   ```

3. **减少对象创建**

### 前端（main.js）

1. **防抖和节流**
   ```javascript
   // 搜索输入防抖
   var timeout;
   searchInput.addEventListener('input', function() {
       clearTimeout(timeout);
       timeout = setTimeout(search, 300);
   });
   ```

2. **虚拟滚动**（如果工具超过 100 个）

3. **懒加载**（按需加载工具图标）

## 📦 提交代码

### Git 工作流

1. **创建分支**
   ```bash
   git checkout -b feature/my-new-tool
   ```

2. **提交代码**
   ```bash
   git add .
   git commit -m "添加新工具：我的工具"
   ```

3. **推送分支**
   ```bash
   git push origin feature/my-new-tool
   ```

### Commit 信息规范

格式：`类型: 描述`

类型：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关

示例：
- `feat: 添加自动编号工具`
- `fix: 修复cropulka.js编码问题`
- `docs: 更新README快捷键说明`
- `perf: 优化CSS动画性能`

## 🧪 测试清单

提交前请确认：

- [ ] 脚本在 Illustrator 中能正常运行
- [ ] 没有控制台错误
- [ ] 快捷键不与现有工具冲突
- [ ] 已更新 `userSettings.json`
- [ ] 已测试异常情况（无文档、无选择）
- [ ] 文件编码为 UTF-8
- [ ] 代码有必要的注释

## 📚 参考资料

- [Adobe Illustrator Scripting Guide](https://ai-scripting.docsforadobe.dev/)
- [CEP Cookbook](https://github.com/Adobe-CEP/CEP-Resources)
- [ExtendScript Toolkit](https://extendscript.docsforadobe.dev/)

## ❓ 常见问题

**Q: 如何调试 JSX 脚本？**

A: 使用 `$.writeln()` 输出到 ExtendScript Toolkit 控制台，或在脚本中使用 `alert()` 弹窗。

**Q: 快捷键冲突怎么办？**

A: 修改 `userSettings.json` 中的 `shortcut` 字段，选择未使用的字母。

**Q: 如何访问 Illustrator 的其他功能？**

A: 参考 [Illustrator Scripting Reference](https://ai-scripting.docsforadobe.dev/)。

---

**有问题？** 在项目中提 Issue 或联系开发团队。
