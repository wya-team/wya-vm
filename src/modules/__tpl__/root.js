
import Viewer from './viewer.vue';
import Editor from './editor.vue';

export const Tpl = {
	module: "tpl",
	type: '基础组件',
	name: "模版",
	Viewer,
	Editor, 
	// 初始数据
	data: {
		"name": "输入框内容",
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