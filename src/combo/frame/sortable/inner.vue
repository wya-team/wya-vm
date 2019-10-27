<template>
	<div class="vm-frame-sortable--inner">
		<slot name="content" />
	</div>
</template>

<script>
export default {
	name: 'vm-frame-inner',
};
</script>

<style lang="scss">
@import "../../../style/index.scss";

$block: vm-frame-sortable--inner;
@include block($block) {
	flex: 1;
	overflow: hidden;
	display: flex; 
	flex-direction: column;
	position: relative;
}
</style>