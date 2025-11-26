#target illustrator

/**
 * 扩展外观脚本
 * 功能：扩展选中对象的外观（效果、描边等）
 */

// 检查是否有文档打开
if (app.documents.length === 0) {
    alert("请先打开一个文档!");
} else {
    var doc = app.activeDocument;
    if (doc.selection.length === 0) {
        alert("请先选择至少一个对象!");
    } else {
        expandAppearance();
    }
}

function expandAppearance() {
    try {
        // 使用Illustrator的扩展命令
        app.executeMenuCommand('expandStyle');
    } catch (e) {
        alert("扩展外观时出错: " + e);
    }
} 