//@target illustrator

/**
 * 脚本名称：导出专色清单
 * 脚本功能：扫描文档中使用的所有专色，生成专色清单文件
 * 作者：HOPE
 * 创建日期：2025-01-25
 * 版本：1.0.0
 *
 * 功能特点：
 * - 扫描文档中所有专色
 * - 统计每个专色的使用次数
 * - 导出详细的专色信息（色号、CMYK、RGB、HEX）
 * - 生成TXT格式清单
 * - 自动保存到文档同目录
 *
 * 使用方法：
 * 1. 打开包含专色的文档
 * 2. 运行脚本
 * 3. 选择保存位置
 * 4. 查看生成的专色清单
 *
 * 应用场景：
 * - 印刷厂报价（每个专色单独收费）
 * - 客户确认色卡
 * - 项目存档备查
 * - 专色使用统计
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

    try {
        // 2. 扫描文档中的专色
        var spotColorUsage = scanDocumentSpotColors(doc);

        if (spotColorUsage.length === 0) {
            alert("文档中未发现任何专色。\n\n提示：只有Spot Color类型的专色才会被统计。");
            return;
        }

        // 3. 生成清单文本
        var listContent = generateSpotColorList(doc, spotColorUsage);

        // 4. 保存文件
        var saved = saveSpotColorList(doc, listContent);

        if (saved) {
            // 5. 显示预览
            showPreview(listContent, saved);
        }

    } catch (e) {
        alert("操作失败：" + e.message + "\n\n行号：" + (e.line || "未知") + "\n文件：" + (e.fileName || "未知"));
    }
}

// ============================================================
// 专色扫描
// ============================================================

/**
 * 扫描文档中所有使用的专色
 * @param {Document} doc - 文档对象
 * @return {Array} 专色使用统计数组
 */
function scanDocumentSpotColors(doc) {
    var spotHash = {}; // key=spotName, value={spot, count, items}

    // 递归扫描所有图层
    function scanLayer(layer) {
        if (!layer.visible || layer.locked) {
            return;
        }

        for (var i = 0; i < layer.pageItems.length; i++) {
            var item = layer.pageItems[i];
            scanItem(item);
        }

        for (var i = 0; i < layer.layers.length; i++) {
            scanLayer(layer.layers[i]);
        }
    }

    // 扫描单个对象
    function scanItem(item) {
        if (item.locked || item.hidden) {
            return;
        }

        // 检查填充色
        if (item.filled && item.fillColor && item.fillColor.typename === "SpotColor") {
            recordSpotColor(item.fillColor.spot, "fill");
        }

        // 检查描边色
        if (item.stroked && item.strokeColor && item.strokeColor.typename === "SpotColor") {
            recordSpotColor(item.strokeColor.spot, "stroke");
        }

        // 递归处理组合对象
        if (item.typename === "GroupItem") {
            for (var i = 0; i < item.pageItems.length; i++) {
                scanItem(item.pageItems[i]);
            }
        }
    }

    // 记录专色使用
    function recordSpotColor(spot, type) {
        var spotName = spot.name;

        if (!spotHash[spotName]) {
            spotHash[spotName] = {
                spot: spot,
                count: 0,
                fillCount: 0,
                strokeCount: 0
            };
        }

        spotHash[spotName].count++;
        if (type === "fill") {
            spotHash[spotName].fillCount++;
        } else {
            spotHash[spotName].strokeCount++;
        }
    }

    // 扫描所有图层
    for (var i = 0; i < doc.layers.length; i++) {
        scanLayer(doc.layers[i]);
    }

    // 转换为数组并排序（按使用次数从多到少）
    var result = [];
    for (var spotName in spotHash) {
        if (spotHash.hasOwnProperty(spotName)) {
            result.push(spotHash[spotName]);
        }
    }

    result.sort(function(a, b) {
        return b.count - a.count;
    });

    return result;
}

// ============================================================
// 清单生成
// ============================================================

/**
 * 生成专色清单文本
 * @param {Document} doc - 文档对象
 * @param {Array} spotColorUsage - 专色使用统计
 * @return {String} 清单文本
 */
