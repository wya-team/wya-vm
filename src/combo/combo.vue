<template>
	<div
		:style="style"
		:class="classes"
		class="vm-combo"
	>
		<vm-widget
			v-if="showWidget"
			:style="widgetStyle"
			:content-style="widgetContentStyle"
			v-bind="widgetOpts"
			@change="handleWidgetChange"
		/>
		<div
			class="vm-frame__wrap"
			style="flex: 1; overflow: auto;"
		>
			<div
				:style="{
					width: `${showRuler ? Math.max(frameWrapWidth, (rebuildFrameStyle.width + 200) * scale) + 'px' : '100%'}`,
					height: `${showRuler ? Math.max(frameWrapHeight, (rebuildFrameStyle.height + 200) * scale) + 'px' : '100%'}`
				}"
				class="vm-frame__inner"
				@click="handleClick"
				@contextmenu.prevent
			>
				<div style="flex: 1; overflow: hidden;">
					<vm-ruler
						v-if="showRuler"
						:scale="scale"
						:scroll-left="scrollLeft"
						:scroll-top="scrollTop"
						:frame-width="rebuildFrameStyle.width"
						@change="handleLineChange"
					/>
				</div>
				<vm-frame
					ref="frame"
					:width="rebuildFrameStyle.width"
					:height="rebuildFrameStyle.height"
					:data-source="rebuildData"
					:editor="editor"
					:show-lines="showLines"
					:x-rule-lines="xRuleLines"
					:y-rule-lines="yRuleLines"
					:style="{
						...frameStyle,
						left: `${showRuler ? 20 : 0}px`,
						top: `${showRuler ? 40 : 0}px`,
						transform: `scale(${scale})`,
						'transform-origin': '0 0',
						'z-index': 0,
					}"
					:scale="scale"
					:scroll-left="scrollLeft"
					:scroll-top="scrollTop"
					v-bind="frameOpts"
					@activated="handleActivated"
					@deactivated="handleDeactivated"
					@change="handleChange"
					@error="$emit('error', arguments[0])"
				>
					<slot name="frame-header" />
					<slot name="frame-footer" />
				</vm-frame>
			</div>
			<slot name="frame-wrap-footer"/>
		</div>
		<!--  vue.sync遇到引用类型可跨层级修改，Object/Array. 如Object, 不要操作对象，把每个值解构出来v-bind.sync. -->
		<vm-editor
			v-if="showEditor && editor"
			:width ="editorW"
			:data-source="editor"
			@change="handleChange"
		/>
		<vm-assist-save
			v-if="showAssist"
			@save="handleOperate('save')"
			@preview="handleOperate('preview')"
		/>
		<vm-assist-operation
			v-if="showAssist"
			:current="current"
			:total="total"
			:is-edit="!!editor"
			@undo="handleOperate('undo')"
			@redo="handleOperate('redo')"
			@delete="handleOperate('delete')"
		/>
	</div>
</template>

<script>
import { Assist } from './assist';
import Ruler from './ruler';
import { cloneDeep, isEqualWith, hasClass, getUid } from '../utils/helper';
import './combo-defaut.scss';

export default {
	name: 'vm-combo',
	components: {
		// 会被注入vm-frame, vm-widget, vm-editor,
		'vm-assist-operation': Assist.Operation,
		'vm-assist-save': Assist.Save,
		'vm-ruler': Ruler
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
		frameW: Number, // 页面设置存在则该属性不生效
		frameH: Number, // 页面设置存在则该属性不生效
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
		 * editor
		 */
		editorW: Number,
		/**
		 * combo
		 */
		theme: {
			type: String,
			default: 'default'
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
			default: false
		},
		scale: {
			type: Number,
			default: 1
		}

	},
	data() {
		return {
			editor: null,
			/**
			 * vm-assist-operation
			 */
			current: 0,
			total: 0,
			protectedClasses: ['vm-frame__inner', 'vm-frame-draggable', 'vm-frame-sortable'], // 触发页面设置所需的顶级类名
			rebuildData: [],
			pageW: 0,
			pageH: 0,
			frameWrapWidth: 0,
			frameWrapHeight: 0,
			xRuleLines: [], // x轴辅助线
			yRuleLines: [], // y轴辅助线
			scrollLeft: 0, // frame左滚动距离
			scrollTop: 0, // frame上滚动距离
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
		},
		rebuildFrameStyle() {
			return {
				width: this.settingEditor ? this.pageW : (this.frameW || 800),
				height: this.settingEditor ? this.pageH : (this.frameH || 600)
			};
		},
		settingEditor() { // 页面设置editor
			let setting = this.$options.modules.page;
			if (!setting) {
				return null;
			}
			return this.rebuildData.find(item => item.module === 'page') || {
				...setting.data,
				module: setting.module,
				id: getUid()
			};
		}
	},
	watch: {
		dataSource: {
			deep: true,
			immediate: true,
			handler(v) {
				// 重新渲染frame的宽高
				let page = v.find(item => item.module === 'page');
				page && v.length && this.frameW !== page.w && (this.pageW = page.w);
				page && v.length && this.frameH !== page.h && (this.pageH = page.h);
				if (isEqualWith(v, this.rebuildData)) {
					return;
				}
				// todo, 是否重写
				this.rebuildData = this.makeRebuildData(this.dataSource);
				this.editor = this.rebuildData.find(item => item.module === 'page');
			}
		}
	},
	created() {
		this.historyData = [];
		if (!this.rebuildData.find(item => item.module === 'page') && this.settingEditor) {
			this.rebuildData.push(this.settingEditor);
		}
		this.editor = this.settingEditor;
		if (this.editor) {
			this.pageW = this.settingEditor.w;
			this.pageH = this.settingEditor.h;
		}
		this.$nextTick(() => {
			let dom = document.querySelector('.vm-frame__wrap');
			this.frameWrapWidth = dom.getBoundingClientRect().width;
			this.frameWrapHeight = dom.getBoundingClientRect().height;
			dom.addEventListener('scroll', this.handleFrameScroll);
		});
	},
	destroyed() {
		let dom = document.querySelector('.vm-frame__wrap');
		dom && dom.removeEventListener('scroll', this.handleFrameScroll);
		this.$options.previewManager.destroy();
	},
	methods: {
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

		/**
		 * draggable
		 */
		handleActivated(it) {
			this.editor = it;
		},

		handleDeactivated(e, it) {
			// this.editor = this.settingEditor;
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

			type === 'delete' && (this.rebuildData.splice(target.index, 1), this.editor = this.settingEditor);

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
		},

		handleClick(e) {
			if (this.isProtectArea(e)) {
				this.editor = this.settingEditor;
			}
		},

		/**
		 * 判断是否为组件外的有效操作区域
		 */
		isProtectArea(e) {
			let path = e.path || (e.composedPath && e.composedPath()) || [];
			return this.protectedClasses.some(item => hasClass(path[0], item));
		},

		handleLineChange(guide) {
			this.xRuleLines = guide.x;
			this.yRuleLines = guide.y;
		},

		handleFrameScroll(e) {
			this.scrollLeft = e.target.scrollLeft;
			this.scrollTop = e.target.scrollTop;
		}
	},
};
</script>
