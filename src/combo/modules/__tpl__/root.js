
import Viewer from './viewer.vue';
import Editor from './editor.vue';

export const tpl = {
	module: "tpl",
	type: '基础组件',
	name: "模版",
	Viewer,
	Editor, 
	// 初始数据
	data: {
		// for draggable
		w: 100,
		h: 100,
		r: 0,
		x: 0, // 动态分配
		y: 0, // 动态分配
		z: 1,
		parent: false,
		// for content
		name: '名称'
	},
	dataValidity: (res = {}) => {
		if (!res.name) {
			return {
				error: "输入框内容必填"
			};
		}
		return null;
	}
};