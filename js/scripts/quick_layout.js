// 快速排版脚本
// 版本: 2.3
// 作者: AI助手
// 描述: 将选中的对象高效排列在指定尺寸的矩形中，避免区域重叠

// 定义常用材料尺寸（单位：点，1mm ≈ 2.83465点）
var MATERIAL_SIZES = [
  { width: 3401.57, height: 6803.15 },  // 1200mm x 2400mm
  { width: 2834.65, height: 6803.15 },  // 1000mm x 2400mm
  { width: 2551.18, height: 6803.15 }   // 900mm x 2400mm
];

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

  // 弹出对话框,让用户选择参数
  var dialog = new Window("dialog", "快速排版设置");
  var materialSizeGroup = dialog.add("group");
  materialSizeGroup.add("statictext", undefined, "材料尺寸:");
  var materialSizeDropdown = materialSizeGroup.add("dropdownlist");
  for (var i = 0; i < MATERIAL_SIZES.length; i++) {
    var size = MATERIAL_SIZES[i];
    materialSizeDropdown.add("item", Math.round(size.width/2.83465) + "x" + Math.round(size.height/2.83465) + "mm");
  }
  materialSizeDropdown.selection = 0;

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
    var selectedSize = MATERIAL_SIZES[materialSizeDropdown.selection.index];
    var margin = parseFloat(marginInput.text) * 2.83465;
    var spacing = parseFloat(spacingInput.text) * 2.83465;

    if (isNaN(margin) || isNaN(spacing)) {
      alert("请输入有效的数字!");
      return;
    }

    improvedLayout(doc, selection, selectedSize, margin, spacing);
  }
}

// 改进的排版函数
function improvedLayout(doc, objects, boardSize, margin, spacing) {
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

    var rectangles = [];
    var currentRect = null;
    var currentX = margin;
    var currentY = -margin;
    var rowHeight = 0;
    var totalHeight = 0;

    while (objectInfos.length > 0) {
      if (!currentRect) {
        currentRect = doc.pathItems.rectangle(
          -totalHeight, 
          0, 
          Math.round(boardSize.width), 
          Math.round(boardSize.height)
        );
        currentRect.filled = false;
        currentRect.stroked = true;
        rectangles.push(currentRect);
        currentY = -margin;
        rowHeight = 0;
      }

      var placed = false;
      for (var i = 0; i < objectInfos.length; i++) {
        var info = objectInfos[i];
        if (currentX + info.width <= boardSize.width - margin && 
            -currentY + info.height <= boardSize.height - margin) {
          // 移动对象到新位置
          var deltaX = Math.round(currentX - info.object.visibleBounds[0]);
          var deltaY = Math.round(currentY - info.object.visibleBounds[1] - totalHeight);
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
        currentY -= rowHeight + spacing;
        rowHeight = 0;

        // 如果当前矩形已满，创建新矩形
        if (-currentY > boardSize.height - margin) {
          totalHeight += boardSize.height + spacing;
          currentRect = null;
        }
      }
    }

    // 将所有矩形移到最底层
    for (var j = 0; j < rectangles.length; j++) {
      rectangles[j].move(doc, ElementPlacement.PLACEATEND);
    }
    
    // 选中所有排版后的对象和矩形
    doc.selection = objects.concat(rectangles);

    alert("排版完成，共创建 " + rectangles.length + " 个区域，放置 " + objects.length + " 个对象。");
  } catch (e) {
    alert("排版过程中发生错误: " + e.message);
  }
}

// 运行脚本
quickLayout();
