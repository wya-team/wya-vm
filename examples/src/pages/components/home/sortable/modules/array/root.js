
import Viewer from './viewer.vue';
import Editor from './editor.vue';

export const array = {
	module: "array",
	type: '营销组件',
	name: "数组模版",
	widgets: [
		// 写法一
		{
			render(h, props) {
				return (
					<div>一行两列</div>
				);
			}
		},
		// 写法二
		{
			name: '一行两列',
			image: 'https://avatars3.githubusercontent.com/u/34465004?s=200&v=4',
		}
	],
	Viewer,
	Editor, 
	max: 5,
	// 初始数据
	data: (index) => ({
		// for sortable
		clearable: true,
		
		name: `名称${index}`
	}),
	dataValidity: (res = {}) => {
		if (!res.name) {
			return {
				error: "输入框内容必填"
			};
		}
		return null;
	}
};