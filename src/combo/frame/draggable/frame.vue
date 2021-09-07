<template>
	<vm-inner
		ref="inner"
		:show-ruler="showRuler"
		:show-zoom-bar="showZoomBar"
		:scroll-left="scrollLeft"
		:scroll-top="scrollTop"
		:frame-w="width"
		:frame-h="height"
		:client-w="clientW"
		:client-h="clientH"
		:zoom-bar-h="zoomBarH"
		:scale="scale"
		:border-size="borderSize"
		:scroller-size="scrollerSize"
		:guides.sync="guides"
		:theme="theme"
		:class="classes"
		class="vm-frame-draggable" 
		@client-resize="handleClientResize" 
	>
		<template #content>
			<div 
				ref="wrapper" 
				class="vm-frame-draggable__wrapper" 
				:style="wrapperStyle"
				@scroll="handleScroll"
			>
				<vm-selection 
					:client-w="clientW" 
					:client-h="clientH" 
					:border-size="borderSize"
					@selection="handleSelection" 
				/>
				<div :style="scrollStyle">
					<!-- 以上仅辅助Frame，所以frameStyle作用在content上 -->
					<div ref="header" :style="scaleStyle">
						<slot name="frame-header" />
					</div>
					
					<div
						ref="content"
						:style="[contentStyle, frameStyle]"
						class="vm-frame-draggable__content"
						style="position: relative;"
						@dragover.prevent
						@drop="handleDrop"
					>
						<vm-grid-lines v-if="showLines" :width="width" :height="height" :grid="[10, 10]" />
						<vm-align-lines v-if="showLines" :data-source="dataSource" :editor="editor" />
						<!-- prevent为true用于点击时可以触发输入框的失焦 -->
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
							:disabled="it.disabled || !!selections[it.id]"
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
							:prevent="false"
							@delete="handleDeleteModule(it)"
							@activated="handleActivated(arguments[0], it)"
							@deactivated="handleDeactivated(arguments[0], it)"
							@dragging="handleDragging(it)"
							@resizing="$emit('resizing', it)"
							@rotating="$emit('rotating', it)"
							@resize-end="$emit('resize-end', it)"
							@drag-end="handleDragEnd(it)"
							@end="handleEnd(arguments[0], it, index)"
							@contextmenu.prevent.native="handleShowMenu($event, it)"
						>
							<template v-if="it.module !== SELECTION_MODULE">
								<!-- vm-type让组件内部处理如何渲染或其他操作 -->
								<component
									:is="`vm-${it.module}-viewer`"
									:index="index"
									:vm="vm"
									v-bind="it"
									:scale="scale"
									@change="handleAttrChange(arguments[0], it)"
								/>
							</template>
							<template v-else>
								<!-- 组合拖拽 -->
								<div style="width: 100%; height: 100%" />
							</template>
						</vm-draggable>
					</div>
					<div :style="[scaleStyle, footerStyle]">
						<slot name="frame-footer" />
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
				:scroller-size="scrollerSize"
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
				:h="zoomBarH"
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
import RightMenu from './right-menu';
import Selection from './selection.vue';
import { getUid, cloneDeep, throttle, valueIsNaN, hasOwn, allowSelection, Logger } from '../../../utils/helper';
import { WIDGET_TO_FRAME, PAGE_MOULE, RIGHT_MENU_MAP, SELECTION_MODULE } from '../../../utils/constants';

const { TOP, BOTTOM, UP, DOWN, DELETE, SELECTION, LOCK, COPY } = RIGHT_MENU_MAP;

