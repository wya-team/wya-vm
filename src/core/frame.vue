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
			:w.sync="it.w"
			:h.sync="it.h"
			:r.sync="it.r"
			:parent="false"
		>
			<component :is="`vm-${it.module}-viewer`" v-bind="it" />
		</vm-draggable>
	</div>
</template>

<script>
import Draggable from './draggable.vue';

export default {
	name: 'vm-frame',
	components: {
		'vm-draggable': Draggable,
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
			console.log(e.dataTransfer.getData('text'));
		}
	},
};
</script>

<style lang="scss" scoped>
</style>
