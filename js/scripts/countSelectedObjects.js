#target illustrator

// 统计选中对象数量
function countSelectedObjects() {
    if (app.documents.length === 0) {
        alert("请先打开一个文档。");
        return;
    }

    var doc = app.activeDocument;
    var selectedItems = doc.selection;

    if (selectedItems.length === 0) {
        alert("没有选中任何对象。");
    } else {
        alert("选中的对象中有 " + selectedItems.length + " 个对象。");
    }
}

countSelectedObjects();