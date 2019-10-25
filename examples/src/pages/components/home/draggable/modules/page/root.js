
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
		// for draggable
		w: 2000,
		h: 2000,
		parent: false, // 不能超过父级
		// handles: [], // 可以控制操作handles
		draggable: false, // 可以拖拽
		rotatable: false, // 可以旋转
		resizable: false, // 可以变化
		// for frame
		closeable: false,
		active: false,
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