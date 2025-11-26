#target illustrator

var originalPaths = [];
var handle_len_rate = 2;

// 获取选中的路径
getPathItemsInSelection(1, originalPaths);
if(originalPaths.length < 2) {
    alert("请至少选择两个路径对象。");
} else {
    // 创建对话框
    var dialog = new Window("dialog", "Metaball 设置");
    dialog.orientation = "column";
    dialog.alignChildren = ["left", "top"];
    dialog.spacing = 10;
    dialog.margins = 16;

    // 创建输入组
    var inputGroup = dialog.add("group");
    inputGroup.orientation = "row";
    inputGroup.alignChildren = ["left", "center"];
    inputGroup.spacing = 10;

    inputGroup.add("statictext", undefined, "连接率");
    var input = inputGroup.add("edittext", undefined, "50");
    input.characters = 10;
    inputGroup.add("statictext", undefined, "%");

    // 创建按钮组
    var buttonGroup = dialog.add("group");
    buttonGroup.orientation = "row";
    buttonGroup.alignChildren = ["center", "center"];
    buttonGroup.alignment = ["fill", "top"];

    var okButton = buttonGroup.add("button", undefined, "确定", {name: "ok"});
    var cancelButton = buttonGroup.add("button", undefined, "取消", {name: "cancel"});

    // 显示对话框
    if (dialog.show() == 1) {
        // 用户点击了确定
        var v = parseFloat(input.text);
        if (isNaN(v) || v <= 0 || v > 100) {
            alert("请输入0到100之间的有效数值。");
        } else {
            applyMetaball(v / 100);
        }
    }
}

function applyMetaball(rate) {
    var paths2 = originalPaths.slice(0);
    var pi, i, j;
    
    for(i = originalPaths.length - 1; i >= 1; i--){
        for(j = i - 1; j >= 0; j--){
            pi = metaball(originalPaths[i], originalPaths[j], rate, handle_len_rate);
            if(pi != null) {
                paths2.push(pi);
            }
        }
    }
    
    app.activeDocument.selection = paths2;
}

function metaball(s0, s1, v, handle_len_rate){
    var arr = getGBCenterWidth(s0);
    var o1 = arr[0];
    var r1 = arr[1] / 2;
    
    arr = getGBCenterWidth(s1);
    var o2 = arr[0];
    var r2 = arr[1] / 2;

    if(r1 == 0 || r2 == 0) return;
    
    var pi2 = Math.PI / 2;
    var d = dist(o1, o2);

    var u1, u2;
    if(d <= Math.abs(r1 - r2)){
        return;
    } else if(d < r1 + r2){ // case circles are overlapping
        u1 = Math.acos((r1 * r1 + d * d - r2 * r2) / (2 * r1 * d));
        u2 = Math.acos((r2 * r2 + d * d - r1 * r1) / (2 * r2 * d));
    } else {
        u1 = 0;
        u2 = 0;
    }

    var t1 = getRad(o1, o2);
    var t2 = Math.acos((r1 - r2) / d);
    
    var t1a = t1 + u1 + (t2 - u1) * v;
    var t1b = t1 - u1 - (t2 - u1) * v;
    var t2a = t1 + Math.PI - u2 - (Math.PI - u2 - t2) * v;
    var t2b = t1 - Math.PI + u2 + (Math.PI - u2 - t2) * v;
    
    var p1a = setPnt(o1, t1a, r1);
    var p1b = setPnt(o1, t1b, r1);
    var p2a = setPnt(o2, t2a, r2);
    var p2b = setPnt(o2, t2b, r2);

    var d2 = Math.min(v * handle_len_rate, dist(p1a, p2a) / (r1 + r2));
    d2 *= Math.min(1, d * 2 / (r1 + r2));
    r1 *= d2;
    r2 *= d2;
    
    var pi = app.activeDocument.activeLayer.pathItems.add();
    with(pi){
        setEntirePath([p1a, p2a, p2b, p1b]);
        var pt = pathPoints;
        with(pt[0]){
            leftDirection = anchor;
            rightDirection = setPnt(p1a, t1a - pi2, r1);
        }
        with(pt[1]){
            rightDirection = anchor;
            leftDirection = setPnt(p2a, t2a + pi2, r2);
        }
        with(pt[2]){
            leftDirection = anchor;
            rightDirection = setPnt(p2b, t2b - pi2, r2);
        }
        with(pt[3]){
            rightDirection = anchor;
            leftDirection = setPnt(p1b, t1b + pi2, r1);
        }
        
        stroked = s0.stroked;
        if(stroked) strokeColor = s0.strokeColor;
        filled = s0.filled;
        if(filled) fillColor = s0.fillColor;
        closed = true;
    }
    return pi;
}

function getGBCenterWidth(pi){
    var gb = pi.geometricBounds;
    var w = gb[2] - gb[0];
    var h = gb[1] - gb[3];
    return [[gb[0] + w / 2, gb[3] + h / 2], w];
}

function setPnt(pnt, rad, dis){
    return [pnt[0] + Math.cos(rad) * dis,
            pnt[1] + Math.sin(rad) * dis];
}

function dist(p1, p2) {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2)
                     + Math.pow(p1[1] - p2[1], 2));
}

function getRad(p1,p2) {
    return Math.atan2(p2[1] - p1[1],
                      p2[0] - p1[0]);
}

function getPathItemsInSelection(n, paths){
    if(documents.length < 1) return;
    
    var s = activeDocument.selection;
    
    if (!(s instanceof Array) || s.length < 1) return;

    extractPaths(s, n, paths);
}

function extractPaths(s, pp_length_limit, paths){
    for(var i = 0; i < s.length; i++){
        if(s[i].typename == "PathItem"
           && !s[i].guides && !s[i].clipping){
            if(pp_length_limit
               && s[i].pathPoints.length <= pp_length_limit){
                continue;
            }
            paths.push(s[i]);
            
        } else if(s[i].typename == "GroupItem"){
            extractPaths(s[i].pageItems, pp_length_limit, paths);
            
        } else if(s[i].typename == "CompoundPathItem"){
            extractPaths(s[i].pathItems, pp_length_limit , paths);
        }
    }
}