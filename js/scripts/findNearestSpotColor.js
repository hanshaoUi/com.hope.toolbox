//@target illustrator

/**
 * 脚本名称：查找相近专色（增强版）
 * 脚本功能：从选中对象提取颜色，在专色库中查找最相近的专色
 * 作者：HOPE
 * 创建日期：2025-01-25
 * 版本：2.2.0
 *
 * 改进：
 * - 描边和填充分开查找
 * - 应用前实时预览
 * - 自动创建并应用真正的专色色板
 * - 列表显示颜色色块
 * - 色库筛选（可选择要搜索的色库）
 * - 点击列表项自动预览
 * - 应用后复制颜色信息到剪贴板
 * - ✨ 智能检测文档色彩模式（RGB/CMYK）
 * - ✨ CMYK 模式下直接用 CMYK 值匹配，避免转换误差
 *
 * 使用方法：
 * 1. 选中一个或多个对象
 * 2. 运行脚本
 * 3. 选择查找填充色或描边色
 * 4. 从结果列表中选择专色
 * 5. 预览效果后应用
 *
 * 色差算法：
 * - RGB 模式：Delta E 2000（CIE2000色差公式，印刷行业标准）
 * - CMYK 模式：加权欧氏距离（避免 RGB↔CMYK 转换误差）
 * 支持色库：PANTONE, RAL_CLASSIC, RAL_Design, NIPPON（共4594色）
 *
 * 技术说明：
 * - Delta E < 1.0：人眼无法区分
 * - Delta E < 2.0：近似匹配，印刷可接受
 * - Delta E < 5.0：可接受的差异
 * - Delta E > 10：明显差异
 */

// ============================================================
// 全局变量
// ============================================================

var g_selection = null;
var g_colorType = null; // "fill" 或 "stroke"

// ============================================================
// 主函数
// ============================================================

function main() {
    // 1. 检查文档是否打开
    if (app.documents.length === 0) {
        alert("请先打开一个文档。");
        return;
    }

    var doc = app.activeDocument;

    // 2. 检查选择对象
    if (doc.selection.length === 0) {
        alert("请先选择至少一个对象。\n\n脚本将提取选中对象的填充或描边颜色。");
        return;
    }

    g_selection = doc.selection;

    try {
        // 3. 检测文档色彩模式
        var docColorMode = doc.documentColorSpace; // DocumentColorSpace.RGB 或 DocumentColorSpace.CMYK
        var isRGBMode = (docColorMode === DocumentColorSpace.RGB);

        // 4. 让用户选择查找填充色还是描边色
        var colorType = selectColorType(g_selection);
        if (!colorType) {
            return; // 用户取消
        }

        g_colorType = colorType;

        // 5. 让用户选择要搜索的色库
        var selectedLibraries = selectColorLibraries();
        if (!selectedLibraries || selectedLibraries.length === 0) {
            return; // 用户取消
        }

        // 6. 提取颜色（保留原始色彩模式）
        var sourceColor = extractColorFromSelection(g_selection, colorType);

        if (!sourceColor) {
            alert("未能从选中对象提取" + (colorType === "fill" ? "填充" : "描边") + "颜色。\n\n请确保对象有对应的颜色。");
            return;
        }

        // 添加文档色彩模式信息
        sourceColor.isRGBMode = isRGBMode;

        // 6. 加载选中的专色库
        var spotColors = loadAllSpotColors(selectedLibraries);

        if (spotColors.length === 0) {
            alert("无法加载专色库。\n\n请确保 assets/colors/ 目录下的JSON文件存在。");
            return;
        }

        // 6. 查找最接近的专色
        var nearestColors = findNearestColors(sourceColor, spotColors, 10);

        // 7. 显示结果对话框（带预览和色块）
        var selectedColor = showResultDialog(sourceColor, nearestColors, colorType);

        // 8. 应用选中的专色（创建真专色色板）
        if (selectedColor) {
            applySpotColorToSelection(doc, g_selection, selectedColor, colorType);

            // 生成颜色信息文本
            var colorInfo = generateColorInfoText(selectedColor);

            // 尝试复制到剪贴板
            var copied = copyToClipboard(colorInfo);

            var message = "已应用专色：\n\n" +
                  selectedColor.code + "\n" +
                  selectedColor.name + "\n\n" +
                  "专色已添加到色板面板。\n\n" +
                  "━━━━━━━━━━━━━━━━\n" +
                  "颜色信息" + (copied ? "（已复制到剪贴板）" : "") + "：\n" +
                  colorInfo;

            alert(message);
        }

    } catch (e) {
        alert("操作失败：" + e.message + "\n\n行号：" + (e.line || "未知") + "\n文件：" + (e.fileName || "未知"));
    }
}

// ============================================================
// 颜色类型选择
// ============================================================

/**
 * 让用户选择查找填充色还是描边色
 * @param {Array} selection - 选中的对象数组
 * @return {String} "fill" 或 "stroke" 或 null（用户取消）
 */
