<template>
	<vm-inner
		ref="inner"
		:show-ruler="showRuler"
		:scroll-left="scrollLeft"
		:scroll-top="scrollTop"
		:frame-w="width"
		:frame-h="height"
		:client-w="clientW"
		:client-h="clientH"
		:scale="scale"
		:border-size="borderSize"
		:guides.sync="guides"
		:theme="theme"
		:class="classes"
		class="vm-frame-draggable" 
		@client-resize="handleClientResize" 
	>
		<template #content>
			<div 
				ref="wrapper" 
				:style="wrapperStyle"
				class="vm-frame-draggable__wrapper" 
				@scroll="handleScroll"
			>
				<div :style="hackStyle">
					<!-- 以上仅辅助Frame，所以frameStyle作用在content上 -->
					<div
						ref="content"
						:style="[contentStyle, frameStyle]"
						class="vm-frame-draggable__content"
						style="position: relative;"
						@dragover.prevent
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
							:scale="scale"
							:grid="it.grid"
							:guides="guides"
							:offset="[scrollLeft || 0, scrollTop || 0]"
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
							@delete="$emit('change', { type: 'DELETE', id: it.id })"
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
				</div>
			</div>
		</template>
		<template #content-extra>
			<vm-thumbnail
				v-if="showThumbnail"
				:data-source="dataSource"
				:scale="scale"
				:frame-w="width"
				:frame-h="height"
				:client-w="clientW"
				:client-h="clientH"
				:scroll-left="scrollLeft"
				:scroll-top="scrollTop"
				:border-size="borderSize"
				:class="classes"
				:theme="theme"
				@scroll="handleScrollThumbnail"
			/>
		</template>	
		<template #footer>
			<vm-zoom-bar
				v-if="showZoomBar"
				:scale.sync="scale"
				:border-size="borderSize"
				:frame-w="width"
				:frame-h="height"
				:client-w="clientW"
				:client-h="clientH"
				:class="classes"
				:theme="theme"
			/>
		</template>
	</vm-inner>
</template>

<script>
import Draggable from '../../../base/draggable.vue';
import GridLines from './grid-lines.vue';
import AlignLines from './align-lines.vue';
import Inner from './inner.vue';
import ZoomBar from './zoom-bar.vue';
import Thumbnail from './thumbnail.vue';
import { RightMenu } from './right-menu.vue';
import { getUid, cloneDeep, throttle } from '../../../utils/helper';
import { WIDGET_TO_FRAME, PAGE_MOULE, RIGHT_MENU_MAP } from '../../../utils/constants';

