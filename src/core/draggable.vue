<template>
	<div :style="coord" class="vm-draggable" @mousedown.stop="handleContainerDown">
		<div :style="style" :class="{ 'is-events-none': changing }" >
			<slot :style="style"/>
		</div>
		<!-- handle -->
		<div 
			v-if="active && handles && handles.length !== 0" 
			:class="{ 'is-disabled': disabled, 'is-active': active }" 
			:style="style"
		>
			<template v-for="item in handles">
				<div
					v-if="!disabled"
					:key="item"
					:class="`is-${item}`"
					class="vm-draggable__handle"
					@mousedown.left.stop="handleDown($event, item)"
				/>
			</template>
			<div v-if="rotatable" :style="{ width }" class="vm-draggable__rotate"/>
		</div>
		<!-- grid for rotate -->
		<template v-if="rotatable">
			<div :style="{ width }" class="is-deg-0" />
			<div :style="{ width }" class="is-deg-45" />
			<div :style="{ width }" class="is-deg-90" />
			<div :style="{ width }" class="is-deg-135" />
			<div class="is-deg-tip">{{ r }} °</div>
		</template>

		<!-- delete -->
		<p 
			v-if="clearable && isActive" 
			class="vm-draggable__delete" 
			@click="$emit('delete')"
		>✕</p>
	</div>
</template>

<script>
import { isPassiveSupported, eleInRegExp } from '../utils/helper';

const doc = document.documentElement;
const angleArr = [0, 45, 90, 135, 180, 225, 270, 315, 360];

