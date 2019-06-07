<template>
	<div 
		:style="style" 
		class="vm-frame-sortable"
		@dragover.prevent="handleDragOver" 
		@dragend="handleDragEnd"
		@drop="handleDrop"
	>
		<transition-group tag="div" name="flip-list">
			<div v-for="(it, index) in dataSource" :key="it.id" class="vm-frame-sortable__item">
				<!-- TODO: 不操作引用修改 -->
				<vm-sortable
					ref="sort"
					:index="index"
					:type="dragType"
					:clearable="it.clearable"
					@activated="$emit('activated', it, index)"
					@deactivated="$emit('deactivated', it, index)"
					@delete="$emit('change', { type: 'delete', id: it.id })"
					@highlight-change="handleHighlightChange(arguments[0], index)"
					@sort="handleSort"
					@sort-end="handleSortEnd"
				>
					<component 
						:is="`vm-${it.module}-viewer`" 
						v-bind="it" 
						style="min-height: 3px"
					/>
				</vm-sortable>
			</div>
		</transition-group>
	</div>
</template>

<script>
import Sortable from '../../../core/sortable.vue';
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
		handleHighlightChange(status, index) {
			// console.log(status, index);
		},
		handleDragOver(e) {
		},
		handleDragEnd(e) {
		},
		handleDrop(e) {
			let rowIndex = this.dataSource.length;
			/**
			 * 清理高亮, 设置插入位置
			 */
			if (this.$refs.sort) {
				this.$refs.sort.forEach((instance, index) => {
					if (instance.highlight === true) {
						rowIndex = index + 1;
						instance.highlight = false;
					}
				});
			}

			let { module, index } = JSON.parse(e.dataTransfer.getData(WIDGET_TO_FRAME)) || {};
			let result = this.$parent.$options.modules[module];
			// 不存在的模块
			if (!result) return;

			if (result.max && result.max <= this.dataSource.filter(i => i.module === module).length) {
				this.$emit('error', {
					type: 'create',
					msg: `当前模块最多只能创建${result.max}个`
				});
				return;
			}
			
			let id = getUid();

			let data = {
				...cloneDeep(
					typeof result.data === 'function' 
						? result.data(index) 
						: result.data
				),
				module,
				id,
			};

			// 会同步到上级 这里不用this.$emit("update:sync")
			this.dataSource.splice(rowIndex, 0, data);

			this.$emit('change', { 
				type: 'create', 
				index: rowIndex,
				id
			});

			// 新元素处于激活状态
			this.setActived(rowIndex);
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
.vm-frame-sortable__item {
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