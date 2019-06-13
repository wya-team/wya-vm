
import Viewer from './viewer.vue';
import Editor from './editor.vue';

export const tpl = {
	module: "tpl",
	type: '基础组件',
	name: "单个模版",
	Viewer,
	Editor, 
	// 初始数据
	data: {
		// for sortable
		closeable: true,

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