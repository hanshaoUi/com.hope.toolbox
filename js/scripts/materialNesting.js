//@target illustrator

/**
 * 物料智能排版脚本
 * 功能：将不同尺寸的设计元素智能排列在标准板材(1200mm×2400mm)上
 * 目标：最大化板材利用率，减少浪费
 * 适用：广告、展示、标牌等物料制作公司
 */

// 检查是否有文档打开
if (app.documents.length === 0) {
    alert("请先打开一个文档!");
} else {
    var doc = app.activeDocument;
    if (doc.selection.length === 0) {
        alert("请先选择至少一个对象!");
    } else {
        materialNesting();
    }
}

function materialNesting() {
    try {
        // 创建对话框
        var dialog = new Window('dialog', '物料智能排版工具');
        dialog.orientation = 'column';
        dialog.alignChildren = ['fill', 'top'];
        dialog.spacing = 10;
        dialog.margins = 16;

        // 载体尺寸设置
        var carrierPanel = dialog.add('panel', undefined, '板材设置');
        carrierPanel.orientation = 'column';
        carrierPanel.alignChildren = ['left', 'top'];
        carrierPanel.spacing = 10;
        carrierPanel.margins = 10;

        // 预设尺寸下拉菜单
        var presetGroup = carrierPanel.add('group');
        presetGroup.orientation = 'row';
        presetGroup.alignChildren = ['left', 'center'];
        presetGroup.spacing = 10;
        presetGroup.add('statictext', undefined, '预设尺寸:');
        var presetDropdown = presetGroup.add('dropdownlist', undefined, ['自定义', '1200×2400mm (标准)', '1220×2440mm', '900×1800mm', '600×1200mm']);
        presetDropdown.selection = 1; // 默认选中标准尺寸

        // 宽度设置
        var widthGroup = carrierPanel.add('group');
        widthGroup.orientation = 'row';
        widthGroup.alignChildren = ['left', 'center'];
        widthGroup.spacing = 10;
        widthGroup.add('statictext', undefined, '板材宽度:');
        var widthEdit = widthGroup.add('edittext', undefined, '1200');
        widthEdit.characters = 8;
        widthGroup.add('statictext', undefined, 'mm');

        // 高度设置
        var heightGroup = carrierPanel.add('group');
        heightGroup.orientation = 'row';
        heightGroup.alignChildren = ['left', 'center'];
        heightGroup.spacing = 10;
        heightGroup.add('statictext', undefined, '板材高度:');
        var heightEdit = heightGroup.add('edittext', undefined, '2400');
        heightEdit.characters = 8;
        heightGroup.add('statictext', undefined, 'mm');

        // 排列设置
        var arrangePanel = dialog.add('panel', undefined, '排版设置');
        arrangePanel.orientation = 'column';
        arrangePanel.alignChildren = ['left', 'top'];
        arrangePanel.spacing = 10;
        arrangePanel.margins = 10;

        // 间距设置
        var marginGroup = arrangePanel.add('group');
        marginGroup.orientation = 'row';
        marginGroup.alignChildren = ['left', 'center'];
        marginGroup.spacing = 10;
        marginGroup.add('statictext', undefined, '物料间距:');
        var marginEdit = marginGroup.add('edittext', undefined, '5');
        marginEdit.characters = 8;
        marginGroup.add('statictext', undefined, 'mm');

        // 边距设置
        var borderGroup = arrangePanel.add('group');
        borderGroup.orientation = 'row';
        borderGroup.alignChildren = ['left', 'center'];
        borderGroup.spacing = 10;
        borderGroup.add('statictext', undefined, '边距留空:');
        var borderEdit = borderGroup.add('edittext', undefined, '10');
        borderEdit.characters = 8;
        borderGroup.add('statictext', undefined, 'mm');

        // 优化选项
        var optionsGroup = arrangePanel.add('group');
        optionsGroup.orientation = 'row';
        optionsGroup.alignChildren = ['left', 'center'];
        optionsGroup.spacing = 20;
        
        var allowRotation = optionsGroup.add('checkbox', undefined, '允许旋转物料');
        allowRotation.value = true;
        
        var optimizePlacement = optionsGroup.add('checkbox', undefined, '优化排列顺序');
        optimizePlacement.value = true;
        
        // 显示板材边框选项
        var showBoardOption = optionsGroup.add('checkbox', undefined, '显示板材边框');
        showBoardOption.value = true;

        // 排版算法选择
        var algorithmGroup = arrangePanel.add('group');
        algorithmGroup.orientation = 'row';
        algorithmGroup.alignChildren = ['left', 'center'];
        algorithmGroup.spacing = 10;
        algorithmGroup.add('statictext', undefined, '排版算法:');
        var algorithmDropdown = algorithmGroup.add('dropdownlist', undefined, ['最优适应', '下一适应', '快速排版']);
        algorithmDropdown.selection = 0; // 默认选择最优适应

        // 按钮组
        var buttonGroup = dialog.add('group');
        buttonGroup.orientation = 'row';
        buttonGroup.alignChildren = ['right', 'center'];
        buttonGroup.spacing = 10;
        var cancelButton = buttonGroup.add('button', undefined, '取消');
        var okButton = buttonGroup.add('button', undefined, '开始排版');
        okButton.graphics.foregroundColor = okButton.graphics.newPen(dialog.graphics.PenType.SOLID_COLOR, [0, 0, 0.8], 1);

        // 预设尺寸选择事件
        presetDropdown.onChange = function() {
            switch(presetDropdown.selection.index) {
                case 0: // 自定义
                    // 不做任何修改
                    break;
                case 1: // 1200×2400mm
                    widthEdit.text = '1200';
                    heightEdit.text = '2400';
                    break;
                case 2: // 1220×2440mm
                    widthEdit.text = '1220';
                    heightEdit.text = '2440';
                    break;
                case 3: // 900×1800mm
                    widthEdit.text = '900';
                    heightEdit.text = '1800';
                    break;
                case 4: // 600×1200mm
                    widthEdit.text = '600';
                    heightEdit.text = '1200';
                    break;
            }
        };

        // 确定按钮事件
        okButton.onClick = function() {
            var carrierWidth = parseFloat(widthEdit.text);
            var carrierHeight = parseFloat(heightEdit.text);
            var margin = parseFloat(marginEdit.text);
            var border = parseFloat(borderEdit.text);
            
            if (isNaN(carrierWidth) || isNaN(carrierHeight) || isNaN(margin) || isNaN(border) || 
                carrierWidth <= 0 || carrierHeight <= 0 || margin < 0 || border < 0) {
                alert("请输入有效的数值!");
                return;
            }
            
            dialog.close();
            
            // 执行排版
            var config = {
                width: carrierWidth,
                height: carrierHeight,
                margin: margin,
                border: border,
                allowRotation: allowRotation.value,
                optimizePlacement: optimizePlacement.value,
                algorithm: algorithmDropdown.selection.index,
                showBoardFrame: showBoardOption.value
            };
            
            nestMaterials(config);
        };

        // 取消按钮事件
        cancelButton.onClick = function() {
            dialog.close();
        };

        dialog.show();
    } catch (e) {
        alert("排版工具出错: " + e);
    }
}

