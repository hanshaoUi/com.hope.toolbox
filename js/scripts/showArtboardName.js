// showArtboardName.js - 显示画板名称和尺寸
// 在画板上显示画板名称和尺寸信息

try {
    if (app.documents.length === 0) {
        alert("请先打开一个文档");
    } else {
        var doc = app.activeDocument;
        var artboards = doc.artboards;

        if (artboards.length === 0) {
            alert("当前文档没有画板");
        } else {
            // 获取当前活动画板
            var activeABIndex = doc.artboards.getActiveArtboardIndex();
            var ab = artboards[activeABIndex];

            // 获取画板名称和尺寸
            var abName = ab.name;
            var abRect = ab.artboardRect;
            var width = Math.round(abRect[2] - abRect[0]);
            var height = Math.round(abRect[1] - abRect[3]);

            // 获取文档单位
            var unit = "";
            switch (doc.rulerUnits) {
                case RulerUnits.Millimeters:
                    unit = "mm";
                    width = Math.round(width * 0.352778);
                    height = Math.round(height * 0.352778);
                    break;
                case RulerUnits.Centimeters:
                    unit = "cm";
                    width = Math.round(width * 0.0352778 * 10) / 10;
                    height = Math.round(height * 0.0352778 * 10) / 10;
                    break;
                case RulerUnits.Inches:
                    unit = "in";
                    width = Math.round(width / 72 * 100) / 100;
                    height = Math.round(height / 72 * 100) / 100;
                    break;
                default:
                    unit = "pt";
            }

            // 创建文本框显示信息
            var textFrame = doc.textFrames.add();
            textFrame.contents = abName + "\n" + width + unit + " × " + height + unit;

            // 设置文本属性
            textFrame.textRange.characterAttributes.size = 24;

            // 设置黑色填充
            var blackColor = new RGBColor();
            blackColor.red = 0;
            blackColor.green = 0;
            blackColor.blue = 0;
            textFrame.textRange.characterAttributes.fillColor = blackColor;

            // 将文本框放置在画板左上角
            textFrame.top = abRect[1] - 10;
            textFrame.left = abRect[0] + 10;

            alert("画板信息: " + abName + " (" + width + unit + " × " + height + unit + ")");
        }
    }
} catch (e) {
    alert("显示画板名称时出错: " + e.message);
}
