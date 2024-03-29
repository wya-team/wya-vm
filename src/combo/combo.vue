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
			:frame-padding="framePadding" 
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
			@sort-end="$emit('sort-end', arguments[0], arguments[1])"
			@error="$emit('error', arguments[0])"
		>
			<template #frame-header>
				<slot name="frame-header" />
			</template>
			<template #frame-footer>
				<slot name="frame-footer" />
			</template>
		</vm-frame>
		<!-- v-show主要用于没有页面设置 -->
		<vm-editor 
			v-if="showEditor"
			:value="editor"
			:style="editorStyle"
			:width="editorW"
			:height="editorH"
			v-bind="editorOpts"
			@change="handleChange"
		/>
	</div>
</template>

<script>
import { Store, mapStates } from './store';
import { Assist } from './assist';
import { cloneDeep, isEqualWith, getUid, Logger } from '../utils/helper';
import { PAGE_MOULE, SELECTION_MODULE } from '../utils/constants';
import './theme-dark.scss';

export default {
	name: 'vm-combo',
	provide() {
		return {
			getVM: () => this,
			getData: () => this.dataSource
		};
	},
	components: {
		// 会被注入vm-frame, vm-widget, vm-editor,
	},
	mixins: Assist.mixins(['keyboard']),
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
		framePadding: [Object, Array, Number],
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
		// beforeCreate中无法获取props的值，created中会导致watch中immediate无效;
		this.store = new Store(this, {
			frameW: this.frameW,
			frameH: this.frameH,
		});
		return {};
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
		},

		...mapStates({
			rebuildData: 'data',
			rebuildFrameW: 'frameW',
			rebuildFrameH: 'frameH',
			current: 'currentSnapshot',
			total: 'totalSnapshot',
			editor: 'currentEditor',
			pageEditor: 'pageEditor',
		})
	},
	watch: {
		dataSource: {
			deep: true,
			immediate: true,
			handler(v) {
				this.store.commit('INIT', v);
			}
		}
	},
	created() {
		this.VMComboId = getUid('combo');
		this.clipboardData = null;
		
		// 处理历史暴露的API映射
		this.create = this.add;
		this.delete = this.remove;
	},
	destroyed() {
		this.$options.previewManager.destroy();
	},
	methods: {
		syncData() {
			this.$emit('change', this.rebuildData);
			this.$emit('update:data-source', this.rebuildData);
		},

		/**
		 * draggable
		 */
		handleActivated(e, it) {
			this.store.resetCurrentEditor(it);
		},

		handleDeactivated(e, it) {
			this.store.resetCurrentEditor();
		},

		/**
		 * 用户处理widget出来的数据
		 * TODO: 支持记忆片段
		 */
		handleWidgetChange(module, ...rest) {
			this.$emit('widget-change', module, ...rest);
		},

		/**
		 * 数据变化
		 */
		handleChange({ type, ...payload }) {
			const { id, original, changed, revert } = payload; 
			switch (type) {
				case 'CREATE':
				case 'UPDATE': // eslint-disable-line
				case 'DELETE':
					if (!id) {
						throw new Error('[wya-vm/combo]: id 必传');
					}
					break;
				case 'SORT':
					if (!original && !changed) {
						throw new Error('[wya-vm/combo]: original/changed 必传');
					}
					break;
				case 'DUMMY':
					if (typeof revert === 'undefined') {
						throw new Error('[wya-vm/combo]: revert 不能为undefined');
					}
					break;
				default:
					break;
			}

			this.store.commit(type, payload);
			this.syncData();
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
			this.syncData();
		},

		/**
		 * 删除
		 * it: id | data, 可传id或者data
		 * force: 默认是当前编辑的删除，除非强制删除id
		 */
		remove(it, force = false) {
			let isObj = typeof it === 'object';
			let id = (isObj ? it.id : it) || (this.editor || {}).id;
			if (!id || (!force && this.editor.module === PAGE_MOULE)) {
				this.$emit('error', { 
					type: 'id', 
					msg: "请先选择操作对象" 
				});
				return;
			}
			it = isObj 
				? it
				: this.rebuildData.findIndex(i => i.id === id);

			this.store.commit('DELETE', { 
				id,
				revert: it.selections && it.selections.length
			});

			if (it.module === SELECTION_MODULE) {
				it.selections.forEach(($id) => {
					this.store.commit('DELETE', { 
						id: $id,
						revert: it.selections && it.selections.length,
					});
				});
			}

			this.syncData();
		},

		/**
		 * 剪切一份
		 */
		cut() {
			if (
				!this.editor 
				|| this.editor.module === PAGE_MOULE 
				|| this.editor.module === SELECTION_MODULE
			) {
				return;
			} 

			// 粘帖数据缓存
			this.clipboardData = {
				type: 'CUT',
				data: cloneDeep(this.editor),
				selections: this.editor.module === SELECTION_MODULE 
					? cloneDeep(this.rebuildData.filter(i => this.editor.selections.includes(i.id)))
					: []
			};

			// 删除剪切数据
			const revert = this.clipboardData.selections.length;
			this.store.commit('DELETE', { 
				id: this.editor.id,
				revert
			});
			this.clipboardData.selections.forEach((id) => {
				this.store.commit('DELETE', { 
					id,
					revert
				});
			});

			this.syncData();
		},

		/**
		 * 复制一份
		 */
		copy(it) {
			if (
				!it && (
					!this.editor 
					|| this.editor.module === PAGE_MOULE 
				)
			) {
				return;
			} 

			it = it || this.editor;
			this.clipboardData = {
				type: 'COPY',
				data: cloneDeep(it),
				selections: this.editor.module === SELECTION_MODULE 
					? cloneDeep(this.rebuildData.filter(i => it.selections.includes(i.id)))
					: []
			};
		},

		/**
		 * 粘帖一份
		 * 这里兼容了组合，其中包含x,y的偏移值
		 */
		paste(override = {}) {
			if (!this.clipboardData) return;
			let { type, data, selections = [] } = this.clipboardData;
			const rowIndex = this.rebuildData.length;
			const revert = selections.length;
			const id = getUid();

			let changed = cloneDeep(data);
			changed.x && (changed.x += 10);
			changed.y && (changed.y += 10);
			Object.keys(override).forEach(key => (changed[key] = override[key]));

			changed.id = id;
			if (changed.module === SELECTION_MODULE) {
				selections = selections.map(i => {
					i.id = getUid();
					return i;
				});
				changed.selections = selections.map(i => i.id);

				const diffX = changed.x - data.x;
				const diffY = changed.y - data.y;

				selections.forEach((it, index) => {
					this.store.commit('CREATE', { 
						index: rowIndex + index,
						id: it.id,
						revert,
						data: {
							...it,
							x: it.x + diffX,
							y: it.y + diffY
						}
					});
				});
			}

			this.store.commit('CREATE', {
				index: rowIndex + revert,
				id,
				data: changed,
				revert
			});
			this.syncData();

			// 激活
			this.$refs.frame.setActivedById(id);
		},

		/**
		 * 撤回
		 */
		undo() {
			let current = this.current - 1;
			if (current < 0) {
				this.$emit('error', { 
					type: 'undo', 
					msg: "目前已经是初始状态" 
				});
				return;
			}

			// 需要连续回滚
			let { revert } = this.store.historyData[current] || {};

			this.store.commit('UNDO', { current });

			if (revert) {
				Array.from({ length: revert }).forEach(() => {
					this.store.commit('UNDO', { current: this.current - 1 });
				});
			}

			Logger.debug(`current: ${this.current}, total: ${this.total}`);
			this.syncData();
		},

		/**
		 * 取消撤回
		 */
		redo() {
			let current = this.current + 1;
			if (current > this.total) {
				this.$emit('error', { 
					type: 'undo', 
					msg: "目前已经是最终状态" 
				});
				return;
			}

			// 需要连续回滚
			let { revert } = this.store.historyData[current] || {};

			this.store.commit('REDO', { current });
			if (revert) {
				Array.from({ length: revert }).forEach(() => {
					this.store.commit('REDO', { current: this.current + 1 });
				});
			}

			Logger.debug(`current: ${this.current}, total: ${this.total}`);
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
						let msg = error.msg || error.message || error.error || error; // 兼容验证器使用
						this.$emit('error', { 
							type: 'save', 
							msg: `第${i + 1}个 - ${msg}`, 
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

		getImage(opts = {}) {
			return new Promise((resolve, reject) => {
				this.$options.previewManager.popup({
					dataSource: cloneDeep(this.rebuildData),
					styles: {
						...this.frameStyle,
						width: this.rebuildFrameW === 0 ? 'auto' : `${this.rebuildFrameW}px`,
						height: this.rebuildFrameH === 0 ? 'auto' : `${this.rebuildFrameH}px`
					},
					className: 'vm-combo__frame',

					expect: 'image',
					imageOpts: opts,
					onSure: resolve,
					onClose: reject,
				});
			});
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
				styles: {
					...this.frameStyle,
					width: this.rebuildFrameW === 0 ? 'auto' : `${this.rebuildFrameW}px`,
					height: this.rebuildFrameH === 0 ? 'auto' : `${this.rebuildFrameH}px`
				},
				className: 'vm-combo__frame'
			});

			return true;
		},

		download() {
			const content = JSON.stringify(this.dataSource, null, '\t');
			const blob = new Blob([content], {
				type: 'application/json;charset=UTF-8'
			});

			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.textContent = 'download json';
			link.href = url;
			link.download = 'data'; // moment().format('YYYY-MM-DD')
			link.click();

			URL.revokeObjectURL(url);
		},

		upload() {
			const input = document.createElement('input');
			input.type = 'file';
			// 限定文件类型
			input.accept = '.json';
			input.click();

			input.onchange = () => {
				const file = input.files[0];

				// FileReader实例
				const reader = new FileReader();
				reader.readAsText(file, 'UTF-8');
				reader.onload = e => {
					try {
						let v = JSON.parse(e.target.result);
						this.store.commit('INIT', v);
					} catch (e) {
						console.log(e);
					}
				};
			};
		}
	},
};
</script>

<style lang="scss">
@import "../style/index.scss";

.vm-combo {
	display: flex;
}
</style>