function selectColorType(selection) {
    var hasFill = false;
    var hasStroke = false;

    // 检查选中对象有哪些颜色
    for (var i = 0; i < selection.length; i++) {
        var item = selection[i];
        if (item.filled && item.fillColor) hasFill = true;
        if (item.stroked && item.strokeColor) hasStroke = true;
    }

    // 如果只有一种，直接返回
    if (hasFill && !hasStroke) return "fill";
    if (!hasFill && hasStroke) return "stroke";
    if (!hasFill && !hasStroke) return null;

    // 两种都有，让用户选择
    var dialog = new Window("dialog", "选择要查找的颜色");
    dialog.orientation = "column";
    dialog.alignChildren = ["fill", "top"];
    dialog.spacing = 15;
    dialog.margins = 20;

    var info = dialog.add("statictext", undefined, "选中对象同时包含填充和描边颜色，\n请选择要查找哪一个：", {multiline: true});

    var radioGroup = dialog.add("group");
    radioGroup.orientation = "column";
    radioGroup.alignChildren = ["left", "top"];

    var fillRadio = radioGroup.add("radiobutton", undefined, "查找填充色");
    var strokeRadio = radioGroup.add("radiobutton", undefined, "查找描边色");

    fillRadio.value = true; // 默认选中填充

    var buttonGroup = dialog.add("group");
    buttonGroup.orientation = "row";
    buttonGroup.alignChildren = ["center", "center"];
    var okBtn = buttonGroup.add("button", undefined, "确定", {name: "ok"});
    var cancelBtn = buttonGroup.add("button", undefined, "取消", {name: "cancel"});

    if (dialog.show() === 1) {
        return fillRadio.value ? "fill" : "stroke";
    }

    return null;
}

// ============================================================
// 色库选择
// ============================================================

/**
 * 让用户选择要搜索的色库
 * @return {Array} 选中的色库数组，或null（用户取消）
 */
function selectColorLibraries() {
    var dialog = new Window("dialog", "选择要搜索的色库");
    dialog.orientation = "column";
    dialog.alignChildren = ["fill", "top"];
    dialog.spacing = 15;
    dialog.margins = 20;

    var info = dialog.add("statictext", undefined, "请选择要搜索的色库（可多选）：");

    var checkboxGroup = dialog.add("group");
    checkboxGroup.orientation = "column";
    checkboxGroup.alignChildren = ["left", "top"];
    checkboxGroup.spacing = 10;

    // 色库列表（与JSON文件名对应）
    var libraries = [
        { name: "PANTONE", label: "PANTONE（彩通，2390色）", file: "PANTONE" },
        { name: "RAL_CLASSIC", label: "RAL CLASSIC（劳尔经典，216色）", file: "RAL_CLASSIC" },
        { name: "RAL_Design", label: "RAL Design（劳尔设计）", file: "RAL_Design" },
        { name: "NIPPON", label: "NIPPON（立邦，1988色）", file: "NIPPON" }
    ];

    var checkboxes = [];

    for (var i = 0; i < libraries.length; i++) {
        var cb = checkboxGroup.add("checkbox", undefined, libraries[i].label);
        cb.value = true; // 默认全选
        cb.libraryData = libraries[i];
        checkboxes.push(cb);
    }

    // 统计信息
    var countLabel = dialog.add("statictext", undefined, "当前将搜索：约 4594 个专色");
    countLabel.preferredSize = [300, 20];

    // 更新统计
    function updateCount() {
        var total = 0;
        var counts = {
            "PANTONE": 2390,
            "RAL_CLASSIC": 216,
            "RAL_Design": 0, // 未统计
            "NIPPON": 1988
        };

        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].value) {
                total += counts[checkboxes[i].libraryData.name] || 0;
            }
        }

        if (total > 0) {
            countLabel.text = "当前将搜索：约 " + total + " 个专色";
        } else {
            countLabel.text = "请至少选择一个色库";
        }
    }

    // 给每个checkbox添加点击事件
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].onClick = updateCount;
    }

    var buttonGroup = dialog.add("group");
    buttonGroup.orientation = "row";
    buttonGroup.alignChildren = ["center", "center"];
    var okBtn = buttonGroup.add("button", undefined, "确定", {name: "ok"});
    var cancelBtn = buttonGroup.add("button", undefined, "取消", {name: "cancel"});

    if (dialog.show() === 1) {
        var selected = [];
        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].value) {
                selected.push(checkboxes[i].libraryData.file);
            }
        }
        return selected;
    }

    return null;
}

// ============================================================
// 颜色提取函数
// ============================================================

/**
 * 从选中对象提取指定类型的颜色（保留原始色彩空间）
 * @param {Array} selection - 选中的对象数组
 * @param {String} colorType - "fill" 或 "stroke"
 * @return {Object} 颜色对象 {rgb: {r,g,b}, cmyk: {c,m,y,k}, type: "rgb"/"cmyk"} 或 null
 */
function extractColorFromSelection(selection, colorType) {
    for (var i = 0; i < selection.length; i++) {
        var item = selection[i];

        if (colorType === "fill" && item.filled && item.fillColor) {
            var colorData = extractColorData(item.fillColor);
            if (colorData) return colorData;
        }

        if (colorType === "stroke" && item.stroked && item.strokeColor) {
            var colorData = extractColorData(item.strokeColor);
            if (colorData) return colorData;
        }
    }

    return null;
}

