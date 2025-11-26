#target illustrator

/**
 * 居中对齐脚本
 * 功能：将选中的对象在画板上居中对齐
 */

// 检查是否有文档打开
if (app.documents.length === 0) {
    alert("请先打开一个文档!");
} else {
    var doc = app.activeDocument;
    if (doc.selection.length === 0) {
        alert("请先选择至少一个对象!");
    } else {
        alignObjectsToCenter();
    }
}

function alignObjectsToCenter() {
    try {
        // 获取当前活动的文档和画板
        var doc = app.activeDocument;
        var activeArtboardIndex = doc.artboards.getActiveArtboardIndex();
        var artboard = doc.artboards[activeArtboardIndex];
        var artboardRect = artboard.artboardRect; // [left, top, right, bottom]
        
        // 计算画板中心点
        var artboardCenterX = (artboardRect[0] + artboardRect[2]) / 2;
        var artboardCenterY = (artboardRect[1] + artboardRect[3]) / 2;
        
        // 获取选中的对象
        var selection = doc.selection;
        
        // 遍历选择的对象进行居中对齐
        if (selection.length === 1) {
            // 只有一个对象时
            var selectedObj = selection[0];
            
            // 获取对象的边界
            var bounds = selectedObj.geometricBounds;
            
            // 计算对象中心点
            var objectCenterX = (bounds[0] + bounds[2]) / 2;
            var objectCenterY = (bounds[1] + bounds[3]) / 2;
            
            // 计算需要移动的距离
            var moveX = artboardCenterX - objectCenterX;
            var moveY = artboardCenterY - objectCenterY;
            
            // 移动对象
            selectedObj.translate(moveX, moveY);
        } else {
            // 多个对象，先进行分组然后居中
            // 创建临时分组
            app.executeMenuCommand('group');
            
            // 获取新创建的组
            var group = doc.selection[0];
            
            // 获取组的边界
            var groupBounds = group.geometricBounds;
            
            // 计算组中心点
            var groupCenterX = (groupBounds[0] + groupBounds[2]) / 2;
            var groupCenterY = (groupBounds[1] + groupBounds[3]) / 2;
            
            // 计算需要移动的距离
            var moveX = artboardCenterX - groupCenterX;
            var moveY = artboardCenterY - groupCenterY;
            
            // 移动组
            group.translate(moveX, moveY);
            
            // 取消分组
            app.executeMenuCommand('ungroup');
        }
    } catch (e) {
        alert("对齐对象时出错: " + e);
    }
} 