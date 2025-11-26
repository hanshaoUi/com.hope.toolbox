// exportAsPDF.js - 导出当前画板为PDF
// 快速导出当前活动画板为PDF文件

try {
    if (app.documents.length === 0) {
        alert("请先打开一个文档");
    } else {
        var doc = app.activeDocument;

        if (doc.artboards.length === 0) {
            alert("当前文档没有画板");
        } else {
            // 获取当前活动画板
            var activeABIndex = doc.artboards.getActiveArtboardIndex();
            var ab = doc.artboards[activeABIndex];
            var abName = ab.name;

            // 获取文档保存路径
            var docPath = doc.path;
            var docName = doc.name.replace(/\.[^\.]+$/, ''); // 去掉扩展名

            // 设置PDF保存路径
            var pdfFile = new File(docPath + "/" + docName + "_" + abName + ".pdf");

            // 设置PDF导出选项
            var pdfOptions = new PDFSaveOptions();
            pdfOptions.compatibility = PDFCompatibility.ACROBAT5;
            pdfOptions.generateThumbnails = true;
            pdfOptions.preserveEditability = false;
            pdfOptions.pdfPreset = "[High Quality Print]";

            // 设置仅导出当前画板
            pdfOptions.artboardRange = String(activeABIndex + 1);

            // 导出PDF
            doc.saveAs(pdfFile, pdfOptions);

            alert("PDF导出成功!\n保存位置: " + pdfFile.fsName);
        }
    }
} catch (e) {
    alert("导出PDF时出错: " + e.message + "\n请确保文档已保存。");
}
