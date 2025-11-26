#target illustrator

// 创建对话框
var dialog = new Window("dialog", "合并锚点");
dialog.orientation = "column";
dialog.alignChildren = ["left", "top"];
dialog.spacing = 10;
dialog.margins = 16;

// 创建输入组
var inputGroup = dialog.add("group");
inputGroup.orientation = "row";
inputGroup.alignChildren = ["left", "center"];
inputGroup.spacing = 10;

inputGroup.add("statictext", undefined, "最小距离");
var input = inputGroup.add("edittext", undefined, "0.1");
input.characters = 10;
inputGroup.add("statictext", undefined, "mm");

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
    var minDistMM = parseFloat(input.text);
    if (isNaN(minDistMM) || minDistMM <= 0) {
        alert("请输入有效的正数值。");
    } else {
        // 将毫米转换为点 (1 mm ≈ 2.83465 点)
        var minDist = minDistMM * 2.83465;
        // 平方化最小距离以便于后续计算
        minDist *= minDist;

        var totalReduced = 0;
        var paths = [];
        getPathItemsInSelection(2, paths);

        if(paths.length > 0){
            for(var j = 0; j < paths.length; j++){
                var p = paths[j].pathPoints;
                var result = readjustAnchors(p, minDist);
                totalReduced += result.before - result.after;
            }
            alert("总共合并了 " + totalReduced + " 个锚点。");
        } else {
            alert("未选中任何路径。");
        }
    }
}

function readjustAnchors(p, minDist){
    var result = {before: p.length, after: 0};
    
    if(p.parent.closed){
        for(var i = p.length - 1; i >= 1; i--){
            if(dist2(p[0].anchor, p[i].anchor) < minDist){
                p[0].leftDirection = p[i].leftDirection;
                p[i].remove();
            } else {
                break;
            }
        }
    }
    
    for(var i = p.length - 1; i >= 1; i--){
        if(dist2(p[i].anchor, p[i-1].anchor) < minDist){
            p[i-1].rightDirection = p[i].rightDirection;
            p[i].remove();
        }
    }
    
    result.after = p.length;
    return result;
}

function dist2(p1, p2) {
    return Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2);
}

function getPathItemsInSelection(n, paths){
    if(documents.length < 1) return;
    
    var s = activeDocument.selection;
    
    if (!(s instanceof Array) || s.length < 1) return;

    extractPaths(s, n, paths);
}

function extractPaths(s, pp_length_limit, paths){
    for(var i = 0; i < s.length; i++){
        if(s[i].typename == "PathItem"){
            if(pp_length_limit && s[i].pathPoints.length <= pp_length_limit){
                continue;
            }
            paths.push(s[i]);
        } else if(s[i].typename == "GroupItem"){
            extractPaths(s[i].pageItems, pp_length_limit, paths);
        } else if(s[i].typename == "CompoundPathItem"){
            extractPaths(s[i].pathItems, pp_length_limit, paths);
        }
    }
}
