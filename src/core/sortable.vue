<template>
	<div 
		:draggable="draggable && !disabled"
		class="vm-sortable" 
		@click="handleClick"
		@dragstart="handleDragStart"
		@dragenter="handleDragEnter"
		@dragleave="handleDragLeave"
		@dragover.prevent
		@dragend="handleDragEnd"
		@mouseenter="isHover = true"
		@mouseleave="isHover = false"
	>
		<div style="pointer-events: none;">
			<slot />
		</div>
		<!-- handle -->
		<div 
			v-if="isActive || isHover" 
			:class="{ 
				'is-disabled': disabled, 
				'is-active': true 
			}" 
			class="vm-sortable__handle"
		/>
		<p 
			v-if="closeable && (isActive || isHover)" 
			class="vm-sortable__delete" 
			@click="$emit('delete')"
		>✕</p>

		<p 
			v-if="showHighlight && highlight" 
			ref="highlight" 
			class="vm-sortable__highlight"
		>
			释放鼠标将模块添加到此处
		</p>
	</div>
</template>

<script>
import { isPassiveSupported, eleInRegExp } from '../utils/helper';
import Draggable from './draggable.vue';

const doc = document.documentElement;
let eleDrag = null;

export default {
	replace: true,
	name: 'vm-srot-list-item',
	props: {
		// 当前排序数组的索引值，非order
		index: {
			type: Number | String,
			required: true
		},
		// 用于getData/setData
		type: {
			type: String,
			default: '@wya/vm'
		},
		disabled: Draggable.props.disabled,
		editorRegExp: Draggable.props.editorRegExp,
		entryRegExp: Draggable.props.entryRegExp,
		prevent: Draggable.props.prevent,
		preventRegExp: Draggable.props.preventRegExp,
		closeable: Draggable.props.closeable,
		draggable: {
			type: Boolean,
			default: true
		},
		showHighlight: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			isActive: false,
			isHover: false,
			highlight: false
		};
	},
	computed: {
		
	},
	watch: {},
	beforeCreate() {
		// 组件捕获阶段执行
		this.eventOpts = !isPassiveSupported || { capture: true, passive: true };
	},
	mounted() {
		
	},
	destroyed() {
		this.operateDOMEvents('remove');
	},
	methods: {
		operateDOMEvents(type) {
			let fn = type === 'add' ? doc.addEventListener : doc.removeEventListener;

			fn('mousedown', this.handleDeselect, this.eventOpts);
		},
		/**
		 * 模拟设置Active状态
		 */
		setActived() {
			this.handleClick();
		},
		/**
		 * 组件被按下事件
		 */
		handleClick(e = {}) {
			// 去除默认事件 todo: 匹配输入框
			this.prevent
				&& e.preventDefault 
				&& !eleInRegExp(e.target, this.preventRegExp)
				&& e.preventDefault();

			// 判断是否支持拖动
			if (this.disabled) return;
			const target = e.target || e.srcElement;
			// 确保事件发生在组件内部
			if (!target || this.$el.contains(target)) {
				if (!this.isActive) {
					// 绑定事件
					this.operateDOMEvents('add');

					this.isActive = true;
					this.$emit('activated');
				}
			}
		},
		/**
		 * 取消选择事件
		 */
		handleDeselect(e) {
			const target = e.target || e.srcElement; // body不要带上class, 否则会存在问题

			let path = e.path || (e.composedPath && e.composedPath()) || [];

			// 非弹窗下
			let isInline = path.some(item => eleInRegExp(item, this.entryRegExp));

			if (
				isInline 
				&& !this.$el.contains(target) 
				&& (!path.some(item => eleInRegExp(item, this.editorRegExp)))
			) {
				if (this.isActive) {
					// 解绑
					this.operateDOMEvents('remove');

					this.isActive = false;
					this.$emit('deactivated');
				}
			}
		},

		/**
		* 拖拽开始
		*/
		handleDragStart(e) {
			// 定义拖动数据 - 拖到别的输入框展示的内容
			e.dataTransfer.setData(this.type, this.index);

			// 拖放效果
			e.dataTransfer.effectAllowed = "move";

			eleDrag = e.target;

			eleDrag.__START_INDEX__ = this.index;
			eleDrag.__END_INDEX__ = this.index;
			eleDrag.__DRAGGABLE__ = this.draggable;

			e.target.style.opacity = 0;
		},

		/**
		* 拖拽元素进入目标元素头上的时候
		*/
		handleDragEnter(e) {
			if (this.draggable && eleDrag && eleDrag.__DRAGGABLE__ && e.target != eleDrag) { // 排序
				if (this.index != eleDrag.__END_INDEX__) {
					if (this.timer) return;
					this.timer = setTimeout(() => {
						this.timer = null;
					}, 500);

					this.$emit('sorting', [eleDrag.__END_INDEX__, this.index]);
					eleDrag.__END_INDEX__ = this.index;
				}
			} else if (!eleDrag) { // 处理高亮
				this.highlight = true;
				this.$emit('highlight-change', true);
			}
		},

		/**
		 * 拖拽离开
		 */
		handleDragLeave(e) {
			if (this.$refs.highlight === e.fromElement) return;

			this.highlight = false;
			this.$emit('highlight-change', false);
		},

		/**
		* 拖拽结束
		*/
		handleDragEnd(e) {
			e.dataTransfer.clearData(this.type);

			e.target.style.opacity = 1;

			if (eleDrag) {
				this.$emit('sort-end', [eleDrag.__START_INDEX__, eleDrag.__END_INDEX__]);
			}

			eleDrag = null;
		}
	},
};
</script>

<style lang="scss">
.vm-sortable {
	padding: 0;
	box-sizing: border-box;
	user-select: none;
	position: relative;
	transition: opacity .5s; // 目的是让拖拽的那个元素保持不透明， 文档流里透明
	&:hover {
		cursor: move;
	}
	.vm-sortable__handle {
		&.is-active {
			padding: 0;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			position: absolute;
			z-index: 2;
			border: 1px dotted #5495F6;
			cursor: move;
		}
	}
	&.is-disabled {
		cursor: no-drop;
	}
}

.vm-sortable__delete {
	background: #5495F6; 
	position: absolute; 
	right: 0px; 
	width: 20px; 
	color: white; 
	text-align: center; 
	z-index: 300;
	top: 0;
	right: 0px;
	cursor: pointer;
}

.vm-sortable__highlight {
	height: 55px;
	background: #E7F4FF;
	color: #5495F6;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px dotted #5495F6;
}
 
</style>
