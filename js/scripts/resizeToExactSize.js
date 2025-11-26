//@target illustrator

/**
 * 脚本名称：等比缩放到指定尺寸
 * 脚本功能：将选中对象等比缩放到精确的宽度、高度或比例
 * 作者：HOPE
 * 创建日期：2025-01-25
 * 版本：2.1.0
 *
 * 功能特点：
 * - 尺寸/比例二选一
 * - 按尺寸：可选择约束宽度或高度
 * - 按比例：直接输入百分比
 * - 支持单个或多个对象（整体缩放）
 * - 无多余弹窗，操作完直接结束
 *
 * 使用方法：
 * 1. 选中对象
 * 2. 运行脚本
 * 3. 选择缩放模式（尺寸/比例）
 * 4. 输入目标值
 * 5. 点击确定
 */

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
        alert("请先选择至少一个对象。");
        return;
    }

    var selection = doc.selection;

    try {
        // 3. 获取当前单位信息
        var unitInfo = getDocumentUnitInfo(doc);

        // 4. 获取选中对象的尺寸
        var currentSize = getSelectionSize(selection);
        var currentWidthUnit = pointsToUnit(currentSize.width, unitInfo);
        var currentHeightUnit = pointsToUnit(currentSize.height, unitInfo);

        // 5. 显示对话框
        var result = showResizeDialog(currentWidthUnit, currentHeightUnit, unitInfo);

        if (!result) {
            return; // 用户取消
        }

        // 6. 执行缩放
        performResize(selection, result.scale);

    } catch (e) {
        alert("操作失败：" + e.message + "\n\n行号：" + (e.line || "未知"));
    }
}

// ============================================================
// 单位相关函数
// ============================================================

/**
 * 获取文档单位信息
 * @param {Document} doc - 文档对象
 * @return {Object} {unit, label, factor} 单位对象
 */
function getDocumentUnitInfo(doc) {
    var unit = doc.rulerUnits;
    var factor = 1; // pt 为基准
    var label = "";

    switch (unit) {
        case RulerUnits.Millimeters:
            factor = 2.834645669; // 1mm = 2.834645669pt
            label = "mm";
            break;
        case RulerUnits.Centimeters:
            factor = 28.34645669; // 1cm = 28.34645669pt
            label = "cm";
            break;
        case RulerUnits.Inches:
            factor = 72; // 1inch = 72pt
            label = "in";
            break;
        case RulerUnits.Points:
            factor = 1;
            label = "pt";
            break;
        case RulerUnits.Picas:
            factor = 12; // 1pica = 12pt
            label = "pc";
            break;
        default:
            factor = 1;
            label = "pt";
    }

    return {
        unit: unit,
        label: label,
        factor: factor
    };
}

/**
 * 点转换为文档单位
 * @param {Number} points - 点数
 * @param {Object} unitInfo - 单位信息
 * @return {Number} 文档单位数值
 */
function pointsToUnit(points, unitInfo) {
    return points / unitInfo.factor;
}

// ============================================================
// 尺寸计算函数
// ============================================================

/**
 * 获取选中对象的尺寸
 * @param {Array} selection - 选中的对象数组
 * @return {Object} {width, height} 尺寸对象（单位：pt）
 */
function getSelectionSize(selection) {
    // 获取整体边界
    var bounds = getSelectionBounds(selection);

    var width = bounds[2] - bounds[0]; // right - left
    var height = bounds[1] - bounds[3]; // top - bottom

    return {
        width: width,
        height: height
    };
}

/**
 * 获取选中对象的边界框
 * @param {Array} selection - 选中的对象数组
 * @return {Array} [left, top, right, bottom]
 */
function getSelectionBounds(selection) {
    if (selection.length === 1) {
        return selection[0].geometricBounds;
    }

    // 多个对象时，计算整体边界
    var left = Infinity;
    var top = -Infinity;
    var right = -Infinity;
    var bottom = Infinity;

    for (var i = 0; i < selection.length; i++) {
        try {
            var bounds = selection[i].geometricBounds;
            if (bounds[0] < left) left = bounds[0];
            if (bounds[1] > top) top = bounds[1];
            if (bounds[2] > right) right = bounds[2];
            if (bounds[3] < bottom) bottom = bounds[3];
        } catch (e) {
            // 忽略无法获取边界的对象
        }
    }

    return [left, top, right, bottom];
}

// ============================================================
// 对话框UI
// ============================================================

/**
 * 显示缩放对话框
 * @param {Number} currentWidth - 当前宽度
 * @param {Number} currentHeight - 当前高度
 * @param {Object} unitInfo - 单位信息
 * @return {Object} {scale: Number} 或 null（取消）
 */
