<template>
	<div
		:draggable="draggable"
		@dragstart="draggable && handleStart($event)"
	>
		<slot />
	</div>
</template>

<script>
import { WIDGET_TO_FRAME } from '../utils/constants';

export default {
	name: 'vm-widget',
	props: {
		draggable: {
			type: Boolean,
			default: true
		},
		/**
		 * 模块名
		 */
		module: {
			type: String,
			required: true
		},

		/**
		 * data函数时使用
		 */
		index: {
			type: Boolean,
			default: true
		}
	},
	methods: {
		handleStart(e) {
			e.dataTransfer.setData(
				WIDGET_TO_FRAME, 
				JSON.stringify({
					module: this.module,
					index: this.index
				})
			);
		},
	},
};
</script>