function nestMaterials(config) {
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
        var carrierWidth = config.width * mmToPoints;
        var carrierHeight = config.height * mmToPoints;
        var margin = config.margin * mmToPoints;
        var border = config.border * mmToPoints;
        
        // 准备物料项数据
        var materialItems = [];
        
        for (var i = 0; i < items.length; i++) {
            var bounds = items[i].geometricBounds;
            var width = bounds[2] - bounds[0];
            var height = bounds[1] - bounds[3]; // Illustrator中y坐标是反的
            
            materialItems.push({
                item: items[i],
                width: width,
                height: height,
                area: width * height,
                placed: false,
                position: null,
                rotated: false
            });
        }
        
        // 如果需要，根据面积大小对物料进行排序
        if (config.optimizePlacement) {
            materialItems.sort(function(a, b) {
                return b.area - a.area; // 从大到小排序
            });
        }
        
        // 定义可用板材区域（减去边距）
        var boardWidth = carrierWidth - (border * 2);
        var boardHeight = carrierHeight - (border * 2);
        
        // 初始化板材列表
        var boards = [{
            id: 1,
            width: boardWidth,
            height: boardHeight,
            frame: null,
            spaces: [{
                x: border,
                y: -border, // Illustrator中y坐标向下为负
                width: boardWidth,
                height: boardHeight
            }],
            items: []
        }];
        
        // 创建图层以组织排版结果
        var boardsLayer = doc.layers.add();
        boardsLayer.name = "排版板材";
        
        // 根据所选算法执行排料
        switch(config.algorithm) {
            case 0: // 最优适应算法
                executeBestFitAlgorithm(materialItems, boards, margin, config.allowRotation, carrierWidth, carrierHeight, border, doc, config.showBoardFrame, boardsLayer);
                break;
            case 1: // 下一适应算法
                executeNextFitAlgorithm(materialItems, boards, margin, config.allowRotation, carrierWidth, carrierHeight, border, doc, config.showBoardFrame, boardsLayer);
                break;
            case 2: // 快速排版算法
                executeFastNestingAlgorithm(materialItems, boards, margin, config.allowRotation, carrierWidth, carrierHeight, border, doc, config.showBoardFrame, boardsLayer);
                break;
        }
        
        // 显示结果统计
        var utilizedBoards = 0;
        for (var i = 0; i < boards.length; i++) {
            if (boards[i].items.length > 0) {
                utilizedBoards++;
            }
        }
        
        var placedItems = 0;
        for (var i = 0; i < materialItems.length; i++) {
            if (materialItems[i].placed) {
                placedItems++;
            }
        }
        
        alert("排版完成！\n已使用板材数量: " + utilizedBoards + "\n成功排版物料: " + placedItems + "/" + materialItems.length);
        
    } catch (e) {
        alert("物料排版过程中出错: " + e);
    }
}

