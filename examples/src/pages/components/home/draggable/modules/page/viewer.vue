<template>
	<div 
		:style="[{ height: `${h ? `${h}px` : 'auto' }`, width: `${w ? `${w}px` : 'auto' }` }]"
		class="vm-basic-page-viewer"
		@mousedown="handleSelectionMouseDown"
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
	methods: {
		operateDOMEvents(type) {
			let fn = type === 'add'
				? document.documentElement.addEventListener
				: document.documentElement.removeEventListener;

			fn('mouseup', this.handleMouseUp);
			fn('mousemove', this.handleMouseMove);
		},

		/**
		 * 拖动点按下事件
		 */
		handleMouseDown(e, handle) {
			this.startH = this.h;
			this.startW = this.w;

			this.startX = e.clientX;
			this.startY = e.clientY;

			this.handle = handle;
			this.operateDOMEvents('add');

			this.hasRecord = false;
		},

		handleMouseMove(e) {
			if (!this.hasRecord) {
				// 用于撤回操作
				this.$emit('change', {
					w: this.w, 
					h: this.h, 
					history: true
				});
				this.hasRecord = true;
			}
			let x = (e.clientX - this.startX) / this.scale;
			let y = (e.clientY - this.startY) / this.scale;
			let el = document.querySelector('.vm-frame-draggable__wrapper');

			// TODO: 滚动
			if (this.handle.includes('bottom')) {
				this.$emit('change', { h: this.startH + y, history: false });
				el.scrollTop = el.scrollHeight - el.clientHeight;
			}

			if (this.handle.includes('right')) {
				this.$emit('change', { w: this.startW + x, history: false });
				el.scrollLeft = el.scrollWidth - el.clientWidth;
			}
		},

		handleMouseUp() {
			// 用于撤回操作
			this.operateDOMEvents('remove');
		},

		/**
		 * page区域
		 */
		handleSelectionMouseDown(e) {
			e.stopPropagation(); // 阻止page被设置为activited

			const el = document.querySelector('.vm-selection');
			el && el.dispatchEvent(new MouseEvent('mousedown', e));
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
