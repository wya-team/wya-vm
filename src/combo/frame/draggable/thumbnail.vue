<template>
	<div class="vm-thumbnail vm-hack-editor">
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
import { Clipboard } from '../../../vc';
import { debounce } from '../../../utils/helper';
import { SELECTION_MODULE, PAGE_MOULE } from '../../../utils/constants';

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
		theme: String,
		borderSize: {
			type: Object,
			default() {
				return {
					top: 0,
					left: 0,
					bottom: 0,
					right: 0
				};
			}
		},
		scrollerSize: {
			type: Number,
			default: 0
		}
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
			return Math.max(
				(frameW + borderSize.left + borderSize.right) / width,
				(frameH + borderSize.top + borderSize.bottom) / height
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
			const { frameW, clientW, borderSize, scale, scrollerSize } = this;
			return frameW * scale - clientW + borderSize.left + borderSize.right + scrollerSize;
		},
		maxScrollTop() {
			const { frameH, clientH, borderSize, scale, scrollerSize } = this;
			return frameH * scale - clientH + borderSize.top + borderSize.bottom + scrollerSize;
		}
	},

	created() {
		let watchArr = [
			'dataSource',
			'frameW', 
			'frameH', 
			'scale', 
			'clientW', 
			'clientH',
			'theme'
		];
		let hook = debounce(this.repaint, 50);
		
		watchArr.forEach(item => this.$watch(item, hook, { deep: true }));
	},

	mounted() {
		this.repaint();
	},

	destroyed() {
		this.operateDOMEvents('remove');
	},

	methods: {
		repaint() {
			let canvas = this.$refs.canvas;

			if (!this._isMounted || !canvas) return;

			let { dataSource, shrink } = this;
			let ctx = canvas.getContext('2d');

			// 重设高度，清空画布
			canvas.height = canvas.height; // eslint-disable-line

			ctx.beginPath();
			ctx.translate(40 / shrink, 40 / shrink);
			ctx.save();
			dataSource.forEach(item => {
				if (item.module === PAGE_MOULE || item.module === SELECTION_MODULE) return;

				let { x, y, w, h, r } = item;
				ctx.translate(
					(x + w / 2) / shrink,
					(y + h / 2) / shrink
				);
				ctx.fillStyle = '#DBDBDB';
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

		operateDOMEvents(type) {
			let fn = type === 'add' 
				? document.documentElement.addEventListener 
				: document.documentElement.removeEventListener;

			fn('mouseup', this.handleMouseUp);
			fn('mousemove', this.handleMouseMove);
		},
		handleMouseDown(e) {
			Clipboard.clearSelection();
			
			this.lastMouseX = e.clientX;
			this.lastMouseY = e.clientY;

			this.operateDOMEvents('add');
		},

		handleMouseMove(e) {
			const { scrollLeft, scrollTop, shrink, scale, maxScrollLeft, maxScrollTop } = this;

			let mouseX = e.clientX;
			let mouseY = e.clientY;
			let diffX = mouseX - this.lastMouseX;
			let diffY = mouseY - this.lastMouseY;

			this.lastMouseX = mouseX;
			this.lastMouseY = mouseY;

			let x = scrollLeft + diffX * shrink * scale;
			let y = scrollTop + diffY * shrink * scale;

			x > maxScrollLeft && (x = maxScrollLeft);
			y > maxScrollTop && (y = maxScrollTop);

			// maxScrollLeft / maxScrollTop 自适应下宽度不够, 计算为零
			x < 0 && (x = 0);
			y < 0 && (y = 0);

			this.$emit('scroll', x, y);
		},

		handleMouseUp() {
			Clipboard.clearSelection();
			this.operateDOMEvents('remove');
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
	background: $theme-light-bg;
	border: 1px solid $primary;
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
