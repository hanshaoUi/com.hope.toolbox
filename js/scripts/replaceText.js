#target illustrator

function replaceText() {
    if (app.documents.length === 0) {
        alert("请先打开一个文档。");
        return;
    }

    var doc = app.activeDocument;
    var selectedItems = doc.selection;
    var selectedTextFrames = [];

    // 手动筛选文本框
    for (var i = 0; i < selectedItems.length; i++) {
        if (selectedItems[i].typename === "TextFrame") {
            selectedTextFrames.push(selectedItems[i]);
        }
    }

    // 创建对话框
    var dialog = new Window("dialog", "替换文本");
    dialog.orientation = "column";
    dialog.alignChildren = ["left", "top"];
    dialog.spacing = 10;
    dialog.margins = 16;

    // 添加选中文本对象数量标签
    var selectionInfo = dialog.add("statictext", undefined, "选中的文本对象数量: " + selectedTextFrames.length);
    selectionInfo.alignment = ["fill", "top"];

    // 添加替换文本输入字段
    var replaceGroup = dialog.add("group");
    replaceGroup.add("statictext", undefined, "替换为:");
    var replaceInput = replaceGroup.add("edittext", undefined, "");
    replaceInput.characters = 20;

    // 添加按钮
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    var okButton = buttonGroup.add("button", undefined, "确定", {name: "ok"});
    var cancelButton = buttonGroup.add("button", undefined, "取消", {name: "cancel"});

    // 设置确定按钮的点击事件
    okButton.onClick = function() {
        var newText = replaceInput.text;
        var replacedCount = 0;

        $.writeln("开始替换文本...");

        try {
            for (var i = 0; i < selectedTextFrames.length; i++) {
                var textFrame = selectedTextFrames[i];
                $.writeln("处理文本框 " + (i + 1));
                
                // 直接替换文本内容
                textFrame.contents = newText;
                
                replacedCount++;
                $.writeln("已替换文本框内容");
            }

            $.writeln("替换完成。共替换了 " + replacedCount + " 个文本对象。");
            alert("替换完成。共替换了 " + replacedCount + " 个文本对象。");
        } catch (e) {
            $.writeln("发生错误：" + e.message);
            alert("发生错误：" + e.message);
        }

        dialog.close();
    };

    // 设置取消按钮的点击事件
    cancelButton.onClick = function() {
        dialog.close();
    };

    // 显示对话框
    dialog.show();
}

// 执行函数
replaceText();