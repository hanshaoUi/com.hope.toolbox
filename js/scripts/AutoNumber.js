#target illustrator

function main() {
    var doc = app.activeDocument;
    var sel = doc.selection;

    if (sel.length === 0) {
        alert("请至少选择一个对象。");
        return;
    }

    // 创建对话框
    var dlg = new Window('dialog', '编号选项');
    dlg.orientation = 'column';
    dlg.alignChildren = 'fill';

    // 选择编号方式
    var methodPanel = dlg.add('panel', undefined, '选择编号方式');
    methodPanel.orientation = 'row';
    methodPanel.alignChildren = ['fill', 'top'];
    methodPanel.margins = 10;

    var byLayer = methodPanel.add('radiobutton', undefined, '按图层编号');
    var byPosition = methodPanel.add('radiobutton', undefined, '按坐标编号');
    byLayer.value = true;

    // 编号设置面板
    var numberingPanel = dlg.add('panel', undefined, '编号设置');
    numberingPanel.orientation = 'column';
    numberingPanel.alignChildren = ['fill', 'left'];
    numberingPanel.margins = 10;

    var prefixGroup = numberingPanel.add('group');
    prefixGroup.orientation = 'row';
    prefixGroup.add('statictext', undefined, '前缀:');
    var prefixInput = prefixGroup.add('edittext', undefined, '');
    prefixInput.characters = 10;

    var suffixGroup = numberingPanel.add('group');
    suffixGroup.orientation = 'row';
    suffixGroup.add('statictext', undefined, '后缀:');
    var suffixInput = suffixGroup.add('edittext', undefined, '');
    suffixInput.characters = 10;

    var startNumberGroup = numberingPanel.add('group');
    startNumberGroup.orientation = 'row';
    startNumberGroup.add('statictext', undefined, '起始编号:');
    var startNumberInput = startNumberGroup.add('edittext', undefined, '1');
    startNumberInput.characters = 5;

    var incrementGroup = numberingPanel.add('group');
    incrementGroup.orientation = 'row';
    incrementGroup.add('statictext', undefined, '递增值:');
    var incrementInput = incrementGroup.add('edittext', undefined, '1');
    incrementInput.characters = 5;

    // 预览面板
    var previewPanel = dlg.add('panel', undefined, '预览');
    previewPanel.orientation = 'column';
    previewPanel.alignChildren = ['fill', 'left'];
    previewPanel.margins = 10;

    var previewText = previewPanel.add('statictext', undefined, ' ');
    previewText.characters = 20;

    // 图层排序选择面板
    var orderPanel = dlg.add('panel', undefined, '图层排序顺序');
    orderPanel.orientation = 'column';
    orderPanel.alignChildren = ['fill', 'left'];
    orderPanel.margins = 10;

    var orderGroup = orderPanel.add('group');
    orderGroup.orientation = 'row';
    var fromBottomToTop = orderGroup.add('radiobutton', undefined, '从底层到顶层');
    var fromTopToBottom = orderGroup.add('radiobutton', undefined, '从顶层到底层');
    fromBottomToTop.value = true;

    // 坐标排序选择面板
    var sortPanel = dlg.add('panel', undefined, '坐标排序规则');
    sortPanel.orientation = 'column';
    sortPanel.alignChildren = ['fill', 'left'];
    sortPanel.margins = 10;

    var primarySortGroup = sortPanel.add('group');
    primarySortGroup.orientation = 'row';
    primarySortGroup.add('statictext', undefined, '排序优先级:');
    var horizontalFirst = primarySortGroup.add('radiobutton', undefined, '先横排后竖排');
    var verticalFirst = primarySortGroup.add('radiobutton', undefined, '先竖排后横排');
    horizontalFirst.value = true;

    var horizontalDirectionGroup = sortPanel.add('group');
    horizontalDirectionGroup.orientation = 'row';
    horizontalDirectionGroup.add('statictext', undefined, '左右方向:');
    var leftToRight = horizontalDirectionGroup.add('radiobutton', undefined, '从左至右');
    var rightToLeft = horizontalDirectionGroup.add('radiobutton', undefined, '从右至左');
    leftToRight.value = true;

    var verticalDirectionGroup = sortPanel.add('group');
    verticalDirectionGroup.orientation = 'row';
    verticalDirectionGroup.add('statictext', undefined, '上下方向:');
    var topToBottom = verticalDirectionGroup.add('radiobutton', undefined, '从上至下');
    var bottomToTop = verticalDirectionGroup.add('radiobutton', undefined, '从下至上');
    topToBottom.value = true;

    // 确定和取消按钮
    var btnGroup = dlg.add('group');
    btnGroup.orientation = 'row';
    btnGroup.alignment = 'center';
    var okBtn = btnGroup.add('button', undefined, '确定', { name: 'ok' });
    var cancelBtn = btnGroup.add('button', undefined, '取消', { name: 'cancel' });

    // 更新预览
    function updatePreview() {
        var prefix = prefixInput.text;
        var suffix = suffixInput.text;
        var startNumber = parseInt(startNumberInput.text) || 0;
        var increment = parseInt(incrementInput.text) || 1;
        var numberLength = startNumber.toString().length;
        var formattedNumber = padNumber(startNumber, numberLength);
        previewText.text = prefix + formattedNumber + suffix;
    }

    prefixInput.onChanging = updatePreview;
    suffixInput.onChanging = updatePreview;
    startNumberInput.onChanging = updatePreview;
    incrementInput.onChanging = updatePreview;

    // 根据选择的编号方式禁用相应的设置
    function updateUI() {
        var isLayerMethod = byLayer.value;
        orderPanel.enabled = isLayerMethod;
        sortPanel.enabled = !isLayerMethod;
    }

    byLayer.onClick = updateUI;
    byPosition.onClick = updateUI;
    updateUI();

    if (dlg.show() == 1) {
        var prefix = prefixInput.text;
        var suffix = suffixInput.text;
        var startNumber = parseInt(startNumberInput.text);
        var increment = parseInt(incrementInput.text);

        if (byLayer.value) {
            layerNumbering(sel, prefix, suffix, startNumber, increment, fromBottomToTop.value);
        } else {
            makeNumber(sel, prefix, suffix, startNumber, increment, horizontalFirst.value, leftToRight.value, topToBottom.value);
        }
    }
}

