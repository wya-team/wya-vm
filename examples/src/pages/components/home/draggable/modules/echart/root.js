import Viewer from './viewer.vue';
import Editor from './editor.vue';

export const echart = {
	module: "echart",
	type: '基础',
	name: "图表",
	widgets: [
		// 写法一
		{
			render(h, props) {
				return (
					<div>图表一</div>
				);
			}
		},
		// 写法二
		{
			name: '图表二',
		}
	],
	Viewer,
	Editor, 
	// 初始数据
	data: {
		// for draggable
		w: 200,
		h: 150,
		r: 0,
		x: 0, // 动态分配
		y: 0, // 动态分配
		z: 1,
		parent: true, // 不能超过父级
		// handles: [], // 可以控制操作handles
		draggable: true, // 可以拖拽
		rotatable: true, // 可以旋转
		resizable: true, // 可以变化
		// for frame
		closeable: true,
		active: false,
		
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