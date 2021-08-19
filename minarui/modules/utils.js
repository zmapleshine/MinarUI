/**
 * wmeimob fastboot utils
 */
(function (factory) {
    let utils = factory();
    if (window.fb || window.layui) {
        layui.define("spop", function (exports) {
            exports('utils', utils);
        });
    } else {
        window.layui.util = utils;
    }
    window.utils = utils;
})(function () {
        return {
            open:
                function (content, title, x, y, func) {
                    layer.open({
                        type: 1,
                        title: title,
                        area: [x, y],
                        shade: 0,
                        shadeClose: false,
                        content: content,
                        // end: function () {
                        //     content.find("input").val('');
                        //     content.find("img").attr("src", "");
                        // },
                        success: func
                    })
                },
            msg: {
                success: function (tips, timeout) {
                    layui.spop({
                        template: tips,
                        position: 'top-center',
                        style: 'success',
                        autoclose: timeout || 1500,
                    });
                },
                warning: function (tips, timeout) {
                    layui.spop({
                        template: tips,
                        position: 'top-center',
                        style: 'warning',
                        autoclose: timeout || 10000,
                    });
                },
                error: function (tips, timeout) {
                    layui.spop({
                        template: tips,
                        position: 'top-center',
                        style: 'error',
                        autoclose: timeout || 2000,
                    });
                },
            },
            string: {
                utf8_to_b64(str) {
                    return window.btoa(unescape(encodeURIComponent(str)));
                },
                b64_to_utf8(str) {
                    return decodeURIComponent(escape(window.atob(str)));
                }
            },
            getQueryString: function (name) {
                // 获取参数
                var url = window.location.search;
                // 正则筛选地址栏
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                // 匹配目标参数
                var result = url.substr(1).match(reg);
                //返回参数值
                return result ? decodeURIComponent(result[2]) : null;
            },
            formatDate: function (now, mask) {
                const d = now;
                const zeroize = function (value, length) {
                    if (!length)
                        length = 2;
                    value = String(value)
                    for (var i = 0, zeros = ''; i < (length - value.length); i++) {
                        zeros += '0';
                    }
                    return zeros + value;
                };


                var specialScene = true;
                switch (mask) {
                    case 'yyyyMM':
                        mask = "yyyy-MM";
                        break;
                    case 'yyyyMMdd':
                        mask = "yyyy-MM-dd"
                        break;
                    case 'yyyyMMddHH':
                        mask = "yyyy-MM-dd HH";
                        break;
                    case 'yyyyMMddHHmm':
                        mask = "yyyy-MM-dd-HH-mm";
                        break;
                    case 'yyyyMMddHHmmss':
                        mask = "yyyy-MM-dd-HH-mm-ss";
                        break;
                    case 'MMdd':
                        mask = "MM-dd";
                        break;
                    case 'MMddHH':
                        mask = "MM-dd-HH";
                        break;
                    case 'MMddHHmm':
                        mask = "MM-dd-HH-mm";
                        break;
                    case 'HHmm':
                        mask = "HH-mm";
                        break;
                    case 'HHmmss':
                        mask = "HH-mm-ss";
                        break;
                    default:
                        specialScene = false;
                        break;
                }

                let result = mask.replace(/"[^"]*"|'[^']*'|\b(?:d{1,4}|m{1,4}|yy(?:yy)?|([hHMstT])\1?|[lLZ])\b/g, function ($0) {
                    switch ($0) {
                        case 'd':
                            return d.getDate();
                        case 'dd':
                            return zeroize(d.getDate());
                        case 'ddd':
                            return [
                                'Sun',
                                'Mon',
                                'Tue',
                                'Wed',
                                'Thr',
                                'Fri',
                                'Sat'
                            ][d.getDay()];
                        case 'dddd':
                            return [
                                'Sunday',
                                'Monday',
                                'Tuesday',
                                'Wednesday',
                                'Thursday',
                                'Friday',
                                'Saturday'
                            ][d.getDay()];
                        case 'M':
                            return d.getMonth() + 1;
                        case 'MM':
                            return zeroize(d.getMonth() + 1);
                        case 'MMM':
                            return [
                                'Jan',
                                'Feb',
                                'Mar',
                                'Apr',
                                'May',
                                'Jun',
                                'Jul',
                                'Aug',
                                'Sep',
                                'Oct',
                                'Nov',
                                'Dec'
                            ][d.getMonth()];
                        case 'MMMM':
                            return [
                                'January',
                                'February',
                                'March',
                                'April',
                                'May',
                                'June',
                                'July',
                                'August',
                                'September',
                                'October',
                                'November',
                                'December'
                            ][d.getMonth()];
                        case 'yy':
                            return String(d.getFullYear()).substr(2);
                        case 'yyyy':
                            return d.getFullYear();
                        case 'h':
                            return d.getHours() % 12 || 12;
                        case 'hh':
                            return zeroize(d.getHours() % 12 || 12);
                        case 'H':
                            return d.getHours();
                        case 'HH':
                            return zeroize(d.getHours());
                        case 'm':
                            return d.getMinutes();
                        case 'mm':
                            return zeroize(d.getMinutes());
                        case 's':
                            return d.getSeconds();
                        case 'ss':
                            return zeroize(d.getSeconds());
                        case 'l':
                            return zeroize(d.getMilliseconds(), 3);
                        case 'L':
                            var m = d.getMilliseconds();
                            if (m > 99)
                                m = Math.round(m / 10);
                            return zeroize(m);
                        case 'tt':
                            return d.getHours() < 12
                                ? 'am'
                                : 'pm';
                        case 'TT':
                            return d.getHours() < 12
                                ? 'AM'
                                : 'PM';
                        case 'Z':
                            return d
                                .toUTCString()
                                .match(/[A-Z]+$/);
                        // Return quoted strings with the surrounding quotes removed
                        default:
                            return $0.substr(1, $0.length - 2);
                    }
                });
                return specialScene ? result.replace(/-/g, "") : result;
            },
            /**
             * 对象转get查询参数
             * @param {object} object
             */
            objectToQueryString: function (object) {
                if (!object) {
                    return "";
                }
                if (typeof object === "string") {
                    return object;
                }
                let str = "";
                for (const key in object) {
                    if (object.hasOwnProperty(key)) {
                        const element = object[key];
                        str += (key + "=" + element + "&");
                    }
                }
                return str.substring(0, str.length - 1);
            },
            isEmptyObject: function (object) {
                if (!object) {
                    return false;
                }
                return Object.getOwnPropertyNames(object).length === 0;
            },
            /**
             * form转查询字符串
             * @param {dom} form
             * @param {object} ext
             */
            toFormData: function (form) {
                if (!form) {
                    return "";
                }
                var len = form.elements.length;//表单字段长度;表单字段包括<input><select><button>等
                var field = null;//用来存储每一条表单字段
                var parts = [];//保存字符串将要创建的各个部分
                var opLen,//select中option的个数
                    opValue;//select中option的值
                //遍历每一个表单字段
                for (var i = 0; i < len; i++) {
                    field = form.elements[i];
                    switch (field.type) {
                        case "select-one":
                        case "select-multiple":
                            if (field.name.length) {
                                for (var j = 0, opLen = field.options.length; j < opLen; j++) {
                                    let option = field.options[j];
                                    if (option.selected) {
                                        opValue = '';
                                        if (option.hasAttribute) {
                                            opValue = (option.hasAttribute('value') ? option.value : option.text);
                                        } else {
                                            opValue = (option.hasAttribute['value'].specified ? option.value : option.text);//IE下
                                        }
                                        parts.push(encodeURIComponent(field.name) + '=' + encodeURIComponent(opValue));
                                    }

                                }
                            }
                            break;
                        case undefined:
                        case "file":
                        case "submit":
                        case "reset":
                        case "button":
                            break;
                        case "radio":
                        case "checkbox":
                            if (!field.checked) {
                                break;
                            }
                        default:
                            if (field.name.length) {
                                parts.push(encodeURIComponent(field.name) + '=' + encodeURIComponent(field.value));
                            }
                            break;
                    }
                }
                return parts.join("&");
            },

            /**
             *
             * form转对象
             * @param {dom} form
             * @param {object} ext
             */
            toJSONData: function (form, ext) {
                let assertElementValue = function (element) {
                    if (element.type === "number") {
                        //number
                        if ((element.value + "").indexOf(".") !== -1) {
                            return parseFloat(element.value);
                        } else {
                            return parseInt(element.value);
                        }
                    } else {
                        if (element.value === "true") {
                            return true;
                        }
                        if (element.value === "false") {
                            return false;
                        }
                        return element.value === undefined ? "" : element.value.trim();
                    }
                };
                let data = {};
                if (!form) {
                    return ext || data;
                }
                let formElements = form.querySelectorAll("[name]");
                for (let index = 0; index < formElements.length; index++) {
                    const element = formElements[index];
                    if (!element.name) {
                        continue;
                    }
                    //if data exists
                    if (data[element.name] !== undefined && element.type !== "radio") {
                        //assert this data prop is not array
                        if (!data[element.name].push) {
                            //rebuild this prop is a array
                            data[element.name] = [data[element.name]];
                        }
                        data[element.name].push(assertElementValue(element));
                    } else {
                        if (element.type === "radio") {
                            if (element.checked) {
                                data[element.name] = assertElementValue(element);
                            }
                        } else {
                            data[element.name] = assertElementValue(element);
                        }
                    }
                }
                if (ext) {
                    for (const key in ext) {
                        if (ext.hasOwnProperty(key)) {
                            const element = ext[key];
                            data[key] = element;
                        }
                    }
                }
                return data;
            }
            ,
            render: {
                select: function (el, arr, displayProp, valueProp) {
                    if (!arr) {
                        return;
                    }

                    let dom = document.querySelector(el);
                    let opClassName = "fb-render-select-op" + (valueProp || "id") + (displayProp || "name");
                    for (let index = 0; index < dom.childNodes.length; index++) {
                        const element = dom.childNodes[index];
                        if (element.tagName !== "OPTION") {
                            continue;
                        }
                        if (element.className.indexOf(opClassName) !== -1) {
                            dom.removeChild(element);
                            index--;
                        }
                    }
                    for (let index = 0; index < arr.length; index++) {
                        const element = arr[index];
                        let option = document.createElement("option");
                        option.value = element[valueProp || "id"];
                        option.innerText = element[displayProp || "name"];
                        option.classList.add("fb-render-select-op" + (valueProp || "id") + (displayProp || "name"))
                        dom.appendChild(option);
                    }
                    layui.form.render("select");
                }
            }
            ,
            browser: {
                isIE: function () {
                    return !!window.ActiveXObject || "ActiveXObject" in window;
                }
                ,
                isIE11: function () {
                    return (/Trident\/7\./).test(navigator.userAgent);
                }
                ,
                isWeixin: function () {
                    return navigator.userAgent.toLowerCase().match(/MicroMessenger/i) === "micromessenger";
                }
                ,
            }
            ,
            underline2Camel(str) {
                return str && str.replace(/_([a-z])/g, function (all, letter) {
                    return letter.toUpperCase();
                });
            }
            ,
            valid: {
                chineseReg: "[\\u4E00-\\u9FFF]+",
                hasChinese:

                    function (str) {
                        return new RegExp(this.chineseReg, "g").test(str);
                    }
            }
            ,
            randomString(len) {
                len = len || 32;
                var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
                var maxPos = chars.length;
                var pwd = '';
                for (var i = 0; i < len; i++) {
                    pwd += chars.charAt(Math.floor(Math.random() * maxPos));
                }
                return pwd;
            }
            ,
            getUUID: function () {
                function S4() {
                    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                }

                return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
            }
            ,
            io: {
                getSuffix(filename) {
                    var pos = filename.lastIndexOf('.')
                    var suffix = ''
                    if (pos != -1) {
                        suffix = filename.substring(pos)
                    }
                    return suffix;
                }
            }


        }
    }
)