/**
 * 提取颜色数据（同时保存 RGB 和 CMYK）
 * @param {Color} color - Illustrator颜色对象
 * @return {Object} {rgb: {r,g,b}, cmyk: {c,m,y,k}, type: "rgb"/"cmyk"} 或 null
 */
function extractColorData(color) {
    try {
        if (color.typename === "RGBColor") {
            var rgb = {
                r: Math.round(color.red),
                g: Math.round(color.green),
                b: Math.round(color.blue)
            };
            // RGB 也转换成 CMYK 以备用
            var cmyk = rgbToCMYK(rgb);
            return {
                rgb: rgb,
                cmyk: cmyk,
                type: "rgb"
            };
        }

        if (color.typename === "CMYKColor") {
            var cmyk = {
                c: Math.round(color.cyan * 100) / 100,
                m: Math.round(color.magenta * 100) / 100,
                y: Math.round(color.yellow * 100) / 100,
                k: Math.round(color.black * 100) / 100
            };
            // CMYK 也转换成 RGB 以备用
            var rgb = cmykToRGB(cmyk);
            return {
                rgb: rgb,
                cmyk: cmyk,
                type: "cmyk"
            };
        }

        if (color.typename === "GrayColor") {
            var gray = Math.round(255 * (1 - color.gray / 100));
            var rgb = { r: gray, g: gray, b: gray };
            var cmyk = rgbToCMYK(rgb);
            return {
                rgb: rgb,
                cmyk: cmyk,
                type: "rgb"
            };
        }

        if (color.typename === "SpotColor") {
            // 专色递归提取
            return extractColorData(color.spot.color);
        }

    } catch (e) {
        // 忽略转换错误
    }

    return null;
}

/**
 * CMYK转RGB（简化算法）
 * @param {Object} cmyk - CMYK对象 {c, m, y, k}（0-100）
 * @return {Object} RGB对象 {r, g, b}
 */
function cmykToRGB(cmyk) {
    var c = cmyk.c / 100;
    var m = cmyk.m / 100;
    var y = cmyk.y / 100;
    var k = cmyk.k / 100;

    var r = 255 * (1 - c) * (1 - k);
    var g = 255 * (1 - m) * (1 - k);
    var b = 255 * (1 - y) * (1 - k);

    return {
        r: Math.round(r),
        g: Math.round(g),
        b: Math.round(b)
    };
}

/**
 * RGB转CMYK（简化算法）
 * @param {Object} rgb - RGB对象 {r, g, b}
 * @return {Object} CMYK对象 {c, m, y, k}（0-100）
 */
function rgbToCMYK(rgb) {
    var r = rgb.r / 255;
    var g = rgb.g / 255;
    var b = rgb.b / 255;

    var k = 1 - Math.max(r, g, b);

    if (k === 1) {
        return { c: 0, m: 0, y: 0, k: 100 };
    }

    var c = (1 - r - k) / (1 - k);
    var m = (1 - g - k) / (1 - k);
    var y = (1 - b - k) / (1 - k);

    return {
        c: Math.round(c * 100 * 100) / 100,
        m: Math.round(m * 100 * 100) / 100,
        y: Math.round(y * 100 * 100) / 100,
        k: Math.round(k * 100 * 100) / 100
    };
}

// ============================================================
// 专色库加载
// ============================================================

/**
 * 加载所有专色库JSON文件
 * @param {Array} selectedLibraries - 用户选择的色库数组（可选，默认加载全部）
 * @return {Array} 所有专色的数组
 */
function loadAllSpotColors(selectedLibraries) {
    var allColors = [];
    var colorLibs = selectedLibraries || ["PANTONE", "RAL_CLASSIC", "RAL_Design", "NIPPON"];

    // 获取扩展根目录
    var extensionPath = getExtensionPath();

    for (var i = 0; i < colorLibs.length; i++) {
        var libName = colorLibs[i];
        var filePath = extensionPath + "/assets/colors/" + libName + ".json";
        var colors = loadColorLibrary(filePath, libName);

        if (colors && colors.length > 0) {
            allColors = allColors.concat(colors);
        }
    }

    return allColors;
}

/**
 * 加载单个专色库
 * @param {String} filePath - JSON文件路径
 * @param {String} libName - 色库名称
 * @return {Array} 专色数组
 */
function loadColorLibrary(filePath, libName) {
    try {
        var file = new File(filePath);

        if (!file.exists) {
            return [];
        }

        file.open("r");
        var content = file.read();
        file.close();

        // 解析JSON（使用eval，ExtendScript不支持JSON.parse）
        var data = eval("(" + content + ")");

        if (data && data.colors) {
            // 给每个颜色添加色库标识
            for (var i = 0; i < data.colors.length; i++) {
                data.colors[i].library = libName;
            }
            return data.colors;
        }

    } catch (e) {
        // 忽略加载错误
    }

    return [];
}

