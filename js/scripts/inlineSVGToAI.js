/* 
  程序版本: Adobe Illustrator CS5+
  名称: inlineSVGToAI.jsx;

  作者: Alexander Ladygin, 邮箱: i@ladygin.pro
  重构和测试感谢 - Sergey Osokin, 邮箱: hi@sergosokin.ru
  版权所有 (c) 2018

  ***

  使用说明:
    1. 运行脚本
    2. 在文本区域粘贴您的SVG代码
    3. 点击"粘贴"按钮
*/

#target illustrator
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

function main() {
  if (app.documents.length == 0) {
    alert("错误: \n请先打开一个文档，然后再试。");
    return;
  }
  uiDialog().show();
}

// 创建对话窗口
function uiDialog() {
  var win = new Window("dialog", "内联SVG转AI \u00A9 www.ladyginpro.ru", undefined);
  win.orientation = "column";
  win.alignChildren = ["center", "top"];
  win.spacing = 10;
  win.margins = 16;

  var winPanel = win.add("panel");
  winPanel.text = "SVG导入";
  winPanel.orientation = "column";
  winPanel.alignChildren = ["left", "top"];
  winPanel.spacing = 10;
  winPanel.margins = 10;

  // SVG代码粘贴区域
  var winSVGCodeTitle = winPanel.add("statictext", undefined, "请粘贴您的SVG代码:");
  var SVGCode = winPanel.add("edittext", [0, 0, 400, 200], "", { multiline: true, scrolling: true });
  
  var insertOpen = winPanel.add("checkbox", undefined, '通过"打开"插入（避免AI崩溃）');
  insertOpen.value = true;
  
  // 按钮
  var winButtonsGroup = win.add("group");
  winButtonsGroup.orientation = "row";
  winButtonsGroup.alignChildren = ["center", "center"];
  winButtonsGroup.spacing = 10;
  winButtonsGroup.margins = 0;

  var closeButton = winButtonsGroup.add("button", undefined, "取消");
  closeButton.preferredSize.width = 120;
  
  var pasteButton = winButtonsGroup.add("button", undefined, "粘贴");
  pasteButton.preferredSize.width = 120;

  // 关闭窗口
  closeButton.onClick = function () {
    win.close();
  };

  // 粘贴按钮动作
  pasteButton.onClick = function () {
    var code = SVGCode.text;
    if (code) {
      importSVG(code);
      win.close();
    } else {
      alert("您没有插入SVG代码。");
    }
  };

  function importSVG(string) {
    var svgFileName = "inlineSVGtoAI.svg",
      svgFile = new File("" + Folder.temp + "/" + svgFileName),
      backDoc = activeDocument;
  
    svgFile.open("w");
    svgFile.write(string);
    svgFile.close();
    if (!insertOpen.value && (activeDocument.importFile instanceof Function)) {
      activeDocument.importFile(svgFile, false, false, false);
    }
      else {
        app.open(svgFile);
        var l = activeDocument.layers,
        i = l.length;
        while (i--) { l[i].hasSelectedArtwork = true; }
        app.copy();
        activeDocument.close(SaveOptions.DONOTSAVECHANGES);
        backDoc.activate();
        app.paste();
      }
    $.sleep(500);
    svgFile.remove();
  }

  return win;
}

function showError(err) {
  if (confirm(scriptName + ": 发生了未知错误。\n" +
    "您想查看更多信息吗？", true, "未知错误")) {
    alert(err + ": 在第 " + err.line + " 行", "脚本错误", true);
  }
}

try {
  main();
} catch (e) {
  showError(e);
}