export default {
	name: 'vm-frame',
	components: {
		'vm-draggable': Draggable,
		'vm-grid-lines': GridLines,
		'vm-align-lines': AlignLines,
		'vm-inner': Inner,
		'vm-zoom-bar': ZoomBar,
		'vm-thumbnail': Thumbnail,
		'vm-selection': Selection,
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
			SELECTION_MODULE,
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
			guides: [[], []],

			// 悬浮的滚动条为0
			scrollerSize: 4
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

		// zoomBarH的高度
		zoomBarH() {
			return this.showZoomBar ? 40 : 0;
		},

		/**
		 * 确保宽度不够时，滚动条的位置始终靠最右边与底部
		 */
		wrapperStyle() {
			const { top, left, bottom, right } = this.borderSize;
			return {
				paddingTop: `${top}px`,
				paddingLeft: `${left}px`,
			};
		},

		/**
		 * 滚动区域大小，要加入最右边的宽度和底部的高度
		 */
		scrollStyle() {
			const { top, left, bottom, right } = this.borderSize;
			return {
				width: `${Math.max(this.clientW - right, this.width * this.scale + right)}px`,
				height: `${this.height * this.scale + bottom}px`
			};
		},

		/**
		 * 内容区域
		 */
		contentStyle() {
			return {
				width: `${this.width}px`,
				height: `${this.height}px`,
				transform: `scale(${this.scale})`,
				transformOrigin: `0 0`,
			};
		},

		/**
		 * header / footer 缩放
		 *
		 * zoom:，原来的h是一同缩放的
		 * transform占位依旧是原来的width和height, 需要 originSize * this.scale
		 */
		scaleStyle() {
			return {
				zoom: this.scale,
			};
		},

		/**
		 * 因为中间区域用了transform, 但没有改变height * scale, 所以footer用margin-top控制
		 */
		footerStyle() {
			return {
				marginTop: `${(this.scale - 1) * this.height / this.scale}px`
			};
		},

		classes() {
			return {
				'is-dark': this.theme === 'dark'
			};
		},

		/**
		 * 被选择的ids
		 */
		selections() {
			const { dataSource } = this;
			return dataSource.reduce((pre, cur) => {
				if (cur.module === SELECTION_MODULE) {
					cur.selections.forEach((id) => {
						pre[id] = dataSource.find(i => i.id === id);
					});
				}
				return pre;
			}, {});
		}
	},

	created() {
		this.dragOriginal = {};
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

		// 不添加throttle，如：容易导致计算丢失（快速滚动下影响ruler）
		handleScroll(e) {
			this.scrollLeft = e.target.scrollLeft;
			this.scrollTop = e.target.scrollTop;
		},

		handleScrollThumbnail(x, y) {

			this.scrollLeft = x;
			this.$refs.wrapper.scrollLeft = x;

			this.scrollTop = y;
			this.$refs.wrapper.scrollTop = y;
		},

		handleDrop(e) {
			let result;
			let moduleData;
			try { moduleData = JSON.parse(e.dataTransfer.getData(WIDGET_TO_FRAME) || ''); } catch {}; // eslint-disable-line

			let { module, index } = moduleData || {};
			result = this.$parent.$options.modules[module];

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

		setActivedById(id) {
			this.setActived(this.dataSource.findIndex(i => i.id === id));
		},

		/**
		 * 显示菜单
		 */
		handleShowMenu(event, it) {
			if (it.module === PAGE_MOULE) return;
			// init
			RightMenu.popup({ 
				event, 
				dataSource: it,
				onSelect: (type) => {
					if (it.module === SELECTION_MODULE && (type === TOP || type === BOTTOM)) {
						const oldSortIds = this.dataSource.map(i => i.id);
						const selfActionInvoke = () => {
							let action = this.selectMenu(type, it, false) || { type: 'DUMMY' };
							this.$emit('change', {
								...action,
								revert: it.selections.length
							});
						};

						// 自己再置底，元素再置底
						type === BOTTOM && selfActionInvoke();
						
						// 根据z降序，相等则后面的z放在前面
						let selections = this.dataSource
							.slice()
							.filter(v => it.selections.includes(v.id))
							.reverse()
							.sort((a, b) => b.z - a.z);

						(type === TOP ? selections.reverse() : selections).forEach(data => {
							let action = this.selectMenu(type, data, false) || { type: 'DUMMY' };
							this.$emit('change', {
								...action,
								revert: it.selections.length
							});
						});

						// 元素先置顶，自己再置顶
						type === TOP && selfActionInvoke();

						// 置顶置底未发生变化
						if (
							oldSortIds.every((id, index) => this.dataSource[index].id === id)
						) {
							this.$parent.store.removeHistory(it.selections.length + 1);

							this.$emit('error', {
								type: 'menu',
								msg: `您已经${type === TOP ? '置顶' : '置底'}, 无需操作`
							});
						}
						return;
					}

					this.selectMenu(type, it);
				}, 
				filter: (i) => {
					if (it.module === SELECTION_MODULE) {
						return [TOP, BOTTOM, DELETE, SELECTION, LOCK].includes(i);
					} else {
						return i !== SELECTION;
					}
				} 
			});
		},

		/**
		 * 右键查单选项
		 *
		 * invoke: 表示是否需要emit执行, 否者返回action
		 */
		selectMenu(type, it, invoke = true) {
			let changed;
			let temp;
			// 根据z降序，相等则后面的z放在前面
			let data = this.dataSource
				.slice()
				.filter(v => v.module !== PAGE_MOULE)
				.reverse()
				.sort((a, b) => b.z - a.z);
			let index = data.findIndex(v => v.id === it.id);

			if (type === DELETE && it.closeable === false) return;
			let action;
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
				// 删除：由其他执行
				case DELETE:
					action = { type: 'DELETE', id: it.id };
					if (!invoke) return action;
					this.handleDeleteModule(it);
					return;
				// 取消选择：直接删除元素
				case SELECTION:
					action = { type: 'DELETE', id: it.id };
					if (!invoke) return action;
					this.$emit('change', action);
					return;
				case LOCK: 
					action = { type: 'UPDATE', id: it.id, changed: { disabled: !it.disabled } };
					if (!invoke) return action;
					this.$emit('change', action);
					return;
				case COPY: 
					temp = getUid();
					action = { 
						type: 'CREATE', 
						id: temp, 
						index: this.dataSource.length,
						data: {
							...it,
							id: temp,
						}
					};
					if (!invoke) return action;
					this.$emit('change', action);
					return;
				default:
					return;
			}
			let current = this.dataSource.findIndex(v => v.id === it.id);
			let target = this.dataSource.findIndex(v => v.id === changed.id);

			action = {
				type: 'SORT',
				changed: [current, target],
				history: true,
			};

			if (!invoke) return action;
			this.$emit('change', action);
		},

		/**
		 * 删除
		 */
		handleDeleteModule(it) {
			this.$emit('change', { 
				type: 'DELETE', 
				id: it.id,
				revert: it.selections && it.selections.length,
			});

			if (it.module === SELECTION_MODULE) {
				it.selections.forEach((id) => {
					this.$emit('change', { 
						type: 'DELETE', 
						id,
						revert: it.selections && it.selections.length,
					});
				});
			}
		},

		/**
		 * 从Viewer传递出来
		 * id, history 这是内部字段
		 */
		handleAttrChange(opts = {}, it) {
			if (typeof opts !== 'object') return;
			const { id, history, ...rest } = opts;

			const changed = {};
			for (let key in rest) {
				let val = rest[key];

				['x', 'y', 'z', 'r', 'w', 'h'].includes(key) && (val = Number(val));

				if (hasOwn(rest, key) && !valueIsNaN(val)) {
					changed[key] = val;
				}
			}

			this.$emit('change', {
				type: 'UPDATE',
				id: id || it.id,
				changed,
				// 是否记录历史
				history
			});
		},

		/**
		 * 多选选中
		 */
		handleSelection(rect) {
			const { dataSource, scale, borderSize } = this;
			const headerH = this.$refs.header ? this.$refs.header.clientHeight : 0;
			const $rect = {
				x: this.scrollLeft + (rect.x - borderSize.left) / scale,
				y: this.scrollTop + (rect.y - borderSize.top) / scale - headerH,
				w: rect.w / scale,
				h: rect.h / scale,
			};

			let { selections, selectionModules, disabledIds } = dataSource.reduce((pre, cur) => {
				if (
					!allowSelection(cur, $rect) 
					|| cur.module === PAGE_MOULE
				) return pre;
					
				if (cur.disabled && cur.module === SELECTION_MODULE) {
					pre.disabledIds.push(...cur.selections);
				} 

				if (cur.disabled) return pre;
				if (cur.module === SELECTION_MODULE) {
					pre.selectionModules.push(cur);
				} else {
					pre.selections.push(cur);
				}
				return pre;
			}, {
				selections: [],
				disabledIds: [],
				selectionModules: []
			});
			// 过滤不能选的ids
			selections = selections.filter(i => !disabledIds.includes(i.id));

			const selectionIds = selections.map(i => i.id);

			// 如果选区内selectionIds已存在在selectionModules;直接选中
			for (let i = 0; i < selectionModules.length; i++) {
				if (selectionIds.every(id => selectionModules[i].selections.includes(id))) {
					this.setActivedById(selectionModules[i].id);
					return;
				}
			}

			// 当且只有一个元素未选中或有selectionModules在这个区域内
			if (selections.length <= 1) {
				let rowIndex = 0;

				if (selections.length) {
					rowIndex = dataSource.findIndex(i => i.id === selections[0].id);
				}

				// 找到最上面一层
				if (selectionModules.length) {
					rowIndex = Math.max(
						rowIndex, 
						...selectionModules.map(i => dataSource.findIndex(j => j.id === i.id))
					);
				}

				// 激活状态
				rowIndex && this.setActived(rowIndex);
				return;
			}

			// 移除之前选区
			const actions = dataSource.reduce((pre, cur) => {
				if (cur.module !== SELECTION_MODULE || !selectionIds.some(id => cur.selections.includes(id))) return pre;
				pre.push({
					type: 'DELETE',
					id: cur.id
				});
				return pre;
			}, []);


			let id = getUid();
			const info = selections.reduce((pre, cur) => {
				pre.xs.push(cur.x);
				pre.xws.push(cur.x + cur.w);
				pre.ys.push(cur.y);
				pre.yhs.push(cur.y + cur.h);
				pre.zs.push(cur.z);
				pre.parent && (pre.parent = cur.parent);
				return pre;
			}, {
				xs: [],
				xws: [],
				ys: [],
				yhs: [],
				zs: [],
				parent: true
			});
			let minX = Math.min(...info.xs);
			let maxX = Math.max(...info.xws);

			let minY = Math.min(...info.ys);
			let maxY = Math.max(...info.yhs);

			// 删除之前组合的
			actions.forEach(i => { i.revert = actions.length; this.$emit('change', i); });

			let rowIndex = dataSource.length;
			let action = {
				type: 'CREATE',
				index: rowIndex,
				id,
				data: {
					x: minX,
					y: minY,
					w: maxX - minX,
					h: maxY - minY,
					z: Math.max(...info.zs),
					r: 0,

					parent: info.parent,
					rotatable: false,
					resizable: false,
					closeable: true,

					// 用于表示锁定
					disabled: false,
					active: false,

					// 内部分配字段
					selections: selectionIds,
					module: SELECTION_MODULE,
					id
				},
				revert: actions.length
			};

			this.$emit('change', action);
			// 新元素处于激活状态
			this.setActived(rowIndex);
		},

		/**
		 * 目标被激活
		 */
		handleActivated(e, it) {
			Logger.debug('activated', it.module);
			this.$emit('activated', e, it);
			if (it.module === SELECTION_MODULE) {
				this.dragOriginal[it.id] = {
					x: it.x,
					y: it.y
				};
			}
		},

		/**
		 * 目标失活
		 */
		handleDeactivated(e, it) {
			Logger.debug('deactivated', it.module);
			this.$emit('deactivated', e, it);
		},

		/**
		 * 目标被拖动
		 */
		handleDragging(it) {
			this.$emit('dragging', it);
			if (it.module === SELECTION_MODULE) {
				const diffX = it.x - this.dragOriginal[it.id].x;
				const diffY = it.y - this.dragOriginal[it.id].y;

				(diffX || diffY) && it.selections && it.selections.forEach(id => {
					let { x, y, module } = this.selections[id];
					if (!this.dragOriginal[id]) {
						this.dragOriginal[id] = {
							x,
							y
						};
					}
					x = this.dragOriginal[id].x + diffX;
					y = this.dragOriginal[id].y + diffY;

					this.$emit('change', {
						type: 'UPDATE',
						id,
						changed: {
							x,
							y
						},
						// 是否记录历史
						history: false
					});
				});
			}
		},

		/**
		 * 目标拖动结束
		 */
		handleDragEnd(it) {
			Logger.debug('drag-end', it.module);
			this.$emit('drag-end', it);
			if (it.module === SELECTION_MODULE) {
				this.dragOriginal = {};

				// 用于激活状态下再次拖拽
				this.dragOriginal[it.id] = {
					x: it.x,
					y: it.y
				};
			}
		},


		/**
		 * 目标所有变化行为结束
		 * original 用于回到历史位置
		 */
		handleEnd(original, it, index) {
			Logger.debug('end', it.module);
			let action = {
				type: 'UPDATE',
				id: it.id,
				index,
				original,
				revert: it.selections && it.selections.length,
			};
			this.$emit('change', action);

			if (it.module === SELECTION_MODULE) {
				const diffX = it.x - original.x;
				const diffY = it.y - original.y;

				(diffX || diffY) && it.selections && it.selections.forEach(id => {
					let { x, y, module } = this.selections[id];
					this.$emit('change', {
						type: 'UPDATE',
						id,
						revert: it.selections && it.selections.length,
						original: {
							x: x - diffX,
							y: y - diffY
						}
					});
				});
			}
		},
	},
};
</script>

<style lang="scss">
@import "../../../style/index.scss";

$block: vm-frame-draggable;

@include block($block) {
	@include element(wrapper) {
		overflow: auto; // hidden时考虑使用悬浮的滚动条
		height: 100%; // 兼容无ruler模式
		@include scroller();
	}
	@include element(content) {
		// 不可缩小
		flex-shrink: 0;
		border: 1px solid $border;
		position: relative;
		// overflow: hidden;
		z-index: 1;
	}
}
</style>
