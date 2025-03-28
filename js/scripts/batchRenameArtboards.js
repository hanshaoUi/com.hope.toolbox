#target illustrator

/**
 * 批量重命名画板脚本
 * 功能：通过GUI弹窗设置画板名称、前缀、后缀、画板尺寸比例等
 */

// 检查是否有文档打开
if (app.documents.length === 0) {
    alert("请先打开一个文档!");
} else {
    var doc = app.activeDocument;
    var artboards = doc.artboards;
    
    // 如果没有画板则提示
    if (artboards.length === 0) {
        alert("当前文档没有画板!");
    } else {
        displayDialog();
    }
}

function displayDialog() {
    // 创建对话框
    var dialog = new Window("dialog", "批量重命名画板");
    dialog.orientation = "column";
    dialog.alignChildren = "fill";
    
    // 添加基本设置面板
    var basicPanel = dialog.add("panel", undefined, "基本设置");
    basicPanel.orientation = "column";
    basicPanel.alignChildren = "left";
    basicPanel.margins = 15;
    
    // 基本命名设置
    var nameGroup = basicPanel.add("group");
    nameGroup.orientation = "row";
    nameGroup.add("statictext", undefined, "画板名称模式:");
    var namePattern = nameGroup.add("edittext", undefined, "画板#");
    namePattern.characters = 20;
    namePattern.helpTip = "使用 # 作为数字占位符，例如 '画板#' 会生成 '画板1', '画板2'...";
    
    var prefixGroup = basicPanel.add("group");
    prefixGroup.orientation = "row";
    prefixGroup.add("statictext", undefined, "前缀:");
    var prefixText = prefixGroup.add("edittext", undefined, "");
    prefixText.characters = 20;
    
    var suffixGroup = basicPanel.add("group");
    suffixGroup.orientation = "row";
    suffixGroup.add("statictext", undefined, "后缀:");
    var suffixText = suffixGroup.add("edittext", undefined, "");
    suffixText.characters = 20;
    
    var startNumGroup = basicPanel.add("group");
    startNumGroup.orientation = "row";
    startNumGroup.add("statictext", undefined, "起始编号:");
    var startNumber = startNumGroup.add("edittext", undefined, "1");
    startNumber.characters = 5;
    
    var paddingGroup = basicPanel.add("group");
    paddingGroup.orientation = "row";
    paddingGroup.add("statictext", undefined, "数字位数:");
    var padding = paddingGroup.add("edittext", undefined, "1");
    padding.characters = 5;
    padding.helpTip = "例如: 值为2时，编号会显示为01, 02...";
    
    // 尺寸设置面板
    var sizePanel = dialog.add("panel", undefined, "尺寸设置");
    sizePanel.orientation = "column";
    sizePanel.alignChildren = "left";
    sizePanel.margins = 15;
    
    // 创建包含尺寸的复选框
    var includeSizeCheck = sizePanel.add("checkbox", undefined, "包含画板尺寸");
    includeSizeCheck.value = true;
    
    // 创建尺寸比例设置
    var scaleGroup = sizePanel.add("group");
    scaleGroup.orientation = "row";
    scaleGroup.add("statictext", undefined, "尺寸比例:");
    var scaleValue = scaleGroup.add("edittext", undefined, "1");
    scaleValue.characters = 5;
    scaleGroup.add("statictext", undefined, "(例: 0.5表示一半大小)");
    
    // 尺寸显示格式选项
    var formatGroup = sizePanel.add("group");
    formatGroup.orientation = "row";
    formatGroup.add("statictext", undefined, "尺寸格式:");
    var sizeFormat = formatGroup.add("dropdownlist", undefined, ["宽x高", "宽 x 高", "宽×高", "[宽x高]", "(宽x高)"]);
    sizeFormat.selection = 0;
    
    var unitGroup = sizePanel.add("group");
    unitGroup.orientation = "row";
    unitGroup.add("statictext", undefined, "显示单位:");
    var unitDropdown = unitGroup.add("dropdownlist", undefined, ["无", "像素", "毫米", "厘米", "英寸"]);
    unitDropdown.selection = 2;
    
    // 尺寸显示位置选项
    var positionGroup = sizePanel.add("group");
    positionGroup.orientation = "row";
    positionGroup.add("statictext", undefined, "尺寸位置:");
    var positionDropdown = positionGroup.add("dropdownlist", undefined, ["前缀后", "后缀前", "后缀后"]);
    positionDropdown.selection = 1;
    
    // 示例预览
    var previewPanel = dialog.add("panel", undefined, "命名预览");
    previewPanel.orientation = "column";
    previewPanel.alignChildren = "center";
    previewPanel.margins = 15;
    
    var previewText = previewPanel.add("statictext", undefined, "画板1 (800x600)");
    previewText.characters = 40;
    
    // 实时更新预览
    function updatePreview() {
        var preview = "";
        
        // 添加前缀
        if (prefixText.text) {
            preview += prefixText.text;
        }
        
        // 添加名称模式
        var pattern = namePattern.text.replace("#", pad(1, parseInt(padding.text)));
        preview += pattern;
        
        // 获取示例尺寸 - 使用A4纸张尺寸(595.28x841.89 points = 210x297 mm)
        var width = 595.28;
        var height = 841.89;
        
        // 转换为合适的单位
        var displayWidth = width;
        var displayHeight = height;
        
        // 如果指定了单位，转换坐标点为对应单位
        if (unitDropdown.selection.index > 0) {
            var conversion = getPointsToUnitConversion(unitDropdown.selection.index);
            displayWidth = formatDimension(width * conversion);
            displayHeight = formatDimension(height * conversion);
        } else {
            // 如果没有指定单位，显示点值
            displayWidth = Math.round(width);
            displayHeight = Math.round(height);
        }
        
        // 应用比例
        if (parseFloat(scaleValue.text) > 0) {
            displayWidth = formatDimension(displayWidth * parseFloat(scaleValue.text));
            displayHeight = formatDimension(displayHeight * parseFloat(scaleValue.text));
        }
        
        // 格式化尺寸文本
        var formatStr = sizeFormat.selection.text;
        var sizeText = "";
        
        // 根据选择的格式创建尺寸文本
        if (formatStr === "宽x高") {
            sizeText = displayWidth + "x" + displayHeight;
        } else if (formatStr === "宽 x 高") {
            sizeText = displayWidth + " x " + displayHeight;
        } else if (formatStr === "宽×高") {
            sizeText = displayWidth + "×" + displayHeight;
        } else if (formatStr === "[宽x高]") {
            sizeText = "[" + displayWidth + "x" + displayHeight + "]";
        } else if (formatStr === "(宽x高)") {
            sizeText = "(" + displayWidth + "x" + displayHeight + ")";
        } else {
            sizeText = displayWidth + "x" + displayHeight;
        }
        
        // 添加单位
        if (unitDropdown.selection.index > 0) {
            var units = ["", "px", "mm", "cm", "in"];
            sizeText += units[unitDropdown.selection.index];
        }
        
        // 根据位置设置添加尺寸
        if (includeSizeCheck.value) {
            if (positionDropdown.selection.index === 0) {
                // 前缀后
                preview = preview + " " + sizeText;
            } else if (positionDropdown.selection.index === 2) {
                // 后缀后
                if (suffixText.text) {
                    preview += " " + suffixText.text + " " + sizeText;
                } else {
                    preview += " " + sizeText;
                }
            } else {
                // 后缀前
                preview += " " + sizeText;
                if (suffixText.text) {
                    preview += " " + suffixText.text;
                }
            }
        } else {
            // 不包含尺寸，只添加后缀
            if (suffixText.text) {
                preview += " " + suffixText.text;
            }
        }
        
        previewText.text = preview;
    }
    
    // 添加监听器以更新预览
    namePattern.onChanging = updatePreview;
    prefixText.onChanging = updatePreview;
    suffixText.onChanging = updatePreview;
    startNumber.onChanging = updatePreview;
    padding.onChanging = updatePreview;
    includeSizeCheck.onClick = updatePreview;
    scaleValue.onChanging = updatePreview;
    sizeFormat.onChange = updatePreview;
    unitDropdown.onChange = updatePreview;
    positionDropdown.onChange = updatePreview;
    
    // 初始化预览
    updatePreview();
    
    // 按钮面板
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    
    var applyBtn = buttonGroup.add("button", undefined, "应用", {name: "ok"});
    var cancelBtn = buttonGroup.add("button", undefined, "取消", {name: "cancel"});
    
    // 显示对话框
    if (dialog.show() == 1) {
        renameArtboards(
            namePattern.text,
            prefixText.text,
            suffixText.text,
            parseInt(startNumber.text),
            parseInt(padding.text),
            includeSizeCheck.value,
            parseFloat(scaleValue.text),
            sizeFormat.selection.text,
            unitDropdown.selection.index,
            positionDropdown.selection.index
        );
    }
}

