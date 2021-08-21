!function () {
    if (window.layui) {
        layui.define(["wangEditor", "uploadTools", "utils"], function (define) {
            window.wangEditor = layui.wangEditor;
            window.uploadTools = layui.uploadTools;
            window.utils = layui.utils;
            define("richText", RichText.prototype);
        });
    } else {
        window.richText = RichText.prototype;
    }

    class RichText {
        constructor(props) {
            this.el = props.el;
            this.url = props.url;
            this.scene = props.scene || "";
            this.maxSize = props.maxSize;
            this.maxCount = props.maxCount;
            this.tokenInfo = props.tokenInfo || {};
            this.height = props.height ;
            this.keyGenerator = props.keyGenerator || function () { };
            this.outerNamespace = props.outerNamespace || [];
            this.zIndex = props.zIndex;
            this.fetchImageTo = function(){} || props.fetchImageTo;
            
            this.props = props;
            return this.init();

        }

        render(props) {
            return new RichText(props);
        }

        init() {
            let DEFAULT = {
                DEFAULT_MAX_SIZE: 2 * 1024 * 1024,
                DEFAULT_MAX_COUNT: 5,
                IMG_REG: /<img.*?(?:>|\/>)/gi,
                IMG_SRC_REG: /src=[\'\"]?([^\'\"]*)[\'\"]?/i ,
                Z_INDEX:10000,
                DEFAULT_HEIGHT:"300px"
            };

            let OUTER_NAMESPACE = [/[*.+]xiumi.us/].concat(this.outerNamespace);

            let editor = new wangEditor(this.el);
            let scene = this.scene;
            editor.customConfig = this.props;
            editor.customConfig.height = this.height || DEFAULT.DEFAULT_HEIGHT;
            editor.customConfig.pasteFilterStyle = false;
            editor.customConfig.uploadImgMaxSize = this.maxSize || DEFAULT.DEFAULT_MAX_SIZE;
            editor.customConfig.uploadImgMaxLength = this.maxCount || DEFAULT.DEFAULT_MAX_COUNT;
            editor.customConfig.zIndex  = this.zIndex  || DEFAULT.Z_INDEX ;



            let _this = this;
            editor.customConfig.customUploadImg = function (files, insert) {
                for (let index = 0; index < files.length; index++) {
                    const file = files[index];
                    const outerParams = {
                        "key": _this.keyGenerator(file.name) || ((_this.tokenInfo.dir || "") + utils.randomString() + utils.io.getSuffix(file.name)),
                        "scene": scene
                    };
                    let configure = uploadTools.configure(_this.tokenInfo, outerParams);
                    if(configure.type==='cos'){
                        layui.use("COS",function () {
                            //兼容腾讯云上传
                            var COS = layui.COS;
                            var cos = new COS({
                                getAuthorization: function (option, callback) {
                                    callback({
                                        TmpSecretId: configure.params.TmpSecretId,
                                        TmpSecretKey: configure.params.TmpSecretKey,
                                        XCosSecurityToken: configure.params.XCosSecurityToken,
                                        ExpiredTime: configure.params.ExpiredTime
                                    });
                                }
                            });
                            cos.putObject({
                                Bucket: configure.params.Bucket,
                                Region: configure.params.Region,
                                Key: configure.params.key,
                                Body: file,
                                onProgress: function (progressData) {
                                    console.log('上传中', JSON.stringify(progressData));
                                },
                            }, function (err, data) {
                                console.log("cos err",err)
                                var imgPath = location.protocol+"//"+configure.params.Bucket+".cos."+configure.params.Region+".myqcloud.com/" + configure.params.key;
                                insert(imgPath);
                                return;
                            });
                        });

                    }else{
                        let xhr = new XMLHttpRequest();
                        xhr.open("POST", _this.url);
                        let headers = configure.headers;
                        for (const key in headers) {
                            if (headers.hasOwnProperty(key)) {
                                const element = headers[key];
                                xhr.setRequestHeader(key, element);
                            }
                        }
                        let params = configure.params;
                        let request = new FormData();
                        for (const key in params) {
                            if (params.hasOwnProperty(key)) {
                                const element = params[key];
                                request.append(key, typeof element === "function" ? element() : element);
                            }
                        }
                        request.append('file', file);
                        xhr.send(request);
                        let imagePath = _this.tokenInfo.host + "/" + outerParams.key;
                        xhr.onreadystatechange = function () {
                            if (this.readyState === 4 && this.status === 200) {
                                let responseText = this.responseText;
                                if (responseText) {
                                    let responseJSON = JSON.parse(responseText);
                                    //local
                                    if (responseJSON.path) {
                                        insert(responseJSON.path);
                                        return;
                                    }
                                    //qiniu
                                    if (responseJSON.key) {
                                        insert(_this.tokenInfo.host + responseJSON.key);
                                        return;
                                    }
                                }
                                //oss
                                insert(imagePath);
                            }
                        }
                    }

                }
            }
            // 自定义处理粘贴的文本内容
            editor.customConfig.pasteTextHandle = function (content) {
                let contentDiv = document.createElement("div");
                contentDiv.innerHTML = content;
                contentDiv.id = "minar-rich-text-" + _this.el.substring(1);
                let imgDoms = contentDiv.querySelectorAll("img");

                let configure = uploadTools.configure(_this.tokenInfo, {});
                let type = configure.type;
                for (let i = 0; i < imgDoms.length && imgDoms; i++) {
                    const src = imgDoms[i].src;
                    //获取图片地址
                    for (let index = 0; index < OUTER_NAMESPACE.length; index++) {
                        const element = OUTER_NAMESPACE[index];
                        if (element.test(src)) {
                            _this.fetchImageTo({ scene: _this.scene, url: src }, function (result) {
                                document.querySelector("img[src='" + src + "']").src = result;
                            }, function () {
                                console.error("本地化图片出错，图片地址：" + src);
                            })
                        }
                    }
                }
                //处理背景图
                let nodeList = contentDiv.querySelectorAll("section");
                for (let index = 0; index < nodeList.length; index++) {
                    const v = nodeList[index];
                    if (v.style.backgroundImage && v.style.backgroundImage.indexOf("url") !== -1) {
                        let imgUrl = v.style.backgroundImage.substring(5, v.style.backgroundImage.length - 2);
                        v.id = _this.el.substring(1) + "BG" + index;
                        try {
                            _this.fetchImageTo["fetchImageTo" + type]({ scene: _this.scene, url: imgUrl }, function (result) {
                                document.querySelector(_this.el + "BG" + index).style.backgroundImage = "url('" + result + "')";
                            }, function () {
                                console.error("本地化图片出错，图片地址：" + v.style.backgroundImage);
                            });
                        } catch (e) {
                            console.error(e)
                        }
                    }
                }
                return contentDiv.innerHTML;
            }
            editor.create();
            return editor;
        }
    }

}()