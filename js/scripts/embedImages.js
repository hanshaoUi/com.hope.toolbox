#target illustrator
//一键嵌入图片
function embedImages() {
    function main() {
        try {
            app.activeDocument;
        } catch (error) {
            alert("请至少打开一个文档.", "提示");
            return;
        }
        var doc = app.activeDocument;
        var num = doc.placedItems.length;
        if (!num) {
            alert("当前未嵌入的链接对象数量为\"0\"  !!!", "运行结束");
            return;
        }
        // if (confirm("当前文档有 " + num + " 个未嵌入的链接对象.\n\n嵌入的时候可能每个对象都会有选项, 需手动重复确认一下相关配置.\n\n例如: 嵌入配置不匹配/缺少配置文件等, 按需求确认即可.\n\n嵌入完成后, 务必检查一下文档有没问题, 这是很重要的 !!!\n\n\n\n确保已知悉, 点下方 (确认/是) 执行脚本 ↓↓↓")) {

        // } else {
        //     alert("你已取消执行.", "提示");
        // }
        var success = [];
        while (doc.placedItems.length) {
            try {
                setEmbed(doc, success);
            } catch (error) {
                alert("确认相关配置时, 请不要点<<取消>>选项, 会取消其嵌入 !!!");
            }
        }
        if (num == success.length) {
            alert("恭喜, 共" + num + "个未嵌入对象, " + "现全部完成嵌入, 完美运行结束!", "开发者微信: pengguodon");
        }
        if (success.length < num) {
            alert("成功嵌入对象数量 " + success.length + "个, 嵌入失败 " + (num - success.length) + "个!", "注意,这可能不是一个好消息");
        }
    }

    main();

    function setEmbed(doc, success) {
        for (var i = 0; i < doc.placedItems.length; i += 1) {
            var el = doc.placedItems[i];
            el.embed();
            success.push("1");
        }
    }

}

embedImages();
