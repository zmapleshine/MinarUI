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

    let region = function (callback, contextPath) {
        if (!callback) {
        }
        let sources = [];
        let EMPTY_OBJECT = {children: []};
        let municipalities = [
            {
                id: 110000,
                name: "北京"
            }, {
                id: 120000,
                name: "天津"
            }, {
                id: 310000,
                name: "上海"
            }, {
                id: 500000,
                name: "重庆"
            }, {
                id: 810000,
                name: "香港"
            }, {
                id: 820000,
                name: "澳门"
            }
        ];


        /**
         * 是否是直辖市|特别行政区
         * @param {int} provId
         * @param {string} name
         */
        let isInMunicipalities = function (provId, name) {
            for (let index = 0; index < municipalities.length; index++) {
                const element = municipalities[index];
                if (element.id === provId || element.name === name) {
                    return true;
                }
            }
            return false;
        }

        let operators = {

            /**
             * 获取源数据
             */
            getSource: function () {
                return sources;
            },
            /**
             * 获取省份级别的信息
             * @param {int} provinceId
             */
            getProvince: function (provinceId) {

                let prov = EMPTY_OBJECT;
                for (let i = 0; i < sources.length; ++i) {
                    if (sources[i].id === parseInt(provinceId)) {
                        for (const key in sources[i]) {
                            prov[key] = sources[i][key];
                        }
                        break;
                    }
                }
                if (isInMunicipalities(parseInt(provinceId))) {
                    //复制直辖市的属性到省级
                    let p = {};
                    for (const key in prov) {
                        if (prov.hasOwnProperty(key) && key !== "children") {
                            p[key] = prov[key];
                        }
                        if (key === "id") {
                            prov.id = prov.id + 100;
                            prov.children.forEach(child => child.pid = parseInt((child.pid + "").substr(0, 3) + "1" + ((child.pid + "")).substr(4, 2)));
                            prov.pid = p.id;
                        }
                    }
                    p.pid = 0;
                    p.children = [prov];
                    return p;
                }
                return EMPTY_OBJECT;
            },

            /**
             * 获取省份名称
             */
            getProvinceName: function (provinceId) {
                return this.getProvince(provinceId).name || "";
            },

            getSourceByName: function (provinceName) {
                let emptyObj = {children: []};
                for (let i = 0; i < sources.length; ++i) {
                    if (provinceName.indexOf(sources[i].name) != -1) {
                        return sources[i] || emptyObj;
                    }
                }
                let areaName = provinceName
                for (let i = 0; i < sources.length; i++) {
                    for (let j = 0; j < sources[i].children.length; j++) {
                        if (sources[i].children[j].name == areaName) {
                            return sources[i].children[j] || emptyObj;
                        }
                    }
                }
                return emptyObj;
            },

            getCity: function (cityId) {
                let emptyObj = {children: []};
                let provId = parseInt((cityId + "").substring(0, 2) + "0000");
                let prov = this.getProvince(provId);
                for (let i = 0; i < prov.children.length; ++i) {
                    if (prov.children[i].id === parseInt(cityId)) {
                        return prov.children[i] || emptyObj;
                    }
                }
                return emptyObj;
            },
            getCityName: function (cityId) {
                return this.getCity(cityId).name || "";
            },

            getDist: function (distId) {
                let provId = parseInt((distId + "").substring(0, 2) + "0000");
                let cityId = parseInt((distId + "").substring(0, 4) + "00");
                let city = this.getCity(cityId);
                // if (!city.id || isInMunicipalities(provId)) {
                //     //如果是省会直辖市
                //     city = this.getCity(provId);
                // }
                for (let i = 0; i < city.children.length; ++i) {
                    if (city.children[i].id === parseInt(distId)) {
                        return city.children[i] || {};
                    }
                }
                return {};
            },
            getDistName: function (distId) {
                return this.getDist(distId).name || "";
            },

        }

        if (sources.length > 0) {
            callback(operators);
        } else {
            let ajax;
            if (window.XMLHttpRequest) {
                ajax = new XMLHttpRequest();
            } else if (window.ActiveXObject) {
                ajax = new window.ActiveXObject();
            } else {
                alert("请升级至最新版本的浏览器");
            }
            if (ajax != null) {
                ajax.open("GET", (contextPath || "") + "/minarui/modules/region/region.json", true);
                ajax.send(null);
                ajax.onreadystatechange = function () {
                    if (ajax.readyState === 4 && ajax.status === 200) {
                        sources = JSON.parse(ajax.responseText);
                        callback(operators)
                    }
                };
            }
        }
        return {
            plugin_version: "minar1.0",
            date_version: "20171030",
            provide_by: "https://lbs.qq.com/webservice_v1/guide-region.html"
        }
    }
    return region;
}, {
    name: "region",
    dependencies: []
});
