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
    var city = {}
    var base = {
        pName: "provinceId",
        cName: "cityId",
        aName: "areaId"
    }
    var elDiv = undefined;
    function initSelectCity(cityObj, c) {
        city = c;
        cityObj.elem ? (function () {
            base.elem = cityObj.elem;
        })() : (function () {
            throw "缺少elem节点选择器";
        })();
        if (cityObj.name != undefined && cityObj.name.constructor == Array) {
            base.pName = cityObj.name[0]
            if (cityObj.name[1] != undefined) {
                base.cName = cityObj.name[1]
            }
            if (cityObj.name[2] != undefined) {
                base.aName = cityObj.name[2]
            }
        }
        cityObj.value ? (function () {
            if (cityObj.value.constructor == Array) {
                base.value = cityObj.value
            } else {
                throw "初始值异常";
            }
        })() : (function () {
            base.value = []
        })();
        cityObj.type ? (base.type = cityObj.type) : (base.type = 3)
        cityObj.success ? (function () {
            base.success = cityObj.success
        })() : undefined;
        elDiv = document.querySelector("#" + base.elem)
        builder.addProvince()
        if (base.value.length > 0) {
            if (base.type > 1) {
                builder.addCity(base.value[0])
            }
            if (base.type > 2) {
                builder.addArea(base.value[1])
            }
        }
    }
    function initCatySource() {
        layui.region((function (c) {
            city = c;
        }))
    }
    let builder = {
        addProvince: function () {
            let provinceDiv = document.querySelector("#" + base.elem + "-province")
            let provinceSelect
            if (provinceDiv == undefined || provinceDiv == null) {
                provinceDiv = document.createElement("div")
                provinceDiv.className = "layui-inline";
                provinceDiv.setAttribute("id", base.elem + "-province")
                provinceSelect = document.createElement("select")
                provinceSelect.name = base.pName
                provinceSelect.setAttribute("lay-filter", "province")
                elDiv.appendChild(provinceDiv)
                provinceDiv.appendChild(provinceSelect)
            } else {
                provinceSelect = document.querySelector("#" + base.elem + "-province select")
                provinceSelect.innerHTML = ""
            }
            let source = city.getSource();
            let option = document.createElement("option");
            option.value = ''
            option.text = "选择省份"
            provinceSelect.appendChild(option)
            for (var i = 0; i < source.length; i++) {
                let option = document.createElement("option");
                option.value = source[i].id
                option.text = source[i].fullName
                if (source[i].id == base.value[0]) {
                    option.selected = true;
                }
                provinceSelect.appendChild(option)
            }
            form.render()
            form.on('select(province)', function (data) {
                if (base.type > 1) {
                    if (data.value != undefined && data.value != "") {
                        builder.addCity(data.value)
                    } else {
                        let citydiv = document.querySelector("#" + base.elem + "-city")
                        let areaDiv = document.querySelector("#" + base.elem + "-area")
                        if (citydiv != undefined && citydiv != null) {
                            citydiv.remove()
                        }
                        if (areaDiv != undefined || areaDiv != null) {
                            areaDiv.remove()
                        }
                    }
                }
                if (base.type == 1) {
                    base.success()
                }
            });
        },
        addCity: function (provinceId) {
            let citydiv = document.querySelector("#" + base.elem + "-city")
            let citySelect;
            if (citydiv == undefined || citydiv == null) {
                let cityDiv = document.createElement("div")
                cityDiv.className = "layui-inline";
                cityDiv.setAttribute("id", base.elem + "-city")
                citySelect = document.createElement("select")
                citySelect.name = base.cName
                citySelect.setAttribute("lay-filter", "city")
                elDiv.appendChild(cityDiv)
                cityDiv.appendChild(citySelect)
            } else {
                citySelect = document.querySelector("#" + base.elem + "-city select")
                citySelect.innerHTML = ""
            }
            let source = city.getProvince(provinceId)
            let option = document.createElement("option");
            option.value = ''
            option.text = "选择市"
            citySelect.appendChild(option)
            for (let i = 0; i < source.children.length; i++) {
                let option = document.createElement("option");
                option.value = source.children[i].id
                option.text = source.children[i].fullName
                if (source.children[i].id == base.value[1]) {
                    option.selected = true;
                }
                citySelect.appendChild(option)
            }
            form.render()
            form.on('select(city)', function (data) {
                if (base.type > 2) {
                    if (data.value != undefined && data.value != "") {
                        builder.addArea(data.value)
                    } else {
                        let areaDiv = document.querySelector("#" + base.elem + "-area")
                        if (areaDiv != undefined || areaDiv != null) {
                            areaDiv.remove()
                        }
                    }
                }
                if (base.type == 2) {
                    base.success()
                }
            });
        },
        addArea: function (cityId) {
            let areaDiv = document.querySelector("#" + base.elem + "-area")
            let areaSelect
            if (areaDiv == undefined || areaDiv == null) {
                areaDiv = document.createElement("div")
                areaDiv.className = "layui-inline";
                areaDiv.setAttribute("id", base.elem + "-area")
                areaSelect = document.createElement("select")
                areaSelect.name = base.aName
                areaSelect.setAttribute("lay-filter", "area")
                elDiv.appendChild(areaDiv)
                areaDiv.appendChild(areaSelect)
            } else {
                areaSelect = document.querySelector("#" + base.elem + "-area select")
                areaSelect.innerHTML = ""
            }
            let source = city.getCity(cityId)
            let option = document.createElement("option");
            option.value = ""
            option.text = "选择区"
            areaSelect.appendChild(option)
            for (let i = 0; i < source.children.length; i++) {
                let option = document.createElement("option");
                option.value = source.children[i].id
                option.text = source.children[i].fullName
                if (source.children[i].id == base.value[2]) {
                    option.selected = true;
                }
                areaSelect.appendChild(option)
            }
            form.render()
            form.on('select(area)', function (data) {
                if (base.type > 2) {
                    base.success()
                }
            });
        }
    }
    return {
        initCaty: function (cityObj) {
            layui.region((function (c) {
                initSelectCity(cityObj, c)
            }))

        }
    }
}, {
        name: "citySelector",
        dependencies: ['region']
    });