export default {
	replace: true,
	name: 'vm-draggable',
	props: {
		disabled: {
			type: Boolean, 
			default: false
		},
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
		minw: {
			type: Number,
			default: 36,
			validator: val => val > 0
		},
		// 最小高度
		minh: {
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
				className: /vm-hack-pevent/
			})
		},

		clearable: {
			type: Boolean, 
			default: false
		}
	},
	data() {

		return {
			resizable: false,
			draggable: false,
			rotatable: false,
			changing: false,
			active: false
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
		if (this.w && this.minw > this.w) {
			this.sync({ w: this.minw });
		}
		if (this.h && this.minh > this.h) {
			this.sync({ h: this.minh });
		}
		const { x, y } = this.$el.parentNode.getBoundingClientRect();
		this.parentX = x;
		this.parentY = y;

		// 判断是否只能在父级元素中拖动
		this.parent && this.calculation();
		this.$emit('resizing');
	},
	destroyed() {
		this.operateDOMEvents('remove');
	},
	methods: {
		calculation() {
			const { width, height } = this.$el.parentNode.getBoundingClientRect();
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

			fn('mousedown', this.handleDeselect, this.eventOpts);
			fn('mousemove', this.handleMove, this.eventOpts);
			fn('mouseup', this.handleUp, this.eventOpts);
		},
		/**
		 * 模拟设置active状态
		 */
		setActived() {
			this.handleContainerDown();
			this.handleUp();
		},
		/**
		 * 组件被按下事件
		 */
		handleContainerDown(e = {}) {
			// 去除默认事件 todo: 匹配输入框
			this.prevent
				&& e.preventDefault 
				&& !eleInRegExp(e.target, this.preventRegExp)
				&& e.preventDefault();

			// 判断是否支持拖动
			if (this.disabled) return;
			const target = e.target || e.srcElement;
			// 确保事件发生在组件内部
			if (!target || this.$el.contains(target)) {
				if (!this.active) {
					this.lastMouseX = e.pageX || e.clientX + doc.scrollLeft;
					this.lastMouseY = e.pageY || e.clientY + doc.scrollTop;

					// 绑定事件
					this.operateDOMEvents('add');

					this.active = true;
					this.$emit('activated');
				}
				this.draggable = true;
			}
		},
		/**
		 * 取消选择事件
		 */
		handleDeselect(e) {
			this.mouseX = e.pageX || e.clientX + doc.scrollLeft;
			this.mouseY = e.pageY || e.clientY + doc.scrollTop;
			this.lastMouseX = this.mouseX;
			this.lastMouseY = this.mouseY;
			const target = e.target || e.srcElement; // body不要带上class, 否则会存在问题

			// 内部管理
			const regex = {
				className: /is-([(top|right|-|bottom|left)]{2})/
			};

			let path = e.path || (e.composedPath && e.composedPath()) || [];
			if (
				!this.$el.contains(target) 
				&& !eleInRegExp(target, regex)
				&& (!path.some(item => eleInRegExp(item, this.editorRegExp)))
			) {
				if (this.active) {
					// 解绑
					this.operateDOMEvents('remove');

					this.active = false;
					this.$emit('deactivated');
				}
			}
		},
		/**
		 * 拖动点按下事件
		 */
		handleDown(e, handle) {
			// 去除默认事件 todo: 匹配输入框
			this.prevent
				&& e.preventDefault 
				&& !eleInRegExp(e.target, this.preventRegExp)
				&& e.preventDefault();

			// 将handle设置为当前元素
			this.handle = handle;
			if (handle === 'rotate') {
				this.rotatable = true;
			} else {
				this.resizable = true;
			}

			this.preMouseX = e.pageX || e.clientX + doc.scrollLeft;
			this.preMouseY = e.pageY || e.clientY + doc.scrollTop;
		},
		/**
		 * 鼠标在页面上的坐标
		 */
		handleMove(e) {
			this.mouseX = e.pageX || e.clientX + doc.scrollLeft;
			this.mouseY = e.pageY || e.clientY + doc.scrollTop;

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
			if (this.resizable) {
				if (this.handle.includes('top')) {
					if (elmH - diffY < this.minh) { // 向下移动
						// 变换后的高度小于最小高度，diffY -> 0 , this.mouseOffY为this.y -> 当前鼠标位置的距离（正数）
						this.mouseOffY = (diffY - (diffY = elmH - this.minh));
					} else if (this.parent && elmY + diffY < 0) { // 向上移动 
						// 变换后this.y 超出父层顶部边界时， diffY -> 0, this.mouseOffY为this.y -> 当前鼠标位置的距离(负数)
						this.mouseOffY = (diffY - (diffY = -elmY));
					}
					elmY += diffY;
					elmH -= diffY;
				}
				if (this.handle.includes('bottom')) {
					if (elmH + diffY < this.minh) { // 向上移动
						this.mouseOffY = (diffY - (diffY = this.minh - elmH));
					} else if (elmY + elmH + diffY > this.parentH) { // 向下移动
						this.mouseOffY = (diffY - (diffY = this.parentH - elmY - elmH));
					}
					elmH += diffY;
				}
				if (this.handle.includes('left')) {
					if (elmW - diffX < this.minw) { // 向右移动
						this.mouseOffX = (diffX - (diffX = elmW - this.minw));
					} else if (this.parent && elmX + diffX < 0) { // 向左移动
						this.mouseOffX = (diffX - (diffX = -elmX));
					}
					elmX += diffX;
					elmW -= diffX;
				}
				if (this.handle.includes('right')) {
					if (elmW + diffX < this.minw) { // 向左移动
						this.mouseOffX = (diffX - (diffX = this.minw - elmW));
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
			} else if (this.rotatable) {
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
			} else if (this.draggable) {
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
			!this.changing 
				&& (this.rotatable || this.draggable || this.resizable)
				&& (this.changing = true);
				
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
		handleUp(e) {
			this.changing = false;
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
			if (this.rotatable) {
				this.rotatable = false;
				this.$emit('rotate-end');
			}
			if (this.resizable) {
				this.resizable = false;
				this.$emit('resize-end');
			}
			if (this.draggable) {
				this.draggable = false;
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
	.is-active {
		padding: 0;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		position: absolute;
		z-index: 2;
		border: 1px dotted #108ee9;
		// cursor: move;
		.vm-draggable__handle {
			display: block;
		}
	}
	.is-disabled {
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
	.is-delete {
		background: #108ee9;
		position: absolute;
		right: 0;
		width: 20px;
		color: white;
		text-align: center;
		z-index: 300
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
			background: #108ee9;
		}
		&:before {
			content: '☐';
			transform: translateY(26%);
			color: #108ee9;
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
	.is-deg-0 {
		transform: translate(-50%, -50%);
	}
	.is-deg-45 {
		transform: translate(-50%, -50%) rotate(45deg);
	}
	.is-deg-90 {
		transform: translate(-50%, -50%) rotate(90deg);
	}
	.is-deg-135 {
		transform: translate(-50%, -50%) rotate(135deg);
	}
	.is-deg-tip {
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
	div[class^=is-deg-] {
		position: absolute;
		top: 50%;
		left: 50%;
		z-index: 2;
		width: 500px;
		border-top: 1px dashed #fff;
		border-bottom: 1px dashed #262626;
		opacity: .4;
	}
}

.vm-draggable__delete {
	background: rgb(16, 142, 233); 
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
