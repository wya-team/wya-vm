<template>
	<div style="display: flex; flex-direction: column;">
		<div>name: <input :value="name" @input="handleChange($event, 'name')"></div>
	</div>
</template>

<script>

export default {
	name: 'vm-tpl-editor',
	components: {
	},
	props: {
		w: Number,
		h: Number,
		r: Number,
		x: Number,
		y: Number,
		z: Number,
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
		handleChange(e, key) {
			this.$emit('change', { [key]: e.target.value });
		},
		handleClick() {
			// this.$emit('update:x', this.x + 1);
			this.$emit('change', { x: this.x + 1 });
		}
	},
};
</script>

<style lang="scss">
input {
	border: 1px solid #000;
	margin: 10px;
}
</style>
