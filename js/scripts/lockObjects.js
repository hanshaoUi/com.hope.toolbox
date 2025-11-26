#target illustrator

/**
 * 锁定对象脚本
 * 功能：锁定选中的对象
 */

// 检查是否有文档打开
if (app.documents.length === 0) {
    alert("请先打开一个文档!");
} else {
    var doc = app.activeDocument;
    if (doc.selection.length === 0) {
        alert("请先选择至少一个对象!");
    } else {
        lockSelectedObjects();
    }
}

function lockSelectedObjects() {
    try {
        var selection = app.activeDocument.selection;
        var count = selection.length;
        
        for (var i = count - 1; i >= 0; i--) {
            if (selection[i].locked === false) {
                selection[i].locked = true;
            }
        }
    } catch (e) {
        alert("锁定对象时出错: " + e);
    }
} 