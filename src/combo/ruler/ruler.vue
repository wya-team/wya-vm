<template>
	<div class="vm-ruler">
		<div class="vm-horizontal-ruler">
			1
		</div>
		<div class="vm-vertical-ruler">
			1
		</div>
		<slot name="default"/>
	</div>
</template>
<script>
export default {
	name: 'vm-ruler'
};
</script>
