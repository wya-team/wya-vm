
import Editor from './editor.vue';

export const page = {
	module: "page",
	Viewer: {
		render(h) {
			return null;
		}
	},
	Editor, 
	// 初始数据
	data: {
		bg: 'red'
	},
	dataValidity: (res = {}) => {
		if (!res.w && !res.h) {
			return {
				error: "输入框内容必填"
			};
		}
		return null;
	}
};