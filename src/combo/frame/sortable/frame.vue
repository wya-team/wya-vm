<template>
	<vm-inner :has-page="hasPage" class="vm-frame-sortable">
		<template #content>
			<div 
				:style="[style, frameStyle]" 
				class="vm-frame-sortable__wrapper"
				@dragover.prevent
				@dragenter="handleDragEnter"
				@dragleave="handleDragLeave"
				@drop="handleDrop"
			>
				<transition-group tag="div" name="flip-list">
					<div v-for="(it, index) in dataSource" :key="it.id" class="vm-frame-sortable__item">
						<!-- TODO: 不操作引用修改 -->
						<div :style="it.wrapperStyle">
							<vm-sortable
								ref="sort"
								:index="index"
								:type="dragType"
								:disabled="it.disabled"
								:draggable="it.draggable || typeof it.draggable === 'undefined'"
								:closeable="it.closeable || typeof it.closeable === 'undefined'"
								@activated="$emit('activated', it, index)"
								@deactivated="$emit('deactivated', it, index)"
								@delete="$emit('change', { type: 'delete', id: it.id })"
								@sorting="handleSorting"
								@sort-end="handleSortEnd"
							>
								<component 
									:is="`vm-${it.module}-viewer`" 
									:index="index"
									:vm="vm"
									v-bind="it" 
									style="min-height: 3px"
								/>
							</vm-sortable>
						</div>
						<div v-if="it.placeholder" :style="{height: `${it.placeholder}px`}"/>
					</div>
				</transition-group>
			</div>
		</template>
	</vm-inner>
	
</template>

<script>
import Inner from './inner.vue';
import Sortable from '../../../base/sortable.vue';
import { getUid, cloneDeep } from '../../../utils/helper';
import { SORT_IN_FRAME, WIDGET_TO_FRAME, PAGE_MOULE } from '../../../utils/constants';

export default {
	name: 'vm-frame',
	components: {
		'vm-sortable': Sortable,
		'vm-inner': Inner,
	},
	props: {
		width: Number,
		height: Number,
		dataSource: Array,
		editor: Object,
		frameStyle: Object,
	},
	data() {
		return {
			dragType: SORT_IN_FRAME,
			dragWaiting: false,
			vm: {
				type: 'frame'
			}
		};
	},
	computed: {
		style() {
			const w = !this.width ? 'auto' : `${this.width}px`;
			const h = !this.height ? 'auto' : `${this.height}px`;
			return {
				width: w,
				height: h
			};
		},
		hasPage() {
			return this.dataSource.some(i => i.module === PAGE_MOULE);
		}
	},
	created() {
		this.timer = null;
	},
	beforeDestory() {
		clearTimeout(this.timer);
	},
	methods: {
		/**
		 * TODO：
		 * 1. dragWaiting等待时，默认插入到最后一个
		 * 2. 区分是widget还是内部排序
		 */
		handleDragEnter(e) {
			this.timer = setTimeout(() => {
				this.dragWaiting = !this.$refs.sort || this.$refs.sort.every(i => i.highlight === false);
			}, 300);
		},
		handleDragLeave(e) {
			clearTimeout(this.timer);
			this.dragWaiting = false;
		},
		handleDrop(e) {
			clearTimeout(this.timer);
			this.dragWaiting = false;

			let rowIndex = this.dataSource.length;
			/**
			 * 清理高亮, 设置插入位置
			 */
			if (this.$refs.sort) {
				this.$refs.sort.forEach((instance, index) => {
					if (instance.highlight === true) {
						rowIndex = instance.index + 1;
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
						? result.data(index, this.dataSource) 
						: result.data
				),
				module,
				id,
			};

			// 只能插入到第一个位置
			switch (result.insertion) {
				case 'first':
					rowIndex = 0;
					break;
				case 'last':
					rowIndex = this.dataSource.length;
					break;
				default:
					break;
			}

			this.$emit('change', { 
				type: 'CREATE', 
				index: rowIndex,
				id,
				data
			});

			// 新元素处于激活状态
			this.setActived(rowIndex);
		},

		/**
		 * refs.sort是递增的，和index无关
		 */
		setActived(index) {
			this.$nextTick(() => {
				try {
					let target = this.$refs.sort.find(i => i.index === index);
					target.setActived();
				} catch (e) {
					console.error(e);
				}
			});
		},

		/**
		 * 交换位置
		 */
		handleSorting(v) {
			this.$emit('change', {
				type: 'SORT',
				changed: v,
				history: false
			});
		},


		handleSortEnd(v) {
			this.$emit('change', {
				type: 'SORT',
				original: v,
				history: true
			});
		}
	},
};
</script>

<style lang="scss">
@import "../../../style/index.scss";

$block: vm-frame-sortable;

@include block($block) {
	background: #f7f6fa;
	@include element(wrapper) {
		flex-shrink: 0;
		border: 1px solid $border;
		margin-left: 20px;
		position: relative;
	}
	@include element(item) {
		transition: all .5s;
	}
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
