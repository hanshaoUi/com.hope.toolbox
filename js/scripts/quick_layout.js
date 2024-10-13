// 快速排版脚本
// 版本: 2.4
// 作者: AI助手
// 描述: 将选中的对象高效排列在指定尺寸的画板中，避免区域重叠

// 主函数
function quickLayout() {
  if (app.documents.length === 0) {
    alert("请先打开一个文档!");
    return;
  }

  var doc = app.activeDocument;
  var selection = doc.selection;
  if (selection.length === 0) {
    alert("请先选择要排版的对象!");
    return;
  }

  // 弹出对话框,让用户输入参数
  var dialog = new Window("dialog", "快速排版设置");

  var sizeGroup = dialog.add("group");
  sizeGroup.add("statictext", undefined, "画板宽度(mm):");
  var widthInput = sizeGroup.add("edittext", undefined, "1200");
  widthInput.characters = 5;
  sizeGroup.add("statictext", undefined, "高度(mm):");
  var heightInput = sizeGroup.add("edittext", undefined, "2400");
  heightInput.characters = 5;

  var marginGroup = dialog.add("group");
  marginGroup.add("statictext", undefined, "边距(mm):");
  var marginInput = marginGroup.add("edittext", undefined, "10");
  marginInput.characters = 5;

  var spacingGroup = dialog.add("group");
  spacingGroup.add("statictext", undefined, "对象间距(mm):");
  var spacingInput = spacingGroup.add("edittext", undefined, "5");
  spacingInput.characters = 5;

  var buttonGroup = dialog.add("group");
  buttonGroup.add("button", undefined, "确定", {name: "ok"});
  buttonGroup.add("button", undefined, "取消", {name: "cancel"});

  if (dialog.show() === 1) {
    var width = parseFloat(widthInput.text) * 2.83465;
    var height = parseFloat(heightInput.text) * 2.83465;
    var margin = parseFloat(marginInput.text) * 2.83465;
    var spacing = parseFloat(spacingInput.text) * 2.83465;

    if (isNaN(width) || isNaN(height) || isNaN(margin) || isNaN(spacing)) {
      alert("请输入有效的数字!");
      return;
    }

    var boardSize = { width: width, height: height };
    var initialArtboardCount = doc.artboards.length;
    improvedLayout(doc, selection, boardSize, margin, spacing, initialArtboardCount);
  }
}

// 清除多余的画板
function clearExtraArtboards(doc, initialCount) {
  while (doc.artboards.length > initialCount) {
    doc.artboards[initialCount].remove();
  }
}

// 改进的排版函数
function improvedLayout(doc, objects, boardSize, margin, spacing, initialArtboardCount) {
  try {
    var objectInfos = [];
    for (var i = 0; i < objects.length; i++) {
      var obj = objects[i];
      var bounds = obj.visibleBounds;
      objectInfos.push({
        object: obj,
        width: bounds[2] - bounds[0],
        height: bounds[1] - bounds[3]
      });
    }

    var currentArtboard = null;
    var currentX = margin;
    var currentY = margin;
    var rowHeight = 0;
    var totalHeight = 0;

    while (objectInfos.length > 0) {
      if (!currentArtboard) {
        currentArtboard = doc.artboards.add([0, totalHeight, boardSize.width, totalHeight - boardSize.height]);
        currentX = margin;
        currentY = margin;
        rowHeight = 0;
      }

      var placed = false;
      for (var i = 0; i < objectInfos.length; i++) {
        var info = objectInfos[i];
        if (currentX + info.width <= boardSize.width - margin && 
            currentY + info.height <= boardSize.height - margin) {
          // 移动对象到新位置
          var deltaX = Math.round(currentX - info.object.visibleBounds[0]);
          var deltaY = Math.round(currentY - info.object.visibleBounds[1] + totalHeight);
          info.object.translate(deltaX, deltaY);

          currentX += info.width + spacing;
          rowHeight = Math.max(rowHeight, info.height);
          objectInfos.splice(i, 1);
          placed = true;
          break;
        }
      }

      if (!placed) {
        // 换行
        currentX = margin;
        currentY += rowHeight + spacing;
        rowHeight = 0;

        // 如果当前画板已满，创建新画板
        if (currentY > boardSize.height - margin) {
          totalHeight += boardSize.height + spacing;
          currentArtboard = null;
        }
      }
    }

    clearExtraArtboards(doc, initialArtboardCount);
    alert("排版完成，共创建 " + (doc.artboards.length - initialArtboardCount) + " 个画板，放置 " + objects.length + " 个对象。");
  } catch (e) {
    alert("排版过程中发生错误: " + e.message);
  }
}

// 运行脚本
quickLayout();
