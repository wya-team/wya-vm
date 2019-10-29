<template>
	<div :style="style" :class="classes" class="vm-combo">
		<vm-widget 
			v-if="showWidget"
			:style="widgetStyle" 
			:content-style="widgetContentStyle" 
			:theme="theme"
			v-bind="widgetOpts"
			@change="handleWidgetChange"
		/>
		<vm-frame 
			ref="frame"
			:frame-style="frameStyle" 
			:width="rebuildFrameW" 
			:height="rebuildFrameH" 
			:data-source="rebuildData" 
			:editor="editor" 
			:show-lines="showLines"
			:show-ruler="showRuler"
			:show-zoom-bar="showZoomBar"
			:show-thumbnail="showThumbnail"
			:theme="theme"
			v-bind="frameOpts"
			@activated="handleActivated"
			@deactivated="handleDeactivated"
			@change="handleChange"
			@error="$emit('error', arguments[0])"
		>
			<slot name="frame-header" />
			<slot name="frame-footer" />
		</vm-frame>
		<!--  vue.sync遇到引用类型可跨层级修改，Object/Array. 如Object, 不要操作对象，把每个值解构出来v-bind.sync. -->
		<vm-editor 
			v-if="showEditor && editor"
			:value="editor"
			:data-source="rebuildData"
			:theme="theme"
			:style="editorStyle"
			:width="editorW"
			:height="editorH"
			v-bind="editorOpts"
			@change="handleChange"
		/>
	</div>
</template>

<script>
import { Assist } from './assist';
import { cloneDeep, isEqualWith } from '../utils/helper';
import { PAGE_MOULE } from '../utils/constants';
import './theme-dark.scss';

