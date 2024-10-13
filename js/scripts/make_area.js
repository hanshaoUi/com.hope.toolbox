#target illustrator
// 面积标注
function make_area() {

    var doc = app.activeDocument;
    var actLay = doc.activeLayer;
    var sel = doc.selection;
    var u = 2.834645669291;
    for (var i = 0; i < sel.length; i++) {
        selInfo = sel[i].geometricBounds;
        selL = selInfo[0];
        selT = selInfo[1]
        selW = Math.abs(selInfo[2] - selInfo[0])
        selH = Math.abs(selInfo[3] - selInfo[1])
        var txt = actLay.textFrames.add();
        txt.contents = '周长:' + ((sel[i].length / u).toFixed(3)) + 'mm\n面积:' + ((sel[i].area / (u * u)).toFixed(3)) + 'mm^2'
        txt.position = [selL, selT - selH]
    }

}
make_area();