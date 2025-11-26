// RepeatAfterMe.js - 重复排列
// 重复选中对象，支持行列排列和自定义间距

try {
    if (app.documents.length === 0) {
        alert("请先打开一个文档");
    } else if (app.activeDocument.selection.length === 0) {
        alert("请先选择要重复的对象");
    } else {
        var doc = app.activeDocument;
        var sel = doc.selection;

        // 弹出对话框获取参数
        var dialog = new Window("dialog", "重复排列");

        // 行数输入
        dialog.add("statictext", undefined, "行数:");
        var rowsInput = dialog.add("edittext", undefined, "3");
        rowsInput.characters = 10;

        // 列数输入
        dialog.add("statictext", undefined, "列数:");
        var colsInput = dialog.add("edittext", undefined, "3");
        colsInput.characters = 10;

        // 水平间距
        dialog.add("statictext", undefined, "水平间距 (pt):");
        var hSpaceInput = dialog.add("edittext", undefined, "10");
        hSpaceInput.characters = 10;

        // 垂直间距
        dialog.add("statictext", undefined, "垂直间距 (pt):");
        var vSpaceInput = dialog.add("edittext", undefined, "10");
        vSpaceInput.characters = 10;

        // 按钮组
        var buttonGroup = dialog.add("group");
        buttonGroup.add("button", undefined, "确定", {name: "ok"});
        buttonGroup.add("button", undefined, "取消", {name: "cancel"});

        if (dialog.show() == 1) {
            var rows = parseInt(rowsInput.text);
            var cols = parseInt(colsInput.text);
            var hSpace = parseFloat(hSpaceInput.text);
            var vSpace = parseFloat(vSpaceInput.text);

            if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
                alert("请输入有效的行列数");
            } else {
                // 获取原始对象的边界
                var bounds = sel[0].geometricBounds;
                var itemWidth = bounds[2] - bounds[0];
                var itemHeight = bounds[1] - bounds[3];

                // 开始重复
                var count = 0;
                for (var row = 0; row < rows; row++) {
                    for (var col = 0; col < cols; col++) {
                        if (row == 0 && col == 0) continue; // 跳过原始对象

                        var duplicate = sel[0].duplicate();
                        var offsetX = col * (itemWidth + hSpace);
                        var offsetY = -row * (itemHeight + vSpace);
                        duplicate.translate(offsetX, offsetY);
                        count++;
                    }
                }

                alert("重复完成！创建了 " + count + " 个副本");
            }
        }
    }
} catch (e) {
    alert("重复排列时出错: " + e.message);
}
