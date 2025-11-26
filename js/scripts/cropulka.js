//@target illustrator
// cropulka.js - 裁剪工具
// 使用第一个选中对象作为裁剪路径，裁剪其他选中对象

try {
    if (app.documents.length === 0) {
        alert("请先打开一个文档。");
    } else if (app.activeDocument.selection.length < 2) {
        alert("请至少选择两个对象。\n提示：第一个选中的对象将作为裁剪路径。");
    } else {
        var doc = app.activeDocument;
        var sel = doc.selection;

        // 第一个对象作为裁剪路径
        var clipPath = sel[0];

        // 收集要被裁剪的对象
        var itemsToClip = [];
        for (var i = 1; i < sel.length; i++) {
            itemsToClip.push(sel[i]);
        }

        // 创建剪切蒙版
        if (itemsToClip.length > 0) {
            // 创建组
            var clippingSet = doc.groupItems.add();

            // 裁剪路径移到组中
            clipPath.moveToBeginning(clippingSet);

            // 被裁剪对象移到组中
            for (var j = 0; j < itemsToClip.length; j++) {
                itemsToClip[j].moveToBeginning(clippingSet);
            }

            // 设置为剪切蒙版
            clippingSet.clipped = true;

            alert("裁剪完成！");
        }
    }
} catch (e) {
    alert("裁剪失败：" + e.message + "\n\n请确保选中的对象可以作为裁剪路径。");
}