/**
 * 获取扩展根目录路径
 * @return {String} 扩展目录路径
 */
function getExtensionPath() {
    // 尝试多种方法获取路径
    try {
        // 方法1：通过脚本文件路径推断
        var scriptFile = new File($.fileName);
        var scriptPath = scriptFile.parent.parent.parent.fsName; // 从 js/scripts/ 回到根目录
        return scriptPath;
    } catch (e) {
        // 方法2：使用固定路径（Windows）
        var winPath = Folder.appData.fsName + "/Adobe/CEP/extensions/com.hope.toolbox";
        if (Folder(winPath).exists) {
            return winPath;
        }

        // 方法3：使用固定路径（macOS）
        var macPath = "~/Library/Application Support/Adobe/CEP/extensions/com.hope.toolbox";
        if (Folder(macPath).exists) {
            return macPath;
        }
    }

    return "";
}

// ============================================================
// 颜色匹配算法（Delta E 2000）
// ============================================================

/**
 * 查找最接近的N个专色（自动选择匹配算法）
 * @param {Object} sourceColor - 源颜色对象 {rgb: {r,g,b}, cmyk: {c,m,y,k}, type: "rgb"/"cmyk", isRGBMode: boolean}
 * @param {Array} spotColors - 专色数组
 * @param {Number} count - 返回数量
 * @return {Array} 最接近的专色数组（包含距离信息）
 */
function findNearestColors(sourceColor, spotColors, count) {
    var results = [];

    // 判断使用哪种匹配算法
    // 优先使用文档模式，其次使用颜色类型
    var useCMYK = false;

    if (sourceColor.isRGBMode !== undefined) {
        // 如果有文档模式信息，以文档模式为准
        useCMYK = !sourceColor.isRGBMode;
    } else if (sourceColor.type) {
        // 否则使用颜色类型
        useCMYK = (sourceColor.type === "cmyk");
    }

    if (useCMYK) {
        // ===== CMYK 模式：使用 CMYK 直接匹配 =====
        var sourceCMYK = sourceColor.cmyk;

        for (var i = 0; i < spotColors.length; i++) {
            var spot = spotColors[i];
            var spotCMYK = {
                c: spot.cmyk[0],
                m: spot.cmyk[1],
                y: spot.cmyk[2],
                k: spot.cmyk[3]
            };

            var distance = calculateCMYKDistance(sourceCMYK, spotCMYK);

            results.push({
                color: spot,
                distance: distance,
                code: spot.code,
                name: spot.name,
                rgb: spot.rgb,
                cmyk: spot.cmyk,
                hex: spot.hex,
                library: spot.library
            });
        }
    } else {
        // ===== RGB 模式：使用 Delta E 2000 =====
        var sourceRGB = sourceColor.rgb;
        var sourceLab = rgbToLab(sourceRGB);

        for (var i = 0; i < spotColors.length; i++) {
            var spot = spotColors[i];
            var spotRGB = {
                r: spot.rgb[0],
                g: spot.rgb[1],
                b: spot.rgb[2]
            };
            var spotLab = rgbToLab(spotRGB);

            var deltaE = calculateDeltaE2000(sourceLab, spotLab);

            results.push({
                color: spot,
                distance: deltaE,
                code: spot.code,
                name: spot.name,
                rgb: spot.rgb,
                cmyk: spot.cmyk,
                hex: spot.hex,
                library: spot.library
            });
        }
    }

    // 按距离排序（从小到大）
    results.sort(function(a, b) {
        return a.distance - b.distance;
    });

    // 返回前N个
    return results.slice(0, count);
}

/**
 * RGB转LAB（通过XYZ中转）
 * @param {Object} rgb - RGB颜色 {r, g, b}
 * @return {Object} LAB颜色 {l, a, b}
 */
function rgbToLab(rgb) {
    var xyz = rgbToXYZ(rgb);
    return xyzToLab(xyz);
}

/**
 * RGB转XYZ（使用sRGB色彩空间，D65光源）
 * @param {Object} rgb - RGB颜色 {r, g, b}
 * @return {Object} XYZ颜色 {x, y, z}
 */
function rgbToXYZ(rgb) {
    // 归一化到0-1
    var r = rgb.r / 255;
    var g = rgb.g / 255;
    var b = rgb.b / 255;

    // Gamma校正（sRGB）
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    // 转换矩阵（sRGB to XYZ，D65）
    var x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    var y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
    var z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

    return {
        x: x * 100, // 缩放到0-100
        y: y * 100,
        z: z * 100
    };
}

/**
 * XYZ转LAB（使用D65光源）
 * @param {Object} xyz - XYZ颜色 {x, y, z}
 * @return {Object} LAB颜色 {l, a, b}
 */
function xyzToLab(xyz) {
    // D65光源参考白点
    var refX = 95.047;
    var refY = 100.000;
    var refZ = 108.883;

    // 归一化
    var x = xyz.x / refX;
    var y = xyz.y / refY;
    var z = xyz.z / refZ;

    // 应用f(t)函数
    function labF(t) {
        return t > 0.008856 ? Math.pow(t, 1/3) : (7.787 * t + 16/116);
    }

    x = labF(x);
    y = labF(y);
    z = labF(z);

    // 计算LAB
    var l = (116 * y) - 16;
    var a = 500 * (x - y);
    var b = 200 * (y - z);

    return { l: l, a: a, b: b };
}

