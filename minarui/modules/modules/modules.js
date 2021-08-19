!function () {
    var definition = function (callback) {

        var xhr = new XMLHttpRequest();
        var appModules = {};

        const contextPath = AppConfig.route.contextPath || '';

        function configureModules(modules, prefix) {
            for (let i = 0; i < Object.getOwnPropertyNames(modules).length; i++) {
                const name = Object.getOwnPropertyNames(modules)[i];
                const moduleRelativePath = modules[name];
                appModules[name] = (typeof prefix === "function" ? prefix(moduleRelativePath) : (prefix || "")) + moduleRelativePath;
            }
        }

        xhr.open('GET', contextPath + '/minarui/modules/modules/modules.json', true);
        xhr.send(null);
        xhr.onload = function (e) {
            if (this.status === 200 || this.status === 304) {
                let definedModules = JSON.parse(this.responseText);
                let baseModulePath = "/minarui/modules/";
                configureModules(definedModules.modules, path => path.indexOf("/") !== -1 ? "{/}" + contextPath + baseModulePath : "");
                configureModules(definedModules.plugin, "{/}" + contextPath + "/minarui/plugins/");
                configureModules(AppConfig.modules, "{/}" + contextPath);
                layui.config({base: contextPath + baseModulePath}).extend(appModules);
                callback && callback();
            }
        };
    }
    window.MinarUIModulesDefinition = definition;
}()