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
		src: 'https://oss.ruishan666.com/image/xcx/180313/942996157518/10053669,2880,1800.jpg',
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
