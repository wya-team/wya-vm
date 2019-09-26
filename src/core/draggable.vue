<template>
	<div
		:style="coord"
		:class="!draggable ? 'vm-draggable-disabled' : ''"
		class="vm-draggable"
		@mousedown.stop="handleContainerDown"
		@touchstart.stop="handleContainerDown"
	>
		<div :style="style" :class="{ 'is-events-none': isChanging }" >
			<slot :style="style"/>
		</div>
		<!-- handle -->
		<div
			v-if="(active || isActive) && (closeable || realHandles.length > 0)"
			:class="{ 'is-disabled': disabled, 'is-active': (active || isActive) }"
			:style="style"
			class="vm-draggable__handles"
		>
			<template v-for="item in realHandles">
				<div
					v-if="!disabled"
					:key="item"
					:class="`is-${item}`"
					class="vm-draggable__handle"
					@mousedown.left.stop="handleDown($event, item)"
					@touchstart.stop="handleDown($event, item)"
				/>
			</template>
			<div v-if="rotatable && isRotating" :style="{ width }" class="vm-draggable__rotate"/>
			<!-- delete -->
			<p v-if="closeable" class="vm-draggable__delete" @click="$emit('delete')">✕</p>
		</div>

		<!-- 位置不会改变的 -->
		<!-- grid for rotate -->
		<template v-if="isRotating">
			<div :style="{ width }" class="vm-draggable__rotate--deg is-0" />
			<div :style="{ width }" class="vm-draggable__rotate--deg is-45" />
			<div :style="{ width }" class="vm-draggable__rotate--deg is-90" />
			<div :style="{ width }" class="vm-draggable__rotate--deg is-135" />
			<div class="vm-draggable__rotate--tip">{{ r }} °</div>
		</template>
	</div>
</template>

<script>
import { isPassiveSupported, eleInRegExp } from '../utils/helper';

const doc = document.documentElement;
const angleArr = [0, 45, 90, 135, 180, 225, 270, 315, 360];

export const draggableEvents = {
	start: ['touchstart', 'mousedown'],
	move: ['touchmove', 'mousemove'],
	end: ['touchend', 'touchcancel', 'mouseup']
};

