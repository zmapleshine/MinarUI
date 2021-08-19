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

    class SkuTable {

        constructor(props) {

            //expand define
            this.expand = props.expand || [];
            //渲染的el表达式
            this.el = props.el || "treeTable";

            this.autoFill = props.autoFill;

            //树结构的规格信息
            this.source = props.source || [];

            //SKU列表详情
            this.details = props.details || [];

            //父节点关联字段
            this.pid = props.pid || "pid";
            //节点名称
            this.nodeName = props.nodeName || "specName";
            //子节点集合名称
            this.childrenNodeName = props.childrenNodeName || "specList";
            //排序字段
            this.sort = props.sort || "sort";
            //详情里的规格组合ID名称
            this.groupIdNames = props.groupIdNames || "specIds";
            //详情里的规格组合名称属性名
            this.groupNames = props.groupNames || "specNames";
            //组合名默认分割字段
            this.groupSeparator = props.separator || ",";
            //是否打开调试模式
            this.debug = props.debug;

            //选中的节点列表
            this.selected = [];

            //渲染的行数据
            this.rows = [];
            this.getUploadInfo = function(){} || props.getUploadInfo;

            //缓存组合数据
            this.tempRowsMap = new Map();
            this._tokenInfo = {};

            return this.init();


        }

        
        init() {

            let _this = this;
            let builder = {

                /**
                 * 主体框架渲染
                 */
                frame: function () {
                    //create frame
                    let outerDom = document.querySelector("#" + _this.el + "-frame");
                    if (outerDom == null) {
                        outerDom = document.createElement("div");
                        outerDom.id = _this.el + "-frame";
                        document.querySelector("#" + _this.el).appendChild(outerDom);
                        outerDom.style.overflow = "auto";
                        outerDom.style.textAlign = "center";
                        outerDom.classList.add("sku-table-frame");
                        if (window.fb || window.layui) outerDom.classList.add("layui-form");
                    }
                    outerDom.innerHTML = "";
                    //create table
                    let table = document.createElement("table");
                    outerDom.appendChild(table);
                    table.id = _this.el + "-table";
                    if (layui) table.classList.add("layui-table");

                },

                /**
                 * 渲染自动填充表格
                 */
                renderAutoFillTable: function () {
                    //create frame
                    let autoFill = document.querySelector("#" + _this.el + "-autofill");
                    if (autoFill === null) {
                        autoFill = document.createElement("div");
                        autoFill.id = _this.el + "-autofill";

                        let fillTable = document.createElement("table");
                        if (layui) fillTable.classList.add("layui-table");
                        let fillThead = document.createElement("thead");
                        let tr = document.createElement("tr");
                        for (let i = 0; i < _this.expand.length; i++) {
                            const element = _this.expand[i];
                            let th = document.createElement("th");
                            tr.appendChild(th);
                            th.innerHTML = (element.title || ("TITLE" + i)) + (element.require ? "<span style='color:red'>*</span>" : "");
                            th.id = _this.el + "-head-autofill-" + element.name;
                            th.style.minWidth = (element.width || 80) + "px";
                            th.style.textAlign = "center";
                        }
                        fillThead.appendChild(tr);
                        fillTable.appendChild(fillThead);
                        autoFill.appendChild(fillTable);
                    }
                    document.querySelector("#" + _this.el).appendChild(autoFill);
                },

                /**
                 * 把一个对象添加到一个数组或从这个数组移除
                 * @param {array} arr
                 * @param {object} node
                 */
                pushOrSplice: function (arr, node) {

                    if (arr.length === 0) {
                        arr.push(node);
                        return;
                    }

                    for (let i = 0; i < arr.length; i++) {
                        const element = arr[i];
                        if (element.id === node.id) {
                            arr.splice(i, 1);
                            if (element[_this.pid] !== 0 ||
                                (node[_this.childrenNodeName] && node[_this.childrenNodeName].length == 0)) {
                                return;
                            }
                        }
                    }
                    arr.push(node);
                    arr.sort((a, b) => {

                        let oa = a[_this.sort];
                        let ob = b[_this.sort];
                        console.log(a);
                        console.log(b);
                        return oa < ob ? -1 : (oa === ob ? 0 : 1);
                    });
                },

                /**
                 * 渲染表头
                 */
                renderThead: function () {
                    //render thead
                    let thead = document.createElement("thead");
                    let tr = document.createElement("tr");
                    thead.appendChild(tr);
                    tr.id = _this.el + "-head";
                    let tb = document.querySelector("#" + _this.el + "-table");
                    tb.innerHTML = "";
                    tb.appendChild(thead);


                    for (let i = 0; i < _this.selected.length; i++) {
                        const element = _this.selected[i];
                        let th = document.createElement("th");
                        tr.appendChild(th);
                        th.innerHTML = element[_this.nodeName];
                        th.id = _this.el + "-head-" + element.id;
                        th.style.minWidth = "60px";
                        th.style.textAlign = "center";
                    }

                    if (_this.selected.length === 0) {
                        return;
                    }
                    //render expand
                    for (let i = 0; i < _this.expand.length; i++) {
                        const element = _this.expand[i];
                        let th = document.createElement("th");
                        tr.appendChild(th);
                        th.innerHTML = (element.title || ("TITLE" + i)) + (element.require ? "<span style='color:red'>*</span>" : "");
                        th.id = _this.el + "-head-" + element.name;
                        th.style.minWidth = (element.width || 80) + "px";
                        th.style.textAlign = "center";
                    }

                },
                /**
                 * 渲染规格表体
                 */
                renderTbody: function (callback) {
                    //render tr
                    let rowCount = this.utils.getRowCount();
                    let tbody = document.createElement("tbody");
                    let tb = document.querySelector("#" + _this.el + "-table");
                    tb.appendChild(tbody);

                    //render row frame
                    _this.rows = [];
                    for (let i = 0; i < rowCount; i++) {
                        let tr = document.createElement("tr");
                        tbody.appendChild(tr);
                        tr.id = _this.el + "-tr-" + i;
                        tr.setAttribute("data-index", i);
                        let row = {};
                        row[_this.groupIdNames] = [];
                        row[_this.groupNames] = [];
                        _this.rows.push(row);
                    }

                    //render column
                    for (let i = 0; i < _this.selected.length; i++) {
                        const select = _this.selected[i];
                        const children = select[_this.childrenNodeName];

                        let rowSpan = this.utils.getRowSpan(i);
                        let n = 0;
                        let j = 0;
                        for (; n < rowCount; n++) {

                            _this.rows[n][_this.groupIdNames].push(children[j].id);
                            _this.rows[n][_this.groupNames].push(children[j][_this.nodeName]);
                            _this.rows[n].rowId = n;

                            if (n % rowSpan !== 0) {

                                if ((n + 1) % rowSpan === 0) {
                                    ++j;
                                    if (j === children.length) {
                                        j = 0;
                                    }
                                }
                                continue;
                            }

                            let td = document.createElement("td");
                            let tr = document.querySelector("#" + _this.el + "-tr-" + n);
                            tr.appendChild(td);
                            td.id = _this.el + "-td-" + i + "-" + n;
                            td.rowSpan = rowSpan;
                            td.innerHTML = children[j][_this.nodeName];

                            if ((n + 1) % rowSpan === 0) {
                                ++j;
                            }
                            if (j === children.length) {
                                j = 0;
                            }
                        }
                    }

                    let builder = this;

                    //渲染扩展信息
                    for (let n = 0; n < rowCount; n++) {
                        //get each row
                        let tr = document.querySelector("#" + _this.el + "-tr-" + n);
                        //get detail source by groupIdsArr(like object)
                        let detail = builder.utils.getDetailByGroupIdArr(_this.rows[n][_this.groupIdNames]);

                        builder.utils.saveRowInfoToHistoryRowMap(detail);

                        //get each expand settting(like object prop)
                        for (let index = 0; index < _this.expand.length; index++) {
                            const field = _this.expand[index];
                            field.onclick = field.onclick || (() => {
                            });
                            let td = document.createElement("td");
                            td.id = _this.el + "-td-" + field.name + "-" + n;
                            let currentFieldName = this.utils.underline2Camel(field.name);
                            //render input or other dom by expand setting and detail data
                            let historyRow = builder.utils.getHistoryRowInfoByGroupIdArr(_this.rows[n][_this.groupIdNames]);
                            Object.assign(_this.rows[n],historyRow);
                            let currentTypeHandler = field.typeHandler && field.typeHandler(detail[currentFieldName],
                                (newValue) => {
                                    _this.rows[n][currentFieldName] = newValue;
                                    //flush history
                                    historyRow[currentFieldName] = newValue;
                                },
                                td);

                            let handlerResult = builder.utils.typeHandler(field, detail, _this.rows[n], tr, td, (call) => {
                                call({field: field, detail: detail, row: _this.rows[n], history: historyRow, td: td});
                            });
                            td.appendChild(currentTypeHandler && currentTypeHandler["dom"] ||
                            typeof handlerResult === "object" ? handlerResult : document.createTextNode(""));
                            tr.appendChild(td);
                            if (typeof handlerResult === "function") {
                                handlerResult({
                                    field: field,
                                    detail: detail,
                                    row: _this.rows[n],
                                    history: historyRow,
                                    td: td
                                });
                            }
                            if (typeof field.typeHandler === "function") {
                                currentTypeHandler.then();
                            }
                            // field.onclick(td.childNodes[0], tr);
                        }
                        builder.utils.saveRowInfoToHistoryRowMap(_this.rows[n]);
                    }
                    if (layui) {
                        layui.form.render("checkbox");
                        layui.form.render("select");
                    }


                },
                utils: {

                    isEmptyObject(e){return!!e&&0===Object.getOwnPropertyNames(e).length},
                    /**
                     *
                     * 保存行信息到缓存用于回显
                     * @param {object} row
                     */
                    saveRowInfoToHistoryRowMap: function (row) {
                        if(this.isEmptyObject(row))return;
                        if(typeof row[_this.groupIdNames]==="string"){
                            row[_this.groupIdNames] = row[_this.groupIdNames].split(",");
                        }
                        if(typeof row[_this.groupNames]==="string"){
                            row[_this.groupNames] = row[_this.groupNames].split(",");
                        }
                        let oldValue = _this.tempRowsMap.get(row[_this.groupIdNames].join(_this.groupSeparator));
                        _this.tempRowsMap.set(row[_this.groupIdNames].join(_this.groupSeparator), oldValue?Object.assign(oldValue,row):row);
                    },

                    /**
                     * 通过规格组合的ID数组从缓存里获取数据行信息
                     * @param {array} idArr
                     */
                    getHistoryRowInfoByGroupIdArr(idArr) {
                        let idArrStr = idArr.join(_this.groupSeparator);
                        return _this.tempRowsMap.get(idArrStr) || {};
                    },
                    /**
                     *  下划线命名转驼峰
                     * @param {string} str
                     */
                    underline2Camel: function (str) {
                        return str && str.replace(/_([a-z])/g, function (all, letter) {
                            return letter.toUpperCase();
                        });
                    },
                    /**
                     * 根据组合的规格ID数组获取对应的SKU详情
                     * @param {array} idArr
                     */
                    getDetailByGroupIdArr: function (idArr) {
                        let idArrStr = idArr.join(_this.groupSeparator);
                        for (let index = 0; index < _this.details.length; index++) {
                            const detail = _this.details[index];
                            if (detail[_this.groupIdNames] === idArrStr) {
                                return detail;
                            }
                        }

                        return {};
                    },
                    /**
                     * 根据节点ID从节点源获取节点
                     * @param {int} nodeId
                     */
                    getNodeById(nodeId) {
                        nodeId = parseInt(nodeId);
                        for (let i = 0; i < _this.source.length; i++) {
                            const parent = _this.source[i];
                            for (let j = 0; j < parent[_this.childrenNodeName].length; j++) {
                                const element = parent[_this.childrenNodeName][j];
                                if (element.id === nodeId) {
                                    return element;
                                }
                            }
                        }
                        console.error("cannot found node info from node->id:" + nodeId)
                    },

                    data: {},

                    /**
                     * 数据渲染操作函数
                     * @param {string} field 属性字段名称
                     * @param {object} detail 数据对象详情
                     * @param {object} currRow 缓存数据对象详情
                     * @param {dom} tr 当前行的dom对象
                     */
                    typeHandler: function (field, detail, currRow, tr, td, call) {
                        let data = this.data;
                        let input = document.createElement("input");
                        let historyRow = this.getHistoryRowInfoByGroupIdArr(currRow[_this.groupIdNames]);
                        let inputOnChange = (e) => {
                        };
                        switch (field.type) {
                            case "img":
                                if (field.disabled) {
                                    return (props) => {
                                        let field = props.field, detail = props.detail, row = props.row,
                                            history = props.history, td = props.td
                                        let img = document.createElement("img");
                                        let name = this.underline2Camel(field.name);
                                        img.style.width = (field.width || 50) + "px";
                                        img.style.maxWidth = (field.width || 50) + "px";
                                        img.style.height = (field.height || 50) + "px";
                                        img.src = row[name] || "/minarui/imgs/img-up-cover.png";
                                        td.appendChild(img);
                                        if (layui && row[name]) {
                                            layer.photos({
                                                photos: "#" + td.id
                                            });
                                        }
                                    }
                                }
                                return (props) => {
                                    let field = props.field, detail = props.detail, row = props.row,
                                        history = props.history, td = props.td
                                    let name = this.underline2Camel(field.name);
                                    if (history[name] !== undefined) {
                                        row[name] = history[name];
                                    } else if (detail[name] != undefined) {
                                        row[name] = detail[name];
                                    } else {
                                        row[name] = "";
                                    }


                                    layui.use(["uploads"], function () {
                                        let upInfo = (_this._tokenInfo|| (_this._tokenInfo = _this.getUploadInfo()));
                                        _this._tokenInfo = upInfo;
                                        //初始化上传
                                        layui.uploads.render({
                                            url: upInfo.upgradeURL,
                                            height: field.height || 50,
                                            width: field.width || 50,
                                            maxCount: 1,
                                            number: 1,
                                            multiple: false,
                                            upStyle: "img",
                                            container: "#" + td.id,
                                            containerElem: td,
                                            tokenInfo: upInfo.tokenInfo,
                                            done: function (path) {
                                                row[name] = path;
                                                //flush history
                                                history[name] = path;
                                            },
                                            ondelete: function (elem) {
                                                row[name] = "";
                                                history[name] = "";
                                            },
                                            keyGenerator: function (filename) {
                                                return field.keyGenerator && field.keyGenerator(filename);
                                            },
                                            src: [
                                                row[name]
                                            ],
                                            input: {
                                                name: name,
                                            }

                                        });
                                    })

                                }
                            case "datetime":
                            case "year":
                            case "month":
                            case "date":
                            case "time":

                                var callable = (props) => {
                                    let field = props.field, detail = props.detail, row = props.row,
                                        history = props.history, td = props.td
                                    let input = document.createElement("input");
                                    input.className = 'layui-input'
                                    input.name = this.underline2Camel(field.name);
                                    input.disabled = field.disabled;
                                    input.placeholder = field.title;
                                    input.readOnly = true;
                                    input.id = td.id + "-dateinput";
                                    td.appendChild(input);
                                    if (history[input.name] !== undefined) {
                                        input.value = history[input.name];
                                    } else if (detail[input.name] != undefined) {
                                        input.value = detail[input.name];
                                    } else {
                                        input.value = new Date().getTime();
                                    }
                                    //synchronize input value and row
                                    row[input.name] = input.value;
                                    let init = input.value ? new Date(parseInt(input.value)) : "";
                                    var laydate = layui.laydate;
                                    laydate.render({
                                        elem: '#' + input.id,
                                        format: field.format || 'yyyy-MM-dd',
                                        type: field.type,
                                        value: init,
                                        theme: field.theme || "#1E9FFF",
                                        done: function (value, date, endDate) {
                                            //flush detail source
                                            console.log(value);
                                            row[input.name] = value ? new Date(value).getTime() : value;
                                            //flush history
                                            history[input.name] = row[input.name]
                                        }
                                    });
                                };
                                if (!layui.laydate) {
                                    layui.use('laydate', function () {
                                        call(callable);
                                    });
                                    return;
                                }
                                return callable;

                            case "number":
                            case "text":
                                input.className = 'layui-input'
                                input.type = field.type;
                                input.name = this.underline2Camel(field.name);
                                input.disabled = field.disabled;
                                input.placeholder = field.title;
                                if (field.disabled) {
                                    input.className = 'layui-input layui-disabled'
                                }

                                inputOnChange = function (e) {
                                    let value = e.target.value;
                                    //flush detail source
                                    currRow[input.name] = value;
                                    //flush history
                                    historyRow[input.name] = value;
                                };
                                if (historyRow[input.name] !== undefined) {
                                    input.value = historyRow[input.name];
                                } else if (detail[input.name] != undefined) {
                                    input.value = detail[input.name];
                                } else {
                                    input.value = "";
                                }
                                //synchronize input value and row
                                currRow[input.name] = input.value;
                                break;
                            case "checkbox":
                                input.setAttribute("lay-skin", "switch");
                                input.setAttribute("lay-text", field.text || "ON|OFF")
                                input.setAttribute("lay-filter", _this.el + '-skutable-checkbox-' + tr.getAttribute("data-index"));
                                input.name = this.underline2Camel(field.name);
                                input.type = "checkbox";
                                inputOnChange = function (e) {
                                    //flush detail source
                                    currRow[input.name] = e.target.checked;
                                    //flush history
                                    historyRow[input.name] = e.target.checked;
                                    field.onclick(input, tr);
                                };
                                if (layui) {
                                    layui.form.on('switch(' + _this.el + '-skutable-checkbox-' + tr.getAttribute("data-index") + ')', function (data) {
                                        //flush detail source
                                        currRow[input.name] = data.elem.checked;
                                        //flush history
                                        historyRow[input.name] = data.elem.checked;
                                        field.onclick(input, tr);
                                    });
                                }
                                if (historyRow[input.name] != undefined) {
                                    input.checked = historyRow[input.name];
                                } else {
                                    input.checked = detail[input.name] === undefined ? field.default : detail[input.name];
                                }
                                //synchronize input value and row
                                currRow[input.name] = input.checked;
                                field.onclick(input, tr);
                                break;
                            case "select":
                                let select = document.createElement("select");
                                select.setAttribute("lay-filter", td.id + "-select");
                                select.name = this.underline2Camel(field.name);
                                let option = document.createElement("option");
                                option.value = "";
                                option.innerText = "请选择";
                                select.appendChild(option);
                                for (let index = 0; field.source && index < field.source.length; index++) {
                                    const optionData = field.source[index];
                                    let option = document.createElement("option");
                                    option.value = optionData[field.sourceValueName || "id"];
                                    option.innerText = optionData[field.sourceDisplayName || "name"];
                                    select.appendChild(option);
                                    if (optionData.default) {
                                        option.selected = "selected";
                                    }
                                }
                                if (historyRow[select.name] !== undefined) {
                                    select.value = historyRow[select.name];
                                } else if (detail[select.name] != undefined) {
                                    select.value = detail[select.name];
                                } else {
                                    select.value = "";
                                }
                                //synchronize input value and row
                                currRow[select.name] = select.value;


                                layui.form.on('select(' + select.getAttribute('lay-filter') + ')', function (data) {
                                    currRow[select.name] = data.value;
                                    historyRow[select.name] = data.value;
                                });
                                return select;

                            case "custom":
                                let params = {
                                    field: field,
                                    detail: detail,
                                    row: currRow,
                                    history: historyRow,
                                    td: td,
                                    tr: tr
                                };
                                td.onclick = function () {
                                    field.onclick(params);
                                }
                                return field.domGenerator && field.domGenerator(params) || document.createElement("span");
                            default:
                        }
                        for (let index = 0; field.props && index < field.props.length; index++) {
                            input.setAttribute(field.props[index].name, field.props[index].value);
                        }
                        // for (let index = 0; field.style && index < field.style.length; index++) {
                        //     input.setAttribute(field.style[index].name, field.style[index].value);
                        // }
                        input.onchange = inputOnChange;
                        return input;

                    },
                    /**
                     * 获取单元格的合并数
                     * @param {int} index
                     */
                    getRowSpan: function (index) {

                        let rowSpan = 1;
                        for (
                            let nextSelect = _this.selected[++index];
                            nextSelect;
                            nextSelect = _this.selected[++index]
                        ) {
                            rowSpan *= nextSelect[_this.childrenNodeName].length;
                        }
                        return rowSpan;
                    },
                    /**
                     * 获取要渲染的行数
                     */
                    getRowCount: function () {
                        let count = 1;
                        let emptySelected = true;
                        for (let i = 0; i < _this.selected.length; i++) {
                            emptySelected = false;
                            const element = _this.selected[i];
                            count *= element[_this.childrenNodeName].length;
                        }
                        return emptySelected ? 0 : count;
                    },
                    /**
                     * 获取节点的父级
                     * @param {object} node
                     */
                    getTitleNodeFromSource: function (node) {
                        if (!(node && node.id)) {
                            return;
                        }

                        for (let i = 0; i < _this.source.length; i++) {
                            const parent = _this.source[i];
                            const children = parent[_this.childrenNodeName] || [];
                            for (let j = 0; j < children.length; j++) {
                                const element = children[j];
                                if (element.id === node.id) {
                                    return parent;
                                }
                            }
                        }
                    },
                    /**
                     * 从选中的节点获取父级
                     * @param {object} node
                     */
                    getTitleNodeFromSelected: function (node) {
                        for (let i = 0; i < _this.selected.length; i++) {
                            const parent = _this.selected[i];
                            if (parent.id === node.id) {
                                return parent;
                            }
                        }
                    },
                    /**
                     * 打印
                     */
                    printSelected: function () {
                        for (let i = 0; i < _this.selected.length; i++) {
                            const element = _this.selected[i];
                            console.log(element);
                            for (let j = 0; j < element[_this.childrenNodeName].length; j++) {
                                const childElement = element[_this.childrenNodeName][j];
                                console.log(childElement);
                            }
                            console.log("-----");
                        }
                    },
                },


                render: function (node) {

                    //获取父级规格
                    let titleNodeSource = this.utils.getTitleNodeFromSource(node);
                    if (!titleNodeSource) {
                        console.error("node has no parent");
                        return;
                    }
                    //获取已PUSH的节点
                    let hasPushedTitleNode = this.utils.getTitleNodeFromSelected(titleNodeSource);
                    if (!hasPushedTitleNode) {
                        //copy source title to has pushed selected
                        hasPushedTitleNode = {};
                        for (let attr in titleNodeSource) {
                            if (attr === _this.childrenNodeName) {
                                hasPushedTitleNode[_this.childrenNodeName] = [];
                                continue;
                            }
                            hasPushedTitleNode[attr] = titleNodeSource[attr];
                        }
                    }

                    //refresh children
                    let children = hasPushedTitleNode[_this.childrenNodeName];

                    this.pushOrSplice(children, node);
                    //update selected node
                    this.pushOrSplice(_this.selected, hasPushedTitleNode);
                    if (_this.debug) {
                        this.utils.printSelected();
                    }
                    if (_this.autoFill) {
                        this.renderAutoFillTable();
                    }
                    this.renderThead();
                    this.renderTbody();
                },


            }


            builder.frame()
            let tmpSet = new Set();
            for (let i = 0; i < _this.details.length; i++) {
                const detail = _this.details[i];
                let idArr = detail[_this.groupIdNames].split(_this.groupSeparator);
                for (let j = 0; j < idArr.length; j++) {
                    if (tmpSet.has(idArr[j])) {
                        continue;
                    }
                    tmpSet.add(idArr[j]);
                    let node = builder.utils.getNodeById(idArr[j]);
                    builder.render(node);
                }
            }

            return {
                render: function (node) {
                    return builder.render(node);
                },
                //更新节点源树结构
                updateSource: function (source) {
                    _this.source = source;
                },

                getRows: function () {
                    return _this.rows;
                },
                history: function () {
                    return _this.tempRowsMap;
                }


            }
        }
    }

    return SkuTable;

}, {
    name: "SkuTable",
    dependencies: ["form"]
});
