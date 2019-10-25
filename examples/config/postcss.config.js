module.exports = {
	plugins: [
		require('postcss-import')({}),
		require('postcss-flexbugs-fixes')({}),
		require('precss')({}),
		require('cssnano')({
			preset: 'default',
		}),
		require('autoprefixer')({
			// 不删除老式写法
			remove: false
		})
	]
};