// 创建板材矩形框
function createBoardFrame(x, y, width, height, doc, boardsLayer) {
    var rect = doc.pathItems.rectangle(y, x, width, height);
    rect.filled = false;
    rect.strokeColor = new RGBColor();
    rect.strokeColor.red = 0;
    rect.strokeColor.green = 0;
    rect.strokeColor.blue = 255;
    rect.strokeWidth = 1;
    rect.dashPattern = [5, 5]; // 虚线样式
    rect.move(boardsLayer, ElementPlacement.PLACEATEND);
    return rect;
}

// 最优适应算法
function executeBestFitAlgorithm(items, boards, margin, allowRotation, carrierWidth, carrierHeight, border, doc, showBoardFrame, boardsLayer) {
    var originalArtboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
    var artboardRect = originalArtboard.artboardRect;
    
    // 创建第一个板材边框
    if (showBoardFrame) {
        var firstFrame = createBoardFrame(artboardRect[0], artboardRect[1], carrierWidth, carrierHeight, doc, boardsLayer);
        boards[0].frame = firstFrame;
    }
    
    var boardOffsetX = carrierWidth + 50; // 板材间的间隔
    
    // 处理每个物料
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var placed = false;
        
        // 创建物料的两种定位尺寸（原始和旋转90度）
        var orientations = [
            { width: item.width, height: item.height, rotated: false }
        ];
        
        // 如果允许旋转，添加旋转后的尺寸
        if (allowRotation && item.width !== item.height) {
            orientations.push({ width: item.height, height: item.width, rotated: true });
        }
        
        // 尝试所有可能的板材和空间
        var bestFit = null;
        var bestBoard = null;
        var bestSpace = null;
        var bestOrientation = null;
        
        // 遍历所有已有板材
        for (var b = 0; b < boards.length; b++) {
            var board = boards[b];
            
            // 遍历板材中的所有可用空间
            for (var s = 0; s < board.spaces.length; s++) {
                var space = board.spaces[s];
                
                // 尝试两种物料定位方向
                for (var o = 0; o < orientations.length; o++) {
                    var orientation = orientations[o];
                    
                    // 检查物料是否适合当前空间(需要考虑间距)
                    if (space.width >= orientation.width + margin && 
                        space.height >= orientation.height + margin) {
                        
                        // 计算剩余空间面积
                        var remainingArea = (space.width - orientation.width - margin) * 
                                           (space.height - orientation.height - margin);
                        
                        // 评估此位置是否为最佳适应(最小剩余空间)
                        if (bestFit === null || remainingArea < bestFit) {
                            bestFit = remainingArea;
                            bestBoard = b;
                            bestSpace = s;
                            bestOrientation = o;
                        }
                    }
                }
            }
        }
        
        // 如果找到适合的位置，放置物料
        if (bestFit !== null) {
            var board = boards[bestBoard];
            var space = board.spaces[bestSpace];
            var orientation = orientations[bestOrientation];
            
            // 放置物料到指定位置
            item.position = {
                x: space.x,
                y: space.y,
                board: bestBoard
            };
            
            // 移动对象到新位置
            var obj = item.item;
            var bounds = obj.geometricBounds;
            
            // 如果需要旋转
            if (orientation.rotated) {
                // 旋转对象90度
                obj.rotate(90);
                item.rotated = true;
                // 重新获取旋转后的边界
                bounds = obj.geometricBounds;
            }
            
            // 计算移动距离
            var deltaX = space.x - bounds[0];
            var deltaY = space.y - bounds[1];
            
            // 移动对象
            obj.translate(deltaX, deltaY);
            
            // 更新物料状态
            item.placed = true;
            board.items.push(item);
            
            // 根据当前物料，分割空间
            // 从可用空间中移除当前使用的空间
            board.spaces.splice(bestSpace, 1);
            
            // 创建两个新空间：右侧空间和底部空间
            // 右侧空间
            if (space.width - orientation.width - margin > 0) {
                board.spaces.push({
                    x: space.x + orientation.width + margin,
                    y: space.y,
                    width: space.width - orientation.width - margin,
                    height: orientation.height
                });
            }
            
            // 底部空间
            if (space.height - orientation.height - margin > 0) {
                board.spaces.push({
                    x: space.x,
                    y: space.y - orientation.height - margin,
                    width: space.width,
                    height: space.height - orientation.height - margin
                });
            }
            
        } else {
            // 如果找不到合适的位置，创建新板材
            var boardIndex = boards.length;
            var boardX = artboardRect[0] + boardOffsetX * boardIndex;
            var boardY = artboardRect[1];
            
            // 如果需要显示板材边框，创建一个新的矩形
            var boardFrame = null;
            if (showBoardFrame) {
                boardFrame = createBoardFrame(boardX, boardY, carrierWidth, carrierHeight, doc, boardsLayer);
            }
            
            // 定义新板材可用区域
            var boardWidth = carrierWidth - (border * 2);
            var boardHeight = carrierHeight - (border * 2);
            
            // 添加新板材到板材列表
            var newBoard = {
                id: boardIndex + 1,
                width: boardWidth,
                height: boardHeight,
                frame: boardFrame,
                spaces: [{
                    x: boardX + border,
                    y: boardY - border,
                    width: boardWidth,
                    height: boardHeight
                }],
                items: []
            };
            boards.push(newBoard);
            
            // 重新尝试放置当前物料
            i--; // 回退一步，再次处理当前物料
        }
    }
}

