<template>
	<div 
		:style="style" 
		class="vm-sort-list"
		style="position: relative; overflow: auto" 
		@dragover.prevent="handleDragOver" 
		@dragend="handleDragEnd"
		@drop="handleDrop"
	>
		<transition-group tag="div" name="flip-list">
			<div v-for="(it, index) in dataSource" :key="it.id" class="vm-sort-list__item">
				<!-- TODO: 不操作引用修改 -->
				<vm-sortable
					ref="sort"
					:index="index"
					:type="dragType"
					@activated="$emit('activated', it, index)"
					@deactivated="$emit('deactivated', it, index)"
					@delete="$emit('change', { type: 'delete', id: it.id })"
					@sort="handleSort"
					@sort-end="handleSortEnd"
				>
					<component :is="`vm-${it.module}-viewer`" v-bind="it" />
				</vm-sortable>
			</div>
		</transition-group>
	</div>
</template>

<script>
import Sortable from '../../../core/sortable';
import { getUid, cloneDeep } from '../../../utils/helper';
import { SORT_IN_FRAME, WIDGET_TO_FRAME } from '../../constants';

export default {
	name: 'vm-frame',
	components: {
		'vm-sortable': Sortable,
	},
	props: {
		width: Number,
		height: Number,
		dataSource: Array,
		editor: Object
	},
	data() {
		return {
			dragType: SORT_IN_FRAME
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
		this.eleDrag = null;
	},
	methods: {
		handleDragOver(e) {
		},
		handleDragEnd(e) {
		},
		handleDrop(e) {
			let mod = e.dataTransfer.getData(WIDGET_TO_FRAME);
			let result = this.$parent.$options.modules[mod];
			// 不存在的模块
			if (!result) return;
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
		setActived(index) {
			this.$nextTick(() => {
				try {
					this.$refs.sort[index].setActived();
				} catch (e) {
					console.error(e);
				}
			});
		},

		/**
		 * 交换位置
		 */
		handleSort(v) {
			this.sortData(v);
		},


		handleSortEnd(v) {
			if (v[1] != v[2]) {
				this.$emit('change', {
					type: 'sort',
					sort: v
				});
			}
		},

		/**
		 * 外部使用
		 */
		
		sortData(v) {
			let current = this.dataSource[v[0]];
			let target = this.dataSource[v[1]];
			this.dataSource.splice(v[0], 1, target);
			this.dataSource.splice(v[1], 1, current);
		}
	},
};
</script>

<style lang="scss">
.vm-sort-list__item {
	transition: all .5s;
}
// 开始消失/进入的元素
.flip-list-enter, 
.flip-list-leave-to{
	opacity: 0;
}
.flip-list-leave-active {
	display: none;
}
</style>
