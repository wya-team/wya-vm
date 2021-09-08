<template>
	<vm-inner :has-page="hasPage" class="vm-frame-sortable">
		<template #content>
			<slot name="frame-header" />
			<div 
				:style="[style, frameStyle]" 
				class="vm-frame-sortable__wrapper"
				@scroll="handleScroll"
				@dragover.prevent
				@dragenter="handleDragEnter"
				@dragleave="handleDragLeave"
				@drop="handleDrop"
			>
				<transition-group tag="div" name="flip-list">
					<div v-for="(it, index) in dataSource" :key="it.id" class="vm-frame-sortable__item">
						<!-- prevent为true用于点击时可以触发输入框的失焦 -->
						<div :style="getItemStyle(it, index)">
							<vm-sortable
								ref="sort"
								:index="index"
								:type="dragType"
								:disabled="it.disabled"
								:draggable="it.draggable || typeof it.draggable === 'undefined'"
								:closeable="it.closeable || typeof it.closeable === 'undefined'"
								:prevent="false"
								@activated="$emit('activated', arguments[0], it)"
								@deactivated="$emit('deactivated', arguments[0], it)"
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
						<div v-if="it.placeholder" :style="{height: `${it.placeholder}px`}" />
					</div>
				</transition-group>
			</div>
			<slot name="frame-footer" />
		</template>
	</vm-inner>
</template>

<script>
import Inner from './inner.vue';
import Sortable from '../../../base/sortable.vue';
import { getUid, cloneDeep, throttle } from '../../../utils/helper';
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
			scrollTop: 0,
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

		getItemStyle(it, index) {

			if (typeof it.wrapperStyle === 'function') {
				const { scrollTop, dataSource, vm } = this;
				let params = {
					row: it,
					index,
					dataSource,
					scrollTop,
					vm
				};
				return it.wrapperStyle(params, this);
			}

			return it.wrapperStyle || {};
		},

		// 不添加throttle, 具体情况draggable frame
		handleScroll(e) {
			this.scrollTop = e.target.scrollTop;
		},

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

			// 计算是否允许插入
			if (typeof result.insertion === 'function') {
				let allow = result.insertion(rowIndex, this.dataSource);

				if (!allow) {
					return;
				}
			}

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

		setActivedById(id) {
			this.setActived(this.dataSource.findIndex(i => i.id === id));
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

			this.$emit('sort-end', v, this.dataSource);
		}
	},
};
</script>

<style lang="scss">
@import "../../../style/index.scss";

$block: vm-frame-sortable;

@include block($block) {
	background: #f7f6fa;
	display: flex;
	flex-direction: column;
	@include element(wrapper) {
		flex-shrink: 0;
		border: 1px solid $border;
		// margin-left: 20px;
		position: relative;
		overflow: auto;
		@include scroller();
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