function generateSpotColorList(doc, spotColorUsage) {
    var text = "";
    var separator = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    // 标题
    text += separator;
    text += "              专色使用清单\n";
    text += separator;
    text += "\n";

    // 文档信息
    text += "文档名称：" + doc.name + "\n";
    text += "生成时间：" + getCurrentDateTime() + "\n";
    text += "专色总数：" + spotColorUsage.length + " 个\n";

    var totalUsage = 0;
    for (var i = 0; i < spotColorUsage.length; i++) {
        totalUsage += spotColorUsage[i].count;
    }
    text += "使用总次数：" + totalUsage + " 次\n";
    text += "\n";
    text += separator;
    text += "\n";

    // 专色详情
    for (var i = 0; i < spotColorUsage.length; i++) {
        var usage = spotColorUsage[i];
        var spot = usage.spot;

        text += (i + 1) + ". " + spot.name + "\n";
        text += "   " + "─".repeat(60) + "\n";

        // 颜色类型
        var colorType = spot.colorType === ColorModel.SPOT ? "专色 (Spot Color)" : "其他";
        text += "   类型：" + colorType + "\n";

        // CMYK值
        if (spot.color && spot.color.typename === "CMYKColor") {
            var c = Math.round(spot.color.cyan);
            var m = Math.round(spot.color.magenta);
            var y = Math.round(spot.color.yellow);
            var k = Math.round(spot.color.black);
            text += "   CMYK：C" + c + " M" + m + " Y" + y + " K" + k + "\n";

            // 转换为RGB（近似值）
            var rgb = cmykToRGB(c, m, y, k);
            text += "   RGB：R" + rgb.r + " G" + rgb.g + " B" + rgb.b + "\n";

            // 转换为HEX
            var hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            text += "   HEX：" + hex + "\n";
        }

        // 使用统计
        text += "   使用次数：" + usage.count + " 次";
        if (usage.fillCount > 0 || usage.strokeCount > 0) {
            text += " (填充:" + usage.fillCount + ", 描边:" + usage.strokeCount + ")";
        }
        text += "\n";

        text += "\n";
    }

    // 页脚
    text += separator;
    text += "\n";
    text += "说明：\n";
    text += "- 本清单仅统计 Spot Color（专色）类型的颜色\n";
    text += "- CMYK值为印刷用标准值\n";
    text += "- RGB和HEX值为显示用近似值\n";
    text += "- 使用次数统计了填充和描边的所有对象\n";
    text += "\n";
    text += separator;
    text += "\n";
    text += "生成工具：HOPE 工具箱 - 导出专色清单\n";
    text += "技术支持：https://github.com/hope-toolbox\n";
    text += "\n";

    return text;
}

/**
 * 获取当前日期时间
 * @return {String} 格式化的日期时间
 */
function getCurrentDateTime() {
    var now = new Date();
    var year = now.getFullYear();
    var month = padZero(now.getMonth() + 1);
    var day = padZero(now.getDate());
    var hour = padZero(now.getHours());
    var minute = padZero(now.getMinutes());
    var second = padZero(now.getSeconds());

    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}

/**
 * 补零
 * @param {Number} num - 数字
 * @return {String} 补零后的字符串
 */
function padZero(num) {
    return num < 10 ? "0" + num : "" + num;
}

/**
 * CMYK转RGB（简化算法）
 * @param {Number} c - Cyan (0-100)
 * @param {Number} m - Magenta (0-100)
 * @param {Number} y - Yellow (0-100)
 * @param {Number} k - Black (0-100)
 * @return {Object} RGB对象 {r, g, b}
 */
function cmykToRGB(c, m, y, k) {
    var cNorm = c / 100;
    var mNorm = m / 100;
    var yNorm = y / 100;
    var kNorm = k / 100;

    var r = Math.round(255 * (1 - cNorm) * (1 - kNorm));
    var g = Math.round(255 * (1 - mNorm) * (1 - kNorm));
    var b = Math.round(255 * (1 - yNorm) * (1 - kNorm));

    return { r: r, g: g, b: b };
}

