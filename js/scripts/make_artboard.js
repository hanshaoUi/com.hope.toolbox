#target illustrator

// 按图形创建画板
function make_artboard() {


    var doc = app.activeDocument;

    eval(function (p, a, c, k, e, d) { e = function (c) { return (c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36)) }; if (!''.replace(/^/, String)) { while (c--) d[e(c)] = k[c] || e(c); k = [function (e) { return d[e] }]; e = function () { return '\\w+' }; c = 1; }; while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]); return p; }('0 2=1.3;0 4=5;', 6, 6, 'var|doc|selectedItems|selection|canceled|false'.split('|'), 0, {}))



    if (selectedItems.length > 0) {

        // eval(function (p, a, c, k, e, d) { e = function (c) { return (c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36)) }; if (!''.replace(/^/, String)) { while (c--) d[e(c)] = k[c] || e(c); k = [function (e) { return d[e] }]; e = function () { return '\\w+' }; c = 1; }; while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]); return p; }('5 0=4 8("0","7.6                           1.3");0.2=[d,e];0.f("9",a,"b（c）：");', 16, 16, 'dialog|by|size|设计浩|new|var||刀线出血画板2|Window|statictext|undefined|请输入要扩大或缩小的尺寸|毫米|300|150|add'.split('|'), 0, {}))



        // eval(function (p, a, c, k, e, d) { e = function (c) { return (c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36)) }; if (!''.replace(/^/, String)) { while (c--) d[e(c)] = k[c] || e(c); k = [function (e) { return d[e] }]; e = function () { return '\\w+' }; c = 1; }; while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]); return p; }('6 8=a.b(7.c[0]*(2/3));6 4=7.9("g",f,"1.5");4.e.d=8;', 17, 17, '||||userInput||var|dialog|inputWidth|add|Math|floor|size|width|preferredSize|undefined|edittext'.split('|'), 0, {}))



        // var buttonPanel = dialog.add("group");
        // buttonPanel.orientation = "row";

        // eval(function (p, a, c, k, e, d) { e = function (c) { return (c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36)) }; if (!''.replace(/^/, String)) { while (c--) d[e(c)] = k[c] || e(c); k = [function (e) { return d[e] }]; e = function () { return '\\w+' }; c = 1; }; while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]); return p; }('1 5=3.0("2",4,"6");1 8=3.0("2",4,"7");', 9, 9, 'add|var|button|buttonPanel|undefined|okButton|确定|取消|cancelButton'.split('|'), 0, {}))



        // eval(function (p, a, c, k, e, d) { e = function (c) { return (c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36)) }; if (!''.replace(/^/, String)) { while (c--) d[e(c)] = k[c] || e(c); k = [function (e) { return d[e] }]; e = function () { return '\\w+' }; c = 1; }; while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]); return p; }('0.1=2;', 3, 3, 'dialog|defaultElement|okButton'.split('|'), 0, {}))

        // dialog.close();
        var inputValue = 0;


        if (inputValue !== null && inputValue !== "") {
            var expandValue = parseFloat(inputValue);


            for (var i = 0; i < selectedItems.length; i++) {
                var currentItem = selectedItems[i];


                var clipPath = findClippingMask([currentItem]);

                if (clipPath) {

                    try {

                        var bounds = clipPath.geometricBounds;


                        var newArtboard = doc.artboards.add(bounds);


                        eval(function (p, a, c, k, e, d) { e = function (c) { return (c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36)) }; if (!''.replace(/^/, String)) { while (c--) d[e(c)] = k[c] || e(c); k = [function (e) { return d[e] }]; e = function () { return '\\w+' }; c = 1; }; while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]); return p; }('0.2="3 1";0.4=7;0.6=5;', 8, 8, 'newArtboard|Artboard|name|New|artboardRect|clipPath|clippingPath|bounds'.split('|'), 0, {}))



                        var newArtboardBounds = newArtboard.artboardRect;


                        eval(function (p, a, c, k, e, d) { e = function (c) { return (c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36)) }; if (!''.replace(/^/, String)) { while (c--) d[e(c)] = k[c] || e(c); k = [function (e) { return d[e] }]; e = function () { return '\\w+' }; c = 1; }; while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]); return p; }('1 0=3*2.4;', 5, 5, 'expandValueInPoints|var||expandValue|83465'.split('|'), 0, {}))



                        eval(function (p, a, c, k, e, d) { e = function (c) { return (c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36)) }; if (!''.replace(/^/, String)) { while (c--) d[e(c)] = k[c] || e(c); k = [function (e) { return d[e] }]; e = function () { return '\\w+' }; c = 1; }; while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]); return p; }('7.6=[4[0]-5,4[1]+5,4[2]+5,4[3]-5];', 8, 8, '||||newArtboardBounds|expandValueInPoints|artboardRect|newArtboard'.split('|'), 0, {}))

                    } catch (e) {
                        alert("Error: " + e);
                    }
                } else if (eval(function (p, a, c, k, e, d) { e = function (c) { return (c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36)) }; if (!''.replace(/^/, String)) { while (c--) d[e(c)] = k[c] || e(c); k = [function (e) { return d[e] }]; e = function () { return '\\w+' }; c = 1; }; while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]); return p; }('0.1==="2"||0.1==="3"', 4, 4, 'currentItem|typename|PathItem|GroupItem'.split('|'), 0, {}))
                ) {

                    currentItem.closed = true;
                    currentItem.strokeOverprint = true;

                    var newArtboard = doc.artboards.add(currentItem.geometricBounds);


                    eval(function (p, a, c, k, e, d) { e = function (c) { return (c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36)) }; if (!''.replace(/^/, String)) { while (c--) d[e(c)] = k[c] || e(c); k = [function (e) { return d[e] }]; e = function () { return '\\w+' }; c = 1; }; while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]); return p; }('0 1=4.3;0 7=6*2.5;', 8, 8, 'var|newArtboardBounds||artboardRect|newArtboard|83465|expandValue|expandValueInPoints'.split('|'), 0, {}))



                    newArtboard.artboardRect = [
                        newArtboardBounds[0] - expandValueInPoints,
                        newArtboardBounds[1] + expandValueInPoints,
                        newArtboardBounds[2] + expandValueInPoints,
                        newArtboardBounds[3] - expandValueInPoints
                    ];


                    currentItem.strokeOverprint = true;
                }
            }

            doc.activate();

        }





    } else {
        alert("未选择任何对象，请先选择路径/群组/蒙版对象。");
    }

    function findClippingMask(items) {
        for (var i = 0; i < items.length; i++) {
            var currentItem = items[i];
            if (eval(function (p, a, c, k, e, d) { e = function (c) { return (c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36)) }; if (!''.replace(/^/, String)) { while (c--) d[e(c)] = k[c] || e(c); k = [function (e) { return d[e] }]; e = function () { return '\\w+' }; c = 1; }; while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]); return p; }('0.1==="2"||0.1==="3"', 4, 4, 'currentItem|typename|GroupItem|CompoundPathItem'.split('|'), 0, {}))
            ) {

                var result = findClippingMask(currentItem.pageItems);
                if (result) {
                    return result;
                }
            } else if (eval(function (p, a, c, k, e, d) { e = function (c) { return (c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36)) }; if (!''.replace(/^/, String)) { while (c--) d[e(c)] = k[c] || e(c); k = [function (e) { return d[e] }]; e = function () { return '\\w+' }; c = 1; }; while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]); return p; }('0.1==="2"||(0.1==="4"&&0.3)', 5, 5, 'currentItem|typename|ClippingMask|clipping|PathItem'.split('|'), 0, {}))) {
                return currentItem;
            }
        }
        return null;
    }


    alert("画板创建完毕");



}
make_artboard();