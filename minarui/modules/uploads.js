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
    let fupload = layui.fupload, uploadTools = layui.uploadTools, utils = layui.utils, layer = layui.layer;


    class Uploads {
        constructor(options) {
            this.container = options.container;
            this.height = options.height || 150;
            this.width = options.width || 150;
            this.upBG = options.upBG || "/minarui/imgs/img-up-cover.png";
            this.debug = options.debug === true;
            this.input = options.input || {name: "", value: ""};
            this.maxCount = options.maxCount || 1;
            this.src = options.src || [];
            this.upStyle = options.upStyle || "img";
            this.tokenInfo = options.tokenInfo || {};
            this.scene = options.scene || "images";
            this.keyGenerator = options.keyGenerator;
            this.border = options.border || false;
            this.done = options.done;
            this.ondelete = options.ondelete;
            this.accept = options.accept;
            this.hasCount = 0;
            this.options = options || {};
            this.containerElem = document.querySelector(this.container) || options.containerElem;
            this.layUpload = {}
            this.readMode = options.readMode || false;
            this.init();
            return this;

        }

        appendActivation() {
            let activation;
            if (this.upStyle === "img") {
                activation = document.createElement("img");
                activation.style.width = this.width + "px";
                activation.style.maxWidth = this.width + "px";
                activation.style.height = this.height + "px";
                activation.src = this.upBG;
            } else {
                activation = document.createElement("button");
                activation.className = "layui-btn layui-btn-normal";
                let icon = document.createElement("i");
                icon.className = "layui-icon layui-icon-upload-drag"
                activation.appendChild(icon);
                activation.appendChild(document.createTextNode(" "));
                activation.appendChild(document.createTextNode("点击上传"));
            }
            activation.id = this.container.substr(1, this.container.length) + "-start";
            this.containerElem.appendChild(activation);
            this.render("#" + activation.id);
        }

        flushCountState(isPlus) {
            if (isPlus) {
                ++this.hasCount;
            } else {
                --this.hasCount;
            }
            if (this.hasCount >= this.maxCount) {
                this.hideUploadComponent();
            } else {
                this.showUploadComponent();
            }

        }

        appendComponent(idx, path, dataIndex) {
            var _this = this;

            function appendImage(div, idx, path, dataIndex) {
                let img = document.createElement("img");
                img.style.width = _this.width + "px";
                img.style.maxWidth = _this.width + "px";
                img.style.height = _this.height + "px";
                img.src = path;
                img.style.marginBottom = "10px";
                img.id = _this.container.substr(1, _this.container.length) + "-img-" + idx;
                if (dataIndex) {
                    img.setAttribute("data-index", "img" + dataIndex);
                }

                if (path.indexOf("data:image/") === 0) {
                    img.style.opacity = 0.5
                }
                div.appendChild(img);
                layer.photos({
                    photos: "#" + div.id
                });
                return img;
            }

            function appendVideo(div, idx, path, dataIndex) {
                let video = document.createElement("video");
                video.style.width = _this.width + "px";
                video.style.maxWidth = _this.width + "px";
                video.style.height = _this.height + "px";
                video.src = path;
                video.id = _this.container.substr(1, _this.container.length) + "-video-" + idx;
                video.setAttribute("controls", "controls");
                if (dataIndex) {
                    video.setAttribute("data-index", "img" + dataIndex);
                }

                if (path.indexOf("data:video/") === 0) {
                    video.style.opacity = 0.5
                }
                div.appendChild(video);
                layer.photos({
                    photos: "#" + div.id
                });
                return video;
            }

            function appendFileButton(div, idx, path, dataIndex) {
                let butten = document.createElement("a");
                butten.text = "下载"
                butten.style.width = _this.width + "px";
                butten.style.maxWidth = _this.width + "px";
                // butten.style.height = _this.height + "px";
                butten.style.fontSize = "14px";
                butten.style.lineHeight = _this.height + "px";
                butten.setAttribute("href", path);
                butten.setAttribute("download", "download");
                butten.className = "layui-btn layui-btn-normal layui-btn-sm layui-btn-radius";
                if (dataIndex) {
                    butten.setAttribute("data-index", "img" + dataIndex);
                }
                div.appendChild(butten);
                layer.photos({
                    photos: "#" + div.id
                });
                return butten;
            }


            function appendInput(div, idx, path, dataIndex) {
                var input = document.createElement("input");
                input.type = "hidden";
                input.name = _this.input.name;
                input.value = path.indexOf("data:image/") === 0 ? "" : path;
                input.id = _this.container.substr(1, _this.container.length) + "-input-" + idx;
                if (dataIndex) {
                    input.setAttribute("data-index", "input" + dataIndex);
                }
                div.appendChild(input);
                return input;
            }

            function appendDeleteBtn(div, idx) {
                var i = document.createElement("i");
                i.className = "layui-icon layui-icon-close-fill";
                i.id = _this.container.substr(1, _this.container.length) + "-delete-" + idx;
                i.style.position = "relative";
                i.style.bottom = (_this.height / 2) + 6 + "px";
                i.onclick = (e) => {
                    let delId = e.target.id.replace("-delete-", "-box-");
                    for (let index = 0; index < _this.containerElem.childNodes.length; index++) {
                        const element = _this.containerElem.childNodes[index];
                        if (element.id === delId) {
                            _this.containerElem.removeChild(document.querySelector("#" + delId));
                            _this.flushCountState(false);
                            _this.ondelete && _this.ondelete(element, _this.src[index]);
                            return;
                        }
                    }
                }
                div.appendChild(i);
            }

            var div = document.createElement("div");
            div.id = this.container.substr(1, this.container.length) + "-box-" + idx;
            div.style.width = this.width;
            div.style.height = this.height;
            div.style.display = "inline-block";
            this.containerElem.insertBefore(div, this.containerElem.querySelector("#" + this.container.substr(1, this.container.length) + "-start"));
            if (this.accept === "file") {
                appendFileButton(div, idx, path, dataIndex);
            } else if (this.accept === "video") {
                appendVideo(div, idx, path, dataIndex);
            } else {
                appendImage(div, idx, path, dataIndex);
            }
            appendInput(div, idx, path, dataIndex)
            appendDeleteBtn(div, idx);

            this.flushCountState(true);

        }

        hideUploadComponent() {
            // this.containerElem.querySelector("#" + this.container.substr(1, this.container.length) + "-start").style.height = "0";
            this.containerElem.querySelector("#" + this.container.substr(1, this.container.length) + "-start").style.display = "none";
        }

        showUploadComponent() {
            // this.containerElem.querySelector("#" + this.container.substr(1, this.container.length) + "-start").style.height = this.height + "px";
            this.containerElem.querySelector("#" + this.container.substr(1, this.container.length) + "-start").style.display = "";
        }


        init() {
            var _this = this;
            var outerParams = {
                key: function (fileName) {
                    return _this.keyGenerator && _this.keyGenerator(fileName) || (_this.tokenInfo.dir || "") + utils.randomString() + utils.io.getSuffix(fileName);
                },
                "scene": _this.scene
            };
            let configure = uploadTools.configure(_this.tokenInfo, outerParams);
            this.options.headers = this.options.headers || configure.headers;
            this.options.data = this.options.data || configure.params;
            this.options.type = this.options.type || configure.type;

            if (this.container) {
                if (this.border) {
                    document.querySelector(this.container).style.border = "1px solid #ccc";
                    document.querySelector(this.container).style.padding = "20px";
                }

                if (!this.readMode) {
                    this.appendActivation();
                }
                for (let index = 0; index < this.src.length; index++) {
                    const src = this.src[index].src || this.src[index];
                    if (src) {
                        this.appendComponent(index, src);
                    }
                }
            } else {
                this.layUpload = fupload.render(this.options);
            }
        }

        render(el) {
            var _this = this;
            this.options.elem = el;
            this.options.before = function (obj) {
                obj.preview(function (index, file, result) {
                    if (_this.hasCount >= _this.maxCount) {
                        _this.hideUploadComponent();
                        return;
                    }
                    _this.appendComponent(_this.hasCount, result, index);
                });
            };
            this.options.done = function (res, index, upload, formData, param) {
                if (_this.debug) {
                    console.log(res);
                }
                var path = "#";
                if (!utils.isEmptyObject(res)) {
                    if (param.type === 'cos') {
                        path = location.protocol + "//" + param.Bucket + ".cos." + param.Region + ".myqcloud.com/" + param["key"];
                    } else {
                        if (res.path) {
                            path = res.path;
                        }
                        //qiniu
                        if (res.key) {
                            path = _this.tokenInfo.host + res.key;
                        }
                    }
                } else {
                    //oss
                    path = _this.tokenInfo.host + "/" + param["key"];
                }
                if (typeof _this.done === "function") {
                    _this.done(path, param, upload);
                }
                document.querySelector("[data-index=img" + index + "]").style.opacity = 1;
                document.querySelector("[data-index=input" + index + "]").value = path;
            }
            this.layUpload = fupload.render(this.options);
        }
    }


    return {
        render: function (config) {
            return new Uploads(config);
        }
    }

}, {
    name: "uploads",
    dependencies: ["fupload", "uploadTools", "utils", "layer"]
});