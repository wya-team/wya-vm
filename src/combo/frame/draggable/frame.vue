<template>
	<div 
		:style="style" 
		class="vm-frame-draggable"
		style="position: relative;" 
		@dragover.prevent="handleDragOver" 
		@dragend="handleDragEnd"
		@drop="handleDrop"
	>
		<vm-grid-lines :width="width" :height="height" :grid="[10, 10]" />
		<vm-align-lines :data-source="dataSource" :editor="editor"/>
		<!-- TODO: 不操作引用修改 -->
		<vm-draggable
			v-for="(it, index) in dataSource"
			ref="draggable"
			:key="it.id"
			:x.sync="it.x"
			:y.sync="it.y"
			:z.sync="it.z"
			:w.sync="it.w"
			:h.sync="it.h"
			:r.sync="it.r"
			:parent="it.parent"
			:disabled="it.disabled"
			:handles="it.handles"
			:minw="it.minw"
			:minh="it.minh"
			:zoom="it.zoom"
			:grid="it.grid"
			:restrain="it.restrain"
			@activated="$emit('activated', it)"
			@deactivated="$emit('deactivated', it)"
			@dragging="$emit('dragging', it)"
			@resizing="$emit('resizing', it)"
			@rotating="$emit('rotating', it)"
			@resize-end="$emit('resize-end', it)"
			@drag-end="$emit('drag-end', it)"
			@delete="$emit('change', { type: 'delete', id: it.id })"
			@end="handleEnd(arguments[0], it.id, index)"
		>
			<component :is="`vm-${it.module}-viewer`" v-bind="it" />
		</vm-draggable>
	</div>
</template>

<script>
import Draggable from '../../../core/draggable.vue';
import GridLines from './grid-lines.vue';
import AlignLines from './align-lines.vue';
import { getUid, cloneDeep } from '../../../utils/helper';
import { WIDGET_TO_FRAME } from '../../constants';

export default {
	name: 'vm-frame',
	components: {
		'vm-draggable': Draggable,
		'vm-grid-lines': GridLines,
		'vm-align-lines': AlignLines,
	},
	props: {
		width: Number,
		height: Number,
		dataSource: Array,
		editor: Object
	},
	data() {
		return {
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
		handleDragOver(e) {
		},
		handleDragEnd(e) {
			console.log(e);
		},
		handleDrop(e) {
			let { module, index } = JSON.parse(e.dataTransfer.getData(WIDGET_TO_FRAME)) || {};
			let result = this.$parent.$options.modules[module];
			// 不存在的模块
			if (!result) return;

			let { x, y } = this.$el.getBoundingClientRect();

			let mouseX = e.pageX || e.clientX + doc.scrollLeft;
			let mouseY = e.pageY || e.clientY + doc.scrollTop;

			let id = getUid();
			let rowIndex = this.dataSource.length;

			let data = {
				...cloneDeep(
					typeof result.data === 'function' 
						? result.data(index) 
						: result.data
				),
				module,
				id,
				x: mouseX - x,
				y: mouseY - y
			};

			// 会同步到上级 这里不用this.$emit("update:sync")
			this.dataSource.push(data);

			this.$emit('change', { 
				type: 'create', 
				index: rowIndex,
				id
			});

			// 新元素处于激活状态
			this.setActived(rowIndex);
		},
		handleEnd(old, id, index) {
			this.$emit('change', { 
				type: 'update', 
				id, 
				index,
				old
			});
		},
		setActived(index) {
			this.$nextTick(() => {
				try {
					this.$refs.draggable[index].setActived();
				} catch (e) {
					console.error(e);
				}
			});
		}
	},
};
</script>