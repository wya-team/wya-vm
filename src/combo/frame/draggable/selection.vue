<template>
	<svg 
		class="vm-selection" 
		xmlns="http://www.w3.org/2000/svg"
		:style="[wrapperStyle, zIndexStyle]" 
		@mousedown.capture="handleMouseDown"
	>
		<path 
			fill="none" 
			stroke="#5495F6"
			:d="d" 
			stroke-dasharray="5, 2"
			stroke-width="1"
			shape-rendering="crispEdges"
		/>
	</svg>
</template>
<script>
import { Clipboard } from '../../../vc';

/**
 * https://www.w3school.com.cn/svg/svg_path.asp
 * 它开始于位置 M 坐标，到达位置 L，然后从那里开始到 L，最后在 L 关闭路径。
 */
export default {
	name: "vm-selection",
	props: {
		clientW: {
			type: Number,
			default: 0
		},
		clientH: {
			type: Number,
			default: 0
		},
		borderSize: {
			type: Object,
			default: () => ({
				top: 0,
				left: 0
			})
		}
	},
	data() {
		return {
			startX: 0,
			startY: 0,
			moveX: 0,
			moveY: 0,
			dragging: false
		};
	},
	computed: {
		/**
		 * 刻度的宽度
		 */
		wrapperStyle() {
			const { clientW, clientH, borderSize } = this;
			return {
				width: `${clientW}px`,
				height: `${clientH}px`,
				top: `${borderSize.top}px`,
				left: `${borderSize.left}px`,
			};
		},
		zIndexStyle() {
			return {
				zIndex: this.dragging ? 2 : 1
			};
		},
		/**
		 * https://www.w3school.com.cn/svg/svg_path.asp
		 * 它开始于位置 M 坐标，到达位置 L，然后从那里开始到 L，最后在 L 关闭路径。
		 */
		d() {
			const { startX, startY, moveX, moveY } = this;
			return `M ${startX},${startY} L ${startX},${moveY} L ${moveX},${moveY} L ${moveX},${startY} z`;
		}
	},
	mounted() { 
		this.offsetX = this.$el.getBoundingClientRect().x;
		this.offsetY = this.$el.getBoundingClientRect().y;
	},
	methods: {
		operateDOMEvents(type) {
			let fn = type === 'add'
				? document.documentElement.addEventListener
				: document.documentElement.removeEventListener;

			fn('mouseup', this.handleMouseUp);
			fn('mousemove', this.handleMouseMove);
		},

		/**
		 * 外部可以模拟实现选区: 如page模块的viewer的空白区域
		 * document
		 * 	.querySelector('.vm-selection')
		 * 	.dispatchEvent(new MouseEvent('mousedown', e));
		 */
		handleMouseDown(e) {
			Clipboard.clearSelection();
			this.dragging = true;
			this.startX = e.clientX - this.offsetX;
			this.startY = e.clientY - this.offsetY;

			this.moveX = this.startX;
			this.moveY = this.startY;

			this.operateDOMEvents('add');
		},

		handleMouseMove(e) {
			this.moveX = e.clientX - this.offsetX;
			this.moveY = e.clientY - this.offsetY;
		},

		handleMouseUp() {
			Clipboard.clearSelection();
			this.dragging = false;
			this.operateDOMEvents('remove');

			let x = this.startX > this.moveX ? this.moveX : this.startX;
			let y = this.startY > this.moveY ? this.moveY : this.startY;
			let w = Math.abs(this.startX - this.moveX);
			let h = Math.abs(this.startY - this.moveY);
			// 初始位置，宽高
			this.$emit('selection', {
				x,
				y,
				w,
				h
			});
			this.startX = 0;
			this.startY = 0;
			this.moveX = 0;
			this.moveY = 0;
		}
	}
};
</script>
<style lang="scss">
@import "../../../style/index.scss";

.vm-selection {
	position: absolute;
}
</style>