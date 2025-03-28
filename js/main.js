var csInterface = new CSInterface();
console.log("Extension root path:", csInterface.getSystemPath(SystemPath.EXTENSION));

// 全局变量
let allScripts = [];
let recentScripts = [];
const MAX_RECENT = 5;
let lastModified = 0;
let userSettings = null;

function initializeExtension() {
    console.log("Initializing extension...");
    loadUserSettings();
    setupShortcuts();
    setInterval(checkAndLoadUserSettings, 5000); // 每5秒检查一次文件是否有更新
    console.log("Extension initialized.");
}

function runScript(scriptName) {
    var csInterface = new CSInterface();
    var scriptPath = csInterface.getSystemPath(SystemPath.EXTENSION) + "/js/scripts/" + scriptName;

    console.log("Attempting to run script: " + scriptPath);

    try {
        csInterface.evalScript('$.evalFile("' + scriptPath + '")', function (result) {
            console.log("Script execution result: " + result);
            if (result === "EvalScript error.") {
                console.error("脚本执行失败，请检查脚本内容。");
            } else {
                console.log("脚本执行成功");
            }
        });
    } catch (e) {
        console.error("执行失败: " + e);
    }
}

function addToRecent(scriptName) {
    recentScripts = recentScripts.filter(script => script !== scriptName);
    recentScripts.unshift(scriptName);
    if (recentScripts.length > MAX_RECENT) {
        recentScripts.pop();
    }
    localStorage.setItem('recentScripts', JSON.stringify(recentScripts));
    renderCategories(userSettings.categories);
}

function loadUserSettings() {
    console.log("Loading user settings...");
    var csInterface = new CSInterface();
    var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION);
    var jsonPath = extensionRoot + "/assets/userSettings.json";

    var readFileScript = `
        var file = File("${jsonPath}");
        if (file.exists) {
            file.open("r");
            var content = file.read();
            file.close();
            content;
        } else {
            "File not found";
        }
    `;

    csInterface.evalScript(readFileScript, function(result) {
        if (result === "EvalScript error.") {
            console.error("Failed to load user settings.");
        } else if (result === "File not found") {
            console.error("User settings file not found.");
        } else {
            try {
                if (!result || result.trim() === "") {
                    throw new Error("Empty file content");
                }
                console.log("Raw JSON content:", result);
                var data = JSON.parse(result);
                if (!data || !data.categories || !Array.isArray(data.categories)) {
                    throw new Error("Invalid data structure");
                }
                userSettings = data;
                allScripts = data.categories.flatMap(category => category.scripts);
                recentScripts = JSON.parse(localStorage.getItem('recentScripts') || '[]');
                renderCategories(data.categories);
                setupShortcuts();
                checkVersion();
                console.log("User settings loaded successfully.");
            } catch (e) {
                console.error("Error parsing user settings:", e);
                console.error("JSON content:", result);
            }
        }
    });
}

function renderCategories(categories) {
    const tabNav = document.getElementById('tab-nav');
    const tabContent = document.getElementById('tab-content');
    
    if (!tabNav || !tabContent) {
        console.error("必需的DOM元素未找到");
        return;
    }

    tabNav.innerHTML = '';
    tabContent.innerHTML = '';

    categories.forEach((category, index) => {
        const tabButton = document.createElement('button');
        tabButton.innerHTML = category.icon || '📁';
        tabButton.title = category.name;
        tabButton.className = 'tab-button';
        tabButton.onclick = () => switchTab(index);
        tabNav.appendChild(tabButton);

        const tabPane = document.createElement('div');
        tabPane.className = 'tab-pane';
        
        const categoryName = document.createElement('h3');
        categoryName.textContent = category.name;
        tabPane.appendChild(categoryName);

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        category.scripts.forEach(script => {
            const button = document.createElement('button');
            button.className = 'button';
            button.textContent = script.name;
            button.title = script.description || '';
            button.onclick = () => runScript(script.file);
            if (script.shortcut) {
                button.dataset.shortcut = script.shortcut;
                button.title += ` (${script.shortcut})`;
            }
            buttonContainer.appendChild(button);
        });

        tabPane.appendChild(buttonContainer);
        tabContent.appendChild(tabPane);
    });

    const divider = document.createElement('hr');
    divider.className = 'tab-divider';
    tabNav.appendChild(divider);

    if (categories.length > 0) {
        switchTab(0);
    }
}

function switchTab(index) {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach((button, i) => {
        if (i === index) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    tabPanes.forEach((pane, i) => {
        if (i === index) {
            pane.style.display = 'block';
        } else {
            pane.style.display = 'none';
        }
    });
}

function checkVersion() {
    const currentVersion = "1.0.0";
    const latestVersion = "1.0.0";
    
    if (currentVersion !== latestVersion) {
        document.getElementById('version-info').textContent = `有新版本可用: ${latestVersion}`;
    }
}

function setupShortcuts() {
    var csInterface = new CSInterface();
    var gExtensionId = csInterface.getExtensionID();
    
    // 先清除所有之前的事件监听
    csInterface.removeEventListener("com.adobe.csxs.events.keydown");
    
    // 收集所有快捷键
    var allShortcuts = [];
    
    allScripts.forEach(script => {
        if (script.shortcut) {
            // 收集快捷键信息
            allShortcuts.push({
                keyCode: script.shortcut.toUpperCase().charCodeAt(0),
                script: script.file
            });
        }
    });
    
    // 注册对所有按键的兴趣
    if (allShortcuts.length > 0) {
        // 为所有字母键注册兴趣
        var keyCodes = [];
        for (var i = 65; i <= 90; i++) { // A-Z的ASCII码
            keyCodes.push({
                "keyCode": i,
                "ctrlKey": false,
                "altKey": false,
                "shiftKey": false,
                "metaKey": false
            });
        }
        csInterface.registerKeyEventsInterest(JSON.stringify(keyCodes));
        
        // 添加单个事件监听器处理所有快捷键
        csInterface.addEventListener("com.adobe.csxs.events.keydown", function(event) {
            try {
                var data = JSON.parse(event.data);
                var pressedKey = data.keyCode;
                
                // 检查是否有匹配的快捷键
                for (var i = 0; i < allShortcuts.length; i++) {
                    if (allShortcuts[i].keyCode === pressedKey) {
                        console.log("快捷键触发: " + String.fromCharCode(pressedKey));
                        runScript(allShortcuts[i].script);
                        break;
                    }
                }
            } catch (e) {
                console.error("处理快捷键时出错: " + e);
            }
        });
        
        console.log("已注册 " + allShortcuts.length + " 个快捷键");
    }
}

function checkAndLoadUserSettings() {
    console.log("Checking for user settings updates...");
    var csInterface = new CSInterface();
    var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION);
    var jsonPath = extensionRoot + "/assets/userSettings.json";

    var checkModifiedScript = `
        var file = File("${jsonPath}");
        if (file.exists) {
            file.open("r");
            var modified = file.modified;
            file.close();
            modified.getTime();
        } else {
            -1;
        }
    `;

    csInterface.evalScript(checkModifiedScript, function(result) {
        var modifiedTime = parseInt(result);
        if (modifiedTime > lastModified) {
            console.log("User settings file updated. Reloading...");
            lastModified = modifiedTime;
            loadUserSettings();
        } else {
            console.log("No updates to user settings file.");
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");
    initializeExtension();
});

// 添加一个额外的检查，以确保在DOM加载后初始化
if (document.readyState === "complete" || document.readyState === "interactive") {
    console.log("Document already ready, initializing extension");
    initializeExtension();
}