<template>
	<div class="vm-sort-list" @mousedown.stop="handleContainerDown">
		<div style="pointer-events: none;">
			<slot />
		</div>
		<!-- handle -->
		<div v-if="active" :class="{ disabled, active }" />
	</div>
</template>

<script>
import { isPassiveSupported, eleInRegExp } from '../utils/helper';
import Draggable from './draggable.vue';

const doc = document.documentElement;

export default {
	replace: true,
	name: 'vm-srot-list',
	props: {
		disabled: Draggable.props.disabled,
		editorRegExp: Draggable.props.editorRegExp,
		prevent: Draggable.props.prevent,
		preventRegExp: Draggable.props.preventRegExp,
	},
	data() {
		return {
			active: false
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
		 * 模拟设置active状态
		 */
		setActived() {
			this.handleContainerDown();
		},
		/**
		 * 组件被按下事件
		 */
		handleContainerDown(e = {}) {
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
				if (!this.active) {
					// 绑定事件
					this.operateDOMEvents('add');

					this.active = true;
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
			if (
				!this.$el.contains(target) 
				&& (!path.some(item => eleInRegExp(item, this.editorRegExp)))
			) {
				if (this.active) {
					// 解绑
					this.operateDOMEvents('remove');

					this.active = false;
					this.$emit('deactivated');
				}
			}
		}
	},
};
</script>

<style lang="scss" scoped>
.vm-sort-list {
	padding: 0;
	box-sizing: border-box;
	user-select: none;
	position: relative;
	&:hover {
		cursor: move;
	}
	.active {
		padding: 0;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		position: absolute;
		z-index: 2;
		border: 1px dotted #108ee9;
	}
}

</style>
