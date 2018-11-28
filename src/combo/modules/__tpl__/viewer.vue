<template>
	<div :style="[{ height: `${h}px`, width: `${w}px` }]">
		X: {{ x }} <br>
		Y: {{ y }} <br>
		Z: {{ z }} <br>
		Width: {{ w }} <br>
		Height: {{ h }} <br>
		Rotate: {{ r }} <br>
	</div>
</template>

<script>

export default {
	name: 'vm-tpl-viewer',
	components: {
	},
	props: {
		x: Number,
		y: Number,
		z: Number,
		w: Number,
		h: Number,
		r: Number,
	},
	data() {
		return {
		};
	},
	computed: {
	},
	created() {
	},
	methods: {
		
	},
};
</script>

<style lang="scss" scoped>
</style>
