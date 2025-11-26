//@target illustrator

/**
 * 脚本名称：批量转换为专色
 * 脚本功能：扫描文档中所有颜色，批量转换为最接近的专色
 * 作者：HOPE
 * 创建日期：2025-01-25
 * 版本：1.0.0
 *
 * 功能特点：
 * - 扫描文档中所有对象的颜色
 * - 自动去重，统计每种颜色的使用次数
 * - 显示颜色映射表供用户确认
 * - 支持色库筛选
 * - 批量应用转换
 * - 生成转换报告
 *
 * 使用方法：
 * 1. 打开包含多种颜色的文档
 * 2. 运行脚本
 * 3. 选择要搜索的色库
 * 4. 确认颜色映射表
 * 5. 应用转换并查看报告
 *
 * 色差算法：Delta E 2000（CIE2000色差公式，印刷行业标准）
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

var g_doc = null;
var g_colorMap = []; // 颜色映射表

// ============================================================
// 主函数
// ============================================================

function main() {
    // 1. 检查文档是否打开
    if (app.documents.length === 0) {
        alert("请先打开一个文档。");
        return;
    }

    g_doc = app.activeDocument;

    try {
        // 2. 让用户选择要搜索的色库
        var selectedLibraries = selectColorLibraries();
        if (!selectedLibraries || selectedLibraries.length === 0) {
            return; // 用户取消
        }

        // 3. 扫描文档中的所有颜色
        var documentColors = scanDocumentColors(g_doc);

        if (documentColors.length === 0) {
            alert("文档中未发现任何RGB或CMYK颜色。\n\n提示：专色对象将被忽略。");
            return;
        }

        // 4. 加载专色库
        var spotColors = loadAllSpotColors(selectedLibraries);

        if (spotColors.length === 0) {
            alert("无法加载专色库。\n\n请确保 assets/colors/ 目录下的JSON文件存在。");
            return;
        }

        // 5. 为每种颜色查找最接近的专色
        g_colorMap = buildColorMapping(documentColors, spotColors);

        // 6. 显示映射表对话框，让用户确认
        var confirmed = showMappingDialog(g_colorMap);

        if (!confirmed) {
            return; // 用户取消
        }

        // 7. 应用转换
        var report = applyColorMapping(g_doc, g_colorMap);

        // 8. 显示转换报告
        showConversionReport(report);

    } catch (e) {
        alert("操作失败：" + e.message + "\n\n行号：" + (e.line || "未知") + "\n文件：" + (e.fileName || "未知"));
    }
}

// ============================================================
// 色库选择（复用findNearestSpotColor.js中的代码）
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
// 文档颜色扫描
// ============================================================

/**
 * 扫描文档中所有对象的颜色
 * @param {Document} doc - 文档对象
 * @return {Array} 颜色数组，每个元素包含RGB和使用次数
 */
function scanDocumentColors(doc) {
    var colorHash = {}; // 用于去重，key=rgb字符串，value={rgb, count, objects}

    // 递归扫描所有图层中的对象
    function scanLayer(layer) {
        if (!layer.visible || layer.locked) {
            return; // 跳过隐藏或锁定的图层
        }

        for (var i = 0; i < layer.pageItems.length; i++) {
            var item = layer.pageItems[i];
            scanItem(item);
        }

        // 递归子图层
        for (var i = 0; i < layer.layers.length; i++) {
            scanLayer(layer.layers[i]);
        }
    }

    // 扫描单个对象
    function scanItem(item) {
        // 跳过锁定或隐藏的对象
        if (item.locked || item.hidden) {
            return;
        }

        // 填充色
        if (item.filled && item.fillColor) {
            var fillRGB = colorToRGB(item.fillColor);
            if (fillRGB) {
                var key = fillRGB.r + "," + fillRGB.g + "," + fillRGB.b;
                if (!colorHash[key]) {
                    colorHash[key] = {
                        rgb: fillRGB,
                        count: 0,
                        objects: []
                    };
                }
                colorHash[key].count++;
                colorHash[key].objects.push({ item: item, type: "fill" });
            }
        }

        // 描边色
        if (item.stroked && item.strokeColor) {
            var strokeRGB = colorToRGB(item.strokeColor);
            if (strokeRGB) {
                var key = strokeRGB.r + "," + strokeRGB.g + "," + strokeRGB.b;
                if (!colorHash[key]) {
                    colorHash[key] = {
                        rgb: strokeRGB,
                        count: 0,
                        objects: []
                    };
                }
                colorHash[key].count++;
                colorHash[key].objects.push({ item: item, type: "stroke" });
            }
        }

        // 递归处理组合对象
        if (item.typename === "GroupItem") {
            for (var i = 0; i < item.pageItems.length; i++) {
                scanItem(item.pageItems[i]);
            }
        }
    }

    // 扫描所有图层
    for (var i = 0; i < doc.layers.length; i++) {
        scanLayer(doc.layers[i]);
    }

    // 转换为数组
    var colors = [];
    for (var key in colorHash) {
        if (colorHash.hasOwnProperty(key)) {
            colors.push(colorHash[key]);
        }
    }

    // 按使用次数排序（从多到少）
    colors.sort(function(a, b) {
        return b.count - a.count;
    });

    return colors;
}