/**
 * 计算Delta E 2000色差
 * @param {Object} lab1 - LAB颜色1 {l, a, b}
 * @param {Object} lab2 - LAB颜色2 {l, a, b}
 * @return {Number} Delta E 2000值
 */
function calculateDeltaE2000(lab1, lab2) {
    // 权重系数（默认值）
    var kL = 1.0;
    var kC = 1.0;
    var kH = 1.0;

    // 计算C'（色度）
    var c1 = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
    var c2 = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);
    var cBar = (c1 + c2) / 2;

    // 计算G
    var g = 0.5 * (1 - Math.sqrt(Math.pow(cBar, 7) / (Math.pow(cBar, 7) + Math.pow(25, 7))));

    // 计算a'
    var a1Prime = lab1.a * (1 + g);
    var a2Prime = lab2.a * (1 + g);

    // 计算C'
    var c1Prime = Math.sqrt(a1Prime * a1Prime + lab1.b * lab1.b);
    var c2Prime = Math.sqrt(a2Prime * a2Prime + lab2.b * lab2.b);

    // 计算h'（色相角）
    function calcHPrime(aPrime, b) {
        if (aPrime === 0 && b === 0) return 0;
        var h = Math.atan2(b, aPrime) * 180 / Math.PI;
        return h >= 0 ? h : h + 360;
    }

    var h1Prime = calcHPrime(a1Prime, lab1.b);
    var h2Prime = calcHPrime(a2Prime, lab2.b);

    // 计算ΔL', ΔC', ΔH'
    var deltaLPrime = lab2.l - lab1.l;
    var deltaCPrime = c2Prime - c1Prime;

    var deltaHPrime;
    if (c1Prime * c2Prime === 0) {
        deltaHPrime = 0;
    } else {
        var diffH = h2Prime - h1Prime;
        if (Math.abs(diffH) <= 180) {
            deltaHPrime = diffH;
        } else if (diffH > 180) {
            deltaHPrime = diffH - 360;
        } else {
            deltaHPrime = diffH + 360;
        }
    }

    var deltaHPrimeRad = 2 * Math.sqrt(c1Prime * c2Prime) * Math.sin(deltaHPrime * Math.PI / 360);

    // 计算平均值
    var lBarPrime = (lab1.l + lab2.l) / 2;
    var cBarPrime = (c1Prime + c2Prime) / 2;

    var hBarPrime;
    if (c1Prime * c2Prime === 0) {
        hBarPrime = h1Prime + h2Prime;
    } else {
        var sumH = h1Prime + h2Prime;
        if (Math.abs(h1Prime - h2Prime) <= 180) {
            hBarPrime = sumH / 2;
        } else if (sumH < 360) {
            hBarPrime = (sumH + 360) / 2;
        } else {
            hBarPrime = (sumH - 360) / 2;
        }
    }

    // 计算T
    var t = 1 - 0.17 * Math.cos((hBarPrime - 30) * Math.PI / 180) +
            0.24 * Math.cos(2 * hBarPrime * Math.PI / 180) +
            0.32 * Math.cos((3 * hBarPrime + 6) * Math.PI / 180) -
            0.20 * Math.cos((4 * hBarPrime - 63) * Math.PI / 180);

    // 计算SL, SC, SH
    var sL = 1 + (0.015 * Math.pow(lBarPrime - 50, 2)) / Math.sqrt(20 + Math.pow(lBarPrime - 50, 2));
    var sC = 1 + 0.045 * cBarPrime;
    var sH = 1 + 0.015 * cBarPrime * t;

    // 计算RT
    var deltaTheta = 30 * Math.exp(-Math.pow((hBarPrime - 275) / 25, 2));
    var rC = 2 * Math.sqrt(Math.pow(cBarPrime, 7) / (Math.pow(cBarPrime, 7) + Math.pow(25, 7)));
    var rT = -rC * Math.sin(2 * deltaTheta * Math.PI / 180);

    // 计算最终的Delta E 2000
    var deltaE = Math.sqrt(
        Math.pow(deltaLPrime / (kL * sL), 2) +
        Math.pow(deltaCPrime / (kC * sC), 2) +
        Math.pow(deltaHPrimeRad / (kH * sH), 2) +
        rT * (deltaCPrime / (kC * sC)) * (deltaHPrimeRad / (kH * sH))
    );

    return deltaE;
}

/**
 * 计算 CMYK 色差（加权欧氏距离）
 * @param {Object} cmyk1 - CMYK颜色1 {c, m, y, k}（0-100）
 * @param {Object} cmyk2 - CMYK颜色2 {c, m, y, k}（0-100）
 * @return {Number} CMYK 色差值
 */
