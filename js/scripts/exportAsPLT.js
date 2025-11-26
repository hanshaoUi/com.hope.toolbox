// exportAsPLT.js - 导出为 PLT (HPGL) 格式
// 将路径转换为 HPGL 绘图仪格式，贝塞尔曲线转换为直线段

function getAllPaths(doc) {
    // 直接使用 doc.pathItems，它已经包含所有路径（包括组内、复合路径内的）
    var allPaths = [];

    // 使用一个对象来跟踪已添加的路径，避免重复
    var added = {};

    for (var i = 0; i < doc.pathItems.length; i++) {
        var path = doc.pathItems[i];

        // 使用路径的唯一标识符（如果有的话）
        // 如果没有UUID，就用对象本身的引用
        var pathId = i; // 使用索引作为简单的标识

        // 检查是否已经添加过
        if (!added[pathId]) {
            allPaths.push(path);
            added[pathId] = true;
        }
    }

    return allPaths;
}

// 计算三次贝塞尔曲线上的点
function bezierPoint(t, p0, p1, p2, p3) {
    var t2 = t * t;
    var t3 = t2 * t;
    var mt = 1 - t;
    var mt2 = mt * mt;
    var mt3 = mt2 * mt;

    return [
        mt3 * p0[0] + 3 * mt2 * t * p1[0] + 3 * mt * t2 * p2[0] + t3 * p3[0],
        mt3 * p0[1] + 3 * mt2 * t * p1[1] + 3 * mt * t2 * p2[1] + t3 * p3[1]
    ];
}

// 计算点到线段的距离
function pointToLineDistance(point, lineStart, lineEnd) {
    var px = point[0], py = point[1];
    var x1 = lineStart[0], y1 = lineStart[1];
    var x2 = lineEnd[0], y2 = lineEnd[1];

    var A = px - x1;
    var B = py - y1;
    var C = x2 - x1;
    var D = y2 - y1;

    var dot = A * C + B * D;
    var lenSq = C * C + D * D;

    if (lenSq == 0) return Math.sqrt(A * A + B * B);

    var param = dot / lenSq;

    var xx, yy;
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    var dx = px - xx;
    var dy = py - yy;

    return Math.sqrt(dx * dx + dy * dy);
}

// 自适应细分贝塞尔曲线（递归）
function adaptiveSubdivide(p0, p1, p2, p3, tolerance, result, depth) {
    // 防止递归过深（最多30层，支持更精细的细分）
    if (depth > 30) {
        result.push(p3);
        return;
    }

    // 计算曲线中点（t=0.5）
    var mid = bezierPoint(0.5, p0, p1, p2, p3);

    // 计算中点到直线P0-P3的距离
    var dist = pointToLineDistance(mid, p0, p3);

    // 如果距离小于容差，用直线代替
    if (dist <= tolerance) {
        result.push(p3);
    } else {
        // 使用 De Casteljau 算法精确分割贝塞尔曲线
        var p01 = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
        var p12 = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
        var p23 = [(p2[0] + p3[0]) / 2, (p2[1] + p3[1]) / 2];

        var p012 = [(p01[0] + p12[0]) / 2, (p01[1] + p12[1]) / 2];
        var p123 = [(p12[0] + p23[0]) / 2, (p12[1] + p23[1]) / 2];

        var p0123 = [(p012[0] + p123[0]) / 2, (p012[1] + p123[1]) / 2];

        // 递归处理左半段和右半段
        adaptiveSubdivide(p0, p01, p012, p0123, tolerance, result, depth + 1);
        adaptiveSubdivide(p0123, p123, p23, p3, tolerance, result, depth + 1);
    }
}

