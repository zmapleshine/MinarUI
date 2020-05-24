# WFUI
## 介绍

WFUI 是基于 Layui 二次封装的面向后端人员的前端构建框架，基本采用纯 js开发构建。
构建后的框架无需涉足前端构建相关的领域，开箱即用。

## 开发指南

### NodeJS管理

建议安装 nvm 来管理 NodeJS版本

Windows 平台下载地址：https://github.com/coreybutler/nvm-windows/releases
Mac 平台参考：https://www.jianshu.com/p/622ad36ee020

配置中国大陆地区镜像:
打开 nvm 安装目录，编辑 setting.txt，增加如下两行：

```
node_mirror: https://npm.taobao.org/mirrors/node/
npm_mirror: https://npm.taobao.org/mirrors/npm/
```
安装并使用 NodeJS 12.16.3

```shell script
nvm install 12.16.3
nvm use 12.16.3
```

### 开始构建
````shell script
npm install
npm install gulp -g
gulp build
````
最终会压缩编译js和css 到根目录dist文件夹下

### 调试
```
gulp run
```
或映射目录到 Nginx



