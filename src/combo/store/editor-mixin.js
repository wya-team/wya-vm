import { PAGE_MOULE } from '../../utils/constants';

export default {
	data() {
		return {
			states: {
				// TODO: 多个Editor和变操作（数组）
				currentEditor: null,
				pageEditor: null,

				// 页面设置组件
				frameW: 0,
				frameH: 0
			}
		};
	},
	watch: {
		// 可以使用computed
		'states.pageEditor': {
			deep: true,
			immediate: true,
			handler(v) {
				v && v.w && (this.states.frameW = v.w);
				v && v.h && (this.states.frameH = v.h);
			}
		}
	},
	methods: {
		/**
		 * 组件要具有唯一性，否者会异常
		 * page组件
		 */
		updatePageEditor(source) {
			if (!source.length) return {};

			for (let i = 0; i < source.length; i++) {
				let item = source[i];
				if (item.module === PAGE_MOULE) {
					this.states.pageEditor = item;
					break;
				}
			}
		},

		/**
		 * @param {[String|Object]} editor 当前编辑的对象/id
		 */
		resetCurrentEditor(editor) {
			this.states.currentEditor = editor
				|| this.states.pageEditor 
				|| null;
		},

		/**
		 * 更新Editor
		 */
		updateCurrentEditor() {
			let { data = [], currentEditor } = this.states;
			let oldCurrentEditor = currentEditor;
			let newEditor;

			if (currentEditor) {
				newEditor = data.find(i => i.id === currentEditor.id);
			}

			this.states.currentEditor = newEditor
				|| this.states.pageEditor 
				|| null;
		}
	}
};