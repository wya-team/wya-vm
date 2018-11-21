/**
 * 强化项目的读写能力
 */
const { prompt, Separator } = require('inquirer');
const fs = require('fs-extra');

const question = [
	{
		type: 'input',
		name: 'port',
		message: 'port:',
		default: '8082'
	}
];

prompt(question).then((result = {}) => {
	let contents = '';
	
	const strObj = JSON.stringify(result || {});

	// 输出
	contents = `const obj = ${strObj};module.exports = obj;`;
	fs.outputFileSync('./config/user.config.js', contents);

}).catch((res) => {
	console.log(res);
});
