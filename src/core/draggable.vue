<template>
	<div :style="coord" class="vm-draggable" @mousedown.stop="handleContainerDown">
		<div :style="style">
			<slot :style="style"/>
		</div>
		<!-- handle -->
		<div v-if="active" :class="{ disable, active, dragging, resizing, rotating}" :style="style">
			<template v-for="item in handles">
				<div
					v-if="!disable"
					:key="item"
					:class="`handle-${item}`"
					class="handle"
					@mousedown.left.stop.prevent="handleDown($event, item)"
				/>
			</template>
			<div v-if="rotating" :class="{ 'rotate-base-line': rotating }" :style="{ width }" />
		</div>
		<!-- grid for rotate -->
		<div v-if="rotating" :class="{ 'rotate-deg-0': rotating }" :style="{ width }" />
		<div v-if="rotating" :class="{ 'rotate-deg-45': rotating }" :style="{ width }" />
		<div v-if="rotating" :class="{ 'rotate-deg-90': rotating }" :style="{ width }" />
		<div v-if="rotating" :class="{ 'rotate-deg-135': rotating }" :style="{ width }" />
		<div v-if="rotating" :class="{ 'rotate-tip': rotating }">{{ r }} °</div>
	</div>
</template>

<script>
import { isPassiveSupported } from '../utils/helper';

const doc = document.documentElement;
const angleArr = [0, 45, 90, 135, 180, 225, 270, 315, 360];

export default {
	replace: true,
	name: 'vm-draggable',
	props: {
		// 是否可被拖动
		draggable: { 
			type: Boolean,
			default: true
		},
		// 是否可改变大小
		resizable: {
			type: Boolean,
			default: true
		},
		rotatable: {
			type: Boolean,
			default: true
		},
		handles: {
			type: Array,
			default: () => (['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-right', 'bottom-left', 'rotate'])
		},
		// 宽度
		w: {
			type: Number,
			default: 200,
			validator: val => val > 0
		},
		// 高度
		h: {
			type: Number,
			default: 200,
			validator: val => val > 0
		},
		// 选择角度
		r: {
			type: Number,
			default: 0
		},
		// 最小宽度
		minw: {
			type: Number,
			default: 50,
			validator: val => val > 0
		},
		// 最小高度
		minh: {
			type: Number,
			default: 50,
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
		disable: {
			type: Boolean, 
			default: false
		},
		editEle: {
			type: Array, 
			default: () => (["#vm-editor", "#vm-tools-operation"])
		}
	},
	data() {
		return {
			resizing: false,
			dragging: false,
			rotating: false,
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
		// 初始化控件宽高
		if (this.minw > this.w) {
			this.sync({ w: this.minw });
		}
		if (this.minh > this.h) {
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
			// 阻止默认事件
			e.preventDefault && e.preventDefault();
			// 判断是否支持拖动
			if (this.disable || !this.draggable) return;
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
				this.dragging = true;
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
			const target = e.target || e.srcElement;
			const regex = new RegExp('handle-([(top|right|-|bottom|left)]{2})', '');
			const eles = this.editEle.filter(item => document.querySelector(item));
			if (
				!this.$el.contains(target) 
				&& !regex.test(target.className)
				&& (eles.length === 0 || !eles.some(item => document.querySelector(item).contains(target)))
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
			// 将handle设置为当前元素
			this.handle = handle;
			if (handle === 'rotate') {
				this.rotating = true;
			} else {
				this.resizing = true;
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
			if (this.resizing) {
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
				this.sync({
					x: (Math.round(elmX / this.grid[0]) * this.grid[0]),
					y: (Math.round(elmY / this.grid[1]) * this.grid[1]),
					w: (Math.round(elmW / this.grid[0]) * this.grid[0]),
					h: (Math.round(elmH / this.grid[1]) * this.grid[1]),
				});
				this.$emit('resizing');
			} else if (this.rotating) {
				let angle = this.getAngle(
					[this.parentX + this.x + this.w / 2, -(this.parentY + this.y + this.h / 2)],
					[this.lastMouseX, -this.lastMouseY],
				);

				let criticalAngle = angleArr.find(item => Math.abs(item - angle) < 3);
				angle = typeof criticalAngle === 'number' ? criticalAngle : angle;

				this.sync({ 
					r: angle === 360 ? 0 : angle
				});
				this.$emit('rotating');
			} else if (this.dragging) {
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

				this.draggable && this.sync({
					x: (Math.round(elmX / this.grid[0]) * this.grid[0]),
					y: (Math.round(elmY / this.grid[1]) * this.grid[1]),
				});
				this.$emit('dragging');
			}
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
			if (this.rotating) {
				this.rotating = false;
				this.$emit('rotate-end');
			}
			if (this.resizing) {
				this.resizing = false;
				this.$emit('resize-end');
			}
			if (this.dragging) {
				this.dragging = false;
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

<style lang="scss" scoped>
.vm-draggable {
	padding: 0;
	position: absolute;
	box-sizing: border-box;
	user-select: none;
	.draggable:hover {
		cursor: move;
	}
	.active {
		padding: 0;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		position: absolute;
		z-index: 2;
		border: 1px dotted #108ee9;
		position: absolute;
		.handle {
			display: block;
		}
	}
	.disable {
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
	.delete {
		background: #108ee9;
		position: absolute;
		right: 0;
		width: 20px;
		color: white;
		text-align: center;
		z-index: 300
	}
}

.handle {
	display: none;
	position: absolute;
	box-sizing: border-box;
	z-index: 999;
}
.handle-left {
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
.handle-right {
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

.handle-top {
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
.handle-bottom {
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
.handle-top-left {
	top: 0;
	left: 0;
	cursor: nwse-resize;
	padding: 5px;
}
.handle-bottom-left {
	bottom: 0;
	left: 0;
	cursor: nesw-resize;
	padding: 5px;
}
.handle-top-right {
	top: 0;
	right: 0;
	cursor: nesw-resize;
	padding: 5px;
}
.handle-bottom-right {
	bottom: 0;
	right: 0;
	cursor: nwse-resize;
	padding: 5px;
}
.handle-rotate {
	top: 0;
	left: 50%;
	transform: translate(-50%, -100%);
	cursor: url(
		'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" style="font-size: 20px;"><text y="15">↻</text></svg>'
	) 10 10,default;
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
/**
 * rotate
 */
.rotate-base-line {
	position: absolute;
	left: 50%;
	top: 50%;
	z-index: 2;
	width: 500px;
	border: 1px solid #1fb6ff;
	background-color: #1fb6ff;
	transform: translate(-50%, -50%) rotate(90deg);
}
div[class^=rotate-deg-] {
	position: absolute;
	top: 50%;
	left: 50%;
	z-index: 2;
	width: 500px;
	border-top: 1px dashed #fff;
	border-bottom: 1px dashed #262626;
	opacity: .4;
}
.rotate-deg-0 {
	transform: translate(-50%, -50%);
}
.rotate-deg-45 {
	transform: translate(-50%, -50%) rotate(45deg);
}
.rotate-deg-90 {
	transform: translate(-50%, -50%) rotate(90deg);
}
.rotate-deg-135 {
	transform: translate(-50%, -50%) rotate(135deg);
}
.rotate-tip {
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
</style>