// 下一适应算法
function executeNextFitAlgorithm(items, boards, margin, allowRotation, carrierWidth, carrierHeight, border, doc, showBoardFrame, boardsLayer) {
    var originalArtboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
    var artboardRect = originalArtboard.artboardRect;
    
    // 创建第一个板材边框
    if (showBoardFrame) {
        var firstFrame = createBoardFrame(artboardRect[0], artboardRect[1], carrierWidth, carrierHeight, doc, boardsLayer);
        boards[0].frame = firstFrame;
    }
    
    var boardOffsetX = carrierWidth + 50; // 板材间的间隔
    
    // 当前处理的板材索引
    var currentBoardIndex = 0;
    var currentX = artboardRect[0] + border;
    var currentY = artboardRect[1] - border;
    var rowHeight = 0;
    
    // 处理每个物料
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var board = boards[currentBoardIndex];
        
        // 创建物料的两种定位尺寸（原始和旋转90度）
        var orientations = [
            { width: item.width, height: item.height, rotated: false }
        ];
        
        // 如果允许旋转，添加旋转后的尺寸
        if (allowRotation && item.width !== item.height) {
            orientations.push({ width: item.height, height: item.width, rotated: true });
        }
        
        // 选择最适合当前行的方向
        var bestOrientation = orientations[0];
        if (orientations.length > 1) {
            // 如果旋转后的宽度更小，选择旋转后的方向
            if (orientations[1].width < bestOrientation.width) {
                bestOrientation = orientations[1];
            }
        }
        
        // 检查是否需要换行
        if (currentX + bestOrientation.width > artboardRect[0] + carrierWidth - border) {
            // 换行
            currentX = artboardRect[0] + border;
            currentY = currentY - rowHeight - margin;
            rowHeight = 0;
        }
        
        // 检查是否超出当前板材底部
        if (currentY - bestOrientation.height < artboardRect[1] - carrierHeight + border) {
            // 创建新板材
            currentBoardIndex++;
            
            var boardX = artboardRect[0] + boardOffsetX * currentBoardIndex;
            var boardY = artboardRect[1];
            
            // 如果需要显示板材边框，创建一个新的矩形
            var boardFrame = null;
            if (showBoardFrame) {
                boardFrame = createBoardFrame(boardX, boardY, carrierWidth, carrierHeight, doc, boardsLayer);
            }
            
            // 定义新板材可用区域
            var boardWidth = carrierWidth - (border * 2);
            var boardHeight = carrierHeight - (border * 2);
            
            // 添加新板材到板材列表
            var newBoard = {
                id: currentBoardIndex + 1,
                width: boardWidth,
                height: boardHeight,
                frame: boardFrame,
                spaces: [],
                items: []
            };
            boards.push(newBoard);
            
            // 重置位置到新板材左上角
            currentX = boardX + border;
            currentY = boardY - border;
            rowHeight = 0;
        }
        
        // 放置物料
        item.position = {
            x: currentX,
            y: currentY,
            board: currentBoardIndex
        };
        
        // 移动对象到新位置
        var obj = item.item;
        var bounds = obj.geometricBounds;
        
        // 如果需要旋转
        if (bestOrientation.rotated) {
            // 旋转对象90度
            obj.rotate(90);
            item.rotated = true;
            // 重新获取旋转后的边界
            bounds = obj.geometricBounds;
        }
        
        // 计算移动距离
        var deltaX = currentX - bounds[0];
        var deltaY = currentY - bounds[1];
        
        // 移动对象
        obj.translate(deltaX, deltaY);
        
        // 更新物料状态
        item.placed = true;
        boards[currentBoardIndex].items.push(item);
        
        // 更新位置和行高
        currentX += bestOrientation.width + margin;
        rowHeight = Math.max(rowHeight, bestOrientation.height);
    }
}

