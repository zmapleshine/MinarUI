/**
 * shinez-router
 * @author Shinez.
 * @create 2018-07-03 17:47:44
 */
class Router {

    constructor() {
        this.path = [];
        this.params = {};
        this.pathname = "/";
        this.state = {};
        this.xhr = new XMLHttpRequest();
        this.cachePage = new Map();
        this.events = new Map();
    }

    build(config) {
        if (!config) {
            return;
        }
        this.afterRoute = config.afterRoute || (() => {
        });
        this.selector = config.selector || ".page-container";
        this.templateType = config.templateType || "html";
        this.hashMode = config.hashMode || false;
        this.containerClass = config.containerClass || "layui-anim " + (config.animate || "layui-anim-upbit");
        this.contextPath = config.contextPath || "";
        this.page404 = config.page404 || "";
        this.enableFadeOutAnimate = config.enableFadeOutAnimate === undefined ? true : config.enableFadeOutAnimate;

        this.cache = config.cache === undefined ? true : config.cache;
    }

    setAfterRoute(functional) {
        this.afterRoute = functional;
    }


    /**
     * get current pathname from location pathname(html5 mode) or hash(hash mode)
     */
    getPathname() {
        if (this.hashMode === true) {
            let searchIndex = location.hash.indexOf("?");
            if (-1 !== searchIndex) {
                return location.hash.substring(1, searchIndex);
            }
            return location.hash.substring(1, location.hash.length);
        }

        let lastIndexOf = location.pathname.lastIndexOf("/");

        if (lastIndexOf === location.pathname.length - 1) {
            return location.pathname.substring(0, location.pathname.lastIndexOf("/"));
        }
        return location.pathname;

    }

    /**
     * get current params from location search(html5 mode) or hash(hash mode)
     */
    getParams() {
        let params = {};
        let paramsArr = [];
        if (this.hashMode === true) {
            if (location.hash.indexOf("?") !== -1) {
                paramsArr = location.hash.substring(location.hash.indexOf("?") + 1, location.hash.length).split("&");
            }
        } else {
            if (location.search !== "") {
                paramsArr = location.search.substring(1, location.search.length).split("&");
            }

        }
        paramsArr.forEach(function (o) {
            let p = o.split("=");
            params[p[0]] = p[1];
        });
        return params;
    }


    /**
     * refresh router properties from current location
     */
    refresh() {
        this.state = history.state;
        this.pathname = this.getPathname();
        this.path = this.pathname.split("/");
        let _this = this;
        this.path.forEach(function (v) {
            if (v === "") {
                _this.path.shift();
                if (_this.path.length === 0) {
                    return false;
                }
            }
        });

        if (this.path.length > 0 && this.path[0] === "") {
            this.path.shift();
        }
        this.params = this.getParams();
    }

    hashMode() {
        this.hashMode = true;
    }

    html5Mode() {
        this.hashMode = false;
    }


