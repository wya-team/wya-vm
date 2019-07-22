import Viewer from './viewer.vue';

export const paint = {
	module: "paint",
	type: '基础组件',
	name: "图片热区",
	Viewer,
	Editor: null,
	max: 10, // 最多存放元素
	insertion: '', // first/last/none 插入方式
	// 初始数据 data 或者 data 都可以
	data() {
		return {
			x: 0,
			y: 0,
			w: 100,
			h: 100,
			r: 0,
			z: 1,
			rotatable: false,
			active: true,
			parent: true,
			route: '',
			name: '',
			p_id: '',
			type: 1 // 1 页面选择  2 自定义
		};
	},
	widgets: null,
	dataValidity: (res = {}) => {
		return null;
	}
};