function calculateCMYKDistance(cmyk1, cmyk2) {
    // 加权系数（印刷行业经验值）
    // K（黑色）权重较高，因为它对视觉影响最大
    var wC = 1.0;
    var wM = 1.0;
    var wY = 1.0;
    var wK = 1.5;

    var deltaC = cmyk1.c - cmyk2.c;
    var deltaM = cmyk1.m - cmyk2.m;
    var deltaY = cmyk1.y - cmyk2.y;
    var deltaK = cmyk1.k - cmyk2.k;

    var distance = Math.sqrt(
        wC * deltaC * deltaC +
        wM * deltaM * deltaM +
        wY * deltaY * deltaY +
        wK * deltaK * deltaK
    );

    return distance;
}

// ============================================================
// 对话框UI（增强版 - 带色块和预览）
// ============================================================

/**
 * 显示结果对话框（增强版）
 * @param {Object} sourceColor - 源颜色对象 {rgb: {r,g,b}, cmyk: {c,m,y,k}, type: "rgb"/"cmyk", isRGBMode: boolean}
 * @param {Array} nearestColors - 最接近的专色数组
 * @param {String} colorType - "fill" 或 "stroke"
 * @return {Object} 用户选中的专色，或null
 */
function showResultDialog(sourceColor, nearestColors, colorType) {
    var dialog = new Window("dialog", "查找相近专色 - 结果");
    dialog.orientation = "column";
    dialog.alignChildren = ["fill", "top"];
    dialog.spacing = 10;
    dialog.margins = 15;

    // 判断使用的匹配模式
    var useCMYK = sourceColor.isRGBMode !== undefined ? !sourceColor.isRGBMode : (sourceColor.type === "cmyk");
    var modeText = useCMYK ? "CMYK 模式匹配" : "RGB 模式匹配";

    // 模式提示
    var modePanel = dialog.add("panel", undefined, "匹配模式");
    modePanel.orientation = "row";
    modePanel.alignChildren = ["left", "center"];
    modePanel.margins = 10;
    var modeLabel = modePanel.add("statictext", undefined, "使用 " + modeText + " 查找专色");
    modeLabel.preferredSize = [400, 20];

    // 源颜色信息
    var sourcePanel = dialog.add("panel", undefined, "当前颜色（" + (colorType === "fill" ? "填充" : "描边") + "）");
    sourcePanel.orientation = "row";
    sourcePanel.alignChildren = ["left", "center"];
    sourcePanel.margins = 10;

    // 源颜色色块（使用自定义绘图）
    var sourceColorBox = sourcePanel.add("group");
    sourceColorBox.preferredSize = [40, 40];
    sourceColorBox.graphics.backgroundColor = sourceColorBox.graphics.newBrush(
        sourceColorBox.graphics.BrushType.SOLID_COLOR,
        [sourceColor.rgb.r / 255, sourceColor.rgb.g / 255, sourceColor.rgb.b / 255]
    );

    var sourceInfoGroup = sourcePanel.add("group");
    sourceInfoGroup.orientation = "column";
    sourceInfoGroup.alignChildren = ["left", "top"];
    sourceInfoGroup.spacing = 2;

    var rgbLabel = sourceInfoGroup.add("statictext", undefined,
        "RGB: " + sourceColor.rgb.r + ", " + sourceColor.rgb.g + ", " + sourceColor.rgb.b);
    rgbLabel.preferredSize = [350, 20];

    var cmykLabel = sourceInfoGroup.add("statictext", undefined,
        "CMYK: C" + sourceColor.cmyk.c + " M" + sourceColor.cmyk.m + " Y" + sourceColor.cmyk.y + " K" + sourceColor.cmyk.k);
    cmykLabel.preferredSize = [350, 20];

    // 结果列表
    var resultsPanel = dialog.add("panel", undefined, "最接近的专色（共" + nearestColors.length + "个）");
    resultsPanel.orientation = "column";
    resultsPanel.alignChildren = ["fill", "top"];
    resultsPanel.margins = 10;

    // 创建自定义列表（带色块）
    var listGroup = resultsPanel.add("group");
    listGroup.orientation = "column";
    listGroup.alignChildren = ["fill", "top"];
    listGroup.spacing = 2;

    var colorItems = [];
    var selectedIndex = 0;

    // 创建列表项
    for (var i = 0; i < nearestColors.length; i++) {
        var nc = nearestColors[i];

        // 将Delta E转换为相似度百分比
        // Delta E < 1 = 完美匹配（99-100%）
        // Delta E < 2 = 极其接近（95-99%）
        // Delta E < 5 = 可接受（80-95%）
        // Delta E < 10 = 明显差异（60-80%）
        // Delta E > 10 = 很大差异（<60%）
        var deltaE = nc.distance;
        var similarity;
        if (deltaE < 1) {
            similarity = Math.round(100 - deltaE * 1);
        } else if (deltaE < 2) {
            similarity = Math.round(99 - (deltaE - 1) * 4);
        } else if (deltaE < 5) {
            similarity = Math.round(95 - (deltaE - 2) * 5);
        } else if (deltaE < 10) {
            similarity = Math.round(80 - (deltaE - 5) * 4);
        } else if (deltaE < 20) {
            similarity = Math.round(60 - (deltaE - 10) * 3);
        } else {
            similarity = Math.max(0, Math.round(30 - (deltaE - 20) * 1.5));
        }

        var itemGroup = listGroup.add("group");
        itemGroup.orientation = "row";
        itemGroup.alignChildren = ["left", "center"];
        itemGroup.spacing = 10;
        itemGroup.preferredSize = [600, 35];

        // 色块
        var colorBox = itemGroup.add("group");
        colorBox.preferredSize = [30, 30];
        colorBox.graphics.backgroundColor = colorBox.graphics.newBrush(
            colorBox.graphics.BrushType.SOLID_COLOR,
            [nc.rgb[0] / 255, nc.rgb[1] / 255, nc.rgb[2] / 255]
        );

        // 色库
        var libText = itemGroup.add("statictext", undefined, nc.library);
        libText.preferredSize = [100, 20];

        // 色号
        var codeText = itemGroup.add("statictext", undefined, nc.code);
        codeText.preferredSize = [150, 20];

        // 色名
        var nameText = itemGroup.add("statictext", undefined, nc.name);
        nameText.preferredSize = [150, 20];

        // 相似度
        var simText = itemGroup.add("statictext", undefined, similarity + "%");
        simText.preferredSize = [50, 20];

        // 保存数据
        itemGroup.colorData = nc;
        itemGroup.itemIndex = i;

        // 点击事件 - 点击即预览
        itemGroup.addEventListener("click", function() {
            selectedIndex = this.itemIndex;
            updateSelection();
            updatePreview();
            // 自动预览到选中对象
            if (colorItems[selectedIndex]) {
                var nc = colorItems[selectedIndex].colorData;
                previewColorOnSelection(g_selection, nc, g_colorType);
            }
        });

        colorItems.push(itemGroup);
    }

    // 更新选中状态
    function updateSelection() {
        for (var i = 0; i < colorItems.length; i++) {
            if (i === selectedIndex) {
                colorItems[i].graphics.backgroundColor = colorItems[i].graphics.newBrush(
                    colorItems[i].graphics.BrushType.SOLID_COLOR,
                    [0.4, 0.6, 1.0]
                );
            } else {
                colorItems[i].graphics.backgroundColor = colorItems[i].graphics.newBrush(
                    colorItems[i].graphics.BrushType.SOLID_COLOR,
                    [0.18, 0.18, 0.18]
                );
            }
        }
    }

    // 预览面板
    var previewPanel = dialog.add("panel", undefined, "详细信息（点击列表项即可预览）");
    previewPanel.orientation = "column";
    previewPanel.alignChildren = ["fill", "top"];
    previewPanel.margins = 10;

    var previewLabel = previewPanel.add("statictext", undefined, "", {multiline: true});
    previewLabel.preferredSize = [600, 80];

    // 更新预览信息
    function updatePreview() {
        if (colorItems[selectedIndex]) {
            var nc = colorItems[selectedIndex].colorData;
            previewLabel.text =
                "色库：" + nc.library + "\n" +
                "色号：" + nc.code + "\n" +
                "色名：" + nc.name + "\n" +
                "RGB：" + nc.rgb[0] + ", " + nc.rgb[1] + ", " + nc.rgb[2] + "\n" +
                "CMYK：C" + nc.cmyk[0] + " M" + nc.cmyk[1] + " Y" + nc.cmyk[2] + " K" + nc.cmyk[3] + "\n" +
                "HEX：" + nc.hex;
        }
    }

    // 初始化选中第一项并自动预览
    updateSelection();
    updatePreview();
    // 第一项自动预览
    if (colorItems[selectedIndex]) {
        var nc = colorItems[selectedIndex].colorData;
        previewColorOnSelection(g_selection, nc, g_colorType);
    }

    // 按钮组
    var buttonGroup = dialog.add("group");
    buttonGroup.orientation = "row";
    buttonGroup.alignChildren = ["center", "center"];

    var applyBtn = buttonGroup.add("button", undefined, "确定应用", {name: "ok"});
    var cancelBtn = buttonGroup.add("button", undefined, "取消", {name: "cancel"});

    // 显示对话框
    if (dialog.show() === 1 && colorItems[selectedIndex]) {
        return colorItems[selectedIndex].colorData;
    }

    return null;
}