export default {
	name: 'vm-combo',
	components: {
		// 会被注入vm-frame, vm-widget, vm-editor,
		'vm-assist-operation': Assist.Operation,
		'vm-assist-save': Assist.Save,
	},
	model: {
		prop: 'data-source',
		event: 'change'
	},
	props: {
		width: Number,
		height: Number,
		dataSource: {
			type: Array,
			default: () => ([])
		},
		/**
		 * frame
		 */
		frameStyle: Object,
		frameW: Number,
		frameH: Number,
		frameOpts: Object,
		/**
		 * widget
		 */
		widgetStyle: Object,
		widgetContentStyle: Object,
		widgetW: Number,
		widgetH: Number,
		widgetOpts: Object,

		/**
		 * widget
		 */
		editorStyle: Object,
		editorW: Number,
		editorH: Number,
		editorOpts: Object,

		/**
		 * combo
		 */
		theme: {
			type: String,
			default: 'default' // default / light / dark
		},
		showAssist: {
			type: Boolean,
			default: false
		},
		showWidget: {
			type: Boolean,
			default: true
		},
		showEditor: {
			type: Boolean,
			default: true
		},
		showLines: {
			type: Boolean,
			default: true
		},
		showRuler: {
			type: Boolean,
			default: true
		},
		showZoomBar: {
			type: Boolean,
			default: true
		},
		showThumbnail: {
			type: Boolean,
			default: true
		},
	},
	data() {
		return {
			editor: null,
			pageEditor: null,
			/**
			 * vm-assist-operation
			 */
			current: 0,
			total: 0,

			rebuildData: [],

			rebuildFrameW: 0,
			rebuildFrameH: 0
		};
	},
	computed: {
		style() {
			const w = !this.width ? 'auto' : `${this.width}px`;
			const h = !this.height ? 'auto' : `${this.height}px`;

			return {
				width: w,
				height: h
			};
		},

		classes() {
			return {
				'vm-combo__theme--dark': this.theme === 'dark'
			};
		}
	},
	watch: {
		dataSource: {
			deep: true,
			immediate: true,
			handler(v) {

				if (isEqualWith(v, this.rebuildData)) {
					return;
				}

				// todo, 是否重写
				this.rebuildData = this.makeRebuildData(this.dataSource);

				// 特殊组件， 如页面设置, 设置PageEditor
				this.rebuildSpecialComp(this.rebuildData);

				// 初始化编辑状态
				this.resetEditor(this.editor);
			}
		},
		pageEditor: {
			deep: true,
			immediate: true,
			handler(v) {
				this.rebuildFrameW = v && v.w ? v.w : this.frameW;
				this.rebuildFrameH = v && v.h ? v.h : this.frameH;
			}
		}
	},
	created() {
		this.historyData = [];
	},
	destroyed() {
		this.$options.previewManager.destroy();
	},
	methods: {
		/**
		 *  组件要具有唯一性，否者会异常
		 * page组件处理（页面设置）,
		 * 其他
		 */
		rebuildSpecialComp(source) {
			if (!source.length) return {};
			let kv = {};

			source.forEach(item => {
				// page组件
				item.module === PAGE_MOULE && (this.pageEditor = item);
				kv[item.module] = item;
			});

			return kv;
		},

		makeRebuildData(source) {
			let { modules } = this.$options;
			let result = cloneDeep(source).map((it) => {
				let { data = {}, rebuilder = {} } = modules[it.module] || {};

				typeof data === 'function' && (data = data());
				typeof rebuilder === 'function' && (rebuilder = rebuilder());

				// TODO: 深度遍历，目前仅一层
				Object.keys(it).forEach(key => {
					if (!rebuilder[key]) return;
					if (it[key] instanceof Array) {
						it[key] = it[key].map((children) => {
							return {
								...rebuilder[key],
								...children
							};
						});
					} else if (it[key] instanceof Object) {
						it[key] = {
							...rebuilder[key],
							...it[key]
						};
					}
				});

				return {
					...data,
					...it
				};
			});
			return result;
		},
		/**
		 * 目前只支持以下几种数据
		 * current, total
		 */
		sync(opts) {	
			for (let key in opts) {
				if (this[key] != opts[key]) {
					this.$emit(`update:${key}`, opts[key]);
				}
			}
		},

		syncData() {
			this.$emit('change', this.rebuildData);
			this.$emit('update:data-source', this.rebuildData);
		},

		resetEditor(it) {
			this.editor = it || this.pageEditor || null;
		},
		/**
		 * draggable
		 */
		handleActivated(it) {
			this.editor = it;
		},

		handleDeactivated(e, it) {
			// console.log(e, it);
			// console.log('deactivated', this.editor.module, this.editor.id);
			this.editor = this.pageEditor || null;
		},

		/**
		 * 用户处理widget出来的数据, 暂时做不到记忆
		 * TODO: 可能被废弃
		 */
		handleWidgetChange(module, ...rest) {
			this.$emit('widget-change', module, ...rest);
		},

		/**
		 * 数据变化
		 */
		handleChange({ type, id, index, old, sort }) {
			if (!type || (!sort && !id)) {
				console.error('[wya-vm/combo]: id, type is required');
			}
			const { current, total } = this;
			const target = {
				type,
				id,
				old,
				sort,
				index: id && typeof index === 'undefined' 
					? this.rebuildData.findIndex(item => item.id === id) 
					: index,
				data: cloneDeep(this.rebuildData.find(item => item.id === id)),
			};

			// 继续插入，还是以当前停留位置插入
			current === total 
				? this.historyData.push(target)
				: this.historyData.splice(current, total - current, target);

			let { length } = this.historyData;
			this.current = length;
			this.total = length;
			
			type === 'delete' && (
				this.rebuildData.splice(target.index, 1), 
				this.resetEditor()
			);

			this.syncData();
		},

		/**
		 * widget-operation
		 */
		handleOperate(type, ...rest) {
			this[type] && this[type](...rest);
		},

		/**
		 * 模拟添加
		 */
		add(module, index) {
			this.$refs.frame.handleDrop({
				fake: true,
				dataTransfer: {
					getData: () => {
						return JSON.stringify({
							module,
							index
						});
					}
				}
			}, true);
		},

		/**
		 * 删除
		 */
		delete(id) {
			id = id || (this.editor || {}).id;
			if (!id) {
				this.$emit('error', { 
					type: 'id', 
					msg: "请先选择操作对象" 
				});
				return;
			}
			this.handleChange({ type: 'delete', id });
		},

		undo() {
			let current = this.current - 1;
			if (current < 0) {
				this.$emit('error', { 
					type: 'undo', 
					msg: "目前已经是初始状态" 
				});
				return;
			}

			this.current = current;

			let { type, id, data, index, old, sort } = this.historyData[this.current] || {};
			switch (type) {
				case 'create':
					this.rebuildData.splice(index, 1);
					break;
				case 'delete':
					this.rebuildData.splice(index, 0, data);
					break;
				case 'update':	
					this.rebuildData.splice(index, 1, cloneDeep({ ...data, ...old }));
					break;
				case 'sort':	
					this.$refs.frame.sortData(sort);
					break;
				default:
					break;
			}
			if (this.editor && this.editor.id === id) {
				this.resetEditor(this.rebuildData[index]);
			}

			this.syncData();
		},

		redo() {
			let current = this.current + 1;
			if (current > this.total) {
				this.$emit('error', { 
					type: 'undo', 
					msg: "目前已经是最终状态" 
				});
				return;
			}

			this.current = current;

			let { type, id, data, index, sort } = this.historyData[this.current - 1];
			switch (type) {
				case 'create':
					this.rebuildData.splice(index, 1, data);
					break;
				case 'delete':
					this.rebuildData.splice(index, 1);
					break;
				case 'update':	
					this.rebuildData.splice(index, 1, data);
					break;
				case 'sort':	
					this.$refs.frame.sortData(sort);
					break;
				default:
					break;
			}
			if (this.editor && this.editor.id === id) {
				this.resetEditor(this.rebuildData[index]);
			}

			this.syncData();
		},

		/**
		 * widget-save
		 */
		save() {
			const data = cloneDeep(this.rebuildData) || [];

			if (data.length === 0) {
				this.$emit('error', { 
					type: 'save', 
					msg: `保存对象不能为空` 
				});
				return false;
			}
			const { modules } = this.$options;
			for (let i = 0; i < data.length; i++) {
				let { module: mod } = data[i];
				if (modules[mod].dataValidity) {
					let error = modules[mod].dataValidity(data[i]);
					if (error) {
						this.$emit('error', { 
							type: 'save', 
							msg: `第${i + 1}个 - ${error.error}`, 
							index: i 
						});
						// 错误元素激活
						this.$refs.frame.setActived(i);
						return false;
					}
				}
			}
			/**
			 * 数据验证
			 */
			this.$emit('save', data);
			return true;
		},

		preview() {
			if (this.rebuildData.length === 0) {
				this.$emit('error', { 
					type: 'preview', 
					msg: `预览数据对象不能为空` 
				});
				return false;
			}
			this.$options.previewManager.popup({
				dataSource: cloneDeep(this.rebuildData),
				style: {
					...this.frameStyle,
					width: this.frameW === 0 ? 'auto' : `${this.frameW}px`,
					height: this.frameH === 0 ? 'auto' : `${this.frameH}px`
				},
				className: 'vm-combo__frame'
			});

			return true;
		}
	},
};
</script>

<style lang="scss">
.vm-combo {
	display: flex;
}
</style>
