/**
 * 强化项目的读写能力
 */
const { resolve } = require('path');
const { prompt, Separator } = require('inquirer');
const { exec } = require('shelljs');
const fs = require('fs-extra');

const question = [
	{
		type: 'input',
		name: 'port',
		message: 'port:',
		default: '8086'
	}
];
prompt(question).then((result = {}) => {
	let { ...rest } = result;

	let contents = '';
	const strObj = JSON.stringify(rest || {});

	// 输出
	contents = `const obj = ${strObj};module.exports = obj;`;
	fs.outputFileSync('./config/user.config.js', contents);

}).catch((res) => {
	console.log(res);
});