/**
 * RGB转HEX
 * @param {Number} r - Red (0-255)
 * @param {Number} g - Green (0-255)
 * @param {Number} b - Blue (0-255)
 * @return {String} HEX颜色字符串
 */
function rgbToHex(r, g, b) {
    function toHex(num) {
        var hex = num.toString(16).toUpperCase();
        return hex.length === 1 ? "0" + hex : hex;
    }

    return "#" + toHex(r) + toHex(g) + toHex(b);
}

/**
 * 重复字符串
 * @param {Number} count - 重复次数
 * @return {String} 重复后的字符串
 */
String.prototype.repeat = String.prototype.repeat || function(count) {
    var result = "";
    for (var i = 0; i < count; i++) {
        result += this;
    }
    return result;
};

// ============================================================
// 文件保存
// ============================================================

/**
 * 保存专色清单到文件
 * @param {Document} doc - 文档对象
 * @param {String} content - 清单内容
 * @return {File} 保存的文件对象，或null
 */
function saveSpotColorList(doc, content) {
    // 默认文件名
    var docName = doc.name.replace(/\.ai$/i, "");
    var defaultFileName = docName + "_专色清单.txt";

    // 默认保存路径（文档同目录）
    var defaultPath = null;
    if (doc.saved && doc.path) {
        defaultPath = new File(doc.path + "/" + defaultFileName);
    } else {
        defaultPath = new File("~/" + defaultFileName);
    }

    // 显示保存对话框
    var saveFile = defaultPath.saveDlg("保存专色清单", "文本文件:*.txt");

    if (!saveFile) {
        return null; // 用户取消
    }

    // 确保文件扩展名为.txt
    if (!/\.txt$/i.test(saveFile.name)) {
        saveFile = new File(saveFile.fsName + ".txt");
    }

    // 写入文件
    try {
        saveFile.encoding = "UTF-8";
        saveFile.open("w");
        saveFile.write(content);
        saveFile.close();

        return saveFile;
    } catch (e) {
        alert("保存文件失败：" + e.message);
        return null;
    }
}

// ============================================================
// 预览对话框
// ============================================================

/**
 * 显示清单预览
 * @param {String} content - 清单内容
 * @param {File} savedFile - 保存的文件
 */
function showPreview(content, savedFile) {
    var dialog = new Window("dialog", "专色清单已导出");
    dialog.orientation = "column";
    dialog.alignChildren = ["fill", "top"];
    dialog.spacing = 10;
    dialog.margins = 15;

    // 成功提示
    var successPanel = dialog.add("panel", undefined, "✓ 导出成功");
    successPanel.orientation = "column";
    successPanel.alignChildren = ["fill", "top"];
    successPanel.margins = 10;

    var fileInfo = successPanel.add("statictext", undefined,
        "文件已保存至：\n" + savedFile.fsName,
        {multiline: true});
    fileInfo.preferredSize = [600, 40];

    // 预览面板
    var previewPanel = dialog.add("panel", undefined, "清单预览");
    previewPanel.orientation = "column";
    previewPanel.alignChildren = ["fill", "top"];
    previewPanel.margins = 10;

    // 限制预览内容（前1500个字符）
    var previewContent = content.length > 1500 ? content.substring(0, 1500) + "\n\n... (内容已截断，请查看完整文件)" : content;

    var previewText = previewPanel.add("edittext", undefined, previewContent, {
        multiline: true,
        readonly: true,
        scrolling: true
    });
    previewText.preferredSize = [600, 400];

    // 按钮组
    var buttonGroup = dialog.add("group");
    buttonGroup.orientation = "row";
    buttonGroup.alignChildren = ["center", "center"];

    var openBtn = buttonGroup.add("button", undefined, "打开文件所在文件夹");
    var closeBtn = buttonGroup.add("button", undefined, "关闭", {name: "ok"});

    // 打开文件夹按钮事件
    openBtn.onClick = function() {
        try {
            savedFile.parent.execute();
        } catch (e) {
            alert("无法打开文件夹：" + e.message);
        }
    };

    dialog.show();
}

// ============================================================
// 执行主函数
// ============================================================

main();
