<template>
	<div :style="style" class="vm-combo">
		<vm-tools-widget 
			:style="toolsStyle" 
			v-bind="toolsOpts"
			class="__tools"
		/>
		<vm-tools-operation
			:current-step="currentStep"
			:last-step="lastStep"
			@undo="handleUndo"
			@redo="handleRedo"
		/>
		<vm-frame 
			:style="frameStyle" 
			:width="frameW" 
			:height="frameH" 
			:data-source="dataSource" 
			v-bind="frameOpts"
			class="__frame"
			@activated="handleActivated"
			@deactivated="handleDeactivated"
			@change="handleChange"
		/>
		<!-- 
			vue.sync遇到引用类型可跨层级修改，Object/Array. 
			如Object, 不要操作对象，把每个值解构出来v-bind.sync.
		-->
		<vm-editor v-if="editor" :data-source="editor" />
	</div>
</template>

<script>
import ToolsOperation from './tools/operation.vue';
import { cloneDeep } from '../utils/helper';

export default {
	name: 'vm-combo',
	components: {
		// 会被注入vm-frame, vm-tools-widget, vm-editor,
		'vm-tools-operation': ToolsOperation
	},
	props: {
		width: Number,
		height: Number,
		type: {
			type: String,
			default: 'free' // sort-list
		},
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
		toolsOpts: Object
	},
	data() {
		return {
			editor: null,
			dragging: false,
			resizing: false,
			/**
			 * vm-tools-operation
			 */
			currentStep: 0,
			lastStep: 0,
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
		this.historyData = [];
	},
	methods: {
		/**
		 * draggable
		 */
		handleActivated(it) {
			this.editor = it;
		},
		handleDeactivated(it) {
			// this.editor = null;
		},
		/**
		 * 数据变化
		 */
		handleChange({ type, id, index, old }) {
			const { currentStep, lastStep } = this;
			
			const target = {
				type,
				id,
				index,
				old,
				data: cloneDeep(this.dataSource.find(item => item.id === id)),
			};

			currentStep === lastStep 
				? this.historyData.push(target)
				: this.historyData.splice(currentStep, lastStep - currentStep, target);

			let { length } = this.historyData;
			this.currentStep = length;
			this.lastStep = length;
		},
		/**
		 * tools-operation
		 */
		handleUndo() {
			this.currentStep -= 1;
			let { type, id, data, index, old } = this.historyData[this.currentStep] || {};
			// splice 操作了props的数据，待优化
			switch (type) {
				case 'create':
					this.dataSource.splice(index, 1);
					break;
				case 'delete':
					this.dataSource.splice(index, 0, data);
					break;
				case 'update':	
					this.dataSource.splice(index, 1, cloneDeep({ ...data, ...old }));
					break;
				default:
					break;
					
			}
		},
		handleRedo() {
			this.currentStep += 1;

			let { type, id, data, index } = this.historyData[this.currentStep - 1];
			// splice 操作了props的数据，待优化
			switch (type) {
				case 'create':
					this.dataSource.splice(index, 1, data);
					break;
				case 'delete':
					this.dataSource.splice(index, 1);
					break;
				case 'update':	
					this.dataSource.splice(index, 1, data);
					break;
				default:
					break;
					
			}
		}
	},
};
</script>

<style lang="scss" scoped>
</style>
