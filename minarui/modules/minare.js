layui.define(function (exports) {
    exports('minare', function () {

        var minare = function (method, url, body) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url);

            var successCallback, failCallback, finallyCallback
            return {
                success: function (funcs) {
                    successCallback = funcs;
                    return this
                },
                fail: function (funcs) {
                    failCallback = funcs
                    return this
                },
                finally: function (funcs) {
                    finallyCallback = funcs
                    return this
                },
                execute: function () {
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200) {
                                successCallback && successCallback(JSON.parse(xhr.responseText))
                            } else {
                                failCallback && failCallback(xhr.status, JSON.parse(xhr.responseText))
                            }
                            finallyCallback && finallyCallback(xhr.status, JSON.parse(xhr.responseText))
                        }
                    }
                    if (typeof body === "object") {
                        body = JSON.stringify(body)
                    }
                    xhr.send(body ? body : null)
                }
            }
        }

        return {
            newGet: function (url) {
                return new minare("GET", url)
            },
            newPost: function (url, body) {
                return new minare("POST", url, body)
            },
            newPut: function (url, body) {
                return new minare("PUT", url, body)
            },
            newDelete: function (url, body) {
                return new minare("DELETE", url, body)
            }
        }
    }())
})