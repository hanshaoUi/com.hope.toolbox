#target illustrator

// 为画板添加矩形
function addRectangleToArtboard() {
    if (app.documents.length === 0) {
        alert("请先创建或打开一个文档。");
        return;
    }

    var docRef = app.activeDocument;
    var artboardRef = docRef.artboards;

    if (artboardRef.length === 0) {
        alert("当前文档没有画板。");
        return;
    }

    for (var i = 0; i < artboardRef.length; i++) {
        var top = artboardRef[i].artboardRect[1];
        var left = artboardRef[i].artboardRect[0];
        var width = artboardRef[i].artboardRect[2] - artboardRef[i].artboardRect[0];
        var height = artboardRef[i].artboardRect[1] - artboardRef[i].artboardRect[3];
        var rect = docRef.pathItems.rectangle(top, left, width, height);
    }
    alert("所有画板已添加矩形");
}

// 立即执行函数
addRectangleToArtboard();