function exportToPLT() {
    if (app.documents.length === 0) {
        alert("请先打开一个文档");
        return;
    }

    var doc = app.activeDocument;

    if (!doc.saved) {
        alert("请先保存文档！");
        return;
    }

    // 直接获取所有路径（不递归，避免重复）
    var allPaths = [];
    for (var i = 0; i < doc.pathItems.length; i++) {
        allPaths.push(doc.pathItems[i]);
    }

    if (allPaths.length === 0) {
        alert("没有找到路径对象！\n\n提示：\n1. 如果有文字，请按 O 键转曲\n2. 确保文档中有矢量图形");
        return;
    }

    // 弹出对话框
    var dialog = new Window("dialog", "导出 PLT 设置");
    dialog.alignChildren = "fill";

    var statsPanel = dialog.add("panel", undefined, "文档统计");
    statsPanel.alignChildren = "left";
    statsPanel.add("statictext", undefined, "总路径数: " + allPaths.length);
    if (doc.textFrames.length > 0) {
        statsPanel.add("statictext", undefined, "文本对象: " + doc.textFrames.length + " (需转曲)");
    }

    // 获取文档单位
    var docUnit = "pt";
    var unitName = "点";
    var ptToMM = 0.3528; // 1点 = 0.3528mm
    var pluToMM = 0.025; // 1 HPGL单位 = 0.025mm

    switch (doc.rulerUnits) {
        case RulerUnits.Millimeters:
            docUnit = "mm";
            unitName = "毫米";
            break;
        case RulerUnits.Centimeters:
            docUnit = "cm";
            unitName = "厘米";
            break;
        case RulerUnits.Inches:
            docUnit = "in";
            unitName = "英寸";
            break;
        case RulerUnits.Points:
            docUnit = "pt";
            unitName = "点";
            break;
    }

    // 计算推荐比例（让文档尺寸 = 输出尺寸）
    var recommendedScale = 40; // 默认
    if (docUnit === "mm") {
        // 1mm 在AI中 = 1/0.3528 点，要输出1mm需要 1/0.025 plu
        // scale = (1/0.025) / (1/0.3528) = 0.3528/0.025 ≈ 14.1
        recommendedScale = Math.round(ptToMM / pluToMM * 10) / 10; // ≈ 14.1
    } else if (docUnit === "cm") {
        recommendedScale = Math.round(ptToMM * 10 / pluToMM * 10) / 10; // cm转mm
    } else if (docUnit === "in") {
        recommendedScale = Math.round(25.4 / 72 / pluToMM * 10) / 10; // 英寸转mm
    }

    var scalePanel = dialog.add("panel", undefined, "导出设置");

    // 显示文档单位
    var unitInfo = scalePanel.add("group");
    unitInfo.add("statictext", undefined, "文档单位: " + unitName);

    // 输出比例选择
    var ratioGroup = scalePanel.add("group");
    ratioGroup.add("statictext", undefined, "输出比例:");
    var ratioDropdown = ratioGroup.add("dropdownlist", undefined, ["1:1 (原尺寸)", "1:2 (放大2倍)", "2:1 (缩小到1/2)", "1:10 (放大10倍)", "自定义"]);
    ratioDropdown.selection = 0; // 默认 1:1

    // 自定义比例输入
    var customGroup = scalePanel.add("group");
    customGroup.add("statictext", undefined, "自定义比例:");
    var customInput = customGroup.add("edittext", undefined, "1:1");
    customInput.characters = 8;
    customGroup.enabled = false; // 默认禁用

    // 监听下拉框变化
    ratioDropdown.onChange = function() {
        if (ratioDropdown.selection.index === 4) {
            // 选择了自定义
            customGroup.enabled = true;
        } else {
            customGroup.enabled = false;
        }
    };

    var flipGroup = scalePanel.add("group");
    var flipYCheckbox = flipGroup.add("checkbox", undefined, "翻转Y轴");
    flipYCheckbox.value = false;

    var qualityPanel = dialog.add("panel", undefined, "曲线质量");
    var qualityGroup = qualityPanel.add("group");
    qualityGroup.add("statictext", undefined, "曲线精度:");
    var toleranceDropdown = qualityGroup.add("dropdownlist", undefined, [
        "超精细（0.01 - 最平滑，文件巨大）",
        "极精细（0.02 - 非常平滑）",
        "极高（0.05 - 很平滑）",
        "高（0.1 - 推荐）",
        "中等（0.2 - 平衡）",
        "低（0.5 - 文件小）"
    ]);
    toleranceDropdown.selection = 3; // 默认选择"高"
    qualityPanel.add("statictext", undefined, "（精度越高曲线越平滑，但文件越大）");

    var info = dialog.add("panel", undefined, "说明");
    info.alignChildren = "left";
    info.add("statictext", undefined, "• 1:1 = 源文件多大，输出就多大");
    info.add("statictext", undefined, "• 1:2 = 放大2倍，1:10 = 放大10倍");
    info.add("statictext", undefined, "• 2:1 = 缩小到一半");
    info.add("statictext", undefined, "• 曲线精度：自动智能细分，质量更高");

    var buttons = dialog.add("group");
    buttons.add("button", undefined, "导出", {name: "ok"});
    buttons.add("button", undefined, "取消", {name: "cancel"});

    if (dialog.show() != 1) {
        return;
    }

    // 解析用户选择的比例
    var userRatio = "1:1";
    if (ratioDropdown.selection.index === 4) {
        // 自定义
        userRatio = customInput.text;
    } else {
        // 预设
        var presets = ["1:1", "1:2", "2:1", "1:10"];
        userRatio = presets[ratioDropdown.selection.index];
    }

    // 解析比例字符串 "a:b"
    var ratioParts = userRatio.split(":");
    if (ratioParts.length !== 2) {
        alert("比例格式错误！\n请输入格式如: 1:1 或 1:2");
        return;
    }

    var ratioA = parseFloat(ratioParts[0]);
    var ratioB = parseFloat(ratioParts[1]);

    if (isNaN(ratioA) || isNaN(ratioB) || ratioA <= 0 || ratioB <= 0) {
        alert("比例格式错误！\n请输入有效的数字，如: 1:1 或 1:2");
        return;
    }

    // 计算实际缩放倍数
    var userScale = ratioB / ratioA;

    // 计算最终的 scale 值（考虑单位转换）
    var baseScale = recommendedScale; // 1:1 时的基准值
    var scale = baseScale * userScale;

    // 获取曲线精度（误差容限）
    var tolerances = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5];
    var tolerance = tolerances[toleranceDropdown.selection.index];

    var flipY = flipYCheckbox.value;

    var saveFile = File.saveDialog("保存 PLT 文件", "PLT files:*.plt");
    if (!saveFile) {
        return;
    }

    if (saveFile.name.indexOf(".plt") == -1) {
        saveFile = new File(saveFile.fullName + ".plt");
    }

    // 计算边界框
    var minX = Infinity, maxY = -Infinity;
    for (var idx = 0; idx < allPaths.length; idx++) {
        var p = allPaths[idx];
        if (p.hidden || !p.pathPoints || p.pathPoints.length == 0) continue;

        for (var pidx = 0; pidx < p.pathPoints.length; pidx++) {
            var px = p.pathPoints[pidx].anchor[0];
            var py = p.pathPoints[pidx].anchor[1];
            if (px < minX) minX = px;
            if (py > maxY) maxY = py;
        }
    }

    var offsetX = -minX;
    var offsetY = -maxY;

    // 坐标转换函数
    function transformCoord(x, y) {
        var newX = (x + offsetX) * scale;
        var newY = (y + offsetY) * scale;
        if (flipY) newY = -newY;
        return [Math.round(newX), Math.round(newY)];
    }

    // 检查点是否有曲线（控制手柄）
    function hasCurve(point) {
        var anchor = point.anchor;
        var left = point.leftDirection;
        var right = point.rightDirection;

        var leftSame = (Math.abs(left[0] - anchor[0]) < 0.01 && Math.abs(left[1] - anchor[1]) < 0.01);
        var rightSame = (Math.abs(right[0] - anchor[0]) < 0.01 && Math.abs(right[1] - anchor[1]) < 0.01);

        return !(leftSame && rightSame);
    }

    // 生成 HPGL
    var hpgl = [];
    hpgl.push("IN;");
    hpgl.push("SP1;");
    hpgl.push("PU;");

    var pathCount = 0;
    var pointCount = 0;
    var segmentCount = 0;

    for (var i = 0; i < allPaths.length; i++) {
        var path = allPaths[i];

        if (path.hidden) continue;
        if (!path.pathPoints || path.pathPoints.length == 0) continue;

        pathCount++;
        var points = path.pathPoints;
        pointCount += points.length;

        // 移动到起点
        var startCoords = transformCoord(points[0].anchor[0], points[0].anchor[1]);
        hpgl.push("PU" + startCoords[0] + "," + startCoords[1] + ";");

        // 绘制路径
        var coords = [];

        for (var j = 0; j < points.length; j++) {
            var currentPoint = points[j];
            var nextPoint = points[(j + 1) % points.length];

            // 如果是最后一个点且路径不闭合，跳过
            if (j === points.length - 1 && !path.closed) {
                break;
            }

            // 检查是否有曲线
            if (hasCurve(currentPoint) || hasCurve(nextPoint)) {
                // 有曲线，使用自适应细分
                var p0 = [currentPoint.anchor[0], currentPoint.anchor[1]];
                var p1 = [currentPoint.rightDirection[0], currentPoint.rightDirection[1]];
                var p2 = [nextPoint.leftDirection[0], nextPoint.leftDirection[1]];
                var p3 = [nextPoint.anchor[0], nextPoint.anchor[1]];

                // 自适应细分贝塞尔曲线
                var subdivPoints = [];
                adaptiveSubdivide(p0, p1, p2, p3, tolerance, subdivPoints, 0);

                // 转换坐标并添加到输出
                for (var s = 0; s < subdivPoints.length; s++) {
                    var tc = transformCoord(subdivPoints[s][0], subdivPoints[s][1]);
                    coords.push(tc[0] + "," + tc[1]);
                    segmentCount++;
                }
            } else {
                // 直线
                var endCoords = transformCoord(nextPoint.anchor[0], nextPoint.anchor[1]);
                coords.push(endCoords[0] + "," + endCoords[1]);
                segmentCount++;
            }
        }

        // 一次性输出所有坐标
        if (coords.length > 0) {
            hpgl.push("PD" + coords.join(",") + ";");
        }
        hpgl.push("PU;");
    }

    hpgl.push("PU0,0;");
    hpgl.push("SP0;");

    // 写入文件
    try {
        saveFile.encoding = "ASCII";
        saveFile.open("w");
        saveFile.write(hpgl.join("\n"));
        saveFile.close();

        var toleranceNames = ["超精细", "极精细", "极高", "高", "中等", "低"];
        var resultMsg = "PLT 导出成功！\n\n";
        resultMsg += "文件: " + saveFile.fsName + "\n";
        resultMsg += "大小: " + Math.round(hpgl.join("\n").length / 1024) + " KB\n\n";
        resultMsg += "导出路径数: " + pathCount + "\n";
        resultMsg += "原始锚点数: " + pointCount + "\n";
        resultMsg += "输出线段数: " + segmentCount + "\n";
        resultMsg += "平均细分: " + (segmentCount > 0 ? Math.round(segmentCount / pointCount * 10) / 10 : 0) + " 段/锚点\n";
        resultMsg += "曲线精度: " + toleranceNames[toleranceDropdown.selection.index] + " (误差 ≤" + tolerance + ")\n";
        resultMsg += "输出比例: " + userRatio + "\n";
        resultMsg += "Y轴翻转: " + (flipY ? "是" : "否");

        alert(resultMsg);
    } catch (e) {
        alert("文件写入失败！\n\n错误: " + e.message);
    }
}

try {
    exportToPLT();
} catch (e) {
    alert("导出出错:\n" + e.message + "\n行: " + e.line);
}
