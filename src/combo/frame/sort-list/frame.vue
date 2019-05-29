<template>
	<div 
		:style="style" 
		style="position: relative; overflow: auto" 
		@dragover.prevent="handleDragOver" 
		@dragend="handleDragEnd"
		@drop="handleDrop"
	>
		<vm-sort-item
			v-for="it in dataSource"
			ref="sort"
			:key="it.id"
			:disabled="it.disabled"
			@activated="$emit('activated', it)"
			@deactivated="$emit('deactivated', it)"
		>
			<component :is="`vm-${it.module}-viewer`" v-bind="it" />
		</vm-sort-item>
	</div>
</template>

<script>
import SortItem from '../../../core/sort-item.vue';
import { getUid, cloneDeep } from '../../../utils/helper';

export default {
	name: 'vm-frame',
	components: {
		'vm-sort-item': SortItem,
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
			console.log(e);
			let mod = e.dataTransfer.getData('vm-modules');
			let result = this.$parent.$options.modules[mod];
			// 不存在的模块
			if (!result) return;

			// let { x, y } = this.$el.getBoundingClientRect();

			// let mouseX = e.pageX || e.clientX + doc.scrollLeft;
			// let mouseY = e.pageY || e.clientY + doc.scrollTop;

			/**
			 * TODO: 动态插入，暂时只做到插入到第一个
			 */
			let id = getUid();
			let index = this.dataSource.length;
			// // 会同步到上级 这里不用this.$emit("update:sync")
			this.dataSource.push({
				...cloneDeep(result.data),
				module: mod,
				id,
			});

			this.$emit('change', { 
				type: 'create', 
				index,
				id
			});

			// 新元素处于激活状态
			this.setActived(index);
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
					this.$refs.sort[index].setActived();
				} catch (e) {
					console.error(e);
				}
			});
		}
	},
};
</script>

<style lang="scss" scoped>
</style>
