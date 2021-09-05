var AppConfig = {

    //路由配置
    route: {
        //是否开启哈希路由
        hashMode: false,
        //路由上下文
        contextPath: "",
        //路由404页面
        page404: "/minarui/pages/404",
        cache: false,
        selector: ".page-container",
        templateType: "html",
    },

    //页面相关配置
    page: {
        title: ":: Enjoy your MinarUI ::",
        //顶部菜单配置
        topLinks: [
            {
                name: "数据表格",
                icon: "layui-icon-login-wechat",
                route: "/demo/table/index"
            }, {
                name: "请求测试",
                icon: "layui-icon-login-wechat",
                children: [
                    {
                        name: "普通请求",
                        route: "/demo/request"
                    }, {
                        name: "文件上传",
                        route: "/demo/request"
                    }
                ]
            }, {
                name: "基础组件测试",
                route: "/demo/basic"
            }
            , {
                name: "刷新页面",
                icon: "layui-icon-404",
                onclick: "javascript: location.href='/'"
            }, {
                name: "主菜单",
                icon: "layui-icon-wechat",
                onclick: "index.initMenu(true)"
            }, {
                name: "多级菜单",
                icon: "layui-icon-wechat",
                children: [
                    {
                        name: "子菜单1",
                        icon: "layui-icon-wechat",
                    }, {
                        name: "子菜单2",
                        icon: "layui-icon-wechat",
                    }
                ]
            }
        ],
        //设置默认首页
        index: {
            name: "当前位置",
            route: "/demo/table/index"
            // params: "id=2&name=12",
        },
    },

    //配置自定义模块
    modules: {
        define: {},
        path: ""
    },
}