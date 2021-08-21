!function () {
    layui.$.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                if (isNaN(this.value) || this.value.length > 9 || this.value.length === 0) {
                    o[this.name].push(this.value || '');
                } else {
                    if (this.value.indexOf(".") !== -1) {
                        o[this.name].push(parseFloat(this.value));
                    } else {
                        o[this.name].push(parseInt(this.value));
                    }
                }
            } else {
                if (isNaN(this.value) || this.value.length > 9 || this.value.length === 0) {
                    o[this.name] = this.value || '';
                } else {
                    if (this.value.indexOf(".") !== -1) {
                        o[this.name] = parseFloat(this.value);
                    } else {
                        o[this.name] = parseInt(this.value);
                    }
                }
            }
        });
        return o;
    };

    if (window.layui) {
        layui.define('jquery', function (exports) {
            exports('jquery-serialize-json', {});
        });
    }

}();