// 数字补零函数
function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

// 重命名画板函数
function renameArtboards(namePattern, prefix, suffix, startNum, padLength, includeSize, scaleValue, sizeFormat, unitIndex, positionIndex) {
    var doc = app.activeDocument;
    var artboards = doc.artboards;
    
    var units = ["", "px", "mm", "cm", "in"];
    var unitSuffix = units[unitIndex];
    
    // 开始重命名
    for (var i = 0; i < artboards.length; i++) {
        var ab = artboards[i];
        var newName = "";
        
        // 添加前缀
        if (prefix) {
            newName += prefix;
        }
        
        // 添加名称模式
        var num = startNum + i;
        var pattern = namePattern.replace("#", pad(num, padLength));
        newName += pattern;
        
        // 获取画板尺寸 - Illustrator中的画板坐标是[左, 上, 右, 下]（以点为单位）
        var rect = ab.artboardRect;
        var width = Math.abs(rect[2] - rect[0]);
        var height = Math.abs(rect[1] - rect[3]);
        
        // 转换为合适的单位 - Illustrator内部总是使用点作为单位
        var displayWidth = width;
        var displayHeight = height;
        
        // 转换点到目标单位
        if (unitIndex > 0) {
            var conversion = getPointsToUnitConversion(unitIndex);
            displayWidth = formatDimension(width * conversion);
            displayHeight = formatDimension(height * conversion);
        }
        
        // 应用比例
        if (scaleValue > 0) {
            displayWidth = formatDimension(displayWidth * scaleValue);
            displayHeight = formatDimension(displayHeight * scaleValue);
        }
        
        // 格式化尺寸文本
        var sizeText = "";
        
        // 根据选择的格式创建尺寸文本
        if (sizeFormat === "宽x高") {
            sizeText = displayWidth + "x" + displayHeight;
        } else if (sizeFormat === "宽 x 高") {
            sizeText = displayWidth + " x " + displayHeight;
        } else if (sizeFormat === "宽×高") {
            sizeText = displayWidth + "×" + displayHeight;
        } else if (sizeFormat === "[宽x高]") {
            sizeText = "[" + displayWidth + "x" + displayHeight + "]";
        } else if (sizeFormat === "(宽x高)") {
            sizeText = "(" + displayWidth + "x" + displayHeight + ")";
        } else {
            sizeText = displayWidth + "x" + displayHeight;
        }
        
        // 添加单位
        if (unitIndex > 0) {
            sizeText += unitSuffix;
        }
        
        // 根据位置设置添加尺寸
        if (includeSize) {
            if (positionIndex === 0) {
                // 前缀后
                newName = newName + " " + sizeText;
            } else if (positionIndex === 2) {
                // 后缀后
                if (suffix) {
                    newName += " " + suffix + " " + sizeText;
                } else {
                    newName += " " + sizeText;
                }
            } else {
                // 后缀前
                newName += " " + sizeText;
                if (suffix) {
                    newName += " " + suffix;
                }
            }
        } else {
            // 不包含尺寸，只添加后缀
            if (suffix) {
                newName += " " + suffix;
            }
        }
        
        // 设置新名称
        ab.name = newName;
    }
    
    alert("已完成 " + artboards.length + " 个画板的重命名!");
}

// 获取从点到指定单位的转换因子
function getPointsToUnitConversion(targetUnitIndex) {
    switch (targetUnitIndex) {
        case 1: // 像素
            return 1; // 假设点和像素是1:1的关系
        case 2: // 毫米
            return 0.352778; // 1点 = 0.352778毫米 (25.4/72)
        case 3: // 厘米
            return 0.0352778; // 1点 = 0.0352778厘米 (2.54/72)
        case 4: // 英寸
            return 0.0138889; // 1点 = 0.0138889英寸 (1/72)
        default:
            return 1;
    }
}

// 获取预览的单位转换比例 - 从点到目标单位
function getPreviewUnitConversion(targetUnitIndex) {
    // 直接使用相同的点到单位的转换
    return getPointsToUnitConversion(targetUnitIndex);
}

// 格式化尺寸数值，保留最多2位小数（如果存在小数则保留）
function formatDimension(value) {
    // 如果是整数或者接近整数，则返回整数
    if (Math.abs(value - Math.round(value)) < 0.01) {
        return Math.round(value);
    } else {
        // 否则保留2位小数
        return parseFloat(value.toFixed(2));
    }
} 