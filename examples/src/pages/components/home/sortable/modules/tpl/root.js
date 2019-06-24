import Viewer from './viewer.vue';
import Editor from './editor.vue';

let count = 0;
export const tpl = {
	module: "tpl",
	type: '基础组件',
	name: "单个模版",
	Viewer,
	Editor, 
	// 初始数据
	data() {
		return {
			// for sortable
			closeable: true,

			name: `名称_${count++}`,
		};
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