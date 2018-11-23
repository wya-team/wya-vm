<template>
	<div :style="style" style="position: relative;">
		<slot />
	</div>
</template>

<script>

export default {
	name: 'vm-frame',
	components: {
	},
	props: {
		width: Number,
		height: Number
	},
	data() {
		return {
		};
	},
	computed: {
		style() {
			const w = this.width === 0 ? 'auto' : `${this.width}px`;
			const h = this.height === 0 ? 'auto' : `${this.height}px`;

			return {
				width: w,
				height: h
			};
		}
	},
	created() {
	},
	methods: {
	},
};
</script>

<style lang="scss" scoped>
</style>
