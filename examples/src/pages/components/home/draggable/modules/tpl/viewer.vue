<template>
	<div :style="[{ height: `${h ? `${h}px` : 'auto' }`, width: `${w ? `${w}px` : 'auto' }`, color: 'black' }]">
		id: {{ id }} <br>
		X: {{ x }} <br>
		Y: {{ y }} <br>
		Z: {{ z }} <br>
		Width: {{ w ? w : 'auto' }} <br>
		Height: {{ h ? h : 'auto' }} <br>
		Rotate: {{ r }} <br>
		Name: {{ name }} <br>
		<input style="background: red;" type="text">
		<br>
		<input style="background: yellow; pointer-events: none;" type="text">
	</div>
</template>

<script>

export default {
	name: 'vm-tpl-viewer',
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
