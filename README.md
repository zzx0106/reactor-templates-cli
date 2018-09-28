# Reactor

------------

## 简介 ##
Reactor is a CLI for React.js projects

Reactor是一个款基于React的脚手架

#### 开始使用
1. 下载脚手架
```javascript
npm i reactor-templates-cli -g
```
2. 使用脚手架
```javascript
reactor init
```
根据说明生成模板文件

#### 现有模板文件
**reactor-saga** 一款功能齐全的模板 [模板详解](https://github.com/zzx0106/reactor-saga-template)
1. 优化了webpack配置，兼容es6 7以及自动给css添加兼容语法，内置可以使用sass预编译器。
2. 配置了hot编译，可以无刷新的显示修改的页面。
3. 集成了react、react-router、redux、redux-saga、immutable等插件。
4. 内置了 路由懒加载、异步组件。‘
5. 自带简单demo，可供用户参考使用。
6. 打包过程可见，能动态分析文件压缩效率，以及压缩过程中可能出现的问题。

// next todo

**reactor-dva**  基于redux-dva的reactor模板
1. 优化了webpack配置，兼容es6 7以及自动给css添加兼容语法，内置可以使用sass预编译器。
2. 配置了hot编译，可以无刷新的显示修改的页面。
3. 集成了react、react-router、redux、dva、dva-loading、immutable等插件。
4. 内置了 路由懒加载、异步组件。‘
5. 自带简单demo，可供用户参考使用。
6. 打包过程可见，能动态分析文件压缩效率，以及压缩过程中可能出现的问题。

#### 添加模板
1. in package.json
```javascript
{
	"templates": [
		'reactor-saga',
		'reactor-dva',
		'other-template'
	]
}
```
2 in zips file

```javascript
添加新的模板zip包即可，注：包名与package.json中的模板名需一致
```