function showResizeDialog(currentWidth, currentHeight, unitInfo) {
    var dialog = new Window("dialog", "等比缩放");
    dialog.orientation = "column";
    dialog.alignChildren = ["fill", "top"];
    dialog.spacing = 15;
    dialog.margins = 20;

    // 当前尺寸显示
    var currentPanel = dialog.add("panel", undefined, "当前尺寸");
    currentPanel.orientation = "row";
    currentPanel.alignChildren = ["left", "center"];
    currentPanel.margins = 10;

    var sizeLabel = currentPanel.add("statictext", undefined,
        currentWidth.toFixed(2) + " × " + currentHeight.toFixed(2) + " " + unitInfo.label);
    sizeLabel.preferredSize = [200, 20];

    // 缩放模式选择
    var modePanel = dialog.add("panel", undefined, "缩放模式");
    modePanel.orientation = "column";
    modePanel.alignChildren = ["fill", "top"];
    modePanel.margins = 10;
    modePanel.spacing = 10;

    var modeGroup = modePanel.add("group");
    modeGroup.orientation = "row";
    modeGroup.alignChildren = ["left", "center"];
    modeGroup.spacing = 20;

    var sizeRadio = modeGroup.add("radiobutton", undefined, "按尺寸");
    var scaleRadio = modeGroup.add("radiobutton", undefined, "按比例");
    sizeRadio.value = true; // 默认按尺寸

    // === 按尺寸面板 ===
    var sizePanel = modePanel.add("panel", undefined, "");
    sizePanel.orientation = "column";
    sizePanel.alignChildren = ["fill", "top"];
    sizePanel.margins = 10;
    sizePanel.spacing = 8;

    // 约束维度
    var dimensionGroup = sizePanel.add("group");
    dimensionGroup.orientation = "row";
    dimensionGroup.alignChildren = ["left", "center"];
    dimensionGroup.spacing = 15;

    var widthRadio = dimensionGroup.add("radiobutton", undefined, "宽度");
    var heightRadio = dimensionGroup.add("radiobutton", undefined, "高度");
    widthRadio.value = true; // 默认约束宽度

    // 目标尺寸输入
    var sizeInputGroup = sizePanel.add("group");
    sizeInputGroup.orientation = "row";
    sizeInputGroup.alignChildren = ["left", "center"];
    sizeInputGroup.spacing = 10;

    var sizeInputLabel = sizeInputGroup.add("statictext", undefined, "目标值：");
    sizeInputLabel.preferredSize = [60, 20];

    var sizeInput = sizeInputGroup.add("edittext", undefined, currentWidth.toFixed(2));
    sizeInput.preferredSize = [100, 25];

    var sizeUnitLabel = sizeInputGroup.add("statictext", undefined, unitInfo.label);
    sizeUnitLabel.preferredSize = [30, 20];

    // === 按比例面板 ===
    var scalePanel = modePanel.add("panel", undefined, "");
    scalePanel.orientation = "column";
    scalePanel.alignChildren = ["fill", "top"];
    scalePanel.margins = 10;
    scalePanel.visible = false;

    var scaleInputGroup = scalePanel.add("group");
    scaleInputGroup.orientation = "row";
    scaleInputGroup.alignChildren = ["left", "center"];
    scaleInputGroup.spacing = 10;

    var scaleInputLabel = scaleInputGroup.add("statictext", undefined, "缩放比例：");
    scaleInputLabel.preferredSize = [80, 20];

    var scaleInput = scaleInputGroup.add("edittext", undefined, "100");
    scaleInput.preferredSize = [80, 25];

    var percentLabel = scaleInputGroup.add("statictext", undefined, "%");
    percentLabel.preferredSize = [20, 20];

    // 切换面板
    function updatePanelVisibility() {
        if (sizeRadio.value) {
            sizePanel.visible = true;
            scalePanel.visible = false;
            sizeInput.active = true;
        } else {
            sizePanel.visible = false;
            scalePanel.visible = true;
            scaleInput.active = true;
        }
    }

    sizeRadio.onClick = updatePanelVisibility;
    scaleRadio.onClick = updatePanelVisibility;

    // 宽度/高度切换时更新默认值
    widthRadio.onClick = function() {
        sizeInput.text = currentWidth.toFixed(2);
    };
    heightRadio.onClick = function() {
        sizeInput.text = currentHeight.toFixed(2);
    };

    // 按钮组
    var buttonGroup = dialog.add("group");
    buttonGroup.orientation = "row";
    buttonGroup.alignChildren = ["center", "center"];
    var okBtn = buttonGroup.add("button", undefined, "确定", {name: "ok"});
    var cancelBtn = buttonGroup.add("button", undefined, "取消", {name: "cancel"});

    // 显示对话框
    if (dialog.show() === 1) {
        var scale;

        if (sizeRadio.value) {
            // 按尺寸缩放
            var targetValue = parseFloat(sizeInput.text);

            if (isNaN(targetValue) || targetValue <= 0) {
                alert("请输入有效的目标尺寸。");
                return null;
            }

            if (widthRadio.value) {
                scale = targetValue / currentWidth;
            } else {
                scale = targetValue / currentHeight;
            }
        } else {
            // 按比例缩放
            var percent = parseFloat(scaleInput.text);

            if (isNaN(percent) || percent <= 0) {
                alert("请输入有效的缩放比例。");
                return null;
            }

            scale = percent / 100;
        }

        return {
            scale: scale
        };
    }

    return null;
}

// ============================================================
// 缩放执行函数
// ============================================================

/**
 * 执行缩放操作（整体缩放）
 * @param {Array} selection - 选中的对象数组
 * @param {Number} scale - 缩放比例
 */
function performResize(selection, scale) {
    var scalePercent = scale * 100;

    for (var i = 0; i < selection.length; i++) {
        try {
            selection[i].resize(scalePercent, scalePercent);
        } catch (e) {
            // 忽略无法缩放的对象
        }
    }

    app.redraw();
}

// ============================================================
// 执行主函数
// ============================================================

main();