/**
 * 将Illustrator颜色转换为RGB
 * @param {Color} color - Illustrator颜色对象
 * @return {Object} RGB对象 {r, g, b} 或 null
 */
function colorToRGB(color) {
    try {
        if (color.typename === "RGBColor") {
            return {
                r: Math.round(color.red),
                g: Math.round(color.green),
                b: Math.round(color.blue)
            };
        }

        if (color.typename === "CMYKColor") {
            // CMYK转RGB（简化算法）
            var c = color.cyan / 100;
            var m = color.magenta / 100;
            var y = color.yellow / 100;
            var k = color.black / 100;

            var r = 255 * (1 - c) * (1 - k);
            var g = 255 * (1 - m) * (1 - k);
            var b = 255 * (1 - y) * (1 - k);

            return {
                r: Math.round(r),
                g: Math.round(g),
                b: Math.round(b)
            };
        }

        if (color.typename === "GrayColor") {
            var gray = Math.round(255 * (1 - color.gray / 100));
            return { r: gray, g: gray, b: gray };
        }

        // 专色跳过（不转换）
        if (color.typename === "SpotColor") {
            return null;
        }

    } catch (e) {
        // 忽略转换错误
    }

    return null;
}

// ============================================================
// 颜色映射构建
// ============================================================

/**
 * 为每种文档颜色查找最接近的专色
 * @param {Array} documentColors - 文档颜色数组
 * @param {Array} spotColors - 专色库数组
 * @return {Array} 颜色映射数组
 */
function buildColorMapping(documentColors, spotColors) {
    var mapping = [];

    for (var i = 0; i < documentColors.length; i++) {
        var docColor = documentColors[i];
        var nearestSpot = findNearestColor(docColor.rgb, spotColors);

        // 将Delta E转换为相似度百分比
        var deltaE = nearestSpot.distance;
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

        mapping.push({
            sourceRGB: docColor.rgb,
            targetSpot: nearestSpot,
            count: docColor.count,
            objects: docColor.objects,
            similarity: similarity,
            deltaE: deltaE
        });
    }

    return mapping;
}

/**
 * 查找最接近的专色
 * @param {Object} sourceRGB - 源颜色 {r, g, b}
 * @param {Array} spotColors - 专色数组
 * @return {Object} 最接近的专色
 */
function findNearestColor(sourceRGB, spotColors) {
    var minDistance = Infinity;
    var nearest = null;

    // 将源颜色转换为LAB
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

        if (deltaE < minDistance) {
            minDistance = deltaE;
            nearest = {
                color: spot,
                distance: deltaE,
                code: spot.code,
                name: spot.name,
                rgb: spot.rgb,
                cmyk: spot.cmyk,
                hex: spot.hex,
                library: spot.library
            };
        }
    }

    return nearest;
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

// ============================================================
// 映射表对话框
// ============================================================

/**
 * 显示颜色映射表对话框
 * @param {Array} colorMap - 颜色映射数组
 * @return {Boolean} 用户是否确认
 */
function showMappingDialog(colorMap) {
    var dialog = new Window("dialog", "批量转换为专色 - 颜色映射表");
    dialog.orientation = "column";
    dialog.alignChildren = ["fill", "top"];
    dialog.spacing = 10;
    dialog.margins = 15;

    // 信息面板
    var infoPanel = dialog.add("panel", undefined, "转换预览");
    infoPanel.orientation = "column";
    infoPanel.alignChildren = ["fill", "top"];
    infoPanel.margins = 10;

    var infoText = infoPanel.add("statictext", undefined,
        "文档中发现 " + colorMap.length + " 种不同的颜色，将转换为以下专色：",
        {multiline: true});
    infoText.preferredSize = [700, 20];

    // 映射列表
    var listPanel = dialog.add("panel", undefined, "颜色映射（从左到右）");
    listPanel.orientation = "column";
    listPanel.alignChildren = ["fill", "top"];
    listPanel.margins = 10;

    var listGroup = listPanel.add("group");
    listGroup.orientation = "column";
    listGroup.alignChildren = ["fill", "top"];
    listGroup.spacing = 2;

    // 只显示前20个（避免对话框过大）
    var displayCount = Math.min(colorMap.length, 20);

    for (var i = 0; i < displayCount; i++) {
        var map = colorMap[i];

        var itemGroup = listGroup.add("group");
        itemGroup.orientation = "row";
        itemGroup.alignChildren = ["left", "center"];
        itemGroup.spacing = 10;
        itemGroup.preferredSize = [700, 35];

        // 源颜色色块
        var sourceBox = itemGroup.add("group");
        sourceBox.preferredSize = [30, 30];
        sourceBox.graphics.backgroundColor = sourceBox.graphics.newBrush(
            sourceBox.graphics.BrushType.SOLID_COLOR,
            [map.sourceRGB.r / 255, map.sourceRGB.g / 255, map.sourceRGB.b / 255]
        );

        // 源颜色RGB
        var sourceText = itemGroup.add("statictext", undefined,
            "RGB(" + map.sourceRGB.r + "," + map.sourceRGB.g + "," + map.sourceRGB.b + ")");
        sourceText.preferredSize = [120, 20];

        // 箭头
        var arrow = itemGroup.add("statictext", undefined, "→");
        arrow.preferredSize = [20, 20];

        // 目标专色色块
        var targetBox = itemGroup.add("group");
        targetBox.preferredSize = [30, 30];
        targetBox.graphics.backgroundColor = targetBox.graphics.newBrush(
            targetBox.graphics.BrushType.SOLID_COLOR,
            [map.targetSpot.rgb[0] / 255, map.targetSpot.rgb[1] / 255, map.targetSpot.rgb[2] / 255]
        );

        // 专色信息
        var spotText = itemGroup.add("statictext", undefined,
            map.targetSpot.library + " " + map.targetSpot.code);
        spotText.preferredSize = [200, 20];

        // 相似度
        var simText = itemGroup.add("statictext", undefined, map.similarity + "%");
        simText.preferredSize = [50, 20];

        // 使用次数
        var countText = itemGroup.add("statictext", undefined, "(" + map.count + "个对象)");
        countText.preferredSize = [80, 20];
    }

    if (colorMap.length > 20) {
        var moreText = listPanel.add("statictext", undefined,
            "... 还有 " + (colorMap.length - 20) + " 种颜色未显示");
    }

    // 按钮组
    var buttonGroup = dialog.add("group");
    buttonGroup.orientation = "row";
    buttonGroup.alignChildren = ["center", "center"];

    var applyBtn = buttonGroup.add("button", undefined, "确定转换", {name: "ok"});
    var cancelBtn = buttonGroup.add("button", undefined, "取消", {name: "cancel"});

    return dialog.show() === 1;
}

