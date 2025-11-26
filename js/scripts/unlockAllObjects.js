#target illustrator

/**
 * 解锁所有对象脚本
 * 功能：解锁当前文档中所有已锁定的对象
 */

// 检查是否有文档打开
if (app.documents.length === 0) {
    alert("请先打开一个文档!");
} else {
    unlockAllObjects();
}

function unlockAllObjects() {
    try {
        var doc = app.activeDocument;
        var unlockCount = 0;
        
        // 解锁当前图层中的所有对象
        function unlockItemsInLayer(layer) {
            for (var i = 0; i < layer.pageItems.length; i++) {
                var item = layer.pageItems[i];
                if (item.locked) {
                    item.locked = false;
                    unlockCount++;
                }
            }
            
            // 递归处理子图层
            for (var j = 0; j < layer.layers.length; j++) {
                unlockItemsInLayer(layer.layers[j]);
            }
        }
        
        // 处理所有图层
        for (var k = 0; k < doc.layers.length; k++) {
            unlockItemsInLayer(doc.layers[k]);
        }
    } catch (e) {
        alert("解锁对象时出错: " + e);
    }
} 