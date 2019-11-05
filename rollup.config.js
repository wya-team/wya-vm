console.log(`NODE_ENV : ${process.env.NODE_ENV}`);
const ENV_IS_DEV = process.env.NODE_ENV === 'development';
// Rollup plugins
import babel from 'rollup-plugin-babel';
import buble from '@rollup/plugin-buble';
import replace from '@rollup/plugin-replace';

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import postcss from 'rollup-plugin-postcss';
import vue from 'rollup-plugin-vue';

// PostCSS plugins
import simplevars from 'postcss-simple-vars';
import nested from 'postcss-nested';
import preset from 'postcss-preset-env';
import cssnano from 'cssnano';

// import pkg from "./package.json";

const external = filename => {
	let regex = [
		'^vue$',
		'^lodash$',
		'^@babel/runtime',
		'^@wya/vc',
		// 用于测试用例?
		'^@wya/utils$',
		'^@wya/http$',
		'^@wya/ps$'
		// ...Object.keys(pkg.devDependencies || {}),
		// ...Object.keys(pkg.peerDependencies || {}),
		// ...Object.keys(pkg.dependencies || {})
	].join('|');

	return new RegExp(`(${regex})`).test(filename);
};


// 添加前缀和其他处理
const BASIC_POSTCSS_PLUGIN = [
	simplevars(),
	nested(),
	preset({
		warnForDuplicates: false,
	})
];

// import babelrc from 'babelrc-rollup';
const mainConfig = {
	// 输入
	input: 'src/index.js',
	// 输出
	output: {
		file: `${ENV_IS_DEV ? `examples/src/libs` : `dist`}/vm.min.js`,
		format: 'cjs',
		sourcemap: ENV_IS_DEV ? undefined : `inline`,
		globals: {
			vue: 'Vue'
		}
	},
	external, // 移除vue
	// 注意插件的先后循序
	
	plugins: [
		// 使用amd模块引入，第三方模块支持
		resolve({
			mainFields: ['module', 'jsnext:main', 'main'],
			modulesOnly: true,
			browser: true
		}),
		// 使用cjs模块引入
		commonjs({
			include: "node_modules/**"
		}),
		// 提花全局字段ENV为....
		replace({
			'__DEV__': 'false',
			'ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
		}),
		vue({
			css: true, // css in js
			style: {
				postcssPlugins: BASIC_POSTCSS_PLUGIN
			}
		}),
		// 使用postcss
		postcss({
			plugins: [
				...BASIC_POSTCSS_PLUGIN,
				cssnano() // 压缩，不能用于vue, 上面要求是async plugin
			],
			extensions: ['.css', '.scss'],
		}),
		// 使用babel，结合.babelrc
		babel({ 
			exclude: 'node_modules/**',
			runtimeHelpers: true
		}),
		// 使用buble
		buble(),
		// 是否压缩代码
		(!ENV_IS_DEV && uglify())
	]
};
export default [mainConfig];
