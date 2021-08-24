<template>
	<div 
		:style="[{ height: `${h ? `${h}px` : 'auto' }`, width: `${w ? `${w}px` : 'auto' }` }]"
		class="vm-basic-page-viewer"
	>
		<div 
			class="vm-basic-page-viewer__bottom" 
			@mousedown.left.stop="handleMouseDown(arguments[0], 'bottom')" 
		/>
		<div 
			class="vm-basic-page-viewer__right" 
			@mousedown.left.stop="handleMouseDown(arguments[0], 'right')" 
		/>

		<div 
			class="vm-basic-page-viewer__bottom-right" 
			@mousedown.left.stop="handleMouseDown(arguments[0], 'bottom-right')" 
		/>		
	</div>
</template>

<script>

export default {
	name: 'vm-page-viewer',
	components: {
	},
	props: {
		vm: {
			type: Object,
			default: () => ({})
		},
		id: String,
		x: Number,
		y: Number,
		z: Number,
		w: Number,
		h: Number,
		r: Number,
		scale: Number,
		name: [Number, String],
	},
	created() {
		// setTimeout(() => {
		// 	this.$emit('change', { h: this.h + 1000, recordChanged: false });
		// }, 1000);
	},
	methods: {

		/**
		 * 拖动点按下事件
		 */
		handleMouseDown(e, handle) {
			this.startH = this.h;
			this.startW = this.w;

			this.startX = e.clientX;
			this.startY = e.clientY;

			document.addEventListener("mousemove", this.handleMouseMove);
			document.addEventListener("mouseup", this.handleMouseUp);

			this.handle = handle;
		},

		handleMouseMove(e) {
			let x = (e.clientX - this.startX) / this.scale;
			let y = (e.clientY - this.startY) / this.scale;
			let el = document.querySelector('.vm-frame-draggable__wrapper');

			// TODO: 滚动
			if (this.handle.includes('bottom')) {
				this.$emit('change', { h: this.startH + y, recordChanged: false });
				el.scrollTop = el.scrollHeight - el.clientHeight;
			}

			if (this.handle.includes('right')) {
				this.$emit('change', { w: this.startW + x, recordChanged: false });
				el.scrollLeft = el.scrollWidth - el.clientWidth;
			}
		},

		handleMouseUp() {
			document.removeEventListener("mousemove", this.handleMouseMove);
			document.removeEventListener("mouseup", this.handleMouseUp);
		}
	}
};
</script>

<style lang="scss">
$size: 4px;
.vm-basic-page-viewer {
	position: relative;
	// background: white;
	&__bottom {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		border-bottom: $size solid transparent;
		cursor: ns-resize;
	}

	&__right {
		position: absolute;
		top: 0; 
		bottom: 0; 
		right: 0; 
		border-right: $size solid transparent;
		cursor: ew-resize;
	}

	&__bottom-right {
		position: absolute;
		bottom: 0; 
		right: 0; 
		height: $size * 4;
		width: $size * 4;
		cursor: nwse-resize;
	}
}
</style>
