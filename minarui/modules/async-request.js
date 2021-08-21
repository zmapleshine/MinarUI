const SUCCESS = 0;
const FAIL = -1;
(function (factory) {
    if (window.layui) {
        layui.define(['jquery', 'layer', 'utils'], function (exports) {
            exports('req', factory());
        });
    } else {
        window.req = factory();
    }
})(function () {
    const req = {
        props: undefined,
        headers: {},
        init: function (customProps) {
            this.props = customProps;
            this.headers = customProps.headers;
            return customProps;
        },
        disabledSubmit: function () {
            layui.$("*[type=submit]").prop("disabled", true);
            // layui.$("input").prop("disabled", true);
            layui.$("button").prop("disabled", true);
        },

        enabledSubmit: function () {
            layui.$("*[type=submit]").prop("disabled", false);
            // layui.$("input").prop("disabled", false);
            layui.$("button").prop("disabled", false);
        },


        get: function (url, successCallback, failCallback) {
            return this.xhr("GET", url, "_t=" + new Date().getTime(), successCallback, failCallback);
        }
        ,
        post: function (url, param, successCallback, failCallback) {
            return this.xhr("POST", url, param, successCallback, failCallback);
        }
        ,
        put: function (url, param, successCallback, failCallback) {
            return this.xhr("PUT", url, param, successCallback, failCallback);
        }
        ,
        delete: function (url, successCallback, failCallback) {
            return this.xhr("DELETE", url, null, successCallback, failCallback);
        },
        load: function (url, success) {
            return layui.$.get(url, success);
        },
        xhr: function (method, url, param, successCallback, failCallback, async) {

            let contentType = "application/x-www-form-urlencoded";
            let processData = true;

            if (param != null && typeof (param) === "object" && param.innerText === undefined) {
                param = JSON.stringify(param);
                contentType = "application/json";
            }

            if (param !== undefined && param != null && "string" === typeof param.innerText) {
                contentType = false;
                processData = false;
                param = new FormData(param);
            }

            let _this = this;
            let requestParam = {
                url: _this.props.api + url,
                type: method,
                data: param,
                dataType: "json",
                contentType: contentType,
                success: function (ret, var2, var3) {
                    if (ret.code !== undefined && ret.code !== 0) {
                        if (_this.props.autoCustomErrTip) {
                            utils.msg.error(ret.description, 2000);
                        }
                    }
                    successCallback(ret, var2, var3);
                },
                processData: processData,
                beforeSend: function (req) {
                    _this.disabledSubmit();
                    layer.load();
                },
                complete: function (ret) {
                    _this.enabledSubmit();
                    // layer.closeAll();
                    layer.closeAll('loading');
                },
                error: function (XMLHttpResponse, textStatus, errorThrown) {
                    if (XMLHttpResponse.status === 200) {
                        if (successCallback) {
                            successCallback(XMLHttpResponse.responseText);
                            _this.enabledSubmit();
                            return;
                        }

                    }

                    switch (XMLHttpResponse.status) {
                        case 401:
                            if (_this.props.authHandler) {
                                _this.props.authHandler();
                                break;
                            }
                            location.href = _this.props.loginPage || "/login.html";
                            break;
                        case 400:
                        case 403:
                        case 500:
                            if (failCallback) {
                                failCallback(XMLHttpResponse.responseJSON);
                                return;
                            }
                            utils.msg.error(XMLHttpResponse.responseJSON.description||XMLHttpResponse.responseJSON.msg, 3000);
                            break;
                    }

                    _this.enabledSubmit();
                }
            };

            if (_this.headers) {
                requestParam.headers = {};
                for (let index = 0; index < Object.getOwnPropertyNames(_this.headers).length; index++) {
                    const name = Object.getOwnPropertyNames(_this.headers)[index];
                    requestParam.headers[name] = _this.headers[name]();
                }
            }
            return layui.$.ajax(requestParam);
        }
    }
    return req;
})


