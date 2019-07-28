!function (global, factory, layMod) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (global.layui && layui.define) {
        layui.define(layMod.dependencies, function (exports) {
            exports(layMod.name, factory());
        });
    } else {
        global[layMod.name] = factory();
    }
}(typeof window !== 'undefined' ? window : this, function () {


    const tmpMenuFirst = '<li class="layui-nav-item "><a href="{{href}}" {{iframe}} target="{{target}}" route="{{route}}" params="{{params}}" {{event}}><i class="layui-icon {{icon}}"></i><span class="cite">{{menuName}}</span></a>{{children}}</li>';

    const tmpMenuSubMenu = '<dl class="layui-nav-child">{{ child }}</dl>';

    const tmpMenuItem = '<dd><a href="{{href}}" {{ iframe }} target="{{target}}" route="{{route}}" params="{{params}}" {{ event }}><span class="cite">{{ menuName }}</span></a>{{ children }}</dd>';

    class Navbar {
        constructor(props) {
            this.url = props.url;
            this.data = props.data || (() => { });
            this.el = props.el || "#menu-list";
            this.callback = props.callback || (() => { });
            //暂时没用到
            this.sidebar = props.sidebar || false;
            this.dynamic = props.dynamic || false;
            this.contextPath = props.contextPath || "";
        }

        //加载菜单
        _init() {
            let _this = this;
            if (!this.dynamic) {
                callback();
                return;
            }

            if (this.url) {
                layui.req.load(this.url, ret => {
                    doRenderMenus(ret);
                    this.callback();
                });
                return;
            }

            if (this.data) {
                doRenderMenus(this.data);
                this.callback();
                return;
            }

           
            function doRenderMenus(ret) {
                let convert = {
                    menuName: (v, o) => {
                        if (o.firstName) {
                            return o.firstName + "<em>" + o.secondName + "</em>"
                        }
                        return v;
                    },
                    route: (v, o) => {
                        if (!v) {
                            return "";
                        }
                        return v;
                    },
                    params: (v, o) => {
                        if (!v) {
                            return "";
                        }
                        return v;
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
                    children: arr => {
                        if (!arr || arr.length === 0) {
                            return "";
                        }
                        return tmpMenuSubMenu.render(arr, {
                            child: (v, arr) => {
                                let childList = "";
                                arr.forEach(m => {
                                    childList += tmpMenuItem.render(m, convert);
                                });
                                return childList;
                            }
                        });
                    },
                    iframe: (v, o) => {
                        if (v) {
                            return "onclick=index.methods.openIframe('" + o.menuName + "','" + v + "')";
                        }
                        return "";
                    },
                    event: (v, o) => {
                        return o.tip ? ('onclick="layui.layer.msg(\'' + o.tip + '\')"') : '';
                    }
                }

                let menuContent = "";
                ret.forEach(m => {
                    menuContent += tmpMenuFirst.render(m, convert);
                });
                document.querySelector(_this.el).innerHTML = menuContent;
                layui.element.render();
            }

        }


    }


    return {
        render: function (props) {
            let navbar = new Navbar(props);
            navbar._init();
            return this;
        }
    }

}, {
        name: "navbar",
        dependencies: ["element"]
    });