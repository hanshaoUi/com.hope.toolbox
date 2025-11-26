#target illustrator

/**
 * 顺时针旋转90度脚本
 * 功能：将选中的对象顺时针旋转90度
 */

// 检查是否有文档打开
if (app.documents.length === 0) {
    alert("请先打开一个文档!");
} else {
    var doc = app.activeDocument;
    if (doc.selection.length === 0) {
        alert("请先选择至少一个对象!");
    } else {
        rotateObjects(90); // 顺时针旋转90度（正数表示顺时针）
    }
}

function rotateObjects(angle) {
    try {
        // 遍历所有选中的对象
        for (var i = 0; i < app.activeDocument.selection.length; i++) {
            var selectedObject = app.activeDocument.selection[i];
            
            // 获取对象的中心点
            var bounds = selectedObject.geometricBounds;
            var centerX = (bounds[0] + bounds[2]) / 2;
            var centerY = (bounds[1] + bounds[3]) / 2;
            
            // 使用对象的中心点作为旋转点进行旋转
            selectedObject.rotate(angle, true, true, true, true, Transformation.CENTER);
        }
    } catch (e) {
        alert("旋转对象时出错: " + e);
    }
} 