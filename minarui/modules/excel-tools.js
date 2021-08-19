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
    return {
        /**
         * form表单 传入表头+数据对象
         * @param sheetName 表名
         * @param props 属性包含（head+prop）
         * @param data 源数据
         */
        defaultExcelTools: function (sheetName, props, data) {
            this.excelTools(sheetName, props, data);
        },
        excelTools: function (sheetName, props, data) {
            if (props.length > 0 && data.length > 0) {
                var exportData = [];
                exportData[0] = {};
                for (var i = 0; i < props.length; i++) {
                    exportData[0][i] = props[i].head;
                }

                for (var j = 0; j < data.length; j++) {
                    exportData[j + 1] = {};
                    for (var i = 0; i < props.length; i++) {
                        var item = data[j];
                        if (props[i].replace != 'undefined' && typeof props[i].replace == 'function' && props[i].replace.apply) {
                            exportData[j + 1][i] = props[i].replace.apply(window, [item[props[i].prop] || item[utils.underline2Camel(props[i].prop)], item, data]);
                        } else {
                            if (typeof props[i].prop != 'undefined' || typeof utils.underline2Camel(props[i].prop) != 'undefined') {
                                exportData[j + 1][i] = this.typeHandler(props[i], (item[props[i].prop] || item[utils.underline2Camel(props[i].prop)]));
                            } else {
                                exportData[j + 1][i] = '';
                            }
                        }
                    }
                }
                var sheet = {};
                sheet[sheetName] = exportData;
                layui.excel.exportExcel(sheet, sheetName + utils.formatDate(new Date(), "yyyyMMddHHmmss"), 'xlsx');
            }
        },
        /**
         * 类型转换器
         * @param {object} define
         * @param {string} v
         * @param {object} o
         * @param {function} after
         */
        typeHandler: function (define, v) {
            var val;
            switch (define.type) {
                case "date":
                    val = v === undefined ? "-" : utils.formatDate(new Date(v), "yyyy-MM-dd");
                    break;
                case "datetime":
                    val = v === undefined ? "-" : utils.formatDate(new Date(v), "yyyy-MM-dd HH:mm");
                    break;
                case "time":
                    val = utils.formatDate(new Date(v), "HH:mm");
                    break;
                default:
                    val = v;
            }
            return val;
        },
    }
}, {
    name: "excelTools",
    dependencies: ["excel", "utils"]
});

