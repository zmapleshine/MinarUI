!function () {

    var configure = function (response, outerParams) {
        if (!response || Object.getOwnPropertyNames(response).length === 0) {
            //local
            return {
                type:"local",
                headers: {
                    'Authorization': AppConfig.request.globalHeaders.Authorization(),
                },
                params: {
                    'scene': outerParams.scene
                }
            }
        }
        if (response["accessid"]) {
            return {
                type:"oss",
                params: {
                    'OSSAccessKeyId': response.accessid,
                    'policy': response.policy,
                    'Signature': response.signature,
                    'key': outerParams.key,
                    'success_action_status': '200',
                    'x-oss-object-acl': 'public-read',
                }
            }
        }
        if (response["uploadToken"]) {
            return {
                type:"qiniu",
                params:{
                    'key':outerParams.key
                }
            }
        }
        if (response["credentials"]) {
            return {
                type:"cos",
                params: {
                    'TmpSecretId': response.credentials.tmpSecretId,
                    'TmpSecretKey': response.credentials.tmpSecretKey,
                    'XCosSecurityToken': response.credentials.sessionToken,
                    'ExpiredTime': response.expiredTime,
                    'Bucket': response.bucket,
                    'Region': response.region,
                    'key': outerParams.key,
                }
            }
        }
    }

    var uploadTools = {
        configure: configure,

        /**
         * 校验图片转换后大小并上传
        */
        checkAndHandleUpload: function (file) {
            imgBase64(file, function (image, canvas) {
                var maxSize = 2 * 1024; // 2M
                var fileSize = file.size / 1024; // 图片大小

                if (fileSize > maxSize) { // 如果图片大小大于2m，进行压缩
                    console.log(maxSize, fileSize, maxSize / fileSize);
                    uploadSrc = canvas.toDataURL(file.type, maxSize / fileSize);
                    uploadFile = convertBase64UrlToFile(uploadSrc, file.name.split('.')[0]); // 转成file文件
                } else {
                    uploadSrc = image.src; //canvas.toDataURL(file.type,0.5);
                    uploadFile = file;
                }

                var compressedSize = uploadFile.size / 1024 / 1024;
                if (compressedSize.toFixed(2) > 2.00) {
                    checkAndHandleUpload(uploadFile);
                } else {
                    document.getElementById('previewImage').src = uploadSrc;
                }
            });
        },

        /**
         * 将图片转化为base64
         */
        imgBase64: function (file, callback) {
            var self = this;
            // 看支持不支持FileReader
            if (!file || !window.FileReader) return;
            // 创建一个 Image 对象
            var image = new Image();
            // 绑定 load 事件处理器，加载完成后执行
            image.onload = function () {
                // 获取 canvas DOM 对象
                var canvas = document.createElement('canvas')
                // 返回一个用于在画布上绘图的环境, '2d' 指定了您想要在画布上绘制的类型
                var ctx = canvas.getContext('2d')
                // 如果高度超标 // 参数，最大高度
                var MAX_HEIGHT = 3000;
                if (image.height > MAX_HEIGHT) {
                    // 宽度等比例缩放 *=
                    image.width *= MAX_HEIGHT / image.height;
                    image.height = MAX_HEIGHT;
                }
                // 获取 canvas的 2d 环境对象,
                // 可以理解Context是管理员，canvas是房子
                // canvas清屏
                console.log('canvas.width:', canvas.width);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // 重置canvas宽高
                canvas.width = image.width;
                canvas.height = image.height;
                // 将图像绘制到canvas上
                ctx.drawImage(image, 0, 0, image.width, image.height);
                // !!! 注意，image 没有加入到 dom之中
                console.log(file.type);
                // console.log(canvas.toDataURL('image/jpeg',0.5));
                //----------//
                callback(image, canvas);
                //--------//
            };
            if (/^image/.test(file.type)) {
                // 创建一个reader
                var reader = new FileReader();
                // 将图片将转成 base64 格式
                reader.readAsDataURL(file);
                // 读取成功后的回调
                reader.onload = function () {
                    // self.imgUrls.push(this.result);
                    // 设置src属性，浏览器会自动加载。
                    // 记住必须先绑定事件，才能设置src属性，否则会出同步问题。
                    image.src = this.result;
                }
            }
        }
    }

    if (window.layui) {
        layui.define("api", function (exports) {
            exports("uploadTools", uploadTools);
        });
    } else {
        window.uploadTools = uploadTools;
    }
}()
