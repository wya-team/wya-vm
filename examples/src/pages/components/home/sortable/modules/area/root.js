import Viewer from './viewer.vue';
import Editor from './editor.vue';

export const area = {
	module: "area",
	type: '基础组件',
	name: "图片热区",
	Viewer,
	Editor,
	max: '', // 最多存放元素
	insertion: '', // first/last/none 插入方式
	// 初始数据 data 或者 data 都可以
	data: {
		closeable: true,
		src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2P48OP/fwAJqgPnYfITggAAAABJRU5ErkJggg==',
		list: []
		// for content
	},
	dataValidity: (res = {}) => {
		if (!res.src) {
			return {
				error: "请上传图片"
			};
		}
		return null;
	}
};
