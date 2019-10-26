<template>
	<div class="vm-thumbnail">
		<div style="position: relative;">
			<canvas
				ref="canvas"
				:width="width"
				:height="height"
			/>
			<div
				:style="visibleStyle"
				class="vm-thumbnail__visible"
				@mousedown="handleMouseDown"
			/>
		</div>
	</div>
</template>

<script>
import { toggleSelection } from '../../../vc';

export default {
	name: 'vm-thumbnail',
	components: {

	},
	props: {
		dataSource: {
			type: Array,
			default() {
				return [];
			}
		},

		scale: {
			type: Number,
			default: 1
		},

		frameW: {
			type: Number,
			default: 0
		},

		frameH: {
			type: Number,
			default: 0
		},

		clientW: {
			type: Number,
			default: 0
		},

		clientH: {
			type: Number,
			default: 0
		},

		scrollTop: {
			type: Number,
			default: 0
		},

		scrollLeft: {
			type: Number,
			default: 0
		},

		borderSize: {
			type: Number,
			default: 0
		},
	},
	data() {
		return {
			width: 192,
			height: 108
		};
	},
	computed: {
		shrink() {
			const { width, height, frameW, frameH, borderSize, scale } = this;
			return Math.min(
				(frameW + borderSize * 2) / width,
				(frameH + borderSize * 2) / height
			);
		},
		visibleStyle() {
			const { width, height, clientW, clientH, scale, shrink, scrollLeft, scrollTop } = this;

			let visibleW = Math.min(clientW / shrink / scale, width);
			let visibleH = Math.min(clientH / shrink / scale, height);
			let left = scrollLeft / shrink / scale;
			let top = scrollTop / shrink / scale;

			return {
				width: `${visibleW}px`,
				height: `${visibleH}px`,
				left: `${left + visibleW > width ? width - visibleW : left}px`,
				top: `${top + visibleH > height ? height - visibleH : top}px`
			};
		},
		maxScrollLeft() {
			const { frameW, clientW, borderSize, scale } = this;
			return frameW * scale - clientW + borderSize * 2;
		},
		maxScrollTop() {
			const { frameH, clientH, borderSize, scale } = this;
			return frameH * scale - clientH + borderSize * 2;
		}
	},

	watch: {
		dataSource: {
			deep: true,
			handler() {
				this.repaint();
			}
		},
		frameW() {
			this.repaint();
		},
		frameH() {
			this.repaint();
		},
	},
	
	mounted() {
		this.repaint();

		window.addEventListener('mouseup', this.handleMouseUp);
		window.addEventListener('mousemove', this.handleMouseMove);
	},

	destroyed() {
		window.removeEventListener('mouseup', this.handleMouseUp);
		window.removeEventListener('mousemove', this.handleMouseMove);
	},

	methods: {
		repaint() {
			if (!this._isMounted) return;

			let canvas = this.$refs.canvas;
			let { dataSource, shrink } = this;
			let ctx = canvas.getContext('2d');

			canvas.height = canvas.height; // 重设高度，清空画布

			ctx.beginPath();
			ctx.translate(40 / shrink, 40 / shrink);
			ctx.save();
			dataSource.forEach(item => {
				if (item.module === 'page') return;

				let { x, y, w, h, r } = item;
				ctx.translate(
					(x + w / 2) / shrink,
					(y + h / 2) / shrink
				);
				ctx.fillStyle = 'rgba(219, 219, 219, 0.4)';
				ctx.rotate(r * Math.PI / 180);
				ctx.fillRect(
					-w / 2 / shrink,
					-h / 2 / shrink,
					w / shrink,
					h / shrink
				);
				ctx.restore();
				ctx.save();
			});
		},
		handleMouseDown(e) {
			toggleSelection();
			this.lastMouseX = e.clientX;
			this.lastMouseY = e.clientY;

			this.isMoving = true;
		},

		handleMouseMove(e) {
			toggleSelection();
			if (!this.isMoving) return;

			const { scrollLeft, scrollTop, shrink, scale, maxScrollLeft, maxScrollTop } = this;

			let mouseX = e.clientX;
			let mouseY = e.clientY;
			let diffX = mouseX - this.lastMouseX;
			let diffY = mouseY - this.lastMouseY;

			this.lastMouseX = mouseX;
			this.lastMouseY = mouseY;

			let x = scrollLeft + diffX * shrink * scale;
			let y = scrollTop + diffY * shrink * scale;
			x = x >= 0 && x <= maxScrollLeft ? x : scrollLeft;
			y = y >= 0 && y <= maxScrollTop ? y : scrollTop;

			this.$emit('scroll', x, y);
		},

		handleMouseUp() {
			this.isMoving = false;
		}

	},
};
</script>

<style lang="scss">
@import "../../../style/index.scss";

$block: vm-thumbnail;
@include block($block) {
	position: absolute;
	bottom: 50px;
	right: 10px;
	background: #343434;
	border: 1px solid #16F2F6;
	z-index: 2;
	@include element(visible) {
		position: absolute;
		z-index: 2;
		border: 1px solid #DBDBDB;
		background: rgba(68, 68, 68, 0.5);
		cursor: move;
	}
}
</style>
