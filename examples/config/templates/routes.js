const { resolve } = require('path');
const fs = require('fs-extra');

const hasOther = (module) => {
	let fullpath = resolve(__dirname, `../../src/pages/containers/${module}/app.js`);

	return (fs.existsSync(fullpath) ? fs.readFileSync(fullpath, 'utf-8') : '').includes('OtherConfig');
};

const h2c = (value) => {
	return value
		.split('-')
		.map((item, index) => {
			return index > 0 
				? `${item[0].toUpperCase()}${item.slice(1)}` 
				: item;
		})
		.join('');
};

const routes = (opts = {}) => {
	const { modules } = opts;
	let contents = '';
	contents += `import Vue from 'vue';\n`;
	contents += `import { PRE_ROUTER_URL } from '../constants/constants';\n`;
	modules.forEach((item) => {
		let _item = h2c(item === '__tpl__' ? 'tpl' : item);
		hasOther(_item) 
			? contents += `import { ${_item}Config, ${_item}OtherConfig } from '../containers/${item}/app';\n`
			: contents += `import { ${_item}Config } from '../containers/${item}/app';\n`;
	});
	contents += `\n`;
	contents += `export const dynamicRoutes = {\n`;
	modules.forEach((item) => {
		let _item = h2c(item === '__tpl__' ? 'tpl' : item);
		hasOther(_item) 
			? contents += `	${_item}: [...${_item}Config, ...${_item}OtherConfig],\n`
			: contents += `	${_item}: ${_item}Config,\n`;
	});
	contents += `};`;
	contents += `\n`;
	contents += `export const basicRoutes = {\n`;
	contents += `	base: PRE_ROUTER_URL,\n`;
	contents += `	mode: 'history',\n`;
	contents += `	routes: [\n`;
	modules.forEach((item) => {
		let _item = h2c(item === '__tpl__' ? 'tpl' : item);
		hasOther(_item) && (contents += `		...(${_item}OtherConfig || {}),\n`);
	});
	contents += `		{\n`;
	contents += `			path: '*',\n`;
	contents += `			redirect: (to) => {\n`;
	contents += `				return '/home';\n`;
	contents += `			}\n`;
	contents += `		}\n`;
	contents += `	]\n`;
	contents += `};\n`;
	return contents;
};
module.exports = {
	routes
};



