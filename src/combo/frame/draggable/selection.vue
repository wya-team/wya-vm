<template>
	<div class="vm-selection" :style="style" @mousedown.capture="handleMouseDown">
		<path 
			fill="none" 
			stroke="rgba(0, 0, 0, 1)"
			d="M 571,292 L 571,372 L 631,372 L 631,292 z" 
			style="stroke-width: 1; stroke-dasharray: 3, 3;"
		/>
	</div>
</template>
<script>
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
	},
	computed: {
		/**
		 * 刻度的宽度
		 */
		style() {
			const { clientW, clientH } = this;
			return {
				width: `${clientW}px`,
				height: `${clientH}px`
			};
		}
	},
	mounted() { },
	methods: {
		handleMouseDown(e) {
			console.log(e);
		}
	}
};
</script>
<style lang="scss">
@import "../../../style/index.scss";

.vm-selection {
	// pointer-events: none;
 //    z-index: 2;
	
	position: absolute;
	width: 100%;
	height: 100%;
	left: 0;
	top: 0;
}
</style>