function layerNumbering(sel, prefix, suffix, startNumber, increment, isBottomToTop) {
    var selectedItems = [];
    for (var i = 0; i < sel.length; i++) {
        var obj = sel[i];
        if (obj.typename === 'TextFrame') {
            selectedItems.push(obj);
        }
    }

    selectedItems.sort(function (a, b) {
        if (isBottomToTop) {
            if (a.layer.zOrderPosition !== b.layer.zOrderPosition) {
                return a.layer.zOrderPosition - b.layer.zOrderPosition;
            } else {
                return a.position[1] - b.position[1];
            }
        } else {
            if (a.layer.zOrderPosition !== b.layer.zOrderPosition) {
                return b.layer.zOrderPosition - a.layer.zOrderPosition;
            } else {
                return b.position[1] - a.position[1];
            }
        }
    });

    var numberLength = startNumber.toString().length;
    var currentNumber = startNumber;
    for (var i = 0; i < selectedItems.length; i++) {
        var textItem = selectedItems[i];
        var formattedNumber = padNumber(currentNumber, numberLength);
        textItem.contents = prefix + formattedNumber + suffix;
        currentNumber += increment;
    }

    alert("编号已完成！");
}

function makeNumber(sel, prefix, suffix, startNumber, increment, isHorizontalFirst, isLeftToRight, isTopToBottom) {
    var itemsArray = [];
    for (var i = 0; i < sel.length; i++) {
        var item = sel[i];
        if (item.typename === "TextFrame") {
            var bounds = item.geometricBounds;
            var centerX = (bounds[0] + bounds[2]) / 2;
            var centerY = (bounds[1] + bounds[3]) / 2;
            itemsArray.push({
                item: item,
                x: centerX,
                y: centerY
            });
        }
    }

    function sortByPosition(a, b) {
        var tolerance = 1;
        if (isHorizontalFirst) {
            if (Math.abs(a.y - b.y) > tolerance) {
                return isTopToBottom ? (b.y - a.y) : (a.y - b.y);
            } else {
                return isLeftToRight ? (a.x - b.x) : (b.x - a.x);
            }
        } else {
            if (Math.abs(a.x - b.x) > tolerance) {
                return isLeftToRight ? (a.x - b.x) : (b.x - a.x);
            } else {
                return isTopToBottom ? (b.y - a.y) : (a.y - b.y);
            }
        }
    }

    itemsArray.sort(sortByPosition);

    var numberLength = startNumber.toString().length;
    for (var i = 0; i < itemsArray.length; i++) {
        var textItem = itemsArray[i].item;
        var number = startNumber + (i * increment);
        var formattedNumber = padNumber(number, numberLength);
        textItem.contents = prefix + formattedNumber + suffix;
    }

    alert("编号已完成！");
}

function padNumber(num, length) {
    var numStr = num.toString();
    while (numStr.length < length) {
        numStr = '0' + numStr;
    }
    return numStr;
}

main();