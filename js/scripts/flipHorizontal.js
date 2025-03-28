#target illustrator

/**
 * 水平翻转脚本
 * 功能：水平翻转选中的对象
 */

// 检查是否有文档打开
if (app.documents.length === 0) {
    alert("请先打开一个文档!");
} else {
    var doc = app.activeDocument;
    if (doc.selection.length === 0) {
        alert("请先选择至少一个对象!");
    } else {
        flipHorizontal();
    }
}

function flipHorizontal() {
    try {
        // 获取选中的对象
        var selection = app.activeDocument.selection;
        
        // 遍历所有选中的对象
        for (var i = 0; i < selection.length; i++) {
            var obj = selection[i];
            
            // 使用resize方法实现水平翻转
            // 参数说明：水平比例-100%，垂直比例100%，从中心点变换
            obj.resize(-100, 100, true, true, true, true, 100);
        }
    } catch (e) {
        alert("水平翻转对象时出错: " + e);
    }
} 