export default {
	name: 'vm-frame',
	components: {
		'vm-draggable': Draggable,
		'vm-grid-lines': GridLines,
		'vm-align-lines': AlignLines,
		'vm-inner': Inner,
		'vm-zoom-bar': ZoomBar,
		'vm-thumbnail': Thumbnail,
	},
	props: {
		width: {
			type: Number,
			validator: v => v > 0,
		},
		height: {
			type: Number,
			validator: v => v > 0,
		},
		dataSource: Array,
		editor: Object,
		frameStyle: Object,
		showLines: {
			type: Boolean,
			default: true
		},
		showRuler: {
			type: Boolean,
			default: true
		},
		showZoomBar: {
			type: Boolean,
			default: true
		},
		showThumbnail: {
			type: Boolean,
			default: true
		},
		theme: String,
	},
	data() {
		return {
			vm: {
				type: 'frame'
			},
			scrollLeft: 0,
			scrollTop: 0,
			scale: 1,
			xRuleLines: [],
			yRuleLines: [],

			// 容器的宽高
			clientW: 0,
			clientH: 0,

			// 参考线
			guides: [[], []]
		};
	},
	computed: {
		// 四周留白
		borderSize() {
			let size = this.showRuler ? 20 : 0;
			return {
				top: size,
				left: size,
				bottom: size,
				right: size
			};
		},
		wrapperStyle() {
			return {
				paddingTop: `${this.borderSize.top}px`,
				paddingLeft: `${this.borderSize.left}px`,
			};
		},
		contentStyle() {
			return {
				width: `${this.width}px`,
				height: `${this.height}px`,
				transform: `scale(${this.scale})`,
				transformOrigin: `0 0`,
			};
		},

		hackStyle() {
			return {
				width: `${Math.max(this.clientW - this.borderSize.left, this.width * this.scale + this.borderSize.left)}px`,
				height: `${this.height * this.scale + this.borderSize.bottom}px`
			};
		},

		classes() {
			return {
				'is-dark': this.theme === 'dark'
			};
		}
	},
	methods: {
		/**
		 * 1. 自适应布局
		 * 2. 滚动条最右侧显示（hackStyle）, 容易导致无限计划
		 * tips: vm-combo, width 为auto时，会出现一直计算，直到width小于最大的width
		 */
		handleClientResize(w, h) {
			if (!this.$refs.wrapper) return;

			this.clientW = w; 
			this.clientH = h; 
		},

		handleScroll: throttle(function (e) {
			this.scrollLeft = e.target.scrollLeft;
			this.scrollTop = e.target.scrollTop;
		}, 50),

		handleScrollThumbnail(x, y) {

			this.scrollLeft = x;
			this.$refs.wrapper.scrollLeft = x;

			this.scrollTop = y;
			this.$refs.wrapper.scrollTop = y;
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

			let { x, y } = this.$refs.content.getBoundingClientRect();

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
				data.x = Math.round((mouseX - x) / this.scale);
				data.y = Math.round((mouseY - y) / this.scale);
			} else {
				data.x = 0;
				data.y = 0;
			}

			let action = {
				type: 'CREATE',
				index: rowIndex,
				id,
				data
			};
			this.$emit('change', action);

			// 新元素处于激活状态
			this.setActived(rowIndex);
		},
		handleEnd(original, id, index) {
			let action = {
				type: 'UPDATE',
				id,
				index,
				original
			};
			this.$emit('change', action);
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
		handleShowMenu(event, it) {
			if (it.module === PAGE_MOULE) return;
			const onSelect = type => {
				let changed;
				// 根据z降序，相等则后面的z放在前面
				let data = this.dataSource
					.slice()
					.filter(v => v.module !== PAGE_MOULE)
					.reverse()
					.sort((a, b) => b.z - a.z);
				let index = data.findIndex(v => v.id === it.id);

				const { TOP, BOTTOM, UP, DOWN, DELETE } = RIGHT_MENU_MAP;

				switch (type) {
					case TOP:
						if (index === 0) return;
						changed = data[0];
						break;
					case BOTTOM:
						if (index === data.length - 1) return;
						changed = data[data.length - 1];
						break;
					case UP:
						if (index === 0) return;
						changed = data[index - 1];
						break;
					case DOWN:
						if (index === data.length - 1) return;
						changed = data[index + 1];
						break;
					case DELETE:
						this.$emit('change', { type: 'DELETE', id: it.id });
						return;
					default:
						return;
				}

				let current = this.dataSource.findIndex(v => v.id === it.id);
				let target = this.dataSource.findIndex(v => v.id === changed.id);
				let action = {
					type: 'SORT',
					sort: [current, target],
					history: true
				};

				this.$emit('change', action);
			};


			// init
			RightMenu.popup({ event, onSelect });
		}
	},
};
</script>

<style lang="scss">
@import "../../../style/index.scss";

$block: vm-frame-draggable;

@include block($block) {
	@include element(wrapper) {
		overflow: auto;
		height: 100%; // 兼容无ruler模式
		@include scroller();
	}
	@include element(content) {
		// 不可缩小
		flex-shrink: 0;
		border: 1px solid $border;
		position: relative;
		overflow: hidden;
		z-index: 1;
	}
}
</style>
