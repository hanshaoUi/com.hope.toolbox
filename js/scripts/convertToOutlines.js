#target illustrator

/**
 * 一键转曲脚本
 * 功能：将选中的文本对象或其他对象转换为轮廓
 */

// 检查是否有文档打开
if (app.documents.length === 0) {
    alert("请先打开一个文档!");
} else {
    var doc = app.activeDocument;
    if (doc.selection.length === 0) {
        // 如果没有选择对象，自动选择所有对象
        app.executeMenuCommand('selectall');
    }
    // 无论如何都执行转曲操作
    convertToOutlines();
}

function convertToOutlines() {
    try {
        // 计数器
        var convertedTextCount = 0;
        var convertedEffectCount = 0;
        
        // 遍历所有选中的对象
        for (var i = 0; i < app.activeDocument.selection.length; i++) {
            var obj = app.activeDocument.selection[i];
            
            // 检查对象类型并转换
            if (obj.typename === "TextFrame") {
                // 转换文本对象为轮廓
                obj.createOutline();
                convertedTextCount++;
            } else {
                // 对于其他对象，尝试扩展外观（效果、描边等）
                try {
                    // 选择当前对象
                    app.activeDocument.selection = [obj];
                    // 执行"扩展外观"命令
                    app.executeMenuCommand('expandStyle');
                    convertedEffectCount++;
                } catch (innerError) {
                    // 如果扩展外观失败，可能对象没有效果或不需要扩展
                    // 忽略这个错误并继续
                }
            }
        }
    } catch (e) {
        alert("转曲时出错: " + e);
    }
} 