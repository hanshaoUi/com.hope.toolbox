#target illustrator
// 尺寸标注
function make_size() {
    var VersionInfo = "v2.0";
    var layName = "尺寸标注层";
    var color = new CMYKColor();
    var topCheck = false;
    var defaultTopCheck = $.getenv("Specify_defaultTopCheck") ? convertToBoolean($.getenv("Specify_defaultTopCheck")) : topCheck;
    var rightCheck = false;
    var defaultRightCheck = $.getenv("Specify_defaultRightCheck") ? convertToBoolean($.getenv("Specify_defaultRightCheck")) : rightCheck;
    var bottomCheck = false;
    var defaultBottomCheck = $.getenv("Specify_defaultBottomCheck") ? convertToBoolean($.getenv("Specify_defaultBottomCheck")) : bottomCheck;
    var leftCheck = false;
    var defaultLeftCheck = $.getenv("Specify_defaultLeftCheck") ? convertToBoolean($.getenv("Specify_defaultLeftCheck")) : leftCheck;
    var allSidesCheck = false;
    var defaultAllSidesCheck = $.getenv("Specify_defaultAllSidesCheck") ? convertToBoolean($.getenv("Specify_defaultAllSidesCheck")) : allSidesCheck;
    var eachLength = true;
    var defaultEachLength = $.getenv("Specify_defaultEachLength") ? convertToBoolean($.getenv("Specify_defaultEachLength")) : eachLength;
    var betweenLength = false;
    var defaultObjBetween = $.getenv("Specify_defaultObjBetween") ? convertToBoolean($.getenv("Specify_defaultObjBetween")) : betweenLength;
    var overallLength = false;
    var defaultOverallLength = $.getenv("Specify_defaultOverallLength") ? convertToBoolean($.getenv("Specify_defaultOverallLength")) : overallLength;
    var setFaceFont = 0;
    var defaultFontFace = $.getenv("Specify_defaultFontFace") ? $.getenv("Specify_defaultFontFace") : setFaceFont;
    var setUnitMode = 0;
    var defaultUnitMode = $.getenv("Specify_defaultUnitMode") ? $.getenv("Specify_defaultUnitMode") : setUnitMode;
    var setScale = 0;
    var defaultScale = $.getenv("Specify_defaultScale") ? $.getenv("Specify_defaultScale") : setScale;
    var setFontSize = 12;
    var defaultFontSize = $.getenv("Specify_defaultFontSize") ? $.getenv("Specify_defaultFontSize") : setFontSize;
    var setDecimals = 2;
    var defaultDecimals = $.getenv("Specify_defaultDecimals") ? $.getenv("Specify_defaultDecimals") : setDecimals;
    var setLineWeight = 0.5;
    var defaultLineWeight = $.getenv("Specify_defaultLineWeight") ? $.getenv("Specify_defaultLineWeight") : setLineWeight;
    var setgap = 3;
    var defaultlineGap = $.getenv("Specify_defaultlineGap") ? $.getenv("Specify_defaultlineGap") : setgap;
    var setDoubleLine = 8;
    var defaultDoubleLine = $.getenv("Specify_defaultDoubleLine") ? $.getenv("Specify_defaultDoubleLine") : setDoubleLine;
    var setArrow = false;
    var defaultArrow = $.getenv("Specify_defaultArrow") ? convertToBoolean($.getenv("Specify_defaultArrow")) : setArrow;
    var setAsizeSize = 6;
    var defaultTriangleSize = $.getenv("Specify_defaultTriangleSize") ? $.getenv("Specify_defaultTriangleSize") : setAsizeSize;
    var setArrowSealing = false;
    var defaultArrowSealing = $.getenv("Specify_defaultArrowSealing") ? convertToBoolean($.getenv("Specify_defaultArrowSealing")) : setArrowSealing;
    var setCyan = 0;
    var defaultColorCyan = $.getenv("Specify_defaultColorCyan") ? $.getenv("Specify_defaultColorCyan") : setCyan;
    var setMagenta = 100;
    var defaultColorMagenta = $.getenv("Specify_defaultColorMagenta") ? $.getenv("Specify_defaultColorMagenta") : setMagenta;
    var setYellow = 100;
    var defaultColorYellow = $.getenv("Specify_defaultColorYellow") ? $.getenv("Specify_defaultColorYellow") : setYellow;
    var setBlack = 10;
    var defaultColorBlack = $.getenv("Specify_defaultColorBlack") ? $.getenv("Specify_defaultColorBlack") : setBlack;
    var setUnits = false;
    var defaultUnits = $.getenv("Specify_defaultUnits") ? convertToBoolean($.getenv("Specify_defaultUnits")) : setUnits;
    var lineStrokes = false;
    var defaultLineStrokes = $.getenv("Specify_defaultLineStrokes") ? convertToBoolean($.getenv("Specify_defaultLineStrokes")) : lineStrokes;
    var setlockedLay = false;
    var defaultlockedLay = $.getenv("Specify_defaultlockedLay") ? convertToBoolean($.getenv("Specify_defaultlockedLay")) : setlockedLay;
    var win = new Window("dialog", "标注尺寸 " + VersionInfo, undefined, {
        closeButton: false
    });
    win.alignChildren = "left";
    dimensionPanel = win.add("panel", undefined, "选择标注边");
    dimensionPanel.orientation = "column";
    dimensionPanel.alignment = "fill";
    dimensionPanel.margins = [20, 20, 20, 10];
    dimensionGroup = dimensionPanel.add("group");
    dimensionGroup.orientation = "row";
    bottomCheckbox = dimensionGroup.add("checkbox", undefined, "下边");
    bottomCheckbox.value = defaultBottomCheck;
    bottomCheckbox.helpTip = "在对象下边标注尺寸。";
    leftCheckbox = dimensionGroup.add("checkbox", undefined, "左边");
    leftCheckbox.value = defaultLeftCheck;
    leftCheckbox.helpTip = "在对象左边标注尺寸。";
    topCheckbox = dimensionGroup.add("checkbox", undefined, "上边");
    topCheckbox.value = defaultTopCheck;
    topCheckbox.helpTip = "在对象上边标注尺寸。";
    rightCheckbox = dimensionGroup.add("checkbox", undefined, "右边");
    rightCheckbox.value = defaultRightCheck;
    rightCheckbox.helpTip = "在对象右边标注尺寸。";
    selectAllGroup = dimensionPanel.add("group");
    selectAllGroup.orientation = "row";
    selectAllCheckbox = selectAllGroup.add("checkbox", undefined, "四边");
    selectAllCheckbox.helpTip = "在对象四边标注尺寸。";
    selectAllCheckbox.value = defaultAllSidesCheck;
    selectAllCheckbox.onClick = function () {
        if (selectAllCheckbox.value) {
            bottomCheckbox.value = true;
            bottomCheckbox.enabled = false;
            leftCheckbox.value = true;
            leftCheckbox.enabled = false;
            topCheckbox.value = true;
            topCheckbox.enabled = false;
            rightCheckbox.value = true;
            rightCheckbox.enabled = false;
        } else {
            bottomCheckbox.value = false;
            bottomCheckbox.enabled = true;
            leftCheckbox.value = false;
            leftCheckbox.enabled = true;
            topCheckbox.value = false;
            topCheckbox.enabled = true;
            rightCheckbox.value = false;
            rightCheckbox.enabled = true;
        }
        restoreDefaultsButton.enabled = true;
    };
    bottomCheckbox.onClick = function () {
        if (!bottomCheckbox.value) {
            selectAllCheckbox.value = false;
        }
    };
    leftCheckbox.onClick = function () {
        if (!leftCheckbox.value) {
            selectAllCheckbox.value = false;
        }
    };
    topCheckbox.onClick = function () {
        if (!topCheckbox.value) {
            selectAllCheckbox.value = false;
        }
    };
    rightCheckbox.onClick = function () {
        if (!rightCheckbox.value) {
            selectAllCheckbox.value = false;
        }
    };
    optionsPanel = win.add("panel", undefined, "设置选项");
    optionsPanel.margins = 20;
    optionsPanel.orientation = "column";
    modeChecksGroup = optionsPanel.add("group");
    modeChecksGroup.orientation = "row";
    modeChecksGroup.alignment = "left";
    eachSizeCheck = modeChecksGroup.add("checkbox", undefined, "单体标注");
    eachSizeCheck.helpTip = "每个对象单独尺寸标注模式。";
    eachSizeCheck.value = defaultEachLength;
    eachSizeCheck.onClick = function () {
        restoreDefaultsButton.enabled = true;
    };
    betweenCheckbox = modeChecksGroup.add("checkbox", undefined, "间距标注");
    betweenCheckbox.helpTip = "两个对象之间距离标注模式。";
    betweenCheckbox.value = defaultObjBetween;
    betweenCheckbox.enabled = true;
    betweenCheckbox.onClick = function () {
        restoreDefaultsButton.enabled = true;
    };
    entiretySizeCheck = modeChecksGroup.add("checkbox", undefined, "总距离标注");
    entiretySizeCheck.helpTip = "所选对象总尺寸标注模式。";
    entiretySizeCheck.value = defaultOverallLength;
    entiretySizeCheck.enabled = true;
    entiretySizeCheck.onClick = function () {
        restoreDefaultsButton.enabled = true;
    };
    customScaleGroup = optionsPanel.add("group");
    customScaleGroup.orientation = "row";
    customScaleGroup.alignment = "left";
    unitModeLabel = customScaleGroup.add("statictext", undefined, "单位:");
    unitModeList = customScaleGroup.add("dropdownlist", [50, 10, 145, 30]);
    unitModeList.helpTip = "标注值的单位转换。\n默认: 自动（随软件）";


    var items = new Array("自动-auto", "毫米-mm", "厘米-cm", "米-m", "磅-pt", "像素-px", "英寸-in", "英尺-ft", "派卡-pc");
    for (var j = 0; j < items.length; j += 1) {
        if (j == 0) {
            unitModeList.add("item", items[0]);
            unitModeList.add("separator");
        } else {
            unitModeList.add("item", items[j]);
        }
    }
    unitModeList.selection = defaultUnitMode;
    unitModeList.onChange = function () {
        restoreDefaultsButton.enabled = true;
    };
    customScaleLabel = customScaleGroup.add("statictext", undefined, "比例:");
    customScaleLabel.enabled = true;
    customScaleDropdown = customScaleGroup.add("dropdownlist", [50, 10, 120, 30]);
    customScaleDropdown.helpTip = "对象标注值的比例。\n例如：25在1/4比例时，值显示为100。\n\n默认值: 1/1";
    for (var n = 1; n <= 10; n += 1) {
        if (n == 1) {
            customScaleDropdown.add("item", "1/" + n);
            customScaleDropdown.add("separator");
        } else {
            customScaleDropdown.add("item", "1/" + n);
        }
    }
    customScaleDropdown.add("separator");
    customScaleDropdown.add("item", "1/15");
    customScaleDropdown.add("item", "1/20");
    customScaleDropdown.add("item", "1/25");
    customScaleDropdown.add("item", "1/50");
    customScaleDropdown.add("item", "1/100");
    customScaleDropdown.add("item", "1/150");
    customScaleDropdown.add("item", "1/200");
    customScaleDropdown.add("item", "1/300");
    customScaleDropdown.selection = defaultScale;
    customScaleDropdown.enabled = true;
    customScaleDropdown.onChange = function () {
        restoreDefaultsButton.enabled = true;
    };
    textFontGroup = optionsPanel.add("group");
    textFontGroup.orientation = "row";
    textFontGroup.alignment = "left";
    fontdrpLabel = textFontGroup.add("statictext", undefined, "字体:");
    fontdrplist = textFontGroup.add("dropdownlist", [50, 10, 267, 30]);
    fontdrplist.helpTip = "标注尺寸字体样式。\n默认:  系统默认";
    var items = new Array("系统默认", "微软雅黑", "黑体", "宋体", "Arial", "Arial-Bold", "ArialUnicode", "Tahoma", "Tahoma-Bold", "Times New Roman", "Times New Roman-Bold");
    for (var j = 0; j < items.length; j += 1) {
        if (j == 0) {
            fontdrplist.add("item", items[0]);
            fontdrplist.add("separator");
        } else {
            fontdrplist.add("item", items[j]);
        }
    }
    fontdrplist.selection = defaultFontFace;
    surfacefont(String(fontdrplist.selection));
    fontdrplist.onChange = function () {
        A = fontdrplist.selection.items;
        surfacefont(String(fontdrplist.selection));
        setFaceFont = fontNamelist;
        restoreDefaultsButton.enabled = true;
    };

    function surfacefont(A) {
        if (A == items[0]) {
            fontNamelist = "";
        } else if (A == items[1]) {
            fontNamelist = "MicrosoftYaHei";
        } else if (A == items[2]) {
            fontNamelist = "Simhei";
        } else if (A == items[3]) {
            fontNamelist = "simsun";
        } else if (A == items[4]) {
            fontNamelist = "ArialMT";
        } else if (A == items[5]) {
            fontNamelist = "Arial-BoldMT";
        } else if (A == items[6]) {
            fontNamelist = "ArialUnicodeMS";
        } else if (A == items[7]) {
            fontNamelist = "Tahoma";
        } else if (A == items[8]) {
            fontNamelist = "Tahoma-Bold";
        } else if (A == items[9]) {
            fontNamelist = "TimesNewRomanPSMT";
        } else {
            if (A == items[10]) {
                fontNamelist = "TimesNewRomanPS-BoldMT";
            }
        }
    }
    textSiteGroup = optionsPanel.add("group");
    textSiteGroup.orientation = "row";
    textSiteGroup.alignment = "left";
    fontSizeLabel = textSiteGroup.add("statictext", undefined, "字号大小:");
    fontSizeInput = textSiteGroup.add("edittext", undefined, defaultFontSize);
    fontSizeInput.helpTip = "标注字体的大小。\n默认值: " + setFontSize + "pt";
    fontSizeInput.characters = 6;
    fontSizeInput.onActivate = function () {
        restoreDefaultsButton.enabled = true;
    };
    decimalPlacesLabel = textSiteGroup.add("statictext", undefined, "小数位数:");
    decimalPlacesInput = textSiteGroup.add("edittext", undefined, defaultDecimals);
    decimalPlacesInput.helpTip = "数值后小数位数 (0~6)。\n默认值: " + setDecimals;
    decimalPlacesInput.characters = 6;
    decimalPlacesInput.onActivate = function () {
        restoreDefaultsButton.enabled = true;
    };
    decimalPlacesInput.onChange = function () {
        decimalPlacesInput.text = decimalPlacesInput.text.replace(/[^0-9]/g, "");
    };
    lineGroup = optionsPanel.add("group");
    lineGroup.orientation = "row";
    lineGroup.alignment = "left";
    lineWeightLabel = lineGroup.add("statictext", undefined, "标线宽度:");
    lineWeightInput = lineGroup.add("edittext", undefined, defaultLineWeight);
    lineWeightInput.helpTip = "标注字体的大小。\n默认值: " + setLineWeight + "pt";
    lineWeightInput.characters = 6;
    lineWeightInput.onActivate = function () {
        restoreDefaultsButton.enabled = true;
    };
    lineWeightInput.onChange = function () {
        lineWeightInput.text = lineWeightInput.text.replace(/[^0-9.]/g, "");
    };
    lineGapLabel = lineGroup.add("statictext", undefined, "标线距离:");
    lineGapInput = lineGroup.add("edittext", undefined, defaultlineGap);
    lineGapInput.helpTip = "标注线与对象边界的距离。\n支持负数值，例：-3。\n默认值: " + setgap + "pt";
    lineGapInput.characters = 6;
    lineGapInput.onActivate = function () {
        restoreDefaultsButton.enabled = true;
    };
    lineGroup2 = optionsPanel.add("group");
    lineGroup2.orientation = "row";
    lineGroup2.alignment = "left";
    doubleLineLabel = lineGroup2.add("statictext", undefined, "界线长:");
    doubleLineInput = lineGroup2.add("edittext", undefined, defaultDoubleLine);
    doubleLineInput.helpTip = "标注线两端的短线段。\n默认值: " + setDoubleLine + "pt";
    doubleLineInput.characters = 3;
    doubleLineInput.onActivate = function () {
        restoreDefaultsButton.enabled = true;
    };
    arrowCheckbox = lineGroup2.add("checkbox", undefined, "箭头:");
    arrowCheckbox.helpTip = "显示/隐藏标线两端箭头符号。";
    arrowCheckbox.value = defaultArrow;
    triangleSizeLabel = lineGroup2.add("statictext", undefined, "");
    triangleSizeInput = lineGroup2.add("edittext", undefined, defaultTriangleSize);
    triangleSizeInput.helpTip = "标注线两端的箭头尺寸。\n默认值: " + setAsizeSize + "pt";
    triangleSizeInput.characters = 3;
    triangleSizeInput.enabled = true;
    arrowSealingCheckbox = lineGroup2.add("checkbox", undefined, "实心");
    arrowSealingCheckbox.helpTip = "线与面箭头模式切换。";
    arrowSealingCheckbox.value = defaultArrowSealing;
    arrowSealingCheckbox.enabled = true;
    arrowSealingCheckbox.onClick = function () {
        restoreDefaultsButton.enabled = true;
    };
    arrowCheckbox.onClick = function () {
        if (arrowCheckbox.value) {
            triangleSizeLabel.enabled = true;
            triangleSizeInput.enabled = true;
            arrowSealingCheckbox.enabled = true;
            restoreDefaultsButton.enabled = true;
        } else {
            triangleSizeLabel.enabled = false;
            triangleSizeInput.enabled = false;
            arrowSealingCheckbox.value = false;
            arrowSealingCheckbox.enabled = false;
            restoreDefaultsButton.enabled = true;
        }
    };
    if (arrowCheckbox.value) {
        triangleSizeLabel.enabled = true;
        triangleSizeInput.enabled = true;
        arrowSealingCheckbox.enabled = true;
    } else {
        triangleSizeLabel.enabled = false;
        triangleSizeInput.enabled = false;
        arrowSealingCheckbox.enabled = false;
    }
    triangleSizeInput.onActivate = function () {
        restoreDefaultsButton.enabled = true;
    };
    colorGroup = optionsPanel.add("group");
    colorGroup.orientation = "row";
    colorGroup.alignment = "left";
    colorLabel = colorGroup.add("statictext", undefined, "标注颜色:");
    colorInputCyan = colorGroup.add("edittext", undefined, defaultColorCyan);
    colorInputCyan.helpTip = "青色值 C（0-100）。\n默认值: " + setCyan;
    colorInputCyan.characters = 4;
    colorInputMagenta = colorGroup.add("edittext", undefined, defaultColorMagenta);
    colorInputMagenta.helpTip = "红色值 M（0-100）。\n默认值: " + setMagenta;
    colorInputMagenta.characters = 4;
    colorInputYellow = colorGroup.add("edittext", undefined, defaultColorYellow);
    colorInputYellow.helpTip = "黄色值 Y（0-100）。\n默认值: " + setYellow;
    colorInputYellow.characters = 4;
    colorInputBlack = colorGroup.add("edittext", undefined, defaultColorBlack);
    colorInputBlack.helpTip = "黑色值 K（0-100）。\n默认值: " + setBlack;
    colorInputBlack.characters = 4;
    colorInputCyan.onActivate = function () {
        restoreDefaultsButton.enabled = true;
    };
    colorInputMagenta.onActivate = function () {
        restoreDefaultsButton.enabled = true;
    };
    colorInputYellow.onActivate = function () {
        restoreDefaultsButton.enabled = true;
    };
    colorInputBlack.onActivate = function () {
        restoreDefaultsButton.enabled = true;
    };
    checkOptionGroup = optionsPanel.add("group");
    checkOptionGroup.orientation = "row";
    checkOptionGroup.alignment = "left";
    textUnitsCheck = checkOptionGroup.add("checkbox", undefined, "单位后缀");
    textUnitsCheck.helpTip = "显示标注值单位。\n示例: 220 mm";
    textUnitsCheck.value = defaultUnits;
    textUnitsCheck.onClick = function () {
        restoreDefaultsButton.enabled = true;
    };
    lineStrokeCheckbox = checkOptionGroup.add("checkbox", undefined, "包含描边");
    lineStrokeCheckbox.helpTip = "标注包含对象描边的尺寸。";
    lineStrokeCheckbox.value = defaultLineStrokes;
    lineStrokeCheckbox.onClick = function () {
        restoreDefaultsButton.enabled = true;
    };
    lockedLay = checkOptionGroup.add("checkbox", undefined, "锁标注层");
    lockedLay.helpTip = "标注后，锁住 (" + layName + ") 图层。";
    lockedLay.value = defaultlockedLay;
    lockedLay.onClick = function () {
        restoreDefaultsButton.enabled = true;
    };
    aboutButton = checkOptionGroup.add("button", undefined, "?", {
        name: "?"
    });
    aboutButton.size = [15, 15];
    aboutButton.helpTip = "关于";
    aboutButton.onClick = function () {
        alert("快速标注尺寸 " + VersionInfo + " \nQuick Dimensions " + VersionInfo + " \n\n※ 根据选择的对象，进行标注尺寸。\n" + "1、支持单个对象、两对象间距及总距标注。\n" + "2、支持蒙版对象、群组蒙版、含描边标注。\n" + "3、设置具有记忆功能，在退出AI前不改变。");
    };
    restoreDefaultsButton = optionsPanel.add("button", undefined, "恢复默认值");
    restoreDefaultsButton.alignment = "center";
    restoreDefaultsButton.size = [120, 25];
    restoreDefaultsButton.enabled = eachLength != defaultEachLength || betweenLength != defaultObjBetween || overallLength != defaultOverallLength || setUnitMode != defaultUnitMode || setScale != defaultScale || setFaceFont != defaultFontFace || setFontSize != defaultFontSize || setDecimals != defaultDecimals || setLineWeight != defaultLineWeight || setgap != defaultlineGap || setDoubleLine != defaultDoubleLine || setAsizeSize != defaultTriangleSize || setArrow != defaultArrow || setArrowSealing != defaultArrowSealing || setCyan != defaultColorCyan || setMagenta != defaultColorMagenta || setYellow != defaultColorYellow || setBlack != defaultColorBlack || setUnits != defaultUnits || lineStrokes != defaultLineStrokes || setlockedLay != defaultlockedLay ? true : false;
    restoreDefaultsButton.onClick = function () {
        restoreDefaults();
    };

    function restoreDefaults() {
        topCheckbox.value = topCheck;
        topCheckbox.enabled = true;
        rightCheckbox.value = rightCheck;
        rightCheckbox.enabled = true;
        bottomCheckbox.value = bottomCheck;
        bottomCheckbox.enabled = true;
        leftCheckbox.value = leftCheck;
        leftCheckbox.enabled = true;
        selectAllCheckbox.value = allSidesCheck;
        eachSizeCheck.value = eachLength;
        betweenCheckbox.value = betweenLength;
        entiretySizeCheck.value = overallLength;
        unitModeList.selection = setUnitMode;
        customScaleDropdown.selection = setScale;
        fontdrplist.selection = setFaceFont;
        fontSizeInput.text = setFontSize;
        decimalPlacesInput.text = setDecimals;
        lineWeightInput.text = setLineWeight;
        lineGapInput.text = setgap;
        doubleLineInput.text = setDoubleLine;
        triangleSizeInput.text = setAsizeSize;
        triangleSizeInput.enabled = false;
        arrowCheckbox.value = setArrow;
        arrowSealingCheckbox.value = setArrowSealing;
        arrowSealingCheckbox.enabled = false;
        colorInputCyan.text = setCyan;
        colorInputMagenta.text = setMagenta;
        colorInputYellow.text = setYellow;
        colorInputBlack.text = setBlack;
        textUnitsCheck.value = setUnits;
        lineStrokeCheckbox.value = lineStrokes;
        lockedLay.value = setlockedLay;
        restoreDefaultsButton.enabled = false;
        $.setenv("Specify_defaultTopCheck", "");
        $.setenv("Specify_defaultRightCheck", "");
        $.setenv("Specify_defaultBottomCheck", "");
        $.setenv("Specify_defaultLeftCheck", "");
        $.setenv("Specify_defaultAllSidesCheck", "");
        $.setenv("Specify_defaultEachLength", "");
        $.setenv("Specify_defaultObjBetween", "");
        $.setenv("Specify_defaultOverallLength", "");
        $.setenv("Specify_defaultUnitMode", "");
        $.setenv("Specify_defaultScale", "");
        $.setenv("Specify_defaultFontFace", "");
        $.setenv("Specify_defaultFontSize", "");
        $.setenv("Specify_defaultDecimals", "");
        $.setenv("Specify_defaultLineWeight", "");
        $.setenv("Specify_defaultlineGap", "");
        $.setenv("Specify_defaultDoubleLine", "");
        $.setenv("Specify_defaultTriangleSize", "");
        $.setenv("Specify_defaultArrow", "");
        $.setenv("Specify_defaultArrowSealing", "");
        $.setenv("Specify_defaultColorCyan", "");
        $.setenv("Specify_defaultColorMagenta", "");
        $.setenv("Specify_defaultColorYellow", "");
        $.setenv("Specify_defaultColorBlack", "");
        $.setenv("Specify_defaultUnits", "");
        $.setenv("Specify_defaultLineStrokes", "");
        $.setenv("Specify_defaultlockedLay", "");
    }
    var buttonGroup = win.add("group");
    buttonGroup.alignment = "column";
    var ok_button = buttonGroup.add("button", undefined, "确定");
    var cancel_button = buttonGroup.add("button", undefined, "退出");
    ok_button.size = cancel_button.size = [80, 25];
    ok_button.onClick = do_DIMENSIONS;
    cancel_button.onClick = function () {
        win.close();
    };
    win.show();

    function do_DIMENSIONS() {
        find_message();
    }

    function find_message() {
        if (check_app() == false) {
            return;
        }
        label_Info();
        win.close();
    }

    function label_Info() {
        var doc = app.activeDocument;
        var sel = doc.selection;
        var top = topCheckbox.value;
        var left = leftCheckbox.value;
        var right = rightCheckbox.value;
        var bottom = bottomCheckbox.value;
        if (!top && !left && !right && !bottom) {
            alert("请至少选择一个标注边。", "信息提示");
            win.show();
        }
        var eachSizes = eachSizeCheck.value;
        var betweenSize = betweenCheckbox.value;
        var entiretySize = entiretySizeCheck.value;
        if (!eachSizes && !betweenSize && !entiretySize) {
            alert("请至少选择一个标注模式。\n 【单体、间距、总距离】", "信息提示");
            win.show();
        }
        var displayTopCheckboxLabel = topCheckbox.value;
        $.setenv("Specify_defaultTopCheck", displayTopCheckboxLabel);
        var displayRightCheckLabel = rightCheckbox.value;
        $.setenv("Specify_defaultRightCheck", displayRightCheckLabel);
        var displayBottomCheckLabel = bottomCheckbox.value;
        $.setenv("Specify_defaultBottomCheck", displayBottomCheckLabel);
        var displayLeftCheckLabel = leftCheckbox.value;
        $.setenv("Specify_defaultLeftCheck", displayLeftCheckLabel);
        var displayAllSidesCheckLabel = selectAllCheckbox.value;
        $.setenv("Specify_defaultAllSidesCheck", displayAllSidesCheckLabel);
        var displayEachLengthLayLabel = eachSizeCheck.value;
        $.setenv("Specify_defaultEachLength", displayEachLengthLayLabel);
        var displayObjBetweenLayLabel = betweenCheckbox.value;
        $.setenv("Specify_defaultObjBetween", displayObjBetweenLayLabel);
        var displayOverallLengthLayLabel = entiretySizeCheck.value;
        $.setenv("Specify_defaultOverallLength", displayOverallLengthLayLabel);
        var theUnitModeList = unitModeList.selection.toString().replace(/[^a-zA-Z]/g, "");
        unitConvert = theUnitModeList;
        $.setenv("Specify_defaultUnitMode", unitModeList.selection.index);
        var theScale = parseInt(customScaleDropdown.selection.toString().replace(/1\//g, "").replace(/[^0-9]/g, ""));
        scale = theScale;
        $.setenv("Specify_defaultScale", customScaleDropdown.selection.index);
        $.setenv("Specify_defaultFontFace", fontdrplist.selection.index);
        var displayArrowCheckLabel = arrowCheckbox.value;
        $.setenv("Specify_defaultArrow", displayArrowCheckLabel);
        var displayArrowSealingCheckLabel = arrowSealingCheckbox.value;
        $.setenv("Specify_defaultArrowSealing", displayArrowSealingCheckLabel);
        var displayUnitsLabel = textUnitsCheck.value;
        $.setenv("Specify_defaultUnits", displayUnitsLabel);
        var displayLineStrokesLayLabel = lineStrokeCheckbox.value;
        $.setenv("Specify_defaultLineStrokes", displayLineStrokesLayLabel);
        var displaylockedLayLabel = lockedLay.value;
        $.setenv("Specify_defaultlockedLay", displaylockedLayLabel);
        if (parseFloat(fontSizeInput.text) > 0) {
            tsize = parseFloat(fontSizeInput.text);
        } else {
            tsize = setFontSize;
        }
        var validFontSize = /^[0-9]{1,3}(\.[0-9]{1,3})?$/.test(fontSizeInput.text);
        if (validFontSize) {
            objtsize = fontSizeInput.text;
            $.setenv("Specify_defaultFontSize", objtsize);
        }
        if (!validFontSize) {
            alert("请输入有效的字号值。\n值范围：>0 ~ 999.999", "错误提示");
            fontSizeInput.active = true;
            fontSizeInput.text = defaultFontSize;
            win.show();
        }
        if (parseFloat(decimalPlacesInput.text) >= 0) {
            decimals = parseFloat(decimalPlacesInput.text);
        } else {
            decimals = setDecimals;
        }
        var validDecimalPlaces = /^[0-6]{1}$/.test(decimalPlacesInput.text);
        if (validDecimalPlaces) {
            objdecimals = decimalPlacesInput.text;
            $.setenv("Specify_defaultDecimals", objdecimals);
        }
        if (!validDecimalPlaces) {
            alert("请输入有效的小数点位数。\n值范围：0 ~ 6整数。", "错误提示");
            decimalPlacesInput.active = true;
            decimalPlacesInput.text = defaultDecimals;
            win.show();
        }
        if (parseFloat(lineWeightInput.text) > 0) {
            LineW = parseFloat(lineWeightInput.text);
        } else {
            LineW = setLineWeight;
        }
        var validLineWeight = /^[0-9]{1,2}(\.[0-9]{1,3})?$/.test(lineWeightInput.text);
        if (validLineWeight) {
            objstrokeW = lineWeightInput.text;
            $.setenv("Specify_defaultLineWeight", objstrokeW);
        }
        if (!validLineWeight) {
            alert("请输入有效的线宽值。\n值范围：>0 ~ 99.999", "错误提示");
            lineWeightInput.active = true;
            lineWeightInput.text = defaultLineWeight;
            win.show();
        }
        if (parseFloat(lineGapInput.text)) {
            Gap = parseFloat(lineGapInput.text);
            Gaps = parseFloat(lineGapInput.text);
        } else {
            Gap = setgap;
            Gaps = setgap;
        }
        var lineGapInfo = /^[-]{0,1}[0-9]{1,2}(\.[0-9]{1,3})?$/.test(lineGapInput.text);
        if (lineGapInfo) {
            objLineGap = lineGapInput.text;
            $.setenv("Specify_defaultlineGap", objLineGap);
        }
        if (!lineGapInfo) {
            alert("请输入有效的标线与对象距离值。\n值范围：-99.999 ~ 99.999", "错误提示");
            lineGapInput.active = true;
            lineGapInput.text = defaultlineGap;
            win.show();
        }
        if (parseFloat(doubleLineInput.text) > 0) {
            limitLen = parseFloat(doubleLineInput.text);
        } else {
            limitLen = setDoubleLine;
        }
        var doubleLineInfo = /^[0-9]{1,2}(\.[0-9]{1,3})?$/.test(doubleLineInput.text);
        if (doubleLineInfo) {
            objDoubleLine = doubleLineInput.text;
            $.setenv("Specify_defaultDoubleLine", objDoubleLine);
        }
        if (!doubleLineInfo) {
            alert("请输入有效的两端短线值。\n值范围：>0 ~ 99.999", "错误提示");
            doubleLineInput.active = true;
            doubleLineInput.text = defaultDoubleLine;
            win.show();
        }
        if (parseFloat(triangleSizeInput.text) > 0) {
            asize = parseFloat(triangleSizeInput.text);
        } else {
            asize = setAsizeSize;
        }
        var triangleSizeInfo = /^[0-9]{1,2}(\.[0-9]{1,3})?$/.test(triangleSizeInput.text);
        if (triangleSizeInfo) {
            objTriangleSize = triangleSizeInput.text;
            $.setenv("Specify_defaultTriangleSize", objTriangleSize);
        }
        if (!triangleSizeInfo) {
            beep();
            alert("请输入有效的标注箭头尺寸。\n值范围：>0 ~ 99.999。", "错误提示");
            triangleSizeInput.active = true;
            triangleSizeInput.text = defaultTriangleSize;
            win.show();
        }
        var validCyanColor = /^[0-9]{1,3}$/.test(colorInputCyan.text) && parseInt(colorInputCyan.text) >= 0 && parseInt(colorInputCyan.text) <= 100;
        if (!validCyanColor) {
            beep();
            alert("青色值必须为0—100之间整数。", "错误提示");
            colorInputCyan.active = true;
            colorInputCyan.text = defaultColorCyan;
            win.show();
        }
        var validMagentaColor = /^[0-9]{1,3}$/.test(colorInputMagenta.text) && parseInt(colorInputMagenta.text) >= 0 && parseInt(colorInputMagenta.text) <= 100;
        if (!validMagentaColor) {
            beep();
            alert("红色值必须为0—100之间整数。", "错误提示");
            colorInputMagenta.active = true;
            colorInputMagenta.text = defaultColorMagenta;
            win.show();
        }
        var validYellowColor = /^[0-9]{1,3}$/.test(colorInputYellow.text) && parseInt(colorInputYellow.text) >= 0 && parseInt(colorInputYellow.text) <= 100;
        if (!validYellowColor) {
            beep();
            alert("黄色值必须为0—100之间整数。", "错误提示");
            colorInputYellow.active = true;
            colorInputYellow.text = defaultColorYellow;
            win.show();
        }
        var validBlackColor = /^[0-9]{1,3}$/.test(colorInputBlack.text) && parseInt(colorInputBlack.text) >= 0 && parseInt(colorInputBlack.text) <= 100;
        if (!validBlackColor) {
            beep();
            alert("黑色值必须为0—100之间整数。", "错误提示");
            colorInputBlack.active = true;
            colorInputBlack.text = defaultColorBlack;
            win.show();
        }
        if (validCyanColor && validMagentaColor && validYellowColor && validBlackColor) {
            color.cyan = colorInputCyan.text;
            color.magenta = colorInputMagenta.text;
            color.yellow = colorInputYellow.text;
            color.black = colorInputBlack.text;
            $.setenv("Specify_defaultColorCyan", color.cyan);
            $.setenv("Specify_defaultColorMagenta", color.magenta);
            $.setenv("Specify_defaultColorYellow", color.yellow);
            $.setenv("Specify_defaultColorBlack", color.black);
        }
        try {
            var specsLayer = doc.layers[layName];
            specsLayer.locked = false;
            specsLayer.visible = true;
        } catch (err) {
            var specsLayer = doc.layers.add();
            specsLayer.name = layName;
        }
        var itemsGroup = specsLayer.groupItems.add();
        if (sel.length > 0 && eachSizeCheck.value) {
            labelGroupNames = "单体";
            if (top) {
                Each_DIMENSIONS(sel[0], "Top")
            }
            if (left) {
                Each_DIMENSIONS(sel[0], "Left")
            }
            if (right) {
                Each_DIMENSIONS(sel[0], "Right")
            }
            if (bottom) {
                Each_DIMENSIONS(sel[0], "Bottom")
            }
        }
        if (sel.length == 2 && betweenSize) {
            labelGroupNames = "间距";
            if (top) {
                Double_DIMENSIONS(sel[0], sel[1], "Top")
            }
            if (left) {
                Double_DIMENSIONS(sel[0], sel[1], "Left")
            }
            if (right) {
                Double_DIMENSIONS(sel[0], sel[1], "Right")
            }
            if (bottom) {
                Double_DIMENSIONS(sel[0], sel[1], "Bottom")
            }
        } else {
            if (sel.length !== 2 && betweenSize) {
                alert("间距标注：\n请先选择二个对象。 ", "错误提示");
            }
        }
        if (sel.length > 1 && entiretySize) {
            labelGroupNames = "总距";
            if (top) {
                Entirety_DIMENSIONS(sel[0], "Top")
            }
            if (left) {
                Entirety_DIMENSIONS(sel[0], "Left")
            }
            if (right) {
                Entirety_DIMENSIONS(sel[0], "Right")
            }
            if (bottom) {
                Entirety_DIMENSIONS(sel[0], "Bottom")
            }
        } else {
            if (sel.length == 1 && entiretySize) {
                alert("总距离标注：\n请先选择多个对象。", "错误提示");
            }
        }

        function Each_DIMENSIONS(bound, where) {
            var bound = new Array();
            for (var i = 0; i < sel.length; i += 1) {
                a = NO_CLIP_BOUNDS(sel[i]);
                if (lineStrokeCheckbox.value) {
                    bound[0] = a[4];
                    bound[1] = a[5];
                    bound[2] = a[6];
                    bound[3] = a[7];
                } else {
                    bound[0] = a[0];
                    bound[1] = a[1];
                    bound[2] = a[2];
                    bound[3] = a[3];
                }
                linedraw(bound, where);
            }
        }

        function Double_DIMENSIONS(item1, item2, where) {
            var bound = new Array();
            for (var i = 1; i < sel.length; i += 1) {
                var a = NO_CLIP_BOUNDS(sel[i]);
                if (lineStrokeCheckbox.value) {
                    a[0] = a[4];
                    a[1] = a[5];
                    a[2] = a[6];
                    a[3] = a[7];
                } else {
                    a[0] = a[0];
                    a[1] = a[1];
                    a[2] = a[2];
                    a[3] = a[3];
                }
                var b = NO_CLIP_BOUNDS(sel[i - 1]);
                if (lineStrokeCheckbox.value) {
                    b[0] = b[4];
                    b[1] = b[5];
                    b[2] = b[6];
                    b[3] = b[7];
                } else {
                    b[0] = b[0];
                    b[1] = b[1];
                    b[2] = b[2];
                    b[3] = b[3];
                }
                if (where == "Top" || where == "Bottom") {
                    if (b[0] > a[0]) {
                        if (b[0] > a[2]) {
                            bound[0] = a[2];
                            bound[2] = a[0];
                        } else {
                            bound[0] = b[2];
                            bound[2] = a[2];
                        }
                    } else {
                        if (a[0] >= b[0]) {
                            if (a[0] > b[2]) {
                                bound[0] = a[2];
                                bound[2] = a[0];
                            } else {
                                bound[0] = a[2];
                                bound[2] = b[2];
                            }
                        }
                    }
                    bound[1] = Math.max(a[1], b[1]);
                    bound[3] = Math.min(a[3], b[3]);
                } else {
                    if (where == "Left" || where == "Right") {
                        if (b[3] > a[3]) {
                            if (b[3] > a[1]) {
                                bound[3] = a[1];
                                bound[1] = a[3];
                            } else {
                                bound[3] = b[1];
                                bound[1] = a[1];
                            }
                        } else {
                            if (a[3] >= b[3]) {
                                if (a[3] > b[1]) {
                                    bound[3] = a[1];
                                    bound[1] = a[3];
                                } else {
                                    bound[3] = a[1];
                                    bound[1] = b[1];
                                }
                            }
                        }
                        bound[0] = Math.min(a[0], b[0]);
                        bound[2] = Math.max(a[2], b[2]);
                    }
                }
                Gap = tsize + limitLen + Gaps;
                linedraw(bound, where);
                if (where == "Top" || where == "Bottom") {
                    if (b[0] > a[0]) {
                        if (b[0] > a[2]) {
                            bound[0] = a[2];
                        } else {
                            bound[0] = b[0];
                        }
                    } else {
                        if (a[0] >= b[0]) {
                            if (a[0] > b[2]) {
                                bound[0] = b[2];
                            } else {
                                bound[0] = a[0];
                            }
                        }
                    }
                    if (b[2] > a[2]) {
                        if (b[0] > a[2]) {
                            bound[2] = b[0];
                        } else {
                            bound[2] = a[2];
                        }
                    } else {
                        if (a[2] >= b[2]) {
                            if (a[0] > b[2]) {
                                bound[2] = a[0];
                            } else {
                                bound[2] = b[2];
                            }
                        }
                    }
                    bound[1] = Math.max(a[1], b[1]);
                    bound[3] = Math.min(a[3], b[3]);
                } else {
                    if (where == "Left" || where == "Right") {
                        if (b[1] > a[1]) {
                            if (b[3] > a[1]) {
                                bound[1] = b[3];
                            } else {
                                bound[1] = a[1];
                            }
                        } else {
                            if (a[1] >= b[1]) {
                                if (a[3] > b[1]) {
                                    bound[1] = a[3];
                                } else {
                                    bound[1] = b[1];
                                }
                            }
                        }
                        if (b[3] > a[3]) {
                            if (b[3] > a[1]) {
                                bound[3] = a[1];
                            } else {
                                bound[3] = b[3];
                            }
                        } else {
                            if (a[3] >= b[3]) {
                                if (a[3] > b[1]) {
                                    bound[3] = b[1];
                                } else {
                                    bound[3] = a[3];
                                }
                            }
                        }
                        bound[0] = Math.min(a[0], b[0]);
                        bound[2] = Math.max(a[2], b[2]);
                    }
                }
                Gap = tsize + limitLen + Gaps;
                linedraw(bound, where);
                if (where == "Top" || where == "Bottom") {
                    if (b[0] > a[0]) {
                        if (b[0] > a[2]) {
                            bound[0] = b[2];
                            bound[2] = b[0];
                        } else {
                            bound[0] = b[0];
                            bound[2] = a[0];
                        }
                    } else {
                        if (a[0] >= b[0]) {
                            if (a[0] > b[2]) {
                                bound[0] = b[2];
                                bound[2] = b[0];
                            } else {
                                bound[0] = a[0];
                                bound[2] = b[0];
                            }
                        }
                    }
                    bound[1] = Math.max(a[1], b[1]);
                    bound[3] = Math.min(a[3], b[3]);
                } else {
                    if (where == "Left" || where == "Right") {
                        if (b[3] > a[3]) {
                            if (b[3] > a[1]) {
                                bound[3] = b[1];
                                bound[1] = b[3];
                            } else {
                                bound[3] = b[3];
                                bound[1] = a[3];
                            }
                        } else {
                            if (a[3] >= b[3]) {
                                if (a[3] > b[1]) {
                                    bound[3] = b[1];
                                    bound[1] = b[3];
                                } else {
                                    bound[3] = a[3];
                                    bound[1] = b[3];
                                }
                            }
                        }
                        bound[0] = Math.min(a[0], b[0]);
                        bound[2] = Math.max(a[2], b[2]);
                    }
                }
                Gap = tsize + limitLen + Gaps;
                linedraw(bound, where);
            }
        }

        function Entirety_DIMENSIONS(item1, where) {
            var bound = new Array();
            var n = sel.length;
            if (n > 0) {
                var bound = NO_CLIP_BOUNDS(sel[0]);
                if (lineStrokeCheckbox.value) {
                    bound[0] = bound[4];
                    bound[1] = bound[5];
                    bound[2] = bound[6];
                    bound[3] = bound[7];
                } else {
                    bound[0] = bound[0];
                    bound[1] = bound[1];
                    bound[2] = bound[2];
                    bound[3] = bound[3];
                }
            }
            if (n > 1) {
                for (var i = 1; i < sel.length; i += 1) {
                    var b = NO_CLIP_BOUNDS(sel[i]);
                    if (lineStrokeCheckbox.value) {
                        b[0] = b[4];
                        b[1] = b[5];
                        b[2] = b[6];
                        b[3] = b[7];
                    } else {
                        b[0] = b[0];
                        b[1] = b[1];
                        b[2] = b[2];
                        b[3] = b[3];
                    }
                    if (bound[0] > b[0]) {
                        bound[0] = b[0];
                    }
                    if (bound[1] < b[1]) {
                        bound[1] = b[1];
                    }
                    if (bound[2] < b[2]) {
                        bound[2] = b[2];
                    }
                    if (bound[3] > b[3]) {
                        bound[3] = b[3];
                    }
                }
            }
            Gap = ((tsize + limitLen) * 2) + Gaps;
            linedraw(bound, where);
        }

        function Lineadd(geo) {
            var Linename = itemsGroup.pathItems.add();
            Linename.setEntirePath(geo);
            Linename.stroked = true;
            Linename.strokeWidth = LineW;
            Linename.strokeColor = color;
            Linename.filled = false;
            Linename.strokeCap = StrokeCap.BUTTENDCAP;
            return Linename;
        }

        function arrowsAdd(geoAR) {
            var arrowName = itemsGroup.pathItems.add();
            arrowName.setEntirePath(geoAR);
            if (arrowSealingCheckbox.value) {
                arrowName.stroked = false;
                arrowName.strokeColor = NoColor;
                arrowName.filled = true;
                arrowName.fillColor = color;
                arrowName.closed = true;
            } else {
                arrowName.stroked = true;
                arrowName.strokeWidth = LineW;
                arrowName.strokeColor = color;
                arrowName.filled = false;
                arrowName.fillColor = NoColor;
                arrowName.strokeJoin = StrokeJoin.ROUNDENDJOIN;
                arrowName.strokeCap = StrokeCap.BUTTENDCAP;
                arrowName.closed = false;
            }
            return arrowName;
        }

        function linedraw(bound, where) {
            var x = bound[0];
            var y = bound[1];
            var w = bound[2] - bound[0];
            var h = bound[1] - bound[3];
            if (w < 0) {
                xa = x + w;
                xb = x - w;
            } else {
                xa = xb = x;
            }
            if (h < 0) {
                ya = y - h;
                yb = y + h;
            } else {
                ya = yb = y;
            }
            if (w != 0) {
                if (where == "Top") {
                    var topGroup = specsLayer.groupItems.add();
                    topGroup.name = "上_" + labelGroupNames;
                    var topLines1 = new Lineadd([
                        [x, y + (limitLen / 2) + Gap],
                        [x + w, y + (limitLen / 2) + Gap]
                    ]);
                    var topLines2 = new Lineadd([
                        [x, y + limitLen + Gap],
                        [x, y + Gap]
                    ]);
                    var topLines3 = new Lineadd([
                        [x + w, y + limitLen + Gap],
                        [x + w, y + Gap]
                    ]);
                    topLines1.move(topGroup, ElementPlacement.PLACEATBEGINNING);
                    topLines2.move(topGroup, ElementPlacement.PLACEATEND);
                    topLines3.move(topGroup, ElementPlacement.PLACEATEND);
                    if (arrowCheckbox.value) {
                        var topArrows1 = new arrowsAdd([
                            [xa + asize, (y + (limitLen / 2) + Gap) - (asize / 2)],
                            [xa, y + (limitLen / 2) + Gap],
                            [xa + asize, y + (limitLen / 2) + Gap + (asize / 2)]
                        ]);
                        var topArrows2 = new arrowsAdd([
                            [(xb + w) - asize, (y + (limitLen / 2) + Gap) - (asize / 2)],
                            [xb + w, y + (limitLen / 2) + Gap],
                            [(xb + w) - asize, (xb + w) - asize, y + (limitLen / 2) + Gap + (asize / 2)]
                        ]);
                        topArrows1.move(topGroup, ElementPlacement.PLACEATEND);
                        topArrows2.move(topGroup, ElementPlacement.PLACEATEND);
                    }
                    var textInfo = specTextLabel(w, x + (w / 2), y + (limitLen / 2) + Gap + LineW, unitConvert);
                    textInfo.top += textInfo.height;
                    textInfo.left -= (textInfo.width / 2);
                    textInfo.move(topGroup, ElementPlacement.PLACEATBEGINNING);
                    topGroup.move(itemsGroup, ElementPlacement.PLACEATEND);
                }
                if (where == "Bottom") {
                    var bottomGroup = specsLayer.groupItems.add();
                    bottomGroup.name = "下_" + labelGroupNames;
                    var bottomLines1 = new Lineadd([
                        [x, (y - h) - ((limitLen / 2) + Gap)],
                        [x + w, (y - h) - ((limitLen / 2) + Gap)]
                    ]);
                    var bottomLines2 = new Lineadd([
                        [x, ((y - h) - limitLen) - Gap],
                        [x, (y - h) - Gap]
                    ]);
                    var bottomLines3 = new Lineadd([
                        [x + w, ((y - h) - limitLen) - Gap],
                        [x + w, (y - h) - Gap]
                    ]);
                    bottomLines1.move(bottomGroup, ElementPlacement.PLACEATBEGINNING);
                    bottomLines2.move(bottomGroup, ElementPlacement.PLACEATEND);
                    bottomLines3.move(bottomGroup, ElementPlacement.PLACEATEND);
                    if (arrowCheckbox.value) {
                        var bottomArrows1 = new arrowsAdd([
                            [xa + asize, ((y - h) - ((limitLen / 2) + Gap)) - (asize / 2)],
                            [xa, (y - h) - ((limitLen / 2) + Gap)],
                            [xa + asize, ((y - h) - ((limitLen / 2) + Gap)) + (asize / 2)]
                        ]);
                        var bottomArrows2 = new arrowsAdd([
                            [(xb + w) - asize, ((y - h) - ((limitLen / 2) + Gap)) - (asize / 2)],
                            [xb + w, (y - h) - ((limitLen / 2) + Gap)],
                            [(xb + w) - asize, ((y - h) - ((limitLen / 2) + Gap)) + (asize / 2)]
                        ]);
                        bottomArrows1.move(bottomGroup, ElementPlacement.PLACEATEND);
                        bottomArrows2.move(bottomGroup, ElementPlacement.PLACEATEND);
                    }
                    var textInfo = specTextLabel(w, x + (w / 2), ((y - h) - (limitLen / 2)) - (Gap + LineW), unitConvert);
                    textInfo.top -= 0;
                    textInfo.left -= (textInfo.width / 2);
                    textInfo.move(bottomGroup, ElementPlacement.PLACEATBEGINNING);
                    bottomGroup.move(itemsGroup, ElementPlacement.PLACEATEND);
                }
            }
            if (h != 0) {
                if (where == "Left") {
                    var leftGroup = specsLayer.groupItems.add();
                    leftGroup.name = "左_" + labelGroupNames;
                    var leftLines1 = new Lineadd([
                        [x - ((limitLen / 2) + Gap), y],
                        [x - ((limitLen / 2) + Gap), y - h]
                    ]);
                    var leftLines2 = new Lineadd([
                        [(x - limitLen) - Gap, y],
                        [x - Gap, y]
                    ]);
                    var leftLines3 = new Lineadd([
                        [(x - limitLen) - Gap, y - h],
                        [x - Gap, y - h]
                    ]);
                    leftLines1.move(leftGroup, ElementPlacement.PLACEATBEGINNING);
                    leftLines2.move(leftGroup, ElementPlacement.PLACEATEND);
                    leftLines3.move(leftGroup, ElementPlacement.PLACEATEND);
                    if (arrowCheckbox.value) {
                        var leftArrows1 = new arrowsAdd([
                            [(x - ((limitLen / 2) + Gap)) - (asize / 2), ya - asize],
                            [x - ((limitLen / 2) + Gap), ya],
                            [(x - ((limitLen / 2) + Gap)) + (asize / 2), ya - asize]
                        ]);
                        var leftArrows2 = new arrowsAdd([
                            [(x - ((limitLen / 2) + Gap)) - (asize / 2), (yb - h) + asize],
                            [x - ((limitLen / 2) + Gap), yb - h],
                            [(x - ((limitLen / 2) + Gap)) + (asize / 2), (yb - h) + asize]
                        ]);
                        leftArrows1.move(leftGroup, ElementPlacement.PLACEATEND);
                        leftArrows2.move(leftGroup, ElementPlacement.PLACEATEND);
                    }
                    var textInfo = specTextLabel(h, x - ((limitLen / 2) + Gap + LineW), y - (h / 2), unitConvert);
                    textInfo.rotate(-90, true, false, false, false, Transformation.BOTTOMLEFT);
                    textInfo.top += textInfo.width;
                    textInfo.top += (textInfo.height / 2);
                    textInfo.left -= textInfo.width;
                    textInfo.move(leftGroup, ElementPlacement.PLACEATBEGINNING);
                    leftGroup.move(itemsGroup, ElementPlacement.PLACEATEND);
                }
                if (where == "Right") {
                    var rightGroup = specsLayer.groupItems.add();
                    rightGroup.name = "右_" + labelGroupNames;
                    var rightLines1 = new Lineadd([
                        [x + w + (limitLen / 2) + Gap, y],
                        [x + w + (limitLen / 2) + Gap, y - h]
                    ]);
                    var rightLines2 = new Lineadd([
                        [x + w + limitLen + Gap, y],
                        [x + w + Gap, y]
                    ]);
                    var rightLines3 = new Lineadd([
                        [x + w + limitLen + Gap, y - h],
                        [x + w + Gap, y - h]
                    ]);
                    rightLines1.move(rightGroup, ElementPlacement.PLACEATBEGINNING);
                    rightLines2.move(rightGroup, ElementPlacement.PLACEATEND);
                    rightLines3.move(rightGroup, ElementPlacement.PLACEATEND);
                    if (arrowCheckbox.value) {
                        var rightArrows1 = new arrowsAdd([
                            [(x + w + (limitLen / 2) + Gap) - (asize / 2), ya - asize],
                            [x + w + (limitLen / 2) + Gap, ya],
                            [x + w + (limitLen / 2) + Gap + (asize / 2), ya - asize]
                        ]);
                        var rightArrows2 = new arrowsAdd([
                            [(x + w + (limitLen / 2) + Gap) - (asize / 2), (yb - h) + asize],
                            [x + w + (limitLen / 2) + Gap, yb - h],
                            [x + w + (limitLen / 2) + Gap + (asize / 2), (yb - h) + asize]
                        ]);
                        rightArrows1.move(rightGroup, ElementPlacement.PLACEATEND);
                        rightArrows2.move(rightGroup, ElementPlacement.PLACEATEND);
                    }
                    var textInfo = specTextLabel(h, x + w + (limitLen / 2) + Gap + LineW, y - (h / 2), unitConvert);
                    textInfo.rotate(-90, true, false, false, false, Transformation.BOTTOMLEFT);
                    textInfo.top += textInfo.width;
                    textInfo.top += (textInfo.height / 2);
                    textInfo.move(rightGroup, ElementPlacement.PLACEATBEGINNING);
                    rightGroup.move(itemsGroup, ElementPlacement.PLACEATEND);
                }
            }
        }
        if (lockedLay.value == true) {
            specsLayer.locked = true;
        }

        function specTextLabel(val, x, y, wheres) {
            var textInfo = doc.textFrames.add();
            textInfo.textRange.characterAttributes.size = tsize;
            textInfo.textRange.characterAttributes.fillColor = color;
            textInfo.textRange.characterAttributes.alignment = StyleRunAlignmentType.center;
            try {
                textInfo.textRange.characterAttributes.textFont = app.textFonts.getByName(fontNamelist);
            } catch (e) {

            }
            var value = val * scale;
            var unitsInfo = "";
            switch (wheres) {
                case "auto":
                    switch (doc.rulerUnits) {
                        case RulerUnits.Millimeters:
                            value = new UnitValue(value, "pt").as("mm");
                            value = value.toFixed(decimals);
                            unitsInfo = " mm";
                            break;
                        case RulerUnits.Centimeters:
                            value = new UnitValue(value, "pt").as("cm");
                            value = value.toFixed(decimals);
                            unitsInfo = " cm";
                            break;
                        case RulerUnits.Pixels:
                            value = new UnitValue(value, "pt").as("px");
                            value = value.toFixed(decimals);
                            unitsInfo = " px";
                            break;
                        case RulerUnits.Inches:
                            value = new UnitValue(value, "pt").as("in");
                            value = value.toFixed(decimals);
                            unitsInfo = " in";
                            break;
                        case RulerUnits.Picas:
                            value = new UnitValue(value, "pt").as("pc");
                            var vd = value - Math.floor(value);
                            vd = 12 * vd;
                            value = Math.floor(value) + "p" + vd.toFixed(decimals);
                            unitsInfo = "";
                            break;
                        default:
                            value = new UnitValue(value, "pt").as("pt");
                            value = value.toFixed(decimals);
                            unitsInfo = " pt";
                    }
                    break;
                case "mm":
                    value = new UnitValue(value, "pt").as("mm");
                    value = value.toFixed(decimals);
                    unitsInfo = " mm";
                    break;
                case "cm":
                    value = new UnitValue(value, "pt").as("cm");
                    value = value.toFixed(decimals);
                    unitsInfo = " cm";
                    break;
                case "m":
                    value = new UnitValue(value, "pt").as("m");
                    value = value.toFixed(decimals);
                    unitsInfo = " m";
                    break;
                case "pt":
                    value = new UnitValue(value, "pt").as("pt");
                    value = value.toFixed(decimals);
                    unitsInfo = " pt";
                    break;
                case "px":
                    value = new UnitValue(value, "pt").as("px");
                    value = value.toFixed(decimals);
                    unitsInfo = " px";
                    break;
                case "in":
                    value = new UnitValue(value, "pt").as("in");
                    value = value.toFixed(decimals);
                    unitsInfo = " in";
                    break;
                case "ft":
                    value = new UnitValue(value, "pt").as("ft");
                    value = value.toFixed(decimals);
                    unitsInfo = " ft";
                    break;
                case "pc":
                    value = new UnitValue(value, "pt").as("pc");
                    var vd = value - Math.floor(value);
                    vd = 12 * vd;
                    value = Math.floor(value) + "p" + vd.toFixed(decimals);
                    unitsInfo = "";
                    break;
            }
            if (textUnitsCheck.value) {
                textInfo.contents = value.toString().replace(/-/g, "") + unitsInfo;
            } else {
                textInfo.contents = value.toString().replace(/-/g, "");
            }
            textInfo.top = y;
            textInfo.left = x;
            return textInfo;
        }
    }

    function convertToBoolean(string) {
        switch (string.toLowerCase()) {
            case "true":
                return true;
                break;
            case "false":
                return false;
                break;
        }
    }

    function NO_CLIP_BOUNDS(the_obj) {
        var NO_CLIP_OBJECTS_AND_MASKS = new Array();
        GET_NO_CLIP_OBJECTS_AND_MASKS(the_obj);
        var v_left = new Array();
        var g_left = new Array();
        var v_top = new Array();
        var g_top = new Array();
        var v_right = new Array();
        var g_right = new Array();
        var v_bottom = new Array();
        var g_bottom = new Array();
        for (var i = 0; i < NO_CLIP_OBJECTS_AND_MASKS.length; i += 1) {
            g_left[i] = NO_CLIP_OBJECTS_AND_MASKS[i].geometricBounds[0];
            v_left[i] = NO_CLIP_OBJECTS_AND_MASKS[i].visibleBounds[0];
            g_top[i] = NO_CLIP_OBJECTS_AND_MASKS[i].geometricBounds[1];
            v_top[i] = NO_CLIP_OBJECTS_AND_MASKS[i].visibleBounds[1];
            g_right[i] = NO_CLIP_OBJECTS_AND_MASKS[i].geometricBounds[2];
            v_right[i] = NO_CLIP_OBJECTS_AND_MASKS[i].visibleBounds[2];
            g_bottom[i] = NO_CLIP_OBJECTS_AND_MASKS[i].geometricBounds[3];
            v_bottom[i] = NO_CLIP_OBJECTS_AND_MASKS[i].visibleBounds[3];
        }
        var v_L = MIN_IN_ARRAY(v_left);
        var g_L = MIN_IN_ARRAY(g_left);
        var v_T = MAX_IN_ARRAY(v_top);
        var g_T = MAX_IN_ARRAY(g_top);
        var v_R = MAX_IN_ARRAY(v_right);
        var g_R = MAX_IN_ARRAY(g_right);
        var v_B = MIN_IN_ARRAY(v_bottom);
        var g_B = MIN_IN_ARRAY(g_bottom);
        return [g_L, g_T, g_R, g_B, v_L, v_T, v_R, v_B];

        function GET_NO_CLIP_OBJECTS_AND_MASKS(the_obj) {
            if (IS_CLIP(the_obj)) {
                NO_CLIP_OBJECTS_AND_MASKS.push(the_obj.pageItems[0]);
                return;
            }
            if (the_obj.constructor.name == "GroupItem") {
                try {
                    var N_sub_obj = the_obj.pageItems.length;
                    for (var i = 0; i < N_sub_obj; i += 1) {
                        GET_NO_CLIP_OBJECTS_AND_MASKS(the_obj.pageItems[i]);
                    }
                } catch (error) {

                }
                return;
            }
            NO_CLIP_OBJECTS_AND_MASKS.push(the_obj);
            return;
        }
    }

    function IS_CLIP(the_obj) {
        try {
            if (the_obj.constructor.name == "GroupItem") {
                if (the_obj.clipped) {
                    return true;
                }
            }
        } catch (error) {

        }
        return false;
    }

    function MAX_IN_ARRAY(the_array) {
        var MAX = the_array[0];
        for (var i = 0; i < the_array.length; i += 1) {
            if (the_array[i] > MAX) {
                MAX = the_array[i];
            }
        }
        return MAX;
    }

    function MIN_IN_ARRAY(the_array) {
        var MIN = the_array[0];
        for (var i = 0; i < the_array.length; i += 1) {
            if (the_array[i] < MIN) {
                MIN = the_array[i];
            }
        }
        return MIN;
    }

    function check_app() {
        if (app.name == "Adobe Illustrator" && app.documents.length > 0 && app.activeDocument.selection.length > 0) {
            return true;
        } else {
            if (app.documents.length == 0) {
                alert("警告：\n请先打开文档哦！", "错误提示")
            } else {
                if (app.activeDocument.selection.length == 0) {
                    alert("警告：\n请先选择标注对象！", "错误提示")
                }
            }
            return false;
        }
    }

}

make_size();