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

    var CascadeSelector = function (props) {

        this.el = props.el;
        this.type = props.type || "full";
        let container = document.querySelector(this.el);
        this.source = props.source || [];
        // this.selects = props.selects || [];


        // // this.firstValueProp = props.firstValueProp || "provinceId";
        // // this.firstDisplayProp = props.firstDisplayProp || "provinceId";
        // for (let index = 0; index < selects.length; index++) {
        //     const config = selects[index];
        //     let current = document.createElement("div");
        //     current.classList.add("layui-input-inline");
        //     current.id = this.el + "-select-" + index;
        //     let currentSelect = document.createElement("select");
        //     currentSelect.name = config.name;
        //     current.appendChild(currentSelect);
        //     utils.render.select(prov.id, this.source, config.displayName, config.valueName);
        // }

        // let prov = document.createElement("div");
        // prov.classList.add("layui-input-inline");
        // prov.id = this.el + "-prov";
        // let provSelect = document.createElement("select");
        // provSelect.name = this.firstProp || "provinceId";
        // prov.appendChild(provSelect);
        // utils.render.select(prov.id, this.source, this.firstProp, this.firstProp);

        // let city = document.createElement("div");
        // city.classList.add("layui-input-inline");
        // city.id = this.el + "-city";
        // let citySelect = document.createElement("select");
        // citySelect.name = this.secondProp || "cityId";
        // city.appendChild(citySelect);

        // let dist = document.createElement("div");
        // dist.classList.add("layui-input-inline");
        // dist.id = this.el + "-dist";
        // let distSelect = document.createElement("select");
        // distSelect.name = this.thirdProp || "districtId";
        // dist.appendChild(distSelect);

        // switch (this.type) {
        //     case "full":
        //         container.appendChild(prov);
        //         container.appendChild(city);
        //         container.appendChild(dist);
        //         break;
        //     case "city":
        //         container.appendChild(prov);
        //         container.appendChild(city);
        //         break;
        //     case "prov":
        //         container.appendChild(prov);
        //     default: break;
        // }

        layui.form.render("select");

    }

    var cascadeSelector = function () {
        return {
            render: function (props) {
                return new CascadeSelector(props);
            },
            val: function (initValObject) {

            }
        }
    }

    return cascadeSelector();

}, {
        name: "cascadeSelector",
        dependencies: ['form', 'utils']
    });