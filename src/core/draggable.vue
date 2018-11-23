<template>
	<div
		:class="{ draggable: draggable && !disable, resizable: resizable && !disable, active , dragging, resizing}"
		:style="style"
		class="vm-draggable"
		tabindex="0"
		@mousedown.stop="handleContainerDown"
	>
		<template v-for="item in transform">
			<div
				v-if="resizable && !disable"
				:key="item"
				:class="`handle-${item}`"
				class="handle"
				@mousedown.left.stop.prevent="handleDown($event, item)"
			/>
		</template>
		<slot/>
	</div>
</template>

<script>
const doc = document.documentElement;

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
		transform: {
			type: Array,
			default: () => (['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-right', 'bottom-left', 'rotate'])
		},
		// 宽度
		w: {
			type: Number,
			default: 200,
			validator: (val) => {
				return (typeof val === 'number' && val > 0);
			}
		},
		// 高度
		h: {
			type: Number,
			default: 200,
			validator: (val) => {
				return (typeof val === 'number' && val > 0);
			}
		},
		// 选择角度
		r: {
			type: Number,
			default: 0,
			validator: (val) => {
				return (typeof val === 'number');
			}
		},
		// 最小宽度
		minw: {
			type: Number,
			default: 50,
			validator(val) {
				return val > 0;
			}
		},
		// 最小高度
		minh: {
			type: Number,
			default: 50,
			validator(val) {
				return val > 0;
			}
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
		}
	},
	data() {
		return {
			resizing: false,
			dragging: false,
			active: false,
			handle: null,
			parentX: 0,
			parentY: 0,
			parentW: 9999,
			parentH: 9999,
			mouseX: 0,
			mouseY: 0,
			lastMouseX: 0,
			lastMouseY: 0,
			mouseOffX: 0,
			mouseOffY: 0,
			elmX: 0,
			elmY: 0,
			elmW: 0,
			elmH: 0
		};
	},
	computed: {
		style() {
			const w = this.w === 0 ? 'auto' : `${this.w}px`;
			const h = this.h === 0 ? 'auto' : `${this.h}px`;
			return {
				left: this.x + 'px',
				top: this.y + 'px',
				width: w,
				height: h,
				transform: `rotate(${this.r}deg)`,
				zIndex: this.z
			};
		}
	},
	watch: {},
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

		// 判断浏览器是否支持passive
		try {
			Object.defineProperty({}, "passive", {
				get() {
					this.passiveSupported = true;
					return;
				}
			});
		} catch (err) {
			console.log(err);
		}
		this.$emit('resizing');
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
					this.$emit(`update:${key}`, opts[key]);
				}
			}
		},
		/**
		 * 组件被按下事件
		 */
		handleContainerDown(e) {
			// 阻止默认事件
			e.preventDefault();
			const passiveSupported = this.passiveSupported;
			// 判断是否支持拖动
			if (this.disable || !this.draggable) return;
			const target = e.target || e.srcElement;
			// 确保事件发生在组件内部
			if (this.$el.contains(target)) {
				if (!this.active) {
					this.lastMouseX = e.pageX || e.clientX + doc.scrollLeft;
					this.lastMouseY = e.pageY || e.clientY + doc.scrollTop;
					doc.addEventListener('mousemove', this.handleMove, passiveSupported ? { passive: true } : true);
					doc.addEventListener('mousedown', this.handleDeselect, passiveSupported ? { passive: true } : true);
					doc.addEventListener('mouseup', this.handleUp, passiveSupported ? { passive: true } : true);
					this.active = true;
					this.$emit('activated');
				}
				this.elmX = parseInt(this.x, 10);
				this.elmY = parseInt(this.y, 10);
				this.elmW = this.$el.offsetWidth || this.$el.clientWidth;
				this.elmH = this.$el.offsetHeight || this.$el.clientHeight;
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
			if (!this.$el.contains(target) && !regex.test(target.className)) {
				if (this.active) {
					doc.removeEventListener('mousemove', this.handleMove, true);
					doc.removeEventListener('mousedown', this.deselect, true);
					doc.removeEventListener('mouseup', this.handleUp, true);
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
			this.resizing = true;

			this.preMouseX = e.pageX || e.clientX + doc.scrollLeft;
			this.preMouseY = e.pageY || e.clientY + doc.scrollTop;
		},
		/**
		 * 鼠标在页面上的坐标
		 */
		handleMove(e) {
			this.mouseX = e.pageX || e.clientX + doc.scrollLeft;
			this.mouseY = e.pageY || e.clientY + doc.scrollTop;

			// diffX =  当前鼠标位置 - 上次鼠标位置 + ？？
			let diffX = (this.mouseX - this.lastMouseX + this.mouseOffX) / this.zoom;
			let diffY = (this.mouseY - this.lastMouseY + this.mouseOffY) / this.zoom;
			this.mouseOffX = 0;
			this.mouseOffY = 0;
			this.lastMouseX = this.mouseX;
			this.lastMouseY = this.mouseY;
			if (this.resizing) {
				if (this.handle.indexOf('top') >= 0) {

					if (this.elmH - diffY < this.minh) { // 向下移动
						// 变换后的高度小于最小高度，diffY -> 0 , this.mouseOffY为this.y -> 当前鼠标位置的距离（正数）
						this.mouseOffY = (diffY - (diffY = this.elmH - this.minh));
					} else if (this.parent && this.elmY + diffY < 0) { // 向上移动 
						// 变换后this.y 超出父层顶部边界时， diffY -> 0, this.mouseOffY为this.y -> 当前鼠标位置的距离(负数)
						this.mouseOffY = (diffY - (diffY = -this.elmY));
					}
					this.elmY += diffY;
					this.elmH -= diffY;
				}
				if (this.handle.indexOf('bottom') >= 0) {
					if (this.elmH + diffY < this.minh) { // 向上移动
						this.mouseOffY = (diffY - (diffY = this.minh - this.elmH));
					} else if (this.elmY + this.elmH + diffY > this.parentH) { // 向下移动
						this.mouseOffY = (diffY - (diffY = this.parentH - this.elmY - this.elmH));
					}
					this.elmH += diffY;
				}
				if (this.handle.indexOf('left') >= 0) {
					if (this.elmW - diffX < this.minw) { // 向右移动
						this.mouseOffX = (diffX - (diffX = this.elmW - this.minw));
					} else if (this.parent && this.elmX + diffX < 0) { // 向左移动
						this.mouseOffX = (diffX - (diffX = -this.elmX));
					}
					this.elmX += diffX;
					this.elmW -= diffX;
				}
				if (this.handle.indexOf('right') >= 0) {
					if (this.elmW + diffX < this.minw) { // 向左移动
						this.mouseOffX = (diffX - (diffX = this.minw - this.elmW));
					} else if (this.elmX + this.elmW + diffX > this.parentW) { // 向右移动
						this.mouseOffX = (diffX - (diffX = this.parentW - this.elmX - this.elmW));
					}
					this.elmW += diffX;
				}
				if (this.handle === 'rotate') {
					
					// this.sync({ r: this.r + 10 });
				}
				this.sync({
					x: (Math.round(this.elmX / this.grid[0]) * this.grid[0]),
					y: (Math.round(this.elmY / this.grid[1]) * this.grid[1]),
					w: (Math.round(this.elmW / this.grid[0]) * this.grid[0]),
					h: (Math.round(this.elmH / this.grid[1]) * this.grid[1]),
				});
				this.$emit('resizing');
			} else if (this.dragging) {
				if (this.parent) {
					if (this.elmX + diffX < 0) {
						this.mouseOffX = (diffX * this.zoom - (diffX = -this.elmX));
					} else if (this.elmX + this.elmW + diffX > this.parentW) {
						this.mouseOffX = (diffX * this.zoom - (diffX = this.parentW - this.elmX - this.elmW));
					}
					if (this.elmY + diffY < 0) {
						this.mouseOffY = (diffY * this.zoom - (diffY = -this.elmY));
					} else if (this.elmY + this.elmH + diffY > this.parentH) {
						this.mouseOffY = (diffY * this.zoom - (diffY = this.parentH - this.elmY - this.elmH));
					}
				}
				this.elmX += diffX;
				this.elmY += diffY;

				this.draggable && this.sync({
					x: (Math.round(this.elmX / this.grid[0]) * this.grid[0]),
					y: (Math.round(this.elmY / this.grid[1]) * this.grid[1]),
				});
					
				this.$emit('dragging');
			}
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
			if (this.resizing) {
				this.resizing = false;
				this.$emit('resizestop');
			}
			if (this.dragging) {
				this.dragging = false;
				this.$emit('dragstop');
			}
			this.elmX = this.x;
			this.elmY = this.y;
		}
	},
};
</script>

<style lang="scss" scoped>
.vm-draggable {
	padding: 0;
	position: absolute;
	user-select: none;
	border-color: #45DBF7;
	// overflow: hidden;
	&.draggable:hover {
		cursor: move;
	}
	&.active {
		padding: 0;
		border: 1px solid rgba(255, 255, 255, 0);
		background-color: rgba(150, 150, 150, 0.3);
		border-color: #45DBF7;
		.handle {
			display: block;
		}
	}
}

.handle {
	display: none;
	position: absolute;
	z-index: 999;
}
.handle-top-left {
	top: 0;
	left: 0;
	cursor: nwse-resize;
	width: 25px;
	height: 25px;
	padding: 5px;
	// border-bottom: 2px solid #45DBF7;
	// border-right: 2px solid #45DBF7;
}
.handle-bottom-left {
	bottom: 0;
	left: 0;
	cursor: nesw-resize;
	width: 25px;
	height: 25px;
	padding: 5px;
	// border-top: 2px solid #45DBF7;
	// border-right: 2px solid #45DBF7;
}
.handle-top-right {
	top: 0;
	right: 0;
	cursor: nesw-resize;
	width: 25px;
	height: 25px;
	padding: 5px;
	// border-bottom: 2px solid #45DBF7;
	// border-left: 2px solid #45DBF7;
}
.handle-bottom-right {
	bottom: 0;
	right: 0;
	cursor: nwse-resize;
	width: 25px;
	height: 25px;
	padding: 5px;
	// border-top: 2px solid #45DBF7;
	// border-left: 2px solid #45DBF7;
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
.handle-rotate {
	top: -25px;
	left: 50%;
	transform: translateX(-50%);
	/* eslint-disable max-len */
	cursor: url('data:image/vnd.microsoft.icon;base64,AAABAAEAFBQAAAEAIAC4BgAAFgAAACgAAAAUAAAAKAAAAAEAIAAAAAAAQAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGZmZgRmZmYmZmZmdGZmZqlmZmbJZmZmzWZmZrFmZmZ+ZmZmLGZmZgYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmZmYcaWlp/319ff+srKz/y8vL/97e3v/h4eH/0NDQ/7Kysv+BgYH/ampq/2ZmZioAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZmZmWHd3d/+1tbX/9vb2//////////////////////////////////r6+v++vr7/fHx8/2ZmZmwAAAAAAAAAAAAAAAAAAAAAAAAAAGZmZmKBgYH/2tra////////////7Ozs/9PT0/++vr7/u7u7/8fHx//i4uL////////////m5ub/jY2N/2ZmZnwAAAAAAAAAAAAAAABmZmY6eXl5/+Dg4P///////////8rKyv+IiIj/ZmZmtWZmZpNmZmaNZmZmo3V1df+vr6//8fHx///////v7+//iIiI/2ZmZmgAAAAAZmZmBGlpaf/IyMj///////39/f+2trb/a2tr/2ZmZjwAAAAAAAAAAAAAAAAAAAAAZmZmGGZmZn6Ojo7/7u7u///////k5OT/cnJy/wAAAABmZmY8i4uL///////9/f3/zMzM/2lpaf9mZmYcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGZmZnqgoKD/+fn5/9ra2v9tbW3/AAAAAGZmZpnCwsL///////Hx8f+CgoL/ZmZmQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZmZmBGhoaP/BwcH/dHR0/7Kysp8AAAAAZmZm1ebm5v//////1tbW/2ZmZrsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG1tbf+/v7+dAAAAAAAAAABmZmbl7+/v//39/f++vr7/ZmZmkwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZmZmCGZmZuPu7u7//f39/7u7u/9mZmaPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZmZm0+Xl5f//////0NDQ/2ZmZrEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmZmabwsLC///////r6+v/dXV1/2ZmZiYAAAAAAAAAAAAAAAAAAAAAAAAAAGZmZiJ7e3v/aGho/2hoaP9oaGj/aGho/2hoaP9oaGj/AAAAAGZmZjyKior//v7+//v7+/+8vLz/ZmZmkQAAAAAAAAAAAAAAAAAAAAAAAAAAZmZmJHx8fP///////////////////////////2ZmZv8AAAAAZmZmBGhoaP/Jycn///////j4+P+jo6P/ZmZmi2ZmZh4AAAAAAAAAAAAAAAAAAAAAAAAAAHR0dP/j4+P/////////////////ZmZm/wAAAAAAAAAAZmZmPHp6ev/i4uL///////j4+P+4uLj/dXV1/2ZmZptmZmZ6ZmZmeGZmZpdxcXH/qamp//z8/P////////////////9mZmb/AAAAAAAAAAAAAAAAZmZmZoKCgv/e3t7////////////h4eH/w8PD/7CwsP+vr6//wMDA/97e3v/+/v7///////7+/v///////////2ZmZv8AAAAAAAAAAAAAAAAAAAAAZmZmXnl5ef+2trb/9fX1/////////////v7+//39/f/////////////////a2tr/k5OT/3V1df/T09P/ZmZmtwAAAAAAAAAAAAAAAAAAAAAAAAAAZmZmHmlpaf98fHz/r6+v/9TU1P/k5OT/5ubm/9zc3P/BwcH/jo6O/25ubv8AAAAAAAAAAG1tbf9mZmZMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZmZmBGZmZiRmZmZ6ZmZmuWZmZtNmZmbVZmZmxWZmZpdmZmZCZmZmDAAAAAAAAAAAZmZmDAAAAAAAAAAA/w/wAPgB8ADwAPAA4ABwAMAAMACB/BAAg/4QAAf+EAAH/zAAB//wAAf/8AAH//AAB/AQAIPwEACB+BAAwGAQAOAAEADwABAA+AGwAP8H8AA=') 10 10,default;
	width: 25px;
	height: 25px;
	padding: 5px;
	border-top: 2px solid #45DBF7;
	border-left: 2px solid #45DBF7;
	border-right: 2px solid #45DBF7;
}
</style>
