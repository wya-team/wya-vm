<template>
	<div :class="{ 'is-hide-border': !showRuler }" class="vm-frame-draggable--inner">
		<vm-ruler
			v-if="showRuler"
			ref="ruler"
			:scroll-left="scrollLeft"
			:scroll-top="scrollTop"
			:frame-w="frameW"
			:frame-h="frameH"
			:client-w="clientW"
			:client-h="clientH"
			:scale="scale"
			:guides="guides"
			:theme="theme"
			:border-size="borderSize"
			:scroller-size="scrollerSize"
			:style="{ height: `calc(100% - ${zoomBarH}px)` }"
			@guides-change="$emit('update:guides', arguments[0])"
		>
			<slot name="content" />
		</vm-ruler>
		<slot v-else name="content" />
		<slot name="content-extra" />
		<slot name="footer" />
	</div>
</template>

<script>
import Ruler from './ruler.vue';
import { Resize } from '../../../vc';
import { throttle } from '../../../utils/helper';

export default {
	name: 'vm-frame-inner',
	components: {
		'vm-ruler': Ruler
	},
	props: {
		showRuler: Boolean,
		showZoomBar: Boolean,
		zoomBarH: Number,
		scrollerSize: Number,
		...Ruler.props,
	},
	mounted() {
		Resize.on(this.$el, this.handleResize);
	},
	destroyed() {
		Resize.off(this.$el, this.handleResize);
	},
	methods: {
		handleResize: throttle(function (e) {
			if (!this.$el) return;

			let offset = +(this.$refs.ruler && (this.$refs.ruler.guideSize));

			/**
			 * TDOO: 判断是否有滚动条
			 * offsetWidth包含滚动条
			 * clientWidth不包含滚动条;
			 * offsetWidth === clientWidth 时不含滚动条，不需要减去scrollerSize（合理些，未测试）
			 */
			let w = this.$el.offsetWidth - offset - this.scrollerSize;
			let h = this.$el.offsetHeight - offset - this.zoomBarH - this.scrollerSize;

			if (!w || !h) return;

			// 获得除rule内，zoom-bar上的控制操作空间
			this.$emit(
				'client-resize', 
				w, 
				h,
			);
		}, 50),
	}
};
</script>

<style lang="scss">
@import "../../../style/index.scss";

$block: vm-frame-draggable--inner;
@include block($block) {
	flex: 1;
	overflow: hidden;
	background: $theme-light-frame-bg;
	
	display: flex; 
	flex-direction: column;
	position: relative;
	
	border-left: 1px solid #BDBDBD;
	@include when(hide-border) {
		border-left: none; 
		border-right: none; 
	}
}
</style>