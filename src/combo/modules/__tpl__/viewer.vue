<template>
	<div :style="[{ height: `${h}px`, width: `${w}px`, color: 'black' }]">
		id: {{ id }} <br>
		X: {{ x }} <br>
		Y: {{ y }} <br>
		Z: {{ z }} <br>
		Width: {{ w }} <br>
		Height: {{ h }} <br>
		Rotate: {{ r }} <br>
		Name: {{ name }} <br>
	</div>
</template>

<script>

export default {
	name: 'vm-tpl-viewer',
	components: {
	},
	props: {
		id: String,
		x: Number,
		y: Number,
		z: Number,
		w: Number,
		h: Number,
		r: Number,
		name: [Number, String],
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
