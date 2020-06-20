const APP_ROOT = process.cwd();
const path = require('path');

module.exports = (api) => {
	// 编译缓存
	api.cache.forever();

	return {
		presets: [
			// ["@babel/preset-env", { "modules": false }]
			["@babel/preset-env"]
		],
		plugins: [
			"@babel/plugin-proposal-export-namespace-from",
			"@babel/plugin-proposal-export-default-from",
			"@babel/plugin-proposal-function-bind",
			"@babel/plugin-syntax-dynamic-import",
			// node-resolve中modulesOnly为true, 否者会存在无用代码
			[
				"@babel/plugin-transform-runtime", {
					"corejs": false,
					"helpers": true,
					"regenerator": true,
					"useESModules": false
				}
			], 
			// "@babel/plugin-external-helpers",
			["@babel/plugin-proposal-decorators", { legacy: true }],
			["@babel/plugin-proposal-class-properties", { loose: true }],
			"transform-vue-jsx"
		]
	};
};
