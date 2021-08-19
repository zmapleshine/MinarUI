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
    var catyJSON = []
    var area = []
    return {
        cas: function (elem, factory, type,value) {
            //elem 对象 factory 选中后执行的方法 type 类型：1省、2市、3区，默认为区
            area = []
            layui.region((function (city) {
                type = type || 3;
                catyJSON = city.getSource(); //获取全部省市区数据
                for (var i = 0; i < catyJSON.length; i++) {

                    if (catyJSON[i].pid == 0) {
                        obj = new Object();
                        province = city.getProvince(catyJSON[i].id);
                        obj.label = province.fullName;
                        obj.value = province.id;
                        if (province.children.length > 0 && type > 1) {
                            obj.children = [];
                            for (var j = 0; j < province.children.length; j++) {
                                obj.children.push({
                                    label: province.children[j].fullName,
                                    value: province.children[j].id
                                });
                                if (province.children[j].children.length > 0 && type > 2) {
                                    obj.children[j].children = []
                                    for (var z = 0; z < province.children[j].children.length; z++) {
                                        obj.children[j].children.push({
                                            label: province.children[j].children[z].fullName,
                                            value: province.children[j].children[z].id
                                        })
                                    }
                                }
                            }
                           
                        }
                        area.push(obj);
                    }
                }
                layui.cascader({
                    elem: elem,
                    data: area,
                    value:value||[],
                    success: function (valData, labelData) {
                        factory(valData, labelData)
                    }
                })
            }))
        },
    }
}, {
        name: "regionSelector",
        dependencies: ['cascader', 'region']
    });