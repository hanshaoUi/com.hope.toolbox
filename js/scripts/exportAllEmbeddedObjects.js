#target illustrator

// 导出所有嵌入对象
function exportAllEmbeddedObjects() {
    function convertEmbeddedToLinked(saveFolder) {
        if (app.documents.length > 0) {
            var doc = app.activeDocument;
            var placedItems = doc.placedItems;
            var rasterItems = doc.rasterItems;

            // 处理所有嵌入的置入项
            for (var i = placedItems.length - 1; i >= 0; i--) {
                var item = placedItems[i];
                if (item.embedded) {
                    var file = new File(saveFolder + "/" + item.name);
                    item.file.copy(file);
                    item.relink(file);
                }
            }

            // 处理所有嵌入的栅格项
            for (var i = rasterItems.length - 1; i >= 0; i--) {
                var item = rasterItems[i];
                if (item.embedded) {
                    var fileName = "连接_" + i + ".png";
                    var file = new File(saveFolder + "/" + fileName);

                    // 创建一个临时文档来导出栅格项
                    var tempDoc = app.documents.add(DocumentColorSpace.RGB, item.width, item.height);
                    item.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);

                    // 导出为PNG
                    var exportOptions = new ExportOptionsPNG24();
                    exportOptions.antiAliasing = true;
                    exportOptions.transparency = true;
                    tempDoc.exportFile(file, ExportType.PNG24, exportOptions);

                    // 关闭临时文档
                    tempDoc.close(SaveOptions.DONOTSAVECHANGES);

                    // 创建新的置入项并替换原有栅格项
                    var newItem = doc.placedItems.add();
                    newItem.file = file;
                    newItem.position = item.position;
                    newItem.width = item.width;
                    newItem.height = item.height;

                    item.remove();
                }
            }

            alert("所有嵌入对象已转换为连接对象并保存到指定文件夹。");
        } else {
            alert("请先打开一个文档。");
        }
    }

    // 运行脚本
    var folder = Folder.selectDialog("选择保存连接文件的文件夹");
    if (folder != null) {
        convertEmbeddedToLinked(folder.fsName);
    }

}
exportAllEmbeddedObjects();