// 快速排版算法
function executeFastNestingAlgorithm(items, boards, margin, allowRotation, carrierWidth, carrierHeight, border, doc, showBoardFrame, boardsLayer) {
    var originalArtboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
    var artboardRect = originalArtboard.artboardRect;
    
    // 创建第一个板材边框
    if (showBoardFrame) {
        var firstFrame = createBoardFrame(artboardRect[0], artboardRect[1], carrierWidth, carrierHeight, doc, boardsLayer);
        boards[0].frame = firstFrame;
    }
    
    var boardOffsetX = carrierWidth + 50; // 板材间的间隔
    
    // 按宽度从大到小排序物料
    items.sort(function(a, b) {
        return b.width - a.width;
    });
    
    // 当前板材索引
    var currentBoardIndex = 0;
    
    // 初始化第一个板材的有效区域
    var effectiveWidth = carrierWidth - (border * 2);
    var effectiveHeight = carrierHeight - (border * 2);
    
    // 初始位置
    var startX = artboardRect[0] + border;
    var startY = artboardRect[1] - border;
    
    // 当前位置和跟踪
    var currentX = startX;
    var currentY = startY;
    var rowHeight = 0;
    
    // 按行放置物料
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        
        // 决定物料方向
        var useWidth = item.width;
        var useHeight = item.height;
        var shouldRotate = false;
        
        // 如果允许旋转，检查旋转是否更合适
        if (allowRotation && item.height > item.width) {
            useWidth = item.height;
            useHeight = item.width;
            shouldRotate = true;
        }
        
        // 检查是否需要换行
        if (currentX + useWidth > startX + effectiveWidth) {
            currentX = startX;
            currentY = currentY - rowHeight - margin;
            rowHeight = 0;
        }
        
        // 检查是否需要新板材
        if (currentY - useHeight < startY - effectiveHeight) {
            // 创建新板材
            currentBoardIndex++;
            
            var boardX = artboardRect[0] + boardOffsetX * currentBoardIndex;
            var boardY = artboardRect[1];
            
            // 如果需要显示板材边框，创建一个新的矩形
            var boardFrame = null;
            if (showBoardFrame) {
                boardFrame = createBoardFrame(boardX, boardY, carrierWidth, carrierHeight, doc, boardsLayer);
            }
            
            // 更新起始位置到新板材
            startX = boardX + border;
            startY = boardY - border;
            currentX = startX;
            currentY = startY;
            rowHeight = 0;
            
            // 添加新板材记录
            boards.push({
                id: currentBoardIndex + 1,
                width: effectiveWidth,
                height: effectiveHeight,
                frame: boardFrame,
                spaces: [],
                items: []
            });
        }
        
        // 放置物料
        var obj = item.item;
        var bounds = obj.geometricBounds;
        
        // 如果需要旋转
        if (shouldRotate) {
            obj.rotate(90);
            item.rotated = true;
            bounds = obj.geometricBounds; // 更新旋转后的边界
        }
        
        // 计算移动距离
        var deltaX = currentX - bounds[0];
        var deltaY = currentY - bounds[1];
        
        // 移动对象
        obj.translate(deltaX, deltaY);
        
        // 更新物料状态
        item.placed = true;
        item.position = {
            x: currentX,
            y: currentY,
            board: currentBoardIndex
        };
        
        // 添加到板材记录
        boards[currentBoardIndex].items.push(item);
        
        // 更新位置和行高
        currentX += useWidth + margin;
        rowHeight = Math.max(rowHeight, useHeight);
    }
} 