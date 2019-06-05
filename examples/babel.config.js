const APP_ROOT = process.cwd();
const path = require('path');

module.exports = (api) => {
	// 编译缓存
	api.cache.forever();

	return {
		compact: false,
		presets: [
			"@babel/preset-env"
		],
		plugins: [
			"@babel/plugin-proposal-export-namespace-from",
			"@babel/plugin-proposal-export-default-from",
			"@babel/plugin-proposal-function-bind",
			"@babel/plugin-syntax-dynamic-import",
			"@babel/plugin-syntax-jsx",
			"transform-vue-jsx",
			[
				"@babel/plugin-proposal-decorators",
				{
					"legacy": true
				}
			],
			[
				"@babel/plugin-proposal-class-properties",
				{
					"loose": true
				}
			],
			[
				"import",
				{
					"libraryName": "@wya/vc",
					"libraryDirectory": "lib",
					"customName": (name) => {
						if (/^m-/.test(name)) {
							return `@wya/vc/lib/${name.replace(/^m-/, '')}/index.m`;
						}
						return `@wya/vc/lib/${name}`;
					}
				},
				"@wya/vc"
			]
		]
	};
};
