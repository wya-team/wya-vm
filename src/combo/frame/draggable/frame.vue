<template>
	<div
		:style="style"
		class="vm-frame-draggable"
		style="position: relative;"
		@dragover.prevent="handleDragOver"
		@dragend="handleDragEnd"
		@drop="handleDrop"
	>
		<vm-grid-lines v-if="showLines" :width="width" :height="height" :grid="[10, 10]" />
		<vm-align-lines v-if="showLines" :data-source="dataSource" :editor="editor"/>
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
			:module="it.module"
			:parent="it.parent"
			:disabled="it.disabled"
			:handles="it.handles"
			:min-w="it.minW"
			:min-h="it.minH"
			:zoom="it.zoom"
			:grid="it.grid"
			:active="it.active"
			:restrain="it.restrain"
			:closeable="it.closeable || typeof it.closeable === 'undefined'"
			:draggable="it.draggable || typeof it.draggable === 'undefined'"
			:rotatable="it.rotatable || typeof it.rotatable === 'undefined'"
			:resizable="it.resizable || typeof it.resizable === 'undefined'"
			@activated="$emit('activated', it)"
			@deactivated="$emit('deactivated', arguments[0], it)"
			@dragging="$emit('dragging', it)"
			@resizing="$emit('resizing', it)"
			@rotating="$emit('rotating', it)"
			@resize-end="$emit('resize-end', it)"
			@drag-end="$emit('drag-end', it)"
			@delete="$emit('change', { type: 'delete', id: it.id })"
			@end="handleEnd(arguments[0], it.id, index)"
			@contextmenu.prevent.native="handleShowMenu($event, it)"
		>
			<!-- vm-type让组件内部处理如何渲染或其他操作 -->
			<component
				:is="`vm-${it.module}-viewer`"
				:index="index"
				:vm="vm"
				v-bind="it"
			/>
		</vm-draggable>
	</div>
</template>

<script>
import Draggable from '../../../core/draggable.vue';
import GridLines from './grid-lines.vue';
import AlignLines from './align-lines.vue';
import { getUid, cloneDeep } from '../../../utils/helper';
import { WIDGET_TO_FRAME } from '../../../utils/constants';

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
		editor: Object,
		showLines: {
			type: Boolean,
			default: true
		},
	},
	data() {
		return {
			vm: {
				type: 'frame'
			}
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
		window.addEventListener('mousedown', this.handleHideRightMenu);
	},
	destroyed() {
		window.removeEventListener('mousedown', this.handleHideRightMenu);
	},
	methods: {
		handleHideRightMenu(e) {
			this.$parent.$options.menuManager.hide();
		},
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
			if (result.max && result.max <= this.dataSource.filter(i => i.module === module).length) {
				this.$emit('error', {
					type: 'create',
					msg: `当前模块最多只能创建${result.max}个`
				});
				return;
			}

			let { x, y } = this.$el.getBoundingClientRect();

			let mouseX = e.pageX || e.clientX + document.documentElement.scrollLeft || 0;
			let mouseY = e.pageY || e.clientY + document.documentElement.scrollTop || 0;

			let id = getUid();
			let rowIndex = this.dataSource.length;

			let data = {
				...cloneDeep(
					typeof result.data === 'function'
						? result.data(index, this.dataSource)
						: result.data
				),
				module,
				id
			};

			// 不可拖拽的情况下
			if (!e.fake && (data.draggable || typeof data.draggable === 'undefined')) {
				data.x = mouseX - x;
				data.y = mouseY - y;
			} else {
				data.x = 0;
				data.y = 0;
			}

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
		/**
		 * index因为都是最后一个插入
		 * 所以不用像sortable/frame.vue一样做判断
		 */
		setActived(index) {
			this.$nextTick(() => {
				try {
					this.$refs.draggable[index].setActived();
				} catch (e) {
					console.error(e);
				}
			});
		},
		handleShowMenu(e, it) {
			// 根据z降序，相等则后面的z放在前面
			let sortList = [...this.dataSource.filter(v => v.module !== 'page')].reverse().sort((a, b) => b.z - a.z);
			let index = sortList.findIndex(v => v.id === it.id);
			it.module !== 'page' && this.$parent.$options.menuManager.show({
				event: e,
			}).then(res => {
				// 1 置顶 2 置底 3 上移一层 4 下移一层 5 删除
				let changeItem;
				switch (res.value) {
					case 1:
						if (index > 0) {
							changeItem = sortList[0];
							it.z = changeItem.z;
						}
						break;
					case 2:
						if (index < sortList.length - 1) {
							changeItem = sortList[sortList.length - 1];
							it.z = changeItem.z;
						}
						break;
					case 3:
						if (index > 0) {
							changeItem = sortList[index - 1];
							[changeItem.z, it.z] = [it.z, changeItem.z];
						}
						break;
					case 4:
						if (index < sortList.length - 1) {
							changeItem = sortList[index + 1];
							[changeItem.z, it.z] = [it.z, changeItem.z];
						}
						break;
					case 5:
						this.$emit('change', { type: 'delete', id: it.id });
						break;
					default:
						break;
				}
				if (res.value !== 5 && changeItem) {
					let curIndex = this.dataSource.findIndex(v => v.id === it.id);
					this.dataSource.splice(curIndex, 1);
					let nextIndex = this.dataSource.findIndex(v => v.id === changeItem.id) + ([1, 3].includes(res.value)
						? 1 : 0);
					this.dataSource.splice(nextIndex, 0, it);
				}
			});
		}
	},
};
</script>
