<template>
	<div 
		:style="style" 
		style="position: relative;" 
		@dragover.prevent="handleDragOver" 
		@dragend="handleDragEnd"
		@drop="handleDrop"
	>
		<vm-draggable
			v-for="(it) in dataSource"
			:key="it.id"
			:x.sync="it.x"
			:y.sync="it.y"
			:z.sync="it.z"
			:w.sync="it.w"
			:h.sync="it.h"
			:r.sync="it.r"
			:parent="it.parent"
			:disable="it.disable"
			:draggable="it.draggable"
			:resizable="it.resizable"
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
			@resizestop="$emit('resizestop', it)"
			@dragstop="$emit('dragstop', it)"
		>
			<component :is="`vm-${it.module}-viewer`" v-bind="it" />
		</vm-draggable>
	</div>
</template>

<script>
import Draggable from '../../core/draggable.vue';
import { getUid } from '../../utils/helper';

export default {
	name: 'vm-frame',
	components: {
		'vm-draggable': Draggable
	},
	props: {
		width: Number,
		height: Number,
		type: {
			type: String,
			default: 'free' // sort-list
		},
		dataSource: Array
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
			let mod = e.dataTransfer.getData('vm-modules');
			let result = this.$options.modules[mod];
			// 不存在的模块
			if (!result) return;

			let { x, y } = this.$el.getBoundingClientRect();

			let mouseX = e.pageX || e.clientX + doc.scrollLeft;
			let mouseY = e.pageY || e.clientY + doc.scrollTop;

			const { dataSource } = this;

			dataSource.push({
				...result.data,
				module: mod,
				id: getUid(),
				x: mouseX - x,
				y: mouseY - y
			});
			// this.$emit('update:dataSource', dataSource);
		}
	},
};
</script>

<style lang="scss" scoped>
</style>
