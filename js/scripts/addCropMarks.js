#target illustrator

//添加裁切标记
function addCropMarks() {
    // 创建用户界面
    var dialog = new Window('dialog', '输入参数 @HOPE');
    dialog.orientation = 'column';
    dialog.alignChildren = 'left';

    // 添加比例输入框
    var ratioGroup = dialog.add('group');
    ratioGroup.add('statictext', undefined, '比例:  1: ');
    var ratioInput = ratioGroup.add('edittext', undefined, '1');
    ratioInput.characters = 5;

    // 添加边距输入框
    var marginGroup = dialog.add('group');
    marginGroup.add('statictext', undefined, '边距 (mm):');
    var marginInput = marginGroup.add('edittext', undefined, '5');
    marginInput.characters = 5;

    // 添加单选框
    var lShapeCheckbox = dialog.add('checkbox', undefined, '添加L角线');

    // 添加确认和取消按钮
    var buttonGroup = dialog.add('group');
    buttonGroup.alignment = 'center';
    var confirmButton = buttonGroup.add('button', undefined, '确认', { name: 'ok' });
    var cancelButton = buttonGroup.add('button', undefined, '取消', { name: 'cancel' });

    // 显示对话框并处理用户输入
    if (dialog.show() == 1) {
        var ratio = parseFloat(ratioInput.text);
        var marginMM = parseFloat(marginInput.text);
        var addLShape = lShapeCheckbox.value;

        if (isNaN(ratio) || isNaN(marginMM)) {
            alert('请输入有效的比例和边距值。');
        } else {
            if (app.documents.length == 0) {
                alert("请先建立一个新文件", "错误");
                var myDoc = app.documents.add();
            }

            if (app.activeDocument.selection.length > 0) {
                var docRef = app.activeDocument;
                var selection = docRef.selection;
                var bounds = selection[0].visibleBounds; // 获取选中对象的边界

                var mmToPoints = 72 / 25.4; // 毫米转换为点
                var radius = (8 * mmToPoints / 2) / ratio; // 圆的半径，8毫米转换为点后的一半并缩小比例
                var offset = (marginMM * mmToPoints) / ratio; // 边距，输入的毫米值转换为点并缩小比例

                // 创建新图层
                var newLayer = docRef.layers.add();
                newLayer.name = '裁切标记';

                // 定义四个角的位置
                var circlePoints = [
                    { x: bounds[0] - offset, y: bounds[1] + offset }, // 左上角
                    { x: bounds[2] + offset, y: bounds[1] + offset }, // 右上角
                    { x: bounds[2] + offset, y: bounds[3] - offset }, // 右下角
                    { x: bounds[0] - offset, y: bounds[3] - offset }  // 左下角
                ];

                // 在每个角位置画圆
                for (var i = 0; i < circlePoints.length; i++) {
                    var circle = newLayer.pathItems.ellipse(circlePoints[i].y + radius, circlePoints[i].x - radius, radius * 2, radius * 2);
                    circle.stroked = false;
                    circle.filled = true;
                    var cmykColor = new CMYKColor();
                    cmykColor.cyan = 0;
                    cmykColor.magenta = 0;
                    cmykColor.yellow = 0;
                    cmykColor.black = 100;
                    circle.fillColor = cmykColor;
                }

                // 如果选择了添加L角线
                if (addLShape) {
                    var lineLength = (20 * mmToPoints) / ratio; // L形角线的边长，2cm转换为点并缩小比例
                    var lineWidth = (1 * mmToPoints) / ratio; // L形角线的宽度，1mm转换为点并缩小比例

                    for (var i = 0; i < circlePoints.length; i++) {
                        var lShapePath = newLayer.pathItems.add();
                        var lPathPoints;
                        switch (i) {
                            case 0: // 左上角
                                lPathPoints = [
                                    [circlePoints[i].x + radius + 6 * mmToPoints / ratio, circlePoints[i].y + radius + 6 * mmToPoints / ratio],
                                    [circlePoints[i].x + radius - lineLength + 6 * mmToPoints / ratio, circlePoints[i].y + radius + 6 * mmToPoints / ratio],
                                    [circlePoints[i].x + radius - lineLength + 6 * mmToPoints / ratio, circlePoints[i].y + radius - lineLength + 6 * mmToPoints / ratio]
                                ];
                                break;
                            case 1: // 右上角
                                lPathPoints = [
                                    [circlePoints[i].x - radius - 6 * mmToPoints / ratio, circlePoints[i].y + radius + 6 * mmToPoints / ratio],
                                    [circlePoints[i].x - radius + lineLength - 6 * mmToPoints / ratio, circlePoints[i].y + radius + 6 * mmToPoints / ratio],
                                    [circlePoints[i].x - radius + lineLength - 6 * mmToPoints / ratio, circlePoints[i].y + radius - lineLength + 6 * mmToPoints / ratio]
                                ];
                                break;
                            case 2: // 右下角
                                lPathPoints = [
                                    [circlePoints[i].x - radius - 6 * mmToPoints / ratio, circlePoints[i].y - radius - 6 * mmToPoints / ratio],
                                    [circlePoints[i].x - radius + lineLength - 6 * mmToPoints / ratio, circlePoints[i].y - radius - 6 * mmToPoints / ratio],
                                    [circlePoints[i].x - radius + lineLength - 6 * mmToPoints / ratio, circlePoints[i].y - radius + lineLength - 6 * mmToPoints / ratio]
                                ];
                                break;
                            case 3: // 左下角
                                lPathPoints = [
                                    [circlePoints[i].x + radius + 6 * mmToPoints / ratio, circlePoints[i].y - radius - 6 * mmToPoints / ratio],
                                    [circlePoints[i].x + radius - lineLength + 6 * mmToPoints / ratio, circlePoints[i].y - radius - 6 * mmToPoints / ratio],
                                    [circlePoints[i].x + radius - lineLength + 6 * mmToPoints / ratio, circlePoints[i].y - radius + lineLength - 6 * mmToPoints / ratio]
                                ];
                                break;
                        }
                        lShapePath.setEntirePath(lPathPoints.reverse()); // 将路径点的顺序颠倒
                        lShapePath.stroked = true;
                        lShapePath.strokeWidth = lineWidth;
                        var strokeColor = new RGBColor();
                        strokeColor.red = 0;
                        strokeColor.green = 0;
                        strokeColor.blue = 0;
                        lShapePath.strokeColor = strokeColor;
                        lShapePath.filled = false;
                    }
                }
            } else {
                alert("请先选中一个对象");
            }
        }
    }

}

addCropMarks();
