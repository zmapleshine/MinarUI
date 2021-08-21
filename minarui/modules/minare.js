layui.define(function (exports) {
    exports('minare', function () {

        let config = function () {
            return {
                handler: {
                    onComplete: function () {
                    }, onTimeout: function () {
                    }, onUploadProgress: function () {
                    }, statusHandlerMapping: {}
                },
                header: {},
                timeout: 0
            }
        }

        function wrapEmptyIfNotFunction(f) {
            return (f && typeof f === "function") ? f : function () {
            }
        }

        let getFunction = function (f, nullable) {
            return (f && typeof f === "function") ? f : (nullable ? null : function () {
            })
        }
        let getStatusProperty = function (status) {
            return "status_" + status
        }

        let getHandlerFromConfig = function (config, status) {
            return config["handler"] ? config["handler"].statusHandlerMapping[getStatusProperty(status)] : null;
        }

        let globalConfig = new config()
        let configure = {
            when: function (status, handler) {
                globalConfig.handler.statusHandlerMapping[getStatusProperty(status)] = wrapEmptyIfNotFunction(handler);
                return this;
            },
            whenTimeout: function (handler) {
                globalConfig.handler.onTimeout = wrapEmptyIfNotFunction(handler);
                return this;
            },
            whenComplete: function (handler) {
                globalConfig.handler.onComplete = wrapEmptyIfNotFunction(handler);
                return this;
            },
            whenUploadProgress: function (handler) {
                globalConfig.handler.onUploadProgress = wrapEmptyIfNotFunction(handler);
                return this;
            },
            timeout: function (timeout) {
                globalConfig.timeout = typeof timeout === "number" ? timeout : 0;
                return this;
            },
            addRequestHeader: function (key, value) {
                if (key && value) {
                    globalConfig.header[key] = value
                }
                return this;
            }

        }
        let minare = function (method, url, body) {

            let xhr = new XMLHttpRequest();
            xhr.open(method, url);

            let isJsonResponse = true
            let _config = new config()

            let getResponse = function (xhr) {
                if (isJsonResponse) {
                    try {
                        return JSON.parse(xhr.responseText)
                    } catch (e) {
                        console.warn("error convert to json data,return response text")
                        return xhr.responseText
                    }
                }
                return xhr.responseText
            }

            return {
                onSuccess: function (f) {
                    _config.handler.statusHandlerMapping[getStatusProperty(200)] = getFunction(f, true);
                    return this;
                },
                onError: function (f) {
                    _config.handler.statusHandlerMapping[getStatusProperty(500)] = getFunction(f, true);
                    _config.handler.statusHandlerMapping[getStatusProperty(502)] = getFunction(f, true);
                    _config.handler.statusHandlerMapping[getStatusProperty(503)] = getFunction(f, true);
                    return this;
                },
                onComplete: function (f) {
                    _config.handler.onComplete = getFunction(f, true);
                    return this;
                },
                onTimeout: function (f) {
                    _config.handler.onTimeout = getFunction(f, true);
                },
                onUploadProgress: function (f) {
                    _config.handler.onUploadProgress = getFunction(f, true);
                },
                setHeader: function (key, value) {
                    xhr.setRequestHeader(key, value)
                    return this;
                },
                stringResponse: function () {
                    isJsonResponse = false
                    return this;
                },
                $xhr: function (f) {
                    f(xhr);
                    return this;
                },

                execute: function () {
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4) {

                            const status = xhr.status;
                            const handler = getHandlerFromConfig(_config, status);
                            const globalHandler = getHandlerFromConfig(globalConfig, status);

                            const resp = getResponse(xhr);
                            handler && handler(resp) || (globalHandler && globalHandler(resp))

                            _config.handler.onComplete && _config.handler.onComplete(resp, status)
                            || (globalConfig.handler.onComplete && globalConfig.handler.onComplete(resp, status));
                        }
                    }

                    const headerProperty = Object.getOwnPropertyNames(globalConfig.header);
                    for (let i = 0; i < headerProperty.length; i++) {
                        const name = headerProperty[i];
                        const value = globalConfig.header[name];
                        xhr.setRequestHeader(name, typeof (value) === "function" ? value({method, url, body}) : value)
                    }

                    xhr.timeout = globalConfig.timeout;
                    xhr.ontimeout = function (ev) {
                        _config.handler.onTimeout && _config.handler.onTimeout(ev)
                        || (globalConfig.handler.onTimeout && globalConfig.handler.onTimeout(ev));
                    }
                    xhr.upload.onprogress = function (ev) {
                        _config.handler.onUploadProgress && _config.handler.onUploadProgress(ev)
                        || (globalConfig.handler.onUploadProgress && globalConfig.handler.onUploadProgress(ev));
                    }

                    if (body === undefined) {
                        xhr.send(null)
                    } else if (body instanceof FormData || body instanceof File || body instanceof Blob || typeof body === "string") {
                        xhr.send(body)
                    } else {
                        let sendBody = body;
                        try {
                            sendBody = JSON.stringify(body);
                        } catch (e) {
                        }
                        xhr.send(sendBody)
                    }
                }
            }
        }

        return {
            config: function (f) {
                if (typeof f === "function") {
                    f(configure)
                }
                return Object.assign({}, globalConfig);
            },
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
            },
        }
    }())
})