export default {
	replace: true,
	name: 'vm-draggable',
	props: {
		handles: {
			type: Array,
			default: () => (['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-right', 'bottom-left', 'rotate'])
		},
		// 宽度
		w: {
			type: Number,
			default: 0,
			validator: val => val >= 0
		},
		// 高度
		h: {
			type: Number,
			default: 0,
			validator: val => val >= 0
		},
		// 选择角度
		r: {
			type: Number,
			default: 0
		},
		// 最小宽度
		minW: {
			type: Number,
			default: 36,
			validator: val => val > 0
		},
		// 最小高度
		minH: {
			type: Number,
			default: 36,
			validator: val => val > 0
		},
		// 距父元素左上角X轴偏移量
		x: {
			type: Number,
			default: 0
		},
		// 距父元素左上角Y轴偏移量
		y: {
			type: Number,
			default: 0
		},
		// zIndex
		z: {
			type: Number,
			default: 1
		},
		zoom: {
			type: Number,
			default: 1
		},
		grid: {
			type: Array,
			default: () => {
				return [1, 1];
			}
		},
		// 约束组件大小
		restrain: {
			type: Number,
			default: 0
		},
		parent: {
			type: Boolean,
			default: false
		},

		// 在入口文件下，才会去判断editorRegExp，如弹层不会判断让其失去激活状态（除非配置）
		entryRegExp: {
			type: Object,
			default: () => ({
				className: /vm-hack-entry/,
				id: /^(app|pages)$/
			})
		},

		editorRegExp: {
			type: Object,
			default: () => ({
				className: /vm-hack-editor/
			})
		},

		/**
		 * 是否屏蔽默认事件
		 */
		prevent: {
			type: Boolean,
			default: true
		},
		preventRegExp: {
			type: Object,
			default: () => ({
				tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|OPTION)$/,
				className: /vm-hack-pevent/,
			})
		},

		disabled: {
			type: Boolean,
			default: false
		},

		closeable: {
			type: Boolean,
			default: false
		},

		draggable: {
			type: Boolean,
			default: true
		},

		resizable: {
			type: Boolean,
			default: true
		},

		rotatable: {
			type: Boolean,
			default: true
		},

		// 激活状态， 特殊需求
		active: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			isResizing: false,
			isDraging: false,
			isRotating: false,
			isChanging: false,
			isActive: false
		};
	},
	computed: {
		coord() {
			return {
				left: this.x + 'px',
				top: this.y + 'px',
				zIndex: this.z
			};
		},
		style() {
			const w = this.w === 0 ? 'auto' : `${this.w}px`;
			const h = this.h === 0 ? 'auto' : `${this.h}px`;
			return {
				width: w,
				height: h,
				transform: `rotate(${this.r}deg)`
			};
		},
		width() {
			let num = Math.floor(
				Math.sqrt(this.w * this.w + this.h * this.h) * 1.15
			);
			return `${num}px`;
		},
		realHandles() {
			let handles = this.handles;

			if (!this.rotatable) {
				handles = handles.filter(i => i !== 'rotate');
			}

			if (!this.resizable) {
				handles = handles.filter(i => i === 'rotate');
			}

			return handles;
		}
	},
	watch: {},
	beforeCreate() {
		this.parentX = 0;
		this.parentY = 0;
		this.parentW = 9999;
		this.parentH = 9999;
		this.mouseX = 0;
		this.mouseY = 0;
		this.lastMouseX = 0;
		this.lastMouseY = 0;
		this.mouseOffX = 0;
		this.mouseOffY = 0;

		this.handle = null;

		// 组件捕获阶段执行
		this.eventOpts = !isPassiveSupported || { capture: true, passive: true };

		// 改变前状态
		this.beforeStatus = null;
	},
	mounted() {
		// 初始化控件宽高, todo: 宽高未零时，是否需要计算
		if (this.w && this.minW > this.w) {
			this.sync({ w: this.minW });
		}
		if (this.h && this.minH > this.h) {
			this.sync({ h: this.minH });
		}

		this.$nextTick(() => {
			const { x, y } = this.$el.parentNode.getBoundingClientRect();
			this.parentX = x;
			this.parentY = y;
			// 判断是否只能在父级元素中拖动
			this.parent && this.calculation();
			this.$emit('resizing');
		});
	},
	destroyed() {
		this.operateDOMEvents('remove');
	},
	methods: {
		calculation() {
			const { width, height } = this.$el.parentNode.getBoundingClientRect();
			if (!width || !height) {
				throw new Error('@wya/vm: 父层容器宽度计算异常');
			}

			this.parentW = width;
			this.parentH = height; // this.$el.parentNode.clientHeight

			if (this.w > this.parentW) {
				this.sync({ w: this.parentW });
			}
			if (this.h > this.parentH) {
				this.sync({ h: this.parentH });
			}
			if ((this.x + this.w) > this.parentW) {
				this.sync({ x: this.parentW - this.w });
			}
			if ((this.y + this.h) > this.parentH) {
				this.sync({ y: this.parentH - this.h });
			}
		},
		sync(opts) {
			for (let key in opts) {
				if (this[key] != opts[key]) {
					!this.beforeStatus && (this.beforeStatus = {
						x: this.x,
						y: this.y,
						z: this.z,
						w: this.w,
						r: this.r
					});
					this.$emit(`update:${key}`, opts[key]);
				}
			}
		},
		operateDOMEvents(type) {
			let fn = type === 'add' ? doc.addEventListener : doc.removeEventListener;

			// 使用原生绑定 不区分移动端还是桌面端
			draggableEvents.start.forEach(eventName => {
				fn(eventName, this.handleDeselect, this.eventOpts);
			});
			draggableEvents.move.forEach(eventName => {
				fn(eventName, this.handleMove, this.eventOpts);
			});
			draggableEvents.end.forEach(eventName => {
				fn(eventName, this.handleUp, this.eventOpts);
			});
		},
		/**
		 * 模拟设置isActive状态
		 */
		setActived() {
			this.handleContainerDown();
			this.handleUp();
		},
		/**
		 * 组件被按下事件
		 */
		handleContainerDown(e = {}) {
			this.prevent
				&& e.preventDefault
				&& !eleInRegExp(e.target, this.preventRegExp)
				&& e.preventDefault();

			// 判断是否支持拖动
			if (this.disabled) return;
			const target = e.target || e.srcElement;
			// 确保事件发生在组件内部
			if (!target || this.$el.contains(target)) {
				if (!this.isActive) {
					const { mousePositionX, mousePositionY } = this.getPositionByEvent(e);

					this.lastMouseX = mousePositionX + doc.scrollLeft;
					this.lastMouseY = mousePositionY + doc.scrollTop;

					// 绑定事件
					this.operateDOMEvents('add');

					this.isActive = true;
					this.$emit('activated');
				}
				this.draggable && (this.isDraging = true);
			}
		},
		/**
		 * 取消选择事件
		 */
		handleDeselect(e) {
			const { mousePositionX, mousePositionY } = this.getPositionByEvent(e);

			this.mouseX = mousePositionX + doc.scrollLeft;
			this.mouseY = mousePositionY + doc.scrollTop;
			this.lastMouseX = this.mouseX;
			this.lastMouseY = this.mouseY;
			const target = e.target || e.srcElement; // body不要带上class, 否则会存在问题

			// 内部管理
			const regex = {
				className: /is-([(top|right|-|bottom|left)]{2})/
			};

			let path = e.path || (e.composedPath && e.composedPath()) || [];

			// 是否是入口下的元素，如果不是，就意味着可能是弹层（避免销毁）
			let isInline = path.some(item => eleInRegExp(item, this.entryRegExp));

			if (
				isInline
				&& !this.$el.contains(target)
				&& !eleInRegExp(target, regex)
				&& (!path.some(item => eleInRegExp(item, this.editorRegExp)))
			) {
				if (this.isActive) {
					// 解绑
					this.operateDOMEvents('remove');

					this.isActive = false;
					this.$emit('deactivated', e);
				}
			}
		},
		/**
		 * 拖动点按下事件
		 */
		handleDown(e, handle) {
			this.prevent
				&& e.preventDefault
				&& !eleInRegExp(e.target, this.preventRegExp)
				&& e.preventDefault();

			// 将handle设置为当前元素
			this.handle = handle;
			if (handle === 'rotate') {
				this.rotatable && (this.isRotating = true);
			} else {
				this.resizable && (this.isResizing = true);
			}

			const { mousePositionX, mousePositionY } = this.getPositionByEvent(e);

			this.preMouseX = mousePositionX + doc.scrollLeft;
			this.preMouseY = mousePositionY + doc.scrollTop;
		},
		/**
		 * 鼠标在页面上的坐标
		 */
		handleMove(e) {
			const { mousePositionX, mousePositionY } = this.getPositionByEvent(e);

			this.mouseX = mousePositionX + doc.scrollLeft;
			this.mouseY = mousePositionY + doc.scrollTop;

			// x, y, w, h
			let elmX = parseInt(this.x, 10);
			let elmY = parseInt(this.y, 10);
			let elmW = parseInt(this.w, 10);
			let elmH = parseInt(this.h, 10);

			// diffX =  当前鼠标位置 - 上次鼠标位置 + ？？
			let diffX = (this.mouseX - this.lastMouseX + this.mouseOffX) / this.zoom;
			let diffY = (this.mouseY - this.lastMouseY + this.mouseOffY) / this.zoom;
			this.mouseOffX = 0;
			this.mouseOffY = 0;
			this.lastMouseX = this.mouseX;
			this.lastMouseY = this.mouseY;
			if (this.isResizing) {
				if (this.handle.includes('top')) {
					if (elmH - diffY < this.minH) { // 向下移动
						// 变换后的高度小于最小高度，diffY -> 0 , this.mouseOffY为this.y -> 当前鼠标位置的距离（正数）
						this.mouseOffY = (diffY - (diffY = elmH - this.minH));
					} else if (this.parent && elmY + diffY < 0) { // 向上移动
						// 变换后this.y 超出父层顶部边界时， diffY -> 0, this.mouseOffY为this.y -> 当前鼠标位置的距离(负数)
						this.mouseOffY = (diffY - (diffY = -elmY));
					}
					elmY += diffY;
					elmH -= diffY;
				}
				if (this.handle.includes('bottom')) {
					if (elmH + diffY < this.minH) { // 向上移动
						this.mouseOffY = (diffY - (diffY = this.minH - elmH));
					} else if (elmY + elmH + diffY > this.parentH) { // 向下移动
						this.mouseOffY = (diffY - (diffY = this.parentH - elmY - elmH));
					}
					elmH += diffY;
				}
				if (this.handle.includes('left')) {
					if (elmW - diffX < this.minW) { // 向右移动
						this.mouseOffX = (diffX - (diffX = elmW - this.minW));
					} else if (this.parent && elmX + diffX < 0) { // 向左移动
						this.mouseOffX = (diffX - (diffX = -elmX));
					}
					elmX += diffX;
					elmW -= diffX;
				}
				if (this.handle.includes('right')) {
					if (elmW + diffX < this.minW) { // 向左移动
						this.mouseOffX = (diffX - (diffX = this.minW - elmW));
					} else if (elmX + elmW + diffX > this.parentW) { // 向右移动
						this.mouseOffX = (diffX - (diffX = this.parentW - elmX - elmW));
					}
					elmW += diffX;
				}
				!this.disabled && this.sync({
					x: (Math.round(elmX / this.grid[0]) * this.grid[0]),
					y: (Math.round(elmY / this.grid[1]) * this.grid[1]),
					w: (Math.round(elmW / this.grid[0]) * this.grid[0]),
					h: (Math.round(elmH / this.grid[1]) * this.grid[1]),
				});
				this.$emit('resizing');
			} else if (this.isRotating) {
				let angle = this.getAngle(
					[this.parentX + this.x + this.w / 2, -(this.parentY + this.y + this.h / 2)],
					[this.lastMouseX, -this.lastMouseY],
				);

				let criticalAngle = angleArr.find(item => Math.abs(item - angle) < 3);
				angle = typeof criticalAngle === 'number' ? criticalAngle : angle;

				!this.disabled && this.sync({
					r: angle === 360 ? 0 : angle
				});
				this.$emit('rotating');
			} else if (this.isDraging) {
				if (this.parent) {
					if (elmX + diffX < 0) {
						this.mouseOffX = (diffX * this.zoom - (diffX = -elmX));
					} else if (elmX + elmW + diffX > this.parentW) {
						this.mouseOffX = (diffX * this.zoom - (diffX = this.parentW - elmX - elmW));
					}
					if (elmY + diffY < 0) {
						this.mouseOffY = (diffY * this.zoom - (diffY = -elmY));
					} else if (elmY + elmH + diffY > this.parentH) {
						this.mouseOffY = (diffY * this.zoom - (diffY = this.parentH - elmY - elmH));
					}
				}

				elmX += diffX;
				elmY += diffY;

				!this.disabled && this.sync({
					x: (Math.round(elmX / this.grid[0]) * this.grid[0]),
					y: (Math.round(elmY / this.grid[1]) * this.grid[1]),
				});
				this.$emit('dragging');
			}

			// 正在改变
			!this.isChanging
				&& (this.isRotating || this.isDraging || this.isResizing)
				&& (this.isChanging = true);

		},
		getAngle(center, last) {
			let diffX = last[0] - center[0];
			let diffY = last[1] - center[1];
			/**
			 * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
			 * -180 <= c < 180
			 */
			let c = 360 * Math.atan2(diffY, diffX) / (2 * Math.PI);
			c = c > 90
				? (450 - c) // 第4
				: 90 - c; // 第1，2，3象限
			return Math.floor(c);
		},
		getRestrain(num) {
			const restrain = this.restrain;
			return (num / restrain).toFixed(0) * restrain;
		},
		getPositionByEvent(e) {
			const mousePositionX = e.targetTouches
				? e.targetTouches[0].pageX
				: e.clientX;
			const mousePositionY = e.targetTouches
				? e.targetTouches[0].pageY
				: e.clientY;
			return {
				mousePositionX: mousePositionX || 0,
				mousePositionY: mousePositionY || 0
			};
		},
		handleUp(e) {
			this.isChanging = false;
			this.handle = null;
			// 约束
			const restrain = this.restrain;
			if (restrain && restrain > 0) {
				this.sync({
					x: this.getRestrain(this.x),
					y: this.getRestrain(this.y),
					w: this.getRestrain(this.w),
					h: this.getRestrain(this.h),
				});
			}
			if (this.isRotating) {
				this.isRotating = false;
				this.$emit('rotate-end');
			}
			if (this.isResizing) {
				this.isResizing = false;
				this.$emit('resize-end');
			}
			if (this.isDraging) {
				this.isDraging = false;
				this.$emit('drag-end');
			}
			if (this.beforeStatus) {
				this.$emit('end', this.beforeStatus);
				this.beforeStatus = null;
			}
		}
	},
};
</script>

