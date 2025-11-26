document.addEventListener('DOMContentLoaded', function() {
    // 初始化CSInterface
    const csInterface = new CSInterface();
    console.log("Extension loaded. Root path:", csInterface.getSystemPath(SystemPath.EXTENSION));
    
    // DOM元素
    const searchInput = document.getElementById('search-input');
    const categoryNav = document.getElementById('category-nav');
    const contentArea = document.getElementById('content-area');
    const aboutModal = document.getElementById('about-modal');
    const closeModal = document.getElementById('close-modal');
    const aboutLink = document.getElementById('about-link');
    const helpLink = document.getElementById('help-link');
    
    // 存储上次加载的settings的时间戳，用于检测变化
    let lastSettingsTimestamp = 0;
    
    // 加载用户设置和工具配置
    loadUserSettings();

    // 设置定时器，每5秒检查一次settings文件是否有变化
    setInterval(checkSettingsUpdates, 5000);

    // 隐藏加载动画并显示主界面的函数
    function hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        if (loadingScreen && app) {
            loadingScreen.style.display = 'none';
            app.style.display = 'flex';
        }
    }
    
    // 检查settings文件是否有更新
    function checkSettingsUpdates() {
        try {
            const extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION);
            const settingsPath = extensionRoot + "/assets/userSettings.json";
            
            // 使用XMLHttpRequest检查文件
            const xhr = new XMLHttpRequest();
            xhr.open('HEAD', settingsPath, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const lastModified = new Date(xhr.getResponseHeader('Last-Modified')).getTime();
                        
                        // 如果文件被修改，则重新加载设置
                        if (lastModified > lastSettingsTimestamp && lastSettingsTimestamp !== 0) {
                            console.log("检测到userSettings.json文件变化，重新加载...");
                            loadUserSettings();
                        }
                        
                        // 更新时间戳
                        lastSettingsTimestamp = lastModified;
                    }
                }
            };
            xhr.send();
        } catch (e) {
            console.error("检查设置更新时出错:", e);
        }
    }
    
    // 搜索功能
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            const toolButtons = document.querySelectorAll('.tool-btn');
            
            if (searchTerm === '') {
                // 如果搜索框为空，恢复到分类视图
                document.querySelectorAll('.tool-category').forEach(category => {
                    category.style.display = category.classList.contains('active') ? 'block' : 'none';
                });
                
                toolButtons.forEach(button => {
                    button.style.display = '';
                });
            } else {
                // 如果有搜索内容，显示所有分类，只筛选匹配的工具
                document.querySelectorAll('.tool-category').forEach(category => {
                    category.style.display = 'block';
                });
                
                toolButtons.forEach(button => {
                    const toolName = button.querySelector('.tool-name').textContent.toLowerCase();
                    if (toolName.includes(searchTerm)) {
                        button.style.display = '';
                    } else {
                        button.style.display = 'none';
                    }
                });
            }
        });
    }
    
    // 关于对话框
    if (aboutLink && aboutModal && closeModal) {
        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            aboutModal.style.display = 'block';
        });
        
        closeModal.addEventListener('click', () => {
            aboutModal.style.display = 'none';
        });
        
        window.addEventListener('click', (event) => {
            if (event.target === aboutModal) {
                aboutModal.style.display = 'none';
            }
        });
    }
    
    // 帮助链接
    if (helpLink) {
        helpLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('帮助文档即将上线');
        });
    }
    
    // 日志系统
    const Logger = {
        levels: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 },
        currentLevel: 1, // INFO级别

        log: function(level, message, data) {
            if (this.levels[level] >= this.currentLevel) {
                const timestamp = new Date().toLocaleTimeString();
                const logMsg = `[${timestamp}] [${level}] ${message}`;
                console.log(logMsg, data || '');

                // 可选：将日志写入localStorage以便调试
                try {
                    const logs = JSON.parse(localStorage.getItem('debugLogs') || '[]');
                    logs.push({ time: timestamp, level, message, data });
                    if (logs.length > 100) logs.shift(); // 只保留最近100条
                    localStorage.setItem('debugLogs', JSON.stringify(logs));
                } catch (e) {
                    // 忽略localStorage错误
                }
            }
        },

        debug: function(msg, data) { this.log('DEBUG', msg, data); },
        info: function(msg, data) { this.log('INFO', msg, data); },
        warn: function(msg, data) { this.log('WARN', msg, data); },
        error: function(msg, data) { this.log('ERROR', msg, data); }
    };

    // 执行脚本
    function executeScript(scriptName) {
        try {
            Logger.info("开始执行脚本", scriptName);
            const extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION);
            const scriptPath = extensionRoot.replace(/\\/g, "/") + "/js/scripts/" + scriptName;

            Logger.debug("脚本路径", scriptPath);

            // 增强错误捕获，包含行号和详细错误信息
            const evalCode = `(function(){
                try {
                    $.evalFile("${scriptPath}");
                    "__OK__"
                } catch(e) {
                    "__ERR__:" + e.message + " | Line: " + (e.line || "unknown") + " | File: " + (e.fileName || "unknown")
                }
            })()`;

            csInterface.evalScript(evalCode, (result) => {
                if (result === "EvalScript error." || result.indexOf("__ERR__") === 0) {
                    Logger.error("脚本执行失败", { script: scriptName, error: result });

                    var errorMsg = result.indexOf("__ERR__:") === 0 ? result.substring(8) : "未知错误";

                    // 提取错误详情
                    var errorParts = errorMsg.split(" | ");
                    var mainError = errorParts[0] || "未知错误";
                    var lineInfo = errorParts[1] || "";
                    var fileInfo = errorParts[2] || "";

                    alert("脚本执行失败 ❌\n\n" +
                          "文件: " + scriptName + "\n" +
                          "错误: " + mainError + "\n" +
                          (lineInfo ? lineInfo + "\n" : "") +
                          (fileInfo ? fileInfo + "\n" : "") +
                          "\n提示：请确保在 Illustrator 中打开了文档并选择了对象。\n" +
                          "如问题持续，请检查浏览器控制台日志。");
                } else {
                    Logger.info("脚本执行成功", scriptName);
                    addToRecentTools(scriptName);
                }
            });
        } catch (e) {
            Logger.error("执行脚本时发生异常", { script: scriptName, exception: e.message });
            alert("执行脚本时出错:\n\n" + e.message + "\n\n请查看浏览器控制台获取详细信息。");
        }
    }
    
    // 添加到最近使用工具列表
    function addToRecentTools(scriptName) {
        // 获取最近使用的工具列表
        let recentTools = JSON.parse(localStorage.getItem('recentTools')) || [];
        
        // 如果工具已经在列表中，先移除旧的记录
        recentTools = recentTools.filter(tool => tool.file !== scriptName);
        
        // 查找工具信息
        let toolInfo = null;
        for (const category of window.userSettings.categories) {
            for (const script of category.scripts) {
                if (script.file === scriptName) {
                    toolInfo = {
                        name: script.name,
                        file: script.file,
                        shortcut: script.shortcut || '',
                        category: category.name
                    };
                    break;
                }
            }
            if (toolInfo) break;
        }
        
        // 添加到列表开头
        if (toolInfo) {
            recentTools.unshift(toolInfo);
            
            // 限制列表长度，最多保留10个
            if (recentTools.length > 10) {
                recentTools = recentTools.slice(0, 10);
            }
            
            // 保存到本地存储
            localStorage.setItem('recentTools', JSON.stringify(recentTools));
            
            // 更新最近使用的工具分类
            updateCategoryUI();
        }
    }
    
    // 加载用户设置和工具配置
    function loadUserSettings() {
        try {
            const extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION);
            const settingsPath = extensionRoot + "/assets/userSettings.json";
            
            // 使用XMLHttpRequest加载JSON文件
            const xhr = new XMLHttpRequest();
            xhr.open('GET', settingsPath, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            const settings = JSON.parse(xhr.responseText);
                            window.userSettings = settings; // 将设置保存到全局变量
                            
                            // 生成UI
                            generateCategoryNav(settings.categories);
                            generateToolCategories(settings.categories);
                            
                            // 添加最近使用的工具分类按钮
                            addRecentToolsCategoryButton();
                            
                            // 初始化显示第一个分类
                            const categoryButtons = document.querySelectorAll('.category-btn');
                            const toolCategories = document.querySelectorAll('.tool-category');
                            
                            if (categoryButtons.length > 0) {
                                categoryButtons[0].classList.add('active');
                            }
                            
                            if (toolCategories.length > 0) {
                                toolCategories[0].classList.add('active');
                            }
                            
                            // 注册键盘事件兴趣，确保按键不会被宿主拦截
                            registerKeyInterestsFromSettings(settings);

                            console.log("用户设置加载完成");

                            // 隐藏加载动画
                            hideLoadingScreen();

                        } catch (e) {
                            console.error("Error parsing settings JSON:", e);
                            hideLoadingScreen();
                            alert("加载设置时出错:\n" + e.message + "\n\n请检查 userSettings.json 文件格式是否正确。");
                        }
                    } else {
                        console.error("Failed to load settings. Status:", xhr.status);
                        hideLoadingScreen();
                        alert("无法加载设置文件\n状态码: " + xhr.status + "\n\n请确保 assets/userSettings.json 文件存在。");
                    }
                }
            };
            xhr.send();
        } catch (e) {
            console.error("Error loading settings:", e);
            hideLoadingScreen();
            alert("加载设置时出错:\n" + e.message + "\n\n请检查扩展安装路径是否正确。");
        }
    }

    // 根据配置注册键盘事件兴趣，拦截并让面板接收对应按键
    function registerKeyInterestsFromSettings(settings) {
        try {
            if (!settings || !settings.categories) {
                csInterface.registerKeyEventsInterest("[]");
                return;
            }
            const seen = {};
            const interests = [];
            for (const category of settings.categories) {
                if (!category || !category.scripts) continue;
                for (const script of category.scripts) {
                    const sc = script.shortcut;
                    if (!sc || typeof sc !== 'string' || sc.length !== 1) continue;
                    const key = sc.toUpperCase();
                    const code = key.charCodeAt(0);
                    if (code < 32 || code > 126) continue;
                    if (seen[code]) continue;
                    seen[code] = true;
                    interests.push({ keyCode: code });
                }
            }
            csInterface.registerKeyEventsInterest(JSON.stringify(interests));
            console.log("Registered key interests:", interests);
        } catch (err) {
            console.error("Failed to register key interests:", err);
        }
    }
    
    // 添加最近使用的工具分类按钮
    function addRecentToolsCategoryButton() {
        // 检查是否已存在最近使用按钮，如果存在则不重复创建
        if (document.querySelector('[data-category="recent-tools"]')) {
            return;
        }
        
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.setAttribute('data-category', 'recent-tools');
        button.setAttribute('title', '最近使用');
        
        const iconDiv = document.createElement('div');
        iconDiv.className = 'category-icon';
        iconDiv.textContent = '🕒';
        button.appendChild(iconDiv);
        
        // 添加点击事件
        button.addEventListener('click', () => {
            const categoryId = button.getAttribute('data-category');
            
            // 更新按钮状态
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 更新内容区域
            document.querySelectorAll('.tool-category').forEach(category => {
                if (category.id === categoryId) {
                    category.classList.add('active');
        } else {
                    category.classList.remove('active');
                }
            });
            
            // 确保最近使用的工具已更新
            updateRecentToolsUI();
        });
        
        // 将按钮添加到导航栏的顶部
        categoryNav.insertBefore(button, categoryNav.firstChild);
        
        // 创建最近使用的工具分类区域
        const recentToolsDiv = document.createElement('div');
        recentToolsDiv.id = 'recent-tools';
        recentToolsDiv.className = 'tool-category';
        
        const header = document.createElement('h3');
        header.className = 'category-header';
        header.textContent = '最近使用的工具';
        recentToolsDiv.appendChild(header);
        
        const toolsGrid = document.createElement('div');
        toolsGrid.className = 'tools-grid';
        recentToolsDiv.appendChild(toolsGrid);
        
        contentArea.appendChild(recentToolsDiv);
        
        // 初始化最近使用的工具UI
        updateRecentToolsUI();
    }
    
    // 更新最近使用的工具UI
    function updateRecentToolsUI() {
        const recentToolsContainer = document.querySelector('#recent-tools .tools-grid');
        if (!recentToolsContainer) return;
        
        // 清空现有内容
        recentToolsContainer.innerHTML = '';
        
        // 获取最近使用的工具列表
        const recentTools = JSON.parse(localStorage.getItem('recentTools')) || [];
        
        if (recentTools.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = '暂无最近使用的工具';
            recentToolsContainer.appendChild(emptyMessage);
            return;
        }
        
        // 添加工具按钮
        recentTools.forEach(tool => {
            const button = createToolButton(tool);
            recentToolsContainer.appendChild(button);
        });
    }
    
    // 创建工具按钮
    function createToolButton(tool) {
        const button = document.createElement('button');
        button.className = 'tool-btn';
        button.setAttribute('data-script', tool.file);
        if (tool.description) button.title = tool.description;
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'tool-name';
        nameDiv.textContent = tool.name;
        button.appendChild(nameDiv);
        
        if (tool.shortcut) {
            const shortcutDiv = document.createElement('div');
            shortcutDiv.className = 'tool-shortcut';
            shortcutDiv.textContent = tool.shortcut;
            button.appendChild(shortcutDiv);
        }
        
        button.addEventListener('click', () => {
            const scriptName = button.getAttribute('data-script');
            if (scriptName) {
                executeScript(scriptName);
            }
        });
        
        return button;
    }
    
    // 生成分类导航
    function generateCategoryNav(categories) {
        // 保存当前活动的分类
        const activeCategory = document.querySelector('.category-btn.active');
        let activeCategoryId = activeCategory ? activeCategory.getAttribute('data-category') : null;
        
        categoryNav.innerHTML = ''; // 清空现有内容
        
        categories.forEach((category, index) => {
            const button = document.createElement('button');
            button.className = 'category-btn';
            button.setAttribute('data-category', `category-${index}`);
            button.setAttribute('title', category.name);
            
            const iconDiv = document.createElement('div');
            iconDiv.className = 'category-icon';
            iconDiv.textContent = category.icon || '📁';
            button.appendChild(iconDiv);
            
            // 添加点击事件
            button.addEventListener('click', () => {
                const categoryId = button.getAttribute('data-category');
                
                // 更新按钮状态
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // 更新内容区域
                document.querySelectorAll('.tool-category').forEach(category => {
                    if (category.id === categoryId) {
                        category.classList.add('active');
                    } else {
                        category.classList.remove('active');
                    }
                });
            });
            
            categoryNav.appendChild(button);
        });
        
        // 恢复之前活动的分类
        if (activeCategoryId) {
            const categoryToActivate = document.querySelector(`[data-category="${activeCategoryId}"]`);
            if (categoryToActivate) {
                categoryToActivate.classList.add('active');
            }
        }
        
            // 重新添加最近使用按钮
        addRecentToolsCategoryButton();
    }
    
    // 生成工具分类
    function generateToolCategories(categories) {
        // 保存当前活动的分类
        const activeCategory = document.querySelector('.tool-category.active');
        let activeCategoryId = activeCategory ? activeCategory.id : null;
        
        // 清空内容区域，但保留最近使用的工具分类
        const recentToolsDiv = document.getElementById('recent-tools');
        contentArea.innerHTML = '';
        if (recentToolsDiv) {
            contentArea.appendChild(recentToolsDiv);
        }
        
        categories.forEach((category, index) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.id = `category-${index}`;
            categoryDiv.className = 'tool-category';
            
            const header = document.createElement('h3');
            header.className = 'category-header';
            header.textContent = category.name;
            categoryDiv.appendChild(header);
            
            const toolsGrid = document.createElement('div');
            toolsGrid.className = 'tools-grid';
            
            // 添加工具按钮
            category.scripts.forEach(script => {
                const button = createToolButton(script);
                toolsGrid.appendChild(button);
            });
            
            categoryDiv.appendChild(toolsGrid);
            contentArea.appendChild(categoryDiv);
        });
        
        // 恢复之前活动的分类
        if (activeCategoryId) {
            const categoryToActivate = document.getElementById(activeCategoryId);
            if (categoryToActivate) {
                categoryToActivate.classList.add('active');
            }
        }
    }
    
    // 更新分类UI
    function updateCategoryUI() {
        // 确保最近使用的工具已更新
        updateRecentToolsUI();
    }

    // 键盘快捷键支持：当焦点不在输入框时，根据配置触发脚本
    document.addEventListener('keydown', (e) => {
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
        const key = (e.key || '').toUpperCase();
        if (!key || key.length !== 1) return;
        const settings = window.userSettings;
        if (!settings || !settings.categories) return;
        for (const category of settings.categories) {
            for (const script of category.scripts) {
                if (script.shortcut && script.shortcut.toUpperCase() === key) {
                    e.preventDefault();
                    executeScript(script.file);
                    return;
                }
            }
        }
    });
});