/**
 * 强化项目的读写能力
 */
const { resolve } = require('path');
const { prompt, Separator } = require('inquirer');
const { exec } = require('shelljs');
const fs = require('fs-extra');

const { routes } = require('./templates/routes');

const directory = resolve(__dirname, '../src/pages/containers/');
const targetModules = [];
fs.readdirSync(directory).forEach((file) => {

	const fullpath = resolve(directory, file);
	// 获取文件信息
	const stat = fs.statSync(fullpath);
	if (!['login'].includes(file) 
		&& stat.isDirectory()
	) {
		targetModules.push(file);
	}

});
const question = [
	{
		type: 'confirm',
		name: 'install',
		message: 'npm install?',
		default: false
	},
	{
		type: 'input',
		name: 'port',
		message: 'port:',
		default: '8082',
		choices(answers) {
			if (answers.install) {
				let done = this.async();
				exec('npm install', { silent: true }, (code, stdout, stderr) => {
					console.log('Exit code:', code);
					console.log('Program output:', stdout);
					console.log('Program stderr:', stderr);

					if (code === 0) {
						done(null, true);
					}

				});
			}
		}
	},
	{
		type: 'list',
		name: 'isSelectAll',
		message: 'Select all modules:',
		choices: [targetModules.join(','), 'no']
	},
	{
		type: 'checkbox',
		name: 'modules',
		when: (answers) => answers.isSelectAll === 'no',
		message: 'Select modules:',
		pageSize: targetModules.length + 1,
		choices: targetModules,
		validate(answer) {
			if (answer.length < 1) {
				return '至少选择一个模块, 使用Space键选中';
			}
			return true;
		}
	}
];
prompt(question).then((result = {}) => {
	let { isSelectAll, modules, ...rest } = result;

	modules = isSelectAll === 'no' ? modules : targetModules;

	let contents = '';
	const strObj = JSON.stringify(rest || {});

	// 输出
	contents = `const obj = ${strObj};module.exports = obj;`;
	fs.outputFileSync('./config/user.config.js', contents);
	fs.outputFileSync('./src/pages/routers/routes.dev.js', routes({ modules }));

}).catch((res) => {
	console.log(res);
});
