<template>
	<div :style="[{ height: `${h ? `${h}px` : 'auto' }`, width: `${w ? `${w}px` : 'auto' }`, color: 'black' }]">
		<div style="padding: 1px 0 0 1px;">
			<span style="padding: 1px 4px; background: #5495F6; color: #fff;">
				热区{{ index + 1 }}
			</span>
		</div>
	</div>
</template>

<script>

export default {
	name: 'vm-basic-area-paint-viewer',
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
		index: Number
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

<style lang="scss">
</style>
