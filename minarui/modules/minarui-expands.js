!function () {

    layui && layui.define(function (exports) {
        exports('minaruiExpands', {})
    });

    HTMLDocument.prototype.render = function (el, data, rule) {
        var element = document.querySelector(el)
        if (!element) {
            return;
        }
        var content;
        if (element instanceof HTMLTemplateElement) {
            element = element.cloneNode(true);
            content = element.content;
        } else {
            content = element;
        }
        var props = Object.getOwnPropertyNames(data);
        for (var j = 0; j < props.length; j++) {
            var prop = props[j];
            prop = prop.replace("[", "\\[").replace("]", "\\]")
            var formElement = content.querySelector("[name=" + prop + "]")
            if (!formElement) {
                continue;
            }

            var dataValue = data[prop];
            dataValue = typeof dataValue === "function" ? dataValue(data) : dataValue;
            var ruleValue = rule && rule[prop];
            ruleValue = typeof ruleValue === "function" ? ruleValue(dataValue, data) : ruleValue;
            if (ruleValue !== undefined) {
                dataValue = ruleValue
            }
            if (formElement instanceof HTMLSelectElement) {
                var option = formElement.querySelector("option[value='" + dataValue + "']")
                option && (option.selected = true | option.setAttribute("selected", ""));
            } else if (formElement.type === "checkbox") {
                formElement.checked = true;
                formElement.setAttribute("checked", "");
            } else if (formElement.type === "radio") {
                var checked = content.querySelector("input[type=radio][value='" + dataValue + "']");
                checked && (checked.checked = true | checked.setAttribute("checked", ""))
            } else {
                formElement.value = dataValue;
                formElement.setAttribute("value", dataValue)
            }
        }
        if (layui && layui.form) {
            layui.form.render();
        }
        return element.innerHTML;
    }

    //字符串模板函数
    String.prototype.render = function (object, rule) {
        return this.replace(/{{(.*?)}}/g, function (match, key) {
            try {
                let ruleFu;
                try {
                    ruleFu = rule && eval("rule." + key.trim());
                } catch (e) {
                    //ignore NPE
                }
                let value = eval("object." + key.trim());
                if (ruleFu) {
                    return ruleFu(value, object);
                }
                return value === undefined ? "" : (typeof value === "function" ? value(object) : value);
            } catch (e) {
                console.warn(e.message)
                return "";
            }
        });
    };

    //dom forEach
    if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = function (callback, thisArg) {
            thisArg = thisArg || window;
            for (let i = 0; i < this.length; i++) {
                callback.call(thisArg, this[i], i, this);
            }
        };
    }

    try {
        new Map()
    } catch (e) {
        class Map {
            constructor() {
                this.elements = new Array();
                // 获取Map元素个数
                this.size = function () {
                    return this.elements.length;
                },
                    // 判断Map是否为空
                    this.isEmpty = function () {
                        return (this.elements.length < 1);
                    },
                    // 删除Map所有元素
                    this.clear = function () {
                        this.elements = new Array();
                    },
                    // 向Map中增加元素（key, value)
                    this.put = function (_key, _value) {
                        if (this.containsKey(_key) == true) {
                            if (this.containsValue(_value)) {
                                if (this.remove(_key) == true) {
                                    this.elements.push({
                                        key: _key,
                                        value: _value
                                    });
                                }
                            } else {
                                this.elements.push({
                                    key: _key,
                                    value: _value
                                });
                            }
                        } else {
                            this.elements.push({
                                key: _key,
                                value: _value
                            });
                        }
                    },
                    // 向Map中增加元素（key, value)
                    this.set = function (_key, _value) {
                        if (this.containsKey(_key) == true) {
                            if (this.containsValue(_value)) {
                                if (this.remove(_key) == true) {
                                    this.elements.push({
                                        key: _key,
                                        value: _value
                                    });
                                }
                            } else {
                                this.elements.push({
                                    key: _key,
                                    value: _value
                                });
                            }
                        } else {
                            this.elements.push({
                                key: _key,
                                value: _value
                            });
                        }
                    },
                    // 删除指定key的元素，成功返回true，失败返回false
                    this.remove = function (_key) {
                        var bln = false;
                        try {
                            for (i = 0; i < this.elements.length; i++) {
                                if (this.elements[i].key == _key) {
                                    this.elements.splice(i, 1);
                                    return true;
                                }
                            }
                        } catch (e) {
                            bln = false;
                        }
                        return bln;
                    },
                    // 删除指定key的元素，成功返回true，失败返回false
                    this.delete = function (_key) {
                        var bln = false;
                        try {
                            for (i = 0; i < this.elements.length; i++) {
                                if (this.elements[i].key == _key) {
                                    this.elements.splice(i, 1);
                                    return true;
                                }
                            }
                        } catch (e) {
                            bln = false;
                        }
                        return bln;
                    },
                    // 获取指定key的元素值value，失败返回null
                    this.get = function (_key) {
                        try {
                            for (i = 0; i < this.elements.length; i++) {
                                if (this.elements[i].key == _key) {
                                    return this.elements[i].value;
                                }
                            }
                        } catch (e) {
                            return null;
                        }
                    },
                    // set指定key的元素值value
                    this.setValue = function (_key, _value) {
                        var bln = false;
                        try {
                            for (i = 0; i < this.elements.length; i++) {
                                if (this.elements[i].key == _key) {
                                    this.elements[i].value = _value;
                                    return true;
                                }
                            }
                        } catch (e) {
                            bln = false;
                        }
                        return bln;
                    },
                    // 获取指定索引的元素（使用element.key，element.value获取key和value），失败返回null
                    this.element = function (_index) {
                        if (_index < 0 || _index >= this.elements.length) {
                            return null;
                        }
                        return this.elements[_index];
                    },
                    // 判断Map中是否含有指定key的元素
                    this.containsKey = function (_key) {
                        var bln = false;
                        try {
                            for (i = 0; i < this.elements.length; i++) {
                                if (this.elements[i].key == _key) {
                                    bln = true;
                                }
                            }
                        } catch (e) {
                            bln = false;
                        }
                        return bln;
                    },
                    // 判断Map中是否含有指定key的元素
                    this.has = function (_key) {
                        var bln = false;
                        try {
                            for (i = 0; i < this.elements.length; i++) {
                                if (this.elements[i].key == _key) {
                                    bln = true;
                                }
                            }
                        } catch (e) {
                            bln = false;
                        }
                        return bln;
                    },
                    // 判断Map中是否含有指定value的元素
                    this.containsValue = function (_value) {
                        var bln = false;
                        try {
                            for (i = 0; i < this.elements.length; i++) {
                                if (this.elements[i].value == _value) {
                                    bln = true;
                                }
                            }
                        } catch (e) {
                            bln = false;
                        }
                        return bln;
                    },
                    // 获取Map中所有key的数组（array）
                    this.keys = function () {
                        var arr = new Array();
                        for (i = 0; i < this.elements.length; i++) {
                            arr.push(this.elements[i].key);
                        }
                        return arr;
                    },
                    // 获取Map中所有value的数组（array）
                    this.values = function () {
                        var arr = new Array();
                        for (i = 0; i < this.elements.length; i++) {
                            arr.push(this.elements[i].value);
                        }
                        return arr;
                    };
                /**
                 * map遍历数组
                 * @param callback [function] 回调函数；
                 * @param context [object] 上下文；
                 */
                this.forEach = function forEach(callback, context) {
                    context = context || window;
                    //IE6-8下自己编写回调函数执行的逻辑
                    var newAry = new Array();
                    for (var i = 0; i < this.elements.length; i++) {
                        if (typeof callback === 'function') {
                            var val = callback.call(context, this.elements[i].value, this.elements[i].key, this.elements);
                            newAry.push(this.elements[i].value);
                        }
                    }
                    return newAry;
                };
            }
        }

        window.Map = Map;
    }
}()