// ============================================================
// 预览功能
// ============================================================

/**
 * 预览颜色到选中对象（临时应用RGB颜色）
 * @param {Array} selection - 选中的对象数组
 * @param {Object} spotColorData - 专色数据
 * @param {String} colorType - "fill" 或 "stroke"
 */
function previewColorOnSelection(selection, spotColorData, colorType) {
    var doc = app.activeDocument;

    // 创建临时RGB颜色
    var previewColor = new RGBColor();
    previewColor.red = spotColorData.rgb[0];
    previewColor.green = spotColorData.rgb[1];
    previewColor.blue = spotColorData.rgb[2];

    // 应用到选中对象
    for (var i = 0; i < selection.length; i++) {
        var item = selection[i];

        if (colorType === "fill" && item.filled) {
            item.fillColor = previewColor;
        }

        if (colorType === "stroke" && item.stroked) {
            item.strokeColor = previewColor;
        }
    }

    app.redraw();
}

// ============================================================
// 应用专色（创建真正的Spot Color）
// ============================================================

/**
 * 将专色应用到选中对象（创建真专色色板）
 * @param {Document} doc - 文档对象
 * @param {Array} selection - 选中的对象数组
 * @param {Object} spotColorData - 专色数据
 * @param {String} colorType - "fill" 或 "stroke"
 */
