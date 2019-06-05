# vue-env
微一案Vue脚手架

## 下载

```shell
npm install wya-toolkit -g 
wya init

# 或者
git clone **
```

## 数据模拟

```
npm install json-server -g 
npm run mock
```
## 快速开发

> 创建业务所需模版，包括基本的，分页/选项卡, 表单

```shell
npm install @wya/toolkit -g 
wya add
```


## Babel6 -> Babel7

- 根据提示修改内容
- `import { xxx } from 'wya'`, 其中`xxx`必须存在
- `CreatePortal`中不使用`module.exports.default`

## TODO

- `webpack.config.common.js` PWA
- `webpack.config.server.js` SSR
