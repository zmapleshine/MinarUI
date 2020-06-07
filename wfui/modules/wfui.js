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

    class WFUI {
        constructor(props) {
            //wmm初始化函数
            this.init = props.init;
            //监听
            this.listener = props.listener;
            //请求类
            this.requests = props.requests || {};
            //数据对象类        
            this.data = props.data || {};
            //数据对象转义
            this._data = props._data || {};

            this.vars = props.vars || {};

            //通用方法类
            this.methods = props.methods || {};

            //页面交互类
            this.renders = props.renders || {};


            !function () {
                //隐藏wmm-module
                document.querySelectorAll(".wmm-module").forEach(e => e.style.display = "none")
                window.onresize = function () {
                };
                if (window.fb) {
                    layui.cache.event = {};
                }
            }();


            window.listener = this.listener || (()=>{});
            window.renders = this.renders || {};
            window.requests = this.requests || {};
            window.vars = this.vars || {};
            window.methods = this.methods || {};

            //注册页面交互对象的属性方法到window
            for (const key in this.renders) {
                if (this.renders.hasOwnProperty(key)) {
                    window[key] = this.renders[key];
                }
            }

            let imports = props.imports;
            let _this = this;

            window.getData = function (key) {
                let  deepClone =  obj =>  {
                    if (obj == null) {
                        return null
                    }
                    var result = Array.isArray(obj) ? [] : {};
                    for (let key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            if (typeof obj[key] === 'object') {
                                result[key] = deepClone(obj[key]);
                            } else {
                                result[key] = obj[key];
                            }
                        }
                    }
                    return result;
                }

                let r;
                let tmpData = deepClone(_this.data);
                return typeof (r = eval("tmpData." + key)) === "function" ? r(_this.data) : r;
            };
            window.setData = function (key, value) {
                let querySelectorEL = typeof value === "object" ? "[\\:bind^='" + key + "\\.']" : "[\\:bind='" + key + "']";
                //值更新
                eval("_this.data." + key + "=value");
                let bindDOMArr = document.querySelectorAll(querySelectorEL);
                bindDOMArr.forEach(elem => {
                    let domTagName = elem.tagName;
                    let bindEL = elem.getAttribute(":bind");
                    let newValue = eval("_this.data." + bindEL);
                    newValue = typeof newValue === "function" ? newValue(eval("_this.data." + key)) : newValue;
                    switch (domTagName) {
                        case "INPUT":
                        case"TEXTAREA":
                        case "SELECT":
                            elem.value = newValue;
                            if (layui) {
                                layui.form.render();
                            }
                            break;
                        default:
                            elem.innerHTML = newValue; 
                            if (layui) {
                                layui.element.render();
                            }
                            break;
                    }
                });
            };


            //初始化组
            let _init = function () {
                _this.init && _this.init();
                _this.listener && _this.listener();
                _this.renders && _this.renders.render && _this.renders.render();
                let renderSetData = function () {
                    for (let dataKey in _this.data) {
                        setData(dataKey, eval("_this.data." + dataKey));
                    }
                };
                renderSetData();
            };

            //一次性渲染字符串模板
            let renderTemplate = function () {
                document.querySelectorAll(".wmm-module").forEach((e, idx) => {
                    e.innerHTML = e.innerHTML.render(_this.data || {}, _this._data || {});
                    e.style.display = "";
                });
            };
            renderTemplate();
            if (imports) {
                layui.use(imports, function () {
                    if (typeof imports === "string") {
                        window[imports] = layui[imports];
                    } else {
                        imports.forEach(m => window[m] = layui[m]);
                    }
                    _init();
                });
            } else {
                _init();
            }

        }
    }

    return WFUI;

}, {
    name: "WFUI",
    dependencies: []
});