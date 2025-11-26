#target illustrator

/**
 * 导出为CDR格式脚本
 * 功能：将选中的对象导出为CorelDRAW可导入的SVG文件
 */

// 检查是否有文档打开
if (app.documents.length === 0) {
    alert("请先打开一个文档!");
} else {
    var doc = app.activeDocument;
    if (doc.selection.length === 0) {
        alert("请先选择至少一个对象!");
    } else {
        exportForCDR();
    }
}

function exportForCDR() {
    try {
        // 保存当前选择和单位
        var originalSelection = app.activeDocument.selection;
        var originalRulerUnits = app.activeDocument.rulerUnits;
        var originalDoc = app.activeDocument;
        var tempDoc;
        
        try {
            // 创建临时文件路径
            var tempFolder = Folder.temp;
            var tempFileSVG = new File(tempFolder + "/temp_for_cdr.svg");

            // 创建一个临时文档
            tempDoc = app.documents.add();
            
            // 回到原始文档复制选中内容
            app.activeDocument = originalDoc;
            app.executeMenuCommand('copy');
            
            // 回到临时文档粘贴内容
            app.activeDocument = tempDoc;
            app.executeMenuCommand('paste');
            
            // 设置SVG保存选项
            var options = new ExportOptionsSVG();
            options.embedRasterImages = true;
            options.cssProperties = SVGCSSPropertyLocation.STYLEATTRIBUTES;
            options.fontSubsetting = SVGFontSubsetting.ALLGLYPHS;
            options.documentEncoding = SVGDocumentEncoding.UTF8;
            
            // 导出为SVG
            tempDoc.exportFile(tempFileSVG, ExportType.SVG, options);
            
            // 关闭临时文档不保存
            tempDoc.close(SaveOptions.DONOTSAVECHANGES);
            
            // 恢复原始文档激活状态
            app.activeDocument = originalDoc;
            
            // 无需弹窗，直接在系统默认应用中打开文件
            tempFileSVG.execute();
        } catch (e) {
            alert("处理过程中出错: " + e);
        } finally {
            // 确保恢复原始文档状态
            if (tempDoc && tempDoc.alive) {
                tempDoc.close(SaveOptions.DONOTSAVECHANGES);
            }
            if (app.documents.length > 0) {
                app.activeDocument = originalDoc;
                app.activeDocument.selection = originalSelection;
                app.activeDocument.rulerUnits = originalRulerUnits;
            }
        }
    } catch (e) {
        alert("导出为CDR兼容格式时出错: " + e);
    }
} 