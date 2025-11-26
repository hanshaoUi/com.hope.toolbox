//@target illustrator

/**
 * 对齐关键对象，水平平均分布，间距0
 * 功能：将选中对象水平平均分布并对齐到关键对象，间距为0
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
        
        // 按照水平位置排序(从左到右)
        selectedItems.sort(function(a, b) {
            return a.geometricBounds[0] - b.geometricBounds[0];
        });
        
        // 关键对象的垂直位置
        var keyY = keyObject.position[1];
        
        // 计算所有对象的总宽度
        var totalWidth = 0;
        for (var i = 0; i < selectedItems.length; i++) {
            var bounds = selectedItems[i].geometricBounds;
            var width = bounds[2] - bounds[0]; // right - left
            totalWidth += width;
        }
        
        // 起始X坐标（使总体居中于关键对象）
        var keyObjBounds = keyObject.geometricBounds;
        var keyObjCenter = (keyObjBounds[0] + keyObjBounds[2]) / 2;
        var startX = keyObjCenter - (totalWidth / 2);
        
        // 依次排列对象，间距为0
        var currentX = startX;
        for (var i = 0; i < selectedItems.length; i++) {
            var item = selectedItems[i];
            var bounds = item.geometricBounds;
            var width = bounds[2] - bounds[0]; // right - left
            var height = bounds[1] - bounds[3]; // top - bottom (AI坐标系中y轴向下为正)
            
            // 计算新位置
            var newX = currentX;
            var newY = keyY;
            
            // 移动到新位置
            var currentPosition = item.position;
            var deltaX = newX - bounds[0]; // 需要移动的X距离
            var deltaY = newY - currentPosition[1]; // 需要移动的Y距离
            
            item.translate(deltaX, deltaY);
            
            // 更新当前X位置
            currentX += width;
        }
        
    } catch(e) {
        // 静默处理错误
    }
})(); 