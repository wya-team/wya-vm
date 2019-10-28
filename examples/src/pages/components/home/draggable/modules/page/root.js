
import Editor from './editor.vue';

export const page = {
	module: "page",
	Viewer: {
		inheritAttrs: false,
		render(h, props) {
			// 测试修改其他模块失焦时（非同步修改），是否作用到page上
			return (
				<span>{ this.$attrs.name }</span>
			);
		}
	},
	Editor, 
	// 初始数据
	data: {
		// for draggable
		w: window.screen.width,
		h: window.screen.height,
		parent: false, // 不能超过父级
		// handles: [], // 可以控制操作handles
		draggable: false, // 可以拖拽
		rotatable: false, // 可以旋转
		resizable: false, // 可以变化
		// for frame
		closeable: false,
		active: false,
		name: ''
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