#target illustrator

/**
 * 带载体限制的排列脚本
 * 功能：按照指定载体尺寸自动排列对象，当超出载体宽度时自动换行，
 * 当一个载体排满时自动创建新的载体（画板）继续排列
 */

// 检查是否有文档打开
if (app.documents.length === 0) {
    alert("请先打开一个文档!");
} else {
    var doc = app.activeDocument;
    if (doc.selection.length === 0) {
        alert("请先选择至少一个对象!");
    } else {
        arrangeWithCarrier();
    }
}

function arrangeWithCarrier() {
    try {
        // 创建对话框
        var dialog = new Window('dialog', '带载体限制的排列');
        dialog.orientation = 'column';
        dialog.alignChildren = ['fill', 'top'];
        dialog.spacing = 10;
        dialog.margins = 16;

        // 载体尺寸设置
        var carrierPanel = dialog.add('panel', undefined, '载体尺寸设置');
        carrierPanel.orientation = 'column';
        carrierPanel.alignChildren = ['left', 'top'];
        carrierPanel.spacing = 10;
        carrierPanel.margins = 10;

        // 宽度设置
        var widthGroup = carrierPanel.add('group');
        widthGroup.orientation = 'row';
        widthGroup.alignChildren = ['left', 'center'];
        widthGroup.spacing = 10;
        widthGroup.add('statictext', undefined, '载体宽度:');
        var widthEdit = widthGroup.add('edittext', undefined, '1200');
        widthEdit.characters = 8;
        widthGroup.add('statictext', undefined, 'mm');

        // 高度设置
        var heightGroup = carrierPanel.add('group');
        heightGroup.orientation = 'row';
        heightGroup.alignChildren = ['left', 'center'];
        heightGroup.spacing = 10;
        heightGroup.add('statictext', undefined, '载体高度:');
        var heightEdit = heightGroup.add('edittext', undefined, '2400');
        heightEdit.characters = 8;
        heightGroup.add('statictext', undefined, 'mm');

        // 排列设置
        var arrangePanel = dialog.add('panel', undefined, '排列设置');
        arrangePanel.orientation = 'column';
        arrangePanel.alignChildren = ['left', 'top'];
        arrangePanel.spacing = 10;
        arrangePanel.margins = 10;

        // 间距设置
        var marginGroup = arrangePanel.add('group');
        marginGroup.orientation = 'row';
        marginGroup.alignChildren = ['left', 'center'];
        marginGroup.spacing = 10;
        marginGroup.add('statictext', undefined, '对象间距:');
        var marginEdit = marginGroup.add('edittext', undefined, '10');
        marginEdit.characters = 8;
        marginGroup.add('statictext', undefined, 'mm');

        // 按钮组
        var buttonGroup = dialog.add('group');
        buttonGroup.orientation = 'row';
        buttonGroup.alignChildren = ['right', 'center'];
        buttonGroup.spacing = 10;
        var cancelButton = buttonGroup.add('button', undefined, '取消');
        var okButton = buttonGroup.add('button', undefined, '确定');
        okButton.graphics.foregroundColor = okButton.graphics.newPen(dialog.graphics.PenType.SOLID_COLOR, [0, 0, 0.8], 1);

        // 确定按钮事件
        okButton.onClick = function() {
            var carrierWidth = parseFloat(widthEdit.text);
            var carrierHeight = parseFloat(heightEdit.text);
            var margin = parseFloat(marginEdit.text);
            
            if (isNaN(carrierWidth) || isNaN(carrierHeight) || isNaN(margin) || 
                carrierWidth <= 0 || carrierHeight <= 0 || margin < 0) {
                alert("请输入有效的数值!");
                return;
            }
            
            dialog.close();
            
            // 执行排列
            arrangeObjects(carrierWidth, carrierHeight, margin);
        };

        // 取消按钮事件
        cancelButton.onClick = function() {
            dialog.close();
        };

        dialog.show();
    } catch (e) {
        alert("排列对象时出错: " + e);
    }
}

