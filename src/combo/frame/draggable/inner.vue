<template>
	<div class="vm-frame-draggable--inner">
		<vm-ruler
			v-if="showRuler"
			:scroll-left="scrollLeft"
			:scroll-top="scrollTop"
			:frame-w="frameW"
			:frame-h="frameH"
			:client-w="clientW"
			:client-h="clientH"
			:scale="scale"
			:guides="guides"
			:border-size="borderSize"
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

export default {
	name: 'vm-frame-inner',
	components: {
		'vm-ruler': Ruler
	},
	props: {
		showRuler: Boolean,
		...Ruler.props,
	},
};
</script>

<style lang="scss">
@import "../../../style/index.scss";

$block: vm-frame-draggable--inner;
@include block($block) {
	flex: 1;
	overflow: hidden;
	background: rgba(255, 0, 0, 0.05); // TODO: dark模式;
	
	display: flex; 
	flex-direction: column;

	position: relative;
}
</style>