// ============================================================
// 应用颜色映射
// ============================================================

/**
 * 应用颜色映射到文档
 * @param {Document} doc - 文档对象
 * @param {Array} colorMap - 颜色映射数组
 * @return {Object} 转换报告
 */
function applyColorMapping(doc, colorMap) {
    var report = {
        totalColors: colorMap.length,
        totalObjects: 0,
        spotsCreated: [],
        errors: []
    };

    for (var i = 0; i < colorMap.length; i++) {
        var map = colorMap[i];

        try {
            // 创建或查找专色
            var spot = findOrCreateSpot(doc, map.targetSpot);

            // 记录新创建的专色
            var isNew = true;
            for (var j = 0; j < report.spotsCreated.length; j++) {
                if (report.spotsCreated[j] === spot.name) {
                    isNew = false;
                    break;
                }
            }
            if (isNew) {
                report.spotsCreated.push(spot.name);
            }

            // 创建SpotColor对象
            var spotColor = new SpotColor();
            spotColor.spot = spot;
            spotColor.tint = 100;

            // 应用到所有使用该颜色的对象
            for (var j = 0; j < map.objects.length; j++) {
                var obj = map.objects[j];
                try {
                    if (obj.type === "fill" && obj.item.filled) {
                        obj.item.fillColor = spotColor;
                        report.totalObjects++;
                    } else if (obj.type === "stroke" && obj.item.stroked) {
                        obj.item.strokeColor = spotColor;
                        report.totalObjects++;
                    }
                } catch (e) {
                    report.errors.push("应用失败：" + e.message);
                }
            }

        } catch (e) {
            report.errors.push("创建专色失败：" + map.targetSpot.code + " - " + e.message);
        }
    }

    return report;
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
// 转换报告
// ============================================================

/**
 * 显示转换报告
 * @param {Object} report - 转换报告对象
 */
function showConversionReport(report) {
    var message = "━━━ 批量转换完成 ━━━\n\n";
    message += "转换了 " + report.totalColors + " 种颜色\n";
    message += "应用到 " + report.totalObjects + " 个对象\n";
    message += "创建了 " + report.spotsCreated.length + " 个专色色板\n\n";

    if (report.spotsCreated.length > 0) {
        message += "新增专色：\n";
        for (var i = 0; i < Math.min(report.spotsCreated.length, 10); i++) {
            message += "  • " + report.spotsCreated[i] + "\n";
        }
        if (report.spotsCreated.length > 10) {
            message += "  ... 还有 " + (report.spotsCreated.length - 10) + " 个\n";
        }
    }

    if (report.errors.length > 0) {
        message += "\n警告（" + report.errors.length + " 个）：\n";
        for (var i = 0; i < Math.min(report.errors.length, 5); i++) {
            message += "  • " + report.errors[i] + "\n";
        }
    }

    message += "\n━━━━━━━━━━━━━━━━\n";
    message += "所有专色已添加到色板面板。";

    alert(message);
}

// ============================================================
// 专色库加载（复用findNearestSpotColor.js中的代码）
// ============================================================

/**
 * 加载所有专色库JSON文件
 * @param {Array} selectedLibraries - 用户选择的色库数组
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
// 执行主函数
// ============================================================

main();
