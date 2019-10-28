<template>
	<div class="vm-frame-sortable--inner">
		<slot name="content" />
	</div>
</template>

<script>
export default {
	name: 'vm-frame-inner',
	props: {
		hasPage: Boolean
	}
};
</script>

<style lang="scss">
@import "../../../style/index.scss";

$block: vm-frame-sortable--inner;
@include block($block) {
	flex: 1;
	overflow: auto;
	display: flex; 
	position: relative;
	align-items: center;
	justify-content: center;
}
</style>