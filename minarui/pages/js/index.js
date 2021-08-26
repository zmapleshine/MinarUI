!function () {
    document.title = AppConfig.page.title || "MinarUI"
    var _idxPage = {
        initRoute: function () {
            //init minarter
            minarter.init(AppConfig.route);

            if (AppConfig.page.index && AppConfig.page.index.route && minarter.path.length === 0) {
                minarter.route({
                    url: typeof AppConfig.page.index.route === "function" ? AppConfig.page.index.route() : AppConfig.page.index.route,
                    params: AppConfig.page.index.params
                });
            }
            document.querySelectorAll("[route]").forEach(e => {
                minarter.registRouteEvent(e);
            });
        },
        initTopLinks: function () {
            let topLinks = AppConfig.page.topLinks;
            let content = "";
            let convertRule = {
                children: (v) => {
                    let childrenStr = "";
                    if (v === undefined || v.length === 0) {
                        return childrenStr;
                    }
                    childrenStr += document.querySelector("#tmp-toplink-children").innerHTML.render(v, convertRule);
                    return childrenStr;
                },
                child: (v, o) => {
                    let childStr = "";
                    for (let idx = 0; idx < o.length; ++idx) {
                        childStr += document.querySelector("#tmp-toplink-child").innerHTML.render(o[idx], convertRule);
                    }
                    return childStr;
                },
                href: (v, o) => {
                    if (v === undefined || v === "") {
                        return "javascript:";
                    }
                    return v;
                },
                target: (v, o) => {
                    if (o.href === undefined || o.href === "") {
                        return "";
                    }
                    return "target='_blank'";
                },
                event: (v, o) => {
                    return o.tip ? ('onclick="layer.msg(\'' + o.tip + '\')"') : (o.onclick ? ('onclick="' + o.onclick + '"') : '');
                },
                iframe: (v, o) => {
                    if (v) {
                        return "onclick=openIframe('" + o.menuName + "','" + v + "')"
                    }
                    return "";
                },

            };
            for (let index = 0; index < topLinks.length; index++) {
                const element = topLinks[index];
                content += document.querySelector("#tmp-toplink").innerHTML.render(element, convertRule);
            }
            document.querySelector("#minar-nav").innerHTML = content;
        },
    };
    var preInitModulesList = ["minaruiExpands", 'minarter', 'MinarUI', 'element', 'jquery', 'spop', 'minare'];

    MinarUIModulesDefinition(function () {
        layui.use(preInitModulesList, function () {
            window.$ = window.jquery;
            preInitModulesList.forEach(function (m) {
                window[m] = layui[m]
            });
            window.minarui = layui["MinarUI"]
            window.Minarui = layui["MinarUI"]

            _idxPage.initTopLinks()
            _idxPage.initRoute();
            layui.element.render()
        });
    })
}();