<template>
	<div :style="style" :class="classes" class="vm-combo">
		<vm-tools-widget 
			:style="toolsStyle" 
			v-bind="toolsOpts"
		>
			<!-- TODO -->
			<slot name="widget-default" />
		</vm-tools-widget>
		<vm-frame 
			ref="frame"
			:style="frameStyle" 
			:width="frameW" 
			:height="frameH" 
			:data-source="rebuildData" 
			:editor="editor" 
			v-bind="frameOpts"
			@activated="handleActivated"
			@deactivated="handleDeactivated"
			@change="handleChange"
		>
			<!-- TODO -->
			<slot name="frame-default" />
		</vm-frame>
		<!--  vue.sync遇到引用类型可跨层级修改，Object/Array. 如Object, 不要操作对象，把每个值解构出来v-bind.sync. -->
		<vm-editor 
			v-if="editor" 
			:data-source="editor"
			@change="handleChange"
		>
			<!-- TODO -->
			<slot name="editor-default" />
		</vm-editor>
		<slot>
			<vm-tools-save
				@save="handleOperate('save')"
				@preview="handleOperate('preview')"
			/>
			<vm-tools-operation
				:current="current"
				:total="total"
				:is-edit="!!editor"
				@undo="handleOperate('undo')"
				@redo="handleOperate('redo')"
				@delete="handleOperate('delete')"
			/>
		</slot>
	</div>
</template>

<script>
import ToolsOperation from './tools/operation.vue';
import ToolsSave from './tools/save.vue';
import { cloneDeep, isEqualWith } from '../utils/helper';
import './combo-defaut.scss';

export default {
	name: 'vm-combo',
	components: {
		// 会被注入vm-frame, vm-tools-widget, vm-editor,
		'vm-tools-operation': ToolsOperation,
		'vm-tools-save': ToolsSave,
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
		 * tools
		 */
		toolsStyle: Object,
		toolsW: Number,
		toolsH: Number,
		toolsOpts: Object,

		/**
		 * combo
		 */
		theme: {
			type: String,
			default: 'default'
		}
	},
	data() {
		return {
			editor: null,
			/**
			 * vm-tools-operation
			 */
			current: 0,
			total: 0,

			rebuildData: []
		};
	},
	computed: {
		style() {
			const w = this.width === 0 ? 'auto' : `${this.width}px`;
			const h = this.height === 0 ? 'auto' : `${this.height}px`;

			return {
				width: w,
				height: h
			};
		},
		classes() {
			return {
				[`vm-combo__theme--${this.theme}`]: !!this.theme
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
				this.rebuildData = cloneDeep(this.dataSource);
			}
		}
	},
	created() {
		this.historyData = [];
	},
	destroyed() {
		this.$options.previewManager.hide();
	},
	methods: {
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
		},
		/**
		 * draggable
		 */
		handleActivated(it) {
			this.editor = it;
		},
		handleDeactivated(it) {
			this.editor = null;
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
			
			type === 'delete' && (this.rebuildData.splice(target.index, 1), this.editor = null);

			this.syncData();
		},
		/**
		 * tools-operation
		 */
		handleOperate(type, ...rest) {
			this[type] && this[type](...rest);
		},
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
				this.editor = this.rebuildData[index];
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
				this.editor = this.rebuildData[index];
			}

			this.syncData();
		},
		/**
		 * tools-save
		 */
		save() {
			const data = cloneDeep(this.rebuildData) || [];

			if (data.length === 0) {
				this.$emit('error', { 
					type: 'save', 
					msg: `保存对象不能为空` 
				});
				return;
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
						return;
					}
				}
			}
			/**
			 * 数据验证
			 */
			this.$emit('save', data);
		},
		preview() {
			if (this.rebuildData.length === 0) {
				this.$emit('error', { 
					type: 'preview', 
					msg: `预览数据对象不能为空` 
				});
				return;
			}
			this.$options.previewManager.show({
				dataSource: cloneDeep(this.rebuildData),
				style: {
					...this.frameStyle,
					width: this.frameW === 0 ? 'auto' : `${this.frameW}px`,
					height: this.frameH === 0 ? 'auto' : `${this.frameH}px`
				},
				className: 'vm-combo__frame'
			});
		}
	},
};
</script>
