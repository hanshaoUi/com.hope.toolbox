//@target illustrator

function main() {
    // 获取当前文档
    var doc = app.activeDocument;
    if (!doc) {
        return;
    }

    // 获取选中的对象
    var selection = doc.selection;
    if (!selection || selection.length === 0) {
        return;
    }

    // 检查并创建尺寸标注图层
    var dimensionLayer;
    var layerName = "尺寸标注";
    
    // 查找是否已存在尺寸标注图层
    for (var i = 0; i < doc.layers.length; i++) {
        if (doc.layers[i].name === layerName) {
            dimensionLayer = doc.layers[i];
            break;
        }
    }
    
    // 如果图层不存在，则创建新图层
    if (!dimensionLayer) {
        dimensionLayer = doc.layers.add();
        dimensionLayer.name = layerName;
    }

    // 获取文档默认单位和转换系数
    var unit = doc.rulerUnits;
    var unitFactor = 1;
    var unitLabel = "";
    
    // 根据文档单位设置转换系数和单位标签
    switch (unit) {
        case RulerUnits.Millimeters:
            unitFactor = 0.352777778; // 1/2.834645669291339
            unitLabel = "mm";
            break;
        case RulerUnits.Centimeters:
            unitFactor = 0.0352777778; // 1/28.34645669291339
            unitLabel = "cm";
            break;
        case RulerUnits.Points:
            unitFactor = 1;
            unitLabel = "pt";
            break;
        case RulerUnits.Inches:
            unitFactor = 0.0138888889; // 1/72
            unitLabel = "in";
            break;
        case RulerUnits.Pixels:
            unitFactor = 1;
            unitLabel = "px";
            break;
    }

    // 为每个选中的对象添加尺寸标注
    for (var i = 0; i < selection.length; i++) {
        var obj = selection[i];
        
        // 获取对象的可见边界框（包含描边和效果）
        var bounds = obj.visibleBounds;
        var width = Math.abs(bounds[2] - bounds[0]);
        var height = Math.abs(bounds[3] - bounds[1]);
        
        // 计算短边长度的50%作为字体大小（以点为单位）
        var fontSize = Math.min(width, height) * 0.5;
        
        // 限制字体大小的最小值和最大值（以点为单位）
        fontSize = Math.max(Math.min(fontSize, 72), 6);
        
        // 计算显示的尺寸
        var displayWidth = width * unitFactor;
        var displayHeight = height * unitFactor;
        
        // 创建尺寸文本
        var text = dimensionLayer.textFrames.add();
        text.contents = displayWidth.toFixed(3) + unitLabel + " × " + displayHeight.toFixed(3) + unitLabel;
        
        // 设置文本属性
        text.textRange.size = fontSize;
        text.textRange.characterAttributes.fillColor = redColor;
        
        // 将文本放置在对象左上角，位置根据字体大小调整
        text.position = [bounds[0], bounds[3] + fontSize * 0.75];
    }
}

// 创建红色（移到全局范围）
var redColor = new CMYKColor();
redColor.cyan = 0;
redColor.magenta = 100;
redColor.yellow = 100;
redColor.black = 0;

main(); 