function applySpotColorToSelection(doc, selection, spotColorData, colorType) {
    // 1. 检查色板中是否已存在该专色
    var spot = findOrCreateSpot(doc, spotColorData);

    // 2. 创建SpotColor对象
    var spotColor = new SpotColor();
    spotColor.spot = spot;
    spotColor.tint = 100; // 100% 色调

    // 3. 应用到选中对象
    for (var i = 0; i < selection.length; i++) {
        var item = selection[i];

        if (colorType === "fill" && item.filled) {
            item.fillColor = spotColor;
        }

        if (colorType === "stroke" && item.stroked) {
            item.strokeColor = spotColor;
        }
    }
}

/**
 * 查找或创建专色色板
 * @param {Document} doc - 文档对象
 * @param {Object} spotColorData - 专色数据
 * @return {Spot} 专色对象
 */
function findOrCreateSpot(doc, spotColorData) {
    var spotName = spotColorData.code;

    // 查找是否已存在
    for (var i = 0; i < doc.spots.length; i++) {
        if (doc.spots[i].name === spotName) {
            return doc.spots[i];
        }
    }

    // 不存在则创建
    var newSpot = doc.spots.add();
    newSpot.name = spotName;
    newSpot.colorType = ColorModel.SPOT;

    // 设置专色的CMYK值（用于印刷）
    var cmykColor = new CMYKColor();
    cmykColor.cyan = spotColorData.cmyk[0];
    cmykColor.magenta = spotColorData.cmyk[1];
    cmykColor.yellow = spotColorData.cmyk[2];
    cmykColor.black = spotColorData.cmyk[3];

    newSpot.color = cmykColor;

    return newSpot;
}

// ============================================================
// 颜色信息生成和复制
// ============================================================

/**
 * 生成颜色信息文本（用于复制）
 * @param {Object} colorData - 专色数据
 * @return {String} 格式化的颜色信息
 */
function generateColorInfoText(colorData) {
    var text = "";
    text += "色库：" + colorData.library + "\n";
    text += "色号：" + colorData.code + "\n";
    text += "色名：" + colorData.name + "\n";
    text += "RGB：" + colorData.rgb[0] + ", " + colorData.rgb[1] + ", " + colorData.rgb[2] + "\n";
    text += "CMYK：C" + colorData.cmyk[0] + " M" + colorData.cmyk[1] + " Y" + colorData.cmyk[2] + " K" + colorData.cmyk[3] + "\n";
    text += "HEX：" + colorData.hex;
    return text;
}

/**
 * 复制文本到系统剪贴板
 * @param {String} text - 要复制的文本
 * @return {Boolean} 是否成功复制
 */
function copyToClipboard(text) {
    try {
        // 检测操作系统
        var os = $.os.toLowerCase();
        var isWindows = os.indexOf("windows") >= 0;
        var isMac = os.indexOf("mac") >= 0;

        if (isWindows) {
            // Windows: 使用 clip 命令
            // 创建临时批处理文件
            var tempFolder = Folder.temp;
            var batFile = new File(tempFolder.fsName + "/copy_to_clipboard.bat");
            var txtFile = new File(tempFolder.fsName + "/clipboard_content.txt");

            // 写入文本到临时文件
            txtFile.open("w");
            txtFile.write(text);
            txtFile.close();

            // 创建批处理文件
            batFile.open("w");
            batFile.writeln("@echo off");
            batFile.writeln("type \"" + txtFile.fsName + "\" | clip");
            batFile.close();

            // 执行批处理
            batFile.execute();

            // 等待一下
            $.sleep(100);

            // 清理临时文件
            batFile.remove();
            txtFile.remove();

            return true;

        } else if (isMac) {
            // macOS: 使用 pbcopy
            var tempFolder = Folder.temp;
            var txtFile = new File(tempFolder.fsName + "/clipboard_content.txt");
            var shFile = new File(tempFolder.fsName + "/copy_to_clipboard.sh");

            // 写入文本到临时文件
            txtFile.open("w");
            txtFile.write(text);
            txtFile.close();

            // 创建shell脚本
            shFile.open("w");
            shFile.writeln("#!/bin/bash");
            shFile.writeln("cat \"" + txtFile.fsName + "\" | pbcopy");
            shFile.close();

            // 执行脚本
            shFile.execute();

            // 等待一下
            $.sleep(100);

            // 清理临时文件
            shFile.remove();
            txtFile.remove();

            return true;
        }

    } catch (e) {
        // 复制失败，静默处理
        return false;
    }

    return false;
}

// ============================================================
// 执行主函数
// ============================================================

main();