function arrangeObjects(carrierWidth, carrierHeight, margin) {
    try {
        var doc = app.activeDocument;
        var selection = doc.selection;
        var items = [];
        
        // 收集所有选中的对象
        for (var i = 0; i < selection.length; i++) {
            items.push(selection[i]);
        }
        
        if (items.length === 0) return;
        
        // 将mm转换为文档单位
        var mmToPoints = 2.83465; // 1mm = 2.83465pt
        carrierWidth = carrierWidth * mmToPoints;
        carrierHeight = carrierHeight * mmToPoints;
        margin = margin * mmToPoints;
        
        // 获取当前画板
        var originalArtboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
        var artboards = [originalArtboard]; // 保存所有创建的载体(画板)
        var currentArtboardIndex = 0;
        
        // 初始位置 - 从当前画板左上角开始
        var artboardRect = originalArtboard.artboardRect; // [left, top, right, bottom]
        var startX = artboardRect[0] + margin; // 添加边距
        var startY = artboardRect[1] - margin; // 添加边距，y坐标是反的
        
        var currentX = startX;
        var currentY = startY;
        var rowMaxHeight = 0; // 当前行的最大高度
        
        // 设置载体的有效区域边界
        var carrierBottom = startY - carrierHeight + margin;
        
        // 打印状态信息，便于调试
        $.writeln("载体尺寸: " + carrierWidth/mmToPoints + "mm x " + carrierHeight/mmToPoints + "mm");
        $.writeln("载体起始坐标: startX=" + startX + ", startY=" + startY);
        $.writeln("载体底部边界: " + carrierBottom);
        
        // 处理所有对象
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            
            // 获取对象尺寸
            var bounds = item.geometricBounds; // [left, top, right, bottom]
            var itemWidth = bounds[2] - bounds[0];
            var itemHeight = bounds[1] - bounds[3]; // Illustrator中y坐标是反的
            
            $.writeln("处理对象 #" + i + ": 宽度=" + itemWidth + ", 高度=" + itemHeight);
            $.writeln("当前位置: X=" + currentX + ", Y=" + currentY);
            
            // 检查是否需要换行 - 当当前X位置加上新对象宽度超过载体宽度时
            if (i > 0 && currentX + itemWidth > startX + carrierWidth - margin) {
                $.writeln("需要换行: currentX(" + currentX + ") + itemWidth(" + itemWidth + ") > 载体右边界(" + (startX + carrierWidth - margin) + ")");
                // 换行
                currentX = startX;
                currentY = currentY - rowMaxHeight - margin;
                rowMaxHeight = 0;
                $.writeln("换行后位置: X=" + currentX + ", Y=" + currentY);
            }
            
            // 修复：调整检查逻辑，确保在对象超出载体底部时创建新载体
            // 检查是否需要新的载体 - 当当前Y位置减去对象高度小于载体底部边界时
            if (currentY - itemHeight < carrierBottom) {
                $.writeln("需要新载体: currentY(" + currentY + ") - itemHeight(" + itemHeight + ") < 载体底部(" + carrierBottom + ")");
                // 创建新载体(新画板)
                currentArtboardIndex++;
                
                // 新画板位置 - 在原画板右侧创建新画板
                var newArtboardRect = [
                    artboardRect[0] + (carrierWidth + 50) * currentArtboardIndex,
                    artboardRect[1],
                    artboardRect[0] + (carrierWidth + 50) * currentArtboardIndex + carrierWidth,
                    artboardRect[1] - carrierHeight
                ];
                
                // 添加新画板并命名
                var newArtboard = doc.artboards.add(newArtboardRect);
                doc.artboards[doc.artboards.length - 1].name = "载体 " + (currentArtboardIndex + 1);
                artboards.push(newArtboard);
                
                // 更新坐标到新载体起点
                startX = newArtboardRect[0] + margin;
                startY = newArtboardRect[1] - margin;
                currentX = startX;
                currentY = startY;
                rowMaxHeight = 0;
                
                // 更新新载体的底部边界
                carrierBottom = startY - carrierHeight + margin;
                
                $.writeln("创建新载体 #" + currentArtboardIndex);
                $.writeln("新载体起始坐标: startX=" + startX + ", startY=" + startY);
                $.writeln("新载体底部边界: " + carrierBottom);
            }
            
            // 修复定位问题：不使用中心点定位，而是直接使用左上角定位
            // 这样在间距为0时不会重叠
            try {
                // 保存原始位置和变换
                var originalPosition = {
                    left: item.left,
                    top: item.top
                };
                
                // 计算需要移动的距离
                var deltaX = currentX - bounds[0];
                var deltaY = currentY - bounds[1];
                
                $.writeln("移动对象: deltaX=" + deltaX + ", deltaY=" + deltaY);
                
                // 使用translate方法移动对象，避免定位点问题
                item.translate(deltaX, deltaY);
                
                // 更新当前位置和行高
                currentX += itemWidth + margin;
                if (itemHeight > rowMaxHeight) rowMaxHeight = itemHeight;
                
                $.writeln("移动后位置: X=" + currentX + ", 当前行高=" + rowMaxHeight);
            } catch (e) {
                // 如果移动对象失败，回退到原始位置
                alert("移动对象时出错: " + e);
                try {
                    if (originalPosition) {
                        item.left = originalPosition.left;
                        item.top = originalPosition.top;
                    }
                } catch (restoreError) {}
            }
        }
        
        // 设置第一个载体为活动画板
        doc.artboards.setActiveArtboardIndex(0);
        
        // 提示完成信息
        if (currentArtboardIndex > 0) {
            alert("排列完成！已创建 " + (currentArtboardIndex + 1) + " 个载体。");
        } else {
            alert("排列完成！所有对象已在一个载体内排列。");
        }
    } catch (e) {
        alert("排列对象时出错: " + e);
    }
} 