<style lang="scss">

$url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" style="font-size: 20px;"><text y="15">↻</text></svg>';

.vm-draggable {
	padding: 0;
	position: absolute;
	box-sizing: border-box;
	user-select: none;
	&:hover {
		cursor: move;
	}
	.is-events-none {
		pointer-events: none;
	}
	// 重复？
	.is-delete {
		background: #5495F6;
		position: absolute;
		right: 0;
		width: 20px;
		color: white;
		text-align: center;
		z-index: 300
	}
}
.vm-draggable-disabled {
	&:hover {
		cursor: default;
	}
}
.vm-draggable__handles {
	&.is-active {
		padding: 0;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		position: absolute;
		z-index: 2;
		border: 1px dotted #5495F6;
		// cursor: move;
		.vm-draggable__handle {
			display: block;
		}
	}
	&.is-disabled {
		border: 1px dotted #e96101;
		.handle-rotate {
			&:after {
				background: #e96101;
			}
			&:before {
				color: #e96101;
			}
		}
	}
}
.vm-draggable__handle {
	display: none;
	position: absolute;
	box-sizing: border-box;
	z-index: 999;
	&.is-left {
		top: 0;
		left: -5px;
		cursor: ew-resize;
		position: absolute;
		height: 100%;
		width: 5px;
		&:hover {
			background: linear-gradient(to right, rgba(255, 255, 255, 0), #3F51B5);
		}
	}
	&.is-right {
		top: 0;
		right: -5px;
		cursor: ew-resize;
		position: absolute;
		height: 100%;
		width: 5px;
		&:hover {
			background: linear-gradient(to left, rgba(255, 255, 255, 0), #3F51B5);
		}
	}

	&.is-top {
		position: absolute;
		width: 100%;
		height: 5px;
		top: -5px;
		left: 0;
		cursor: ns-resize;
		&:hover {
			background: linear-gradient(to bottom, rgba(255, 255, 255, 0), #3F51B5);
		}
	}
	&.is-bottom {
		position: absolute;
		width: 100%;
		height: 5px;
		bottom: -5px;
		left: 0;
		cursor: ns-resize;
		&:hover {
			background: linear-gradient(to top, rgba(255, 255, 255, 0), #3F51B5);
		}
	}
	&.is-top-left {
		top: 0;
		left: 0;
		cursor: nwse-resize;
		padding: 5px;
	}
	.is-bottom-left {
		bottom: 0;
		left: 0;
		cursor: nesw-resize;
		padding: 5px;
	}
	&.is-top-right {
		top: 0;
		right: 0;
		cursor: nesw-resize;
		padding: 5px;
	}
	&.is-bottom-right {
		bottom: 0;
		right: 0;
		cursor: nwse-resize;
		padding: 5px;
	}
	&.is-rotate {
		top: 0;
		left: 50%;
		transform: translate(-50%, -100%);
		cursor: url($url) 10 10,default;
		display: flex !important;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		&:after {
			content: ' ';
			height: 10px;
			width: 1px;
			background: #5495F6;
		}
		&:before {
			content: '☐';
			transform: translateY(26%);
			color: #5495F6;
		}
	}
}

/**
 * rotate
 */
.vm-draggable__rotate {
	position: absolute;
	left: 50%;
	top: 50%;
	z-index: 2;
	width: 500px;
	border: 1px solid #1fb6ff;
	background-color: #1fb6ff;
	transform: translate(-50%, -50%) rotate(90deg);
}
.vm-draggable__rotate--deg {
	position: absolute;
	top: 50%;
	left: 50%;
	z-index: 2;
	width: 500px;
	border-top: 1px dashed #fff;
	border-bottom: 1px dashed #262626;
	opacity: .4;
	&.is-0 {
		transform: translate(-50%, -50%);
	}
	&.is-45 {
		transform: translate(-50%, -50%) rotate(45deg);
	}
	&.is-90 {
		transform: translate(-50%, -50%) rotate(90deg);
	}
	&.is-135 {
		transform: translate(-50%, -50%) rotate(135deg);
	}
}

.vm-draggable__rotate--tip {
	position: absolute;
	top: -50px;
	left: 60%;
	width: 40px;
	height: 16px;
	line-height: 16px;
	text-align: center;
	border: 1px solid #262626;
	border-radius: 8px;
	background-color: #fff;
}

.vm-draggable__delete {
	background: #5495F6;
	position: absolute;
	right: 0px;
	width: 20px;
	color: white;
	text-align: center;
	z-index: 300;
	top: 0;
	right: 0px;
	cursor: pointer;
}

</style>
