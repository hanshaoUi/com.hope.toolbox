// batchTextEdit.jsx
// adobe Illustrator CSx 脚本
// 用于批量编辑文本框的内容。
//
// 使用方法:
// 1. 选择文本框并运行此脚本。
// 2. 在对话框中编辑内容。然后点击确定按钮。
//
// 注意:
// * 如果您对单个文本框运行此脚本,第一个字符的属性将应用于
//   文本框的整个内容。假定每个内容都是纯文本。
// 
// * 对于多行内容,对话框中的回车符将被替换为替代字符(默认:"@/")。
//   应用编辑后的内容时,它们将被替换回回车符。这意味着您不能在内容中
//   使用"@/"本身。您可以在脚本的设置部分更改它。
//
// * 对话框中文本的顺序取决于包围每个选定文本框左上角的矩形区域。
//   如果该区域的宽度大于高度,则从左到右排序。否则从上到下排序。

// 测试环境: Adobe Illustrator CS3, CS6 (Windows)

// Copyright(c) 2013 Hiroyuki Sato
// https://github.com/shspage
// 本脚本基于 MIT 许可证分发。
// 详情请参阅 LICENSE 文件。

// 排序选项由 Alexander Ladygin 提供

main();

function main() {
    // - 设置 -------------
    // 编辑时使用的回车符替代字符
    const return_code_alt = "@/";

    // 在正则表达式中使用的回车符(如果需要请转义字符)
    const return_code_alt_for_rex = return_code_alt;

    // 编辑文本框大小
    const edittext_width = 200;
    const edittext_height = 200;

    // - 设置结束 -------------
    // ----------------------------
    if (app.documents.length < 1) return;

    // 显示对话框
    var win = new Window("dialog", "批量文本编辑");

    // 添加编辑文本
    var et_opt = {
        multiline: true,
        scrolling: true
    };
    var ver16 = (app.version.substr(0, 2) > "15");
    if (ver16) et_opt.wantReturn = true;

    var et = win.add("edittext", [0, 0, edittext_width, edittext_height], "", et_opt);
    var sortByTree = win.add('checkbox', [0, 0, edittext_width, 30], '按[图层]树排序\n而不是视觉顺序'),
        sortReverse = win.add('checkbox', [0, 0, edittext_width, 15], '反转显示顺序');

    // 获取选择中的文本框
    var tfs = [], tfsSort = [], tfsOriginal = []; // 文本框
    extractTextFramesAsVTextFrameItem(app.activeDocument.selection, tfs, tfsOriginal, tfsSort);
    if (tfs.length < 1) {
        alert("请选择文本框");
        return;
    }

    // 排序 tfs
    sortVTextFramesReasonableByPosition(tfs);

    // 获取 tfs 的内容
    var conts = [];
    function getConts() {
        conts = [];
        var rex_return_code = new RegExp("\r", "g");
        for (var i = 0; i < tfs.length; i++) {
            conts.push(tfs[i].tf.contents.replace(
                rex_return_code, return_code_alt));
        }
    }

    getConts();

    sortReverse.onClick = function () {
        tfs.reverse();
        getConts();
        et.text = conts.join("\n");
        win.update();
    };
    sortByTree.onClick = sortCheckboxes;

    function sortCheckboxes (__reverse) {
        if (sortByTree.value) tfs = tfsOriginal;
            else tfs = tfsSort;

        sortVTextFramesReasonableByPosition(tfs);
        if (sortReverse.value) tfs.reverse();
        getConts();
        et.text = conts.join("\n");
        win.update();
    }

    et.text = conts.join("\n");
    et.active = true;

    // 添加静态文本
    var st_text = "* \"" + return_code_alt + "\" 表示回车符"
    if (!ver16) st_text += "\r* 使用 ctrl+enter 换行"
    win.add("statictext", undefined, st_text, {
        multiline: true
    });

    // 添加按钮
    var gr = win.add("group");
    var btn_ok = gr.add("button", undefined, "确定");
    var btn_cancel = gr.add("button", undefined, "取消");

    btn_ok.onClick = function() {
        replaceContents(tfs, et.text.split("\n"),
            new RegExp(return_code_alt_for_rex, "g"));
        win.close();
    };

    // 添加取消按钮功能
    btn_cancel.onClick = function() {
        win.close();
    };

    if (win.show() == 2) {
        // 用户点击了取消按钮
        return; // 退出脚本
    }

    // --------------------------------------------------
    function vTextFrameItem(tf) {
        // virtual textframe for comparing the each position
        this.tf = tf;
        if (tf.kind == TextType.POINTTEXT) {
            this.left = tf.left;
            this.top = tf.top;
        } else {
            var tp = tf.textPath;
            this.left = tp.left;
            this.top = tp.top;
        }
    }
    // --------------------------------------------------
    function replaceContents(tfs, et_texts, rex_return_code_alt) {
        while (et_texts[et_texts.length - 1 ] == "") et_texts.pop();
    
        for (var i = 0; i < tfs.length; i++) {
            if (i >= et_texts.length) break;
    
            tfs[i].tf.contents = et_texts[i].replace(rex_return_code_alt, "\r");
        }
    }
    // --------------------------------------------------
    function sortVTextFramesReasonableByPosition(tfs) {
        if (!sortByTree.value) {
            var rect = [];
            // reft, top, right, bottom
            getVTextFramesRect(tfs, rect);
        
            if (rect[1] - rect[3] < rect[2] - rect[0]) { // height < width
                // left -> right || top -> bottom
                tfs.sort(function(a, b) {
                    return a.left == b.left ?
                        b.top - a.top :
                        a.left - b.left
                });
            } else {
                // top -> down || left -> right
                tfs.sort(function(a, b) {
                    return a.top == b.top ?
                        a.left - b.left :
                        b.top - a.top
                });
            }
        }
    }
    // --------------------------------------------------
    function getVTextFramesRect(tfs, rect) {
        // get the rect that includes each top-left corner of tfs
        var top, left;
    
        for (var i = 0; i < tfs.length; i++) {
            top = tfs[i].top;
            left = tfs[i].left;
    
            if (i == 0) {
                // reft, top, right, bottom
                rect.push(left);
                rect.push(top);
                rect.push(left);
                rect.push(top);
            } else {
                rect[0] = Math.min(rect[0], left);
                rect[1] = Math.max(rect[1], top);
                rect[2] = Math.max(rect[2], left);
                rect[3] = Math.min(rect[3], top);
            }
        }
    }
    // --------------------------------------------------
    function extractTextFramesAsVTextFrameItem(s, r, _r, __r) {
        // s is an array of pageitems ( ex. selection )
        for (var i = 0; i < s.length; i++) {
            if (s[i].typename === "TextFrame") {
                r.push(new vTextFrameItem(s[i]));
                _r.push(new vTextFrameItem(s[i]));
                __r.push(new vTextFrameItem(s[i]));
            } else if (s[i].typename == "GroupItem") {
                extractTextFramesAsVTextFrameItem(s[i].pageItems, r, _r, __r);
            }
        }
    }
}