    /**
     * route route page
     * @param {string} url
     * @param {any} params this will append to url
     * @param {bool} isPop from popstate event,if set false value,
     *                     this function will call 'history.pushState',
     *                     otherwise the popstate function can not to work,it is stay in current page all the time.
     * @param {object} pushState will push in history push state param
     */
    route(props) {
        let reg_const = {
            REG_JS_GLOBAL: /<script(.|\n)*?>(.|\n|\r\n)*?<\/script>/ig,
            REG_JS_MULTIPLE: /<script(.|\n)*?>((.|\n|\r\n)*)?<\/script>/im,
            REG_JS_OUTER: /<script(.|\n)*?><\/script>/ig
        }

        props.isPop = props.isPop || false;
        if (props.url === "/") {
            this.route({url: this.page404});
            return;
        }
        if (props.url === this.contextPath) {
            return;
        }


        //如果是非后退的（例如：点击）
        if (!props.isPop) {
            history.pushState(props.pushState || {}, "", (this.hashMode === false ? (this.contextPath + props.url) : (this.contextPath + "/#" + props.url)) + this.toSearch(props.params));
        }

        this.refresh();
        let pageURL = props.url + "." + this.templateType;
        pageURL = props.isPop ? pageURL : (this.contextPath + pageURL);
        if (this.cache) {
            //load page from cache
            let responseHtml = this.cachePage.get(pageURL);
            if (!responseHtml) {
                doAsync(this, pageURL);
            } else {
                //render page
                doRenderPage(this, responseHtml, pageURL);
            }
        } else {
            doAsync(this, pageURL);
        }


        /**
         *
         * 异步请求页面
         * @param {object} _this
         * @param {string} path
         */
        function doAsync(_this, path) {
            _this.xhr.open("GET", path, true);
            _this.xhr.send(null);
            _this.xhr.onreadystatechange = function (e) {
                if (_this.xhr.readyState === 4 && _this.xhr.status === 200) {
                    let reallyResponseHtml = _this.xhr.responseText;
                    if (reallyResponseHtml.indexOf("<!doctype html>") === -1) {
                        if (_this.cache) {
                            _this.cachePage.set(path, reallyResponseHtml);
                        }
                    }
                    doRenderPage(_this, reallyResponseHtml, path);
                }
            }
        }

        /**
         * 渲染页面
         * @param {string} pageContent
         */
        function doRenderPage(_this, pageContent, pageUrl) {
            if (pageContent.indexOf("<!doctype html>") !== -1) {
                //this page is index, redirect to 404
                if (_this.page404 !== "" && pageUrl.indexOf("/404") === -1) {
                    _this.route({url: _this.page404});
                    return;
                } else {
                    pageContent = "Sorry,this page is the finally route for 404";
                }
            }

            let currentContainer = document.querySelector("div[class='" + _this.containerClass + "']");
            if (currentContainer) {
                currentContainer.classList.add("layui-anim-fadeout");
            }
            let pageContainer = document.createElement("div");
            pageContainer.className = _this.containerClass;
            let pageContainer2 = document.createElement("div");
            pageContainer.appendChild(pageContainer2);
            // pageContainer2.style.minWidth = "800px";
            // pageContainer2.style.minHeight = "450px";
            pageContainer2.innerHTML = pageContent;
            let tmp = document.createElement("div");
            tmp.appendChild(pageContainer);
            setTimeout(function () {
                document.querySelector(_this.selector).innerHTML = tmp.innerHTML;


                //remove code note
                pageContent = pageContent.replace(/<!--[\w\W\r\n]*?-->/gmi, '');

                //eval js
                const jsContained = pageContent.match(reg_const.REG_JS_GLOBAL);
                if (jsContained) {
                    // eval js
                    let jsNums = jsContained.length;
                    for (let i = 0; i < jsNums; i++) {
                        let jsSection = jsContained[i].match(reg_const.REG_JS_MULTIPLE);
                        if (jsSection[2]) {
                            if (window.execScript) {
                                window.execScript(jsSection[2]);
                            } else {
                                window.eval(jsSection[2]);
                            }
                        }
                    }
                }
                const outerJSContain = pageContent.match(reg_const.REG_JS_OUTER);
                if (outerJSContain) {
                    // eval js
                    let jsNums = outerJSContain.length;
                    for (let i = 0; i < jsNums; i++) {
                        let script = document.createElement("script");
                        script.src = outerJSContain[i].match(/<script .*?src=\"(.+?)\"/)[1];
                        document.querySelector(_this.selector).appendChild(script);
                    }
                }

                _this.afterRoute();
            }, _this.enableFadeOutAnimate ? 200 : 1);
        }
    }

    /**
     * convert router params object to search string
     * @param {string} params
     */
    toSearch(params) {

        if (!params) {
            return "";
        }

        if (typeof (params) === "object") {
            let search = "";
            if (Object.keys(params).length === 0) {
                return "";
            }
            Object.keys(params).forEach((key) => {
                search += (key + "=" + params[key]) + "&";
            });
            return "?" + search.substring(0, search.length - 1);
        }
        if (typeof (params) === "string" && params.length !== "") {
            return "?" + params;
        }
        return "";
    }

    putEvent(key, func) {
        this.events.set(key, func);
    }

    /**
     * 注册元素的路由事件
     * @param element
     */
    registRouteEvent(element) {
        if (!element.getAttribute("route")) {
            return;
        }
        let _this = this;
        let _routeEvent = function () {
            _this.isPop = false;
            _this.route({url: this.getAttribute("route"), params: this.getAttribute("params")});
        }
        element.removeEventListener("click", _routeEvent);
        element.addEventListener("click", _routeEvent);
    }

    reload() {
        router.route({url: router.pathname});
    }

    init(initParam) {

        //check current page route
        function hasRoutePath() {
            if (_this.hashMode === false) {
                return location.pathname !== "/";
            }
            return location.hash != "" && location.hash != "#" && location.hash != "#/"
        }

        let _this = this;

        //init params
        if (initParam) {
            this.build(initParam);
        }

        //监听后退事件
        window.addEventListener("popstate", function (e) {
            _this.isPop = true;
            _this.route({url: _this.getPathname(), params: _this.getParams(), isPop: true});
        });

        //init flush route
        if (hasRoutePath()) {
            this.route({url: this.getPathname(), params: this.getParams(), isPop: true});
        }
        return this;
    }

}


if (window.layui) {
    layui.define(function (exports) {
        exports('router', new Router())
    });
} else {
    window.router = new Router();
}
