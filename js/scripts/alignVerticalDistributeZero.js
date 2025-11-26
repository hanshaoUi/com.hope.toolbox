//@target illustrator

/**
 * 对齐关键对象，垂直平均分布，间距0
 * 功能：将选中对象垂直平均分布并对齐到关键对象，间距为0
 */

(function() {
    // 检查是否有文档打开
    if (app.documents.length === 0) {
        return;
    }

    var doc = app.activeDocument;
    
    // 检查是否有选中的对象
    if (doc.selection.length < 2) {
        return;
    }

    try {
        // 获取选中对象
        var selectedItems = [];
        for (var i = 0; i < doc.selection.length; i++) {
            selectedItems.push(doc.selection[i]);
        }
        
        // 最后选中的对象作为关键对象
        var keyObject = selectedItems[selectedItems.length - 1];
        
        // 按照垂直位置排序(从上到下，在Illustrator中y坐标值越小表示位置越高)
        selectedItems.sort(function(a, b) {
            return a.geometricBounds[1] - b.geometricBounds[1]; // 比较top值
        });
        
        // 关键对象的水平位置
        var keyX = keyObject.position[0];
        
        // 计算所有对象的总高度
        var totalHeight = 0;
        for (var i = 0; i < selectedItems.length; i++) {
            var bounds = selectedItems[i].geometricBounds;
            var height = bounds[1] - bounds[3]; // top - bottom
            totalHeight += height;
        }
        
        // 起始Y坐标（使总体居中于关键对象）
        var keyObjBounds = keyObject.geometricBounds;
        var keyObjCenter = (keyObjBounds[1] + keyObjBounds[3]) / 2;
        var startY = keyObjCenter + (totalHeight / 2); // 注意：在AI中，Y坐标向下增长
        
        // 依次排列对象，间距为0
        var currentY = startY;
        for (var i = 0; i < selectedItems.length; i++) {
            var item = selectedItems[i];
            var bounds = item.geometricBounds;
            var width = bounds[2] - bounds[0]; // right - left
            var height = bounds[1] - bounds[3]; // top - bottom
            
            // 计算新位置 (将对象的顶部与currentY对齐)
            var newX = keyX;
            var newY = currentY;
            
            // 移动到新位置
            var currentPosition = item.position;
            var deltaX = newX - currentPosition[0]; // 需要移动的X距离
            var deltaY = newY - bounds[1]; // 需要移动的Y距离，与顶部对齐
            
            item.translate(deltaX, deltaY);
            
            // 更新当前Y位置 (向下移动)
            currentY -= height;
        }
        
    } catch(e) {
        // 静默处理错误
    }
})(); 