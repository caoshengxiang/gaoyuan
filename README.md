# 环境依赖

### node
去官网下载安装node6.5.0版，windows版会附带npm。这是一个包管理工具，我们会用它来安装下面提到的其它依赖工具

### yarn

```
npm install yarn -g
```
没有npm的话可以直接去[这里](https://yarnpkg.com/en/docs/install)下载yarn安装包

### MongoDB

* 配置mongo环境变量，如：MONGODB:C:\Program Files\MongoDB\Server\3.2\bin

### WebStorm的vue语法支持插件

支持*.vue文件中的html、js、css语法高亮和提示。  
在File --> Settings --> Plugins --> 底部Browse repositories 中搜索Vue.js并安装

### LiveReload

在编辑资源文件后自动刷新浏览器。
[安装地址](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei/related?hl=zh-CN)
打开网页后，要点一下浏览器上的小图标，中间的圆点为实心表示正在运行

### vue-devtools

可以在控制台查看vue实例的状态的调试工具。
[安装地址](https://chrome.google.com/webstore/detail/nhdogjmejiglipccpnnnanhbledajbpd)
如果控制台不显示，需要检查以下配置
* 网页使用vue.js而不是vue.min.js
* 关闭控制台再重新打开

----

# 常用命令
## 1.开发环境启动项目
```
yarn
yarn run gulp
node server/app.js
```

----

## 2.发布到测试环境
一键发布：最好先把自己的修改提交了，否则会和自动提交的内容混在一起
```
gulp publish-develop
```

----

## 3.发布到正式环境
一键发布：最好先把自己的修改提交了，否则会和自动提交的内容混在一起
```
gulp publish-master
登录服务器，进入项目目录
运行update.sh
```

----

## 4.线上环境启动命令
```
yarn install --production --unsafe-perm
yarn run start或yarn run start-dev
```

----
