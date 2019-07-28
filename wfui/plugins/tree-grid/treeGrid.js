/**

 @Name：treeGrid树状表格
 @Author：lrd
 */
layui.define(['laytpl', 'laypage', 'dltable', 'layer', 'form'], function (exports) {
    "use strict";
    var dltable = layui.dltable;
    var MOD_NAME = 'treeGrid';
    var treeGrid = $.extend({}, dltable);
    treeGrid._render = treeGrid.render;
    treeGrid.render = function (param) {
        param.isTree = true;
        treeGrid._render(param);
    };
    exports(MOD_NAME, treeGrid);
});