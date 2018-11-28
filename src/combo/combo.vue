<template>
	<div :style="style" class="vm-combo">
		<vm-tools 
			:style="toolsStyle" 
			v-bind="toolsOpts"
			class="__tools"
		/>
		<!-- vue.sync遇到引用类型可跨层级修改，Object/Array 下面是指data-scource -->
		<vm-frame 
			:style="frameStyle" 
			:width="frameW" 
			:height="frameH" 
			:data-source="dataSource" 
			v-bind="frameOpts"
			class="__frame"
			@activated="handleActivated"
			@deactivated="handleDeactivated"
		/>
		<!-- vue.sync遇到引用类型可跨层级修改，Object/Array 下面是指data-scource -->
		<vm-editor v-if="editor" :data-source="editor"/>
	</div>
</template>

<script>

export default {
	name: 'vm-combo',
	components: {
		// 会被注入vm-frame, vm-tools, vm-editor
	},
	props: {
		width: Number,
		height: Number,
		type: {
			type: String,
			default: 'free' // sort-list
		},
		dataSource: Array,
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
		toolsOpts: Object
	},
	data() {
		return {
			// 编辑的栏目
			editor: null,
			// 是否处于拖拽状态
			dragging: false,
			// 是否处于resizing
			resizing: false
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
		}
	},
	created() {
	},
	methods: {
		handleActivated(it) {
			this.editor = it;
		},
		handleDeactivated(it) {
			// this.editor = null;
		}
	},
};
</script>

<style lang="scss" scoped>
</style>
